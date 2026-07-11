import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export interface Profile {
  id: string;
  username: string;
  reputation: number;
  sales_count: number;
  is_admin: boolean;
  created_at: string;
}

export interface Listing {
  id: string;
  platform: 'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'twitter';
  handle: string;
  followers: number;
  engagement_rate: number;
  avg_likes: number;
  category: string;
  description: string;
  price: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  audience_region: string;
  status: 'active' | 'sold' | 'pending';
  aged_year?: number;
  og_email_included: boolean;
  instant_delivery: boolean;
  seller_id: string;
  created_at: string;
  is_promoted?: boolean;
}

export interface Transaction {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  escrow_fee: number;
  status: 'pending' | 'held_in_escrow' | 'released' | 'refunded';
  created_at: string;
}

export interface PromotionRequest {
  id: string;
  listing_id: string;
  plan_name: string;
  price: number;
  status: 'pending' | 'active' | 'expired';
  created_at: string;
}

// Initial mock listings matching Stitch mockup designs
const INITIAL_LISTINGS: Listing[] = [
  {
    id: "lst-1",
    platform: "instagram",
    handle: "@wanderlust_daily",
    followers: 124500,
    engagement_rate: 6.82,
    avg_likes: 8420,
    category: "Fashion & Lifestyle",
    description: "Highly engaged lifestyle page featuring premium travel and luxury photography content. Authentic community with top audience base in USA and UK. Perfect for luxury brand collaborations. OG Email is included for security.",
    price: 4850,
    verification_status: "verified",
    audience_region: "USA",
    status: "active",
    aged_year: 2018,
    og_email_included: true,
    instant_delivery: true,
    seller_id: "usr-seller-1",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    is_promoted: true
  },
  {
    id: "lst-2",
    platform: "tiktok",
    handle: "@tech_unboxed",
    followers: 320000,
    engagement_rate: 12.0,
    avg_likes: 38400,
    category: "Tech & Unboxing",
    description: "Rapidly growing tech unboxing channel. Excellent reach, high comment-to-like ratio, and monetized via Creator Fund. Ready for immediate handover.",
    price: 4200,
    verification_status: "verified",
    audience_region: "Global",
    status: "active",
    aged_year: 2023,
    og_email_included: true,
    instant_delivery: true,
    seller_id: "usr-seller-2",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    is_promoted: true
  },
  {
    id: "lst-3",
    platform: "facebook",
    handle: "Finance Insider Network",
    followers: 50000,
    engagement_rate: 3.5,
    avg_likes: 1750,
    category: "Business & Finance",
    description: "Aged Facebook Page focusing on retail investing, stock market news, and personal finance. Clean quality page with no policy violations. Ad manager access available.",
    price: 950,
    verification_status: "verified",
    audience_region: "USA",
    status: "active",
    aged_year: 2015,
    og_email_included: false,
    instant_delivery: false,
    seller_id: "usr-seller-1",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "lst-4",
    platform: "twitter",
    handle: "@tech",
    followers: 89000,
    engagement_rate: 4.8,
    avg_likes: 4270,
    category: "Premium Identity",
    description: "Highly sought-after premium handle with direct relevance to the developer/tech niche. Registered in 2009. Safe transfer guaranteed.",
    price: 2800,
    verification_status: "verified",
    audience_region: "Global",
    status: "active",
    aged_year: 2009,
    og_email_included: true,
    instant_delivery: true,
    seller_id: "usr-seller-3",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "lst-5",
    platform: "instagram",
    handle: "@fit_lifestyle_pro",
    followers: 12200,
    engagement_rate: 8.4,
    avg_likes: 1024,
    category: "Health & Fitness",
    description: "Niche fitness and wellness community. Highly targeted audience with genuine interest in workout plans and supplements. Perfect starter account.",
    price: 320,
    verification_status: "verified",
    audience_region: "Europe",
    status: "active",
    aged_year: 2022,
    og_email_included: false,
    instant_delivery: true,
    seller_id: "usr-seller-2",
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_PROFILES: Profile[] = [
  {
    id: "usr-seller-1",
    username: "EliteBroker_Assets",
    reputation: 99.8,
    sales_count: 142,
    is_admin: false,
    created_at: "2021-03-01T00:00:00Z"
  },
  {
    id: "usr-seller-2",
    username: "ViralGrowthCo",
    reputation: 98.5,
    sales_count: 57,
    is_admin: false,
    created_at: "2022-06-15T00:00:00Z"
  },
  {
    id: "usr-seller-3",
    username: "DomainKing",
    reputation: 100.0,
    sales_count: 12,
    is_admin: false,
    created_at: "2020-01-10T00:00:00Z"
  },
  {
    id: "usr-admin",
    username: "PromoNowAdmin",
    reputation: 100.0,
    sales_count: 0,
    is_admin: true,
    created_at: "2018-05-20T00:00:00Z"
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    listing_id: "lst-3",
    buyer_id: "usr-seller-2",
    seller_id: "usr-seller-1",
    amount: 950,
    escrow_fee: 19,
    status: "released",
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "tx-2",
    listing_id: "lst-2",
    buyer_id: "usr-seller-3",
    seller_id: "usr-seller-2",
    amount: 4200,
    escrow_fee: 84,
    status: "held_in_escrow",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_PROMO_REQUESTS: PromotionRequest[] = [
  {
    id: "promo-1",
    listing_id: "lst-1",
    plan_name: "Verified Premium",
    price: 35000,
    status: "active",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "promo-2",
    listing_id: "lst-2",
    plan_name: "Elite Broker Placement",
    price: 75000,
    status: "pending",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

class LocalDatabase {
  private getStorageItem<T>(key: string, initial: T): T {
    if (typeof window === 'undefined') return initial;
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(item);
  }

  private setStorageItem<T>(key: string, value: T): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  getListings(): Listing[] {
    return this.getStorageItem<Listing[]>('promonow_listings', INITIAL_LISTINGS);
  }

  saveListings(listings: Listing[]): void {
    this.setStorageItem('promonow_listings', listings);
  }

  getProfiles(): Profile[] {
    return this.getStorageItem<Profile[]>('promonow_profiles', INITIAL_PROFILES);
  }

  saveProfiles(profiles: Profile[]): void {
    this.setStorageItem('promonow_profiles', profiles);
  }

  getTransactions(): Transaction[] {
    return this.getStorageItem<Transaction[]>('promonow_transactions', INITIAL_TRANSACTIONS);
  }

  saveTransactions(transactions: Transaction[]): void {
    this.setStorageItem('promonow_transactions', transactions);
  }

  getPromotionRequests(): PromotionRequest[] {
    return this.getStorageItem<PromotionRequest[]>('promonow_promo_requests', INITIAL_PROMO_REQUESTS);
  }

  savePromotionRequests(requests: PromotionRequest[]): void {
    this.setStorageItem('promonow_promo_requests', requests);
  }
}

export const db = new LocalDatabase();

// Calls a server API route (which uses the service role key and enforces
// the listing approval rules). Throws when the server is unreachable or
// Supabase is not configured, so callers can fall back to local storage.
async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(payload?.error || `Request failed with status ${res.status}`);
  }
  return payload as T;
}

// Easy Client helper operations
export const api = {
  getListings: async () => {
    try {
      return await fetchApi<Listing[]>('/api/listings');
    } catch (err) {
      console.warn("API unavailable, fallback to memory database:", err);
    }
    return db.getListings();
  },
  getListingById: async (id: string) => {
    try {
      return await fetchApi<Listing>(`/api/listings/${id}`);
    } catch (err) {
      console.warn("API unavailable, fallback to memory database:", err);
    }
    return db.getListings().find(l => l.id === id);
  },
  // The server decides the listing status: admins go live instantly
  // ('active'/'verified'), members enter the audit queue ('pending').
  createListing: async (listingData: Omit<Listing, 'id' | 'created_at' | 'status' | 'verification_status'> & {
    status?: Listing['status'],
    verification_status?: Listing['verification_status'],
    seller?: { id?: string; username?: string; is_admin?: boolean }
  }) => {
    try {
      return await fetchApi<Listing & { auto_approved?: boolean }>('/api/listings', {
        method: 'POST',
        body: JSON.stringify(listingData)
      });
    } catch (err) {
      console.warn("API unavailable, fallback to memory database:", err);
    }

    const isAdminSeller = !!listingData.seller?.is_admin;
    const listings = db.getListings();
    const rest = { ...listingData };
    delete rest.seller;
    const newListing: Listing & { auto_approved?: boolean } = {
      ...rest,
      id: 'lst-' + Math.random().toString(36).substr(2, 9),
      status: isAdminSeller ? 'active' : 'pending',
      verification_status: isAdminSeller ? 'verified' : 'pending',
      created_at: new Date().toISOString(),
      auto_approved: isAdminSeller
    };
    listings.unshift(newListing);
    db.saveListings(listings);
    return newListing;
  },
  updateListingStatus: async (id: string, status: Listing['status'], verification_status?: Listing['verification_status']) => {
    try {
      return await fetchApi<Listing>(`/api/listings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, verification_status })
      });
    } catch (err) {
      console.warn("API unavailable, fallback to memory database:", err);
    }

    const listings = db.getListings();
    const idx = listings.findIndex(l => l.id === id);
    if (idx !== -1) {
      listings[idx].status = status;
      if (verification_status) {
        listings[idx].verification_status = verification_status;
      }
      db.saveListings(listings);
      return listings[idx];
    }
    throw new Error('Listing not found');
  },
  toggleListingPromotion: async (id: string) => {
    try {
      const current = await fetchApi<Listing>(`/api/listings/${id}`);
      return await fetchApi<Listing>(`/api/listings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_promoted: !current.is_promoted })
      });
    } catch (err) {
      console.warn("API unavailable, fallback to memory database:", err);
    }

    const listings = db.getListings();
    const idx = listings.findIndex(l => l.id === id);
    if (idx !== -1) {
      listings[idx].is_promoted = !listings[idx].is_promoted;
      db.saveListings(listings);
      return listings[idx];
    }
    throw new Error('Listing not found');
  },
  getProfiles: async () => {
    try {
      const profiles = await fetchApi<Profile[]>('/api/profiles');
      if (profiles.length > 0) return profiles;
    } catch (err) {
      console.warn("API unavailable, fallback to memory database:", err);
    }
    return db.getProfiles();
  },
  getProfileById: async (id: string) => {
    try {
      return await fetchApi<Profile>(`/api/profiles/${id}`);
    } catch (err) {
      console.warn("API unavailable, fallback to memory database:", err);
    }
    return db.getProfiles().find(p => p.id === id);
  },
  createProfile: async (profile: Profile) => {
    try {
      return await fetchApi<Profile>('/api/profiles', {
        method: 'POST',
        body: JSON.stringify(profile)
      });
    } catch (err) {
      console.warn("API unavailable, fallback to memory database:", err);
    }

    const profiles = db.getProfiles();
    if (!profiles.some(p => p.id === profile.id)) {
      profiles.push(profile);
      db.saveProfiles(profiles);
    }
    return profile;
  },
  getTransactions: async () => {
    try {
      return await fetchApi<Transaction[]>('/api/transactions');
    } catch (err) {
      console.warn("API unavailable, fallback to memory database:", err);
    }
    return db.getTransactions();
  },
  createTransaction: async (listingId: string, buyerId: string) => {
    try {
      return await fetchApi<Transaction>('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({ listing_id: listingId, buyer_id: buyerId })
      });
    } catch (err) {
      console.warn("API unavailable, fallback to memory database:", err);
    }

    const listings = db.getListings();
    const listing = listings.find(l => l.id === listingId);
    if (!listing) throw new Error('Listing not found');
    const escrowFee = Math.round(listing.price * 0.02 * 100) / 100;

    const transactions = db.getTransactions();
    const newTx: Transaction = {
      id: 'tx-' + Math.random().toString(36).substr(2, 9),
      listing_id: listingId,
      buyer_id: buyerId,
      seller_id: listing.seller_id,
      amount: listing.price,
      escrow_fee: escrowFee,
      status: 'held_in_escrow',
      created_at: new Date().toISOString()
    };

    // Mark listing as pending/sold
    listing.status = 'sold';
    db.saveListings(listings.map(l => l.id === listingId ? listing : l));

    transactions.unshift(newTx);
    db.saveTransactions(transactions);
    return newTx;
  },
  updateTransactionStatus: async (id: string, status: Transaction['status']) => {
    try {
      return await fetchApi<Transaction>(`/api/transactions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.warn("API unavailable, fallback to memory database:", err);
    }

    const transactions = db.getTransactions();
    const idx = transactions.findIndex(t => t.id === id);
    if (idx !== -1) {
      transactions[idx].status = status;
      db.saveTransactions(transactions);
      return transactions[idx];
    }
    throw new Error('Transaction not found');
  },
  getPromotionRequests: async () => {
    try {
      return await fetchApi<PromotionRequest[]>('/api/promotions');
    } catch (err) {
      console.warn("API unavailable, fallback to memory database:", err);
    }
    return db.getPromotionRequests();
  },
  createPromotionRequest: async (listingId: string, planName: string, price: number) => {
    try {
      return await fetchApi<PromotionRequest>('/api/promotions', {
        method: 'POST',
        body: JSON.stringify({ listing_id: listingId, plan_name: planName, price })
      });
    } catch (err) {
      console.warn("API unavailable, fallback to memory database:", err);
    }

    const requests = db.getPromotionRequests();
    const newReq: PromotionRequest = {
      id: 'promo-' + Math.random().toString(36).substr(2, 9),
      listing_id: listingId,
      plan_name: planName,
      price: price,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    requests.unshift(newReq);
    db.savePromotionRequests(requests);
    return newReq;
  },
  updatePromotionRequestStatus: async (id: string, status: PromotionRequest['status']) => {
    try {
      return await fetchApi<PromotionRequest>(`/api/promotions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.warn("API unavailable, fallback to memory database:", err);
    }

    const requests = db.getPromotionRequests();
    const idx = requests.findIndex(r => r.id === id);
    if (idx !== -1) {
      requests[idx].status = status;
      db.savePromotionRequests(requests);

      if (status === 'active') {
        const listings = db.getListings();
        const lIdx = listings.findIndex(l => l.id === requests[idx].listing_id);
        if (lIdx !== -1) {
          listings[lIdx].is_promoted = true;
          db.saveListings(listings);
        }
      }
      return requests[idx];
    }
    throw new Error('Promotion request not found');
  }
};
