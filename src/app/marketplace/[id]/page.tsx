'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api, Listing, Profile, Transaction } from '@/lib/supabase';
import { 
  CheckCircle2, 
  ChevronRight, 
  Download, 
  Heart, 
  MessageCircle, 
  ShieldCheck, 
  User, 
  MessageSquare,
  Globe,
  Loader2,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export default function ListingDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'purchasing' | 'success'>('idle');

  useEffect(() => {
    // Get listing details
    api.getListingById(id).then(data => {
      if (data) {
        setListing(data);
        // Get seller details
        api.getProfileById(data.seller_id).then(prof => {
          if (prof) setSeller(prof);
        });
      }
      setLoading(false);
    });

    // Get current logged-in user simulation
    const savedUser = localStorage.getItem('promonow_current_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, [id]);

  const handleBuyNow = async () => {
    if (!listing || !currentUser) return;
    setPurchaseStatus('purchasing');
    
    // Simulate payment process delay
    setTimeout(async () => {
      try {
        await api.createTransaction(listing.id, currentUser.id);
        setPurchaseStatus('success');
        
        // Refresh listing status
        const updated = await api.getListingById(listing.id);
        if (updated) setListing(updated);
      } catch (err) {
        console.error(err);
        setPurchaseStatus('idle');
      }
    }, 2000);
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

  const escrowFee = Math.round(listing.price * 0.02 * 100) / 100;
  const totalDue = listing.price + escrowFee;

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
                  <p className="text-[10px] text-[#006f64] font-bold mt-1">✓ Escrow Protected</p>
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
            
            {/* Purchase Escrow Card */}
            <section className="bg-[#4800b2] text-white p-8 rounded-2xl shadow-lg border border-[#6200ee] sticky top-24">
              <h2 className="font-space font-black text-xl mb-6">Purchase Asset</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-xs opacity-90">
                  <span>Account Price</span>
                  <span>₦{listing.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs opacity-90">
                  <span>Escrow Fee (2%)</span>
                  <span>₦{escrowFee.toLocaleString()}</span>
                </div>
                <div className="h-[1px] bg-white/20" />
                <div className="flex justify-between items-center font-space font-black text-lg">
                  <span>Total Due</span>
                  <span>₦{totalDue.toLocaleString()}</span>
                </div>
              </div>

              {listing.status === 'active' ? (
                <>
                  {purchaseStatus === 'idle' && (
                    <button 
                      onClick={handleBuyNow}
                      className="w-full py-4 bg-[#4af8e3] text-[#00201c] font-space font-bold text-sm tracking-wider rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4" /> Buy Now via Escrow
                    </button>
                  )}
                  {purchaseStatus === 'purchasing' && (
                    <button 
                      disabled
                      className="w-full py-4 bg-white/20 text-white font-space font-bold text-sm tracking-wider rounded-xl flex items-center justify-center gap-2"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" /> Securing Escrow...
                    </button>
                  )}
                </>
              ) : (
                <button 
                  disabled
                  className="w-full py-4 bg-neutral-700 text-neutral-400 font-space font-bold text-sm tracking-wider rounded-xl flex items-center justify-center gap-2"
                >
                  SOLD / DEPOSIT HELD
                </button>
              )}

              <button className="w-full py-4 mt-3 bg-transparent border border-white/20 text-white font-space font-bold text-xs tracking-wider rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <MessageSquare className="w-4 h-4" /> Negotiate Price
              </button>

              {purchaseStatus === 'success' && (
                <div className="mt-6 bg-emerald-950/40 border border-[#4af8e3] p-4 rounded-xl text-center text-[#4af8e3] font-space text-xs">
                  <p className="font-bold mb-1">🎉 Escrow Lock Initiated!</p>
                  <p className="opacity-90">Total funds of ₦{totalDue.toLocaleString()} locked. Check your email or simulated console to verify transfer.</p>
                </div>
              )}

              <div className="mt-8 flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <ShieldCheck className="w-8 h-8 text-[#4af8e3] shrink-0" />
                <p className="text-[10px] leading-tight text-[#cbc3d9]">
                  Payment held in secure PromoNow escrow until transfer is verified by the buyer.
                </p>
              </div>
            </section>

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
