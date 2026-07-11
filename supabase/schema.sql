-- ============================================================
-- PromoNow — Complete Supabase Schema
-- Run this in the Supabase SQL Editor (safe to re-run).
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLES
-- ------------------------------------------------------------

-- PROFILES
-- NOTE: intentionally NO foreign key to auth.users. The app seeds
-- simulated personas and auto-provisions profiles with UUIDs that
-- are not real auth users (see src/lib/supabaseAdmin.ts).
create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  username    text not null unique,
  reputation  numeric(5,2) not null default 100.0,
  sales_count integer not null default 0,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- LISTINGS
create table if not exists public.listings (
  id                  uuid primary key default gen_random_uuid(),
  platform            text not null
                        check (platform in ('instagram','tiktok','facebook','youtube','twitter')),
  handle              text not null,
  followers           integer not null default 0,
  engagement_rate     numeric(6,2) not null default 0,
  avg_likes           integer not null default 0,
  category            text not null default '',
  description         text not null default '',
  price               numeric(12,2) not null check (price >= 0),
  verification_status text not null default 'pending'
                        check (verification_status in ('pending','verified','rejected')),
  audience_region     text not null default 'Global',
  status              text not null default 'pending'
                        check (status in ('active','sold','pending')),
  aged_year           integer,
  og_email_included   boolean not null default false,
  instant_delivery    boolean not null default false,
  is_promoted         boolean not null default false,
  seller_id           uuid not null references public.profiles(id) on delete cascade,
  created_at          timestamptz not null default now()
);

-- TRANSACTIONS (escrow contracts)
create table if not exists public.transactions (
  id         uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id   uuid not null references public.profiles(id) on delete cascade,
  seller_id  uuid not null references public.profiles(id) on delete cascade,
  amount     numeric(12,2) not null check (amount >= 0),
  escrow_fee numeric(12,2) not null default 0,
  status     text not null default 'pending'
               check (status in ('pending','held_in_escrow','released','refunded')),
  created_at timestamptz not null default now()
);

-- PROMOTION REQUESTS
create table if not exists public.promotion_requests (
  id         uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  plan_name  text not null,
  price      numeric(12,2) not null check (price >= 0),
  status     text not null default 'pending'
               check (status in ('pending','active','expired')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. INDEXES
-- ------------------------------------------------------------
create index if not exists idx_listings_seller_id       on public.listings (seller_id);
create index if not exists idx_listings_status          on public.listings (status);
create index if not exists idx_listings_created_at      on public.listings (created_at desc);
create index if not exists idx_transactions_listing_id  on public.transactions (listing_id);
create index if not exists idx_transactions_buyer_id    on public.transactions (buyer_id);
create index if not exists idx_transactions_seller_id   on public.transactions (seller_id);
create index if not exists idx_transactions_created_at  on public.transactions (created_at desc);
create index if not exists idx_promo_requests_listing   on public.promotion_requests (listing_id);
create index if not exists idx_promo_requests_created   on public.promotion_requests (created_at desc);

-- ------------------------------------------------------------
-- 3. AUTO-CREATE PROFILE ON AUTH SIGNUP
-- The login page inserts the profile via the API after signUp,
-- but this trigger guarantees a profile row even if that call fails.
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, reputation, sales_count, is_admin)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'username',
      'user_' || left(new.id::text, 8)
    ),
    100.0,
    0,
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- All writes go through Next.js API routes using the service-role
-- key (which bypasses RLS). Clients get read-only access.
-- ------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.listings           enable row level security;
alter table public.transactions       enable row level security;
alter table public.promotion_requests enable row level security;

drop policy if exists "Public read profiles"           on public.profiles;
drop policy if exists "Public read listings"           on public.listings;
drop policy if exists "Public read transactions"       on public.transactions;
drop policy if exists "Public read promotion requests" on public.promotion_requests;

create policy "Public read profiles"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Public read listings"
  on public.listings for select
  to anon, authenticated
  using (true);

create policy "Public read transactions"
  on public.transactions for select
  to anon, authenticated
  using (true);

create policy "Public read promotion requests"
  on public.promotion_requests for select
  to anon, authenticated
  using (true);

