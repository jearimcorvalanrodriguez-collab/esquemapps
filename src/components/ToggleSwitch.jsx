import React from 'react';

export const ToggleSwitch = ({ checked, onChange, label }) => {
  return (
    <label className="flex items-center justify-between gap-3 text-xs text-slate-300 cursor-pointer select-none bg-slate-900/50 hover:bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg transition-all w-full">
      <span className="font-bold text-[10px] md:text-xs tracking-wide uppercase">{label}</span>
      <div className="relative shrink-0">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={onChange} 
          className="sr-only" 
        />
        <div className={`w-9 h-5 rounded-full transition-colors duration-200 ease-in-out ${checked ? 'bg-emerald-500' : 'bg-slate-700'}`}>
          <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] left-[3px] transition-transform duration-200 ease-in-out transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}></div>
        </div>
      </div>
    </label>
  );
};
