'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { db, api, Listing, Profile, Transaction, PromotionRequest, GrowthRequest } from '@/lib/supabase';
import {
  ShieldAlert,
  Check,
  X,
  Trash2,
  DollarSign,
  FileCheck,
  Briefcase,
  Users,
  TrendingUp,
  RefreshCcw,
  PlusCircle,
  Rocket
} from 'lucide-react';

export default function AdminConsole() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [promoRequests, setPromoRequests] = useState<PromotionRequest[]>([]);
  const [growthRequests, setGrowthRequests] = useState<GrowthRequest[]>([]);
  
  // Loading & Action feedback state
  const [actionLoading, setActionLoading] = useState(false);

  // New listing form state
  const [showListForm, setShowListForm] = useState(false);
  const [newPlatform, setNewPlatform] = useState<'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'twitter'>('instagram');
  const [newHandle, setNewHandle] = useState('');
  const [newFollowers, setNewFollowers] = useState('');
  const [newER, setNewER] = useState('');
  const [newLikes, setNewLikes] = useState('');
  const [newCategory, setNewCategory] = useState('Fashion & Lifestyle');
  const [newPrice, setNewPrice] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAged, setNewAged] = useState('');
  const [newRegion, setNewRegion] = useState('USA');
  const [newOgEmail, setNewOgEmail] = useState(false);
  const [newDelivery, setNewDelivery] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const loadData = async () => {
    try {
      const list = await api.getListings();
      setListings(list);
      const txs = await api.getTransactions();
      setTransactions(txs);
      const profs = await api.getProfiles();
      setProfiles(profs);
      const promos = await api.getPromotionRequests();
      setPromoRequests(promos);
      const growth = await api.getGrowthRequests();
      setGrowthRequests(growth);
    } catch (e) {
      console.error("Error loading admin data:", e);
    }
  };

  useEffect(() => {
    // Load currentUser
    const savedUser = localStorage.getItem('promonow_current_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    loadData();
  }, []);

  const handleApproveListing = async (id: string) => {
    setActionLoading(true);
    try {
      await api.updateListingStatus(id, 'active', 'verified');
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectListing = async (id: string) => {
    setActionLoading(true);
    try {
      await api.updateListingStatus(id, 'pending', 'rejected');
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePromotion = async (id: string) => {
    setActionLoading(true);
    try {
      await api.toggleListingPromotion(id);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprovePromotion = async (id: string) => {
    setActionLoading(true);
    try {
      await api.updatePromotionRequestStatus(id, 'active');
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateGrowthRequest = async (id: string, status: GrowthRequest['status']) => {
    setActionLoading(true);
    try {
      await api.updateGrowthRequestStatus(id, status);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHandle || !newFollowers || !newPrice) {
      setFormError('Please fill in required fields.');
      return;
    }
    
    setActionLoading(true);
    setFormError('');
    setFormSuccess('');
    
    try {
      await api.createListing({
        platform: newPlatform,
        handle: newHandle,
        followers: parseInt(newFollowers),
        engagement_rate: parseFloat(newER) || 0.0,
        avg_likes: parseInt(newLikes) || 0,
        category: newCategory,
        price: parseFloat(newPrice),
        description: newDescription,
        audience_region: newRegion,
        aged_year: parseInt(newAged) || undefined,
        og_email_included: newOgEmail,
        instant_delivery: newDelivery,
        seller_id: currentUser?.id || 'a7620e7a-9a99-467f-94d3-059929ccf0c1',
        seller: currentUser ? {
          id: currentUser.id,
          username: currentUser.username,
          is_admin: currentUser.is_admin
        } : undefined,
        status: 'active',
        verification_status: 'verified'
      });
      
      setFormSuccess('Listing created successfully!');
      setNewHandle('');
      setNewFollowers('');
      setNewER('');
      setNewLikes('');
      setNewPrice('');
      setNewDescription('');
      setNewAged('');
      setNewOgEmail(false);
      setNewDelivery(false);
      
      await loadData();
      
      setTimeout(() => {
        setShowListForm(false);
        setFormSuccess('');
      }, 2000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create listing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReleaseEscrow = async (id: string) => {
    setActionLoading(true);
    try {
      await api.updateTransactionStatus(id, 'released');
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefundBuyer = async (id: string) => {
    setActionLoading(true);
    try {
      await api.updateTransactionStatus(id, 'refunded');
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // If user is not admin, block access — admin access is granted only
  // by signing in with an administrator account.
  if (!currentUser?.is_admin) {
    return (
      <>
        <Navbar />
        <main className="min-h-[70vh] flex items-center justify-center pt-24 px-4 bg-[#f7f9fc]">
          <div className="bg-white border border-[#cbc3d9]/40 p-8 md:p-12 rounded-2xl max-w-md w-full text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto border border-red-100 animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-space font-black text-xl text-[#191c1e]">Admin Privileges Required</h2>
              <p className="text-xs text-[#494456] leading-relaxed">
                You are currently logged in as <strong className="text-[#4800b2]">{currentUser?.username || 'Guest'}</strong>. Only authorized administrators can view the dashboard.
              </p>
            </div>

            <a
              href="/login"
              className="inline-block w-full py-3 bg-[#4800b2] text-white font-space font-bold text-xs tracking-wider rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
            >
              Sign In with an Admin Account
            </a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Calculate metrics
  const totalVolume = transactions
    .filter(t => t.status === 'released' || t.status === 'held_in_escrow')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFees = transactions
    .filter(t => t.status === 'released')
    .reduce((sum, t) => sum + t.escrow_fee, 0);

  const pendingListings = listings.filter(l => l.verification_status === 'pending');

  return (
    <>
      <Navbar />

      <main className="pt-24 pb-20 px-4 md:px-12 max-w-[1280px] mx-auto space-y-10">
        
        {/* Header Title */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#cbc3d9]/20 pb-6">
          <div>
            <h1 className="font-space font-black text-3xl md:text-5xl text-[#191c1e]">Admin Console</h1>
            <p className="text-xs text-[#7a7488] font-medium mt-1">Platform management, transaction escrows, and audits.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowListForm(!showListForm)}
              className="flex items-center gap-1.5 text-xs font-space font-bold bg-[#4800b2] text-white px-4 py-2.5 rounded-xl hover:opacity-90 cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4" /> {showListForm ? "Hide Form" : "List New Account"}
            </button>
            <button 
              onClick={loadData}
              className="flex items-center gap-1 text-xs font-space font-bold text-[#494456] border border-[#cbc3d9]/60 px-4 py-2.5 rounded-xl hover:bg-neutral-50 cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Refresh Data
            </button>
          </div>
        </section>

        {/* Admin Quick List Form */}
        {showListForm && (
          <section className="bg-white border border-[#4800b2]/30 rounded-2xl p-6 shadow-xs animate-in fade-in slide-in-from-top-4 duration-200">
            <h2 className="font-space font-black text-lg text-[#191c1e] mb-1 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#4800b2]" /> Admin Listing Registrar
            </h2>
            <p className="text-xs text-[#7a7488] mb-6">Create a verified, active social asset page listing immediately on the marketplace.</p>

            {formError && (
              <div className="bg-red-50 text-red-700 text-xs border border-red-100 p-3.5 rounded-xl mb-4 font-medium">
                ⚠️ {formError}
              </div>
            )}
            {formSuccess && (
              <div className="bg-emerald-50 text-[#006f64] text-xs border border-emerald-100 p-3.5 rounded-xl mb-4 font-medium">
                ✅ {formSuccess}
              </div>
            )}

            <form onSubmit={handleAdminCreateListing} className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1">
                <label className="block font-space font-bold text-[10px] text-[#7a7488] uppercase tracking-wider">Social Platform</label>
                <select 
                  value={newPlatform} 
                  onChange={(e) => setNewPlatform(e.target.value as any)}
                  className="w-full bg-[#f2f4f7] border-none rounded-xl h-10 px-3 font-space text-xs focus:ring-2 focus:ring-[#4800b2]"
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="facebook">Facebook</option>
                  <option value="youtube">YouTube</option>
                  <option value="twitter">Twitter / X</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-space font-bold text-[10px] text-[#7a7488] uppercase tracking-wider">Username Handle</label>
                <input 
                  type="text" 
                  placeholder="e.g. @meme_empire" 
                  value={newHandle}
                  onChange={(e) => setNewHandle(e.target.value)}
                  className="w-full bg-[#f2f4f7] border-none rounded-xl h-10 px-3 font-space text-xs focus:ring-2 focus:ring-[#4800b2]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-space font-bold text-[10px] text-[#7a7488] uppercase tracking-wider">Followers Count</label>
                <input 
                  type="number" 
                  placeholder="e.g. 150000" 
                  value={newFollowers}
                  onChange={(e) => setNewFollowers(e.target.value)}
                  className="w-full bg-[#f2f4f7] border-none rounded-xl h-10 px-3 font-space text-xs focus:ring-2 focus:ring-[#4800b2]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-space font-bold text-[10px] text-[#7a7488] uppercase tracking-wider">Price (USD)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 2400" 
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full bg-[#f2f4f7] border-none rounded-xl h-10 px-3 font-space text-xs focus:ring-2 focus:ring-[#4800b2]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-space font-bold text-[10px] text-[#7a7488] uppercase tracking-wider">Engagement Rate (%)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 4.82" 
                  value={newER}
                  onChange={(e) => setNewER(e.target.value)}
                  className="w-full bg-[#f2f4f7] border-none rounded-xl h-10 px-3 font-space text-xs focus:ring-2 focus:ring-[#4800b2]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-space font-bold text-[10px] text-[#7a7488] uppercase tracking-wider">Average Likes</label>
                <input 
                  type="number" 
                  placeholder="e.g. 4500" 
                  value={newLikes}
                  onChange={(e) => setNewLikes(e.target.value)}
                  className="w-full bg-[#f2f4f7] border-none rounded-xl h-10 px-3 font-space text-xs focus:ring-2 focus:ring-[#4800b2]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-space font-bold text-[10px] text-[#7a7488] uppercase tracking-wider">Niche Category</label>
                <input 
                  type="text" 
                  placeholder="e.g. Tech & Unboxing" 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-[#f2f4f7] border-none rounded-xl h-10 px-3 font-space text-xs focus:ring-2 focus:ring-[#4800b2]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-space font-bold text-[10px] text-[#7a7488] uppercase tracking-wider">Aged Year</label>
                <input 
                  type="number" 
                  placeholder="e.g. 2019" 
                  value={newAged}
                  onChange={(e) => setNewAged(e.target.value)}
                  className="w-full bg-[#f2f4f7] border-none rounded-xl h-10 px-3 font-space text-xs focus:ring-2 focus:ring-[#4800b2]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-space font-bold text-[10px] text-[#7a7488] uppercase tracking-wider">Audience Region</label>
                <input 
                  type="text" 
                  placeholder="e.g. USA / Global" 
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  className="w-full bg-[#f2f4f7] border-none rounded-xl h-10 px-3 font-space text-xs focus:ring-2 focus:ring-[#4800b2]"
                />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="block font-space font-bold text-[10px] text-[#7a7488] uppercase tracking-wider">Asset Description</label>
                <textarea 
                  placeholder="Describe the audience demographic, collaboration history, or key verification factors..." 
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#f2f4f7] border-none rounded-xl p-3.5 h-20 font-space text-xs focus:ring-2 focus:ring-[#4800b2] resize-none"
                />
              </div>

              <div className="md:col-span-3 flex flex-wrap gap-6 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={newOgEmail} 
                    onChange={(e) => setNewOgEmail(e.target.checked)}
                    className="rounded text-[#4800b2] focus:ring-[#4800b2]" 
                  />
                  <span className="font-space text-xs text-[#494456] font-medium">Original Email (OGE) Included</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={newDelivery} 
                    onChange={(e) => setNewDelivery(e.target.checked)}
                    className="rounded text-[#4800b2] focus:ring-[#4800b2]" 
                  />
                  <span className="font-space text-xs text-[#494456] font-medium">Instant Escrow Release Ready</span>
                </label>
              </div>

              <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t border-[#cbc3d9]/20">
                <button 
                  type="button"
                  onClick={() => setShowListForm(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#cbc3d9]/60 font-space font-bold text-xs hover:bg-neutral-50 cursor-pointer text-[#494456]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-[#4800b2] text-white rounded-xl font-space font-bold text-xs hover:opacity-90 cursor-pointer shadow-xs"
                >
                  {actionLoading ? "Registering..." : "Submit Listing"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-[#cbc3d9]/40 p-6 rounded-2xl shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase font-space font-bold text-[#7a7488] tracking-wider mb-1">Escrow Volume</p>
                <h3 className="font-space font-black text-2xl text-[#191c1e]">₦{totalVolume.toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-[#006a60]/10 text-[#006a60] rounded-xl"><DollarSign className="w-5 h-5" /></div>
            </div>
            <span className="text-[10px] text-[#006f64] font-bold flex items-center gap-1 mt-4">
              <TrendingUp className="w-3.5 h-3.5" /> Held or Released
            </span>
          </div>

          <div className="bg-white border border-[#cbc3d9]/40 p-6 rounded-2xl shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase font-space font-bold text-[#7a7488] tracking-wider mb-1">Fees Collected</p>
                <h3 className="font-space font-black text-2xl text-[#191c1e]">₦{totalFees.toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-[#4800b2]/10 text-[#4800b2] rounded-xl"><FileCheck className="w-5 h-5" /></div>
            </div>
            <span className="text-[10px] text-[#4800b2] font-bold flex items-center gap-1 mt-4">
              2% Fee Release rate
            </span>
          </div>

          <div className="bg-white border border-[#cbc3d9]/40 p-6 rounded-2xl shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase font-space font-bold text-[#7a7488] tracking-wider mb-1">Pending Audit</p>
                <h3 className="font-space font-black text-2xl text-[#191c1e]">{pendingListings.length}</h3>
              </div>
              <div className="p-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-100"><Briefcase className="w-5 h-5" /></div>
            </div>
            <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1 mt-4">
              Requires immediate action
            </span>
          </div>

          <div className="bg-white border border-[#cbc3d9]/40 p-6 rounded-2xl shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase font-space font-bold text-[#7a7488] tracking-wider mb-1">Total Users</p>
                <h3 className="font-space font-black text-2xl text-[#191c1e]">{profiles.length}</h3>
              </div>
              <div className="p-2 bg-[#f2f4f7] text-[#191c1e] rounded-xl"><Users className="w-5 h-5" /></div>
            </div>
            <span className="text-[10px] text-[#7a7488] font-bold flex items-center gap-1 mt-4">
              Simulated database size
            </span>
          </div>
        </section>

        {/* Listings Verification Queue */}
        <section className="bg-white border border-[#cbc3d9]/40 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-6 border-b border-[#cbc3d9]/20 bg-[#f7f9fc]">
            <h2 className="font-space font-black text-base text-[#191c1e]">Listing Audits / Queue</h2>
            <p className="text-xs text-[#7a7488] mt-0.5">Approve or deny new user accounts listed on the market.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#cbc3d9]/20 text-[10px] uppercase tracking-wider text-[#7a7488] font-space font-bold bg-[#f7f9fc]/50">
                  <th className="py-3 px-6">Handle</th>
                  <th className="py-3 px-6">Platform</th>
                  <th className="py-3 px-6">Followers</th>
                  <th className="py-3 px-6">Price</th>
                  <th className="py-3 px-6">Audit Status</th>
                  <th className="py-3 px-6">Promotion</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cbc3d9]/10 text-xs font-medium">
                {listings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#7a7488]">No listings currently on the database.</td>
                  </tr>
                ) : (
                  listings.map(l => (
                    <tr key={l.id} className="hover:bg-[#f7f9fc]/30">
                      <td className="py-4 px-6 font-bold text-[#191c1e]">{l.handle}</td>
                      <td className="py-4 px-6 capitalize">{l.platform}</td>
                      <td className="py-4 px-6 font-space font-bold">{l.followers.toLocaleString()}</td>
                      <td className="py-4 px-6 font-space font-bold text-[#4800b2]">₦{l.price.toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          l.verification_status === 'verified' ? 'bg-emerald-50 text-[#006f64]' : 
                          l.verification_status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'
                        }`}>
                          {l.verification_status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          l.is_promoted ? 'bg-purple-100 text-[#4800b2] border border-purple-200' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {l.is_promoted ? '★ Promoted' : 'Standard'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {l.verification_status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApproveListing(l.id)}
                              disabled={actionLoading}
                              className="bg-emerald-50 hover:bg-emerald-100 text-[#006f64] px-3 py-1.5 rounded-lg font-space font-bold text-[10px] cursor-pointer"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleRejectListing(l.id)}
                              disabled={actionLoading}
                              className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg font-space font-bold text-[10px] cursor-pointer"
                            >
                              Deny
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleTogglePromotion(l.id)}
                          disabled={actionLoading}
                          className="bg-purple-50 hover:bg-purple-100 text-[#4800b2] px-3 py-1.5 rounded-lg font-space font-bold text-[10px] cursor-pointer"
                        >
                          {l.is_promoted ? 'Demote' : 'Promote'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Transactions / Escrow Contracts */}
        <section className="bg-white border border-[#cbc3d9]/40 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-6 border-b border-[#cbc3d9]/20 bg-[#f7f9fc]">
            <h2 className="font-space font-black text-base text-[#191c1e]">Escrow Control Dashboard</h2>
            <p className="text-xs text-[#7a7488] mt-0.5">Control payment releases, security contracts, and refunds.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#cbc3d9]/20 text-[10px] uppercase tracking-wider text-[#7a7488] font-space font-bold bg-[#f7f9fc]/50">
                  <th className="py-3 px-6">Escrow ID</th>
                  <th className="py-3 px-6">Buyer ID</th>
                  <th className="py-3 px-6">Seller ID</th>
                  <th className="py-3 px-6">Funds Locked</th>
                  <th className="py-3 px-6">Escrow Fee (2%)</th>
                  <th className="py-3 px-6">Contract Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cbc3d9]/10 text-xs font-medium">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#7a7488]">No escrow transactions active.</td>
                  </tr>
                ) : (
                  transactions.map(t => (
                    <tr key={t.id} className="hover:bg-[#f7f9fc]/30">
                      <td className="py-4 px-6 font-space font-bold text-[#191c1e]">{t.id}</td>
                      <td className="py-4 px-6 text-[#7a7488]">{t.buyer_id}</td>
                      <td className="py-4 px-6 text-[#7a7488]">{t.seller_id}</td>
                      <td className="py-4 px-6 font-space font-bold text-emerald-700">₦{t.amount.toLocaleString()}</td>
                      <td className="py-4 px-6 font-space font-bold text-[#4800b2]">₦{t.escrow_fee.toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          t.status === 'released' ? 'bg-emerald-50 text-[#006f64]' : 
                          t.status === 'refunded' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {t.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {t.status === 'held_in_escrow' && (
                          <>
                            <button 
                              onClick={() => handleReleaseEscrow(t.id)}
                              disabled={actionLoading}
                              className="bg-emerald-50 hover:bg-emerald-100 text-[#006f64] px-3 py-1.5 rounded-lg font-space font-bold text-[10px] cursor-pointer"
                            >
                              Release to Seller
                            </button>
                            <button 
                              onClick={() => handleRefundBuyer(t.id)}
                              disabled={actionLoading}
                              className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg font-space font-bold text-[10px] cursor-pointer"
                            >
                              Refund Buyer
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Promotion Requests Queue */}
        <section className="bg-white border border-[#cbc3d9]/40 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-6 border-b border-[#cbc3d9]/20 bg-[#f7f9fc]">
            <h2 className="font-space font-black text-base text-[#191c1e]">Active Promotion Requests</h2>
            <p className="text-xs text-[#7a7488] mt-0.5">Manage and activate user promotion requests and marketing tiers.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#cbc3d9]/20 text-[10px] uppercase tracking-wider text-[#7a7488] font-space font-bold bg-[#f7f9fc]/50">
                  <th className="py-3 px-6">Request ID</th>
                  <th className="py-3 px-6">Listing ID</th>
                  <th className="py-3 px-6">Plan Name</th>
                  <th className="py-3 px-6">Price</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cbc3d9]/10 text-xs font-medium">
                {promoRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#7a7488]">No promotion requests active.</td>
                  </tr>
                ) : (
                  promoRequests.map(pr => (
                    <tr key={pr.id} className="hover:bg-[#f7f9fc]/30">
                      <td className="py-4 px-6 font-space font-bold text-[#191c1e]">{pr.id}</td>
                      <td className="py-4 px-6 text-[#7a7488]">{pr.listing_id}</td>
                      <td className="py-4 px-6 font-bold">{pr.plan_name}</td>
                      <td className="py-4 px-6 font-space font-bold text-[#4800b2]">₦{pr.price.toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          pr.status === 'active' ? 'bg-emerald-50 text-[#006f64]' : 'bg-amber-50 text-amber-800'
                        }`}>
                          {pr.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {pr.status === 'pending' && (
                          <button 
                            onClick={() => handleApprovePromotion(pr.id)}
                            disabled={actionLoading}
                            className="bg-emerald-50 hover:bg-emerald-100 text-[#006f64] px-3 py-1.5 rounded-lg font-space font-bold text-[10px] cursor-pointer"
                          >
                            Approve & Promote
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Follower Growth Campaign Queue */}
        <section className="bg-white border border-[#cbc3d9]/40 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-6 border-b border-[#cbc3d9]/20 bg-[#f7f9fc] flex items-center justify-between gap-4">
            <div>
              <h2 className="font-space font-black text-base text-[#191c1e] flex items-center gap-2">
                <Rocket className="w-4 h-4 text-[#4800b2]" /> Follower Growth Campaigns
              </h2>
              <p className="text-xs text-[#7a7488] mt-0.5">
                Users paying to grow their own pages. Approve a request, run the promotion, then mark it completed.
              </p>
            </div>
            {growthRequests.some(g => g.status === 'pending') && (
              <span className="shrink-0 bg-amber-50 text-amber-800 border border-amber-100 px-3 py-1 rounded-full text-[10px] font-space font-bold uppercase">
                {growthRequests.filter(g => g.status === 'pending').length} awaiting approval
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#cbc3d9]/20 text-[10px] uppercase tracking-wider text-[#7a7488] font-space font-bold bg-[#f7f9fc]/50">
                  <th className="py-3 px-6">Page Handle</th>
                  <th className="py-3 px-6">Platform</th>
                  <th className="py-3 px-6">Requested By</th>
                  <th className="py-3 px-6">Followers Wanted</th>
                  <th className="py-3 px-6">Price</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cbc3d9]/10 text-xs font-medium">
                {growthRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#7a7488]">No growth campaigns requested yet.</td>
                  </tr>
                ) : (
                  growthRequests.map(g => (
                    <tr key={g.id} className="hover:bg-[#f7f9fc]/30">
                      <td className="py-4 px-6 font-bold text-[#191c1e]">{g.handle}</td>
                      <td className="py-4 px-6 capitalize">{g.platform}</td>
                      <td className="py-4 px-6 text-[#7a7488]">{g.requester_username || '—'}</td>
                      <td className="py-4 px-6 font-space font-bold">+{g.target_followers.toLocaleString()}</td>
                      <td className="py-4 px-6 font-space font-bold text-[#4800b2]">₦{g.price.toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          g.status === 'completed' ? 'bg-emerald-50 text-[#006f64]' :
                          g.status === 'approved' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-amber-50 text-amber-800'
                        }`}>
                          {g.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {g.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateGrowthRequest(g.id, 'approved')}
                            disabled={actionLoading}
                            className="bg-emerald-50 hover:bg-emerald-100 text-[#006f64] px-3 py-1.5 rounded-lg font-space font-bold text-[10px] cursor-pointer"
                          >
                            Approve
                          </button>
                        )}
                        {g.status === 'approved' && (
                          <button
                            onClick={() => handleUpdateGrowthRequest(g.id, 'completed')}
                            disabled={actionLoading}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-space font-bold text-[10px] cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
