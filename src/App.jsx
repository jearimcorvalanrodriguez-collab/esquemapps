import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Calendar, Clock, Users, Bell, MessageSquare, 
  Truck, Music, CheckCircle2, XCircle, LogOut, Plus, 
  Navigation, User, Settings, ShieldCheck, UserPlus, 
  UserCheck, Edit3, X, Key, AlertCircle, Loader2,
  Phone, Mail, CheckCheck, Send, Timer, Hourglass,
  Shield, CalendarPlus, FileText, Mic2, Lightbulb, Map as MapIcon, Save,
  Trash2, FolderPlus, RefreshCw, ChevronLeft, CheckSquare, Square, Printer, Utensils, CalendarDays,
  RotateCw, Maximize, Minimize, Link
} from 'lucide-react';

const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  TOUR_MANAGER: 'TOUR MANAGER',
  TEC_JEFE: 'TEC. JEFE',
  TECH: 'TÉCNICO',
  TRASLADO: 'TRASLADO',
  APV: 'APV/CATERING'
};

const ESQUEMAS_MASTER_SECRET = 'Tk9fTWVfSGFja2VlczIwMjYhQCM='; 

// --- SISTEMA DE CACHÉ GLOBAL EN MEMORIA ---
const CACHE = {
  proyectos: null,
  hitos: null,
  riders: null,
  usuarios: null,
  transportes: null,
  mensajes: null
};
const clearCache = (key) => { CACHE[key] = null; };

const apiFetch = async (action, payload = {}) => {
  const response = await fetch('/.netlify/functions/api', {
    method: 'POST',
    body: JSON.stringify({ app_secret: ESQUEMAS_MASTER_SECRET, action, payload })
  });
  return response.json();
};

const Card = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-slate-800 rounded-xl border border-slate-700 shadow-md overflow-hidden ${onClick ? 'cursor-pointer hover:border-emerald-500 transition-colors' : ''} ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, type = 'button', disabled = false, title }) => {
  const base = "flex flex-row items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all duration-200 active:scale-95 text-center leading-tight disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed text-xs md:text-sm print:hidden";
  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 shadow-sm border border-emerald-500/50",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/50",
    ghost: "bg-transparent hover:bg-slate-700 text-slate-300",
    blue: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 shadow-sm border border-blue-500/50"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title} className={`${base} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={14} className="shrink-0" />}
      <span className="truncate">{children}</span>
    </button>
  );
};

const openWhatsApp = (phone) => window.open(`https://wa.me/${phone.replace('+', '')}`, '_blank');
const openEmail = (email) => window.open(`mailto:${email}`, '_blank');
const handlePrint = () => window.print();

const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return <div className="text-lg md:text-xl font-black text-white tracking-widest font-mono">{time.toLocaleTimeString()}</div>;
};

