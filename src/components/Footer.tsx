import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#191c1e] py-16 border-t border-[#cbc3d9]/10 text-white mt-auto">
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-6">
          <span className="font-space font-black text-2xl tracking-tight text-[#cfbdff]">
            PromoNow
          </span>
          <p className="text-sm text-[#cbc3d9] opacity-70 leading-relaxed max-w-xs">
            The global standard for secure social media account brokerage. Empowering creators and digital marketers since 2018.
          </p>
          <p className="text-xs text-[#cbc3d9] opacity-70">
            Support: <a href="tel:09135329499" className="text-white hover:text-[#4af8e3] font-space font-bold transition-colors">09135329499</a>
          </p>
          <p className="text-xs text-[#cbc3d9] opacity-40">
            © 2026 PromoNow. Secure Digital Asset Exchange.
          </p>
        </div>
        
        <div>
          <h4 className="font-space font-bold text-xs uppercase tracking-wider text-[#4af8e3] mb-6">Marketplace</h4>
          <ul className="space-y-3 text-sm text-[#cbc3d9] opacity-80">
            <li><Link href="/marketplace?platform=instagram" className="hover:text-[#4af8e3] transition-colors">Instagram Accounts</Link></li>
            <li><Link href="/marketplace?platform=tiktok" className="hover:text-[#4af8e3] transition-colors">TikTok Channels</Link></li>
            <li><Link href="/marketplace?platform=facebook" className="hover:text-[#4af8e3] transition-colors">Facebook Pages</Link></li>
            <li><Link href="/marketplace?platform=twitter" className="hover:text-[#4af8e3] transition-colors">Verified handles (X)</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-space font-bold text-xs uppercase tracking-wider text-[#4af8e3] mb-6">Services</h4>
          <ul className="space-y-3 text-sm text-[#cbc3d9] opacity-80">
            <li><Link href="#" className="hover:text-[#4af8e3] transition-colors">Escrow Protection</Link></li>
            <li><Link href="#" className="hover:text-[#4af8e3] transition-colors">Account Appraisals</Link></li>
            <li><Link href="#" className="hover:text-[#4af8e3] transition-colors">Audience Auditing</Link></li>
            <li><Link href="#" className="hover:text-[#4af8e3] transition-colors">Safety FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-space font-bold text-xs uppercase tracking-wider text-[#4af8e3] mb-6">Security Escrow</h4>
          <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
            <p className="text-xs text-[#cbc3d9] leading-relaxed mb-3">
              All transactions are secured by our proprietary multi-signature digital escrow system. Handovers are completed within 24h.
            </p>
            <div className="flex items-center gap-2 text-[#4af8e3]">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span className="font-space font-bold text-[10px] uppercase tracking-wider">ESCROW SECURED</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-12 mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#cbc3d9]/40">
        <div>All rights reserved. Designed for modern digital entrepreneurs.</div>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-[#4af8e3] transition-colors">Terms of Trade</Link>
          <Link href="#" className="hover:text-[#4af8e3] transition-colors">Privacy Hub</Link>
          <Link href="#" className="hover:text-[#4af8e3] transition-colors">Telegram Support</Link>
        </div>
      </div>
    </footer>
  );
}
