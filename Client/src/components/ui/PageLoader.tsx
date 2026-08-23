import React from 'react';
import { LogoIcon } from '@/components/ui/Logo';

export const PageLoader = () => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="relative">
        {/* We reuse the LogoIcon and pass the animate flag so the orange dot pulses */}
        <LogoIcon className="w-20 h-20 shadow-2xl" animate={true} />
        
        {/* Optional animated ring around the logo */}
        <div className="absolute inset-0 border-4 border-secondary/20 rounded-xl animate-ping" style={{ animationDuration: '2s' }}></div>
      </div>
      
      <p className="mt-6 text-sm font-medium text-muted-foreground animate-pulse">
        Loading...
      </p>
    </div>
  );
};
