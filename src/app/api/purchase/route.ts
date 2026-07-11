import { supabaseAdmin, UUID_REGEX } from '@/lib/supabaseAdmin';

// Buys one stock unit of a listing using the wallet balance. All the money and
// inventory logic lives in the purchase_listing_with_wallet() DB function so
// the debit and the stock hand-over are a single atomic transaction.
export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const body = await request.json();
  if (!body.user_id || !UUID_REGEX.test(body.user_id)) {
    return Response.json({ error: 'A valid user_id is required' }, { status: 400 });
  }
  if (!body.listing_id || !UUID_REGEX.test(body.listing_id)) {
    return Response.json({ error: 'A valid listing_id is required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.rpc('purchase_listing_with_wallet', {
    p_user_id: body.user_id,
    p_listing_id: body.listing_id
  });

  if (error) {
    const msg = error.message || '';
    if (msg.includes('INSUFFICIENT_FUNDS')) {
      return Response.json({ error: 'Insufficient wallet balance. Please top up.' }, { status: 402 });
    }
    if (msg.includes('OUT_OF_STOCK')) {
      return Response.json({ error: 'This item is out of stock.' }, { status: 409 });
    }
    if (msg.includes('LISTING_NOT_FOUND')) {
      return Response.json({ error: 'Listing not found.' }, { status: 404 });
    }
    return Response.json({ error: msg || 'Purchase failed' }, { status: 500 });
  }

  // rpc returning a table yields an array of rows.
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return Response.json({ error: 'Purchase failed' }, { status: 500 });
  }

  return Response.json({
    credentials: row.credentials,
    price: row.price,
    new_balance: row.new_balance
  });
}
