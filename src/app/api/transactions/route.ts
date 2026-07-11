import { supabaseAdmin, resolveSellerProfile } from '@/lib/supabaseAdmin';

export async function GET() {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json(data);
}

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const body = await request.json();
  const { listing_id, buyer_id, buyer } = body;

  const { data: listing, error: listingErr } = await supabaseAdmin
    .from('listings')
    .select('*')
    .eq('id', listing_id)
    .maybeSingle();

  if (listingErr) {
    return Response.json({ error: listingErr.message }, { status: 500 });
  }
  if (!listing) {
    return Response.json({ error: 'Listing not found' }, { status: 404 });
  }

  const buyerProfile = await resolveSellerProfile({ id: buyer_id, ...buyer });
  if (!buyerProfile) {
    return Response.json({ error: 'Could not resolve a buyer profile.' }, { status: 400 });
  }

  const escrowFee = Math.round(listing.price * 0.02 * 100) / 100;

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .insert([{
      listing_id,
      buyer_id: buyerProfile.id,
      seller_id: listing.seller_id,
      amount: listing.price,
      escrow_fee: escrowFee,
      status: 'held_in_escrow'
    }])
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  await supabaseAdmin
    .from('listings')
    .update({ status: 'sold' })
    .eq('id', listing_id);

  return Response.json(data, { status: 201 });
}
