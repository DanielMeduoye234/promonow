'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api, Listing, Profile, supabase } from '@/lib/supabase';
import {
  CheckCircle2,
  ChevronRight,
  Download,
  User,
  Loader2,
  TrendingUp,
  Zap,
  KeyRound,
  Copy
} from 'lucide-react';

export default function ListingDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  // Direct Paystack purchase state
  const [stockCount, setStockCount] = useState<number | null>(null);
  const [buying, setBuying] = useState(false);
  const [boughtCredentials, setBoughtCredentials] = useState('');
  const [buyError, setBuyError] = useState('');
  const [paymentEmail, setPaymentEmail] = useState('');
  const [paymentComplete, setPaymentComplete] = useState(false);

  useEffect(() => {
    // Get listing details
    api.getListingById(id).then(data => {
      if (data) {
        setListing(data);
        // Get seller details
        api.getProfileById(data.seller_id).then(prof => {
          if (prof) setSeller(prof);
        });
        // How many pre-loaded units are available for instant delivery?
        api.getStockCount(data.id)
          .then(res => setStockCount(res.available))
          .catch(() => setStockCount(0));
      }
      setLoading(false);
    });

    const savedUser = localStorage.getItem('promonow_current_user');
    if (savedUser) {
      Promise.resolve(savedUser).then(value => setCurrentUser(JSON.parse(value)));
    }

    supabase?.auth.getUser().then(({ data }) => {
      if (data.user?.email) setPaymentEmail(data.user.email);
    });

    const query = new URLSearchParams(window.location.search);
    const reference = query.get('reference') || query.get('trxref');
    if (reference?.startsWith('buy_')) {
      api.verifyListingPayment(reference)
        .then(result => {
          if (result.status === 'success') {
            setPaymentComplete(true);
            setBoughtCredentials(result.credentials || '');
            setStockCount(count => count === null ? null : Math.max(0, count - 1));
            window.history.replaceState({}, '', `/marketplace/${id}`);
          } else {
            setBuyError(`Payment status: ${result.status}`);
          }
        })
        .catch(error => setBuyError(error instanceof Error ? error.message : 'Payment verification failed'))
        .finally(() => setBuying(false));
    }
  }, [id]);

  const handlePaystackPayment = async () => {
    if (!listing) return;
    setBuyError('');
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }
    if (!paymentEmail.trim()) {
      setBuyError('Enter the email address where Paystack should send your receipt.');
      return;
    }
    setBuying(true);
    try {
      const callbackUrl = `${window.location.origin}/marketplace/${listing.id}`;
      const res = await api.startListingPayment(currentUser.id, listing.id, paymentEmail, callbackUrl);
      window.location.assign(res.authorization_url);
    } catch (err) {
      setBuyError(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc]">
        <Loader2 className="w-8 h-8 text-[#4800b2] animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#f7f9fc]">
        <Navbar />
        <div className="text-center py-20">
          <h2 className="font-space font-black text-2xl text-[#191c1e]">Listing Not Found</h2>
          <p className="text-[#7a7488] mt-2">The digital asset you are looking for does not exist or has been removed.</p>
          <Link href="/marketplace" className="inline-block mt-6 bg-[#4800b2] text-white px-6 py-2 rounded-xl text-xs font-space font-bold tracking-wider">
            Back to Marketplace
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="pt-24 pb-20 px-4 md:px-12 max-w-[1280px] mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-[#7a7488] font-space font-bold text-[10px] uppercase tracking-wider">
          <Link href="/marketplace" className="hover:text-[#4800b2]">Marketplace</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/marketplace?platform=${listing.platform}`} className="hover:text-[#4800b2] capitalize">{listing.platform}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#191c1e]">{listing.handle}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Details Block */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Hero Profile Details Card */}
            <section className="bg-white border border-[#cbc3d9]/40 p-6 md:p-8 rounded-2xl shadow-xs">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-start gap-6">
                  {/* Avatar wrapper */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4800b2] to-[#006a60] flex items-center justify-center text-white font-space font-black text-2xl shadow-md border-4 border-white shrink-0">
                    {listing.platform.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="font-space font-black text-2xl md:text-3xl text-[#191c1e]">{listing.handle}</h1>
                      {listing.verification_status === 'verified' && (
                        <CheckCircle2 className="w-5 h-5 text-[#006f64] fill-emerald-50" />
                      )}
                    </div>
                    <p className="text-sm text-[#494456] font-medium mb-4">{listing.category}</p>
                    <div className="flex flex-wrap gap-2">
                      {listing.aged_year && (
                        <span className="bg-[#4800b2]/5 text-[#4800b2] px-3 py-1 rounded-full text-[10px] font-space font-bold border border-[#4800b2]/10">
                          Aged {listing.aged_year}
                        </span>
                      )}
                      {listing.og_email_included && (
                        <span className="bg-[#006a60]/5 text-[#006a60] px-3 py-1 rounded-full text-[10px] font-space font-bold border border-[#006a60]/10">
                          OG Email Included
                        </span>
                      )}
                      {listing.instant_delivery && (
                        <span className="bg-emerald-50 text-[#006f64] px-3 py-1 rounded-full text-[10px] font-space font-bold border border-emerald-100">
                          Instant Delivery
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-[#f7f9fc] p-4 rounded-xl border border-[#cbc3d9]/40 min-w-[160px] text-right md:text-right">
                  <p className="text-[10px] uppercase font-space font-bold text-[#7a7488] mb-1">Listing Price</p>
                  <p className="font-space font-black text-2xl md:text-3xl text-[#4800b2]">₦{listing.price.toLocaleString()}</p>
                  <p className="text-[10px] text-[#006f64] font-bold mt-1">Pay securely with Paystack</p>
                </div>
              </div>

              {/* Description */}
              <div className="mt-8 pt-6 border-t border-[#cbc3d9]/20">
                <h3 className="font-space font-extrabold text-sm text-[#191c1e] mb-2">Listing Description</h3>
                <p className="text-sm text-[#494456] leading-relaxed">{listing.description}</p>
              </div>
            </section>

            {/* Metrics Bento Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-[#cbc3d9]/40 p-6 rounded-2xl text-center shadow-xs">
                <p className="text-[#7a7488] font-space font-bold text-[10px] uppercase tracking-wider mb-2">Followers</p>
                <p className="font-space font-black text-2xl text-[#191c1e]">{listing.followers.toLocaleString()}</p>
                <span className="inline-flex items-center gap-0.5 text-xs text-[#006a60] mt-2 font-space font-bold">
                  <TrendingUp className="w-3 h-3" /> Organic Growth
                </span>
              </div>
              <div className="bg-white border border-[#cbc3d9]/40 p-6 rounded-2xl text-center shadow-xs">
                <p className="text-[#7a7488] font-space font-bold text-[10px] uppercase tracking-wider mb-2">Engagement Rate</p>
                <p className="font-space font-black text-2xl text-[#191c1e]">{listing.engagement_rate}%</p>
                <span className="text-xs text-[#4800b2] mt-2 font-space font-bold block">High for Niche</span>
              </div>
              <div className="bg-white border border-[#cbc3d9]/40 p-6 rounded-2xl text-center shadow-xs">
                <p className="text-[#7a7488] font-space font-bold text-[10px] uppercase tracking-wider mb-2">Avg. Likes</p>
                <p className="font-space font-black text-2xl text-[#191c1e]">{listing.avg_likes.toLocaleString()}</p>
                <span className="text-xs text-[#7a7488] mt-2 font-space font-bold block">Per Post</span>
              </div>
            </section>

            {/* Demographics Graphs */}
            <section className="bg-white border border-[#cbc3d9]/40 rounded-2xl overflow-hidden shadow-xs">
              <div className="border-b border-[#cbc3d9]/20 p-6 flex justify-between items-center bg-[#f7f9fc]">
                <h2 className="font-space font-black text-base text-[#191c1e]">Audience Demographics</h2>
                <button className="text-[#4800b2] font-space font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer">
                  <Download className="w-3.5 h-3.5" /> Export Report
                </button>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Locations */}
                <div>
                  <h3 className="font-space font-bold text-xs text-[#7a7488] uppercase tracking-wider mb-6">Top Locations</h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-space font-bold text-[#191c1e]">
                        <span>United States</span>
                        <span>42%</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#f2f4f7] rounded-full overflow-hidden">
                        <div className="bg-[#4800b2] h-full" style={{ width: '42%' }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-space font-bold text-[#191c1e]">
                        <span>United Kingdom</span>
                        <span>18%</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#f2f4f7] rounded-full overflow-hidden">
                        <div className="bg-[#006a60] h-full" style={{ width: '18%' }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-space font-bold text-[#191c1e]">
                        <span>Canada</span>
                        <span>12%</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#f2f4f7] rounded-full overflow-hidden">
                        <div className="bg-[#4800b2] opacity-60 h-full" style={{ width: '12%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Age & Gender */}
                <div>
                  <h3 className="font-space font-bold text-xs text-[#7a7488] uppercase tracking-wider mb-6">Age & Gender</h3>
                  <div className="flex items-end justify-between h-32 gap-3 mb-4">
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-full bg-[#006a60]/20 rounded-t-lg h-[30%]" />
                      <span className="text-[10px] font-space font-bold mt-2 text-[#7a7488]">13-17</span>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-full bg-[#4800b2] rounded-t-lg h-[85%]" />
                      <span className="text-[10px] font-space font-bold mt-2 text-[#7a7488]">18-24</span>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-full bg-[#4800b2] rounded-t-lg h-[70%]" />
                      <span className="text-[10px] font-space font-bold mt-2 text-[#7a7488]">25-34</span>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-full bg-[#006a60]/20 rounded-t-lg h-[40%]" />
                      <span className="text-[10px] font-space font-bold mt-2 text-[#7a7488]">35-44</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-[#4800b2] rounded-full" />
                      <span className="text-xs text-[#494456] font-medium">65% Female</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-[#006a60]/30 rounded-full border border-[#006a60]/20" />
                      <span className="text-xs text-[#494456] font-medium">35% Male</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Purchase Sidebar */}
          <aside className="lg:col-span-4 space-y-6">

            {/* Direct Paystack purchase */}
            {stockCount !== null && (
              <section className="bg-white border-2 border-[#006a60]/30 p-6 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-space font-black text-base text-[#191c1e] flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#006a60]" /> Pay directly
                  </h2>
                  <span className={`text-[10px] font-space font-bold px-2.5 py-0.5 rounded-full ${
                    stockCount > 0 ? 'bg-emerald-50 text-[#006f64]' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {stockCount > 0 ? `${stockCount} in stock` : 'Out of stock'}
                  </span>
                </div>

                {paymentComplete ? (
                  <div className="space-y-3">
                    <div className="bg-emerald-50 border border-emerald-100 text-[#006f64] text-xs p-3 rounded-xl font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Payment confirmed. Your purchase is complete.
                    </div>
                    {boughtCredentials && (
                      <div className="bg-[#f2f4f7] rounded-xl p-3 flex items-start justify-between gap-2">
                        <code className="text-[11px] text-[#191c1e] break-all font-mono whitespace-pre-wrap">{boughtCredentials}</code>
                        <button
                          onClick={() => navigator.clipboard?.writeText(boughtCredentials)}
                          title="Copy credentials"
                          className="p-1.5 rounded-lg hover:bg-[#e6e9ee] text-[#494456] shrink-0 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <p className="text-[10px] text-[#7a7488]">Purchase details are also saved in your profile.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-[#494456] mb-4">
                      Pay exactly <span className="font-space font-bold text-[#191c1e]">₦{listing.price.toLocaleString()}</span> through Paystack. No wallet top-up or escrow fee.
                    </p>
                    {buyError && (
                      <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl font-medium mb-3">
                        ⚠️ {buyError}
                      </div>
                    )}
                    <label htmlFor="payment-email" className="block text-[11px] font-space font-bold text-[#494456] mb-1.5">Paystack receipt email</label>
                    <input
                      id="payment-email"
                      type="email"
                      value={paymentEmail}
                      onChange={event => setPaymentEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="w-full mb-3 rounded-xl border border-[#cbc3d9] bg-white px-3.5 py-3 text-sm text-[#191c1e] outline-none focus:border-[#006a60] focus:ring-2 focus:ring-[#006a60]/15"
                    />
                    <button
                      onClick={handlePaystackPayment}
                      disabled={buying || (listing.instant_delivery && stockCount === 0)}
                      className="w-full py-3.5 bg-[#006a60] text-white font-space font-bold text-sm tracking-wider rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {buying ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Opening Paystack...</>
                      ) : (
                        <><KeyRound className="w-4 h-4" /> Pay with Paystack — ₦{listing.price.toLocaleString()}</>
                      )}
                    </button>
                    <p className="text-center text-[10px] text-[#7a7488] mt-2 font-medium">Secure checkout and receipt provided by Paystack</p>
                  </>
                )}
              </section>
            )}

            {/* Seller Reputation Info */}
            {seller && (
              <section className="bg-white border border-[#cbc3d9]/40 p-6 rounded-2xl shadow-xs">
                <h3 className="font-space font-bold text-xs uppercase tracking-wider text-[#7a7488] mb-4">Seller Information</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-11 h-11 rounded-full bg-[#4800b2]/10 flex items-center justify-center text-[#4800b2]">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-space font-bold text-sm text-[#191c1e]">{seller.username}</p>
                    <p className="text-[10px] text-[#7a7488]">Member since 2021</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-[#f7f9fc] rounded-xl border border-[#cbc3d9]/20">
                    <p className="text-[9px] uppercase font-space font-bold text-[#7a7488]">Reputation</p>
                    <p className="font-space font-black text-sm text-[#006f64]">{seller.reputation}%</p>
                  </div>
                  <div className="p-3 bg-[#f7f9fc] rounded-xl border border-[#cbc3d9]/20">
                    <p className="text-[9px] uppercase font-space font-bold text-[#7a7488]">Sales Count</p>
                    <p className="font-space font-black text-sm text-[#191c1e]">{seller.sales_count}</p>
                  </div>
                </div>
              </section>
            )}

          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
