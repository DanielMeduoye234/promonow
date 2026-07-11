# Connecting Real Supabase & Deploying PromoNow Live

This guide explains how to connect a real Supabase database and deploy the PromoNow Next.js marketplace to production.

---

## Step 1: Set Up Supabase Database

1. Go to the [Supabase Dashboard](https://supabase.com) and create a new project.
2. In the left navigation, go to **SQL Editor** and click **New query**.
3. Paste the following SQL script to create the database schemas, tables, and constraints:

```sql
-- 1. Create Profiles Table (extends Supabase Auth users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  reputation numeric default 100.0 not null,
  sales_count integer default 0 not null,
  is_admin boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Listings Table
create table public.listings (
  id uuid default gen_random_uuid() primary key,
  platform text check (platform in ('instagram', 'tiktok', 'facebook', 'youtube', 'twitter')) not null,
  handle text not null,
  followers integer not null check (followers > 0),
  engagement_rate numeric not null,
  avg_likes integer not null,
  category text not null,
  description text,
  price numeric not null check (price >= 0),
  verification_status text default 'pending' check (verification_status in ('pending', 'verified', 'rejected')) not null,
  audience_region text default 'USA' not null,
  status text default 'active' check (status in ('active', 'sold', 'pending')) not null,
  aged_year integer,
  og_email_included boolean default false not null,
  instant_delivery boolean default false not null,
  is_promoted boolean default false not null,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Transactions Table (Escrow Log)
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric not null check (amount >= 0),
  escrow_fee numeric not null check (escrow_fee >= 0),
  status text default 'pending' check (status in ('pending', 'held_in_escrow', 'released', 'refunded')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Promotion Requests Table
create table public.promotion_requests (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  plan_name text not null,
  price numeric not null check (price >= 0),
  status text default 'pending' check (status in ('pending', 'active', 'expired')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.transactions enable row level security;
alter table public.promotion_requests enable row level security;

-- Create basic RLS policies
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

create policy "Listings are viewable by everyone." on public.listings
  for select using (true);

create policy "Authenticated users can create listings." on public.listings
  for insert with check (auth.uid() = seller_id);

create policy "Sellers can update their own listings." on public.listings
  for update using (auth.uid() = seller_id);

create policy "Promotion requests are viewable by everyone." on public.promotion_requests
  for select using (true);

create policy "Anyone can create promotion requests." on public.promotion_requests
  for insert with check (true);
```

---

## Step 2: Configure Next.js Environment Variables

1. Create a `.env.local` file in the root of your Next.js project.
2. Add your Supabase credentials (found in your Supabase project under **Project Settings > API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Important:** `SUPABASE_SERVICE_ROLE_KEY` (Project Settings > API > service_role) is required.
> All database reads/writes go through Next.js API routes (`src/app/api/*`) that use this key
> server-side, which bypasses RLS. This is what enforces the listing rules: listings created by
> members are inserted as `pending` (awaiting admin audit), while listings created by admins are
> inserted as `active`/`verified` and appear on the marketplace immediately. Never expose this key
> to the browser (do not prefix it with `NEXT_PUBLIC_`).

---

## Step 3: Connect the Supabase SDK Client

1. Install the `@supabase/supabase-js` package:
   ```bash
   npm install @supabase/supabase-js
   ```
2. Replace [supabase.ts](file:///c:/Users/DELL%20XPS/Downloads/PromoNow/src/lib/supabase.ts) with the SDK client initialized using the environment variables:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const api = {
  getListings: async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  // Add other fetch / insert actions mapping to supabase client
};
```

---

## Step 4: Deploying Live (Vercel / Netlify)

### Option A: Deploy to Vercel (Recommended)
1. Commit and push your code to a GitHub repository.
2. Import the repository into the [Vercel Dashboard](https://vercel.com).
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. Vercel will automatically build the static assets, optimize Turbopack headers, and serve the site.

### Option B: Deploy to Netlify
1. Import your repository into [Netlify](https://netlify.com).
2. Set the build command to `npm run build` and publish directory to `.next`.
3. Add your environment variables in Netlify's site settings.
4. Trigger the deployment.
