import type { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/growth/[id]'>) {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const { id } = await ctx.params;
  const body = await request.json();

  if (!['pending', 'approved', 'completed'].includes(body.status)) {
    return Response.json({ error: 'A valid status is required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('growth_requests')
    .update({ status: body.status })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return Response.json({ error: 'Growth request not found' }, { status: 404 });
  }
  return Response.json(data);
}
