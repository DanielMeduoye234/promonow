import { randomUUID } from 'crypto';
import { supabaseAdmin, UUID_REGEX } from '@/lib/supabaseAdmin';
import { initializeTransaction, nairaToKobo, paystackConfigured } from '@/lib/paystack';

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Supabase is not configured' }, { status: 503 });
  }
  if (!paystackConfigured) {
    return Response.json({ error: 'Payments are not configured' }, { status: 503 });
  }

  const body = await request.json();
  if (!body.user_id || !UUID_REGEX.test(body.user_id)) {
    return Response.json({ error: 'Please sign in before paying' }, { status: 400 });
  }
  if (!body.listing_id || !UUID_REGEX.test(body.listing_id)) {
    return Response.json({ error: 'A valid listing is required' }, { status: 400 });
  }
  if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
    return Response.json({ error: 'Enter a valid email for your Paystack receipt' }, { status: 400 });
  }

  const { data: listing, error: listingError } = await supabaseAdmin
    .from('listings')
    .select('id, handle, price, status, instant_delivery')
    .eq('id', body.listing_id)
    .maybeSingle();

  if (listingError) return Response.json({ error: listingError.message }, { status: 500 });
  if (!listing || listing.status !== 'active') {
    return Response.json({ error: 'This listing is no longer available' }, { status: 409 });
  }

  if (listing.instant_delivery) {
    const { count } = await supabaseAdmin
      .from('listing_stock')
      .select('*', { count: 'exact', head: true })
      .eq('listing_id', listing.id)
      .eq('status', 'available');
    if (!count) return Response.json({ error: 'This listing is out of stock' }, { status: 409 });
  }

  const reference = `buy_${randomUUID()}`;
  const { error: paymentError } = await supabaseAdmin.from('marketplace_payments').insert([{
    reference,
    listing_id: listing.id,
    buyer_id: body.user_id,
    amount: listing.price,
    email: body.email.trim().toLowerCase(),
    status: 'pending'
  }]);
  if (paymentError) return Response.json({ error: paymentError.message }, { status: 500 });

  try {
    const payment = await initializeTransaction({
      email: body.email.trim(),
      amountKobo: nairaToKobo(Number(listing.price)),
      reference,
      callbackUrl: typeof body.callback_url === 'string' ? body.callback_url : undefined,
      metadata: { purpose: 'marketplace_purchase', listing_id: listing.id, buyer_id: body.user_id }
    });
    return Response.json({ authorization_url: payment.authorization_url, reference });
  } catch (error) {
    await supabaseAdmin.from('marketplace_payments').update({ status: 'failed' }).eq('reference', reference);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Could not start Paystack checkout' },
      { status: 502 }
    );
  }
}
