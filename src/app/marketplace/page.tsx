'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AccountCard from '@/components/AccountCard';
import { api, Listing } from '@/lib/supabase';
import { Filter, RotateCcw, X, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function Marketplace() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  
  // Filters State
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(5000000);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  
  // Mobile filter toggle
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  useEffect(() => {
    // Get listings
    api.getListings().then(data => {
      setListings(data);
      setFilteredListings(data);
    });
  }, []);

  // Filter effect
  useEffect(() => {
    // Only show active listings on public marketplace
    let result = listings.filter(item => item.status === 'active');

    // Platform Filter
    if (selectedPlatforms.length > 0) {
      result = result.filter(item => selectedPlatforms.includes(item.platform));
    }

    // Price Filter
    result = result.filter(item => item.price <= maxPrice);

    // Verification Filter
    if (verifiedOnly) {
      result = result.filter(item => item.verification_status === 'verified');
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.handle.toLowerCase().includes(query) || 
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    // Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'followers-desc') {
      result.sort((a, b) => b.followers - a.followers);
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredListings(result);
  }, [listings, selectedPlatforms, maxPrice, verifiedOnly, searchQuery, sortBy]);

  const togglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const clearFilters = () => {
    setSelectedPlatforms([]);
    setMaxPrice(5000000);
    setVerifiedOnly(false);
    setSearchQuery('');
    setSortBy('newest');
  };

  return (
    <>
      <Navbar />
      
      <main className="pt-24 pb-20 max-w-[1280px] mx-auto px-4 md:px-12">
        {/* Marketplace Header */}
        <section className="mb-12 border-b border-[#cbc3d9]/40 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-space font-black text-3xl md:text-5xl text-[#191c1e] mb-4">
                Premium Account Marketplace
              </h1>
              <p className="text-base text-[#494456] leading-relaxed max-w-2xl">
                PromoNow is the industry's most secure exchange for high-authority social media assets. Verified followers, clean history, instant transfer.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="bg-[#4af8e3]/20 text-[#006f64] px-4 py-2 rounded-full font-space font-bold text-xs border border-[#4af8e3]">
                🛡️ 12.4k Verified Assets
              </span>
            </div>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24 space-y-8 bg-white border border-[#cbc3d9]/40 p-6 rounded-2xl shadow-xs">
              <div className="flex justify-between items-center">
                <h3 className="font-space font-extrabold text-sm uppercase tracking-wider text-[#191c1e]">Filters</h3>
                <button 
                  onClick={clearFilters}
                  className="text-xs text-[#4800b2] hover:underline font-space font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear All
                </button>
              </div>

              {/* Platform */}
              <div>
                <h4 className="font-space font-bold text-xs text-[#7a7488] uppercase tracking-wider mb-4">Platform</h4>
                <div className="space-y-3">
                  {['instagram', 'tiktok', 'facebook', 'twitter'].map(p => (
                    <label key={p} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox"
                        checked={selectedPlatforms.includes(p)}
                        onChange={() => togglePlatform(p)}
                        className="w-4 h-4 rounded border-[#cbc3d9] text-[#4800b2] focus:ring-[#4800b2]"
                      />
                      <span className="font-space text-xs text-[#494456] group-hover:text-[#4800b2] transition-colors capitalize">
                        {p}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-space font-bold text-xs text-[#7a7488] uppercase tracking-wider mb-4">Price Range</h4>
                <div className="space-y-4">
                  <input 
                    type="range" 
                    min="5000" 
                    max="5000000" 
                    step="5000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full h-2 bg-[#f2f4f7] rounded-lg appearance-none cursor-pointer accent-[#4800b2]"
                  />
                  <div className="flex justify-between font-space font-bold text-[10px] text-[#494456]">
                    <span>₦5,000</span>
                    <span className="text-[#4800b2] text-xs">₦{maxPrice.toLocaleString()} Max</span>
                  </div>
                </div>
              </div>

              {/* Verification */}
              <div>
                <h4 className="font-space font-bold text-xs text-[#7a7488] uppercase tracking-wider mb-4">Verification</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="verification"
                      checked={verifiedOnly}
                      onChange={() => setVerifiedOnly(true)}
                      className="w-4 h-4 border-[#cbc3d9] text-[#4800b2] focus:ring-[#4800b2]"
                    />
                    <span className="font-space text-xs text-[#494456] group-hover:text-[#4800b2]">Verified Only</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="verification"
                      checked={!verifiedOnly}
                      onChange={() => setVerifiedOnly(false)}
                      className="w-4 h-4 border-[#cbc3d9] text-[#4800b2] focus:ring-[#4800b2]"
                    />
                    <span className="font-space text-xs text-[#494456] group-hover:text-[#4800b2]">All Accounts</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Grid Content */}
          <div className="flex-grow space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#cbc3d9]/20 pb-4">
              <p className="font-space font-bold text-sm text-[#494456]">
                Showing {filteredListings.length} accounts available
              </p>
              
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button 
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-1.5 border border-[#cbc3d9] px-4 py-2 rounded-xl text-xs font-space font-bold cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" /> Filters
                </button>

                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-[10px] uppercase font-space font-bold text-[#7a7488]">Sort by:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent border-none font-space font-bold text-xs focus:ring-0 cursor-pointer text-[#4800b2]"
                  >
                    <option value="newest">Newest Listed</option>
                    <option value="followers-desc">Followers (High to Low)</option>
                    <option value="price-asc">Price (Low to High)</option>
                    <option value="price-desc">Price (High to Low)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Main Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredListings.map(listing => (
                <AccountCard key={listing.id} listing={listing} />
              ))}

              {/* Call To Action placeholder */}
              <Link 
                href="/sell"
                className="bg-[#f7f9fc] border-2 border-dashed border-[#cbc3d9] rounded-xl p-6 flex flex-col items-center justify-center text-center group hover:border-[#4800b2] transition-colors"
              >
                <div className="w-14 h-14 bg-[#4800b2]/5 text-[#4800b2] rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <PlusCircle className="w-8 h-8" />
                </div>
                <h3 className="font-space font-extrabold text-base text-[#191c1e] mb-1">Sell Your Account</h3>
                <p className="text-xs text-[#7a7488] mb-4 max-w-[200px]">
                  List your social assets and reach thousands of verified buyers on PromoNow.
                </p>
                <span className="text-xs font-space font-bold text-[#4800b2] border-b border-[#4800b2] pb-0.5">
                  Get Started Now
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Filters Drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
            <div className="bg-white w-80 h-full p-6 space-y-8 overflow-y-auto animate-in slide-in-from-right duration-200">
              <div className="flex justify-between items-center border-b border-[#cbc3d9]/20 pb-4">
                <h3 className="font-space font-extrabold text-sm uppercase tracking-wider text-[#191c1e]">Filters</h3>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 cursor-pointer hover:bg-neutral-100 rounded-full"
                >
                  <X className="w-5 h-5 text-neutral-600" />
                </button>
              </div>

              {/* Platform */}
              <div>
                <h4 className="font-space font-bold text-xs text-[#7a7488] uppercase tracking-wider mb-4">Platform</h4>
                <div className="space-y-3">
                  {['instagram', 'tiktok', 'facebook', 'twitter'].map(p => (
                    <label key={p} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox"
                        checked={selectedPlatforms.includes(p)}
                        onChange={() => togglePlatform(p)}
                        className="w-4 h-4 rounded border-[#cbc3d9] text-[#4800b2] focus:ring-[#4800b2]"
                      />
                      <span className="font-space text-xs text-[#494456] capitalize">
                        {p}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-space font-bold text-xs text-[#7a7488] uppercase tracking-wider mb-4">Price Range</h4>
                <div className="space-y-4">
                  <input 
                    type="range" 
                    min="5000" 
                    max="5000000" 
                    step="5000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full h-2 bg-[#f2f4f7] rounded-lg appearance-none cursor-pointer accent-[#4800b2]"
                  />
                  <div className="flex justify-between font-space font-bold text-[10px] text-[#494456]">
                    <span>₦5,000</span>
                    <span className="text-[#4800b2] text-xs">₦{maxPrice.toLocaleString()} Max</span>
                  </div>
                </div>
              </div>

              {/* Verification */}
              <div>
                <h4 className="font-space font-bold text-xs text-[#7a7488] uppercase tracking-wider mb-4">Verification</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="verification-mobile"
                      checked={verifiedOnly}
                      onChange={() => setVerifiedOnly(true)}
                      className="w-4 h-4 border-[#cbc3d9] text-[#4800b2] focus:ring-[#4800b2]"
                    />
                    <span className="font-space text-xs text-[#494456]">Verified Only</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="verification-mobile"
                      checked={!verifiedOnly}
                      onChange={() => setVerifiedOnly(false)}
                      className="w-4 h-4 border-[#cbc3d9] text-[#4800b2] focus:ring-[#4800b2]"
                    />
                    <span className="font-space text-xs text-[#494456]">All Accounts</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-[#cbc3d9]/20">
                <button 
                  onClick={clearFilters}
                  className="flex-1 border border-[#cbc3d9] py-3 text-xs font-space font-bold rounded-xl cursor-pointer hover:bg-neutral-50"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 bg-[#4800b2] text-white py-3 text-xs font-space font-bold rounded-xl cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
