import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { isValidWebhookSignature } from '@/lib/paystack';

// Paystack calls this server-to-server when a charge succeeds. It is the
// authoritative credit path (the browser redirect can be abandoned). The raw
// body is required to validate the HMAC signature, so read it as text.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-paystack-signature');

  if (!isValidWebhookSignature(rawBody, signature)) {
    return new Response('Invalid signature', { status: 401 });
  }

  if (!supabaseAdmin) {
    return new Response('ok', { status: 200 });
  }

  let event: { event?: string; data?: { reference?: string; amount?: number; currency?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response('ok', { status: 200 });
  }

  if (event.event === 'charge.success' && event.data?.reference) {
    if (event.data.reference.startsWith('buy_')) {
      const { data: expected } = await supabaseAdmin
        .from('marketplace_payments')
        .select('amount')
        .eq('reference', event.data.reference)
        .maybeSingle();
      const exactAmount = expected && event.data.currency === 'NGN'
        && event.data.amount === Math.round(Number(expected.amount) * 100);
      if (exactAmount) {
        await supabaseAdmin.rpc('complete_marketplace_payment', { p_reference: event.data.reference });
      }
    } else {
      // Idempotent: no-op if the verify endpoint already credited this top-up.
      await supabaseAdmin.rpc('credit_wallet_topup', { p_reference: event.data.reference });
    }
  }

  // Always 200 so Paystack does not retry indefinitely.
  return new Response('ok', { status: 200 });
}
