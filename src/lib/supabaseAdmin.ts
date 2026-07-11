import { createClient } from '@supabase/supabase-js';

// Server-only Supabase client using the service role key.
// Bypasses RLS so API routes can read/write on behalf of the simulated users.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseAdmin = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  : null;

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface SellerProfileInput {
  id?: string;
  username?: string;
  is_admin?: boolean;
}

// Resolves the seller to a real profile row so FK constraints hold.
// 1. Use the profile row matching the given id.
// 2. If the id is a valid UUID (e.g. a Supabase Auth user whose profile
//    insert previously failed), auto-provision the profile row.
// 3. Otherwise fall back to a seeded profile so simulated personas still work.
export async function resolveSellerProfile(seller: SellerProfileInput | undefined) {
  if (!supabaseAdmin) return null;

  if (seller?.id && UUID_REGEX.test(seller.id)) {
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', seller.id)
      .maybeSingle();
    if (existing) return existing;

    const { data: created } = await supabaseAdmin
      .from('profiles')
      .insert([{
        id: seller.id,
        username: seller.username || `user_${seller.id.slice(0, 8)}`,
        reputation: 100.0,
        sales_count: 0,
        is_admin: !!seller.is_admin
      }])
      .select()
      .single();
    if (created) return created;
  }

  if (seller?.username) {
    const { data: byName } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('username', seller.username)
      .maybeSingle();
    if (byName) return byName;
  }

  const { data: fallback } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('is_admin', false)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  return fallback;
}
