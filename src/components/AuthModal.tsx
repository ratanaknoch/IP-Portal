import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertCircle, 
  UserCheck, 
  KeyRound
} from 'lucide-react';
import { loginWithGoogle, UserProfile } from '../lib/firebase';
import MetallicPaint from './MetallicPaint';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userProfile: UserProfile | null, isNewUser: boolean) => void;
  onAdminLoginSuccess: (adminProfile: UserProfile) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onAdminLoginSuccess
}: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'google' | 'admin'>('google');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Admin credentials state - starts empty for security
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { profile, isNew } = await loginWithGoogle();
      onLoginSuccess(profile, isNew);
      onClose();
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      const code = err.code || '';
      const msg = err.message || '';

      const isCancellation = 
        code === 'auth/user-cancelled' ||
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        msg.includes('user-cancelled') ||
        msg.includes('popup-closed-by-user') ||
        msg.includes('IdP denied access') ||
        msg.includes('access_denied');

      if (isCancellation) {
        setError('Sign-in was cancelled.');
      } else if (code === 'auth/popup-blocked') {
        setError('Popup blocked by browser. Please allow popups or use Bongthom Login.');
      } else if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        setError('Domain not authorized in Firebase Console. Please add ip-portal.onrender.com to Authorized Domains.');
      } else {
        setError(msg || 'Unable to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

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
      onClose();
    } else {
      setError('Invalid Bongthom credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl text-white space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 shrink-0">
              {authMode === 'google' ? <UserCheck className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5 text-amber-400" />}
            </div>
            <h3 className="text-lg font-bold text-white">
              {authMode === 'google' ? 'Sign In / Register' : 'Bongthom Login'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Metallic ITC Emblem Animation */}
        <div className="w-full h-36 relative rounded-xl overflow-hidden bg-slate-950/70 border border-slate-800 flex items-center justify-center shadow-inner group">
          <MetallicPaint
            imageSrc="/assets/cropped-itc_tight.png"
            color={authMode === 'google' ? '#f8fafc' : '#f59e0b'}
            edgeBend={0.82}
            softness={0.16}
            distortion={0.07}
            speed={1.0}
            mouseTilt={0.65}
            scale={0.72}
            className="w-full h-full"
          />
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm font-semibold">
          <button
            type="button"
            onClick={() => { setAuthMode('google'); setError(''); }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              authMode === 'google'
                ? 'bg-slate-800 text-white shadow-xs font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('admin'); setError(''); }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'admin'
                ? 'bg-amber-950/70 border border-amber-800/80 text-amber-200 shadow-xs font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Bongthom</span>
          </button>
        </div>

        {error && (
          <div className={`p-3 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 transition-all ${
            error === 'Sign-in was cancelled.'
              ? 'bg-slate-800/80 border border-slate-700 text-slate-300'
              : 'bg-red-950/80 border border-red-800 text-red-200'
          }`}>
            <AlertCircle className={`w-4 h-4 shrink-0 ${
              error === 'Sign-in was cancelled.' ? 'text-slate-400' : 'text-red-400'
            }`} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Google Auth Body */}
        {authMode === 'google' ? (
          <div className="pt-1">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>
          </div>
        ) : (
          /* Admin Login Body */
          <form onSubmit={handleAdminSignIn} className="space-y-3 pt-1">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1">
                Username
              </label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-hidden focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-hidden focus:border-amber-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors shadow-md cursor-pointer"
            >
              Sign In as Bongthom
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
