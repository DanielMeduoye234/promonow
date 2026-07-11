'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AccountCard from '@/components/AccountCard';
import { api, Listing } from '@/lib/supabase';
import { 
  Rocket, 
  ArrowRight, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  Camera, 
  Play, 
  TrendingUp, 
  ArrowUpRight,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';

const FacebookIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
  </svg>
);

export default function Home() {
  const [trendingListings, setTrendingListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState({
    sellers: '18k+',
    traded: '320k+',
    security: '100%'
  });

  useEffect(() => {
    // Get top 4 listings
    api.getListings().then(listings => {
      setTrendingListings(listings.filter(l => l.status === 'active').slice(0, 4));
    });
  }, []);

  return (
    <>
      <Navbar />
      
      <main className="pt-16 overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-white border-b border-[#cbc3d9]/20">
          <div className="max-w-[1280px] mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 py-12 md:py-20">
            
            {/* Left Hero Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4800b2]/5 rounded-full border border-[#4800b2]/20 animate-fade-in">
                <ShieldCheck className="w-4 h-4 text-[#4800b2]" />
                <span className="font-space text-[10px] font-bold text-[#4800b2] uppercase tracking-widest">
                  Premium Digital Assets Exchange
                </span>
              </div>
              
              <h1 className="font-space font-black text-4xl md:text-6xl text-[#191c1e] leading-tight">
                The Premier <br/>
                <span className="text-[#4800b2]">Social Media</span> Asset Hub.
              </h1>
              
              <p className="text-base md:text-lg text-[#494456] max-w-lg leading-relaxed">
                Securely acquire and trade high-value digital properties. PromoNow provides instant escrow protection and verified account history for professional growth.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Link 
                  href="/marketplace" 
                  className="bg-[#4800b2] text-white px-8 py-4 font-space font-bold text-sm tracking-wider rounded-xl flex items-center gap-2 hover:bg-[#4800b2]/90 transition-all shadow-lg shadow-[#4800b2]/20 hover:-translate-y-0.5"
                >
                  Browse Marketplace
                  <Rocket className="w-4 h-4" />
                </Link>
                <Link 
                  href="/sell" 
                  className="bg-white border border-[#7a7488] text-[#191c1e] px-8 py-4 font-space font-bold text-sm tracking-wider rounded-xl hover:bg-[#f2f4f7] transition-all hover:-translate-y-0.5"
                >
                  Become a Seller
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-10 pt-8 border-t border-[#cbc3d9]/30">
                <div>
                  <div className="font-space font-black text-2xl md:text-3xl text-[#4800b2]">{stats.sellers}</div>
                  <div className="text-xs text-[#494456] font-medium mt-1">Trusted Sellers</div>
                </div>
                <div>
                  <div className="font-space font-black text-2xl md:text-3xl text-[#4800b2]">{stats.traded}</div>
                  <div className="text-xs text-[#494456] font-medium mt-1">Assets Traded</div>
                </div>
                <div>
                  <div className="font-space font-black text-2xl md:text-3xl text-[#4800b2]">{stats.security}</div>
                  <div className="text-xs text-[#494456] font-medium mt-1">Secure Escrow</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visuals */}
            <div className="relative flex justify-center items-center">
              {/* Floating Graphics & Cards */}
              <div className="relative w-full max-w-md aspect-square flex items-center justify-center bg-gradient-to-br from-[#4800b2]/10 to-[#006a60]/10 rounded-3xl overflow-hidden animate-bounce-slow">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <Globe className="w-72 h-72 text-[#4800b2]" />
                </div>
                
                <div className="z-20 grid grid-cols-2 gap-6 p-4">
                  <div className="glass-card p-6 rounded-2xl flex flex-col items-center gap-2 transform -rotate-6 shadow-md">
                    <TrendingUp className="w-8 h-8 text-[#4800b2]" />
                    <span className="font-space font-black text-2xl text-[#191c1e]">95k+</span>
                    <span className="font-space font-bold text-[9px] uppercase tracking-wider text-[#7a7488]">Weekly Reach</span>
                  </div>
                  <div className="glass-card p-6 rounded-2xl flex flex-col items-center gap-2 transform rotate-6 shadow-md">
                    <ShieldCheck className="w-8 h-8 text-[#006a60]" />
                    <span className="font-space font-black text-xl text-[#006a60]">Top Tier</span>
                    <span className="font-space font-bold text-[9px] uppercase tracking-wider text-[#7a7488]">Verified Page</span>
                  </div>
                </div>
              </div>

              {/* Floating Chip badge */}
              <div className="absolute top-1/10 right-0 glass-card p-4 rounded-xl shadow-lg animate-float-slow hidden md:block border border-[#4800b2]/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#4800b2] rounded-lg flex items-center justify-center text-white">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-space font-bold text-xs text-[#191c1e]">Active Handover</div>
                    <div className="font-space font-bold text-[10px] text-[#006a60]">Ready to Transfer</div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          {/* Background Ambient Spheres */}
          <div className="absolute top-1/4 -right-20 w-80 h-80 bg-[#4800b2]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-[#006a60]/5 rounded-full blur-3xl" />
        </section>

        {/* Categories Section */}
        <section className="py-24 bg-[#f7f9fc]">
          <div className="max-w-[1280px] mx-auto px-4 md:px-12">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-space font-black text-3xl text-[#191c1e]">Explore Platforms</h2>
                <p className="text-sm text-[#494456] mt-2">Find the right digital footprint for your brand.</p>
              </div>
              <Link 
                href="/marketplace" 
                className="text-[#4800b2] font-space font-bold text-sm tracking-wide flex items-center gap-1 hover:underline group"
              >
                All Markets 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {/* Instagram */}
              <Link href="/marketplace?platform=instagram" className="bg-white p-6 rounded-xl border border-[#cbc3d9]/40 hover-lift flex flex-col items-center text-center group">
                <div className="w-14 h-14 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="font-space font-bold text-sm text-[#191c1e]">Instagram</h3>
                <p className="text-xs text-[#7a7488] mt-1">1,400+ Active</p>
              </Link>

              {/* TikTok */}
              <Link href="/marketplace?platform=tiktok" className="bg-white p-6 rounded-xl border border-[#cbc3d9]/40 hover-lift flex flex-col items-center text-center group">
                <div className="w-14 h-14 bg-neutral-50 text-[#111] rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Play className="w-6 h-6 fill-current" />
                </div>
                <h3 className="font-space font-bold text-sm text-[#191c1e]">TikTok</h3>
                <p className="text-xs text-[#7a7488] mt-1">980+ Active</p>
              </Link>

              {/* Facebook */}
              <Link href="/marketplace?platform=facebook" className="bg-white p-6 rounded-xl border border-[#cbc3d9]/40 hover-lift flex flex-col items-center text-center group">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <FacebookIcon />
                </div>
                <h3 className="font-space font-bold text-sm text-[#191c1e]">Facebook</h3>
                <p className="text-xs text-[#7a7488] mt-1">2,400+ Active</p>
              </Link>

              {/* YouTube */}
              <Link href="/marketplace?platform=youtube" className="bg-white p-6 rounded-xl border border-[#cbc3d9]/40 hover-lift flex flex-col items-center text-center group">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Play className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-space font-bold text-sm text-[#191c1e]">YouTube</h3>
                <p className="text-xs text-[#7a7488] mt-1">500+ Active</p>
              </Link>

              {/* Twitter */}
              <Link href="/marketplace?platform=twitter" className="bg-white p-6 rounded-xl border border-[#cbc3d9]/40 hover-lift flex flex-col items-center text-center group">
                <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <TwitterIcon />
                </div>
                <h3 className="font-space font-bold text-sm text-[#191c1e]">Twitter / X</h3>
                <p className="text-xs text-[#7a7488] mt-1">720+ Active</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Trending Listings Section */}
        <section className="py-24 bg-white">
          <div className="max-w-[1280px] mx-auto px-4 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
              <div>
                <h2 className="font-space font-black text-3xl text-[#191c1e]">Trending Listings</h2>
                <p className="text-sm text-[#494456] mt-2">Verified, high-quality digital assets available for immediate acquisition.</p>
              </div>
              <Link 
                href="/marketplace" 
                className="bg-[#191c1e] text-white px-6 py-2.5 rounded-xl font-space font-bold text-xs tracking-wider hover:bg-[#4800b2] transition-colors"
              >
                View All Listings
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingListings.map(listing => (
                <AccountCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>

        {/* Secure Architecture / Why Us Section */}
        <section className="py-24 bg-[#191c1e] text-white relative overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-4 md:px-12 relative z-10">
            <div className="max-w-2xl mb-16">
              <h2 className="font-space font-black text-3xl md:text-4xl">Trade with confidence on PromoNow</h2>
              <p className="text-sm text-[#cbc3d9] opacity-80 mt-4 leading-relaxed">
                We have engineered a bulletproof infrastructure for high-value digital asset transfers, prioritizing security, verification, and authenticity above all else.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 border border-white/10 rounded-2xl bg-white/5 hover:border-[#4800b2]/50 transition-colors">
                <div className="w-12 h-12 bg-[#4800b2] rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-space font-bold text-lg mb-4 text-[#cfbdff]">Secure Escrow</h3>
                <p className="text-xs text-[#cbc3d9] opacity-70 leading-relaxed">
                  Transactions are protected by our advanced escrow system. Funds are released to the seller only after the buyer confirms full ownership and security of the asset credentials.
                </p>
              </div>

              <div className="p-8 border border-white/10 rounded-2xl bg-white/5 hover:border-[#006a60]/50 transition-colors">
                <div className="w-12 h-12 bg-[#006a60] rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-space font-bold text-lg mb-4 text-[#4af8e3]">Instant Handover</h3>
                <p className="text-xs text-[#cbc3d9] opacity-70 leading-relaxed">
                  Our verification automation and support guide buyers and sellers through credentials transfers within minutes. Say goodbye to weeks of negotiation and risk.
                </p>
              </div>

              <div className="p-8 border border-white/10 rounded-2xl bg-white/5 hover:border-[#4800b2]/50 transition-colors">
                <div className="w-12 h-12 bg-[#4800b2] rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-space font-bold text-lg mb-4 text-[#cfbdff]">Verified History</h3>
                <p className="text-xs text-[#cbc3d9] opacity-70 leading-relaxed">
                  Every account undergoes audit inspections for bot activity, historical policy violations, and audience demographics. You buy real influence, not fake stats.
                </p>
              </div>
            </div>
          </div>
          
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#4800b2]/10 rounded-full blur-3xl" />
        </section>

        {/* CTA Seller Section */}
        <section className="py-24 bg-white">
          <div className="max-w-[1280px] mx-auto px-4 md:px-12">
            <div className="bg-gradient-to-r from-[#4800b2] to-[#6200ee] rounded-3xl p-12 lg:p-20 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-3/5 relative z-10 text-white space-y-6">
                <h2 className="font-space font-black text-3xl md:text-5xl leading-tight">
                  Ready to exit your digital asset?
                </h2>
                <p className="text-sm md:text-base text-white/80 max-w-md leading-relaxed">
                  Maximize your ROI. PromoNow connects you with serious, verified buyers and provides step-by-step guidance for a professional, secure sale.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <Link 
                    href="/sell" 
                    className="bg-[#006a60] text-white px-8 py-4 font-space font-bold text-sm tracking-wider rounded-xl hover:opacity-90 transition-all shadow-md"
                  >
                    Start Listing
                  </Link>
                  <Link 
                    href="/marketplace" 
                    className="bg-transparent border border-white/30 text-white hover:bg-white/10 px-8 py-4 font-space font-bold text-sm tracking-wider rounded-xl transition-all"
                  >
                    How it Works
                  </Link>
                </div>
              </div>

              <div className="lg:w-2/5 flex justify-center">
                <div className="relative w-48 h-48 md:w-64 md:h-64">
                  <div className="absolute inset-0 bg-[#006a60]/20 rounded-full animate-pulse" />
                  <div className="absolute inset-4 bg-[#006a60]/30 rounded-full animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <DollarSign className="w-20 h-20 md:w-28 md:h-28" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
