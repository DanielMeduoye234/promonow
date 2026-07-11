import { supabaseAdmin, UUID_REGEX } from '@/lib/supabaseAdmin';

// Returns the current balance and ledger for a wallet.
// NOTE: identity is passed as a query param today. Once server-side auth is in
// place this must be replaced with the authenticated user id from the session.
export async function GET(request: Request) {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const userId = new URL(request.url).searchParams.get('user_id');
  if (!userId || !UUID_REGEX.test(userId)) {
    return Response.json({ error: 'A valid user_id is required' }, { status: 400 });
  }

  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle();

  const { data: transactions, error } = await supabaseAdmin
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    balance: wallet?.balance ?? 0,
    transactions: transactions ?? []
  });
}
