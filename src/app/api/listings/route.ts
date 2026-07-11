import { supabaseAdmin, resolveSellerProfile } from '@/lib/supabaseAdmin';

export async function GET() {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  const { data, error } = await supabaseAdmin
    .from('listings')
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
  const { seller, ...listingData } = body;

  const sellerProfile = await resolveSellerProfile({
    id: listingData.seller_id,
    ...seller
  });

  if (!sellerProfile) {
    return Response.json({ error: 'Could not resolve a seller profile for this listing.' }, { status: 400 });
  }

  // Admin listings go live immediately; member listings await admin audit.
  const isAdminSeller = !!sellerProfile.is_admin;

  const { data, error } = await supabaseAdmin
    .from('listings')
    .insert([{
      platform: listingData.platform,
      handle: listingData.handle,
      followers: listingData.followers,
      engagement_rate: listingData.engagement_rate,
      avg_likes: listingData.avg_likes,
      category: listingData.category,
      description: listingData.description,
      price: listingData.price,
      audience_region: listingData.audience_region,
      aged_year: listingData.aged_year ?? null,
      og_email_included: !!listingData.og_email_included,
      instant_delivery: !!listingData.instant_delivery,
      seller_id: sellerProfile.id,
      status: isAdminSeller ? 'active' : 'pending',
      verification_status: isAdminSeller ? 'verified' : 'pending'
    }])
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ ...data, auto_approved: isAdminSeller }, { status: 201 });
}
