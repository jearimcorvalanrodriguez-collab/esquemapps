import React, { useState, useEffect, useRef } from 'react';
import { 
  Minimize, Maximize, RotateCw, Trash2, MapPin, 
  ChevronLeft, ArrowUp, ArrowDown, Copy
} from 'lucide-react';
import { Button } from './Button';
import { PianoLoader } from './PianoLoader';

export const STAGE_ITEMS = {
  DRUMS: {
    label: "Batería", width: 24, height: 24, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <rect x="5" y="5" width="90" height="90" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" rx="4"/> 
        <circle cx="50" cy="55" r="22" fill="#cbd5e1" stroke="#334155" strokeWidth="3"/> 
        <circle cx="30" cy="35" r="12" fill="#e2e8f0" stroke="#334155" strokeWidth="2"/> 
        <circle cx="70" cy="40" r="14" fill="#e2e8f0" stroke="#334155" strokeWidth="2"/> 
        <circle cx="40" cy="30" r="10" fill="#e2e8f0" stroke="#334155" strokeWidth="2"/> 
        <circle cx="60" cy="30" r="10" fill="#e2e8f0" stroke="#334155" strokeWidth="2"/> 
        <circle cx="15" cy="20" r="15" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1"/> 
        <circle cx="85" cy="20" r="15" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1"/> 
        <rect x="40" y="80" width="20" height="12" fill="#334155" rx="3"/> 
      </svg>
    )
  },
  GUITAR: {
    label: "Guitarra", width: 15, height: 15, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <rect x="20" y="40" width="60" height="20" rx="10" fill="#64748b"/>
        <circle cx="50" cy="50" r="16" fill="#f8fafc" stroke="#334155" strokeWidth="2"/>
        <rect x="30" y="30" width="60" height="8" transform="rotate(-30 50 50)" fill="#1e293b" rx="2"/> 
        <rect x="30" y="80" width="40" height="15" fill="#475569" rx="2"/>
      </svg>
    )
  },
  BASS: {
    label: "Bajo", width: 15, height: 15, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <rect x="20" y="40" width="60" height="20" rx="10" fill="#475569"/>
        <circle cx="50" cy="50" r="16" fill="#f8fafc" stroke="#334155" strokeWidth="2"/> 
        <rect x="20" y="35" width="70" height="6" transform="rotate(-20 50 50)" fill="#94a3b8" stroke="#1e293b" strokeWidth="1" rx="2"/> 
      </svg>
    )
  },
  KEYS: {
    label: "Teclados", width: 21, height: 18, defaultRotation: 180,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <rect x="10" y="30" width="80" height="25" fill="#1e293b" rx="2"/> 
        <rect x="15" y="35" width="70" height="15" fill="#f8fafc"/> 
        <rect x="30" y="65" width="40" height="15" rx="7" fill="#64748b"/> 
        <circle cx="50" cy="70" r="14" fill="#f8fafc" stroke="#334155" strokeWidth="2"/> 
      </svg>
    )
  },
  VOCALS: {
    label: "Cantante / Coros", width: 12, height: 12, defaultRotation: 180,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <rect x="25" y="45" width="50" height="16" rx="8" fill="#3b82f6"/> 
        <circle cx="50" cy="50" r="16" fill="#f8fafc" stroke="#1e3a8a" strokeWidth="2"/> 
        <circle cx="50" cy="20" r="6" fill="#475569"/> 
      </svg>
    )
  },
  HORNS: {
    label: "Vientos", width: 12, height: 12, defaultRotation: 180,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <rect x="25" y="45" width="50" height="16" rx="8" fill="#eab308"/> 
        <circle cx="50" cy="50" r="16" fill="#f8fafc" stroke="#713f12" strokeWidth="2"/> 
        <path d="M50,40 L45,10 L55,10 Z" fill="#eab308"/> 
      </svg>
    )
  },
  PERC: {
    label: "Percusión", width: 18, height: 18, defaultRotation: 180,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <circle cx="35" cy="35" r="14" fill="#fcd34d" stroke="#854d0e" strokeWidth="2"/> 
        <circle cx="65" cy="35" r="14" fill="#fcd34d" stroke="#854d0e" strokeWidth="2"/> 
        <rect x="30" y="60" width="40" height="15" rx="7" fill="#64748b"/> 
        <circle cx="50" cy="65" r="14" fill="#f8fafc" stroke="#334155" strokeWidth="2"/> 
      </svg>
    )
  },
  MONITOR: {
    label: "Monitor", width: 12, height: 8, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
        <polygon points="10,20 90,20 80,80 20,80" fill="#1e293b" stroke="#0f172a" strokeWidth="3"/>
        <rect x="30" y="35" width="40" height="30" fill="#334155" rx="2"/>
      </svg>
    )
  },
  AMP: {
    label: "Amp / Cab", width: 12, height: 8, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
        <rect x="5" y="10" width="90" height="80" fill="#334155" stroke="#0f172a" strokeWidth="4" rx="2"/>
        <circle cx="30" cy="50" r="18" fill="#1e293b"/>
        <circle cx="70" cy="50" r="18" fill="#1e293b"/>
      </svg>
    )
  },
  POWER: {
    label: "Toma 220V", width: 4, height: 4, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="5" y="5" width="90" height="90" fill="#ef4444" rx="10"/>
        <text x="50" y="65" fontSize="40" fill="white" fontWeight="bold" textAnchor="middle">⚡</text>
      </svg>
    )
  },
  DI: {
    label: "D.I. Box", width: 4, height: 3, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="10" y="20" width="80" height="60" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="4" rx="5"/>
        <text x="50" y="65" fontSize="35" fill="white" fontWeight="bold" textAnchor="middle">DI</text>
      </svg>
    )
  },
  MIC_STAND: {
    label: "Mic. Atril", width: 8, height: 8, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="25" fill="#64748b"/> 
        <line x1="50" y1="50" x2="50" y2="10" stroke="#cbd5e1" strokeWidth="4"/> 
        <circle cx="50" cy="5" r="8" fill="#334155"/> 
      </svg>
    )
  }
};

