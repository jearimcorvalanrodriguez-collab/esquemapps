import React from 'react';

export const PianoLoader = ({ size = 80, showLabel = true }) => {
  const widthVal = size * 1.68; // Mantener relación de aspecto del piano (84:50)
  return (
    <div className="flex flex-col items-center justify-center p-2 space-y-2 inline-flex">
      <div className="relative" style={{ width: `${widthVal}px`, height: `${size}px` }}>
        <svg 
          viewBox="0 0 84 50" 
          className="w-full h-full"
        >
          {/* Teclas Blancas */}
          <rect x="0" y="0" width="11" height="50" rx="1.5" className="animate-key-1 fill-white stroke-slate-700 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />
          <rect x="12" y="0" width="11" height="50" rx="1.5" className="animate-key-2 fill-white stroke-slate-700 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />
          <rect x="24" y="0" width="11" height="50" rx="1.5" className="animate-key-3 fill-white stroke-slate-700 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />
          <rect x="36" y="0" width="11" height="50" rx="1.5" className="animate-key-4 fill-white stroke-slate-700 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />
          <rect x="48" y="0" width="11" height="50" rx="1.5" className="animate-key-5 fill-white stroke-slate-700 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />
          <rect x="60" y="0" width="11" height="50" rx="1.5" className="animate-key-6 fill-white stroke-slate-700 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />
          <rect x="72" y="0" width="11" height="50" rx="1.5" className="animate-key-7 fill-white stroke-slate-700 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />

          {/* Teclas Negras */}
          <rect x="8" y="0" width="6" height="30" rx="1" className="animate-bkey-1 fill-slate-900 stroke-slate-950 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />
          <rect x="20" y="0" width="6" height="30" rx="1" className="animate-bkey-2 fill-slate-900 stroke-slate-950 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />
          
          <rect x="44" y="0" width="6" height="30" rx="1" className="animate-bkey-3 fill-slate-900 stroke-slate-950 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />
          <rect x="56" y="0" width="6" height="30" rx="1" className="animate-bkey-4 fill-slate-900 stroke-slate-950 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />
          <rect x="68" y="0" width="6" height="30" rx="1" className="animate-bkey-5 fill-slate-900 stroke-slate-950 stroke-[0.5]" style={{ transformBox: 'fill-box' }} />
        </svg>
      </div>
      {showLabel && size >= 30 && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse mt-1">Procesando...</p>}
    </div>
  );
};
