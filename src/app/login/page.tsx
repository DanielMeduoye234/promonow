'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { db, api, Profile, supabase } from '@/lib/supabase';
import { LogIn, UserPlus, Sparkles, Loader2 } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  
  // Sign In inputs
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  // Sign Up inputs
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: signInEmail,
          password: signInPassword
        });

        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          // Fetch corresponding profile through the server API (bypasses RLS)
          let profile: Profile | null = null;
          try {
            profile = await api.getProfileById(data.user.id) || null;
          } catch {
            profile = null;
          }

          let activeProfile: Profile;

          if (!profile) {
            const username = signInEmail.split('@')[0];
            const newMockProfile: Profile = {
              id: data.user.id,
              username: username,
              reputation: 100.0,
              sales_count: 0,
              is_admin: false,
              created_at: new Date().toISOString()
            };

            await api.createProfile(newMockProfile);
            activeProfile = newMockProfile;
          } else {
            // Admin status comes from the stored profile only; it is never
            // derived from the email or username at sign-in.
            activeProfile = profile;
          }

          localStorage.setItem('promonow_current_user', JSON.stringify(activeProfile));
          setLoading(false);
          router.push('/');
          setTimeout(() => { window.location.reload(); }, 100);
          return;
        }
      } catch (err: any) {
        console.error("Supabase Auth error:", err);
      }
    }

    // Simulate local network delay fallback
    setTimeout(() => {
      const profiles = db.getProfiles();
      const loginName = signInEmail.split('@')[0].toLowerCase();
      
      const matched = profiles.find(p => p.username.toLowerCase() === loginName);

      // Never fall back to someone else's profile — an unknown login fails.
      if (!matched) {
        setErrorMsg('No account found for that email. Please sign up first.');
        setLoading(false);
        return;
      }

      localStorage.setItem('promonow_current_user', JSON.stringify(matched));
      setLoading(false);
      router.push('/');
      setTimeout(() => { window.location.reload(); }, 100);
    }, 1200);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpUsername || !signUpEmail || !signUpPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: signUpEmail,
          password: signUpPassword,
          options: {
            data: { username: signUpUsername }
          }
        });

        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          const newProfile: Profile = {
            id: data.user.id,
            username: signUpUsername,
            reputation: 100.0,
            sales_count: 0,
            is_admin: false,
            created_at: new Date().toISOString()
          };

          // Store profile in real Supabase Database via the server API (bypasses RLS)
          try {
            await api.createProfile(newProfile);
          } catch (profileErr) {
            console.error("Error creating real user profile:", profileErr);
          }

          localStorage.setItem('promonow_current_user', JSON.stringify(newProfile));
          setLoading(false);
          router.push('/');
          setTimeout(() => { window.location.reload(); }, 100);
          return;
        }
      } catch (err: any) {
        console.error("Supabase Auth error:", err);
      }
    }

    // Local Storage Mock fallback
    setTimeout(() => {
      const profiles = db.getProfiles();
      
      if (profiles.some(p => p.username.toLowerCase() === signUpUsername.toLowerCase())) {
        setErrorMsg('Username is already taken.');
        setLoading(false);
        return;
      }

      const newProfile: Profile = {
        id: 'usr-' + Math.random().toString(36).substr(2, 9),
        username: signUpUsername,
        reputation: 100.0,
        sales_count: 0,
        is_admin: false,
        created_at: new Date().toISOString()
      };

      profiles.push(newProfile);
      db.saveProfiles(profiles);

      localStorage.setItem('promonow_current_user', JSON.stringify(newProfile));
      setLoading(false);
      router.push('/');
      setTimeout(() => { window.location.reload(); }, 100);
    }, 1200);
  };

  return (
    <>
      <Navbar />

      <main className="min-h-[80vh] pt-24 pb-20 flex items-center justify-center bg-[#f7f9fc]">
        <div className="bg-white border border-[#cbc3d9]/40 rounded-3xl p-8 max-w-md w-full shadow-xs space-y-6">
          
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1 bg-[#4800b2]/5 text-[#4800b2] text-[10px] font-space font-bold px-3 py-1 rounded-full border border-[#4800b2]/20">
              <Sparkles className="w-3.5 h-3.5" /> Secure Gatekeeper
            </span>
            <h2 className="font-space font-black text-2xl text-[#191c1e]">
              {mode === 'signin' ? 'Welcome back to PromoNow' : 'Join the Marketplace'}
            </h2>
            <p className="text-xs text-[#7a7488]">
              {mode === 'signin' 
                ? 'Sign in to access your listings and buy digital assets.' 
                : 'Create a profile to buy and sell digital assets.'}
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-700 text-xs border border-red-100 p-3.5 rounded-xl font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Form switch */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block font-space font-bold text-[10px] text-[#7a7488] uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  placeholder="e.g. broker@assets.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="w-full bg-[#f2f4f7] border-none rounded-xl h-11 px-4 font-space text-xs focus:ring-2 focus:ring-[#4800b2]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-space font-bold text-[10px] text-[#7a7488] uppercase tracking-wider">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="w-full bg-[#f2f4f7] border-none rounded-xl h-11 px-4 font-space text-xs focus:ring-2 focus:ring-[#4800b2]"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#4800b2] text-white font-space font-bold text-xs tracking-wider rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" /> Sign In to Session
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block font-space font-bold text-[10px] text-[#7a7488] uppercase tracking-wider">Username</label>
                <input 
                  type="text" 
                  placeholder="e.g. AssetBroker2026"
                  value={signUpUsername}
                  onChange={(e) => setSignUpUsername(e.target.value)}
                  className="w-full bg-[#f2f4f7] border-none rounded-xl h-11 px-4 font-space text-xs focus:ring-2 focus:ring-[#4800b2]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-space font-bold text-[10px] text-[#7a7488] uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  placeholder="e.g. broker@assets.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="w-full bg-[#f2f4f7] border-none rounded-xl h-11 px-4 font-space text-xs focus:ring-2 focus:ring-[#4800b2]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-space font-bold text-[10px] text-[#7a7488] uppercase tracking-wider">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="w-full bg-[#f2f4f7] border-none rounded-xl h-11 px-4 font-space text-xs focus:ring-2 focus:ring-[#4800b2]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#006a60] text-white font-space font-bold text-xs tracking-wider rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating Profile...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Create Profile
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle Button */}
          <div className="text-center pt-4 border-t border-[#cbc3d9]/20">
            <button 
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setErrorMsg('');
              }}
              className="text-xs font-space font-bold text-[#4800b2] hover:underline cursor-pointer"
            >
              {mode === 'signin' ? 'Don\'t have an account? Sign Up' : 'Already have an account? Sign In'}
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
