import React from 'react';

interface LogoProps {
  className?: string;
  animate?: boolean;
}

export const LogoIcon = ({ className = "w-10 h-10", animate = false }: LogoProps) => {
  return (
    <div className={`relative shrink-0 ${className}`}>
      {animate && (
        <div 
          className="absolute top-[8%] right-[8%] w-[28%] h-[28%] bg-[#c8432d] rounded-full animate-ping z-0" 
          style={{ animationDuration: '2s' }}
        />
      )}
      <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="100" height="100" rx="22" fill="#1a2f4d" />
        <circle 
          cx="78" 
          cy="22" 
          r="14" 
          fill="#c8432d" 
          className={animate ? "animate-pulse" : ""} 
          style={animate ? { transformOrigin: '78px 22px' } : {}}
        />
        <text x="8" y="76" fontFamily="Georgia, 'Times New Roman', serif" fontSize="62" fontWeight="bold" fill="#f5f0e6" letterSpacing="-3">M</text>
        <text x="46" y="76" fontFamily="Georgia, 'Times New Roman', serif" fontSize="62" fontWeight="bold" fill="#a8c99a" letterSpacing="-3">H</text>
      </svg>
    </div>
  );
};