-- ------------------------------------------------------------
-- 5. SEED DATA
-- The admin console hardcodes fallback seller id
-- a7620e7a-9a99-467f-94d3-059929ccf0c1, so that UUID is seeded
-- as the admin. resolveSellerProfile() falls back to the OLDEST
-- non-admin profile, so the sellers below keep simulated
-- personas working.
-- ------------------------------------------------------------
insert into public.profiles (id, username, reputation, sales_count, is_admin, created_at) values
  ('a7620e7a-9a99-467f-94d3-059929ccf0c1', 'PromoNowAdmin',      100.0, 0,   true,  '2018-05-20T00:00:00Z'),
  ('11111111-1111-4111-8111-111111111111', 'EliteBroker_Assets',  99.8, 142, false, '2021-03-01T00:00:00Z'),
  ('22222222-2222-4222-8222-222222222222', 'ViralGrowthCo',       98.5, 57,  false, '2022-06-15T00:00:00Z'),
  ('33333333-3333-4333-8333-333333333333', 'DomainKing',         100.0, 12,  false, '2020-01-10T00:00:00Z')
on conflict (id) do nothing;

insert into public.listings
  (id, platform, handle, followers, engagement_rate, avg_likes, category, description, price,
   verification_status, audience_region, status, aged_year, og_email_included, instant_delivery,
   is_promoted, seller_id, created_at)
values
  ('aaaaaaa1-0000-4000-8000-000000000001', 'instagram', '@wanderlust_daily', 124500, 6.82, 8420,
   'Fashion & Lifestyle',
   'Highly engaged lifestyle page featuring premium travel and luxury photography content. Authentic community with top audience base in USA and UK. Perfect for luxury brand collaborations. OG Email is included for security.',
   4850, 'verified', 'USA', 'active', 2018, true, true, true,
   '11111111-1111-4111-8111-111111111111', now() - interval '3 days'),

  ('aaaaaaa1-0000-4000-8000-000000000002', 'tiktok', '@tech_unboxed', 320000, 12.0, 38400,
   'Tech & Unboxing',
   'Rapidly growing tech unboxing channel. Excellent reach, high comment-to-like ratio, and monetized via Creator Fund. Ready for immediate handover.',
   4200, 'verified', 'Global', 'active', 2023, true, true, true,
   '22222222-2222-4222-8222-222222222222', now() - interval '5 days'),

  ('aaaaaaa1-0000-4000-8000-000000000003', 'facebook', 'Finance Insider Network', 50000, 3.5, 1750,
   'Business & Finance',
   'Aged Facebook Page focusing on retail investing, stock market news, and personal finance. Clean quality page with no policy violations. Ad manager access available.',
   950, 'verified', 'USA', 'active', 2015, false, false, false,
   '11111111-1111-4111-8111-111111111111', now() - interval '10 days'),

  ('aaaaaaa1-0000-4000-8000-000000000004', 'twitter', '@tech', 89000, 4.8, 4270,
   'Premium Identity',
   'Highly sought-after premium handle with direct relevance to the developer/tech niche. Registered in 2009. Safe transfer guaranteed.',
   2800, 'verified', 'Global', 'active', 2009, true, true, false,
   '33333333-3333-4333-8333-333333333333', now() - interval '1 day'),

  ('aaaaaaa1-0000-4000-8000-000000000005', 'instagram', '@fit_lifestyle_pro', 12200, 8.4, 1024,
   'Health & Fitness',
   'Niche fitness and wellness community. Highly targeted audience with genuine interest in workout plans and supplements. Perfect starter account.',
   320, 'verified', 'Europe', 'active', 2022, false, true, false,
   '22222222-2222-4222-8222-222222222222', now() - interval '8 days')
on conflict (id) do nothing;

insert into public.transactions
  (id, listing_id, buyer_id, seller_id, amount, escrow_fee, status, created_at)
values
  ('bbbbbbb1-0000-4000-8000-000000000001',
   'aaaaaaa1-0000-4000-8000-000000000003',
   '22222222-2222-4222-8222-222222222222',
   '11111111-1111-4111-8111-111111111111',
   950, 19, 'released', now() - interval '15 days'),

  ('bbbbbbb1-0000-4000-8000-000000000002',
   'aaaaaaa1-0000-4000-8000-000000000002',
   '33333333-3333-4333-8333-333333333333',
   '22222222-2222-4222-8222-222222222222',
   4200, 84, 'held_in_escrow', now() - interval '2 days')
on conflict (id) do nothing;

insert into public.promotion_requests
  (id, listing_id, plan_name, price, status, created_at)
values
  ('ccccccc1-0000-4000-8000-000000000001',
   'aaaaaaa1-0000-4000-8000-000000000001',
   'Verified Premium', 35000, 'active', now() - interval '2 days'),

  ('ccccccc1-0000-4000-8000-000000000002',
   'aaaaaaa1-0000-4000-8000-000000000002',
   'Elite Broker Placement', 75000, 'pending', now() - interval '1 day')
on conflict (id) do nothing;
