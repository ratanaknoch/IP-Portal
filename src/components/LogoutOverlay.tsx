import { useEffect, useState } from 'react';
import MetallicPaint from './MetallicPaint';
import { LogOut, CheckCircle2 } from 'lucide-react';

interface LogoutOverlayProps {
  isOpen: boolean;
  onFinished: () => void;
  userName?: string;
}

export function LogoutOverlay({ isOpen, onFinished, userName }: LogoutOverlayProps) {
  const [stage, setStage] = useState<'animating' | 'done'>('animating');

  useEffect(() => {
    if (!isOpen) {
      setStage('animating');
      return;
    }

    const timer = setTimeout(() => {
      setStage('done');
      const finishTimer = setTimeout(() => {
        onFinished();
      }, 500);
      return () => clearTimeout(finishTimer);
    }, 1400);

    return () => clearTimeout(timer);
  }, [isOpen, onFinished]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-slate-900/95 border border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4">
        
        {/* Metallic Liquid ITC Logo */}
        <div className="w-40 h-40 relative rounded-xl overflow-hidden bg-slate-950/70 border border-slate-800 flex items-center justify-center">
          <MetallicPaint
            imageSrc="/assets/cropped-itc_tight.png"
            color="#e2e8f0"
            edgeBend={0.8}
            softness={0.15}
            distortion={0.08}
            speed={1.2}
            mouseTilt={0.6}
            scale={0.75}
            className="w-full h-full"
          />
        </div>

        {/* Text feedback */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-rose-400">
            {stage === 'done' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Signed Out Successfully</span>
              </>
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5" />
                <span>Signing Out...</span>
              </>
            )}
          </div>
          <h3 className="text-base font-bold text-white">
            {userName ? `Goodbye, ${userName}` : 'Thank you for visiting ITC'}
          </h3>
          <p className="text-xs text-slate-400">
            {stage === 'done' ? 'Redirecting to login portal...' : 'Clearing session credentials and security tokens...'}
          </p>
        </div>

        {/* Spinner or check bar */}
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${
              stage === 'done' ? 'w-full bg-emerald-500' : 'w-3/4 bg-rose-500'
            }`} 
          />
        </div>

      </div>
    </div>
  );
}
