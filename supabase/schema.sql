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

-- ------------------------------------------------------------
-- 6. FOLLOWER GROWTH REQUESTS
-- Users ask PromoNow to grow one of their own social pages by a
-- target follower count. Price is computed server-side at
-- NGN 10 per follower with a NGN 10,000 minimum. Admins approve
-- the request, then handle the promotion and mark it completed.
-- (Appended section — safe to re-run like the rest of this file.)
-- ------------------------------------------------------------
create table if not exists public.growth_requests (
  id                 uuid primary key default gen_random_uuid(),
  platform           text not null
                       check (platform in ('instagram','tiktok','facebook','youtube','twitter')),
  handle             text not null,
  target_followers   integer not null check (target_followers > 0),
  price              numeric(12,2) not null check (price >= 10000),
  requester_username text not null default '',
  status             text not null default 'pending'
                       check (status in ('pending','approved','completed')),
  created_at         timestamptz not null default now()
);

create index if not exists idx_growth_requests_status  on public.growth_requests (status);
create index if not exists idx_growth_requests_created on public.growth_requests (created_at desc);

alter table public.growth_requests enable row level security;

drop policy if exists "Public read growth requests" on public.growth_requests;
create policy "Public read growth requests"
  on public.growth_requests for select
  to anon, authenticated
  using (true);

-- ============================================================
-- 7. WALLET, PAYMENTS & CREDENTIAL INVENTORY (Aklogz-style shop)
-- Appended section — safe to re-run.
-- ------------------------------------------------------------
-- Design notes:
--  * wallets / wallet_transactions / listing_stock have RLS ENABLED
--    with NO public policy, so anon/authenticated clients CANNOT read
--    them directly. Only the service-role key (used by our API routes)
--    bypasses RLS. This is critical: listing_stock holds plaintext
--    account credentials that must never be exposed to the browser.
--  * All money movement happens inside SECURITY DEFINER functions so
--    balance checks, stock assignment and ledger writes are atomic.
-- ============================================================

