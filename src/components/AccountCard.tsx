import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Flame, 
  Clock 
} from 'lucide-react';
import { Listing } from '@/lib/supabase';

// Brand SVGs
const InstagramIcon = () => (
  <svg className="w-5 h-5 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const YoutubeIcon = () => (
  <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-5 h-5 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
  </svg>
);

interface AccountCardProps {
  listing: Listing;
}

export default function AccountCard({ listing }: AccountCardProps) {
  const getPlatformDetails = (platform: Listing['platform']) => {
    switch (platform) {
      case 'instagram':
        return {
          icon: <InstagramIcon />,
          bg: 'bg-pink-50 text-pink-700 border-pink-100',
          label: 'Instagram'
        };
      case 'tiktok':
        return {
          icon: <span className="font-space font-extrabold text-[#111] text-xs">𝄓 TikTok</span>,
          bg: 'bg-neutral-50 text-neutral-800 border-neutral-200',
          label: 'TikTok'
        };
      case 'facebook':
        return {
          icon: <FacebookIcon />,
          bg: 'bg-blue-50 text-blue-700 border-blue-100',
          label: 'Facebook'
        };
      case 'youtube':
        return {
          icon: <YoutubeIcon />,
          bg: 'bg-red-50 text-red-700 border-red-100',
          label: 'YouTube'
        };
      case 'twitter':
        return {
          icon: <TwitterIcon />,
          bg: 'bg-sky-50 text-sky-700 border-sky-100',
          label: 'Twitter / X'
        };
    }
  };

  const platformInfo = getPlatformDetails(listing.platform);

  // Helper to format numbers like 124500 to 124.5K
  const formatFollowers = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };

  return (
    <div className={`bg-white border rounded-xl p-6 transition-all hover-lift group flex flex-col justify-between ${
      listing.is_promoted 
        ? 'border-[#4800b2] shadow-sm shadow-[#4800b2]/10 ring-2 ring-[#4800b2]/5' 
        : 'border-[#cbc3d9]/40'
    }`}>
      <div>
        {/* Header: Platform & Verification Status */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1 border rounded-lg ${platformInfo.bg}`}>
              {platformInfo.icon}
              <span className="font-space font-bold text-[10px] tracking-wide uppercase">
                {platformInfo.label}
              </span>
            </div>
            {listing.is_promoted && (
              <span className="bg-purple-100 text-[#4800b2] px-2 py-0.5 rounded-full font-space font-bold text-[9px] border border-purple-200 tracking-wider">
                ★ PROMOTED
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            {listing.verification_status === 'verified' && (
              <span className="bg-emerald-50 text-[#006f64] px-2.5 py-1 rounded-full font-space font-bold text-[9px] tracking-wider border border-emerald-100 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#006f64]" /> VERIFIED
              </span>
            )}

            {listing.status === 'pending' && (
              <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-space font-bold text-[9px] tracking-wider border border-amber-100 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-700" /> PENDING AUDIT
              </span>
            )}
          </div>
        </div>

        {/* Followers & Title */}
        <div className="mb-4">
          <h2 className="font-space font-extrabold text-3xl text-[#191c1e] tracking-tight">
            {formatFollowers(listing.followers)}
          </h2>
          <p className="text-xs text-[#7a7488] font-medium mt-1">
            {listing.category} {listing.aged_year ? `• Aged ${listing.aged_year}` : ''}
          </p>
        </div>

        {/* Badges / Metrics */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="bg-[#F2F4F7] text-[#494456] text-[10px] px-2 py-1 rounded-md font-space font-bold">
            {listing.audience_region} Audience
          </span>
          <span className="bg-[#F2F4F7] text-[#494456] text-[10px] px-2 py-1 rounded-md font-space font-bold">
            {listing.engagement_rate}% ER
          </span>
          {listing.instant_delivery && (
            <span className="bg-purple-50 text-[#4800b2] text-[10px] px-2 py-1 rounded-md font-space font-bold border border-purple-100 flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5" /> Instant
            </span>
          )}
        </div>
      </div>

      {/* Footer: Price & Details CTA */}
      <div className="pt-4 border-t border-[#cbc3d9]/20 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[#7a7488] block uppercase font-space font-bold tracking-wider">Market Value</span>
          <span className="font-space font-extrabold text-xl text-[#4800b2]">
            ₦{listing.price.toLocaleString()}
          </span>
        </div>
        
        <Link 
          href={`/marketplace/${listing.id}`}
          className="bg-[#191c1e] text-white text-xs px-4 py-2 rounded-lg font-space font-bold tracking-wider cursor-pointer group-hover:bg-[#4800b2] transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
