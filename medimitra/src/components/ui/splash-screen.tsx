import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(onComplete, 500); // Wait for fade out
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary via-primary-light to-secondary transition-all duration-500",
        !isAnimating && "opacity-0"
      )}
    >
      <div className="text-center">
        {/* Logo Animation */}
        <div className="mb-8 animate-scale-in">
          <Heart className="h-24 w-24 mx-auto text-white animate-pulse" />
          <div className="mt-4 h-1 w-24 mx-auto bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full animate-[slide-in-right_2s_ease-out]"></div>
          </div>
        </div>

        {/* App Name Animation */}
        <div className="animate-fade-in animation-delay-500">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-wide">
            MediMitra
          </h1>
          <p className="text-xl text-white/80 animate-fade-in animation-delay-1000">
            Your Healthcare Companion
          </p>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center mt-8 gap-2 animate-fade-in animation-delay-1500">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce animation-delay-0"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce animation-delay-200"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce animation-delay-400"></div>
        </div>
      </div>
    </div>
  );
};