-- WALLETS: one balance row per profile
create table if not exists public.wallets (
  user_id    uuid primary key references public.profiles(id) on delete cascade,
  balance    numeric(14,2) not null default 0 check (balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- WALLET LEDGER: every top-up, purchase and refund
create table if not exists public.wallet_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('topup','purchase','refund')),
  amount      numeric(14,2) not null check (amount >= 0),
  reference   text not null unique,
  status      text not null default 'pending'
                check (status in ('pending','success','failed')),
  description text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists idx_wallet_tx_user    on public.wallet_transactions (user_id);
create index if not exists idx_wallet_tx_created on public.wallet_transactions (created_at desc);

-- LISTING STOCK: pre-loaded credentials for instant delivery.
-- A listing can hold many stock units; each is sold to exactly one buyer.
create table if not exists public.listing_stock (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings(id) on delete cascade,
  credentials text not null,
  status      text not null default 'available'
                check (status in ('available','sold')),
  buyer_id    uuid references public.profiles(id) on delete set null,
  sold_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists idx_listing_stock_avail on public.listing_stock (listing_id, status);

-- Direct Paystack payments for marketplace purchases. No wallet or escrow is
-- involved: Paystack verifies the exact listing price before fulfilment.
create table if not exists public.marketplace_payments (
  id          uuid primary key default gen_random_uuid(),
  reference   text not null unique,
  listing_id  uuid not null references public.listings(id) on delete restrict,
  buyer_id    uuid not null references public.profiles(id) on delete restrict,
  amount      numeric(14,2) not null check (amount >= 0),
  email       text not null,
  stock_id    uuid references public.listing_stock(id) on delete set null,
  status      text not null default 'pending' check (status in ('pending','success','failed')),
  completed_at timestamptz,
  created_at  timestamptz not null default now()
);

alter table public.marketplace_payments
  add column if not exists stock_id uuid references public.listing_stock(id) on delete set null;

create index if not exists idx_marketplace_payments_buyer on public.marketplace_payments (buyer_id);
alter table public.marketplace_payments enable row level security;

create or replace function public.complete_marketplace_payment(p_reference text)
returns table (credentials text)
language plpgsql
security definer set search_path = public
as $$
declare
  v_payment marketplace_payments%rowtype;
  v_listing listings%rowtype;
  v_stock listing_stock%rowtype;
  v_credentials text := '';
  v_remaining integer;
begin
  select * into v_payment from marketplace_payments where reference = p_reference for update;
  if not found then raise exception 'PAYMENT_NOT_FOUND'; end if;

  if v_payment.status = 'success' then
    select s.credentials into v_credentials from listing_stock s where s.id = v_payment.stock_id;
    return query select coalesce(v_credentials, '');
    return;
  end if;

  select * into v_listing from listings where id = v_payment.listing_id for update;
  if not found or v_listing.status <> 'active' then raise exception 'LISTING_UNAVAILABLE'; end if;
  if v_payment.amount <> v_listing.price then raise exception 'PRICE_MISMATCH'; end if;

  select * into v_stock from listing_stock
    where listing_id = v_listing.id and status = 'available'
    order by created_at limit 1 for update skip locked;

  if found then
    update listing_stock set status = 'sold', buyer_id = v_payment.buyer_id, sold_at = now()
      where id = v_stock.id;
    v_credentials := v_stock.credentials;
    select count(*) into v_remaining from listing_stock
      where listing_id = v_listing.id and status = 'available';
    if v_remaining = 0 then update listings set status = 'sold' where id = v_listing.id; end if;
  elsif v_listing.instant_delivery then
    raise exception 'OUT_OF_STOCK';
  else
    update listings set status = 'sold' where id = v_listing.id;
  end if;

  insert into transactions (listing_id, buyer_id, seller_id, amount, escrow_fee, status)
    values (v_listing.id, v_payment.buyer_id, v_listing.seller_id, v_listing.price, 0, 'released');
  update marketplace_payments
    set status = 'success', stock_id = v_stock.id, completed_at = now()
    where id = v_payment.id;
  return query select v_credentials;
end;
$$;

-- Lock down: RLS on, no policies => no direct client access at all.
alter table public.wallets              enable row level security;
alter table public.wallet_transactions  enable row level security;
alter table public.listing_stock        enable row level security;

-- ------------------------------------------------------------
-- credit_wallet_topup: idempotently mark a pending top-up successful
-- and add the funds. Safe to call from both the verify endpoint and
-- the Paystack webhook — the second call is a no-op.
-- ------------------------------------------------------------
create or replace function public.credit_wallet_topup(p_reference text)
returns numeric
language plpgsql
security definer set search_path = public
as $$
declare
  v_tx      wallet_transactions%rowtype;
  v_balance numeric(14,2);
begin
  select * into v_tx from wallet_transactions
    where reference = p_reference and type = 'topup'
    for update;

  if not found then
    raise exception 'TXN_NOT_FOUND';
  end if;

  -- Already credited: return current balance unchanged (idempotent).
  if v_tx.status = 'success' then
    select balance into v_balance from wallets where user_id = v_tx.user_id;
    return coalesce(v_balance, 0);
  end if;

  insert into wallets (user_id, balance)
    values (v_tx.user_id, v_tx.amount)
    on conflict (user_id)
    do update set balance = wallets.balance + v_tx.amount, updated_at = now()
    returning balance into v_balance;

  update wallet_transactions set status = 'success' where id = v_tx.id;

  return v_balance;
end;
$$;

-- ------------------------------------------------------------
-- purchase_listing_with_wallet: atomically charge the wallet and hand
-- over one available stock unit. Raises INSUFFICIENT_FUNDS / OUT_OF_STOCK
-- / LISTING_NOT_FOUND so the API can return a clean error.
-- ------------------------------------------------------------
create or replace function public.purchase_listing_with_wallet(
  p_user_id uuid,
  p_listing_id uuid
)
returns table (stock_id uuid, credentials text, price numeric, new_balance numeric)
language plpgsql
security definer set search_path = public
as $$
declare
  v_price   numeric(14,2);
  v_handle  text;
  v_balance numeric(14,2);
  v_stock   listing_stock%rowtype;
begin
  select price, handle into v_price, v_handle from listings where id = p_listing_id;
  if v_price is null then
    raise exception 'LISTING_NOT_FOUND';
  end if;

  -- Lock the wallet row so the balance check and debit are atomic.
  select balance into v_balance from wallets where user_id = p_user_id for update;
  if v_balance is null or v_balance < v_price then
    raise exception 'INSUFFICIENT_FUNDS';
  end if;

  -- Grab exactly one available unit; SKIP LOCKED avoids two buyers racing
  -- onto the same row.
  select * into v_stock from listing_stock
    where listing_id = p_listing_id and status = 'available'
    limit 1
    for update skip locked;
  if not found then
    raise exception 'OUT_OF_STOCK';
  end if;

  update listing_stock
    set status = 'sold', buyer_id = p_user_id, sold_at = now()
    where id = v_stock.id;

  update wallets
    set balance = balance - v_price, updated_at = now()
    where user_id = p_user_id
    returning balance into v_balance;

  insert into wallet_transactions (user_id, type, amount, reference, status, description)
    values (p_user_id, 'purchase', v_price, 'pur_' || gen_random_uuid()::text, 'success',
            'Purchase: ' || coalesce(v_handle, p_listing_id::text));

  return query select v_stock.id, v_stock.credentials, v_price, v_balance;
end;
$$;
