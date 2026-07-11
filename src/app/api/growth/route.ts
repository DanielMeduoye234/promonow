import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { calculateGrowthPrice } from '@/lib/supabase';

const PLATFORMS = ['instagram', 'tiktok', 'facebook', 'youtube', 'twitter'];

export async function GET() {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const { data, error } = await supabaseAdmin
    .from('growth_requests')
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
  const targetFollowers = parseInt(body.target_followers, 10);

  if (!PLATFORMS.includes(body.platform)) {
    return Response.json({ error: 'A valid platform is required' }, { status: 400 });
  }
  if (!body.handle || typeof body.handle !== 'string') {
    return Response.json({ error: 'The page handle is required' }, { status: 400 });
  }
  if (!Number.isFinite(targetFollowers) || targetFollowers <= 0) {
    return Response.json({ error: 'target_followers must be a positive number' }, { status: 400 });
  }

  // Price is always computed here — never trusted from the client.
  const { data, error } = await supabaseAdmin
    .from('growth_requests')
    .insert([{
      platform: body.platform,
      handle: body.handle.trim(),
      target_followers: targetFollowers,
      price: calculateGrowthPrice(targetFollowers),
      requester_username: typeof body.requester_username === 'string' ? body.requester_username : '',
      status: 'pending'
    }])
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json(data, { status: 201 });
}
