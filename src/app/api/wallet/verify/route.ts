import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { paystackConfigured, verifyTransaction } from '@/lib/paystack';

// Confirms a top-up after the user returns from Paystack checkout. Verifies the
// payment with Paystack, then credits the wallet through an idempotent DB
// function (calling this twice, or racing the webhook, credits only once).
export async function GET(request: Request) {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Supabase is not configured' }, { status: 503 });
  }
  if (!paystackConfigured) {
    return Response.json({ error: 'Payments are not configured' }, { status: 503 });
  }

  const reference = new URL(request.url).searchParams.get('reference');
  if (!reference) {
    return Response.json({ error: 'A payment reference is required' }, { status: 400 });
  }

  let verified;
  try {
    verified = await verifyTransaction(reference);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Verification failed' },
      { status: 502 }
    );
  }

  if (verified.status !== 'success') {
    await supabaseAdmin
      .from('wallet_transactions')
      .update({ status: 'failed' })
      .eq('reference', reference)
      .eq('status', 'pending');
    return Response.json({ status: verified.status });
  }

  const { data: balance, error } = await supabaseAdmin.rpc('credit_wallet_topup', {
    p_reference: reference
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ status: 'success', balance });
}
