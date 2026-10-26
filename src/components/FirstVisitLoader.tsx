import { useState, useEffect } from 'react';
import MetaBalls from './MetaBalls';

interface FirstVisitLoaderProps {
  onComplete: () => void;
}

export function FirstVisitLoader({ onComplete }: FirstVisitLoaderProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Automatically transition smoothly after the fluid animation plays
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      const exitTimer = setTimeout(onComplete, 450);
      return () => clearTimeout(exitTimer);
    }, 2200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleInstantDismiss = () => {
    setIsFadingOut(true);
    setTimeout(onComplete, 200);
  };

  return (
    <div
      onClick={handleInstantDismiss}
      className={`fixed inset-0 z-50 bg-slate-950 overflow-hidden select-none transition-opacity duration-450 ease-out cursor-pointer ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
      title="Click anywhere to skip"
    >
      {/* Fullscreen Interactive MetaBalls Fluid */}
      <div className="absolute inset-0">
        <MetaBalls
          color="#38bdf8"
          cursorBallColor="#34d399"
          variant="solid"
          motion="orbit"
          ballCount={18}
          animationSize={34}
          gooeyness={0.6}
          stretch={0.65}
          wobble={0.45}
          enableMouseInteraction={true}
          clickBurst={true}
          enableTransparency={true}
          speed={0.45}
        />
      </div>
    </div>
  );
}
