'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api, db, Profile } from '@/lib/supabase';
import { 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  Check, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';

export default function SellAccount() {
  const router = useRouter();
  
  // Wizard steps: 1 = Info, 2 = Success / Processing
  const [step, setStep] = useState(1);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [autoApproved, setAutoApproved] = useState(false);

  // Form Fields
  const [platform, setPlatform] = useState<'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'twitter'>('instagram');
  const [handle, setHandle] = useState('');
  const [followers, setFollowers] = useState('');
  const [category, setCategory] = useState('Technology');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [agedYear, setAgedYear] = useState('');
  const [ogEmail, setOgEmail] = useState(false);
  const [instantDelivery, setInstantDelivery] = useState(false);

  useEffect(() => {
    // Get simulated active user
    const savedUser = localStorage.getItem('promonow_current_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle || !followers || !price) {
      alert('Please fill out all required fields.');
      return;
    }

    // Listings must belong to the signed-in user — never a fallback account.
    if (!currentUser) {
      alert('Please sign in to list an account.');
      window.location.href = '/login';
      return;
    }

    try {
      const sellerId = currentUser.id;

      const created = await api.createListing({
        platform,
        handle: handle.startsWith('@') ? handle : `@${handle}`,
        followers: parseInt(followers),
        engagement_rate: parseFloat((Math.random() * 8 + 2).toFixed(2)),
        avg_likes: Math.round(parseInt(followers) * 0.05),
        category,
        description: description || `Premium ${platform} asset focusing on ${category}. Strong organic growth and clean account record.`,
        price: parseFloat(price),
        audience_region: 'USA',
        aged_year: agedYear ? parseInt(agedYear) : undefined,
        og_email_included: ogEmail,
        instant_delivery: instantDelivery,
        seller_id: sellerId,
        seller: {
          id: currentUser.id,
          username: currentUser.username,
          is_admin: currentUser.is_admin
        }
      });

      setAutoApproved(!!created.auto_approved);
      setStep(2);
    } catch (err) {
      console.error(err);
      alert('Failed to submit listing. Try again.');
    }
  };

  return (
    <>
      <Navbar />

      <main className="pt-16 pb-24">
        {/* Header Hero */}
        <section className="relative w-full h-80 bg-[#4800b2] overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-[#4800b2] to-[#006a60] opacity-40" />
          <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-12 text-center text-white space-y-4">
            <h1 className="font-space font-black text-3xl md:text-5xl">Monetize Your Influence</h1>
            <p className="text-sm md:text-base text-white/80 max-w-xl mx-auto">
              Join PromoNow, the world's most secure exchange for premium social media assets. List your account in minutes and connect with verified buyers.
            </p>
          </div>
        </section>

        {/* Wizard Form Area */}
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 -mt-16 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Form/Success Content */}
            <div className="lg:col-span-8">
              {step === 1 ? (
                <div className="bg-white border border-[#cbc3d9]/40 p-8 rounded-2xl shadow-xs">
                  {/* Step indicators */}
                  <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-4 border-b border-[#cbc3d9]/20">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-7 h-7 rounded-full bg-[#4800b2] text-white flex items-center justify-center font-space font-bold text-xs">1</span>
                      <span className="font-space font-bold text-xs text-[#4800b2]">Account Info & Metrics</span>
                    </div>
                    <div className="w-12 h-[1px] bg-[#cbc3d9]" />
                    <div className="flex items-center gap-2 shrink-0 opacity-50">
                      <span className="w-7 h-7 rounded-full border border-[#cbc3d9] text-[#7a7488] flex items-center justify-center font-space font-bold text-xs">2</span>
                      <span className="font-space font-bold text-xs text-[#7a7488]">Awaiting Admin Audit</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                      <h2 className="font-space font-black text-xl text-[#191c1e] mb-6">Tell us about your account</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Platform Selector */}
                        <div className="space-y-2">
                          <label className="block font-space font-bold text-xs text-[#494456] uppercase tracking-wider">Platform</label>
                          <select 
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value as any)}
                            className="w-full bg-[#f2f4f7] border-none rounded-xl h-12 px-4 font-space font-medium text-sm focus:ring-2 focus:ring-[#4800b2]"
                          >
                            <option value="instagram">Instagram</option>
                            <option value="tiktok">TikTok</option>
                            <option value="facebook">Facebook Page</option>
                            <option value="youtube">YouTube Channel</option>
                            <option value="twitter">Twitter / X</option>
                          </select>
                        </div>

                        {/* Account Handle */}
                        <div className="space-y-2">
                          <label className="block font-space font-bold text-xs text-[#494456] uppercase tracking-wider">Account Handle</label>
                          <input 
                            type="text" 
                            placeholder="e.g. @creative_pixel"
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            className="w-full bg-[#f2f4f7] border-none rounded-xl h-12 px-4 font-space font-medium text-sm focus:ring-2 focus:ring-[#4800b2]"
                            required
                          />
                        </div>

                        {/* Follower Count */}
                        <div className="space-y-2">
                          <label className="block font-space font-bold text-xs text-[#494456] uppercase tracking-wider">Follower Count</label>
                          <input 
                            type="number" 
                            placeholder="e.g. 50000"
                            value={followers}
                            onChange={(e) => setFollowers(e.target.value)}
                            className="w-full bg-[#f2f4f7] border-none rounded-xl h-12 px-4 font-space font-medium text-sm focus:ring-2 focus:ring-[#4800b2]"
                            required
                          />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                          <label className="block font-space font-bold text-xs text-[#494456] uppercase tracking-wider">Category / Niche</label>
                          <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-[#f2f4f7] border-none rounded-xl h-12 px-4 font-space font-medium text-sm focus:ring-2 focus:ring-[#4800b2]"
                          >
                            <option value="Technology">Technology</option>
                            <option value="Fashion & Lifestyle">Fashion & Lifestyle</option>
                            <option value="Gaming">Gaming</option>
                            <option value="Business & Finance">Business & Finance</option>
                            <option value="Health & Fitness">Health & Fitness</option>
                          </select>
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                          <label className="block font-space font-bold text-xs text-[#494456] uppercase tracking-wider font-bold">Expected Price (₦)</label>
                          <input 
                            type="number" 
                            placeholder="e.g. 1500"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full bg-[#f2f4f7] border-none rounded-xl h-12 px-4 font-space font-medium text-sm focus:ring-2 focus:ring-[#4800b2]"
                            required
                          />
                        </div>

                        {/* Aged Year */}
                        <div className="space-y-2">
                          <label className="block font-space font-bold text-xs text-[#494456] uppercase tracking-wider">Registration Year (Optional)</label>
                          <input 
                            type="number" 
                            placeholder="e.g. 2018"
                            value={agedYear}
                            onChange={(e) => setAgedYear(e.target.value)}
                            className="w-full bg-[#f2f4f7] border-none rounded-xl h-12 px-4 font-space font-medium text-sm focus:ring-2 focus:ring-[#4800b2]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Account Description */}
                    <div className="space-y-2">
                      <label className="block font-space font-bold text-xs text-[#494456] uppercase tracking-wider">Description</label>
                      <textarea 
                        rows={4}
                        placeholder="Describe the account history, demographics, engagement rates, and content style..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-[#f2f4f7] border-none rounded-xl p-4 font-space font-medium text-sm focus:ring-2 focus:ring-[#4800b2]"
                      />
                    </div>

                    {/* Checkboxes */}
                    <div className="flex flex-col gap-3 pt-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={ogEmail}
                          onChange={(e) => setOgEmail(e.target.checked)}
                          className="w-4 h-4 rounded border-[#cbc3d9] text-[#4800b2] focus:ring-[#4800b2]"
                        />
                        <span className="font-space text-xs text-[#494456] font-medium">
                          Original Creation Email (OG Email) is included in sale.
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={instantDelivery}
                          onChange={(e) => setInstantDelivery(e.target.checked)}
                          className="w-4 h-4 rounded border-[#cbc3d9] text-[#4800b2] focus:ring-[#4800b2]"
                        />
                        <span className="font-space text-xs text-[#494456] font-medium">
                          Credentials support instant handover via automated engine.
                        </span>
                      </label>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-6 border-t border-[#cbc3d9]/20 flex justify-between items-center">
                      <p className="text-xs text-[#7a7488] font-space font-medium">
                        Estimated listing fees: <span className="text-[#006f64] font-bold">Free Listing</span>
                      </p>
                      <button 
                        type="submit"
                        className="bg-[#4800b2] text-white px-8 py-3.5 rounded-xl font-space font-bold text-sm tracking-wide cursor-pointer hover:bg-[#4800b2]/90 active:scale-95 transition-all shadow-md shadow-[#4800b2]/10"
                      >
                        Submit Listing
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* SUCCESS VIEW */
                <div className="bg-white border border-[#cbc3d9]/40 p-8 md:p-12 rounded-2xl shadow-xs text-center space-y-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-[#006f64] mx-auto border border-emerald-100">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="font-space font-black text-2xl text-[#191c1e]">
                      {autoApproved ? 'Listing is Live!' : 'Listing Pending Audit'}
                    </h2>
                    <p className="text-sm text-[#494456] max-w-md mx-auto leading-relaxed">
                      {autoApproved ? (
                        <>Your admin listing for <span className="font-bold text-[#4800b2]">{handle}</span> has been verified automatically and is now visible on the marketplace.</>
                      ) : (
                        <>Thank you! Your account submission for <span className="font-bold text-[#4800b2]">{handle}</span> has been received. Our admin team has been notified and will verify metrics within 24 hours.</>
                      )}
                    </p>
                  </div>

                  <div className="max-w-md mx-auto bg-[#f7f9fc] border border-[#cbc3d9]/20 p-4 rounded-xl text-left text-xs text-[#494456] space-y-2 font-medium">
                    <p className="font-bold text-[#191c1e]">Next Milestones:</p>
                    {autoApproved ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4800b2]" />
                          <span>Your listing is already <strong>verified and active</strong> on the marketplace.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4800b2]" />
                          <span>Manage or promote it anytime from the <strong>Admin Console</strong>.</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4800b2]" />
                          <span>An admin reviews your submission in the <strong>Admin Console</strong> audit queue.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4800b2]" />
                          <span>Once approved, your listing will show immediately in the marketplace.</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-6">
                    <button 
                      onClick={() => router.push('/marketplace')}
                      className="bg-[#191c1e] text-white px-6 py-3 rounded-xl font-space font-bold text-xs tracking-wider cursor-pointer hover:bg-[#4800b2] transition-colors"
                    >
                      Browse Marketplace
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Guidelines */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Approval Info */}
              <div className="bg-white border border-[#cbc3d9]/40 p-6 rounded-2xl shadow-xs">
                <h3 className="font-space font-bold text-xs uppercase tracking-wider text-[#191c1e] mb-6 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#006a60]" /> Approval Process
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-[#006a60]/10 text-[#006a60] flex items-center justify-center font-space font-bold text-xs shrink-0">1</div>
                    <div>
                      <h4 className="font-space font-bold text-xs text-[#191c1e] mb-1">Manual Verification</h4>
                      <p className="text-[11px] text-[#7a7488] leading-normal">Our auditing team verifies the handle, follower quality, history, and engagement metrics within 24 hours.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-[#006a60]/10 text-[#006a60] flex items-center justify-center font-space font-bold text-xs shrink-0">2</div>
                    <div>
                      <h4 className="font-space font-bold text-xs text-[#191c1e] mb-1">Direct Payment</h4>
                      <p className="text-[11px] text-[#7a7488] leading-normal">The buyer pays the listed price through Paystack. Once payment is verified, the purchase and credential handover are completed.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-r from-[#4800b2] to-[#6200ee] text-white p-6 rounded-2xl shadow-md">
                <h3 className="font-space font-bold text-xs uppercase tracking-wider mb-4">Security Standards</h3>
                <ul className="space-y-3 text-[11px] opacity-90">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#4af8e3] shrink-0" />
                    <span>Protection against payment chargebacks and buyer fraud.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#4af8e3] shrink-0" />
                    <span>Encrypted digital data handling during credentials transfer.</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
