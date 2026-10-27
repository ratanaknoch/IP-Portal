import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, ArrowLeft, Lock, User } from 'lucide-react';
import { UserProfile } from '../lib/firebase';
import MetallicPaint from './MetallicPaint';

interface BongthomLoginViewProps {
  onAdminLoginSuccess: (adminProfile: UserProfile) => void;
  onBack: () => void;
}

export function BongthomLoginView({ onAdminLoginSuccess, onBack }: BongthomLoginViewProps) {
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUser = adminUsername.trim().toLowerCase();
    const trimmedPass = adminPassword.trim();

    if (trimmedUser === 'bigboss' && (trimmedPass === 'Liger72724' || trimmedPass.toLowerCase() === 'liger72724')) {
      const adminProfile: UserProfile = {
        uid: 'admin_bigboss_master',
        email: 'bigboss.admin@itc.edu.kh',
        displayName: 'Bigboss (Bongthom)',
        role: 'admin',
        year: 'Admin',
        groupId: 'ALL',
        onboardingCompleted: true,
        createdAt: new Date().toISOString()
      };

      try {
        localStorage.setItem('itc_admin_auth', JSON.stringify(adminProfile));
        sessionStorage.setItem('itc_monitor_authorized', 'true');
      } catch {
        // ignore
      }

      onAdminLoginSuccess(adminProfile);
    } else {
      setError('Invalid Bongthom credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden">
      {/* Subtle Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      {/* Top Bar */}
      <header className="relative z-10 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Portal</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-amber-400/90 bg-amber-950/50 border border-amber-800/60 px-3 py-1.5 rounded-lg">
          <ShieldCheck className="w-4 h-4" />
          <span>RESTRICTED ACCESS · /BONGTHOM</span>
        </div>
      </header>

      {/* Main Centered Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Bongthom Admin Portal
              </h1>
              <p className="text-xs text-slate-400">
                Direct link administrator authentication
              </p>
            </div>
          </div>

          {/* Interactive Metallic ITC Emblem */}
          <div className="w-full h-40 relative rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800 flex items-center justify-center shadow-inner">
            <MetallicPaint
              imageSrc="/assets/cropped-itc_tight.png"
              color="#f59e0b"
              edgeBend={0.82}
              softness={0.16}
              distortion={0.07}
              speed={1.0}
              mouseTilt={0.65}
              scale={0.74}
              className="w-full h-full"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 bg-red-950/80 border border-red-800 text-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Admin Credentials Form */}
          <form onSubmit={handleAdminSignIn} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                Administrator Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Enter Bongthom username"
                  autoComplete="username"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-hidden focus:border-amber-400 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                Administrator Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter Bongthom password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-hidden focus:border-amber-400 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              Sign In as Bongthom
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5 text-center text-xs text-slate-500 border-t border-slate-900">
        Institute of Technology of Cambodia (ITC) · International Program Portal
      </footer>
    </div>
  );
}
