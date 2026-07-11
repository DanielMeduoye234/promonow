'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api, Profile, WalletTransaction } from '@/lib/supabase';
import { Wallet, Plus, ArrowDownCircle, ArrowUpCircle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000];

export default function WalletPage() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const loadWallet = useCallback(async (userId: string) => {
    try {
      const snap = await api.getWallet(userId);
      setBalance(snap.balance);
      setTransactions(snap.transactions);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not load wallet');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('promonow_current_user');
    if (!saved) {
      setLoading(false);
      return;
    }
    const parsed = JSON.parse(saved) as Profile;
    setCurrentUser(parsed);

    // Returning from Paystack checkout: verify the payment by reference.
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference') || params.get('trxref');
    if (reference) {
      setStatusMsg('Confirming your payment...');
      api.verifyTopup(reference)
        .then(res => {
          if (res.status === 'success') {
            setStatusMsg('✅ Payment confirmed — your wallet has been credited.');
          } else {
            setErrorMsg(`Payment ${res.status}. If you were charged, it will reflect shortly.`);
            setStatusMsg('');
          }
        })
        .catch(err => {
          setErrorMsg(err instanceof Error ? err.message : 'Could not verify payment');
          setStatusMsg('');
        })
        .finally(() => {
          window.history.replaceState({}, '', '/wallet');
          loadWallet(parsed.id);
        });
    } else {
      loadWallet(parsed.id);
    }
  }, [loadWallet]);

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');

    if (!currentUser) return;
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 100) {
      setErrorMsg('Enter an amount of at least ₦100.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Enter an email for your payment receipt.');
      return;
    }

    setSubmitting(true);
    try {
      const { authorization_url } = await api.startTopup(
        currentUser.id,
        email.trim(),
        value,
        `${window.location.origin}/wallet`
      );
      // Hand off to Paystack's hosted checkout.
      window.location.href = authorization_url;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not start payment');
      setSubmitting(false);
    }
  };

  if (!loading && !currentUser) {
    return (
      <>
        <Navbar />
        <main className="min-h-[75vh] flex items-center justify-center pt-24 bg-[#f7f9fc]">
          <div className="text-center space-y-4">
            <p className="text-sm text-[#7a7488]">Please sign in to access your wallet.</p>
            <Link href="/login" className="inline-block bg-[#4800b2] text-white px-6 py-2.5 rounded-xl font-space font-bold text-xs">
              Go to Login
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="pt-24 pb-20 px-4 md:px-12 max-w-[1280px] mx-auto space-y-8">

        <section className="text-center space-y-3 py-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4800b2]/5 rounded-full border border-[#4800b2]/20">
            <Sparkles className="w-4 h-4 text-[#4800b2]" />
            <span className="font-space text-[10px] font-bold text-[#4800b2] uppercase tracking-widest">Secure Wallet</span>
          </div>
          <h1 className="font-space font-black text-3xl md:text-5xl text-[#191c1e] tracking-tight">My Wallet</h1>
        </section>

        {statusMsg && (
          <div className="bg-emerald-50 text-[#006f64] text-xs border border-emerald-100 p-3.5 rounded-xl font-medium text-center">
            {statusMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 text-red-700 text-xs border border-red-100 p-3.5 rounded-xl font-medium text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Balance + top-up */}
          <div className="space-y-6">
            <div className="bg-[#4800b2] rounded-3xl p-8 text-white shadow-sm">
              <p className="text-[10px] uppercase font-space font-bold tracking-widest text-white/70">Available Balance</p>
              <p className="font-space font-black text-4xl md:text-5xl mt-2">
                {loading ? '—' : `₦${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              </p>
              <div className="flex items-center gap-1.5 mt-4 text-white/70 text-[10px] font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Secured by Paystack • 256-bit encryption
              </div>
            </div>

            <div className="bg-white border border-[#cbc3d9]/40 rounded-3xl p-6 md:p-8 shadow-xs space-y-5">
              <h2 className="font-space font-black text-lg text-[#191c1e] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#4800b2]" /> Fund Wallet
              </h2>

              <form onSubmit={handleTopup} className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAmount(String(a))}
                      className={`px-4 py-1.5 rounded-full font-space font-bold text-xs cursor-pointer transition-colors border ${
                        amount === String(a)
                          ? 'bg-[#4800b2] text-white border-[#4800b2]'
                          : 'bg-white text-[#494456] border-[#cbc3d9]/60 hover:border-[#4800b2]/40'
                      }`}
                    >
                      ₦{a.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="block font-space font-bold text-[10px] text-[#7a7488] uppercase tracking-wider">Amount (₦)</label>
                  <input
                    type="number"
                    min={100}
                    placeholder="e.g. 5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#f2f4f7] border-none rounded-xl h-11 px-4 font-space text-xs focus:ring-2 focus:ring-[#4800b2]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-space font-bold text-[10px] text-[#7a7488] uppercase tracking-wider">Email for Receipt</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f2f4f7] border-none rounded-xl h-11 px-4 font-space text-xs focus:ring-2 focus:ring-[#4800b2]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#4800b2] text-white font-space font-bold text-xs tracking-wider rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to Paystack...</>
                  ) : (
                    <>Pay with Paystack</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Transaction history */}
          <div className="bg-white border border-[#cbc3d9]/40 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-[#cbc3d9]/20 bg-[#f7f9fc]">
              <h3 className="font-space font-black text-sm text-[#191c1e] flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#4800b2]" /> Transaction History
              </h3>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-xs text-[#7a7488]">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                </div>
              ) : transactions.length === 0 ? (
                <p className="text-xs text-[#7a7488] text-center py-12">No transactions yet. Fund your wallet to get started.</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map(t => {
                    const isCredit = t.type === 'topup' || t.type === 'refund';
                    return (
                      <div key={t.id} className="flex justify-between items-center border border-[#cbc3d9]/20 p-3.5 rounded-xl text-xs gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {isCredit
                            ? <ArrowDownCircle className="w-5 h-5 text-[#006a60] shrink-0" />
                            : <ArrowUpCircle className="w-5 h-5 text-[#4800b2] shrink-0" />}
                          <div className="min-w-0">
                            <p className="font-space font-bold text-[#191c1e] truncate">{t.description || t.type}</p>
                            <p className="text-[10px] text-[#7a7488] mt-0.5">
                              {new Date(t.created_at).toLocaleString()} •{' '}
                              <span className={`font-bold uppercase ${
                                t.status === 'success' ? 'text-[#006f64]' :
                                t.status === 'failed' ? 'text-red-600' : 'text-amber-600'
                              }`}>{t.status}</span>
                            </p>
                          </div>
                        </div>
                        <span className={`font-space font-black shrink-0 ${isCredit ? 'text-[#006a60]' : 'text-[#4800b2]'}`}>
                          {isCredit ? '+' : '−'}₦{t.amount.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </section>
      </main>

      <Footer />
    </>
  );
}