export const StageplotBuilder = ({ items, onChange, config, onConfigChange, readOnly = false, projectName = "" }) => {
  const canvasRef = useRef(null);
  const [draggedId, setDraggedId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(600);

  useEffect(() => {
    if (!canvasRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setCanvasWidth(entry.contentRect.width || entry.target.clientWidth);
      }
    });
    observer.observe(canvasRef.current);
    setCanvasWidth(canvasRef.current.clientWidth || 600);
    return () => observer.disconnect();
  }, []);

  const handlePointerDown = (e, id) => {
    if (readOnly) return;
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    setDraggedId(id);
    setSelectedId(id);
  };

  const handlePointerMove = (e) => {
    if (!draggedId || readOnly || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    onChange(items.map(item => item.id === draggedId ? { ...item, x, y } : item));
  };

  const handlePointerUp = (e) => {
    if (draggedId) {
      e.target.releasePointerCapture(e.pointerId);
      setDraggedId(null);
    }
  };

  const addItem = (typeKey) => {
    const defaultItem = STAGE_ITEMS[typeKey];
    const newItem = {
      id: Date.now().toString(),
      type: typeKey,
      label: defaultItem.label,
      x: 50, 
      y: 50,
      rotation: defaultItem.defaultRotation || 0
    };
    onChange([...items, newItem]);
    setSelectedId(newItem.id);
  };

  const updateSelected = (updates) => {
    onChange(items.map(item => item.id === selectedId ? { ...item, ...updates } : item));
  };

  const removeSelected = () => {
    onChange(items.filter(item => item.id !== selectedId));
    setSelectedId(null);
  };

  // Duplicate selected item (For Proposal B, we can add it directly!)
  const duplicateSelected = () => {
    if (!selectedId) return;
    const itemToDuplicate = items.find(item => item.id === selectedId);
    if (!itemToDuplicate) return;
    const newItem = {
      ...itemToDuplicate,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      x: Math.min(95, itemToDuplicate.x + 5), // Offset duplicate slightly
      y: Math.min(95, itemToDuplicate.y + 5),
      label: itemToDuplicate.label ? `${itemToDuplicate.label} (Copia)` : `${STAGE_ITEMS[itemToDuplicate.type].label} (Copia)`
    };
    onChange([...items, newItem]);
    setSelectedId(newItem.id);
  };

  // Pre-configured stage setups (For Proposal B!)
  const loadPreset = (presetName) => {
    let presetItems = [];
    if (presetName === 'rock_band') {
      presetItems = [
        { id: '1', type: 'DRUMS', label: 'Batería', x: 50, y: 30, rotation: 0 },
        { id: '2', type: 'BASS', label: 'Bajo', x: 30, y: 65, rotation: 0 },
        { id: '3', type: 'GUITAR', label: 'Guitarra Lead', x: 70, y: 65, rotation: 0 },
        { id: '4', type: 'VOCALS', label: 'Voz Principal', x: 50, y: 75, rotation: 0 },
        { id: '5', type: 'MONITOR', label: 'Mon Escenario', x: 50, y: 88, rotation: 0 },
        { id: '6', type: 'AMP', label: 'Amp Bajo', x: 20, y: 35, rotation: 0 },
        { id: '7', type: 'AMP', label: 'Amp Guitarra', x: 80, y: 35, rotation: 0 }
      ];
    } else if (presetName === 'acoustic_duo') {
      presetItems = [
        { id: '1', type: 'GUITAR', label: 'Guitarra/Voz 1', x: 40, y: 70, rotation: 0 },
        { id: '2', type: 'GUITAR', label: 'Guitarra/Voz 2', x: 60, y: 70, rotation: 0 },
        { id: '3', type: 'VOCALS', label: 'Voz 1', x: 40, y: 78, rotation: 0 },
        { id: '4', type: 'VOCALS', label: 'Voz 2', x: 60, y: 78, rotation: 0 },
        { id: '5', type: 'MONITOR', label: 'Mon 1', x: 38, y: 88, rotation: 0 },
        { id: '6', type: 'MONITOR', label: 'Mon 2', x: 62, y: 88, rotation: 0 }
      ];
    } else if (presetName === 'trio_jazz') {
      presetItems = [
        { id: '1', type: 'DRUMS', label: 'Batería', x: 75, y: 40, rotation: 0 },
        { id: '2', type: 'KEYS', label: 'Piano', x: 25, y: 50, rotation: 90 },
        { id: '3', type: 'BASS', label: 'Contrabajo', x: 50, y: 55, rotation: 0 },
        { id: '4', type: 'MONITOR', label: 'Mon Piano', x: 25, y: 70, rotation: 0 },
        { id: '5', type: 'MONITOR', label: 'Mon Batería', x: 75, y: 65, rotation: 0 }
      ];
    }
    onChange(presetItems);
    setSelectedId(null);
  };

  const containerClasses = isFullscreen 
    ? "fixed inset-0 md:inset-4 z-[200] bg-slate-900 border border-slate-700 md:rounded-xl shadow-2xl p-2 md:p-4 flex flex-col md:flex-row gap-4"
    : "flex flex-col md:flex-row gap-4 h-full print:block";

  return (
    <div className="space-y-4 w-full">
      <div className={containerClasses}>
        {!readOnly && (
          <div className="w-full md:w-56 bg-slate-950 md:bg-slate-900 border border-slate-800 md:border-slate-700 rounded-xl p-3 shrink-0 print:hidden flex flex-col gap-3 h-auto max-h-[35vh] md:max-h-none overflow-y-auto">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Equipos</h3>
              <Button variant="ghost" className="px-1 py-1" onClick={() => setIsFullscreen(!isFullscreen)}>
                {isFullscreen ? <Minimize size={16}/> : <Maximize size={16}/>}
              </Button>
            </div>
            
            <div className="grid grid-cols-4 md:grid-cols-2 gap-2 flex-1 overflow-y-auto custom-scrollbar">
              {Object.entries(STAGE_ITEMS).map(([key, def]) => (
                <button 
                  key={key} type="button" onClick={() => addItem(key)}
                  className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-700 hover:border-emerald-500 hover:bg-slate-800 transition-colors"
                >
                  <div className="w-6 h-6 pointer-events-none">{def.render()}</div>
                  <span className="text-[8px] font-bold text-slate-300 leading-tight text-center">{def.label}</span>
                </button>
              ))}
            </div>

            {/* Presets dropdown (For Proposal B!) */}
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Presets</h3>
              <select 
                onChange={(e) => { if (e.target.value) { loadPreset(e.target.value); e.target.value = ''; } }}
                className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-[10px] text-white outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="">Cargar preset...</option>
                <option value="rock_band">Banda de Rock</option>
                <option value="acoustic_duo">Dúo Acústico</option>
                <option value="trio_jazz">Jazz Trío</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2 mt-auto">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dimensiones Stage</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Ancho (m)</label>
                  <input type="number" min="2" max="50" className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white outline-none focus:border-emerald-500" value={config.width} onChange={e=>onConfigChange({...config, width: e.target.value.replace(/[^0-9]/g, '')})} onKeyDown={e => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); }} />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-bold uppercase">Fondo (m)</label>
                  <input type="number" min="2" max="50" className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white outline-none focus:border-emerald-500" value={config.depth} onChange={e=>onConfigChange({...config, depth: e.target.value.replace(/[^0-9]/g, '')})} onKeyDown={e => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 bg-slate-800 p-2 md:p-4 rounded-xl border border-slate-700 print:bg-white print:border-none print:p-0 flex items-center justify-center overflow-hidden relative">
          <div 
            id="canvas-bg"
            ref={canvasRef}
            className="relative w-full max-h-full bg-slate-950 print:bg-white border-2 border-slate-700 print:border-black touch-none shadow-inner"
            style={{ 
              aspectRatio: `${config.width} / ${config.depth}`,
              maxHeight: isFullscreen ? '90vh' : 'auto'
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerDown={(e) => {
              if (e.target.id === 'canvas-bg') setSelectedId(null);
            }}
          >
            {projectName && (
              <div className="absolute top-2 md:top-4 left-3 md:left-5 text-sm md:text-lg font-black text-slate-500 print:text-black uppercase tracking-widest pointer-events-none opacity-50 print:opacity-100 z-0">
                {projectName}
              </div>
            )}

            <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:5%_5%] opacity-20 print:opacity-10 pointer-events-none z-0"></div>
            
            <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none z-0">
              <span className="text-[9px] md:text-xs font-black tracking-widest text-slate-500 print:text-black uppercase">Público / Front of Stage</span>
            </div>

            {items.map((item, idx) => {
              const def = STAGE_ITEMS[item.type];
              if (!def) return null;
              const isSelected = selectedId === item.id && !readOnly;

              const w = Number(config.width) || 10;
              const d = Number(config.depth) || 8;
              const sizeScale = Math.max(0.6, Math.min(2.0, 10 / w));
              
              let deviceScale = 1.0;
              if (canvasWidth) {
                if (canvasWidth < 500) {
                  deviceScale = 0.65;
                } else if (canvasWidth < 850) {
                  deviceScale = 0.82;
                }
              }
              const scale = sizeScale * deviceScale;

              const itemWidthPercent = def.width * scale;
              const itemHeightPercent = itemWidthPercent * (def.height / def.width) * (w / d);

              let sidePlacement = 'right';
              if (item.x > 70) {
                sidePlacement = 'left';
              } else {
                const itemToRight = items.some(other => {
                  if (other.id === item.id) return false;
                  const dx = other.x - item.x;
                  const dy = Math.abs(item.y - other.y);
                  return dx > 0 && dx < 24 && dy < 15;
                });
                if (itemToRight) {
                  sidePlacement = 'left';
                }
              }
              const labelPosClass = sidePlacement === 'right'
                ? 'absolute left-[calc(100%+2px)] top-1/2 -translate-y-1/2'
                : 'absolute right-[calc(100%+2px)] top-1/2 -translate-y-1/2';

              return (
                <div 
                  key={item.id}
                  className="absolute flex flex-col items-center justify-center print:cursor-default touch-none"
                  style={{ 
                    left: `${item.x}%`, top: `${item.y}%`, 
                    width: `${itemWidthPercent}%`, height: `${itemHeightPercent}%`,
                    transform: `translate(-50%, -50%)`, 
                    zIndex: isSelected ? 50 : 10
                  }}
                >
                  {isSelected && (
                    <div className="absolute top-[-52px] left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-1.5 flex items-center gap-1.5 z-[60] cursor-default pointer-events-auto"
                         onPointerDown={e => e.stopPropagation()}>
                      <input 
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white w-24 outline-none focus:border-emerald-500" 
                        value={item.label} 
                        onChange={e => updateSelected({ label: e.target.value })}
                        placeholder="Nombre..."
                      />
                      <button type="button" onClick={() => updateSelected({ rotation: (item.rotation + 45) % 360 })} className="p-1.5 bg-slate-800 hover:bg-emerald-600 rounded text-white border border-slate-700 transition-colors" title="Girar 45º"><RotateCw size={12}/></button>
                      <button type="button" onClick={duplicateSelected} className="p-1.5 bg-slate-800 hover:bg-emerald-600 rounded text-white border border-slate-700 transition-colors" title="Duplicar"><Copy size={12}/></button>
                      <button type="button" onClick={removeSelected} className="p-1.5 bg-slate-800 hover:bg-red-600 rounded text-white border border-slate-700 transition-colors" title="Eliminar"><Trash2 size={12}/></button>
                    </div>
                  )}

                  <div 
                    className={`w-full h-full cursor-move transition-transform flex items-center justify-center ${isSelected ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-950 rounded-sm' : ''} print:ring-0`}
                    style={{ transform: `rotate(${item.rotation}deg)` }}
                    onPointerDown={(e) => handlePointerDown(e, item.id)}
                  >
                    {def.render()}
                  </div>
                  
                  {item.label && (!isSelected || readOnly) && (
                    <div className={`${labelPosClass} bg-slate-950/90 border border-slate-850 px-1 py-0.5 rounded text-[6.5px] font-bold text-slate-300 pointer-events-none shadow-md flex items-center gap-0.5 print:bg-transparent print:text-black print:border-none z-40 whitespace-nowrap`}>
                      <span className="text-emerald-400 font-black">#{idx + 1}</span>
                      <span>{item.label}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend Table underneath Stageplot */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-2 print:mt-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider">Leyenda y Control de Escenario</h4>
          <span className="text-[10px] text-slate-500 font-bold">{items.length} {items.length === 1 ? 'objeto' : 'objetos'}</span>
        </div>
        
        {items.length === 0 ? (
          <div className="text-center p-6 text-xs text-slate-500 italic">No hay equipos agregados en el escenario.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 print:grid-cols-3 gap-2 text-xs">
            {items.map((item, idx) => {
              const def = STAGE_ITEMS[item.type];
              if (!def) return null;
              return (
                <div 
                  key={item.id} 
                  onClick={() => !readOnly && setSelectedId(item.id)}
                  className={`flex items-center justify-between gap-2 p-1.5 rounded-lg border transition-colors ${selectedId === item.id ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 bg-slate-950/20'} print:border-black print:bg-white`}
                >
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[10px] border border-emerald-500/30 shrink-0">
                      {idx + 1}
                    </span>
                    <div className="w-4 h-4 shrink-0 text-slate-400">{def.render()}</div>
                    <div className="flex-1 min-w-0 text-left">
                      {readOnly ? (
                        <p className="text-[11px] text-slate-300 font-bold truncate leading-none">{item.label || def.label}</p>
                      ) : (
                        <input 
                          className="w-full bg-slate-900 border border-slate-800/80 focus:border-emerald-500 rounded px-1.5 py-0.5 text-[11px] text-white outline-none transition-colors leading-none"
                          value={item.label}
                          onChange={(e) => {
                            onChange(items.map(it => it.id === item.id ? { ...it, label: e.target.value } : it));
                          }}
                          placeholder={def.label}
                        />
                      )}
                    </div>
                  </div>
                  
                  {!readOnly && (
                    <div className="flex items-center gap-1 shrink-0 print:hidden">
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange(items.map(it => it.id === item.id ? { ...it, rotation: (it.rotation + 45) % 360 } : it));
                        }} 
                        className="p-1 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded transition-colors"
                        title={`Rotar: ${item.rotation}°`}
                      >
                        <RotateCw size={10}/>
                      </button>
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange(items.filter(it => it.id !== item.id));
                          if (selectedId === item.id) setSelectedId(null);
                        }} 
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={10}/>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
