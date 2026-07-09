import React from 'react';

export const ToggleSwitch = ({ checked, onChange, label }) => {
  return (
    <label className="flex items-center justify-between gap-2.5 text-slate-300 cursor-pointer select-none bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 py-1.5 px-2.5 rounded-lg transition-all w-full">
      <span className="font-medium text-[9px] md:text-[10px] tracking-wide uppercase">{label}</span>
      <div className="relative shrink-0">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={onChange} 
          className="sr-only" 
        />
        <div className={`w-7 h-4 rounded-full transition-colors duration-200 ease-in-out ${checked ? 'bg-emerald-500' : 'bg-slate-700'}`}>
          <div className={`w-2.5 h-2.5 bg-white rounded-full absolute top-[3px] left-[3px] transition-transform duration-200 ease-in-out transform ${checked ? 'translate-x-3' : 'translate-x-0'}`}></div>
        </div>
      </div>
    </label>
  );
};
