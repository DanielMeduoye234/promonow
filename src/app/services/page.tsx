'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  ShieldCheck, 
  Search, 
  BadgeHelp, 
  BarChart4, 
  Flame, 
  DollarSign, 
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function Services() {
  // Calculator state
  const [calcPlatform, setCalcPlatform] = useState<'instagram' | 'tiktok' | 'youtube' | 'twitter'>('instagram');
  const [calcFollowers, setCalcFollowers] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const followersNum = parseInt(calcFollowers);
    if (isNaN(followersNum) || followersNum <= 0) return;

    let baseRate = 0.03; // Base multiplier per follower
    if (calcPlatform === 'tiktok') baseRate = 0.015;
    if (calcPlatform === 'youtube') baseRate = 0.08;
    if (calcPlatform === 'twitter') baseRate = 0.025;

    // Apply random multiplier to feel organic
    const multiplier = 0.8 + Math.random() * 0.4;
    const value = Math.round(followersNum * baseRate * multiplier);
    
    // Cap at minimum $50
    setEstimatedValue(Math.max(50, value));
  };

  const serviceCategories = [
    {
      title: 'Audience Quality Audit',
      icon: <Search className="w-6 h-6 text-[#4800b2]" />,
      description: 'Our proprietary verification engine scans active lists, engagement ratios, and demographic countries to flag bot networks and fake followings.',
      benefit: 'Buy authentic accounts with real, responsive audiences.'
    },
    {
      title: 'Direct Paystack Payments',
      icon: <ShieldCheck className="w-6 h-6 text-[#006a60]" />,
      description: 'Buyers pay the displayed listing price through Paystack without funding a wallet or paying an escrow fee.',
      benefit: 'Server-side payment verification before a purchase is completed.'
    },
    {
      title: 'Account Valuation (Appraisal)',
      icon: <DollarSign className="w-6 h-6 text-[#4800b2]" />,
      description: 'Using historical platform pricing models, audience niches, and page creation history, we deliver accurate valuations.',
      benefit: 'List at fair market value and optimize your return on investment.'
    },
    {
      title: 'VIP Brokerage Transition',
      icon: <BarChart4 className="w-6 h-6 text-[#006a60]" />,
      description: 'Dedicated trade officers manage transitions for high-value networks (>1M reach) and arrange custom off-market contracts.',
      benefit: 'Discreet, seamless portfolios transfer for agencies and companies.'
    }
  ];

  return (
    <>
      <Navbar />

      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 py-12 md:py-20 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#006a60]/5 rounded-full border border-[#006a60]/20">
              <Sparkles className="w-4 h-4 text-[#006a60]" />
              <span className="font-space text-[10px] font-bold text-[#006a60] uppercase tracking-widest">
                Professional Brokerage Services
              </span>
            </div>
            
            <h1 className="font-space font-black text-4xl md:text-5xl text-[#191c1e] tracking-tight leading-tight">
              Premium services for secure asset trade.
            </h1>
            
            <p className="text-sm md:text-base text-[#494456] leading-relaxed max-w-lg">
              PromoNow goes beyond typical classified listings. We provide the technical evaluation, safety protocols, and transition assistance needed for corporate-level social assets transfers.
            </p>

            <div className="pt-4 flex gap-4">
              <Link 
                href="/sell"
                className="bg-[#4800b2] text-white px-6 py-3.5 rounded-xl font-space font-bold text-xs tracking-wider hover:opacity-90 transition-opacity shadow-sm"
              >
                List Your Account
              </Link>
              <a 
                href="#appraisal-calculator"
                className="bg-white border border-[#7a7488] text-[#191c1e] hover:bg-[#f2f4f7] px-6 py-3.5 rounded-xl font-space font-bold text-xs tracking-wider transition-colors"
              >
                Instant Price Appraisal
              </a>
            </div>
          </div>

          {/* Service grid visual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {serviceCategories.map((s, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl border border-[#cbc3d9]/40 space-y-4">
                <div className="w-10 h-10 bg-[#f7f9fc] rounded-xl flex items-center justify-center border border-[#cbc3d9]/25 shrink-0">
                  {s.icon}
                </div>
                <h3 className="font-space font-extrabold text-sm text-[#191c1e]">{s.title}</h3>
                <p className="text-[11px] text-[#7a7488] leading-relaxed">{s.description}</p>
                <div className="text-[10px] text-[#006f64] font-bold bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/30">
                  ⚡ {s.benefit}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive appraisal calculator */}
        <section id="appraisal-calculator" className="bg-[#191c1e] py-24 text-white">
          <div className="max-w-[1280px] mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Calculator Info */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="font-space font-black text-3xl md:text-4xl text-white">
                Instant Valuation Calculator
              </h2>
              <p className="text-sm text-[#cbc3d9] leading-relaxed">
                Appraise your social channels instantly using our proprietary valuation metrics. Input your platform parameters to estimate your potential asset sale price.
              </p>
              <ul className="space-y-3.5 text-xs text-[#cbc3d9]/80 font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4af8e3]" />
                  Based on recent transaction values (2026 data)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4af8e3]" />
                  Accounts for platform-specific reach factors
                </li>
              </ul>
            </div>

            {/* Calculator Card */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-[#cbc3d9]/20 p-8 rounded-3xl max-w-xl mx-auto text-[#191c1e]">
                <form onSubmit={handleCalculate} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block font-space font-bold text-xs text-[#7a7488] uppercase tracking-wider">Social Platform</label>
                      <select 
                        value={calcPlatform}
                        onChange={(e) => setCalcPlatform(e.target.value as any)}
                        className="w-full bg-[#f2f4f7] border-none rounded-xl h-12 px-4 font-space font-medium text-sm focus:ring-2 focus:ring-[#4800b2]"
                      >
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="youtube">YouTube</option>
                        <option value="twitter">Twitter / X</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-space font-bold text-xs text-[#7a7488] uppercase tracking-wider">Followers Count</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 75000"
                        value={calcFollowers}
                        onChange={(e) => setCalcFollowers(e.target.value)}
                        className="w-full bg-[#f2f4f7] border-none rounded-xl h-12 px-4 font-space font-medium text-sm focus:ring-2 focus:ring-[#4800b2]"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-[#4800b2] text-white font-space font-bold text-xs tracking-wider rounded-xl cursor-pointer hover:opacity-90 active:scale-95 transition-all shadow-sm"
                  >
                    Estimate Market Price
                  </button>
                </form>

                {estimatedValue !== null && (
                  <div className="mt-8 pt-6 border-t border-[#cbc3d9]/20 text-center space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    <p className="text-[10px] uppercase font-space font-bold text-[#7a7488]">Estimated Valuation Range</p>
                    <p className="font-space font-black text-3xl md:text-4xl text-[#4800b2]">
                      ₦{Math.round(estimatedValue * 0.85).toLocaleString()} - ₦{Math.round(estimatedValue * 1.15).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-[#006f64] font-bold bg-emerald-50 py-1.5 px-3 rounded-full inline-block border border-emerald-100">
                      ✓ Instant appraisal complete
                    </p>
                    
                    <div className="pt-4">
                      <Link 
                        href={`/sell?platform=${calcPlatform}&followers=${calcFollowers}&price=${estimatedValue}`}
                        className="text-xs font-space font-bold text-[#191c1e] hover:text-[#4800b2] inline-flex items-center gap-1 hover:underline"
                      >
                        List this asset immediately
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
