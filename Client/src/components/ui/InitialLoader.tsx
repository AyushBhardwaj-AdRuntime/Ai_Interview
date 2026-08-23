import React, { useEffect, useState } from 'react';

export const InitialLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Hold the animation for 2.5 seconds total, then fade out
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(onComplete, 500); // Wait for fade out transition
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative w-32 h-32 md:w-40 md:h-40 overflow-visible">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
          {/* M coming from left */}
          <text 
            x="8" y="76" 
            fontFamily="Georgia, 'Times New Roman', serif" 
            fontSize="62" fontWeight="bold" 
            fill="currentColor"
            letterSpacing="-3"
            className="animate-in slide-in-from-left-[150%] fade-in duration-1000 ease-out fill-mode-both"
          >
            M
          </text>
          
          {/* H coming from right */}
          <text 
            x="46" y="76" 
            fontFamily="Georgia, 'Times New Roman', serif" 
            fontSize="62" fontWeight="bold" 
            fill="#a8c99a" 
            letterSpacing="-3"
            className="animate-in slide-in-from-right-[150%] fade-in duration-1000 ease-out fill-mode-both"
            style={{ animationDelay: '100ms' }}
          >
            H
          </text>

          {/* Circle coming from center/top */}
          <circle 
            cx="78" 
            cy="22" 
            r="14" 
            fill="#c8432d" 
            className="animate-in zoom-in-0 fade-in slide-in-from-top-[100%] duration-700 ease-out fill-mode-both"
            style={{ animationDelay: '700ms' }}
          />
        </svg>
      </div>
    </div>
  );
};
