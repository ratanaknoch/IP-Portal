import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertCircle, 
  UserCheck
} from 'lucide-react';
import { loginWithGoogle, UserProfile } from '../lib/firebase';
import MetallicPaint from './MetallicPaint';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userProfile: UserProfile | null, isNewUser: boolean) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess
}: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
  }, [isOpen]);

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
        setError('Popup blocked by browser. Please allow popups for this site and try again.');
      } else if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        setError('Domain not authorized in Firebase Console. Please add ip-portal.onrender.com to Authorized Domains.');
      } else {
        setError(msg || 'Unable to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl text-white space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-sky-950 border border-sky-800 text-sky-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Sign In / Register
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
            color="#f8fafc"
            edgeBend={0.82}
            softness={0.16}
            distortion={0.07}
            speed={1.0}
            mouseTilt={0.65}
            scale={0.72}
            className="w-full h-full"
          />
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

        {/* Google Sign-In Body */}
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
