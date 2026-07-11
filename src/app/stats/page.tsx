'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api, Listing } from '@/lib/supabase';
import { Users, Heart, TrendingUp, BarChart3, Sparkles, Loader2, BadgeCheck } from 'lucide-react';
import Link from 'next/link';

const PLATFORM_LABELS: Record<Listing['platform'], string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  youtube: 'YouTube',
  twitter: 'Twitter / X'
};

function formatCount(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return value.toLocaleString();
}

export default function Stats() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<'all' | Listing['platform']>('all');

  useEffect(() => {
    api.getListings()
      .then(data => setListings(data))
      .catch(err => console.error('Error loading listings for stats:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = (platformFilter === 'all'
    ? listings
    : listings.filter(l => l.platform === platformFilter)
  ).slice().sort((a, b) => b.followers - a.followers);

  const totalFollowers = filtered.reduce((sum, l) => sum + l.followers, 0);
  const totalLikes = filtered.reduce((sum, l) => sum + l.avg_likes, 0);
  const avgEngagement = filtered.length > 0
    ? filtered.reduce((sum, l) => sum + l.engagement_rate, 0) / filtered.length
    : 0;

  const kpis = [
    { label: 'Total Followers', value: formatCount(totalFollowers), icon: Users, color: 'text-[#4800b2] bg-[#4800b2]/5 border-[#4800b2]/20' },
    { label: 'Total Avg Likes', value: formatCount(totalLikes), icon: Heart, color: 'text-red-600 bg-red-50 border-red-100' },
    { label: 'Avg Engagement', value: avgEngagement.toFixed(2) + '%', icon: TrendingUp, color: 'text-[#006a60] bg-emerald-50 border-emerald-100' },
    { label: 'Accounts Tracked', value: filtered.length.toLocaleString(), icon: BarChart3, color: 'text-[#191c1e] bg-[#f2f4f7] border-[#cbc3d9]/40' }
  ];

  return (
    <>
      <Navbar />

      <main className="pt-24 pb-20 px-4 md:px-12 max-w-[1280px] mx-auto space-y-10">

        {/* Header */}
        <section className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4800b2]/5 rounded-full border border-[#4800b2]/20">
            <Sparkles className="w-4 h-4 text-[#4800b2]" />
            <span className="font-space text-[10px] font-bold text-[#4800b2] uppercase tracking-widest">
              Live Marketplace Metrics
            </span>
          </div>
          <h1 className="font-space font-black text-3xl md:text-5xl text-[#191c1e] tracking-tight">
            Follower &amp; Like Count
          </h1>
          <p className="text-sm text-[#494456] max-w-md mx-auto leading-relaxed">
            Audience reach and engagement across every account listed on PromoNow.
          </p>
        </section>

        {/* KPI Tiles */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-white border border-[#cbc3d9]/40 rounded-2xl p-5 md:p-6 space-y-3 shadow-xs">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="font-space font-black text-2xl md:text-3xl text-[#191c1e]">
                  {loading ? '—' : kpi.value}
                </p>
                <p className="text-[10px] uppercase font-space font-bold text-[#7a7488] tracking-widest mt-1">
                  {kpi.label}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Platform filter */}
        <section className="flex flex-wrap gap-2">
          {(['all', 'instagram', 'tiktok', 'facebook', 'youtube', 'twitter'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={`px-4 py-1.5 rounded-full font-space font-bold text-xs cursor-pointer transition-colors border ${
                platformFilter === p
                  ? 'bg-[#4800b2] text-white border-[#4800b2]'
                  : 'bg-white text-[#494456] border-[#cbc3d9]/60 hover:border-[#4800b2]/40'
              }`}
            >
              {p === 'all' ? 'All Platforms' : PLATFORM_LABELS[p]}
            </button>
          ))}
        </section>

        {/* Accounts table */}
        <section className="bg-white border border-[#cbc3d9]/40 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-[#cbc3d9]/20 bg-[#f7f9fc]">
            <h3 className="font-space font-black text-sm text-[#191c1e] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#4800b2]" /> Account Reach Breakdown
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-xs text-[#7a7488]">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading metrics...
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-[#7a7488] text-center py-16">
              No accounts found for this platform yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#cbc3d9]/20">
                    <th className="px-5 py-3 text-[10px] uppercase font-space font-bold text-[#7a7488] tracking-widest">Account</th>
                    <th className="px-5 py-3 text-[10px] uppercase font-space font-bold text-[#7a7488] tracking-widest">Platform</th>
                    <th className="px-5 py-3 text-[10px] uppercase font-space font-bold text-[#7a7488] tracking-widest text-right">Followers</th>
                    <th className="px-5 py-3 text-[10px] uppercase font-space font-bold text-[#7a7488] tracking-widest text-right">Avg Likes</th>
                    <th className="px-5 py-3 text-[10px] uppercase font-space font-bold text-[#7a7488] tracking-widest text-right">Engagement</th>
                    <th className="px-5 py-3 text-[10px] uppercase font-space font-bold text-[#7a7488] tracking-widest text-right">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(l => (
                    <tr key={l.id} className="border-b border-[#cbc3d9]/10 last:border-b-0 hover:bg-[#f7f9fc] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-space font-black text-sm text-[#191c1e]">{l.handle}</span>
                          {l.verification_status === 'verified' && (
                            <BadgeCheck className="w-4 h-4 text-[#006a60]" />
                          )}
                        </div>
                        <p className="text-[10px] text-[#7a7488] mt-0.5">{l.category}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-space font-bold text-[10px] uppercase tracking-wider text-[#4800b2] bg-[#4800b2]/5 px-2.5 py-1 rounded-full">
                          {PLATFORM_LABELS[l.platform]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-space font-black text-sm text-[#191c1e]">{l.followers.toLocaleString()}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-space font-bold text-sm text-red-600 inline-flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5" /> {l.avg_likes.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-space font-bold text-sm text-[#006a60]">{l.engagement_rate}%</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/marketplace/${l.id}`}
                          className="text-xs font-space font-bold text-[#4800b2] hover:underline"
                        >
                          View Listing
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Growth promotion CTA */}
        <section className="bg-[#4800b2] rounded-3xl p-8 md:p-12 text-center space-y-4 shadow-sm">
          <h2 className="font-space font-black text-2xl md:text-3xl text-white">
            Want numbers like these on your own page?
          </h2>
          <p className="text-sm text-white/80 max-w-md mx-auto leading-relaxed">
            Tell us your platform and the follower count you want to hit — campaigns start from just ₦10,000.
          </p>
          <Link
            href="/promote"
            className="inline-flex items-center gap-2 bg-white text-[#4800b2] px-6 py-3 rounded-xl font-space font-bold text-xs tracking-wider hover:opacity-90 transition-opacity"
          >
            Sign Up for Promotion
          </Link>
        </section>

      </main>

      <Footer />
    </>
  );
}
