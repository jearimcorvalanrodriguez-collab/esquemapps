import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const MicDiSelect = ({ value, onChange }) => {
  const isCustom = !['', 'MIC', 'DI'].includes(value) && value !== 'OTRO';
  const [customMode, setCustomMode] = useState(isCustom);

  useEffect(() => { setCustomMode(!['', 'MIC', 'DI'].includes(value) && value !== 'OTRO'); }, [value]);

  if (customMode) {
    return (
      <div className="flex items-center gap-1">
        <input autoFocus className="w-full bg-slate-950 border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={value === 'OTRO' ? '' : value} onChange={e => onChange(e.target.value)} placeholder="Especificar..." />
        <button type="button" onClick={() => { setCustomMode(false); onChange(''); }} className="text-slate-500 hover:text-red-500"><X size={12}/></button>
      </div>
    );
  }

  return (
    <select className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={value} onChange={e => { if (e.target.value === 'OTRO') { setCustomMode(true); onChange(''); } else { onChange(e.target.value); } }}>
      <option value=""></option>
      <option value="MIC">MIC</option>
      <option value="DI">DI</option>
      <option value="OTRO">OTRO...</option>
    </select>
  );
};