// --- MOTOR GRÁFICO STAGEPLOT ---
const STAGE_ITEMS = {
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
    label: "Toma 220V", width: 8, height: 8, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="5" y="5" width="90" height="90" fill="#ef4444" rx="10"/>
        <text x="50" y="65" fontSize="40" fill="white" fontWeight="bold" textAnchor="middle">⚡</text>
      </svg>
    )
  },
  DI: {
    label: "D.I. Box", width: 8, height: 6, defaultRotation: 0,
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

const StageplotBuilder = ({ items, onChange, config, onConfigChange, readOnly = false, projectName = "" }) => {
  const canvasRef = useRef(null);
  const [draggedId, setDraggedId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const containerClasses = isFullscreen 
    ? "fixed inset-0 md:inset-4 z-[200] bg-slate-900 border border-slate-700 md:rounded-xl shadow-2xl p-2 md:p-4 flex flex-col md:flex-row gap-4"
    : "flex flex-col md:flex-row gap-4 h-full print:block";

  return (
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

          <div className="pt-3 border-t border-slate-800 space-y-2 mt-auto">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dimensiones Stage</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-slate-500 font-bold uppercase">Ancho (m)</label>
                <input type="number" min="2" max="50" className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white outline-none focus:border-emerald-500" value={config.width} onChange={e=>onConfigChange({...config, width: e.target.value})} />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold uppercase">Fondo (m)</label>
                <input type="number" min="2" max="50" className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white outline-none focus:border-emerald-500" value={config.depth} onChange={e=>onConfigChange({...config, depth: e.target.value})} />
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

          {items.map(item => {
            const def = STAGE_ITEMS[item.type];
            const isSelected = selectedId === item.id && !readOnly;
            return (
              <div 
                key={item.id}
                className="absolute flex flex-col items-center justify-center print:cursor-default"
                style={{ 
                  left: `${item.x}%`, top: `${item.y}%`, 
                  width: `${def.width}%`, height: `${def.height}%`,
                  transform: `translate(-50%, -50%)`, 
                  zIndex: isSelected ? 50 : 10
                }}
              >
                {isSelected && (
                  <div className="absolute top-[-55px] left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl p-1.5 flex items-center gap-1.5 z-[60] cursor-default pointer-events-auto"
                       onPointerDown={e => e.stopPropagation()}>
                    <input 
                      className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] text-white w-24 outline-none focus:border-emerald-500" 
                      value={item.label} 
                      onChange={e => updateSelected({ label: e.target.value })}
                      placeholder="Nombre..."
                    />
                    <button type="button" onClick={() => updateSelected({ rotation: (item.rotation + 45) % 360 })} className="p-1.5 bg-slate-700 hover:bg-emerald-600 rounded text-white transition-colors" title="Girar 45º"><RotateCw size={12}/></button>
                    <button type="button" onClick={removeSelected} className="p-1.5 bg-slate-700 hover:bg-red-600 rounded text-white transition-colors" title="Eliminar"><Trash2 size={12}/></button>
                  </div>
                )}

                <div 
                  className={`w-full h-full cursor-move transition-transform ${isSelected ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-950 rounded-sm' : ''} print:ring-0`}
                  style={{ transform: `rotate(${item.rotation}deg)` }}
                  onPointerDown={(e) => handlePointerDown(e, item.id)}
                >
                  {def.render()}
                </div>
                
                {item.label && (!isSelected || readOnly) && (
                  <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/80 print:bg-transparent print:text-black px-2 py-1 rounded text-xs md:text-sm font-bold text-white text-center pointer-events-none">
                    {item.label}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTES RIDERS ---
const AutoResizeTextarea = ({ value, onChange, placeholder, className = "" }) => {
  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);
  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`resize-none overflow-hidden min-h-[30px] ${className}`}
      rows={1}
    />
  );
};

const MicDiSelect = ({ value, onChange }) => {
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

const getEventStatus = (targetDate, currentTime) => {
  if (targetDate.getTime() === 0) return { border: 'border-slate-700', bg: 'bg-slate-800/50', dot: 'bg-slate-500', text: 'Fecha inválida', timeText: '--:--', pulse: false, textClass: 'text-slate-500' };
  const diffMs = targetDate - currentTime;
  if (diffMs <= 0) return { border: 'border-slate-700', bg: 'bg-slate-800/50', dot: 'bg-slate-500', text: 'Finalizado', timeText: '00h 00m 00s', pulse: false, textClass: 'text-slate-500' };
  const diffSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const timeText = `Faltan ${hh}h ${mm}m ${ss}s`;

  if (hours < 2) return { border: 'border-red-500/50', bg: 'bg-red-500/10', dot: 'bg-red-500', text: '¡INMINENTE!', timeText, pulse: true, textClass: 'text-red-500' };
  else if (hours < 24) return { border: 'border-amber-500/50', bg: 'bg-amber-500/10', dot: 'bg-amber-500', text: 'En preparación', timeText, pulse: false, textClass: 'text-amber-500' };
  else return { border: 'border-emerald-500/50', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500', text: 'Agendado', timeText, pulse: false, textClass: 'text-emerald-500' };
};

const EventCard = ({ event, canManage, handleDeleteHito, setAssigningHito, currentUser, requestConfirm }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const status = getEventStatus(event.fullDate, now);
  const isAssignedToMe = event.asignados.includes(currentUser.email);

  let formattedDate = 'Fecha Inválida';
  let dRaw = String(event.date);
  if (dRaw.includes('T')) dRaw = dRaw.split('T')[0];
  const matchISO = dRaw.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (matchISO) {
    formattedDate = `${matchISO[3]}/${matchISO[2]}/${matchISO[1]}`;
  } else {
    const matchLoc = dRaw.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
    if(matchLoc) formattedDate = `${matchLoc[1]}/${matchLoc[2]}/${matchLoc[3]}`;
  }
  
  const timeMatch = String(event.time).match(/\d{2}:\d{2}/);
  const formattedTime = timeMatch ? `${timeMatch[0]} h` : '--:-- h';

  return (
    <div className={`p-3 md:p-4 rounded-xl border transition-all duration-500 relative group ${status.bg} ${status.border}`}>
      {canManage && (
        <button onClick={() => requestConfirm("¿Eliminar este Hito de forma permanente?", () => handleDeleteHito(event.id))} className="absolute top-3 right-3 text-slate-500 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
      )}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 md:gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1.5 pr-8">{event.title}</h3>
          <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs font-bold mb-2">
            <span className="flex items-center gap-1 text-slate-300"><Calendar size={12}/> {formattedDate}</span>
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20"><Clock size={12}/> {formattedTime}</span>
          </div>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 underline decoration-blue-500/30 underline-offset-2 flex items-center gap-1 w-fit mb-3">
            <MapPin size={12}/> {event.location}
          </a>
          <div className="flex items-center gap-1.5 mb-2">
            <span className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${status.dot} ${status.pulse ? 'animate-pulse' : ''}`}></span>
            <span className={`text-[10px] font-black uppercase tracking-wider ${status.textClass}`}>{status.text}</span>
            {isAssignedToMe && <span className="ml-1.5 text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-blue-500/50">Asignado a ti</span>}
          </div>
          {canManage && (
            <Button variant="ghost" className="bg-slate-900 border border-slate-700 py-1 px-2 text-[10px]" icon={Users} onClick={() => setAssigningHito(event)}>
              Asignado ({event.asignados.length})
            </Button>
          )}
        </div>
        <div className={`shrink-0 flex items-center gap-1.5 px-3 py-2 md:py-2.5 rounded-lg border bg-slate-900 ${status.border} ${status.textClass} font-mono font-black text-xs md:text-sm tracking-wider mt-2 md:mt-0`}>
          <Hourglass size={14} className={status.pulse ? 'animate-spin-slow' : ''} />{status.timeText}
        </div>
      </div>
    </div>
  );
};

// --- AUTENTICACIÓN ---
const AuthRouter = ({ setCurrentUser, setCurrentView, showToast }) => {
  const [mode, setMode] = useState('LOGIN'); 
  const [email, setEmail] = useState(''); 
  const [pass, setPass] = useState('');
  const [driverToken, setDriverToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState(ROLES.TECH);
  const [regPhone, setRegPhone] = useState('+569');

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      // Usamos .trim() para limpiar espacios ocultos al copiar/pegar
      const data = await apiFetch('login', { email: email.trim(), password: pass.trim() });
      if (data.status === 'success') setCurrentUser(data.user); 
      else setError(data.message);
    } catch (err) { setError("Error de red conectando al servidor."); }
    setLoading(false);
  };

  const handleDriverLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = await apiFetch('loginConductor', { token: driverToken.trim() });
      if (data.status === 'success') { setCurrentUser(data.user); setCurrentView('CONDUCTOR_VIEW'); } 
      else setError(data.message);
    } catch (err) { setError("Error de red al verificar token."); }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const result = await apiFetch('solicitarAcceso', { name: regName.trim(), email: email.trim(), phone: regPhone.trim(), role: regRole });
      if (result.status === 'success') { setMode('LOGIN'); showToast("Solicitud enviada exitosamente."); } 
      else setError(result.message);
    } catch (err) { setError('Error de red al enviar la solicitud.'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="mb-6 text-center animate-fade-in">
        <Music className="text-emerald-500 mx-auto mb-3" size={40} />
        <h1 className="text-3xl font-black text-white tracking-wider">ESQUEMAPPS</h1>
        <p className="text-slate-400 mt-1 tracking-widest text-xs uppercase font-bold">Production Management</p>
      </div>
      <Card className="w-full max-w-md p-6 animate-slide-up border-slate-700/50">
        <div className="mb-4 text-center border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-white">{mode === 'LOGIN' ? 'Iniciar Sesión' : mode === 'CONDUCTOR' ? 'Acceso Conductor' : 'Solicitar Acceso'}</h2>
        </div>
        
        {mode === 'LOGIN' && (
          <form onSubmit={handleLogin} className="space-y-4">
             {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-2.5 rounded-lg flex items-center gap-2"><AlertCircle size={14} /><span>{error}</span></div>}
            <div><label className="block text-xs font-bold text-slate-400 mb-1">Correo Electrónico</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none transition-colors" required /></div>
            <div><label className="block text-xs font-bold text-slate-400 mb-1">Contraseña</label><input type="password" value={pass} onChange={e=>setPass(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none transition-colors" required /></div>
            <Button type="submit" className="w-full py-2.5" disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : 'Ingresar a Plataforma'}</Button>
            <div className="border-t border-slate-800 pt-3 space-y-2 mt-3">
              <Button type="button" variant="secondary" className="w-full bg-slate-800 text-blue-400 border-blue-900/50 hover:bg-slate-700 hover:text-blue-300 py-2.5" onClick={()=>setMode('CONDUCTOR')} icon={Truck}>Acceso Conductor Logística</Button>
              <p className="text-center text-xs text-slate-400 mt-3">¿No eres parte del Crew aún? <button type="button" onClick={()=>setMode('REGISTER')} className="text-emerald-500 font-bold hover:underline">Solicitar Acceso</button></p>
            </div>
          </form>
        )}

        {mode === 'CONDUCTOR' && (
          <form onSubmit={handleDriverLogin} className="space-y-4">
            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-2.5 rounded-lg flex items-center gap-2"><AlertCircle size={14} /><span>{error}</span></div>}
            <p className="text-xs text-slate-400 text-center">Ingresa el Token de Ruta que te envió producción (Ej: TR-1234).</p>
            <div><label className="block text-xs font-bold text-slate-400 mb-1">Token de Ruta</label><input type="text" value={driverToken} onChange={e=>setDriverToken(e.target.value.toUpperCase())} className="w-full bg-slate-900 border border-blue-500/50 rounded-lg p-2.5 text-white text-center font-mono text-lg tracking-widest focus:border-blue-400 outline-none" placeholder="TR-XXXX" required /></div>
            <Button type="submit" className="w-full py-2.5" variant="blue" disabled={loading} icon={Truck}>{loading ? <Loader2 className="animate-spin"/> : 'Iniciar Ruta'}</Button>
            <p className="text-center text-xs text-slate-400 mt-3"><button type="button" onClick={()=>setMode('LOGIN')} className="text-emerald-500 font-bold hover:underline">Volver al Login de Crew</button></p>
          </form>
        )}

        {mode === 'REGISTER' && (
          <form onSubmit={handleRegister} className="space-y-3">
            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-2.5 rounded-lg flex items-center gap-2"><AlertCircle size={14} /><span>{error}</span></div>}
            <div><label className="block text-xs font-bold text-slate-400 mb-1">Nombre Completo</label><input type="text" value={regName} onChange={e=>setRegName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none" required /></div>
            <div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-bold text-slate-400 mb-1">Correo</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none" required /></div><div><label className="block text-xs font-bold text-slate-400 mb-1">Teléfono</label><input type="tel" value={regPhone} onChange={e=>setRegPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none" required /></div></div>
            <div><label className="block text-xs font-bold text-slate-400 mb-1">Rol</label><select value={regRole} onChange={e=>setRegRole(e.target.value)} className="w-full max-w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none break-words whitespace-normal">{Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}</select></div>
            <Button type="submit" className="w-full py-2.5 mt-2" disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : 'Enviar Solicitud'}</Button>
            <p className="text-center text-xs text-slate-400 mt-3"><button type="button" onClick={()=>setMode('LOGIN')} className="text-emerald-500 font-bold hover:underline">Volver al Login</button></p>
          </form>
        )}
      </Card>
    </div>
  );
};

// --- COMPONENTES DE TRANSPORTE (NUEVOS) ---
const TransportView = ({ currentUser, setCurrentView, showToast }) => {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', time: '', origin: '', dest: '' });
  const canCreate = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TRASLADO].includes(currentUser.role);

  const fetchTransports = async (force = false) => {
    setLoading(true);
    if (!force && CACHE.transportes) {
       setTransports(CACHE.transportes);
       setLoading(false);
       return;
    }
    try {
      const res = await apiFetch('getTransportes');
      if (res.status === 'success') {
         CACHE.transportes = res.data;
         setTransports(res.data);
      }
    } catch(e) {
      showToast("Error al cargar transportes.");
    }
    setLoading(false);
  };

  useEffect(() => { fetchTransports(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('createTransporte', form);
      if (res.status === 'success') {
        showToast("Ruta creada con éxito.");
        setIsCreating(false);
        setForm({ title: '', date: '', time: '', origin: '', dest: '' });
        clearCache('transportes');
        fetchTransports(true);
      }
    } catch(e) {
      showToast("Error al crear ruta.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 pb-24 animate-fade-in">
      <header className="border-b border-slate-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2"><Truck className="text-emerald-500" size={24}/> Transportes</h1>
          <p className="text-sm text-slate-400">Gestión de rutas y traslados.</p>
        </div>
        {canCreate && !isCreating && <Button icon={Plus} onClick={() => setIsCreating(true)}>Nueva Ruta</Button>}
      </header>

      {isCreating && (
        <Card className="p-4 md:p-6 border-emerald-500 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Crear Nueva Ruta</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div><label className="text-xs text-slate-400 block mb-1">Título de la Ruta</label><input required className="w-full bg-slate-900 border-slate-700 rounded p-2 text-sm text-white focus:border-emerald-500" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} placeholder="Ej. Traslado Hotel - Recinto" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-slate-400 block mb-1">Fecha</label><input required type="date" className="w-full bg-slate-900 border-slate-700 rounded p-2 text-sm text-white focus:border-emerald-500" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} /></div>
              <div><label className="text-xs text-slate-400 block mb-1">Hora</label><input required type="time" className="w-full bg-slate-900 border-slate-700 rounded p-2 text-sm text-white focus:border-emerald-500" value={form.time} onChange={e=>setForm({...form, time: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-slate-400 block mb-1">Origen</label><input required className="w-full bg-slate-900 border-slate-700 rounded p-2 text-sm text-white focus:border-emerald-500" value={form.origin} onChange={e=>setForm({...form, origin: e.target.value})} /></div>
              <div><label className="text-xs text-slate-400 block mb-1">Destino</label><input required className="w-full bg-slate-900 border-slate-700 rounded p-2 text-sm text-white focus:border-emerald-500" value={form.dest} onChange={e=>setForm({...form, dest: e.target.value})} /></div>
            </div>
            <div className="flex gap-2 pt-2"><Button variant="secondary" className="flex-1 py-2" onClick={()=>setIsCreating(false)}>Cancelar</Button><Button type="submit" className="flex-1 py-2">Guardar Ruta</Button></div>
          </form>
        </Card>
      )}

      {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500" size={28}/></div> : transports.length === 0 ? <div className="text-center p-8 border border-slate-800 border-dashed rounded-xl text-slate-500">No hay transportes programados.</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transports.map(t => (
            <Card key={t.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-white">{t.title}</h3>
                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${t.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50' : t.status === 'EN RUTA' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/50' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/50'}`}>{t.status}</span>
              </div>
              <div className="space-y-1 text-sm text-slate-300 mb-4">
                <p className="flex items-center gap-2"><Calendar size={14}/> {t.date} {t.time}</p>
                <p className="flex items-center gap-2"><MapPin size={14}/> Origen: {t.origin}</p>
                <p className="flex items-center gap-2"><Navigation size={14}/> Destino: {t.dest}</p>
              </div>
              <div className="bg-slate-900 border border-slate-700 p-2 rounded flex justify-between items-center">
                <span className="text-xs text-slate-400 uppercase font-bold">Token Piloto</span>
                <span className="font-mono text-emerald-400 font-bold tracking-widest">{t.token}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const TransportDetailsView = ({ currentUser, setCurrentView, showToast }) => {
  return (
    <div className="p-4 text-center text-slate-400 mt-10">
      <h2 className="text-xl font-bold text-white mb-2">Detalles de Transporte</h2>
      <p>Módulo de seguimiento en vivo en desarrollo.</p>
      <Button variant="secondary" className="mx-auto mt-4" onClick={() => setCurrentView('TRANSPORT')}>Volver a Transportes</Button>
    </div>
  );
};

const ConductorView = ({ currentUser, showToast }) => {
  const [routeInfo, setRouteInfo] = useState(currentUser.routeInfo || {});
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus) => {
    setLoading(true);
    try {
      const res = await apiFetch('updateTransportStatus', { token: routeInfo.token, newStatus });
      if (res.status === 'success') {
        setRouteInfo({...routeInfo, status: newStatus});
        showToast(`Estado actualizado a ${newStatus}`);
        clearCache('transportes');
      }
    } catch(e) { showToast("Error al actualizar estado."); }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-lg mx-auto animate-fade-in mt-4">
      <Card className="p-6 border-blue-500/50">
        <h2 className="text-xl font-black text-white mb-2">{routeInfo.title}</h2>
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 mb-4 flex items-center justify-between">
           <span className="text-xs text-slate-400 uppercase font-bold">Token Ruta</span>
           <span className="font-mono text-emerald-400 font-bold tracking-widest text-lg">{routeInfo.token}</span>
        </div>
        <div className="space-y-3 text-sm text-slate-300 mb-6">
          <p className="flex items-center gap-2"><Calendar size={16} className="text-blue-400"/> Fecha: {routeInfo.date} a las {routeInfo.time}</p>
          <div className="p-3 bg-slate-900 rounded border border-slate-800">
             <p className="flex items-center gap-2 mb-2 font-bold text-white"><MapPin size={16} className="text-amber-500"/> Origen: {routeInfo.origin}</p>
             <p className="flex items-center gap-2 font-bold text-white"><Navigation size={16} className="text-emerald-500"/> Destino: {routeInfo.dest}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <p className="text-xs text-slate-400 uppercase font-bold text-center">Actualizar Estado</p>
          <Button variant="secondary" className="w-full py-3" onClick={()=>updateStatus('PENDING')} disabled={loading || routeInfo.status === 'PENDING'}>Marcar PENDIENTE</Button>
          <Button variant="blue" className="w-full py-3" onClick={()=>updateStatus('EN RUTA')} disabled={loading || routeInfo.status === 'EN RUTA'}>Marcar EN RUTA</Button>
          <Button variant="primary" className="w-full py-3" onClick={()=>updateStatus('FINALIZADO')} disabled={loading || routeInfo.status === 'FINALIZADO'}>Marcar FINALIZADO</Button>
        </div>
      </Card>
    </div>
  );
};

// --- VISTAS PRINCIPALES ---
const Dashboard = ({ currentUser, setCurrentView, setSelectedProject, showToast, directory }) => {
  const canCreate = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Gira Musical' });
  const [assigningProject, setAssigningProject] = useState(null);

  const fetchProyectos = async (force = false) => {
    setFetchError(false);
    if (!force && CACHE.proyectos) {
       setProyectos(CACHE.proyectos);
       setLoading(false);
       return;
    }
    try {
      const res = await apiFetch('getProyectos');
      if (res.status === 'success') {
        const parsed = res.data.map(p => ({ ...p, asignados: Array.isArray(p.asignados) ? p.asignados : [] }));
        CACHE.proyectos = parsed;
        setProyectos(parsed);
      }
      else setFetchError(res.message || "Error al obtener proyectos");
    } catch (e) { setFetchError("No se pudo conectar al servidor."); }
    setLoading(false);
  };

  useEffect(() => { fetchProyectos(); }, []);

  const handleCreateProyecto = async (e) => {
    e.preventDefault(); 
    try {
      const payload = { ...form, manager: currentUser.name };
      const res = await apiFetch('createProyecto', payload);
      if (res.status === 'success') {
        showToast("Proyecto creado exitosamente."); setIsCreating(false); setForm({ name: '', type: 'Gira Musical' }); 
        clearCache('proyectos'); fetchProyectos(true);
      } else {
        showToast(res.message);
      }
    } catch(e) { showToast("Error al crear proyecto."); }
  };

  const handleUpdateStatus = async (e, id, currentStatus) => {
    e.stopPropagation(); 
    const newStatus = currentStatus === 'ACTIVO' ? 'FINALIZADO' : 'ACTIVO';
    try {
      await apiFetch('updateProyectoStatus', { id, status: newStatus });
      showToast("Estado actualizado."); 
      clearCache('proyectos'); fetchProyectos(true);
    } catch(e) { showToast("Error al actualizar."); }
  };

  const toggleAssignProject = (email) => {
    setAssigningProject(prev => {
      const isAssigned = prev.asignados.includes(email);
      const newAsignados = isAssigned ? prev.asignados.filter(e => e !== email) : [...prev.asignados, email];
      return { ...prev, asignados: newAsignados };
    });
  };

  const saveProjectAsignaciones = async () => {
    try {
      await apiFetch('updateProyectoAsignaciones', { id: assigningProject.id, asignados: assigningProject.asignados });
      showToast("Asignaciones de proyecto guardadas."); setAssigningProject(null); 
      clearCache('proyectos'); fetchProyectos(true);
    } catch(e) { showToast("Error al guardar."); }
  };

  const visibleProyectos = canCreate ? proyectos : proyectos.filter(p => p.asignados.includes(currentUser.email));

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-24 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b border-slate-800 pb-4">
        <div><h1 className="text-2xl md:text-3xl font-black text-white leading-tight">Hola, {currentUser.name.split(' ')[0]}</h1><p className="text-emerald-400 text-xs md:text-sm font-black uppercase tracking-wider">{currentUser.role}</p></div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="ghost" icon={RefreshCw} onClick={() => fetchProyectos(true)} className="px-2 border border-slate-700 hover:text-emerald-400" title="Actualizar Proyectos" />
          {canCreate && !isCreating && <Button icon={FolderPlus} variant="primary" className="flex-1 sm:flex-none" onClick={() => setIsCreating(true)}>Nuevo Proyecto</Button>}
        </div>
      </header>

      {isCreating && (
        <Card className="p-4 md:p-6 border-emerald-500 mb-4 max-w-2xl">
          <h2 className="text-base md:text-lg font-bold text-white mb-3">Iniciar Nuevo Proyecto / Gira</h2>
          <form onSubmit={handleCreateProyecto} className="space-y-3">
            <div><label className="text-[10px] md:text-xs font-bold text-slate-400 block mb-1 uppercase">Nombre del Proyecto</label><input required className="w-full bg-slate-900 border border-slate-700 rounded p-2 md:p-2.5 text-xs md:text-sm text-white outline-none focus:border-emerald-500" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} /></div>
            <div>
              <label className="text-[10px] md:text-xs font-bold text-slate-400 block mb-1 uppercase">Tipo de Producción</label>
              <select className="w-full max-w-full bg-slate-900 border border-slate-700 rounded p-2 md:p-2.5 text-xs md:text-sm text-white outline-none focus:border-emerald-500 break-words" value={form.type} onChange={e=>setForm({...form, type: e.target.value})}>
                <option value="Gira Musical">Gira Musical (Tour)</option><option value="Festival">Festival</option><option value="Show Único">Show Único (One-Off)</option><option value="Evento Corporativo">Evento Corporativo</option>
              </select>
            </div>
            <div className="flex gap-2 pt-1"><Button variant="secondary" className="flex-1 py-2 md:py-2.5" onClick={()=>setIsCreating(false)}>Cancelar</Button><Button type="submit" className="flex-1 py-2 md:py-2.5">Guardar Proyecto</Button></div>
          </form>
        </Card>
      )}

      <div>
        <h2 className="text-base md:text-lg font-bold text-slate-300 mb-3 flex items-center gap-1.5"><Navigation size={18}/> Proyectos Activos</h2>
        
        {fetchError ? (
          <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl text-red-400 flex items-center gap-2 text-sm"><AlertCircle size={18} /> {fetchError}</div>
        ) : loading && proyectos.length === 0 ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500" size={28}/></div>
        ) : visibleProyectos.length === 0 ? (
          <div className="text-center p-8 border border-slate-800 border-dashed rounded-xl text-slate-500 text-sm">
            {canCreate ? "No hay proyectos activos." : "No tienes proyectos asignados en este momento."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {visibleProyectos.map(proyecto => {
              const projectDate = new Date(Number(proyecto.id));
              const formattedProjectDate = `${String(projectDate.getDate()).padStart(2, '0')}/${String(projectDate.getMonth() + 1).padStart(2, '0')}/${projectDate.getFullYear()}`;

              return (
                <Card 
                  key={proyecto.id} 
                  onClick={() => { setSelectedProject(proyecto); setCurrentView('PROJECT_DETAILS'); }}
                  className={`group cursor-pointer ${proyecto.status === 'ACTIVO' ? 'hover:border-emerald-500' : 'opacity-70 grayscale hover:grayscale-0'}`}
                >
                  <div className="p-3 md:p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/20"><Music className="text-emerald-500" size={20} /></div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded block w-fit ${proyecto.status === 'ACTIVO' ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 bg-slate-800 border border-slate-700'}`}>{proyecto.status}</span>
                        <span className="text-[9px] md:text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700 uppercase font-bold tracking-wider">{proyecto.type}</span>
                      </div>
                    </div>
                    
                    <h2 className="text-lg font-bold text-white leading-tight mb-2">{proyecto.name}</h2>
                    <div className="space-y-1 mb-3">
                      <p className="text-xs md:text-sm text-slate-300 flex items-center gap-1.5">
                        <Calendar size={12}/> {formattedProjectDate}
                      </p>
                      <p className="text-xs md:text-sm text-slate-400 flex items-center gap-1.5"><User size={12}/> Liderado por: {proyecto.manager}</p>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 border-t border-slate-700 pt-3">
                      {canCreate && (
                        <Button variant="ghost" className="w-full bg-slate-900 border border-slate-700 hover:text-white text-[10px] md:text-xs py-1.5 mb-1" icon={Users} onClick={(e) => { e.stopPropagation(); setAssigningProject(proyecto); }}>
                          Asignar Equipo ({proyecto.asignados.length})
                        </Button>
                      )}
                      {canCreate && (
                        <div className="flex gap-1.5">
                          <Button variant="ghost" className="flex-1 bg-slate-900 border border-slate-700 hover:text-white text-[10px] md:text-xs py-1.5" onClick={(e) => { e.stopPropagation(); showToast("Para editar nombre hazlo desde la BD."); }}>Editar</Button>
                          <Button variant="ghost" className="flex-1 bg-slate-900 border border-slate-700 hover:text-emerald-400 text-[10px] md:text-xs py-1.5" onClick={(e) => handleUpdateStatus(e, proyecto.id, proyecto.status)}>
                            {proyecto.status === 'ACTIVO' ? 'Finalizar' : 'Reactivar'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {assigningProject && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-md p-4 md:p-6 bg-slate-900 border-emerald-500 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-3">
              <h2 className="text-base md:text-lg font-bold text-white">Asignar Equipo al Proyecto</h2>
              <button onClick={() => setAssigningProject(null)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            <p className="text-xs md:text-sm text-emerald-400 font-bold mb-3">{assigningProject.name}</p>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 mb-3 pr-2 custom-scrollbar">
              {directory.length === 0 ? <p className="text-slate-500 text-xs md:text-sm text-center">Cargando directorio...</p> : directory.map(u => {
                const isChecked = assigningProject.asignados.includes(u.email);
                return (
                  <button key={u.email} onClick={() => toggleAssignProject(u.email)} className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-colors ${isChecked ? 'bg-emerald-500/10 border-emerald-500/50 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                    <div className="flex items-center gap-2.5">
                      {isChecked ? <CheckSquare className="text-emerald-500" size={18}/> : <Square size={18}/>}
                      <div className="text-left"><p className="font-bold text-xs md:text-sm">{u.name}</p><p className="text-[9px] uppercase tracking-wider">{u.role}</p></div>
                    </div>
                  </button>
                );
              })}
            </div>
            <Button onClick={saveProjectAsignaciones} className="w-full py-2.5 md:py-3 text-xs md:text-sm">Guardar Asignaciones</Button>
          </Card>
        </div>
      )}
    </div>
  );
};

const ProjectDetailsView = ({ currentUser, setCurrentView, selectedProject, showToast, directory, requestConfirm, setActiveRider }) => {
  const p = selectedProject;
  const canManage = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role);
  const canManageRiders = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TEC_JEFE].includes(currentUser.role);
  const [hitos, setHitos] = useState([]);
  const [projectRiders, setProjectRiders] = useState([]);
  const [allRiders, setAllRiders] = useState([]);
  const [linkingRider, setLinkingRider] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ title: '', location: '', date: '', time: '' });
  const [assigningHito, setAssigningHito] = useState(null);

  const processHitos = (data) => {
    const projectHitos = data.filter(ev => String(ev.proyectoId) === String(p.id));
    const parsedEvents = projectHitos.map(ev => {
      let fullDate = new Date(0); 
      try {
          let dStr = '';
          let dRaw = String(ev.date);
          if (dRaw.includes('T')) dRaw = dRaw.split('T')[0];
          const matchISO = dRaw.match(/(\d{4})-(\d{2})-(\d{2})/);
          if (matchISO) dStr = matchISO[0];
          else {
              const matchLoc = dRaw.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
              if(matchLoc) dStr = `${matchLoc[3]}-${matchLoc[2]}-${matchLoc[1]}`;
          }
          
          let tStr = '00:00';
          const timeMatch = String(ev.time).match(/\d{2}:\d{2}/);
          if(timeMatch) tStr = timeMatch[0];

          const dateObj = new Date(`${dStr}T${tStr}:00`);
          if(!isNaN(dateObj.getTime())) fullDate = dateObj;
      } catch(e) {}
      return { ...ev, fullDate, asignados: Array.isArray(ev.asignados) ? ev.asignados : [] };
    });
    setHitos(parsedEvents.sort((a,b) => a.fullDate - b.fullDate));
  };

  const processRiders = (data) => {
    const parsedRiders = data.map(r => {
      let content = {};
      try { content = JSON.parse(r.content); } catch(e){}
      return { ...r, content };
    });
    setAllRiders(parsedRiders);
    setProjectRiders(parsedRiders.filter(r => String(r.content.proyectoId) === String(p.id)));
  };

  const fetchHitos = async (force = false) => {
    setFetchError(false);
    if (!force && CACHE.hitos) { processHitos(CACHE.hitos); setLoading(false); return; }
    try {
      const res = await apiFetch('getHitos');
      if (res.status === 'success') { CACHE.hitos = res.data; processHitos(res.data); } 
      else setFetchError(res.message || "Error al obtener hitos");
    } catch(e) { setFetchError("Fallo de red al obtener hitos."); }
    setLoading(false);
  };

  const fetchProjectRiders = async (force = false) => {
    if (!force && CACHE.riders) { processRiders(CACHE.riders); return; }
    try {
      const res = await apiFetch('getRiders');
      if (res.status === 'success') { CACHE.riders = res.data; processRiders(res.data); }
    } catch(e) {}
  };

  useEffect(() => { fetchHitos(); fetchProjectRiders(); }, []);

  const firstHito = hitos.length > 0 ? hitos[0] : null;
  let projectDateStr = "Sin hitos programados";
  let showClock = false;

  if (firstHito && firstHito.fullDate && firstHito.fullDate.getTime() !== 0) {
    const fd = firstHito.fullDate;
    projectDateStr = `${String(fd.getDate()).padStart(2, '0')}/${String(fd.getMonth() + 1).padStart(2, '0')}/${fd.getFullYear()} - ${String(fd.getHours()).padStart(2, '0')}:${String(fd.getMinutes()).padStart(2, '0')} h`;
    
    const diffMs = fd.getTime() - new Date().getTime();
    const hoursDiff = diffMs / (1000 * 60 * 60);
    if (hoursDiff <= 72) {
      showClock = true;
    }
  }

  const handleCreateHito = async (e) => {
    e.preventDefault(); 
    try {
      const payload = { ...form, proyectoId: p.id };
      const res = await apiFetch('createHito', payload);
      if (res.status === 'success') {
        showToast("Hito agendado."); setIsCreating(false); setForm({ title: '', location: '', date: '', time: '' }); 
        clearCache('hitos'); fetchHitos(true);
      } else {
        showToast("Error: " + res.message); 
      }
    } catch(e) { showToast("Error al crear hito."); }
  };

  const handleDeleteHito = async (id) => {
    try {
      await apiFetch('deleteHito', { id });
      showToast("Hito eliminado."); 
      clearCache('hitos'); fetchHitos(true);
    } catch(e) { showToast("Error al eliminar."); }
  };

  const captureGPS = () => {
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setForm(prev => ({...prev, location: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`}));
        showToast("GPS Capturado correctamente");
      }, () => showToast("Error al obtener GPS. Activa los permisos."));
    } else showToast("Tu navegador no soporta GPS.");
  };

  const toggleAssign = (email) => {
    setAssigningHito(prev => {
      const isAssigned = prev.asignados.includes(email);
      const newAsignados = isAssigned ? prev.asignados.filter(e => e !== email) : [...prev.asignados, email];
      return { ...prev, asignados: newAsignados };
    });
  };

  const saveAsignaciones = async () => {
    try {
      await apiFetch('updateHitoAsignaciones', { id: assigningHito.id, asignados: assigningHito.asignados });
      showToast("Asignaciones guardadas."); setAssigningHito(null); 
      clearCache('hitos'); fetchHitos(true);
    } catch(e) { showToast("Error al guardar."); }
  };

  const handleLinkRider = async (riderId) => {
    const riderToLink = allRiders.find(r => r.id === riderId);
    if(!riderToLink) return;
    const newContent = { ...riderToLink.content, proyectoId: p.id };
    setLoading(true);
    try {
      await apiFetch('updateRider', { 
        id: riderToLink.id, 
        title: riderToLink.title, 
        type: riderToLink.type, 
        content: JSON.stringify(newContent) 
      });
      showToast("Rider vinculado al proyecto.");
      setLinkingRider(false);
      clearCache('riders'); fetchProjectRiders(true); 
    } catch(e) { 
      showToast("Error al vincular."); 
      setLoading(false); 
    }
  };

  const handleUnlinkRider = async (rider) => {
    const newContent = { ...rider.content, proyectoId: '' };
    setLoading(true);
    try {
      await apiFetch('updateRider', { 
        id: rider.id, 
        title: rider.title, 
        type: rider.type, 
        content: JSON.stringify(newContent) 
      });
      showToast("Documento desvinculado de la gira.");
      clearCache('riders'); fetchProjectRiders(true);
    } catch(err) { 
      showToast("Error al desvincular."); 
      setLoading(false); 
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-24 max-w-4xl mx-auto">
      <button onClick={() => setCurrentView('DASHBOARD')} className="flex items-center gap-1.5 text-xs md:text-sm text-slate-400 hover:text-white transition-colors mb-2"><ChevronLeft size={16}/> Volver a Proyectos</button>
      
      <header className="border-b border-slate-800 pb-4 flex flex-col items-start gap-2">
        <div>
          <span className="text-[9px] md:text-[10px] bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700 uppercase font-bold tracking-wider mb-1.5 inline-block">VISTA PROYECTO</span>
          <h1 className="text-xl md:text-2xl font-black text-white leading-tight">{p.name}</h1>
          <div className="mt-1.5 space-y-1">
            <p className="text-xs md:text-sm text-slate-300 flex items-center gap-1.5"><Calendar size={12}/> Inicio: {projectDateStr}</p>
            <p className="text-xs md:text-sm text-slate-400 flex items-center gap-1.5"><User size={12}/> Liderado por: {p.manager}</p>
          </div>
        </div>
      </header>

      {/* --- SECCIÓN RIDERS DEL PROYECTO --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 mb-3 gap-3">
        <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2"><FileText className="text-emerald-500" size={18}/> Documentos Técnicos (Riders)</h2>
        {canManageRiders && (
          <div className="flex gap-2">
            <Button icon={Link} onClick={() => setLinkingRider(true)} variant="secondary" className="py-1.5 px-3 text-xs md:text-sm">Vincular</Button>
            <Button icon={Plus} onClick={() => setCurrentView('RIDERS')} variant="primary" className="py-1.5 px-3 text-xs md:text-sm">Ir a Riders</Button>
          </div>
        )}
      </div>
      
      {projectRiders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8 border-b border-slate-800 pb-8">
          {projectRiders.map(r => (
            <Card key={r.id} onClick={() => { setActiveRider(r); setCurrentView('RIDERS'); }} className="p-3 md:p-4 group cursor-pointer hover:border-emerald-500 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/20"><FileText className="text-emerald-500" size={16} /></div>
                  <span className="text-[9px] md:text-[10px] bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700 font-bold uppercase">{r.type}</span>
                </div>
                {canManageRiders && (
                  <button onClick={(e) => { e.stopPropagation(); requestConfirm("¿Desvincular este documento del proyecto?", () => handleUnlinkRider(r)); }} className="text-slate-500 hover:text-red-500 transition-colors p-1" title="Desvincular">
                    <XCircle size={16} />
                  </button>
                )}
              </div>
              <h3 className="font-bold text-white text-sm md:text-base leading-tight truncate">{r.title}</h3>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-6 border border-slate-800 border-dashed rounded-xl bg-slate-900/50 mb-8">
          <p className="text-slate-400 text-xs md:text-sm">No hay Riders vinculados a este proyecto.</p>
        </div>
      )}

      {/* --- SECCIÓN TIMING --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 mb-4 gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Clock className="text-emerald-500"/> Run of Show / Timing</h2>
          {showClock && (
            <div className="bg-slate-900 border border-slate-700 px-4 py-1.5 rounded-lg flex items-center gap-2 shadow-inner animate-fade-in">
              <Timer className="text-emerald-500 animate-pulse" size={16} />
              <LiveClock />
            </div>
          )}
        </div>
        {canManage && !isCreating && <Button icon={Plus} onClick={() => setIsCreating(true)}>Agregar Hito</Button>}
      </div>

      {isCreating && (
        <Card className="p-6 border-emerald-500 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Agendar Nuevo Hito</h2>
          <form onSubmit={handleCreateHito} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Título del Hito</label>
                <input list="hitos-list" required className="w-full bg-slate-900 border-slate-700 rounded p-2 md:p-2.5 text-xs md:text-sm text-white outline-none focus:border-emerald-500" placeholder="Ej: Soundcheck, Load In..." value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
                <datalist id="hitos-list"><option value="Load In (Montaje)" /><option value="Soundcheck (Prueba de Sonido)" /><option value="Puertas (Apertura al público)" /><option value="Show Telonero" /><option value="Show Principal" /><option value="Load Out (Desmontaje)" /></datalist>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Ubicación / Locación</label>
                <div className="flex items-center gap-2">
                  <input required className="w-full bg-slate-900 border-slate-700 rounded p-2 md:p-2.5 text-xs md:text-sm text-white outline-none focus:border-emerald-500" placeholder="Ej: Escenario Principal" value={form.location} onChange={e=>setForm({...form, location: e.target.value})} />
                  <Button type="button" variant="secondary" icon={MapPin} onClick={captureGPS} title="Usar GPS" className="px-3" />
                </div>
              </div>
              <div><label className="text-xs text-slate-400 block mb-1">Fecha</label><input required type="date" className="w-full bg-slate-900 border-slate-700 rounded p-2 md:p-2.5 text-xs md:text-sm text-white outline-none focus:border-emerald-500" onChange={e=>setForm({...form, date: e.target.value})} /></div>
              <div><label className="text-xs text-slate-400 block mb-1">Hora</label><input required type="time" className="w-full bg-slate-900 border-slate-700 rounded p-2 md:p-2.5 text-xs md:text-sm text-white outline-none focus:border-emerald-500" onChange={e=>setForm({...form, time: e.target.value})} /></div>
            </div>
            <div className="flex gap-2 pt-2"><Button variant="secondary" className="flex-1 py-2 md:py-2.5" onClick={()=>setIsCreating(false)}>Cancelar</Button><Button type="submit" className="flex-1 py-2 md:py-2.5">Guardar Hito</Button></div>
          </form>
        </Card>
      )}

      {fetchError ? (
        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-400 flex items-center gap-3"><AlertCircle size={20} /> {fetchError}</div>
      ) : loading && hitos.length === 0 ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-emerald-500" size={32}/></div>
      ) : hitos.length === 0 ? (
        <div className="text-center p-12 border border-slate-800 border-dashed rounded-xl bg-slate-900/50">
          <CalendarPlus className="mx-auto text-slate-600 mb-4" size={48} />
          <p className="text-slate-400 text-sm max-w-md mx-auto">Aún no has agregado hitos al timing de este proyecto.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {hitos.map((event) => (
            <EventCard 
               key={event.id} 
               event={event} 
               canManage={canManage} 
               handleDeleteHito={handleDeleteHito} 
               setAssigningHito={setAssigningHito} 
               currentUser={currentUser} 
               requestConfirm={requestConfirm} 
            />
          ))}
        </div>
      )}

      {assigningHito && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-md p-4 md:p-6 bg-slate-900 border-emerald-500 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-3">
              <h2 className="text-base md:text-lg font-bold text-white">Asignar Crew al Hito</h2>
              <button onClick={() => setAssigningHito(null)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            <p className="text-xs md:text-sm text-emerald-400 font-bold mb-3">{assigningHito.title}</p>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 mb-3 pr-2 custom-scrollbar">
              {directory.length === 0 ? <p className="text-slate-500 text-xs md:text-sm text-center">Cargando directorio...</p> : directory.map(u => {
                const isChecked = assigningHito.asignados.includes(u.email);
                return (
                  <button key={u.email} onClick={() => toggleAssign(u.email)} className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-colors ${isChecked ? 'bg-emerald-500/10 border-emerald-500/50 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                    <div className="flex items-center gap-2.5">
                      {isChecked ? <CheckSquare className="text-emerald-500" size={18}/> : <Square size={18}/>}
                      <div className="text-left"><p className="font-bold text-xs md:text-sm">{u.name}</p><p className="text-[9px] uppercase tracking-wider">{u.role}</p></div>
                    </div>
                  </button>
                );
              })}
            </div>
            <Button onClick={saveAsignaciones} className="w-full py-2.5 md:py-3 text-xs md:text-sm">Guardar Asignaciones</Button>
          </Card>
        </div>
      )}

      {/* --- MODAL VINCULAR RIDER --- */}
      {linkingRider && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <Card className="w-full max-w-md p-4 md:p-6 bg-slate-900 border-emerald-500 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-3">
              <h2 className="text-base md:text-lg font-bold text-white">Vincular Documento</h2>
              <button onClick={() => setLinkingRider(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mb-4">Selecciona un Rider existente para añadirlo a <span className="text-emerald-400 font-bold">{p.name}</span>.</p>
            
            <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-2 custom-scrollbar">
              {allRiders.filter(r => String(r.content.proyectoId) !== String(p.id)).length === 0 ? (
                 <p className="text-slate-500 text-xs md:text-sm text-center">No hay documentos disponibles para vincular.</p>
              ) : allRiders.filter(r => String(r.content.proyectoId) !== String(p.id)).map(r => (
                <button key={r.id} onClick={() => handleLinkRider(r.id)} className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-700 bg-slate-800 hover:border-emerald-500 hover:bg-slate-700 transition-colors text-left group">
                  <div>
                    <p className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">{r.title}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{r.type}</p>
                  </div>
                  <Plus size={18} className="text-slate-500 group-hover:text-emerald-500"/>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};

const RidersView = ({ currentUser, showToast, requestConfirm, activeRider, setActiveRider, directory }) => {
  const [riders, setRiders] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [viewMode, setViewMode] = useState(activeRider ? 'DETAIL' : 'LIST');
  const [editTab, setEditTab] = useState('GENERAL');
  const [allHitos, setAllHitos] = useState([]);
  const [includeTiming, setIncludeTiming] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  
  const canManageRiders = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TEC_JEFE].includes(currentUser.role);
  const canManageProjects = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role);

  const defaultContent = {
    proyectoId: '',
    importante: '',
    contacto: { mgmtNombre: '', mgmtCel: '', mgmtCorreo: '', prodNombre: '', prodCel: '', prodCorreo: '' },
    soundcheck: '',
    recordatorio: '',
    outputs: [{ mix: '', player: '', monitor: '', obs: '' }],
    inputs: [{ ch: '1', name: '', mic: '', v48: '', stand: '', position: '', obs: '' }],
    backline: [{ col1: '', col2: '', col3: '', col4: '' }],
    visuals: [{ col1: '', col2: '', col3: '', col4: '' }],
    stageplot: [],
    stageplotConfig: { width: 10, depth: 8 },
    catering: { showSizes: false, showCatEquipo: false, notes: '', tables: [] }
  };

  const templatesTexto = {
    importante: "Toda la información técnica detallada en este rider es exclusiva y confidencial. Cualquier cambio, sustitución de equipos o modificaciones de marca deben ser consultadas y aprobadas por escrito por la producción con al menos 15 días de anticipación al evento. De lo contrario, no se aceptará la alternativa en terreno.",
    soundcheck: "El sistema de P.A. debe estar 100% operativo, ruteado, alineado y libre de ruidos al menos 1 hora antes de la llegada de nuestro equipo técnico (Load In). El escenario debe estar despejado, limpio y con todos los requerimientos de backline listos para pruebas.",
    recordatorio: "Por favor asegurar la provisión de energía eléctrica estable, con las tomas de corriente (220v/110v) indicadas y aterrizadas correctamente. La seguridad del equipo y del personal es responsabilidad absoluta del promotor local desde el Load In hasta el término del Load Out."
  };

  const CATERING_SECTIONS = [
    "CAT PRE-SHOW",
    "CAT POST-SHOW",
    "DETALLE CAMARÍN ARTISTA",
    "DETALLE CAMARÍN MÚSICOS/STAFF",
    "SEGURIDAD",
    "VIÁTICOS Y ALIMENTACIÓN",
    "OTRA TABLA..."
  ];

  const [form, setForm] = useState({ id: null, title: '', type: 'COMPLETO', content: defaultContent });

  const fetchData = async (force = false) => {
    setLoading(true); setFetchError(false);
    try {
      let rd = CACHE.riders, pd = CACHE.proyectos, hd = CACHE.hitos;
      
      if (force || !rd) { const res = await apiFetch('getRiders'); if(res.status==='success') { rd = res.data; CACHE.riders = rd; } }
      if (force || !pd) { const res = await apiFetch('getProyectos'); if(res.status==='success') { pd = res.data; CACHE.proyectos = pd; } }
      if (force || !hd) { const res = await apiFetch('getHitos'); if(res.status==='success') { hd = res.data; CACHE.hitos = hd; } }
      
      if (pd) setProyectos(pd.filter(p => p.status === 'ACTIVO'));
      if (hd) setAllHitos(hd);
      
      if (rd) {
        const parsedRiders = rd.map(r => {
          let parsedContent;
          try { 
            parsedContent = JSON.parse(r.content); 
            if(!parsedContent.stageplot) parsedContent.stageplot = [];
            if(!parsedContent.stageplotConfig) parsedContent.stageplotConfig = { width: 10, depth: 8 };
            if(!parsedContent.proyectoId) parsedContent.proyectoId = '';
            if(!parsedContent.catering) parsedContent.catering = { showSizes: false, showCatEquipo: false, notes: '', tables: [] };
            if(!parsedContent.catering.tables) parsedContent.catering.tables = [];
            if(parsedContent.catering.showCatEquipo === undefined) parsedContent.catering.showCatEquipo = false;
          } 
          catch(e) { parsedContent = { ...defaultContent, importante: r.content }; }
          return { ...r, content: parsedContent };
        });
        setRiders(parsedRiders);
        
        if (activeRider) {
           const updatedActive = parsedRiders.find(r => String(r.id) === String(activeRider.id));
           if (updatedActive) setActiveRider(updatedActive);
        }
      }
    } catch(e) { setFetchError(true); }
    setLoading(false);
  };
  
  useEffect(() => { fetchData(); }, []);
  
  useEffect(() => {
    if (activeRider) setViewMode('DETAIL');
  }, [activeRider]);

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const action = form.id ? 'updateRider' : 'createRider';
      const payloadToSave = { ...form, content: JSON.stringify(form.content) };
      await apiFetch(action, payloadToSave);
      showToast("Documento guardado correctamente."); 
      setViewMode('LIST');
      setActiveRider(null);
      setIsPreview(false);
      clearCache('riders');
      fetchData(true);
    } catch(e) { showToast("Error al guardar."); setLoading(false); }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await apiFetch('deleteRider', { id });
      showToast("Documento eliminado permanentemente."); 
      setViewMode('LIST');
      setActiveRider(null);
      clearCache('riders');
      fetchData(true);
    } catch(e) { showToast("Error al eliminar."); setLoading(false); }
  };

  const openEditor = (rider = null) => {
    if (rider) setForm({ ...rider });
    else setForm({ id: null, title: 'Nuevo Documento', type: 'COMPLETO', content: JSON.parse(JSON.stringify(defaultContent)) });
    setEditTab('GENERAL'); 
    setViewMode('EDIT');
    setIsPreview(false);
  };

  const restoreDefaults = () => {
    setForm(prev => ({ ...prev, content: { ...JSON.parse(JSON.stringify(defaultContent)), proyectoId: prev.content.proyectoId } }));
    showToast("Plantilla restaurada.");
  };

  const updateTable = (tableName, index, field, value) => {
    setForm(prev => {
      const newTable = [...prev.content[tableName]];
      newTable[index][field] = value;
      return { ...prev, content: { ...prev.content, [tableName]: newTable } };
    });
  };
  const addRow = (tableName, template) => {
    if (form.content[tableName].length >= 100) return showToast("Límite de 100 filas alcanzado.");
    setForm(prev => ({ ...prev, content: { ...prev.content, [tableName]: [...prev.content[tableName], template] } }));
  };
  const removeRow = (tableName, index) => {
    setForm(prev => {
      const newTable = [...prev.content[tableName]];
      newTable.splice(index, 1);
      return { ...prev, content: { ...prev.content, [tableName]: newTable } };
    });
  };

  const updateStageplot = (newItems) => {
    setForm(prev => ({ ...prev, content: { ...prev.content, stageplot: newItems } }));
  };

  // --- LÓGICA DE TABLAS DINÁMICAS PARA CATERING ---
  const addCateringTable = (title) => {
    const newTable = {
      id: Date.now().toString() + Math.random().toString().slice(2,8),
      title: title,
      columns: ['CANT', 'ITEM', 'OBSERVACIONES'],
      rows: [['', '', '']]
    };
    setForm(prev => ({
      ...prev, content: { ...prev.content, catering: { ...prev.content.catering, tables: [...(prev.content.catering.tables || []), newTable] } }
    }));
  };

  const updateCatTableTitle = (tIndex, title) => {
    setForm(prev => {
      const newTables = [...(prev.content.catering.tables || [])];
      newTables[tIndex].title = title;
      return { ...prev, content: { ...prev.content, catering: { ...prev.content.catering, tables: newTables } } };
    });
  };

  const addCatColumn = (tIndex) => {
    setForm(prev => {
      const newTables = JSON.parse(JSON.stringify(prev.content.catering.tables || []));
      newTables[tIndex].columns.push('NUEVA COL');
      newTables[tIndex].rows = newTables[tIndex].rows.map(r => [...r, '']);
      return { ...prev, content: { ...prev.content, catering: { ...prev.content.catering, tables: newTables } } };
    });
  };

  const removeCatColumn = (tIndex, cIndex) => {
    setForm(prev => {
      const newTables = JSON.parse(JSON.stringify(prev.content.catering.tables || []));
      newTables[tIndex].columns.splice(cIndex, 1);
      newTables[tIndex].rows.forEach(r => r.splice(cIndex, 1));
      return { ...prev, content: { ...prev.content, catering: { ...prev.content.catering, tables: newTables } } };
    });
  };

  const updateCatColumnName = (tIndex, cIndex, value) => {
    setForm(prev => {
      const newTables = JSON.parse(JSON.stringify(prev.content.catering.tables || []));
      newTables[tIndex].columns[cIndex] = value;
      return { ...prev, content: { ...prev.content, catering: { ...prev.content.catering, tables: newTables } } };
    });
  };

  const addCatRow = (tIndex) => {
    setForm(prev => {
      const newTables = JSON.parse(JSON.stringify(prev.content.catering.tables || []));
      const emptyRow = new Array(newTables[tIndex].columns.length).fill('');
      newTables[tIndex].rows.push(emptyRow);
      return { ...prev, content: { ...prev.content, catering: { ...prev.content.catering, tables: newTables } } };
    });
  };

  const removeCatRow = (tIndex, rIndex) => {
    setForm(prev => {
      const newTables = JSON.parse(JSON.stringify(prev.content.catering.tables || []));
      newTables[tIndex].rows.splice(rIndex, 1);
      return { ...prev, content: { ...prev.content, catering: { ...prev.content.catering, tables: newTables } } };
    });
  };

  const updateCatCell = (tIndex, rIndex, cIndex, value) => {
    setForm(prev => {
      const newTables = JSON.parse(JSON.stringify(prev.content.catering.tables || []));
      newTables[tIndex].rows[rIndex][cIndex] = value;
      return { ...prev, content: { ...prev.content, catering: { ...prev.content.catering, tables: newTables } } };
    });
  };

  const removeCatTable = (tIndex) => {
    setForm(prev => {
      const newTables = [...(prev.content.catering.tables || [])];
      newTables.splice(tIndex, 1);
      return { ...prev, content: { ...prev.content, catering: { ...prev.content.catering, tables: newTables } } };
    });
  };

  const icons = { 'SONIDO': Mic2, 'ILUMINACIÓN': Lightbulb, 'STAGEPLOT': MapIcon, 'HOSPITALITY': Utensils, 'COMPLETO': FileText };

  const getTabsForType = (type) => {
    switch(type) {
      case 'SONIDO': return ['GENERAL', 'AUDIO', 'BACKLINE', 'STAGEPLOT'];
      case 'ILUMINACIÓN': return ['GENERAL', 'VISUALES', 'STAGEPLOT'];
      case 'STAGEPLOT': return ['GENERAL', 'BACKLINE', 'STAGEPLOT'];
      case 'HOSPITALITY': return ['GENERAL', 'CATERING'];
      default: return ['GENERAL', 'AUDIO', 'BACKLINE', 'VISUALES', 'STAGEPLOT', 'CATERING'];
    }
  };
  
  const activeTabs = getTabsForType(form.type);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setForm({...form, type: newType});
    if (!getTabsForType(newType).includes(editTab)) {
      setEditTab('GENERAL');
    }
  };

  const getProjectName = (pId) => {
     const p = proyectos.find(proj => String(proj.id) === String(pId));
     return p ? p.name : 'Documento General';
  };

  const getRiderHitos = () => {
    const targetRider = (viewMode === 'EDIT' && isPreview) ? form : activeRider;
    if (!targetRider || !targetRider.content.proyectoId) return [];
    return allHitos
      .filter(h => String(h.proyectoId) === String(targetRider.content.proyectoId))
      .map(ev => {
        let fullDate = new Date(0); 
        let timeFmt = '--:--';
        try {
           let dStr = typeof ev.date === 'string' ? ev.date.split('T')[0] : new Date(ev.date).toISOString().split('T')[0];
           let tRaw = String(ev.time);
           let tStr = tRaw.includes('T') ? tRaw.split('T')[1].substring(0,5) : tRaw.substring(0,5);
           timeFmt = tStr;
           const dateObj = new Date(`${dStr}T${tStr}:00`);
           if(!isNaN(dateObj.getTime())) fullDate = dateObj;
        } catch(e) {}
        return { ...ev, fullDate, timeFmt };
      })
      .sort((a,b) => a.fullDate - b.fullDate);
  };
  
  const riderHitos = getRiderHitos();
  const displayRider = (viewMode === 'EDIT' && isPreview) ? form : activeRider;

  return (
    <div className="space-y-4 animate-fade-in pb-24 max-w-5xl mx-auto print:m-0 print:p-0 print:w-full print:max-w-none">
      
      {/* HEADER PRINCIPAL */}
      <header className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 print:hidden">
        <div>
           {viewMode !== 'LIST' && !isPreview && (
             <button onClick={() => { setViewMode('LIST'); setActiveRider(null); }} className="flex items-center gap-1.5 text-xs md:text-sm text-slate-400 hover:text-white transition-colors mb-2"><ChevronLeft size={16}/> Volver a Documentos</button>
           )}
           <h1 className="text-2xl font-black text-white flex items-center gap-2">
             <FileText className="text-emerald-500" size={24}/> 
             {viewMode === 'EDIT' && !isPreview ? 'Editor de Documento' : viewMode === 'EDIT' && isPreview ? 'Vista Previa de Documento' : 'Documentos Técnicos'}
           </h1>
           <p className="text-xs md:text-sm text-slate-400 mt-1">Especificaciones Oficiales de Producción.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {viewMode === 'LIST' && <Button variant="ghost" icon={RefreshCw} onClick={() => fetchData(true)} className="px-2 border border-slate-700 hover:text-emerald-400 mr-1" title="Actualizar Documentos" />}
          {(viewMode === 'DETAIL' || isPreview) && riderHitos.length > 0 && (
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer print:hidden mr-2">
              <input type="checkbox" checked={includeTiming} onChange={e => setIncludeTiming(e.target.checked)} className="accent-emerald-500 rounded bg-slate-900 border-slate-700"/>
              <span>Incluir Timing en PDF</span>
            </label>
          )}
          {(viewMode === 'DETAIL' || isPreview) && <Button icon={Printer} variant="secondary" onClick={handlePrint} className="flex-1 sm:flex-none" title="Imprimir o Descargar en PDF">Imprimir PDF</Button>}
          {viewMode === 'DETAIL' && canManageRiders && <Button icon={Edit3} onClick={() => openEditor(activeRider)} className="flex-1 sm:flex-none">Editar</Button>}
          {viewMode === 'LIST' && canManageRiders && <Button icon={Plus} onClick={() => openEditor(null)} className="flex-1 sm:flex-none">Nuevo Documento</Button>}
        </div>
      </header>

      {/* --- VISTA: EDITOR --- */}
      {viewMode === 'EDIT' && !isPreview && (
        <Card className="p-0 border-emerald-500 flex flex-col">
          <div className="p-3 md:p-4 border-b border-slate-700 bg-slate-900 shrink-0">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base md:text-lg font-bold text-white">{form.id ? 'Editar Documento' : 'Generar Nuevo Documento'}</h2>
              <Button variant="ghost" className="text-[10px] py-1 px-2 border border-slate-700" icon={RefreshCw} onClick={() => requestConfirm('¿Restaurar plantilla? Se borrarán los datos no guardados.', restoreDefaults)}>Restaurar</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Título del Documento</label><input required className="w-full bg-slate-800 border-slate-700 rounded p-2 text-xs md:text-sm text-white outline-none focus:border-emerald-500" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} /></div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Área / Tipo</label>
                <select className="w-full bg-slate-800 border-slate-700 rounded p-2 text-xs md:text-sm text-white font-bold outline-none focus:border-emerald-500 max-w-full break-words" value={form.type} onChange={handleTypeChange}>
                  <option value="COMPLETO">RIDER COMPLETO</option>
                  <option value="SONIDO">SONIDO</option>
                  <option value="ILUMINACIÓN">ILUMINACIÓN</option>
                  <option value="STAGEPLOT">STAGEPLOT / BACKLINE</option>
                  <option value="HOSPITALITY">HOSPITALITY / CATERING</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Vincular a Gira / Proyecto</label>
                <select className="w-full bg-slate-800 border-slate-700 rounded p-2 text-xs md:text-sm text-white font-bold outline-none focus:border-emerald-500 max-w-full break-words" value={form.content.proyectoId || ''} onChange={e=>setForm({...form, content: {...form.content, proyectoId: e.target.value}})}>
                  <option value="">Documento General (Sin Asignar)</option>
                  {(canManageProjects ? proyectos : proyectos.filter(p => p.asignados.includes(currentUser.email))).map(p => <option key={p.id} value={p.id}>🎤 {p.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex overflow-x-auto bg-slate-900 border-b border-slate-700 shrink-0 hide-scrollbar">
            {activeTabs.map(tab => (
              <button key={tab} type="button" onClick={() => setEditTab(tab)} className={`px-4 md:px-6 py-2 md:py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${editTab === tab ? 'border-emerald-500 text-emerald-400 bg-slate-800' : 'border-transparent text-slate-400 hover:text-white'}`}>{tab}</button>
            ))}
          </div>

          <div className="p-3 md:p-6 bg-slate-950 relative">
            {editTab === 'GENERAL' && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-1.5"><label className="text-xs md:text-sm font-bold text-white block">Sección IMPORTANTE</label><Button variant="ghost" className="py-0.5 px-2 text-[10px]" icon={FileText} onClick={() => setForm(prev => ({...prev, content: {...prev.content, importante: templatesTexto.importante}}))}>Usar Plantilla</Button></div>
                  <AutoResizeTextarea className="w-full bg-slate-900 border border-slate-700 rounded p-2 md:p-3 text-emerald-400 font-mono text-xs md:text-sm min-h-[60px] focus:border-emerald-500 outline-none" value={form.content.importante} onChange={e=>setForm({...form, content: {...form.content, importante: e.target.value}})} placeholder="Información crucial..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                  <div className="p-3 md:p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5">
                    <h4 className="font-bold text-white text-xs md:text-sm mb-1.5">Contacto Management</h4>
                    <div><label className="text-[10px] text-slate-400 uppercase">Nombre y Apellidos</label><input className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs md:text-sm outline-none focus:border-emerald-500" value={form.content.contacto.mgmtNombre || ''} onChange={e=>setForm({...form, content: {...form.content, contacto: {...form.content.contacto, mgmtNombre: e.target.value}}})} placeholder="Ej: Juan Pérez" /></div>
                    <div><label className="text-[10px] text-slate-400 uppercase">Celular</label><input className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs md:text-sm outline-none focus:border-emerald-500" value={form.content.contacto.mgmtCel} onChange={e=>setForm({...form, content: {...form.content, contacto: {...form.content.contacto, mgmtCel: e.target.value}}})} placeholder="+569..." /></div>
                    <div><label className="text-[10px] text-slate-400 uppercase">Correo</label><input className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs md:text-sm outline-none focus:border-emerald-500" value={form.content.contacto.mgmtCorreo} onChange={e=>setForm({...form, content: {...form.content, contacto: {...form.content.contacto, mgmtCorreo: e.target.value}}})} /></div>
                  </div>
                  <div className="p-3 md:p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5">
                    <h4 className="font-bold text-white text-xs md:text-sm mb-1.5">Contacto Producción</h4>
                    <div><label className="text-[10px] text-slate-400 uppercase">Nombre y Apellidos</label><input className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs md:text-sm outline-none focus:border-emerald-500" value={form.content.contacto.prodNombre || ''} onChange={e=>setForm({...form, content: {...form.content, contacto: {...form.content.contacto, prodNombre: e.target.value}}})} placeholder="Ej: Ana Rojas" /></div>
                    <div><label className="text-[10px] text-slate-400 uppercase">Celular</label><input className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs md:text-sm outline-none focus:border-emerald-500" value={form.content.contacto.prodCel} onChange={e=>setForm({...form, content: {...form.content, contacto: {...form.content.contacto, prodCel: e.target.value}}})} placeholder="+569..."/></div>
                    <div><label className="text-[10px] text-slate-400 uppercase">Correo</label><input className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs md:text-sm outline-none focus:border-emerald-500" value={form.content.contacto.prodCorreo} onChange={e=>setForm({...form, content: {...form.content, contacto: {...form.content.contacto, prodCorreo: e.target.value}}})} /></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1.5"><label className="text-xs md:text-sm font-bold text-white block">Requerimientos de SoundCheck</label><Button variant="ghost" className="py-0.5 px-2 text-[10px]" icon={FileText} onClick={() => setForm(prev => ({...prev, content: {...prev.content, soundcheck: templatesTexto.soundcheck}}))}>Usar Plantilla</Button></div>
                  <AutoResizeTextarea className="w-full bg-slate-900 border border-slate-700 rounded p-2 md:p-3 text-emerald-400 font-mono text-xs md:text-sm min-h-[60px] outline-none focus:border-emerald-500" value={form.content.soundcheck} onChange={e=>setForm({...form, content: {...form.content, soundcheck: e.target.value}})} />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1.5"><label className="text-xs md:text-sm font-bold text-white block">Recordatorio Oficial</label><Button variant="ghost" className="py-0.5 px-2 text-[10px]" icon={FileText} onClick={() => setForm(prev => ({...prev, content: {...prev.content, recordatorio: templatesTexto.recordatorio}}))}>Usar Plantilla</Button></div>
                  <AutoResizeTextarea className="w-full bg-slate-900 border border-slate-700 rounded p-2 md:p-3 text-red-400 font-mono text-xs md:text-sm min-h-[60px] outline-none focus:border-red-500" value={form.content.recordatorio} onChange={e=>setForm({...form, content: {...form.content, recordatorio: e.target.value}})} />
                </div>
              </div>
            )}

            {editTab === 'AUDIO' && activeTabs.includes('AUDIO') && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2"><h3 className="text-xs md:text-sm font-bold text-emerald-500">OUTPUT / MONITOR ({form.content.outputs.length}/100)</h3><Button variant="secondary" className="py-1 px-2.5 text-[10px]" icon={Plus} onClick={() => addRow('outputs', { mix: String(form.content.outputs.length + 1), player: '', monitor: '', obs: '' })}>Fila</Button></div>
                  <div className="overflow-x-auto rounded border border-slate-700 bg-slate-900">
                    <table className="w-full text-left text-xs md:text-sm text-slate-300 min-w-[500px]"><thead className="bg-slate-800 text-[10px] md:text-xs border-b border-slate-700"><tr><th className="p-1.5 md:p-2 w-16">MIX</th><th className="p-1.5 md:p-2">PLAYER</th><th className="p-1.5 md:p-2">MONITOR</th><th className="p-1.5 md:p-2">OBS</th><th className="p-1.5 md:p-2 w-10 text-center">X</th></tr></thead><tbody>{form.content.outputs.map((row, i) => (<tr key={i} className="border-b border-slate-800 last:border-0"><td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.mix} onChange={e=>updateTable('outputs', i, 'mix', e.target.value)} /></td><td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.player} onChange={e=>updateTable('outputs', i, 'player', e.target.value)} /></td><td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.monitor} onChange={e=>updateTable('outputs', i, 'monitor', e.target.value)} /></td><td className="p-1"><AutoResizeTextarea className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.obs} onChange={e=>updateTable('outputs', i, 'obs', e.target.value)} /></td><td className="p-1 text-center"><button type="button" onClick={()=>removeRow('outputs', i)} className="text-red-500 p-1 hover:bg-red-500/20 rounded"><Trash2 size={12}/></button></td></tr>))}</tbody></table>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2"><h3 className="text-xs md:text-sm font-bold text-emerald-500">INPUT LIST ({form.content.inputs.length}/100)</h3><Button variant="secondary" className="py-1 px-2.5 text-[10px]" icon={Plus} onClick={() => addRow('inputs', { ch: String(form.content.inputs.length + 1), name: '', mic: '', v48: '', stand: '', position: '', obs: '' })}>Fila</Button></div>
                  <div className="overflow-x-auto rounded border border-slate-700 bg-slate-900">
                    <table className="w-full text-left text-xs md:text-sm text-slate-300 min-w-[700px]"><thead className="bg-slate-800 text-[10px] md:text-xs border-b border-slate-700"><tr><th className="p-1.5 md:p-2 w-12">CH</th><th className="p-1.5 md:p-2">NAME</th><th className="p-1.5 md:p-2">MIC/DI</th><th className="p-1.5 md:p-2 w-16">48v</th><th className="p-1.5 md:p-2">STAND</th><th className="p-1.5 md:p-2">POSITION</th><th className="p-1.5 md:p-2">OBS</th><th className="p-1.5 md:p-2 w-10 text-center">X</th></tr></thead><tbody>{form.content.inputs.map((row, i) => (<tr key={i} className="border-b border-slate-800 last:border-0"><td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 text-center outline-none focus:border-emerald-500 text-xs" value={row.ch} onChange={e=>updateTable('inputs', i, 'ch', e.target.value)} /></td><td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.name} onChange={e=>updateTable('inputs', i, 'name', e.target.value)} /></td><td className="p-1"><MicDiSelect value={row.mic} onChange={val=>updateTable('inputs', i, 'mic', val)} /></td><td className="p-1"><select className="w-full bg-transparent border border-slate-700 rounded p-1 text-center outline-none focus:border-emerald-500 text-xs" value={row.v48} onChange={e=>updateTable('inputs', i, 'v48', e.target.value)}><option value=""></option><option value="SI">SI</option><option value="NO">NO</option></select></td><td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.stand} onChange={e=>updateTable('inputs', i, 'stand', e.target.value)} /></td><td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.position} onChange={e=>updateTable('inputs', i, 'position', e.target.value)} /></td><td className="p-1"><AutoResizeTextarea className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.obs} onChange={e=>updateTable('inputs', i, 'obs', e.target.value)} /></td><td className="p-1 text-center"><button type="button" onClick={()=>removeRow('inputs', i)} className="text-red-500 p-1 hover:bg-red-500/20 rounded"><Trash2 size={12}/></button></td></tr>))}</tbody></table>
                  </div>
                </div>
              </div>
            )}

            {editTab === 'BACKLINE' && activeTabs.includes('BACKLINE') && (
              <div>
                <div className="flex justify-between items-end mb-2"><h3 className="text-xs md:text-sm font-bold text-emerald-500">BACKLINE ({form.content.backline.length}/100)</h3><Button variant="secondary" className="py-1 px-2.5 text-[10px]" icon={Plus} onClick={() => addRow('backline', { col1: '', col2: '', col3: '', col4: '' })}>Fila</Button></div>
                <div className="overflow-x-auto rounded border border-slate-700 bg-slate-900">
                  <table className="w-full text-left text-xs md:text-sm text-slate-300 min-w-[500px]">
                    <thead className="bg-slate-800 text-[10px] md:text-xs border-b border-slate-700">
                      <tr>
                        <th className="p-1.5 md:p-2 w-16">CANT</th>
                        <th className="p-1.5 md:p-2">ITEM</th>
                        <th className="p-1.5 md:p-2">ESPECIFICACIONES</th>
                        <th className="p-1.5 md:p-2">OBS</th>
                        <th className="p-1.5 md:p-2 w-10 text-center">X</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.content.backline.map((row, i) => (
                        <tr key={i} className="border-b border-slate-800 last:border-0">
                          <td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 text-center outline-none focus:border-emerald-500 text-xs" value={row.col2} onChange={e=>updateTable('backline', i, 'col2', e.target.value)} /></td>
                          <td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.col1} onChange={e=>updateTable('backline', i, 'col1', e.target.value)} /></td>
                          <td className="p-1"><AutoResizeTextarea className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.col3} onChange={e=>updateTable('backline', i, 'col3', e.target.value)} /></td>
                          <td className="p-1"><AutoResizeTextarea className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.col4} onChange={e=>updateTable('backline', i, 'col4', e.target.value)} /></td>
                          <td className="p-1 text-center"><button type="button" onClick={()=>removeRow('backline', i)} className="text-red-500 p-1 hover:bg-red-500/20 rounded"><Trash2 size={12}/></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {editTab === 'VISUALES' && activeTabs.includes('VISUALES') && (
              <div>
                <div className="flex justify-between items-end mb-2"><h3 className="text-xs md:text-sm font-bold text-emerald-500">VISUAL / LIGHTS ({form.content.visuals.length}/100)</h3><Button variant="secondary" className="py-1 px-2.5 text-[10px]" icon={Plus} onClick={() => addRow('visuals', { col1: '', col2: '', col3: '', col4: '' })}>Fila</Button></div>
                <div className="overflow-x-auto rounded border border-slate-700 bg-slate-900">
                  <table className="w-full text-left text-xs md:text-sm text-slate-300 min-w-[500px]">
                    <thead className="bg-slate-800 text-[10px] md:text-xs border-b border-slate-700">
                      <tr>
                        <th className="p-1.5 md:p-2 w-16">CANT</th>
                        <th className="p-1.5 md:p-2">SISTEMA/EQUIPO</th>
                        <th className="p-1.5 md:p-2">UBICACIÓN</th>
                        <th className="p-1.5 md:p-2">OBS</th>
                        <th className="p-1.5 md:p-2 w-10 text-center">X</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.content.visuals.map((row, i) => (
                        <tr key={i} className="border-b border-slate-800 last:border-0">
                          <td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 text-center outline-none focus:border-emerald-500 text-xs" value={row.col2} onChange={e=>updateTable('visuals', i, 'col2', e.target.value)} /></td>
                          <td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.col1} onChange={e=>updateTable('visuals', i, 'col1', e.target.value)} /></td>
                          <td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.col3} onChange={e=>updateTable('visuals', i, 'col3', e.target.value)} /></td>
                          <td className="p-1"><AutoResizeTextarea className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.col4} onChange={e=>updateTable('visuals', i, 'col4', e.target.value)} /></td>
                          <td className="p-1 text-center"><button type="button" onClick={()=>removeRow('visuals', i)} className="text-red-500 p-1 hover:bg-red-500/20 rounded"><Trash2 size={12}/></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {editTab === 'STAGEPLOT' && activeTabs.includes('STAGEPLOT') && (
              <div className="h-full min-h-[400px]">
                 <StageplotBuilder 
                   items={form.content.stageplot || []} 
                   onChange={updateStageplot} 
                   config={form.content.stageplotConfig || { width: 10, depth: 8 }}
                   onConfigChange={(newCfg) => setForm(prev => ({...prev, content: {...prev.content, stageplotConfig: newCfg}}))}
                   projectName={form.title}
                 />
              </div>
            )}

            {editTab === 'CATERING' && activeTabs.includes('CATERING') && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs md:text-sm font-bold text-emerald-500">HOSPITALITY & CATERING</h3>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={form.content.catering.showSizes} onChange={e => setForm({...form, content: {...form.content, catering: {...form.content.catering, showSizes: e.target.checked}}})} className="accent-emerald-500 rounded bg-slate-900 border-slate-700"/>
                    <span>Incluir Tallaje (Merch/Uniformes)</span>
                  </label>
                </div>
                
                <div>
                  <label className="text-[10px] md:text-xs font-bold text-slate-400 block mb-1 uppercase">Requerimientos Específicos / Camarines</label>
                  <AutoResizeTextarea className="w-full bg-slate-900 border border-slate-700 rounded p-2 md:p-3 text-white text-xs md:text-sm min-h-[60px] outline-none focus:border-emerald-500" value={form.content.catering.notes} onChange={e=>setForm({...form, content: {...form.content, catering: {...form.content.catering, notes: e.target.value}}})} placeholder="Ej: Espejo de cuerpo entero, 12 toallas negras, agua sin gas..." />
                </div>

                <div className="space-y-2 mt-4">
                  <label className="text-[10px] md:text-xs font-bold text-slate-400 block uppercase">Añadir Tablas de Requerimientos y Extras</label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {CATERING_SECTIONS.map(sec => (
                      <Button key={sec} type="button" variant="secondary" onClick={() => addCateringTable(sec)} className="py-1 px-2 text-[10px]" icon={Plus}>{sec}</Button>
                    ))}
                    <div className="flex flex-col gap-1 items-start ml-2">
                      <Button type="button" variant={form.content.catering.showCatEquipo ? 'primary' : 'secondary'} onClick={() => setForm({...form, content: {...form.content, catering: {...form.content.catering, showCatEquipo: !form.content.catering.showCatEquipo}}})} className="py-1.5 px-3 text-[10px]" icon={form.content.catering.showCatEquipo ? X : Plus}>
                        {form.content.catering.showCatEquipo ? 'QUITAR CAT EQUIPO ASIGNADO' : 'AÑADIR CAT EQUIPO ASIGNADO'}
                      </Button>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider pl-1">Información de la sección Mi Perfil</span>
                    </div>
                  </div>
                </div>

                {/* Renderizar Tablas Dinámicas de Catering */}
                {(form.content.catering.tables || []).map((table, tIndex) => (
                  <div key={table.id} className="bg-slate-900 border border-slate-700 rounded-xl p-3 md:p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <input className="font-bold text-emerald-500 bg-transparent border-b border-slate-700 focus:border-emerald-400 outline-none w-full max-w-[200px] md:max-w-[300px] text-xs md:text-sm" value={table.title} onChange={e => updateCatTableTitle(tIndex, e.target.value)} />
                      <button type="button" onClick={() => removeCatTable(tIndex)} className="text-red-500 hover:bg-red-500/20 p-1.5 rounded transition-colors" title="Eliminar Tabla"><Trash2 size={14}/></button>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar pb-2">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead>
                          <tr>
                            {table.columns.map((col, cIndex) => (
                              <th key={cIndex} className="p-1 min-w-[100px]">
                                <div className="flex items-center gap-1">
                                  <input className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-[9px] md:text-[10px] font-bold outline-none focus:border-emerald-500 uppercase" value={col} onChange={e => updateCatColumnName(tIndex, cIndex, e.target.value)} />
                                  {table.columns.length > 1 && <button type="button" onClick={() => removeCatColumn(tIndex, cIndex)} className="text-slate-500 hover:text-red-500"><X size={12}/></button>}
                                </div>
                              </th>
                            ))}
                            <th className="p-1 w-8"><button type="button" onClick={() => addCatColumn(tIndex)} className="text-emerald-500 hover:bg-emerald-500/20 p-1 rounded" title="Añadir Columna"><Plus size={14}/></button></th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows.map((row, rIndex) => (
                            <tr key={rIndex} className="border-t border-slate-800">
                              {row.map((cell, cIndex) => (
                                <td key={cIndex} className="p-1">
                                  <AutoResizeTextarea className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={cell} onChange={e => updateCatCell(tIndex, rIndex, cIndex, e.target.value)} />
                                </td>
                              ))}
                              <td className="p-1 text-center">
                                <button type="button" onClick={() => removeCatRow(tIndex, rIndex)} className="text-red-500 hover:bg-red-500/20 p-1 rounded"><Trash2 size={12}/></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Button variant="ghost" className="mt-2 py-1 px-2 text-[10px]" icon={Plus} onClick={() => addCatRow(tIndex)}>Añadir Fila</Button>
                  </div>
                ))}

                {/* Tabla de Crew y Dietas Automática con botón Toggle */}
                {form.content.catering.showCatEquipo && (() => {
                  if(!form.content.proyectoId) return <div className="p-4 border border-slate-800 border-dashed rounded-xl text-center text-xs text-slate-500 mt-6">⚠️ Vincula este Rider a una Gira/Proyecto en la pestaña GENERAL para cargar automáticamente la lista del Crew y sus dietas.</div>;
                  
                  const selectedProj = proyectos.find(proj => String(proj.id) === String(form.content.proyectoId));
                  if(!selectedProj) return null;
                  
                  const fullDir = [currentUser, ...directory];
                  const assignedCrew = fullDir.filter(u => selectedProj.asignados.includes(u.email));
                  
                  if(assignedCrew.length === 0) return <div className="p-4 border border-slate-800 border-dashed rounded-xl text-center text-xs text-slate-500 mt-6">El proyecto vinculado no tiene personal asignado aún.</div>;

                  const cateringCount = assignedCrew.reduce((acc, user) => {
                    const dieta = user.dieta || 'OMNÍVORA';
                    acc[dieta] = (acc[dieta] || 0) + 1;
                    return acc;
                  }, {});

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6 animate-fade-in">
                      <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-3">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Resumen Dietas</h4>
                        <div className="space-y-1.5">
                          {Object.entries(cateringCount).sort((a,b) => b[1] - a[1]).map(([dieta, count]) => (
                            <div key={dieta} className="flex justify-between items-center bg-slate-800 border border-slate-700 p-2 rounded text-xs">
                              <span className="font-bold text-white">{dieta}</span>
                              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-black">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="lg:col-span-2 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
                         <table className="w-full text-left text-xs md:text-sm text-slate-300">
                            <thead className="bg-slate-800 text-[10px] uppercase text-slate-500 border-b border-slate-700">
                               <tr>
                                  <th className="p-2 pl-3">Nombre</th>
                                  <th className="p-2">Rol</th>
                                  <th className="p-2">Dieta</th>
                                  {form.content.catering.showSizes && <th className="p-2">Talla</th>}
                               </tr>
                            </thead>
                            <tbody>
                               {assignedCrew.map(u => (
                                  <tr key={u.email} className="border-b border-slate-800 last:border-0">
                                     <td className="p-2 pl-3 font-bold text-white">{u.name}</td>
                                     <td className="p-2 text-[10px]">{u.role}</td>
                                     <td className="p-2"><span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/30 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">{u.dieta || 'OMNÍVORA'}</span></td>
                                     {form.content.catering.showSizes && <td className="p-2 text-[10px] font-bold">{u.talla || 'M'}</td>}
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="p-3 md:p-4 border-t border-slate-700 bg-slate-900 shrink-0 flex gap-2">
            <Button variant="secondary" className="flex-1 py-2" onClick={() => { setIsPreview(false); if(!form.id) setViewMode('LIST'); else setViewMode('DETAIL'); }}>Cancelar</Button>
            <Button variant="blue" className="flex-1 py-2" onClick={() => setIsPreview(true)} icon={Maximize}>Vista Previa</Button>
            <Button variant="primary" className="flex-1 py-2" onClick={handleSave} icon={Save}>Guardar Documento</Button>
          </div>
        </Card>
      )}

      {/* --- VISTA: DETALLE DE RIDER Y VISTA PREVIA (PRINT READY) --- */}
      {(viewMode === 'DETAIL' || (viewMode === 'EDIT' && isPreview)) && displayRider && (
         <div className="border-t-4 border-t-emerald-500 bg-slate-900 print:bg-white print:border-t-black print:border print:text-black rounded-xl overflow-hidden page-break-inside-avoid shadow-sm print:shadow-none">
           <div className="p-4 md:p-5 border-b border-slate-800 print:border-black flex justify-between items-center">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-800 print:bg-transparent print:border print:border-black rounded-lg flex justify-center items-center">
                 {React.createElement(icons[displayRider.type] || FileText, { className: "text-emerald-500 print:text-black", size: 18 })}
               </div>
               <div>
                 <h3 className="font-black text-white print:text-black text-lg md:text-xl leading-none">{displayRider.title}</h3>
                 <span className="text-[10px] bg-slate-800 text-emerald-400 print:bg-transparent print:text-black px-2 py-0.5 rounded border border-slate-700 print:border-black font-bold uppercase mt-1.5 inline-block">{displayRider.type}</span>
               </div>
             </div>
             {viewMode === 'EDIT' && isPreview ? (
               <div className="flex gap-2 print:hidden">
                 <Button variant="secondary" className="py-1.5" icon={Edit3} onClick={() => setIsPreview(false)}>Seguir Editando</Button>
                 <Button variant="primary" className="py-1.5" icon={Save} onClick={handleSave}>Guardar</Button>
               </div>
             ) : (
               canManageRiders && (
                 <div className="flex gap-2 print:hidden">
                   <Button variant="danger" className="px-2.5 py-1.5 bg-slate-800" icon={Trash2} onClick={() => requestConfirm("¿Eliminar este Rider permanentemente?", () => handleDelete(displayRider.id))}></Button>
                   <Button variant="secondary" className="py-1.5" icon={Edit3} onClick={() => openEditor(displayRider)}>Editar</Button>
                 </div>
               )
             )}
           </div>
           
           <div className="p-4 md:p-5 space-y-4 md:space-y-6">
             {displayRider.content.importante && (
               <div className="bg-emerald-500/10 border border-emerald-500/20 print:bg-transparent print:border-black p-3 md:p-4 rounded-lg">
                 <h4 className="text-emerald-400 print:text-black text-[10px] md:text-xs font-black mb-1.5 uppercase">Importante</h4>
                 <p className="text-xs md:text-sm text-emerald-100 print:text-black whitespace-pre-wrap">{displayRider.content.importante}</p>
               </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
               {displayRider.content.contacto && (displayRider.content.contacto.mgmtNombre || displayRider.content.contacto.mgmtCel || displayRider.content.contacto.mgmtCorreo) && (
                 <div className="bg-slate-800 print:bg-transparent p-3 md:p-4 rounded-lg border border-slate-700 print:border-black">
                   <h4 className="text-slate-400 print:text-black text-[10px] md:text-xs font-black mb-2 uppercase">Contacto Management</h4>
                   {displayRider.content.contacto.mgmtNombre && <p className="text-xs md:text-sm text-white print:text-black font-bold mb-1">👤 {displayRider.content.contacto.mgmtNombre}</p>}
                   {displayRider.content.contacto.mgmtCel && <p className="text-xs md:text-sm text-white print:text-black">📱 {displayRider.content.contacto.mgmtCel}</p>}
                   {displayRider.content.contacto.mgmtCorreo && <p className="text-xs md:text-sm text-white print:text-black">✉️ {displayRider.content.contacto.mgmtCorreo}</p>}
                 </div>
               )}
               {displayRider.content.contacto && (displayRider.content.contacto.prodNombre || displayRider.content.contacto.prodCel || displayRider.content.contacto.prodCorreo) && (
                 <div className="bg-slate-800 print:bg-transparent p-3 md:p-4 rounded-lg border border-slate-700 print:border-black">
                   <h4 className="text-slate-400 print:text-black text-[10px] md:text-xs font-black mb-2 uppercase">Contacto Producción</h4>
                   {displayRider.content.contacto.prodNombre && <p className="text-xs md:text-sm text-white print:text-black font-bold mb-1">👤 {displayRider.content.contacto.prodNombre}</p>}
                   {displayRider.content.contacto.prodCel && <p className="text-xs md:text-sm text-white print:text-black">📱 {displayRider.content.contacto.prodCel}</p>}
                   {displayRider.content.contacto.prodCorreo && <p className="text-xs md:text-sm text-white print:text-black">✉️ {displayRider.content.contacto.prodCorreo}</p>}
                 </div>
               )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
               {displayRider.content.soundcheck && (
                  <div className="bg-slate-800 print:bg-transparent p-3 md:p-4 rounded-lg border border-slate-700 print:border-black">
                    <h4 className="text-slate-400 print:text-black text-[10px] md:text-xs font-black mb-1.5 uppercase">Requisitos SoundCheck</h4>
                    <p className="text-xs md:text-sm text-slate-300 print:text-black whitespace-pre-wrap">{displayRider.content.soundcheck}</p>
                  </div>
               )}
               {displayRider.content.recordatorio && (
                  <div className="bg-red-500/10 print:bg-transparent p-3 md:p-4 rounded-lg border border-red-500/20 print:border-black">
                    <h4 className="text-red-400 print:text-black text-[10px] md:text-xs font-black mb-1.5 uppercase">Recordatorio</h4>
                    <p className="text-xs md:text-sm text-red-100 print:text-black whitespace-pre-wrap">{displayRider.content.recordatorio}</p>
                  </div>
               )}
             </div>

             {/* Tablas (Renderizadas compactas) */}
             {displayRider.content.inputs && displayRider.content.inputs.length > 0 && displayRider.content.inputs[0].name !== '' && (
               <div className="mt-3 md:mt-4 break-inside-avoid">
                 <h4 className="text-slate-400 print:text-black text-[10px] md:text-xs font-black mb-1.5 uppercase">INPUT LIST</h4>
                 <div className="overflow-x-auto rounded border border-slate-700 print:border-black">
                   <table className="w-full text-left text-xs md:text-sm text-slate-300 print:text-black min-w-[500px]">
                     <thead className="bg-slate-800 print:bg-gray-200 text-[10px] md:text-xs uppercase text-slate-500 print:text-black border-b border-slate-700 print:border-black">
                       <tr><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0 w-8">CH</th><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0">NAME</th><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0">MIC/DI</th><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0 w-10">48v</th><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0">STAND</th><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0">POSITION</th><th className="p-1.5 md:p-2">OBS</th></tr>
                     </thead>
                     <tbody>
                       {displayRider.content.inputs.map((row, i) => row.name && <tr key={i} className="border-b border-slate-800 print:border-black last:border-0"><td className="p-1.5 md:p-2 font-bold border-r border-slate-800 print:border-black">{row.ch}</td><td className="p-1.5 md:p-2 border-r border-slate-800 print:border-black">{row.name}</td><td className="p-1.5 md:p-2 border-r border-slate-800 print:border-black">{row.mic}</td><td className="p-1.5 md:p-2 text-center border-r border-slate-800 print:border-black">{row.v48}</td><td className="p-1.5 md:p-2 border-r border-slate-800 print:border-black">{row.stand}</td><td className="p-1.5 md:p-2 border-r border-slate-800 print:border-black">{row.position}</td><td className="p-1.5 md:p-2 text-[10px] md:text-xs whitespace-pre-wrap">{row.obs}</td></tr>)}
                     </tbody>
                   </table>
                 </div>
               </div>
             )}
             {displayRider.content.outputs && displayRider.content.outputs.length > 0 && displayRider.content.outputs[0].mix !== '' && (
               <div className="mt-3 md:mt-4 break-inside-avoid">
                 <h4 className="text-slate-400 print:text-black text-[10px] md:text-xs font-black mb-1.5 uppercase">OUTPUT / MONITOR LIST</h4>
                 <div className="overflow-x-auto rounded border border-slate-700 print:border-black">
                   <table className="w-full text-left text-xs md:text-sm text-slate-300 print:text-black min-w-[400px]">
                     <thead className="bg-slate-800 print:bg-gray-200 text-[10px] md:text-xs uppercase text-slate-500 print:text-black border-b border-slate-700 print:border-black">
                       <tr><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0 w-12">MIX</th><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0">PLAYER</th><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0">MONITOR</th><th className="p-1.5 md:p-2">OBS</th></tr>
                     </thead>
                     <tbody>
                       {displayRider.content.outputs.map((row, i) => row.mix && <tr key={i} className="border-b border-slate-800 print:border-black last:border-0"><td className="p-1.5 md:p-2 font-bold border-r border-slate-800 print:border-black">{row.mix}</td><td className="p-1.5 md:p-2 border-r border-slate-800 print:border-black">{row.player}</td><td className="p-1.5 md:p-2 border-r border-slate-800 print:border-black">{row.monitor}</td><td className="p-1.5 md:p-2 text-[10px] md:text-xs whitespace-pre-wrap">{row.obs}</td></tr>)}
                     </tbody>
                   </table>
                 </div>
               </div>
             )}
             {displayRider.content.backline && displayRider.content.backline.length > 0 && displayRider.content.backline[0].col1 !== '' && (
               <div className="mt-3 md:mt-4 break-inside-avoid">
                 <h4 className="text-slate-400 print:text-black text-[10px] md:text-xs font-black mb-1.5 uppercase">BACKLINE</h4>
                 <div className="overflow-x-auto rounded border border-slate-700 print:border-black">
                   <table className="w-full text-left text-xs md:text-sm text-slate-300 print:text-black min-w-[400px]">
                     <thead className="bg-slate-800 print:bg-gray-200 text-[10px] md:text-xs uppercase text-slate-500 print:text-black border-b border-slate-700 print:border-black">
                       <tr><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0 w-12">CANT</th><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0">ITEM</th><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0">ESPECIFICACIONES</th><th className="p-1.5 md:p-2">OBS</th></tr>
                     </thead>
                     <tbody>
                       {displayRider.content.backline.map((row, i) => row.col1 && (
                         <tr key={i} className="border-b border-slate-800 print:border-black last:border-0">
                           <td className="p-1.5 md:p-2 text-center font-bold border-r border-slate-800 print:border-black">{row.col2}</td>
                           <td className="p-1.5 md:p-2 font-bold border-r border-slate-800 print:border-black">{row.col1}</td>
                           <td className="p-1.5 md:p-2 border-r border-slate-800 print:border-black whitespace-pre-wrap">{row.col3}</td>
                           <td className="p-1.5 md:p-2 text-[10px] md:text-xs whitespace-pre-wrap">{row.col4}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
             )}
             {displayRider.content.visuals && displayRider.content.visuals.length > 0 && displayRider.content.visuals[0].col1 !== '' && (
               <div className="mt-3 md:mt-4 break-inside-avoid">
                 <h4 className="text-slate-400 print:text-black text-[10px] md:text-xs font-black mb-1.5 uppercase">VISUAL / LIGHTS</h4>
                 <div className="overflow-x-auto rounded border border-slate-700 print:border-black">
                   <table className="w-full text-left text-xs md:text-sm text-slate-300 print:text-black min-w-[400px]">
                     <thead className="bg-slate-800 print:bg-gray-200 text-[10px] md:text-xs uppercase text-slate-500 print:text-black border-b border-slate-700 print:border-black">
                       <tr><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0 w-12">CANT</th><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0">SISTEMA/EQUIPO</th><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0">UBICACIÓN</th><th className="p-1.5 md:p-2">OBS</th></tr>
                     </thead>
                     <tbody>
                       {displayRider.content.visuals.map((row, i) => row.col1 && (
                         <tr key={i} className="border-b border-slate-800 print:border-black last:border-0">
                           <td className="p-1.5 md:p-2 text-center font-bold border-r border-slate-800 print:border-black">{row.col2}</td>
                           <td className="p-1.5 md:p-2 font-bold border-r border-slate-800 print:border-black">{row.col1}</td>
                           <td className="p-1.5 md:p-2 border-r border-slate-800 print:border-black">{row.col3}</td>
                           <td className="p-1.5 md:p-2 text-[10px] md:text-xs whitespace-pre-wrap">{row.col4}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
             )}

             {/* Render Stageplot in View Mode */}
             {displayRider.content.stageplot && displayRider.content.stageplot.length > 0 && (
                <div className="mt-3 md:mt-4 break-inside-avoid">
                   <h4 className="text-slate-400 print:text-black text-[10px] md:text-xs font-black mb-1.5 uppercase">
                      STAGEPLOT: {displayRider.title} ({displayRider.content.stageplotConfig?.width || 10}m x {displayRider.content.stageplotConfig?.depth || 8}m)
                   </h4>
                   <div className="w-full rounded border-2 border-slate-700 print:border-black overflow-hidden bg-white">
                      <StageplotBuilder 
                         items={displayRider.content.stageplot} 
                         config={displayRider.content.stageplotConfig || {width: 10, depth: 8}} 
                         onChange={()=>{}} 
                         onConfigChange={()=>{}} 
                         readOnly={true} 
                         projectName={displayRider.title}
                      />
                   </div>
                </div>
             )}

             {/* Render Catering View Mode */}
             {(displayRider.type === 'COMPLETO' || displayRider.type === 'HOSPITALITY') && displayRider.content.catering && (
                <div className="mt-3 md:mt-4 break-inside-avoid">
                   <h4 className="text-slate-400 print:text-black text-[10px] md:text-xs font-black mb-1.5 uppercase">HOSPITALITY & CATERING</h4>
                   {displayRider.content.catering.notes && (
                      <div className="bg-slate-800 print:bg-transparent p-3 md:p-4 rounded-lg border border-slate-700 print:border-black mb-3">
                         <p className="text-xs md:text-sm text-white print:text-black whitespace-pre-wrap">{displayRider.content.catering.notes}</p>
                       </div>
                   )}

                   {/* Render Dynamic Catering Tables */}
                   {(displayRider.content.catering.tables || []).map((table, tIndex) => (
                      <div key={tIndex} className="mt-4 break-inside-avoid">
                         <h4 className="text-slate-400 print:text-black text-[10px] md:text-xs font-black mb-1.5 uppercase">{table.title}</h4>
                         <div className="overflow-x-auto rounded border border-slate-700 print:border-black">
                            <table className="w-full text-left text-xs md:text-sm text-slate-300 print:text-black">
                               <thead className="bg-slate-800 print:bg-gray-200 text-[10px] md:text-xs uppercase text-slate-500 print:text-black border-b border-slate-700 print:border-black">
                                  <tr>
                                     {table.columns.map((col, cIndex) => (
                                        <th key={cIndex} className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0">{col}</th>
                                     ))}
                                  </tr>
                               </thead>
                               <tbody>
                                  {table.rows.map((row, rIndex) => (
                                     <tr key={rIndex} className="border-b border-slate-800 print:border-black last:border-0">
                                        {row.map((cell, cIndex) => (
                                           <td key={cIndex} className="p-1.5 md:p-2 border-r border-slate-800 print:border-black last:border-0 whitespace-pre-wrap">{cell}</td>
                                        ))}
                                     </tr>
                                  ))}
                               </tbody>
                            </table>
                         </div>
                      </div>
                   ))}
                   
                   {displayRider.content.catering.showCatEquipo && (() => {
                      if(!displayRider.content.proyectoId) return null;
                      const selectedProj = proyectos.find(proj => String(proj.id) === String(displayRider.content.proyectoId));
                      if(!selectedProj) return null;
                      const fullDir = [currentUser, ...directory];
                      const assignedCrew = fullDir.filter(u => selectedProj.asignados.includes(u.email));
                      if(assignedCrew.length === 0) return null;

                      const cateringCount = assignedCrew.reduce((acc, user) => {
                        const dieta = user.dieta || 'OMNÍVORA';
                        acc[dieta] = (acc[dieta] || 0) + 1;
                        return acc;
                      }, {});

                      return (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 print:block print:space-y-4 mt-6">
                          <div className="lg:col-span-1 bg-slate-800 print:bg-transparent border border-slate-700 print:border-black rounded-xl p-3 md:p-4">
                            <h4 className="text-[10px] font-bold text-slate-400 print:text-black uppercase tracking-wider mb-2">Resumen Dietas ({assignedCrew.length} Pax)</h4>
                            <div className="space-y-1.5">
                              {Object.entries(cateringCount).sort((a,b) => b[1] - a[1]).map(([dieta, count]) => (
                                <div key={dieta} className="flex justify-between items-center bg-slate-900 print:bg-transparent border border-slate-700 print:border-black p-2 rounded text-xs print:text-black">
                                  <span className="font-bold">{dieta}</span>
                                  <span className="bg-emerald-500/20 text-emerald-400 print:bg-transparent print:text-black px-2 py-0.5 rounded-full font-black">{count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="lg:col-span-2 overflow-x-auto rounded-xl border border-slate-700 print:border-black bg-slate-900 print:bg-transparent">
                             <table className="w-full text-left text-xs md:text-sm text-slate-300 print:text-black">
                                <thead className="bg-slate-800 print:bg-gray-200 text-[10px] uppercase text-slate-500 print:text-black border-b border-slate-700 print:border-black">
                                   <tr>
                                      <th className="p-2 pl-3 border-r border-slate-700 print:border-black last:border-0">Nombre</th>
                                      <th className="p-2 border-r border-slate-700 print:border-black last:border-0">Rol</th>
                                      <th className="p-2 border-r border-slate-700 print:border-black last:border-0">Dieta</th>
                                      {displayRider.content.catering.showSizes && <th className="p-2">Talla</th>}
                                   </tr>
                                </thead>
                                <tbody>
                                   {assignedCrew.map(u => (
                                      <tr key={u.email} className="border-b border-slate-800 print:border-black last:border-0">
                                         <td className="p-2 pl-3 font-bold text-white print:text-black border-r border-slate-800 print:border-black">{u.name}</td>
                                         <td className="p-2 text-[10px] border-r border-slate-800 print:border-black">{u.role}</td>
                                         <td className="p-2 border-r border-slate-800 print:border-black"><span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/30 print:border-none print:text-black px-1.5 py-0.5 rounded font-black uppercase tracking-wider">{u.dieta || 'OMNÍVORA'}</span></td>
                                         {displayRider.content.catering.showSizes && <td className="p-2 text-[10px] font-bold">{u.talla || 'M'}</td>}
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                        </div>
                      );
                   })()}
                </div>
             )}

             {/* Render Timing in View Mode if Selected */}
             {includeTiming && riderHitos.length > 0 && (
                <div className="mt-6 md:mt-8 break-before-page print:break-before-page">
                   <h4 className="text-slate-400 print:text-black text-[10px] md:text-xs font-black mb-3 uppercase border-b border-slate-700 print:border-black pb-2">
                      TIMING / RUN OF SHOW
                   </h4>
                   <div className="space-y-0 border border-slate-700 print:border-black rounded-lg overflow-hidden">
                      {riderHitos.map((h, i) => {
                         const dateStr = String(h.date).split('T')[0].split('-').reverse().join('/');
                         return (
                           <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-b border-slate-700 print:border-black last:border-0 bg-slate-900 print:bg-transparent">
                             <div className="flex items-center gap-3 md:gap-6 mb-2 sm:mb-0">
                               <div className="flex flex-col items-start w-20 shrink-0">
                                 <span className="font-black text-emerald-400 print:text-black text-sm md:text-base">{h.timeFmt}</span>
                                 <span className="text-[9px] text-slate-500 print:text-black">{dateStr}</span>
                               </div>
                               <span className="text-sm md:text-base font-bold text-white print:text-black">{h.title}</span>
                             </div>
                             <div className="text-xs text-slate-400 print:text-black flex items-center gap-1.5 sm:text-right">
                               <MapPin size={14} className="text-emerald-500 print:text-black shrink-0"/> 
                               <span>{h.location}</span>
                             </div>
                           </div>
                         );
                      })}
                   </div>
                </div>
             )}
           </div>
         </div>
      )}

      {/* --- VISTA: LISTA DE RIDERS (GRID) --- */}
      {viewMode === 'LIST' && (
        <>
          {fetchError ? (
            <div className="bg-red-500/10 border border-red-500/50 p-3 md:p-4 rounded-xl text-red-400 flex items-center gap-2 text-sm print:hidden">
              <AlertCircle size={18} /> Error al cargar Riders.
            </div>
          ) : loading && riders.length === 0 ? (
            <div className="flex justify-center p-8 print:hidden"><Loader2 className="animate-spin text-emerald-500" size={28}/></div>
          ) : riders.length === 0 ? (
            <div className="text-center p-8 border border-slate-800 border-dashed rounded-xl text-slate-500 text-sm print:hidden">No hay Riders creados aún.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 print:hidden">
              {riders.map((r) => {
                const IconType = icons[r.type] || FileText;
                return (
                  <Card key={r.id} onClick={() => setActiveRider(r)} className="p-3 md:p-4 group cursor-pointer hover:border-emerald-500 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/20"><IconType className="text-emerald-500" size={20} /></div>
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded block w-fit text-emerald-500 bg-emerald-500/10">{r.type}</span>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-white leading-tight mb-1.5">{r.title}</h3>
                    <p className="text-[10px] md:text-xs text-slate-400 flex items-center gap-1.5">
                      <Link size={12}/> {getProjectName(r.content.proyectoId)}
                    </p>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

    </div>
  );
};

// --- STAFF DIRECTORIO ---
const StaffDirectory = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [localDirectory, setLocalDirectory] = useState([]);

  useEffect(() => {
    const fetchDirectory = async (force = false) => {
      setLoading(true);
      if (!force && CACHE.usuarios) {
         const activeUsers = CACHE.usuarios.filter(u => u.status === 'ACTIVO' && u.email !== currentUser.email);
         const canSeeEveryone = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.APV].includes(currentUser.role);
         setLocalDirectory(canSeeEveryone ? activeUsers : activeUsers.filter(u => u.role === ROLES.TOUR_MANAGER));
         setLoading(false);
         return;
      }
      try {
        const res = await apiFetch('getUsuarios');
        if (res.status === 'success') {
          CACHE.usuarios = res.data;
          const activeUsers = res.data.filter(u => u.status === 'ACTIVO' && u.email !== currentUser.email);
          const canSeeEveryone = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.APV].includes(currentUser.role);
          if (canSeeEveryone) setLocalDirectory(activeUsers);
          else setLocalDirectory(activeUsers.filter(u => u.role === ROLES.TOUR_MANAGER));
        }
      } catch(e) { setFetchError(true); }
      setLoading(false);
    };
    fetchDirectory();
  }, [currentUser]);

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-24 max-w-5xl mx-auto print:m-0 print:p-0 print:w-full">
      <header className="border-b border-slate-800 pb-3 md:pb-4 flex justify-between items-end print:hidden">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2 md:gap-3"><Users className="text-emerald-500" size={24} /> Directorio</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">{[ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role) ? 'Lista del personal activo.' : 'Contactos asignados.'}</p>
        </div>
      </header>

      {fetchError ? (
        <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl text-red-400 flex items-center gap-2 text-sm print:hidden">
          <AlertCircle size={18} /> Error al cargar el directorio.
        </div>
      ) : loading && localDirectory.length === 0 ? ( 
        <div className="flex justify-center p-8 print:hidden"><Loader2 className="animate-spin text-emerald-500" size={28}/></div> 
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 print:hidden">
          {localDirectory.map((user, idx) => (
            <Card key={idx} className="p-3 md:p-4 flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-full bg-slate-700 text-white font-black flex items-center justify-center text-lg shrink-0">{user.name.charAt(0)}</div><div className="flex-1 min-w-0"><h3 className="font-bold text-white text-base md:text-lg truncate">{user.name}</h3><span className="text-[9px] md:text-[10px] bg-slate-900 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700 uppercase font-bold inline-block">{user.role}</span></div></div>
              <div className="space-y-1.5 mb-3 text-xs md:text-sm text-slate-300"><p className="flex items-center gap-2"><Phone size={12} className="text-slate-500 shrink-0"/> <span className="truncate">{user.phone}</span></p><p className="flex items-center gap-2"><Mail size={12} className="text-slate-500 shrink-0"/> <span className="truncate">{user.email}</span></p></div>
              <div className="flex flex-row gap-2 mt-auto border-t border-slate-700 pt-3"><Button variant="ghost" className="flex-1 bg-slate-900 border border-slate-700 py-1.5 text-xs" icon={Mail} onClick={() => openEmail(user.email)}>Correo</Button><Button variant="primary" className="flex-1 py-1.5 text-xs" icon={MessageSquare} onClick={() => openWhatsApp(user.phone)}>WhatsApp</Button></div>
            </Card>
          ))}
          {localDirectory.length === 0 && ( <div className="col-span-full text-center p-8 border border-slate-800 border-dashed rounded-xl text-slate-500 text-sm">No se encontraron contactos.</div> )}
        </div>
      )}
    </div>
  );
};

// --- CHAT GLOBAL (Conectado a la BD) ---
const ChatView = ({ currentUser, showToast }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const canSendMessages = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.APV].includes(currentUser.role);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async (force = false) => {
    if (!force && CACHE.mensajes) {
       setMessages(CACHE.mensajes);
       scrollToBottom();
       setLoading(false);
       return;
    }
    try {
      const res = await apiFetch('getMensajes');
      if (res.status === 'success') {
        CACHE.mensajes = res.data;
        setMessages(res.data);
        scrollToBottom();
      }
    } catch (e) {
      showToast("Error conectando al chat.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !canSendMessages) return;
    
    const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const tempId = Date.now();
    const newMsgObj = { id: tempId, sender: currentUser.name, role: currentUser.role, text: newMsg, time: timeStr, readBy: [] };
    
    setMessages([...messages, newMsgObj]); 
    setNewMsg('');
    setTimeout(scrollToBottom, 100);

    try {
      await apiFetch('sendMensaje', { sender: currentUser.name, role: currentUser.role, text: newMsgObj.text, time: timeStr });
      clearCache('mensajes');
      fetchMessages(true);
    } catch (e) {
      showToast("No se pudo enviar el mensaje.");
    }
  };

  const toggleReadReceipt = async (msgId) => {
    setMessages(messages.map(m => {
      if (m.id === msgId) {
        const hasRead = m.readBy.includes(currentUser.name);
        return { ...m, readBy: hasRead ? m.readBy : [...m.readBy, currentUser.name] };
      }
      return m;
    }));
    try {
      await apiFetch('marcarLeido', { id: msgId, userName: currentUser.name });
      clearCache('mensajes');
    } catch (e) {
      showToast("Error al marcar como leído.");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-4rem)] max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <header className="p-3 md:p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="text-emerald-500" size={20} />
          <div><h2 className="font-black text-white text-base md:text-lg leading-tight">Anuncios de Gira</h2><p className="text-[10px] md:text-xs text-slate-400">Canal oficial</p></div>
        </div>
        <Button variant="ghost" className="text-slate-400 hover:text-emerald-400 p-1.5 md:p-2 border border-slate-700 rounded" onClick={() => { setLoading(true); fetchMessages(true); }} title="Actualizar Chat"><RefreshCw size={14} className={loading ? "animate-spin text-emerald-500" : ""}/></Button>
      </header>

      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 custom-scrollbar">
        {messages.length === 0 && !loading && <div className="text-center text-slate-500 mt-8 text-xs md:text-sm">No hay mensajes.</div>}
        
        {messages.map(msg => {
          const isMe = msg.sender === currentUser.name;
          const hasRead = msg.readBy.includes(currentUser.name);
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-slide-up`}>
              <div className="flex items-baseline gap-1.5 mb-1"><span className="text-[10px] md:text-xs font-bold text-slate-300">{isMe ? 'Tú' : msg.sender}</span><span className="text-[9px] text-emerald-500 uppercase font-black">{msg.role}</span><span className="text-[9px] text-slate-500">{msg.time}</span></div>
              <div className={`p-2.5 md:p-3 rounded-xl max-w-[85%] text-xs md:text-sm shadow-sm ${isMe ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'}`}>{msg.text}</div>
              {!isMe && ( <button onClick={() => toggleReadReceipt(msg.id)} disabled={hasRead} className={`mt-1 flex items-center gap-1 text-[9px] md:text-[10px] font-bold px-1.5 py-1 rounded transition-colors ${hasRead ? 'bg-blue-500/20 text-blue-400 cursor-default' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}><CheckCheck size={10} /> {hasRead ? 'Leído' : 'Marcar Leído'}</button> )}
              {isMe && msg.readBy.length > 0 && ( <span className="text-[9px] md:text-[10px] text-blue-400 mt-1 font-bold flex items-center gap-1"><CheckCheck size={10} /> Visto por {msg.readBy.length} {msg.readBy.length === 1 ? 'persona' : 'personas'}</span> )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {canSendMessages ? (
        <form onSubmit={handleSend} className="p-2 md:p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
          <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Escribe un anuncio..." className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 md:py-2 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"/>
          <Button type="submit" variant="primary" icon={Send} className="px-3 md:px-4 py-1.5 md:py-2 shadow-emerald-900/30"></Button>
        </form>
      ) : (
        <div className="p-2 md:p-3 bg-slate-800 border-t border-slate-700 text-center text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Solo Producción puede enviar mensajes. Utiliza "Marcar Leído".</div>
      )}
    </div>
  );
};

// --- PANEL DE ADMINISTRADOR ---
const AdminPanel = ({ currentUser, showToast, requestConfirm }) => {
  const [dbUsers, setDbUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [activeTab, setActiveTab] = useState('PENDIENTES');
  const [processingId, setProcessingId] = useState(null);
  
  const [invName, setInvName] = useState('');
  const [invEmail, setInvEmail] = useState('');
  const [invPhone, setInvPhone] = useState('+569');
  const [invRole, setInvRole] = useState(ROLES.TECH);
  const [editingUser, setEditingUser] = useState(null);

  const MODULOS = [
    { id: 'DASHBOARD', label: 'Proyectos' },
    { id: 'RIDERS', label: 'Riders' },
    { id: 'TRANSPORT', label: 'Transportes' },
    { id: 'CHAT', label: 'Anuncios' },
    { id: 'STAFF', label: 'Directorio' },
    { id: 'ADMIN_PANEL', label: 'Admin Panel' }
  ];

  const fetchUsers = async (force = false) => {
    setLoading(true); setFetchError(false);
    if (!force && CACHE.usuarios) {
      setDbUsers(CACHE.usuarios.filter(u => u.name));
      setLoading(false);
      return;
    }
    try {
      const res = await apiFetch('getUsuarios');
      if (res.status === 'success') {
         CACHE.usuarios = res.data;
         setDbUsers(res.data.filter(u => u.name));
      }
    } catch(e) { setFetchError(true); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleApprove = async (email) => {
    setProcessingId(email);
    try {
      const res = await apiFetch('aprobarUsuario', { email });
      if (res.status === 'success') { 
        showToast("Usuario aprobado. Correo enviado al usuario."); 
        clearCache('usuarios');
        setDbUsers(prev => prev.map(u => u.email === email ? { ...u, status: 'ACTIVO' } : u));
      } 
      else { showToast("Error: " + res.message); }
    } catch(e) { showToast("Error de conexión al aprobar."); }
    setProcessingId(null);
  };

  const handleReject = async (email) => {
    setProcessingId(email);
    try {
      const res = await apiFetch('rechazarUsuario', { email });
      if (res.status === 'success') { 
        showToast("Solicitud rechazada. Correo enviado."); 
        clearCache('usuarios');
        setDbUsers(prev => prev.filter(u => u.email !== email));
      } 
      else { showToast("Error: " + res.message); }
    } catch(e) { showToast("Error de conexión al rechazar."); }
    setProcessingId(null);
  };

  const handleDeleteUser = async (email) => {
    setProcessingId(email);
    try {
      const res = await apiFetch('eliminarUsuario', { email });
      if (res.status === 'success') { 
        showToast("Usuario eliminado y notificado."); 
        clearCache('usuarios');
        setDbUsers(prev => prev.filter(u => u.email !== email));
      } 
      else { showToast("Error: " + res.message); }
    } catch(e) { showToast("Error de conexión al eliminar."); }
    setProcessingId(null);
  };

  const handleDirectInvite = async (e) => {
    e.preventDefault(); setProcessingId('inviting');
    try {
      const resSolicitud = await apiFetch('solicitarAcceso', { name: invName, email: invEmail, phone: invPhone, role: invRole });
      if(resSolicitud.status === 'success') {
        const resAprob = await apiFetch('aprobarUsuario', { email: invEmail });
        if(resAprob.status === 'success') {
          showToast(`Acceso creado. Credenciales enviadas a ${invEmail}`); setInvName(''); setInvEmail(''); setActiveTab('DIRECTORIO'); 
          clearCache('usuarios');
          fetchUsers(true);
        }
      }
    } catch(e) { showToast("Error al invitar integrante."); }
    setProcessingId(null);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setProcessingId('editing');
    try {
      const res = await apiFetch('updateUserAdmin', editingUser);
      if (res.status === 'success') {
        showToast("Perfil de usuario actualizado."); 
        clearCache('usuarios');
        setDbUsers(prev => prev.map(u => u.email === editingUser.email ? editingUser : u));
        setEditingUser(null);
      } else {
        showToast("Error al guardar: " + res.message);
      }
    } catch(err) {
      showToast("Error de conexión al guardar cambios.");
    }
    setProcessingId(null);
  };

  const pendingUsers = dbUsers.filter(u => u.status === 'PENDING');
  const activeUsers = dbUsers.filter(u => u.status === 'ACTIVO' || u.status === 'INACTIVO');

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 pb-24 animate-fade-in">
      <header className="border-b border-slate-800 pb-3 md:pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2 md:gap-3"><ShieldCheck className="text-emerald-500" size={24} /> Admin Panel</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">Gestión global de accesos, roles y perfiles.</p>
        </div>
        <Button variant="ghost" icon={RefreshCw} onClick={() => fetchUsers(true)} className="px-2 py-1.5 border border-slate-700 hover:text-emerald-400" title="Actualizar Solicitudes" />
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <Button variant={activeTab === 'PENDIENTES' ? 'primary' : 'secondary'} onClick={() => setActiveTab('PENDIENTES')} icon={Bell}>Solicitudes ({pendingUsers.length})</Button>
        <Button variant={activeTab === 'DIRECTORIO' ? 'primary' : 'secondary'} onClick={() => setActiveTab('DIRECTORIO')} icon={Users}>Directorio</Button>
        <Button variant={activeTab === 'INVITAR' ? 'primary' : 'secondary'} onClick={() => setActiveTab('INVITAR')} icon={UserPlus}>Invitar Staff</Button>
      </div>
      
      {fetchError ? (
        <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl text-red-400 flex items-center gap-2 text-sm"><AlertCircle size={18} /> Error al cargar la data.</div>
      ) : loading && dbUsers.length === 0 ? ( 
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500" size={28}/></div> 
      ) : (
        <>
          {activeTab === 'PENDIENTES' && (
            <div className="space-y-3">
              {pendingUsers.length === 0 ? <div className="text-center p-8 border border-slate-800 border-dashed rounded-xl text-slate-500 text-sm">No hay solicitudes pendientes.</div> : pendingUsers.map(u => (
                <Card key={u.email} className="p-4 border-l-4 border-l-amber-500">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                    <div><h3 className="text-base font-bold text-white flex items-center gap-2">{u.name} <span className="bg-amber-500/20 text-amber-400 text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-wider">PENDIENTE</span></h3><p className="text-xs text-slate-400 mt-0.5">{u.email} • {u.phone}</p><p className="text-[10px] text-emerald-400 font-bold mt-1 uppercase">Rol: {u.role}</p></div>
                    <div className="flex flex-row gap-2 shrink-0 mt-2 md:mt-0"><Button variant="danger" icon={X} className="flex-1 py-1.5" disabled={processingId === u.email} onClick={() => requestConfirm("¿Rechazar esta solicitud?", () => handleReject(u.email))}>{processingId === u.email ? '...' : 'Rechazar'}</Button><Button variant="primary" icon={Key} className="flex-1 py-1.5" disabled={processingId === u.email} onClick={() => handleApprove(u.email)}>{processingId === u.email ? '...' : 'Aprobar'}</Button></div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {activeTab === 'DIRECTORIO' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {activeUsers.map(u => (
                <Card key={u.email} className={`p-4 flex flex-col ${u.status === 'INACTIVO' ? 'opacity-50 grayscale' : ''}`}>
                  {editingUser?.email === u.email ? (
                    <form onSubmit={handleEditSave} className="space-y-2 animate-fade-in">
                      <h4 className="text-xs font-bold text-emerald-400 border-b border-slate-700 pb-1.5">Editar a {u.name}</h4>
                      <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-emerald-500" value={editingUser.name} onChange={e=>setEditingUser({...editingUser, name: e.target.value})} />
                      <div className="grid grid-cols-2 gap-2"><input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-emerald-500" value={editingUser.phone} onChange={e=>setEditingUser({...editingUser, phone: e.target.value})} /><select className="w-full max-w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-emerald-500 break-words" value={editingUser.role} onChange={e=>setEditingUser({...editingUser, role: e.target.value})}>{Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                      <select className="w-full max-w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-bold outline-none focus:border-emerald-500 break-words" value={editingUser.status} onChange={e=>setEditingUser({...editingUser, status: e.target.value})}><option value="ACTIVO">ACTIVO</option><option value="INACTIVO">BLOQUEADO</option></select>
                      
                      <div className="pt-2 mt-2 border-t border-slate-700">
                         <h4 className="text-[10px] uppercase text-slate-400 font-bold mb-2">Accesos Permitidos</h4>
                         <div className="grid grid-cols-2 gap-2">
                           {MODULOS.map(mod => (
                             <label key={mod.id} className="flex items-center gap-1.5 text-[10px] text-slate-300 cursor-pointer">
                               <input type="checkbox" checked={editingUser.permisos?.includes(mod.id)} 
                                      onChange={(e) => {
                                        const newPerms = e.target.checked 
                                          ? [...(editingUser.permisos || []), mod.id] 
                                          : (editingUser.permisos || []).filter(p => p !== mod.id);
                                        setEditingUser({...editingUser, permisos: newPerms});
                                      }}
                                      className="accent-emerald-500 rounded bg-slate-800 border-slate-600" />
                               {mod.label}
                             </label>
                           ))}
                         </div>
                      </div>

                      <div className="flex flex-row gap-2 mt-2"><Button variant="ghost" className="flex-1 bg-slate-800 py-1.5" onClick={() => setEditingUser(null)}>Cancelar</Button><Button type="submit" variant="primary" className="flex-1 py-1.5" disabled={processingId === 'editing'}>{processingId === 'editing' ? '...' : 'Guardar'}</Button></div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 text-white font-black flex items-center justify-center text-base shrink-0">{u.name?.charAt(0) || '?'}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white text-base truncate">{u.name}</h3>
                          <span className="text-[9px] bg-slate-900 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700 uppercase font-bold inline-block mt-0.5">{u.role}</span>
                        </div>
                        {u.status === 'INACTIVO' && <span className="text-[9px] text-red-500 font-bold border border-red-500/50 px-1.5 py-0.5 rounded mr-2">BLOCK</span>}
                        <button onClick={() => requestConfirm(`¿Eliminar definitivamente a ${u.name} de la plataforma?`, () => handleDeleteUser(u.email))} disabled={processingId === u.email} className="text-slate-500 hover:text-red-500 transition-colors p-1" title="Eliminar Usuario">
                          {processingId === u.email ? <Loader2 size={18} className="animate-spin" /> : <X size={18} />}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(u.permisos || []).map(p => <span key={p} className="text-[8px] bg-slate-900 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded uppercase">{p}</span>)}
                      </div>
                      <div className="mt-auto pt-3 border-t border-slate-700/50 flex flex-row gap-2">
                        <Button variant="secondary" className="flex-1 py-1.5" icon={Edit3} onClick={() => setEditingUser(u)}>Editar Perfil y Accesos</Button>
                      </div>
                    </>
                  )}
                </Card>
              ))}
            </div>
          )}
          {activeTab === 'INVITAR' && (
            <Card className="max-w-xl mx-auto p-4 md:p-6 border-t-4 border-emerald-500">
              <h2 className="text-lg md:text-xl font-bold text-white mb-3">Crear Acceso Directo</h2>
              <form onSubmit={handleDirectInvite} className="space-y-3">
                <div><label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Nombre Completo</label><input type="text" value={invName} onChange={e=>setInvName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500" required /></div>
                <div className="grid grid-cols-2 gap-2"><div><label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Correo</label><input type="email" value={invEmail} onChange={e=>setInvEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500" required /></div><div><label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Teléfono</label><input type="tel" value={invPhone} onChange={e=>setInvPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500" required /></div></div>
                <div><label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Rol</label><select value={invRole} onChange={e=>setInvRole(e.target.value)} className="w-full max-w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500 break-words">{Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                <Button type="submit" variant="primary" className="w-full py-2.5 md:py-3 text-sm md:text-base mt-2" disabled={processingId === 'inviting'} icon={UserCheck}>{processingId === 'inviting' ? 'Generando...' : 'Crear y Enviar'}</Button>
              </form>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

// --- MI PERFIL ---
const ProfileView = ({ currentUser, setCurrentUser, showToast }) => {
  const [pPhone, setPPhone] = useState(currentUser.phone || '');
  const [pTalla, setPTalla] = useState(currentUser.talla || 'M');
  const [pDieta, setPDieta] = useState(currentUser.dieta || 'OMNÍVORA');
  
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [saving, setSaving] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (newPass && newPass !== confirmPass) return showToast("Las contraseñas no coinciden.");

    setSaving(true);
    try {
      const payload = { email: currentUser.email.trim(), phone: pPhone.trim(), talla: pTalla, dieta: pDieta };
      if (newPass && oldPass) { payload.oldPassword = oldPass.trim(); payload.newPassword = newPass.trim(); }
      const res = await apiFetch('updateProfile', payload);
      if (res.status === 'success') {
        setCurrentUser({ ...currentUser, phone: pPhone.trim(), talla: pTalla, dieta: pDieta });
        setOldPass(''); setNewPass(''); setConfirmPass('');
        showToast(newPass ? "¡Perfil y Contraseña actualizados!" : "¡Perfil actualizado!");
        clearCache('usuarios');
      } else { showToast(res.message); }
    } catch (err) { showToast("Error al guardar."); }
    setSaving(false);
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in pb-24">
      <header className="mb-4 md:mb-6"><h1 className="text-2xl font-black text-white flex items-center gap-2 md:gap-3"><User className="text-emerald-500" size={24}/> Mi Perfil</h1></header>
      <Card className="p-4 md:p-6">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="pb-3 border-b border-slate-700"><label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Nombre</label><input type="text" value={currentUser.name} disabled className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-500 text-sm cursor-not-allowed" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Teléfono</label><input type="text" value={pPhone} onChange={e=>setPPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500" required /></div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Talla (Merch)</label>
              <select value={pTalla} onChange={e=>setPTalla(e.target.value)} className="w-full max-w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500 break-words whitespace-normal">
                <option value="XS">XS - Extra Pequeño</option><option value="S">S - Pequeño</option><option value="M">M - Mediano</option><option value="L">L - Grande</option><option value="XL">XL - Extra Grande</option><option value="XXL">XXL - Doble Extra Grande</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Preferencia Alimentación</label>
            <select value={pDieta} onChange={e=>setPDieta(e.target.value)} className="w-full max-w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500 break-words whitespace-normal">
              <option value="OMNÍVORA">Omnívora (Estándar)</option><option value="VEGETARIANA">Vegetariana</option><option value="VEGANA">Vegana</option><option value="CRUDÍVORA">Crudívora</option><option value="FLEXITARIANA">Flexitariana</option><option value="SIN GLUTEN">Sin Gluten</option><option value="BAJA EN FODMAP">Baja en FODMAP</option><option value="HIPOSÓDICA">Hiposódica</option><option value="DIABÉTICA">Diabética</option><option value="KETO">Keto</option><option value="MEDITERRÁNEA">Mediterránea</option>
            </select>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-2.5 flex gap-2.5 items-start mt-1">
            <Shield size={14} className="text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed font-bold">Datos usados solo para logística de producción.</p>
          </div>
          <div className="pt-3 border-t border-slate-700 mt-3 space-y-2.5">
            <h3 className="text-xs md:text-sm font-bold text-emerald-400 flex items-center gap-1.5"><Key size={14}/> Cambiar Contraseña (Opcional)</h3>
            <input type="password" placeholder="Contraseña Actual" value={oldPass} onChange={e=>setOldPass(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500" />
            <input type="password" placeholder="Nueva Contraseña" value={newPass} onChange={e=>setNewPass(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500" />
            <input type="password" placeholder="Confirmar Contraseña" value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} className={`w-full bg-slate-900 border rounded-lg p-2.5 text-white text-sm outline-none ${confirmPass && newPass !== confirmPass ? 'border-red-500' : 'border-slate-700 focus:border-emerald-500'}`} />
            {confirmPass && newPass !== confirmPass && <p className="text-[10px] text-red-500 font-bold">Las contraseñas no coinciden</p>}
          </div>
          <Button type="submit" variant="primary" className="w-full py-3 mt-4" disabled={saving || (confirmPass && newPass !== confirmPass)}>{saving ? <Loader2 className="animate-spin"/> : 'Guardar Cambios'}</Button>
        </form>
      </Card>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('DASHBOARD');
  const [selectedProject, setSelectedProject] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [directory, setDirectory] = useState([]); 
  const [activeRider, setActiveRider] = useState(null);
  const [showPasswordAlert, setShowPasswordAlert] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, text: '', onConfirm: null });

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const requestConfirm = (text, onConfirmCallback) => {
    setConfirmDialog({ isOpen: true, text, onConfirm: () => {
      onConfirmCallback();
      setConfirmDialog({ isOpen: false, text: '', onConfirm: null });
    }});
  };

  const getMenuOptions = () => {
    if (!currentUser) return [];
    if (currentUser.role === 'CONDUCTOR') return [{ id: 'CONDUCTOR_VIEW', label: 'Mi Ruta', icon: Truck }, { id: 'LOGOUT', label: 'Salir', icon: LogOut }];

    const allOptions = [
      { id: 'DASHBOARD', label: 'Proyectos', icon: Navigation },
      { id: 'RIDERS', label: 'Riders Téc.', icon: FileText },
      { id: 'TRANSPORT', label: 'Transportes', icon: Truck },
      { id: 'CHAT', label: 'Anuncios', icon: MessageSquare },
      { id: 'STAFF', label: 'Directorio', icon: Users },
      { id: 'ADMIN_PANEL', label: 'Admin Panel', icon: ShieldCheck }
    ];
    
    // Filtrar basado en permisos del usuario. Fallback por si es cuenta antigua.
    const perms = currentUser.permisos || [];
    
    // Si no tiene permisos asignados (migración), damos acceso base.
    if (perms.length === 0) {
       const r = currentUser.role;
       if (r === ROLES.ADMIN) return [ ...allOptions, { id: 'PROFILE', label: 'Mi Perfil', icon: User } ];
       return [ allOptions[0], allOptions[1], allOptions[2], allOptions[3], allOptions[4], { id: 'PROFILE', label: 'Mi Perfil', icon: User } ];
    }

    const userOptions = allOptions.filter(opt => perms.includes(opt.id));
    return [ ...userOptions, { id: 'PROFILE', label: 'Mi Perfil', icon: User } ];
  };

  const fetchDirectoryGlobal = async (force = false) => {
    if (!force && CACHE.usuarios) {
       setDirectory(CACHE.usuarios.filter(u => u.status === 'ACTIVO'));
       return;
    }
    try {
      const res = await apiFetch('getUsuarios');
      if (res.status === 'success') {
         CACHE.usuarios = res.data;
         setDirectory(res.data.filter(u => u.status === 'ACTIVO'));
      }
    } catch(e) { console.error("Error fetching global directory", e); }
  };

  useEffect(() => {
    if (currentUser && currentUser.role !== 'CONDUCTOR') {
      fetchDirectoryGlobal();
      if (!localStorage.getItem(`pwd_alert_${currentUser.email}`)) {
        setShowPasswordAlert(true);
        localStorage.setItem(`pwd_alert_${currentUser.email}`, 'true');
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentView !== 'RIDERS') setActiveRider(null);
  }, [currentView]);

  const ConfirmModal = () => {
    if (!confirmDialog.isOpen) return null;
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in print:hidden">
        <Card className="w-full max-w-sm p-4 md:p-6 bg-slate-900 border-red-500/50">
          <div className="flex items-center gap-2 md:gap-3 text-red-500 mb-3 md:mb-4"><AlertCircle size={24} /><h2 className="text-lg md:text-xl font-black text-white">¿Estás seguro?</h2></div>
          <p className="text-xs md:text-sm text-slate-300 mb-4 md:mb-6">{confirmDialog.text}</p>
          <div className="flex gap-2.5"><Button variant="ghost" className="flex-1 bg-slate-800 hover:text-white py-2 md:py-2.5" onClick={() => setConfirmDialog({ isOpen: false, text: '', onConfirm: null })}>Cancelar</Button><Button variant="danger" className="flex-1 bg-red-600 text-white hover:bg-red-500 py-2 md:py-2.5" onClick={confirmDialog.onConfirm}>Confirmar</Button></div>
        </Card>
      </div>
    );
  };

  if (!currentUser) return (
    <>
      {toastMessage && <div className="fixed top-4 right-4 z-[300] bg-emerald-500 text-white px-3 md:px-4 py-2.5 md:py-3 rounded-lg shadow-lg flex items-center gap-2.5 animate-fade-in"><CheckCircle2 size={18} /><span className="font-bold text-xs md:text-sm">{toastMessage}</span></div>}
      <AuthRouter setCurrentUser={setCurrentUser} setCurrentView={setCurrentView} showToast={showToast} />
    </>
  );
  
  if (currentUser.role === 'CONDUCTOR') {
    return (
      <div className="min-h-screen bg-slate-950 font-sans">
        {toastMessage && <div className="fixed top-4 right-4 z-[300] bg-blue-500 text-white px-3 md:px-4 py-2.5 md:py-3 rounded-lg shadow-lg flex items-center gap-2.5 animate-fade-in"><CheckCircle2 size={18} /><span className="font-bold text-xs md:text-sm">{toastMessage}</span></div>}
        <div className="p-3 md:p-4 flex justify-between items-center bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2"><Truck className="text-blue-500" size={20}/><span className="text-white font-bold tracking-widest text-xs md:text-sm">CONDUCTOR</span></div>
          <Button variant="ghost" className="text-red-400 py-1.5 px-3 text-xs md:text-sm" onClick={() => setCurrentUser(null)} icon={LogOut}>Salir</Button>
        </div>
        <ConductorView currentUser={currentUser} showToast={showToast} />
      </div>
    );
  }

  const menuOptions = getMenuOptions();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans print:bg-white print:text-black">
      <ConfirmModal />
      {showPasswordAlert && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in print:hidden">
          <Card className="w-full max-w-sm p-6 bg-slate-900 border-amber-500/50 text-center shadow-2xl">
            <div className="mx-auto w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-4"><Key size={24} /></div>
            <h2 className="text-lg md:text-xl font-black text-white mb-2">¡Aviso de Seguridad!</h2>
            <p className="text-sm text-slate-300 mb-6">Por tu seguridad, te recomendamos ir a la sección "Mi Perfil" y cambiar la contraseña temporal por una personal.</p>
            <Button variant="primary" className="w-full py-2.5" onClick={() => { setShowPasswordAlert(false); setCurrentView('PROFILE'); }}>Ir a Mi Perfil</Button>
            <button onClick={() => setShowPasswordAlert(false)} className="mt-4 text-xs font-bold text-slate-500 hover:text-white transition-colors">Entendido, lo haré más tarde</button>
          </Card>
        </div>
      )}
      {toastMessage && <div className="fixed top-4 right-4 z-[300] bg-emerald-500 text-white px-3 md:px-4 py-2.5 md:py-3 rounded-lg shadow-lg flex items-center gap-2.5 animate-fade-in print:hidden"><CheckCircle2 size={18} /><span className="font-bold text-xs md:text-sm">{toastMessage}</span></div>}

      <aside className="bg-slate-900 border-r border-slate-800 w-64 shrink-0 hidden md:flex flex-col h-screen sticky top-0 print:hidden">
        <div className="p-4 flex items-center gap-2.5 border-b border-slate-800"><Music className="text-emerald-500" size={20} /><h1 className="text-lg font-black text-white tracking-widest">ESQUEMAPPS</h1></div>
        <div className="p-3 flex-1 space-y-1 overflow-y-auto custom-scrollbar">
          {menuOptions.map(opt => (
            <button key={opt.id} onClick={() => setCurrentView(opt.id)} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-bold transition-colors text-left text-sm ${currentView === opt.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'}`}><opt.icon size={18} />{opt.label}</button>
          ))}
        </div>
        <div className="p-3 border-t border-slate-800">
           <div className="flex items-center gap-2.5 mb-3 px-1">
             <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-xs font-black text-emerald-500 border border-emerald-500 shrink-0">{currentUser.name.charAt(0)}</div>
             <div className="flex-1 min-w-0"><p className="text-xs font-bold text-white truncate">{currentUser.name}</p><p className="text-[9px] text-slate-400 uppercase font-bold truncate">{currentUser.role}</p></div>
           </div>
           <Button variant="danger" icon={LogOut} onClick={() => requestConfirm("¿Cerrar sesión?", () => setCurrentUser(null))} className="w-full py-2 bg-transparent border-transparent hover:bg-red-500/10 text-xs">Cerrar Sesión</Button>
        </div>
      </aside>

      <main className="flex-1 relative overflow-y-auto h-screen bg-slate-950 print:bg-white custom-scrollbar print:overflow-visible print:h-auto pb-[70px] md:pb-0">
        <div className="p-3 md:p-6 print:p-0">
          {currentView === 'DASHBOARD' && <Dashboard currentUser={currentUser} setCurrentView={setCurrentView} setSelectedProject={setSelectedProject} showToast={showToast} directory={directory} />}
          {currentView === 'PROJECT_DETAILS' && <ProjectDetailsView currentUser={currentUser} setCurrentView={setCurrentView} selectedProject={selectedProject} showToast={showToast} directory={directory} requestConfirm={requestConfirm} setActiveRider={setActiveRider} />}
          {currentView === 'ADMIN_PANEL' && <AdminPanel currentUser={currentUser} showToast={showToast} requestConfirm={requestConfirm} />}
          {currentView === 'PROFILE' && <ProfileView currentUser={currentUser} setCurrentUser={setCurrentUser} showToast={showToast} />}
          {currentView === 'STAFF' && <StaffDirectory currentUser={currentUser} />}
          {currentView === 'CHAT' && <ChatView currentUser={currentUser} showToast={showToast} />}
          {currentView === 'TRANSPORT' && <TransportView currentUser={currentUser} setCurrentView={setCurrentView} setSelectedProject={setSelectedProject} showToast={showToast} />}
          {currentView === 'TRANSPORT_DETAILS' && <TransportDetailsView currentUser={currentUser} setCurrentView={setCurrentView} selectedProject={selectedProject} showToast={showToast} />}
          {currentView === 'RIDERS' && <RidersView currentUser={currentUser} showToast={showToast} requestConfirm={requestConfirm} activeRider={activeRider} setActiveRider={setActiveRider} directory={directory} />}
        </div>
      </main>
      
      <nav className="md:hidden fixed bottom-0 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex justify-between px-1 pb-safe z-50 overflow-x-auto hide-scrollbar print:hidden">
         {menuOptions.map(opt => (
            <button key={opt.id} onClick={() => setCurrentView(opt.id)} className={`flex flex-col items-center justify-center gap-0.5 p-1.5 min-w-[64px] flex-1 transition-colors ${currentView === opt.id ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}>
              <opt.icon size={18} className="shrink-0" />
              <span className="text-[9px] font-bold truncate w-full text-center">{opt.label}</span>
            </button>
          ))}
      </nav>
    </div>
  );
}