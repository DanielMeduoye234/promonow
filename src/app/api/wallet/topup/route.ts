import { randomUUID } from 'crypto';
import { supabaseAdmin, UUID_REGEX } from '@/lib/supabaseAdmin';
import { paystackConfigured, initializeTransaction, nairaToKobo } from '@/lib/paystack';

const MIN_TOPUP_NAIRA = 100;

// Starts a wallet top-up: records a pending ledger row, then asks Paystack for
// a hosted checkout URL. The wallet is only credited later, after the payment
// is verified server-side (see /api/wallet/verify and the webhook).
export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Supabase is not configured' }, { status: 503 });
  }
  if (!paystackConfigured) {
    return Response.json({ error: 'Payments are not configured' }, { status: 503 });
  }

  const body = await request.json();
  const amount = Number(body.amount);

  if (!body.user_id || !UUID_REGEX.test(body.user_id)) {
    return Response.json({ error: 'A valid user_id is required' }, { status: 400 });
  }
  if (!body.email || typeof body.email !== 'string') {
    return Response.json({ error: 'An email is required for the receipt' }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount < MIN_TOPUP_NAIRA) {
    return Response.json({ error: `Minimum top-up is ₦${MIN_TOPUP_NAIRA}` }, { status: 400 });
  }

  const reference = `top_${randomUUID()}`;

  const { error: insertError } = await supabaseAdmin
    .from('wallet_transactions')
    .insert([{
      user_id: body.user_id,
      type: 'topup',
      amount,
      reference,
      status: 'pending',
      description: 'Wallet top-up'
    }]);

  if (insertError) {
    return Response.json({ error: insertError.message }, { status: 500 });
  }

  try {
    const data = await initializeTransaction({
      email: body.email,
      amountKobo: nairaToKobo(amount),
      reference,
      callbackUrl: typeof body.callback_url === 'string' ? body.callback_url : undefined,
      metadata: { user_id: body.user_id, purpose: 'wallet_topup' }
    });
    return Response.json({ authorization_url: data.authorization_url, reference });
  } catch (err) {
    await supabaseAdmin
      .from('wallet_transactions')
      .update({ status: 'failed' })
      .eq('reference', reference);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Could not start payment' },
      { status: 502 }
    );
  }
}
