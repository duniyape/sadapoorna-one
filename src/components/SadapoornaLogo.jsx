import React from 'react';
import { Sparkles } from 'lucide-react';

export default function SadapoornaLogo({ size = 'normal' }) {
  const isSmall = size === 'small';
  return (
    <div className={`flex items-center justify-center ${isSmall ? 'h-8' : 'h-10 sm:h-12'}`}>
      <img 
        src="/logo.png" 
        alt="Sadapoorna Logo" 
        className="h-full w-auto object-contain drop-shadow-md"
      />
    </div>
  );
}
