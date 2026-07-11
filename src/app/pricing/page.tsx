'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Check, HelpCircle, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Standard Listing',
      price: 'Free',
      period: '',
      description: 'Perfect for creators wanting to test the market value of their digital assets.',
      features: [
        'List 1 active social account',
        'Basic manual validation (up to 72h)',
        'Direct Paystack checkout',
        'No escrow transaction fee',
        'Community forum support'
      ],
      cta: 'List Account Free',
      ctaLink: '/sell',
      accent: false
    },
    {
      name: 'Verified Premium',
      price: billingPeriod === 'monthly' ? '₦15,000' : '₦10,000',
      period: '/ month',
      description: 'Designed for serious sellers who want maximum visibility and rapid verification.',
      features: [
        'Unlimited active listings',
        'Priority verification (under 12h)',
        'Highlighted "Verified Seller" badge',
        'Premium listing placement in browse',
        'Direct Paystack checkout',
        'Direct chat support'
      ],
      cta: 'Sign Up for Promotion',
      ctaLink: '/profile',
      accent: true,
      badge: 'Most Popular'
    },
    {
      name: 'Elite Broker',
      price: billingPeriod === 'monthly' ? '₦50,000' : '₦35,000',
      period: '/ month',
      description: 'For agencies, brokers, and digital brokers managing high-volume portfolio transitions.',
      features: [
        'Everything in Verified Premium',
        'Dedicated trade support officer',
        'Off-market listing support',
        'Custom landing pages for assets',
        'Direct Paystack checkout',
        'API access for bulk account syncing',
        '24/7 Phone & Zoom support'
      ],
      cta: 'Sign Up for Elite Promotion',
      ctaLink: '/profile',
      accent: false
    }
  ];

  const faqs = [
    {
      q: 'How do marketplace payments work?',
      a: 'Choose a listing, enter your receipt email, and complete the exact listed payment on Paystack. PromoNow verifies the payment before completing the purchase.'
    },
    {
      q: 'Is there an extra payment fee?',
      a: 'PromoNow does not add an escrow fee. The checkout total shown on the listing is the amount sent to Paystack.'
    },
    {
      q: 'What happens if a buyer doesn\'t receive the account?',
      a: 'Contact PromoNow support with your Paystack reference so the purchase and delivery record can be reviewed.'
    },
    {
      q: 'Can I cancel my subscription at any time?',
      a: 'Yes, you can cancel your subscription from your account profile settings at any time. Your premium badges and priority verification will remain active until the end of the current billing cycle.'
    }
  ];

  return (
    <>
      <Navbar />

      <main className="pt-24 pb-20">
        {/* Header */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-12 text-center space-y-6 py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4800b2]/5 rounded-full border border-[#4800b2]/20">
            <Sparkles className="w-4 h-4 text-[#4800b2]" />
            <span className="font-space text-[10px] font-bold text-[#4800b2] uppercase tracking-widest">
              Simple, High-Trust Pricing
            </span>
          </div>
          
          <h1 className="font-space font-black text-4xl md:text-6xl text-[#191c1e] tracking-tight max-w-2xl mx-auto leading-tight">
            Transparent plans for serious creators.
          </h1>
          <p className="text-sm md:text-base text-[#494456] max-w-md mx-auto leading-relaxed">
            Choose a plan that fits your social assets portfolio size. List for free or upgrade to maximize buyer conversion.
          </p>

          {/* Toggle switcher */}
          <div className="flex items-center justify-center gap-4 pt-6">
            <span className={`text-xs font-space font-bold ${billingPeriod === 'monthly' ? 'text-[#4800b2]' : 'text-[#7a7488]'}`}>Monthly Billing</span>
            <button 
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
              className="w-12 h-6 bg-[#f2f4f7] rounded-full p-1 transition-colors relative focus:outline-none cursor-pointer border border-[#cbc3d9]/40"
            >
              <div className={`w-4 h-4 bg-[#4800b2] rounded-full transition-transform ${billingPeriod === 'annual' ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-xs font-space font-bold ${billingPeriod === 'annual' ? 'text-[#4800b2]' : 'text-[#7a7488]'}`}>
              Annual Billing <span className="bg-[#006f64]/10 text-[#006f64] text-[9px] px-2 py-0.5 rounded-full ml-1 font-bold">Save 30%</span>
            </span>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white border rounded-2xl p-8 flex flex-col justify-between relative transition-all duration-300 ${
                plan.accent 
                  ? 'border-[#4800b2] shadow-lg shadow-[#4800b2]/5 ring-2 ring-[#4800b2]/10 scale-105 z-10' 
                  : 'border-[#cbc3d9]/40 shadow-xs hover:border-[#4800b2]/30'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4800b2] text-white px-3 py-1 rounded-full font-space font-bold text-[9px] uppercase tracking-wider">
                  {plan.badge}
                </span>
              )}

              <div>
                <h3 className="font-space font-black text-xl text-[#191c1e] mb-2">{plan.name}</h3>
                <p className="text-xs text-[#7a7488] leading-relaxed mb-6">{plan.description}</p>
                
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="font-space font-black text-4xl md:text-5xl text-[#191c1e]">
                    {plan.price}
                  </span>
                  <span className="text-xs text-[#7a7488] font-bold">
                    {plan.period}
                  </span>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] uppercase font-space font-bold text-[#7a7488] tracking-widest">Included Features</p>
                  <ul className="space-y-3.5">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[#494456] leading-tight">
                        <Check className="w-4 h-4 text-[#006a60] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Link 
                  href={plan.ctaLink}
                  className={`w-full py-4.5 rounded-xl font-space font-bold text-xs tracking-wider flex items-center justify-center cursor-pointer transition-colors ${
                    plan.accent 
                      ? 'bg-[#4800b2] text-white hover:bg-[#4800b2]/90 shadow-md' 
                      : 'bg-[#f7f9fc] text-[#191c1e] border border-[#cbc3d9]/60 hover:bg-[#f2f4f7]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </section>

        {/* Pricing FAQs */}
        <section className="max-w-2xl mx-auto px-4 pt-32 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-space font-black text-2xl md:text-3xl text-[#191c1e]">Frequently Asked Questions</h2>
            <p className="text-xs text-[#7a7488]">Everything you need to know about listing audits and direct Paystack payments.</p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="p-6 bg-white border border-[#cbc3d9]/30 rounded-xl space-y-2">
                <h4 className="font-space font-bold text-sm text-[#191c1e] flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-[#4800b2] shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-[#494456] leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
