import { supabaseAdmin, UUID_REGEX } from '@/lib/supabaseAdmin';

export async function GET() {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json(data);
}

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const body = await request.json();
  if (!body.id || !UUID_REGEX.test(body.id) || !body.username) {
    return Response.json({ error: 'A valid uuid id and username are required' }, { status: 400 });
  }

  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', body.id)
    .maybeSingle();
  if (existing) {
    return Response.json(existing);
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert([{
      id: body.id,
      username: body.username,
      reputation: body.reputation ?? 100.0,
      sales_count: body.sales_count ?? 0,
      // Admin accounts are provisioned via the database seed only —
      // never from a client-supplied flag.
      is_admin: false
    }])
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json(data, { status: 201 });
}
