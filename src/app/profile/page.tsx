'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AccountCard from '@/components/AccountCard';
import { db, api, Listing, Profile, Transaction, PromotionRequest, Deliverable } from '@/lib/supabase';
import {
  User,
  Award,
  ShoppingBag,
  Sparkles,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  FolderHeart,
  Plus,
  X,
  KeyRound,
  Copy
} from 'lucide-react';
import Link from 'next/link';

export default function UserProfile() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myPurchases, setMyPurchases] = useState<Transaction[]>([]);
  const [promoRequests, setPromoRequests] = useState<PromotionRequest[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  
  // Promotion form modal states
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'Verified Premium' | 'Elite Broker Placement'>('Verified Premium');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const loadData = async (userId: string) => {
    try {
      const allListings = await api.getListings();
      // Filter listings owned by the current user
      setMyListings(allListings.filter(l => l.seller_id === userId));

      const allTxs = await api.getTransactions();
      // Filter transactions where current user is the buyer
      setMyPurchases(allTxs.filter(t => t.buyer_id === userId));

      const allPromos = await api.getPromotionRequests();
      setPromoRequests(allPromos);

      try {
        const delivered = await api.getDeliverables(userId);
        setDeliverables(delivered);
      } catch {
        setDeliverables([]);
      }
    } catch (err) {
      console.error("Error loading user profile data:", err);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('promonow_current_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser) as Profile;
      setCurrentUser(parsed);
      loadData(parsed.id);
    }
  }, []);

  const handleCreatePromoRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;

    setModalLoading(true);
    setModalError('');
    setModalSuccess('');

    const planPrice = selectedPlan === 'Verified Premium' ? 15000 : 50000; // Naira prices

    try {
      await api.createPromotionRequest(selectedListing.id, selectedPlan, planPrice);
      setModalSuccess(`Promotion request placed successfully for ${selectedListing.handle}!`);
      
      if (currentUser) {
        await loadData(currentUser.id);
      }

      setTimeout(() => {
        setSelectedListing(null);
        setModalSuccess('');
      }, 2000);
    } catch (err: any) {
      setModalError(err.message || 'Failed to request promotion');
    } finally {
      setModalLoading(false);
    }
  };

  const getListingPromoStatus = (listingId: string) => {
    const request = promoRequests.find(r => r.listing_id === listingId);
    if (!request) return 'None';
    return request.status === 'active' ? '★ Active' : 'Pending Approval';
  };

  if (!currentUser) {
    return (
      <>
        <Navbar />
        <main className="min-h-[75vh] flex items-center justify-center pt-24 bg-[#f7f9fc]">
          <div className="text-center space-y-4">
            <p className="text-sm text-[#7a7488]">Please sign in to view your profile.</p>
            <Link href="/login" className="inline-block bg-[#4800b2] text-white px-6 py-2.5 rounded-xl font-space font-bold text-xs">
              Go to Login
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="pt-24 pb-20 px-4 md:px-12 max-w-[1280px] mx-auto space-y-10">
        
        {/* Profile Card Header */}
        <section className="bg-white border border-[#cbc3d9]/40 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#4800b2]/10 text-[#4800b2] rounded-full flex items-center justify-center border border-[#4800b2]/20">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-space font-black text-2xl text-[#191c1e] flex items-center gap-2">
                {currentUser.username}
                <span className="bg-emerald-50 text-[#006f64] px-2 py-0.5 rounded-full text-[9px] border border-emerald-100 font-bold uppercase">
                  Active Member
                </span>
              </h1>
              <p className="text-xs text-[#7a7488] mt-0.5">Member since {new Date(currentUser.created_at || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex gap-6 border-t md:border-t-0 md:border-l border-[#cbc3d9]/20 pt-4 md:pt-0 md:pl-8 w-full md:w-auto">
            <div className="space-y-0.5">
              <span className="text-[10px] text-[#7a7488] font-space font-bold uppercase tracking-wider block">Seller Rep</span>
              <div className="flex items-center gap-1 font-space font-black text-lg text-emerald-600">
                <Award className="w-4 h-4" /> {currentUser.reputation}%
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-[#7a7488] font-space font-bold uppercase tracking-wider block">Total Sales</span>
              <div className="font-space font-black text-lg text-[#191c1e]">
                {currentUser.sales_count} Accounts
              </div>
            </div>
          </div>
        </section>

        {/* Purchased Deliverables — instant-delivery credentials */}
        {deliverables.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="font-space font-black text-xl text-[#191c1e] flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#006a60]" /> My Purchased Accounts
              </h2>
              <p className="text-xs text-[#7a7488] mt-0.5">Credentials are delivered instantly after purchase. Keep them safe.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {deliverables.map(d => (
                <div key={d.id} className="bg-white border border-[#006a60]/30 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-space font-bold text-xs uppercase tracking-wider text-[#006a60] bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      {d.listing?.platform || 'account'}
                    </span>
                    <span className="text-[10px] text-[#7a7488]">{new Date(d.sold_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-space font-black text-base text-[#191c1e]">{d.listing?.handle || 'Purchased account'}</h3>
                  <div className="bg-[#f2f4f7] rounded-xl p-3 flex items-start justify-between gap-2">
                    <code className="text-[11px] text-[#191c1e] break-all font-mono whitespace-pre-wrap">{d.credentials}</code>
                    <button
                      onClick={() => navigator.clipboard?.writeText(d.credentials)}
                      title="Copy credentials"
                      className="p-1.5 rounded-lg hover:bg-[#e6e9ee] text-[#494456] shrink-0 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Promotion Action Hub */}
        <section className="space-y-4">
          <div>
            <h2 className="font-space font-black text-xl text-[#191c1e]">Promote Your Platforms</h2>
            <p className="text-xs text-[#7a7488] mt-0.5">Select from your listed platforms below to boost them to featured ranking slots.</p>
          </div>

          {myListings.length === 0 ? (
            <div className="bg-white border border-dashed border-[#cbc3d9] rounded-2xl p-8 text-center text-xs text-[#7a7488] space-y-4">
              <p>You have not listed any digital assets yet. List a page to activate platform promotion controls.</p>
              <Link href="/sell" className="inline-flex items-center gap-1 bg-[#4800b2] text-white px-4 py-2 rounded-xl font-space font-bold text-xs">
                <Plus className="w-3.5 h-3.5" /> List My First Account
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map(l => (
                <div key={l.id} className="bg-white border border-[#cbc3d9]/40 rounded-2xl p-5 flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-space font-bold text-xs uppercase tracking-wider text-[#4800b2] bg-[#4800b2]/5 px-2.5 py-0.5 rounded-full">{l.platform}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        l.is_promoted ? 'bg-purple-100 text-[#4800b2]' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {getListingPromoStatus(l.id)}
                      </span>
                    </div>
                    <h3 className="font-space font-black text-lg text-[#191c1e]">{l.handle}</h3>
                    <p className="text-xs text-[#7a7488] font-medium">{l.followers.toLocaleString()} Followers • ₦{l.price.toLocaleString()}</p>
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-[#cbc3d9]/20 flex justify-between items-center">
                    <span className="text-[10px] text-neutral-500 font-medium">Verify OGE: {l.og_email_included ? 'Yes' : 'No'}</span>
                    {!l.is_promoted && (
                      <button 
                        onClick={() => setSelectedListing(l)}
                        className="bg-[#4800b2] text-white text-[10px] px-3.5 py-1.5 rounded-lg font-space font-bold cursor-pointer hover:opacity-90 transition-opacity"
                      >
                        Promote Platform
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Listings and Purchases Tabs */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* My Placed Orders */}
          <div className="bg-white border border-[#cbc3d9]/40 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#cbc3d9]/20 bg-[#f7f9fc]">
              <h3 className="font-space font-black text-sm text-[#191c1e] flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#4800b2]" /> Escrow Purchases / Orders
              </h3>
            </div>
            <div className="p-4">
              {myPurchases.length === 0 ? (
                <p className="text-xs text-[#7a7488] text-center py-6">You have not purchased any assets yet.</p>
              ) : (
                <div className="space-y-4">
                  {myPurchases.map(p => (
                    <div key={p.id} className="flex justify-between items-center border border-[#cbc3d9]/20 p-3.5 rounded-xl text-xs">
                      <div>
                        <p className="font-space font-black text-[#191c1e]">{p.id}</p>
                        <p className="text-[10px] text-[#7a7488] mt-0.5">Locked: ₦{p.amount.toLocaleString()} • Fee: ₦{p.escrow_fee.toLocaleString()}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        p.status === 'released' ? 'bg-emerald-50 text-[#006f64]' : 
                        p.status === 'refunded' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* My Listing Portfolio */}
          <div className="bg-white border border-[#cbc3d9]/40 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#cbc3d9]/20 bg-[#f7f9fc]">
              <h3 className="font-space font-black text-sm text-[#191c1e] flex items-center gap-2">
                <FolderHeart className="w-4 h-4 text-[#006a60]" /> Listings Portfolio
              </h3>
            </div>
            <div className="p-4">
              {myListings.length === 0 ? (
                <p className="text-xs text-[#7a7488] text-center py-6">No listings registered under your name.</p>
              ) : (
                <div className="space-y-4">
                  {myListings.map(l => (
                    <div key={l.id} className="flex justify-between items-center border border-[#cbc3d9]/20 p-3.5 rounded-xl text-xs">
                      <div>
                        <p className="font-space font-black text-[#191c1e]">{l.handle}</p>
                        <p className="text-[10px] text-[#7a7488] mt-0.5">{l.platform} • ₦{l.price.toLocaleString()}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        l.status === 'sold' ? 'bg-[#4800b2]/10 text-[#4800b2]' : 'bg-emerald-50 text-[#006f64]'
                      }`}>
                        {l.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </section>

      </main>

      {/* Promotion Request Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-[#cbc3d9]/40 rounded-3xl p-6 max-w-md w-full shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-space font-black text-xl text-[#191c1e]">Boost Platform Reach</h3>
                <p className="text-xs text-[#7a7488] mt-0.5">Send a request to promote {selectedListing.handle}.</p>
              </div>
              <button 
                onClick={() => setSelectedListing(null)}
                className="p-1 hover:bg-[#f2f4f7] rounded-lg text-neutral-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="bg-red-50 text-red-700 text-xs p-3.5 border border-red-100 rounded-xl font-medium">
                ⚠️ {modalError}
              </div>
            )}
            {modalSuccess && (
              <div className="bg-emerald-50 text-[#006f64] text-xs p-3.5 border border-emerald-100 rounded-xl font-medium">
                ✅ {modalSuccess}
              </div>
            )}

            <form onSubmit={handleCreatePromoRequest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block font-space font-bold text-[10px] text-[#7a7488] uppercase tracking-wider">Promotion Plan Tier</label>
                <select 
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value as any)}
                  className="w-full bg-[#f2f4f7] border-none rounded-xl h-11 px-3 font-space text-xs focus:ring-2 focus:ring-[#4800b2]"
                >
                  <option value="Verified Premium">Verified Premium (₦15,000 / mo)</option>
                  <option value="Elite Broker Placement">Elite Broker Placement (₦50,000 / mo)</option>
                </select>
              </div>

              <div className="bg-[#f7f9fc] p-4 rounded-xl text-xs space-y-2 text-[#494456] border border-[#cbc3d9]/20 font-medium">
                <p className="font-bold text-neutral-800">Plan Inclusions:</p>
                {selectedPlan === 'Verified Premium' ? (
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Rank above standard pages in the marketplace grid.</li>
                    <li>Glowing visual frame highlight.</li>
                    <li>Featured badge placement.</li>
                  </ul>
                ) : (
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Rank directly at the top of category lists.</li>
                    <li>Featured placement in sliding headers.</li>
                    <li>Priority escrow auditing and support.</li>
                  </ul>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#cbc3d9]/20">
                <button 
                  type="button"
                  onClick={() => setSelectedListing(null)}
                  className="px-5 py-2.5 rounded-xl border border-[#cbc3d9]/60 font-space font-bold text-xs hover:bg-neutral-50 cursor-pointer text-[#494456]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={modalLoading}
                  className="px-6 py-2.5 bg-[#4800b2] text-white rounded-xl font-space font-bold text-xs hover:opacity-90 cursor-pointer shadow-xs"
                >
                  {modalLoading ? 'Placing Request...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
