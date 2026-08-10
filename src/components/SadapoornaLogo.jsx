import React from 'react';
import { Sparkles } from 'lucide-react';

export default function SadapoornaLogo({ size = 'normal' }) {
  const isSmall = size === 'small';
  return (
    <div className={`inline-flex items-center justify-center bg-[#E31E24] text-white rounded-full font-serif font-bold tracking-tight shadow-md border-2 border-red-500/30 ${
      isSmall ? 'px-3 py-1 text-sm' : 'px-6 py-2 text-xl sm:text-2xl'
    }`}>
      <span className="relative flex items-center gap-1">
        Sadapoorna
        <Sparkles className={`${isSmall ? 'w-3 h-3' : 'w-4 h-4'} text-yellow-300 animate-pulse`} />
      </span>
    </div>
  );
}
