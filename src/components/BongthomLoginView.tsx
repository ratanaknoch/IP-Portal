import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';
import { loginWithGoogle, UserProfile, BOOTSTRAPPED_ADMIN_EMAIL } from '../lib/firebase';
import MetallicPaint from './MetallicPaint';

interface BongthomLoginViewProps {
  onAdminLoginSuccess: (adminProfile: UserProfile) => void;
  onBack: () => void;
}

export function BongthomLoginView({ onAdminLoginSuccess, onBack }: BongthomLoginViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerifiedGoogleAdminSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const { user, profile } = await loginWithGoogle();
      const isRootEmail =
        user.emailVerified &&
        user.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

      if (profile && (profile.role === 'admin' || isRootEmail)) {
        const verifiedAdmin: UserProfile = {
          ...profile,
          role: 'admin'
        };
        onAdminLoginSuccess(verifiedAdmin);
      } else {
        setError(
          `Access Denied: Your Google account (${user.email || 'unverified'}) does not hold Bongthom Administrator privileges in Firestore.`
        );
      }
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || '';
      if (
        code === 'auth/user-cancelled' ||
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request'
      ) {
        setError('Google authentication was cancelled.');
      } else {
        setError(msg || 'Unable to verify administrator identity. Please try again.');
      }
    } finally {
      setLoading(false);
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
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Portal</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-amber-400/90">
          <ShieldCheck className="w-4 h-4" />
          <span>ZERO-TRUST OAUTH GATE · /BONGTHOM</span>
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
                Verified Google OAuth & Firestore ABAC Role Gate
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

          {/* Security Posture Explanation */}
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>Passwordless Cryptographic Verification</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Static client-side passwords have been eliminated. Administrator access is strictly verified against your signed Google OAuth token and server-side Firestore security rules.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] font-mono text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Enforced: email_verified == true &amp;&amp; isAdmin()</span>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 bg-red-950/80 border border-red-800 text-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {/* Verified Google OAuth Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleVerifiedGoogleAdminSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/10 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 whitespace-nowrap"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="currentColor"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="currentColor"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="currentColor"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{loading ? 'Verifying Admin Token...' : 'Verify Admin with Google'}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-5 text-center text-xs text-slate-500 border-t border-slate-900">
        Institute of Technology of Cambodia (ITC) · International Program Portal
      </footer>
    </div>
  );
}
