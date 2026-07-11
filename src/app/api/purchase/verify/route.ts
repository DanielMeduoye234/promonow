import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { nairaToKobo, paystackConfigured, verifyTransaction } from '@/lib/paystack';

export async function GET(request: Request) {
  if (!supabaseAdmin) return Response.json({ error: 'Supabase is not configured' }, { status: 503 });
  if (!paystackConfigured) return Response.json({ error: 'Payments are not configured' }, { status: 503 });

  const reference = new URL(request.url).searchParams.get('reference');
  if (!reference?.startsWith('buy_')) {
    return Response.json({ error: 'A valid payment reference is required' }, { status: 400 });
  }

  const { data: pending } = await supabaseAdmin
    .from('marketplace_payments')
    .select('amount')
    .eq('reference', reference)
    .maybeSingle();
  if (!pending) return Response.json({ error: 'Payment not found' }, { status: 404 });

  let payment;
  try {
    payment = await verifyTransaction(reference);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Verification failed' }, { status: 502 });
  }

  if (payment.status !== 'success') return Response.json({ status: payment.status });
  if (payment.currency !== 'NGN' || payment.amount !== nairaToKobo(Number(pending.amount))) {
    return Response.json({ error: 'Payment amount could not be verified' }, { status: 409 });
  }

  const { data, error } = await supabaseAdmin.rpc('complete_marketplace_payment', { p_reference: reference });
  if (error) return Response.json({ error: error.message }, { status: 409 });
  const result = Array.isArray(data) ? data[0] : data;
  return Response.json({ status: 'success', credentials: result?.credentials || '' });
}
