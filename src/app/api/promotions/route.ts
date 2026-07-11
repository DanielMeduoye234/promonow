import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const { data, error } = await supabaseAdmin
    .from('promotion_requests')
    .select('*')
    .order('created_at', { ascending: false });

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
  if (!body.listing_id || !body.plan_name || body.price === undefined) {
    return Response.json({ error: 'listing_id, plan_name and price are required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('promotion_requests')
    .insert([{
      listing_id: body.listing_id,
      plan_name: body.plan_name,
      price: body.price,
      status: 'pending'
    }])
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json(data, { status: 201 });
}
