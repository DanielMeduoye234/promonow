import crypto from 'crypto';

// Server-only Paystack helper. The secret key must never reach the browser —
// import this module solely from API route handlers.
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_BASE = 'https://api.paystack.co';

export const paystackConfigured = !!PAYSTACK_SECRET;

interface InitializeArgs {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}

interface PaystackInitData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface PaystackVerifyData {
  status: string; // 'success' | 'failed' | 'abandoned' | ...
  reference: string;
  amount: number; // in kobo
  currency: string;
  customer?: { email?: string };
  metadata?: Record<string, unknown>;
}

async function paystackFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    }
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok || !payload?.status) {
    throw new Error(payload?.message || `Paystack request failed (${res.status})`);
  }
  return payload.data as T;
}

// Naira amounts are charged in kobo (x100).
export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

export function initializeTransaction(args: InitializeArgs): Promise<PaystackInitData> {
  return paystackFetch<PaystackInitData>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: args.email,
      amount: args.amountKobo,
      reference: args.reference,
      callback_url: args.callbackUrl,
      metadata: args.metadata
    })
  });
}

export function verifyTransaction(reference: string): Promise<PaystackVerifyData> {
  return paystackFetch<PaystackVerifyData>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

// Validates the X-Paystack-Signature header: HMAC-SHA512 of the raw request
// body, keyed with the secret. Guards the webhook against forged calls.
export function isValidWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !PAYSTACK_SECRET) return false;
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}
