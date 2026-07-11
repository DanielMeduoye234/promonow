import { supabaseAdmin, UUID_REGEX } from '@/lib/supabaseAdmin';

// Returns the credentials a user has purchased, newest first, with the listing
// handle/platform for display. Served only via the service role because
// listing_stock is not publicly readable.
export async function GET(request: Request) {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const userId = new URL(request.url).searchParams.get('user_id');
  if (!userId || !UUID_REGEX.test(userId)) {
    return Response.json({ error: 'A valid user_id is required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('listing_stock')
    .select('id, credentials, sold_at, listing:listings(handle, platform, category)')
    .eq('buyer_id', userId)
    .eq('status', 'sold')
    .order('sold_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json(data ?? []);
}
