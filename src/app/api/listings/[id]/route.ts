import type { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/listings/[id]'>) {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const { id } = await ctx.params;
  const { data, error } = await supabaseAdmin
    .from('listings')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return Response.json({ error: 'Listing not found' }, { status: 404 });
  }
  return Response.json(data);
}

export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/listings/[id]'>) {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const { id } = await ctx.params;
  const body = await request.json();

  const updateObj: Record<string, unknown> = {};
  if (body.status !== undefined) updateObj.status = body.status;
  if (body.verification_status !== undefined) updateObj.verification_status = body.verification_status;
  if (body.is_promoted !== undefined) updateObj.is_promoted = body.is_promoted;

  if (Object.keys(updateObj).length === 0) {
    return Response.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('listings')
    .update(updateObj)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return Response.json({ error: 'Listing not found' }, { status: 404 });
  }
  return Response.json(data);
}
