import React, { useState, useEffect, useRef } from 'react';
import { Plus, FileText, Clock, Wallet, X } from 'lucide-react';

export const QuickActionsButton = ({ onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTriggerAction = (type) => {
    setIsOpen(false);
    if (onAction) onAction(type);
  };

  return (
    <div className="relative inline-block text-left z-50" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 outline-none ${
          isOpen 
            ? 'bg-emerald-500 border-emerald-500 text-white rotate-45 shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:scale-105'
        }`}
        title="Acciones Rápidas"
      >
        <Plus size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-1.5 animate-fade-in text-left">
          <div className="px-2.5 py-1.5 border-b border-slate-900 mb-1">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Crear Nuevo Recurso</span>
          </div>
          <button
            type="button"
            onClick={() => handleTriggerAction('ADD_RIDER')}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900/60 rounded-lg transition-colors font-bold text-left"
          >
            <FileText size={14} className="text-emerald-400" />
            <span>Añadir Rider</span>
          </button>
          <button
            type="button"
            onClick={() => handleTriggerAction('ADD_TIMING')}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900/60 rounded-lg transition-colors font-bold text-left"
          >
            <Clock size={14} className="text-emerald-400" />
            <span>Añadir Cronograma</span>
          </button>
          <button
            type="button"
            onClick={() => handleTriggerAction('ADD_EXPENSE')}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900/60 rounded-lg transition-colors font-bold text-left"
          >
            <Wallet size={14} className="text-emerald-450" />
            <span>Añadir Gasto</span>
          </button>
        </div>
      )}
    </div>
  );
};
