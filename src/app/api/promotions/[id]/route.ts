import type { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/promotions/[id]'>) {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const { id } = await ctx.params;
  const body = await request.json();

  if (!body.status) {
    return Response.json({ error: 'status is required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('promotion_requests')
    .update({ status: body.status })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return Response.json({ error: 'Promotion request not found' }, { status: 404 });
  }

  if (body.status === 'active') {
    await supabaseAdmin
      .from('listings')
      .update({ is_promoted: true })
      .eq('id', data.listing_id);
  }

  return Response.json(data);
}
