'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  api,
  Profile,
  GrowthRequest,
  calculateGrowthPrice,
  GROWTH_MIN_PRICE,
  GROWTH_PRICE_PER_FOLLOWER
} from '@/lib/supabase';
import { Rocket, Users, Sparkles, Loader2, CheckCircle, Clock, BadgeCheck } from 'lucide-react';
import Link from 'next/link';

const PLATFORM_LABELS: Record<GrowthRequest['platform'], string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  youtube: 'YouTube',
  twitter: 'Twitter / X'
};

export default function Promote() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [myRequests, setMyRequests] = useState<GrowthRequest[]>([]);

  const [platform, setPlatform] = useState<GrowthRequest['platform']>('instagram');
  const [handle, setHandle] = useState('');
  const [followersInput, setFollowersInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const targetFollowers = parseInt(followersInput, 10);
  const hasValidTarget = Number.isFinite(targetFollowers) && targetFollowers > 0;
  const price = calculateGrowthPrice(hasValidTarget ? targetFollowers : 0);

  const loadRequests = async (username: string) => {
    try {
      const all = await api.getGrowthRequests();
      setMyRequests(all.filter(r => r.requester_username === username));
    } catch (err) {
      console.error('Error loading growth requests:', err);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('promonow_current_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser) as Profile;
      setCurrentUser(parsed);
      loadRequests(parsed.username);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!handle.trim()) {
      setErrorMsg('Please enter your page handle or username.');
      return;
    }
    if (!hasValidTarget) {
      setErrorMsg('Please enter how many followers you want to gain.');
      return;
    }

    setLoading(true);
    try {
      await api.createGrowthRequest({
        platform,
        handle: handle.trim(),
        target_followers: targetFollowers,
        requester_username: currentUser?.username || 'Guest'
      });
      setSuccessMsg(
        `Request sent! Our admin team has been notified and will review your ₦${price.toLocaleString()} promotion for ${handle.trim()}.`
      );
      setHandle('');
      setFollowersInput('');
      if (currentUser) {
        await loadRequests(currentUser.username);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit promotion request');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status: GrowthRequest['status']) => {
    if (status === 'completed') {
      return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-50 text-[#006f64] inline-flex items-center gap-1"><BadgeCheck className="w-3 h-3" /> Completed</span>;
    }
    if (status === 'approved') {
      return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-50 text-blue-700 inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-50 text-amber-800 inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Pending Review</span>;
  };

  return (
    <>
      <Navbar />

      <main className="pt-24 pb-20 px-4 md:px-12 max-w-[1280px] mx-auto space-y-10">

        {/* Header */}
        <section className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4800b2]/5 rounded-full border border-[#4800b2]/20">
            <Sparkles className="w-4 h-4 text-[#4800b2]" />
            <span className="font-space text-[10px] font-bold text-[#4800b2] uppercase tracking-widest">
              Follower Growth Service
            </span>
          </div>
          <h1 className="font-space font-black text-3xl md:text-5xl text-[#191c1e] tracking-tight">
            Promote Your Page
          </h1>
          <p className="text-sm text-[#494456] max-w-md mx-auto leading-relaxed">
            Tell us which page you want to grow and by how many followers. We price it instantly —
            from just ₦{GROWTH_MIN_PRICE.toLocaleString()} — and our team handles the promotion once approved.
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Request Form */}
          <div className="bg-white border border-[#cbc3d9]/40 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="font-space font-black text-xl text-[#191c1e] flex items-center gap-2">
                <Rocket className="w-5 h-5 text-[#4800b2]" /> Start a Growth Campaign
              </h2>
              <p className="text-xs text-[#7a7488] mt-1">An admin reviews and approves every campaign before promotion begins.</p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 text-xs border border-red-100 p-3.5 rounded-xl font-medium">
                ⚠️ {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-50 text-[#006f64] text-xs border border-emerald-100 p-3.5 rounded-xl font-medium">
                ✅ {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block font-space font-bold text-[10px] text-[#7a7488] uppercase tracking-wider">Social Media Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as GrowthRequest['platform'])}
                  className="w-full bg-[#f2f4f7] border-none rounded-xl h-11 px-3 font-space text-xs focus:ring-2 focus:ring-[#4800b2]"
                >
                  {(Object.keys(PLATFORM_LABELS) as GrowthRequest['platform'][]).map(p => (
                    <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-space font-bold text-[10px] text-[#7a7488] uppercase tracking-wider">Your Page Handle</label>
                <input
                  type="text"
                  placeholder="e.g. @my_brand_page"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full bg-[#f2f4f7] border-none rounded-xl h-11 px-4 font-space text-xs focus:ring-2 focus:ring-[#4800b2]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-space font-bold text-[10px] text-[#7a7488] uppercase tracking-wider">Followers You Want to Gain</label>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 5000"
                  value={followersInput}
                  onChange={(e) => setFollowersInput(e.target.value)}
                  className="w-full bg-[#f2f4f7] border-none rounded-xl h-11 px-4 font-space text-xs focus:ring-2 focus:ring-[#4800b2]"
                  required
                />
              </div>

              {/* Live price */}
              <div className="bg-[#4800b2]/5 border border-[#4800b2]/20 rounded-2xl p-5 space-y-1">
                <p className="text-[10px] uppercase font-space font-bold text-[#4800b2] tracking-widest">Your Campaign Price</p>
                <p className="font-space font-black text-3xl text-[#191c1e]">
                  ₦{price.toLocaleString()}
                </p>
                <p className="text-[10px] text-[#7a7488] font-medium">
                  ₦{GROWTH_PRICE_PER_FOLLOWER} per follower • minimum charge ₦{GROWTH_MIN_PRICE.toLocaleString()}
                  {hasValidTarget && targetFollowers * GROWTH_PRICE_PER_FOLLOWER < GROWTH_MIN_PRICE &&
                    ' (minimum applies to this order)'}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#4800b2] text-white font-space font-bold text-xs tracking-wider rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending Request...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" /> Request Promotion — ₦{price.toLocaleString()}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* How it works + my requests */}
          <div className="space-y-8">
            <div className="bg-white border border-[#cbc3d9]/40 rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
              <h3 className="font-space font-black text-sm text-[#191c1e]">How It Works</h3>
              <ol className="space-y-3 text-xs text-[#494456] leading-relaxed">
                <li className="flex gap-3">
                  <span className="w-5 h-5 shrink-0 bg-[#4800b2] text-white rounded-full flex items-center justify-center font-space font-bold text-[10px]">1</span>
                  Tell us your platform, page handle, and the follower target you want to reach.
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 shrink-0 bg-[#4800b2] text-white rounded-full flex items-center justify-center font-space font-bold text-[10px]">2</span>
                  We calculate your price instantly — ₦{GROWTH_PRICE_PER_FOLLOWER}/follower, starting at ₦{GROWTH_MIN_PRICE.toLocaleString()}.
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 shrink-0 bg-[#4800b2] text-white rounded-full flex items-center justify-center font-space font-bold text-[10px]">3</span>
                  Our admin team is notified and approves your campaign.
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 shrink-0 bg-[#4800b2] text-white rounded-full flex items-center justify-center font-space font-bold text-[10px]">4</span>
                  We promote your page and mark the campaign completed when your target is reached.
                </li>
              </ol>
            </div>

            <div className="bg-white border border-[#cbc3d9]/40 rounded-3xl overflow-hidden shadow-xs">
              <div className="p-5 border-b border-[#cbc3d9]/20 bg-[#f7f9fc]">
                <h3 className="font-space font-black text-sm text-[#191c1e] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#4800b2]" /> My Growth Campaigns
                </h3>
              </div>
              <div className="p-4">
                {myRequests.length === 0 ? (
                  <p className="text-xs text-[#7a7488] text-center py-6">
                    No campaigns yet. Submit your first request to get started.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {myRequests.map(r => (
                      <div key={r.id} className="flex justify-between items-center border border-[#cbc3d9]/20 p-3.5 rounded-xl text-xs gap-3">
                        <div className="min-w-0">
                          <p className="font-space font-black text-[#191c1e] truncate">{r.handle}</p>
                          <p className="text-[10px] text-[#7a7488] mt-0.5">
                            {PLATFORM_LABELS[r.platform]} • +{r.target_followers.toLocaleString()} followers • ₦{r.price.toLocaleString()}
                          </p>
                        </div>
                        {statusBadge(r.status)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className="text-center text-xs text-[#7a7488]">
              Looking for follower metrics instead?{' '}
              <Link href="/stats" className="font-space font-bold text-[#4800b2] hover:underline">
                View Follower &amp; Like Counts
              </Link>
            </p>
          </div>

        </section>
      </main>

      <Footer />
    </>
  );
}
