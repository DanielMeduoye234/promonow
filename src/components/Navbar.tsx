'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  User,
  Search,
  Shield,
  LogOut,
  LogIn,
  RotateCcw,
  Sparkles,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { db, api, Profile } from '@/lib/supabase';

export default function Navbar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingAudits, setPendingAudits] = useState(0);

  useEffect(() => {
    // Load profiles and set default active user
    api.getProfiles().then(profiles => {
      setAllProfiles(profiles);
      
      // Check if there is an active user stored
      const savedUser = localStorage.getItem('promonow_current_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      } else {
        // Default to a regular buyer/seller profile
        const defaultUser = profiles.find(p => p.username === 'EliteBroker_Assets') || profiles[0];
        setCurrentUser(defaultUser);
        localStorage.setItem('promonow_current_user', JSON.stringify(defaultUser));
      }
    });
  }, []);

  // Admin notification: count member listings awaiting audit.
  // The bell badge only renders for admins, so no reset is needed otherwise.
  useEffect(() => {
    if (!currentUser?.is_admin) return;

    const refreshPending = () => {
      api.getListings().then(listings => {
        setPendingAudits(listings.filter(l => l.verification_status === 'pending').length);
      }).catch(() => setPendingAudits(0));
    };

    refreshPending();
    const interval = setInterval(refreshPending, 30000);
    return () => clearInterval(interval);
  }, [currentUser?.is_admin]);

  const switchUser = (profile: Profile) => {
    setCurrentUser(profile);
    localStorage.setItem('promonow_current_user', JSON.stringify(profile));
    setShowUserMenu(false);
    // Reload page to reflect user changes
    window.location.reload();
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'camera_alt';
      case 'tiktok': return 'play_circle';
      case 'facebook': return 'diversity_3';
      case 'youtube': return 'smart_display';
      case 'twitter': return 'chat_bubble';
      default: return 'public';
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-[#cbc3d9]/50 h-16 flex items-center shadow-xs">
      <div className="max-w-[1280px] mx-auto w-full px-4 md:px-12 flex justify-between items-center">
        
        {/* Left Section: Logo & Main Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-space font-black text-2xl tracking-tight text-[#4800b2] flex items-center gap-1">
              Promo<span className="text-[#006a60]">Now</span>
            </span>
          </Link>
          
          <div className="hidden md:flex gap-6 items-center">
            <Link 
              href="/marketplace" 
              className={`font-space font-bold text-sm tracking-wide transition-colors ${
                pathname === '/marketplace' ? 'text-[#4800b2] border-b-2 border-[#4800b2] pb-1' : 'text-[#494456] hover:text-[#4800b2]'
              }`}
            >
              Marketplace
            </Link>
            <Link 
              href="/sell" 
              className={`font-space font-bold text-sm tracking-wide transition-colors ${
                pathname === '/sell' ? 'text-[#4800b2] border-b-2 border-[#4800b2] pb-1' : 'text-[#494456] hover:text-[#4800b2]'
              }`}
            >
              List Account
            </Link>
            <Link
              href="/services"
              className={`font-space font-bold text-sm tracking-wide transition-colors ${
                pathname === '/services' ? 'text-[#4800b2] border-b-2 border-[#4800b2] pb-1' : 'text-[#494456] hover:text-[#4800b2]'
              }`}
            >
              Services
            </Link>
            <Link
              href="/stats"
              className={`font-space font-bold text-sm tracking-wide transition-colors ${
                pathname === '/stats' ? 'text-[#4800b2] border-b-2 border-[#4800b2] pb-1' : 'text-[#494456] hover:text-[#4800b2]'
              }`}
            >
              Followers &amp; Likes
            </Link>
            <Link
              href="/pricing"
              className={`font-space font-bold text-sm tracking-wide transition-colors ${
                pathname === '/pricing' ? 'text-[#4800b2] border-b-2 border-[#4800b2] pb-1' : 'text-[#494456] hover:text-[#4800b2]'
              }`}
            >
              Pricing
            </Link>
            
            {currentUser?.is_admin && (
              <Link 
                href="/admin" 
                className={`font-space font-bold text-sm tracking-wide flex items-center gap-1 text-[#006a60] hover:opacity-85 ${
                  pathname.startsWith('/admin') ? 'border-b-2 border-[#006a60] pb-1' : ''
                }`}
              >
                <Shield className="w-4 h-4" /> Admin Console
              </Link>
            )}
          </div>
        </div>

        {/* Right Section: Search, User Switcher, Cart */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex relative w-64">
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#F2F4F7] text-sm border-none rounded-lg py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-[#4800b2]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a7488]" />
          </div>

          {currentUser?.is_admin && (
            <Link
              href="/admin"
              className="relative p-2 text-[#494456] hover:text-[#4800b2] transition-colors"
              title={pendingAudits > 0 ? `${pendingAudits} listing(s) awaiting audit` : 'No pending audits'}
            >
              <Bell className="w-5 h-5" />
              {pendingAudits > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-space font-bold rounded-full flex items-center justify-center">
                  {pendingAudits}
                </span>
              )}
            </Link>
          )}

          <div className="relative">
            {/* Persona Switcher / User Profile Indicator */}
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 bg-[#f7f9fc] hover:bg-[#eceef1] border border-[#cbc3d9]/40 py-1.5 px-3 rounded-full cursor-pointer transition-colors"
            >
              <div className={`w-2 h-2 rounded-full ${currentUser?.is_admin ? 'bg-red-500' : 'bg-emerald-500'}`} />
              <span className="font-space font-bold text-xs text-[#191c1e]">
                {currentUser?.username}
              </span>
              <User className="w-4 h-4 text-[#494456]" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#cbc3d9]/40 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-[#cbc3d9]/20">
                  <p className="text-[10px] uppercase font-bold text-[#7a7488] tracking-widest">Active Identity</p>
                  <p className="font-space font-bold text-sm text-[#191c1e] mt-1">{currentUser?.username}</p>
                  <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full mt-1 font-bold ${
                    currentUser?.is_admin ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {currentUser?.is_admin ? 'Administrator Role' : 'Seller / Buyer Profile'}
                  </span>
                </div>
                
                <div className="p-2">
                  <p className="text-[10px] uppercase font-bold text-[#7a7488] tracking-widest px-2 py-1">Quick Role Simulation</p>
                  {allProfiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => switchUser(p)}
                      className={`w-full text-left font-space text-xs py-2 px-3 rounded-lg flex items-center justify-between cursor-pointer ${
                        currentUser?.id === p.id ? 'bg-[#4800b2]/5 text-[#4800b2] font-bold' : 'hover:bg-[#f7f9fc] text-[#494456]'
                      }`}
                    >
                      <span>{p.username}</span>
                      <span className="text-[10px] opacity-75 font-normal">
                        {p.is_admin ? 'Admin' : `Rep: ${p.reputation}%`}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-[#cbc3d9]/20 p-1 mt-1 space-y-1">
                  <Link 
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full text-left font-space text-xs py-2 px-3 hover:bg-[#f7f9fc] rounded-lg flex items-center gap-2 cursor-pointer text-[#494456]"
                  >
                    <User className="w-3.5 h-3.5" />
                    My Workspace Profile
                  </Link>
                  <Link 
                    href="/login"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full text-left font-space text-xs py-2 px-3 hover:bg-[#f7f9fc] rounded-lg flex items-center gap-2 cursor-pointer text-[#494456]"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Open Login Portal
                  </Link>
                  <button 
                    onClick={() => {
                      localStorage.clear();
                      window.location.reload();
                    }}
                    className="w-full text-left font-space text-xs py-2 px-3 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Simulated DB
                  </button>
                </div>
              </div>
            )}
          </div>

          <Link href="/marketplace" className="p-2 cursor-pointer text-[#494456] hover:text-[#4800b2] relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#4800b2] rounded-full" />
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#494456] hover:text-[#4800b2] focus:outline-none cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-[#cbc3d9]/50 shadow-md py-4 px-6 md:hidden flex flex-col gap-4 animate-in fade-in slide-in-from-top-3 duration-200 z-45">
          <Link 
            href="/marketplace" 
            onClick={() => setMobileMenuOpen(false)}
            className={`font-space font-bold text-sm py-2 tracking-wide transition-colors ${
              pathname === '/marketplace' ? 'text-[#4800b2]' : 'text-[#494456] hover:text-[#4800b2]'
            }`}
          >
            Marketplace
          </Link>
          <Link 
            href="/sell" 
            onClick={() => setMobileMenuOpen(false)}
            className={`font-space font-bold text-sm py-2 tracking-wide transition-colors ${
              pathname === '/sell' ? 'text-[#4800b2]' : 'text-[#494456] hover:text-[#4800b2]'
            }`}
          >
            List Account
          </Link>
          <Link 
            href="/services" 
            onClick={() => setMobileMenuOpen(false)}
            className={`font-space font-bold text-sm py-2 tracking-wide transition-colors ${
              pathname === '/services' ? 'text-[#4800b2]' : 'text-[#494456] hover:text-[#4800b2]'
            }`}
          >
            Services
          </Link>
          <Link
            href="/stats"
            onClick={() => setMobileMenuOpen(false)}
            className={`font-space font-bold text-sm py-2 tracking-wide transition-colors ${
              pathname === '/stats' ? 'text-[#4800b2]' : 'text-[#494456] hover:text-[#4800b2]'
            }`}
          >
            Followers &amp; Likes
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className={`font-space font-bold text-sm py-2 tracking-wide transition-colors ${
              pathname === '/pricing' ? 'text-[#4800b2]' : 'text-[#494456] hover:text-[#4800b2]'
            }`}
          >
            Pricing
          </Link>
          {currentUser?.is_admin && (
            <Link 
              href="/admin" 
              onClick={() => setMobileMenuOpen(false)}
              className={`font-space font-bold text-sm py-2 tracking-wide flex items-center gap-1.5 transition-colors ${
                pathname.startsWith('/admin') ? 'text-[#006a60]' : 'text-[#006a60]/80 hover:text-[#006a60]'
              }`}
            >
              <Shield className="w-4 h-4" /> Admin Console
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
