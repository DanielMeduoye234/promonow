import { supabaseAdmin, UUID_REGEX } from '@/lib/supabaseAdmin';

// GET ?listing_id=... -> number of available (unsold) stock units for a listing.
export async function GET(request: Request) {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const listingId = new URL(request.url).searchParams.get('listing_id');
  if (!listingId || !UUID_REGEX.test(listingId)) {
    return Response.json({ error: 'A valid listing_id is required' }, { status: 400 });
  }

  const { count, error } = await supabaseAdmin
    .from('listing_stock')
    .select('*', { count: 'exact', head: true })
    .eq('listing_id', listingId)
    .eq('status', 'available');

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ available: count ?? 0 });
}

// POST { listing_id, credentials: string[] } -> loads pre-made credentials into
// stock for instant delivery. One array entry becomes one sellable unit.
// (Admin action — this must be gated by a real admin session once auth lands.)
export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const body = await request.json();
  if (!body.listing_id || !UUID_REGEX.test(body.listing_id)) {
    return Response.json({ error: 'A valid listing_id is required' }, { status: 400 });
  }

  const credentials: string[] = Array.isArray(body.credentials)
    ? body.credentials.map((c: unknown) => String(c).trim()).filter(Boolean)
    : [];

  if (credentials.length === 0) {
    return Response.json({ error: 'At least one credential line is required' }, { status: 400 });
  }

  const rows = credentials.map(c => ({ listing_id: body.listing_id, credentials: c }));
  const { data, error } = await supabaseAdmin
    .from('listing_stock')
    .insert(rows)
    .select('id');

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ added: data?.length ?? 0 }, { status: 201 });
}
