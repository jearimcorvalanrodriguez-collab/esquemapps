import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Calendar, Clock, Users, Bell, MessageSquare, 
  Truck, Music, CheckCircle2, XCircle, LogOut, Plus, 
  Navigation, User, Settings, ShieldCheck, UserPlus, 
  UserCheck, Edit3, X, Key, AlertCircle, Loader2,
  Phone, Mail, CheckCheck, Send, Timer, Hourglass,
  Shield, CalendarPlus, FileText, Mic2, Lightbulb, Map as MapIcon, Save,
  Trash2, FolderPlus, RefreshCw, ChevronLeft, CheckSquare, Square, Printer, Utensils, CalendarDays,
  RotateCw, Maximize, Minimize
} from 'lucide-react';

const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  TOUR_MANAGER: 'TOUR MANAGER',
  TECH: 'TÉCNICO',
  TRASLADO: 'TRASLADO',
  APV: 'APV/CATERING'
};

const ESQUEMAS_MASTER_SECRET = 'Tk9fTWVfSGFja2VlczIwMjYhQCM='; 

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
      {/* PALETA DE CONTROLES (Oculta al imprimir) */}
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

      {/* CANVAS DEL ESCENARIO */}
      <div className="flex-1 bg-slate-800 p-2 md:p-4 rounded-xl border border-slate-700 print:bg-white print:border-none print:p-0 flex items-center justify-center overflow-hidden relative">
        <div 
          id="canvas-bg"
          ref={canvasRef}
          className={`relative w-full max-h-full bg-slate-950 print:bg-white border-2 border-slate-700 print:border-black touch-none shadow-inner`}
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
          {/* Título de Proyecto en el Canvas */}
          {projectName && (
            <div className="absolute top-2 md:top-4 left-3 md:left-5 text-sm md:text-lg font-black text-slate-500 print:text-black uppercase tracking-widest pointer-events-none opacity-50 print:opacity-100 z-0">
              {projectName}
            </div>
          )}

          {/* Rejilla */}
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
                {/* Menú Flotante Inline (No interrumpe el arrastre) */}
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

                {/* Zona Arrastrable y SVG */}
                <div 
                  className={`w-full h-full cursor-move transition-transform ${isSelected ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-950 rounded-sm' : ''} print:ring-0`}
                  style={{ transform: `rotate(${item.rotation}deg)` }}
                  onPointerDown={(e) => handlePointerDown(e, item.id)}
                >
                  {def.render()}
                </div>
                
                {/* Etiqueta */}
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
      const data = await apiFetch('login', { email, password: pass });
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
      const result = await apiFetch('solicitarAcceso', { name: regName, email, phone: regPhone, role: regRole });
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

// --- VISTAS PRINCIPALES ---
const ConductorView = ({ currentUser, showToast }) => {
  const r = currentUser.routeInfo;
  const [status, setStatus] = useState(r.status);
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus) => {
    setLoading(true);
    try {
      await apiFetch('updateTransportStatus', { token: r.token, newStatus });
      setStatus(newStatus); showToast("Ruta actualizada: " + newStatus);
    } catch (e) { showToast("Error de red al actualizar ruta."); }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pt-6 px-4">
      <div className="text-center mb-6"><Truck className="mx-auto text-blue-500 mb-3" size={48} /><h1 className="text-2xl font-black text-white">Panel de Ruta</h1><p className="text-slate-400 text-xs">Token: <span className="text-blue-400 font-mono font-bold">{r.token}</span></p></div>
      <Card className="p-4 md:p-5 border-blue-500/30 text-center space-y-3">
        <h2 className="text-lg font-bold text-white">{r.title}</h2>
        <div className="bg-slate-900 p-3 rounded-lg flex flex-col gap-1.5 text-xs md:text-sm text-slate-300">
           <div className="flex justify-between border-b border-slate-700 pb-1.5"><span>Fecha:</span><span className="font-bold text-white">{r.date}</span></div>
           <div className="flex justify-between border-b border-slate-700 pb-1.5"><span>Hora Pick-Up:</span><span className="font-bold text-blue-400">{r.time}</span></div>
           <div className="flex flex-col text-left pt-1.5"><span className="text-[10px] text-slate-500">Origen</span><span className="font-bold text-white">{r.origin}</span></div>
           <div className="flex flex-col text-left pt-1.5"><span className="text-[10px] text-slate-500">Destino</span><span className="font-bold text-white">{r.dest}</span></div>
        </div>
        <div className="pt-4 space-y-2">
           <Button variant={status === 'LLEGUE' ? 'ghost' : 'blue'} className="w-full py-3" disabled={loading || status !== 'PENDING'} onClick={() => updateStatus('LLEGUE')}>{status === 'LLEGUE' ? '✓ Ya marcaste Llegada' : 'Llegué al Punto (Esperando)'}</Button>
           <Button variant={status === 'EN RUTA' ? 'ghost' : 'primary'} className="w-full py-3 bg-emerald-600" disabled={loading || status === 'EN RUTA' || status === 'FINALIZADO'} onClick={() => updateStatus('EN RUTA')}>{status === 'EN RUTA' ? '✓ Ruta en progreso' : 'Comenzar Ruta'}</Button>
           <Button variant={status === 'FINALIZADO' ? 'ghost' : 'danger'} className="w-full py-3 bg-red-600 text-white" disabled={loading || status === 'FINALIZADO'} onClick={() => updateStatus('FINALIZADO')}>{status === 'FINALIZADO' ? 'Ruta Terminada Oficialmente' : 'Finalizar Ruta (Drop-off)'}</Button>
        </div>
      </Card>
    </div>
  );
};

const TransportView = ({ currentUser, setCurrentView, setSelectedProject, showToast }) => {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const fetchProyectos = async () => {
    setFetchError(false);
    try {
      const res = await apiFetch('getProyectos');
      if (res.status === 'success') {
        const pActivos = res.data.filter(p => p.status === 'ACTIVO');
        setProyectos(pActivos);
      }
      else setFetchError(res.message || "Error al obtener proyectos");
    } catch (e) { setFetchError("No se pudo conectar al servidor."); }
    setLoading(false);
  };

  useEffect(() => { fetchProyectos(); }, []);

  return (
    <div className="space-y-4 animate-fade-in pb-24 max-w-6xl mx-auto">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl md:text-3xl font-black text-white leading-tight flex items-center gap-2 md:gap-3"><Truck className="text-emerald-500" size={28} /> Transportes por Proyecto</h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1.5">Selecciona un proyecto activo para gestionar sus rutas y traslados.</p>
      </header>

      {fetchError ? (
        <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl text-red-400 flex items-center gap-2 text-sm"><AlertCircle size={18} /> {fetchError}</div>
      ) : loading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500" size={28}/></div>
      ) : proyectos.length === 0 ? (
        <div className="text-center p-8 border border-slate-800 border-dashed rounded-xl text-slate-500 text-sm">No hay proyectos activos registrados para el Transporte.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {proyectos.map(proyecto => {
            const projectDate = new Date(Number(proyecto.id));
            const formattedProjectDate = `${String(projectDate.getDate()).padStart(2, '0')}/${String(projectDate.getMonth() + 1).padStart(2, '0')}/${projectDate.getFullYear()}`;

            return (
              <Card 
                key={proyecto.id} 
                onClick={() => { setSelectedProject(proyecto); setCurrentView('TRANSPORT_DETAILS'); }}
                className="group cursor-pointer hover:border-emerald-500 transition-colors p-3 md:p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/20"><Truck className="text-emerald-500" size={20} /></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded block w-fit text-emerald-500 bg-emerald-500/10">{proyecto.status}</span>
                </div>
                
                <h2 className="text-lg font-bold text-white leading-tight mb-1.5">{proyecto.name}</h2>
                <div className="space-y-1 mb-3">
                  <p className="text-xs md:text-sm text-slate-300 flex items-center gap-1.5"><Calendar size={12}/> {formattedProjectDate}</p>
                  <p className="text-xs md:text-sm text-slate-400 flex items-center gap-1.5"><User size={12}/> Liderado por: {proyecto.manager}</p>
                </div>
                
                <div className="border-t border-slate-700 pt-3 mt-3">
                  <Button variant="ghost" className="w-full bg-slate-900 border border-slate-700 hover:text-emerald-400 text-xs py-1.5" icon={Navigation}>
                    Ver Rutas
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
};

const TransportDetailsView = ({ currentUser, setCurrentView, selectedProject, showToast }) => {
  const p = selectedProject;
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', time: '', origin: '', dest: '' });
  const canCreate = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role);

  const fetchTransports = async () => {
    setLoading(true); setFetchError(false);
    try {
      const res = await apiFetch('getTransportes');
      if (res.status === 'success') {
        const projectTransports = res.data.filter(t => String(t.proyectoId) === String(p.id));
        setTransports(projectTransports);
      }
    } catch(e) { setFetchError(true); }
    setLoading(false);
  };
  useEffect(() => { fetchTransports(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form, proyectoId: p.id };
      await apiFetch('createTransporte', payload);
      showToast("Ruta creada. Token generado."); setIsCreating(false); fetchTransports();
    } catch(e) { showToast("Error al crear ruta."); setLoading(false); }
  };

  const captureGPS = (field) => {
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setForm(prev => ({...prev, [field]: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`}));
        showToast("GPS Capturado correctamente");
      }, () => showToast("Error al obtener GPS. Activa los permisos."));
    } else showToast("Tu navegador no soporta GPS.");
  };

  return (
    <div className="space-y-4 animate-fade-in pb-24 max-w-5xl mx-auto">
      <button onClick={() => setCurrentView('TRANSPORT')} className="flex items-center gap-1.5 text-xs md:text-sm text-slate-400 hover:text-white transition-colors mb-2"><ChevronLeft size={16}/> Volver a Proyectos</button>
      
      <header className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700 uppercase font-bold tracking-wider mb-1.5 inline-block">RUTAS PROYECTO</span>
          <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2"><Truck className="text-emerald-500" size={24}/> {p.name}</h1>
        </div>
        {canCreate && !isCreating && <Button icon={Plus} onClick={() => setIsCreating(true)}>Nueva Ruta</Button>}
      </header>

      {isCreating && (
        <Card className="p-4 md:p-5 border-emerald-500 mb-4">
          <h2 className="text-base font-bold text-white mb-3">Crear Nueva Ruta (Generar Token)</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div><label className="text-xs text-slate-400 block mb-1">Título / Vehículo</label><input required className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs md:text-sm text-white outline-none focus:border-emerald-500" placeholder="Ej: Van Equipo Sonido" onChange={e=>setForm({...form, title: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-slate-400 block mb-1">Fecha</label><input required type="date" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs md:text-sm text-white outline-none focus:border-emerald-500" onChange={e=>setForm({...form, date: e.target.value})} /></div>
              <div><label className="text-xs text-slate-400 block mb-1">Hora Pick-up</label><input required type="time" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs md:text-sm text-white outline-none focus:border-emerald-500" onChange={e=>setForm({...form, time: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Origen</label>
                <div className="flex gap-2"><input required className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs md:text-sm text-white outline-none focus:border-emerald-500" value={form.origin} onChange={e=>setForm({...form, origin: e.target.value})} /><Button type="button" variant="secondary" icon={MapPin} onClick={()=>captureGPS('origin')} title="Usar GPS" /></div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Destino</label>
                <div className="flex gap-2"><input required className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs md:text-sm text-white outline-none focus:border-emerald-500" value={form.dest} onChange={e=>setForm({...form, dest: e.target.value})} /><Button type="button" variant="secondary" icon={MapPin} onClick={()=>captureGPS('dest')} title="Usar GPS" /></div>
              </div>
            </div>
            <div className="flex gap-2 pt-2"><Button variant="secondary" className="flex-1" onClick={()=>setIsCreating(false)}>Cancelar</Button><Button type="submit" className="flex-1">Guardar Ruta</Button></div>
          </form>
        </Card>
      )}

      {fetchError ? (
        <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl text-red-400 flex items-center gap-2 text-sm">
          <AlertCircle size={18} /> Error de conexión.
        </div>
      ) : loading && transports.length === 0 ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500" size={28}/></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {transports.map((t, idx) => {
            const statusColors = { 'PENDING': 'bg-slate-700', 'LLEGUE': 'bg-amber-500 animate-pulse', 'EN RUTA': 'bg-blue-500', 'FINALIZADO': 'bg-emerald-600' };
            return (
              <Card key={idx} className="p-3 md:p-4 flex flex-col justify-between border-l-4" style={{borderLeftColor: t.status === 'LLEGUE' ? '#f59e0b' : t.status === 'EN RUTA' ? '#3b82f6' : t.status === 'FINALIZADO' ? '#10b981' : '#334155'}}>
                <div className="flex justify-between items-start mb-3">
                  <div><h3 className="font-bold text-white text-base">{t.title}</h3><p className="text-xs text-slate-400">{t.date} • {t.time}</p></div>
                  <div className={`px-2 py-0.5 rounded text-[10px] font-black text-white ${statusColors[t.status] || 'bg-slate-700'}`}>{t.status}</div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300 mb-3 bg-slate-900 p-2 md:p-2.5 rounded border border-slate-800">
                  <p className="flex items-center gap-1.5"><MapPin size={12} className="text-red-400 shrink-0"/> <span className="truncate">A: {t.origin}</span></p>
                  <p className="flex items-center gap-1.5"><MapPin size={12} className="text-emerald-400 shrink-0"/> <span className="truncate">B: {t.dest}</span></p>
                </div>
                {canCreate && (
                  <div className="border-t border-slate-700 pt-2.5 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Token Conductor: <span className="font-mono text-emerald-400 font-bold text-xs ml-1">{t.token}</span></p>
                  </div>
                )}
              </Card>
            )
          })}
          {transports.length === 0 && <div className="col-span-full text-center p-8 border border-slate-800 border-dashed rounded-xl text-slate-500 text-sm">No hay rutas agendadas en este proyecto.</div>}
        </div>
      )}
    </div>
  );
};

const RidersView = ({ currentUser, showToast, requestConfirm }) => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTab, setEditTab] = useState('GENERAL');
  
  const canManageRiders = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TECH].includes(currentUser.role);

  const defaultContent = {
    importante: '',
    contacto: { mgmtNombre: '', mgmtCel: '', mgmtCorreo: '', prodNombre: '', prodCel: '', prodCorreo: '' },
    soundcheck: '',
    recordatorio: '',
    outputs: [{ mix: '', player: '', monitor: '', obs: '' }],
    inputs: [{ ch: '1', name: '', mic: '', v48: '', stand: '', position: '', obs: '' }],
    backline: [{ col1: '', col2: '', col3: '', col4: '' }],
    visuals: [{ col1: '', col2: '', col3: '', col4: '' }],
    stageplot: [],
    stageplotConfig: { width: 10, depth: 8 }
  };

  const templatesTexto = {
    importante: "Toda la información técnica detallada en este rider es exclusiva y confidencial. Cualquier cambio, sustitución de equipos o modificaciones de marca deben ser consultadas y aprobadas por escrito por la producción con al menos 15 días de anticipación al evento. De lo contrario, no se aceptará la alternativa en terreno.",
    soundcheck: "El sistema de P.A. debe estar 100% operativo, ruteado, alineado y libre de ruidos al menos 1 hora antes de la llegada de nuestro equipo técnico (Load In). El escenario debe estar despejado, limpio y con todos los requerimientos de backline listos para pruebas.",
    recordatorio: "Por favor asegurar la provisión de energía eléctrica estable, con las tomas de corriente (220v/110v) indicadas y aterrizadas correctamente. La seguridad del equipo y del personal es responsabilidad absoluta del promotor local desde el Load In hasta el término del Load Out."
  };

  const [form, setForm] = useState({ id: null, title: '', type: 'COMPLETO', content: defaultContent });

  const fetchRiders = async () => {
    setLoading(true); setFetchError(false);
    try {
      const res = await apiFetch('getRiders');
      if (res.status === 'success') {
        const parsedRiders = res.data.map(r => {
          let parsedContent;
          try { 
            parsedContent = JSON.parse(r.content); 
            if(!parsedContent.stageplot) parsedContent.stageplot = [];
            if(!parsedContent.stageplotConfig) parsedContent.stageplotConfig = { width: 10, depth: 8 };
          } 
          catch(e) { parsedContent = { ...defaultContent, importante: r.content }; }
          return { ...r, content: parsedContent };
        });
        setRiders(parsedRiders);
      }
    } catch(e) { setFetchError(true); }
    setLoading(false);
  };
  useEffect(() => { fetchRiders(); }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const action = form.id ? 'updateRider' : 'createRider';
      const payloadToSave = { ...form, content: JSON.stringify(form.content) };
      await apiFetch(action, payloadToSave);
      showToast("Rider guardado correctamente."); setIsEditing(false); fetchRiders();
    } catch(e) { showToast("Error al guardar rider."); setLoading(false); }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await apiFetch('deleteRider', { id });
      showToast("Rider eliminado permanentemente."); fetchRiders();
    } catch(e) { showToast("Error al eliminar."); setLoading(false); }
  };

  const openEditor = (rider = null) => {
    if (rider) setForm({ ...rider });
    else setForm({ id: null, title: 'Nuevo Rider Téc.', type: 'COMPLETO', content: JSON.parse(JSON.stringify(defaultContent)) });
    setEditTab('GENERAL'); setIsEditing(true);
  };

  const restoreDefaults = () => {
    setForm(prev => ({ ...prev, content: JSON.parse(JSON.stringify(defaultContent)) }));
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

  const icons = { 'SONIDO': Mic2, 'ILUMINACIÓN': Lightbulb, 'STAGEPLOT': MapIcon, 'COMPLETO': FileText };

  const getTabsForType = (type) => {
    switch(type) {
      case 'SONIDO': return ['GENERAL', 'AUDIO', 'BACKLINE', 'STAGEPLOT'];
      case 'ILUMINACIÓN': return ['GENERAL', 'VISUALES', 'STAGEPLOT'];
      case 'STAGEPLOT': return ['GENERAL', 'BACKLINE', 'STAGEPLOT'];
      default: return ['GENERAL', 'AUDIO', 'BACKLINE', 'VISUALES', 'STAGEPLOT'];
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

  return (
    <div className="space-y-4 animate-fade-in pb-24 max-w-5xl mx-auto print:m-0 print:p-0 print:w-full print:max-w-none">
      <header className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 print:hidden">
        <div><h1 className="text-2xl font-black text-white flex items-center gap-2"><FileText className="text-emerald-500" size={24}/> Riders Técnicos</h1><p className="text-xs md:text-sm text-slate-400 mt-1">Especificaciones Oficiales. Presiona Imprimir para generar PDF.</p></div>
        <div className="flex gap-2 w-full sm:w-auto">
          {!isEditing && <Button icon={Printer} variant="secondary" onClick={handlePrint} className="flex-1 sm:flex-none" title="Imprimir o Descargar en PDF">Imprimir PDF</Button>}
          {canManageRiders && !isEditing && <Button icon={Plus} onClick={() => openEditor(null)} className="flex-1 sm:flex-none">Crear Rider</Button>}
        </div>
      </header>

      {isEditing ? (
        <Card className="p-0 border-emerald-500 overflow-hidden flex flex-col h-[85vh]">
          <div className="p-3 md:p-4 border-b border-slate-700 bg-slate-900 shrink-0">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base md:text-lg font-bold text-white">{form.id ? 'Editar Rider' : 'Generar Nuevo Rider'}</h2>
              <Button variant="ghost" className="text-[10px] py-1 px-2 border border-slate-700" icon={RefreshCw} onClick={() => requestConfirm('¿Restaurar plantilla? Se borrarán los datos no guardados.', restoreDefaults)}>Restaurar</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Título del Documento</label><input required className="w-full bg-slate-800 border-slate-700 rounded p-2 text-xs md:text-sm text-white outline-none focus:border-emerald-500" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} /></div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Área / Tipo</label>
                <select className="w-full bg-slate-800 border-slate-700 rounded p-2 text-xs md:text-sm text-white font-bold outline-none focus:border-emerald-500 max-w-full break-words" value={form.type} onChange={handleTypeChange}>
                  <option value="COMPLETO">RIDER COMPLETO</option>
                  <option value="SONIDO">SONIDO</option>
                  <option value="ILUMINACIÓN">ILUMINACIÓN</option>
                  <option value="STAGEPLOT">STAGEPLOT / BACKLINE</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex overflow-x-auto bg-slate-900 border-b border-slate-700 shrink-0 hide-scrollbar">
            {activeTabs.map(tab => (
              <button key={tab} type="button" onClick={() => setEditTab(tab)} className={`px-4 md:px-6 py-2 md:py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${editTab === tab ? 'border-emerald-500 text-emerald-400 bg-slate-800' : 'border-transparent text-slate-400 hover:text-white'}`}>{tab}</button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-slate-950 custom-scrollbar relative">
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
                    <table className="w-full text-left text-xs md:text-sm text-slate-300 min-w-[700px]"><thead className="bg-slate-800 text-[10px] md:text-xs border-b border-slate-700"><tr><th className="p-1.5 md:p-2 w-12">CH</th><th className="p-1.5 md:p-2">NAME</th><th className="p-1.5 md:p-2">MIC/DI</th><th className="p-1.5 md:p-2 w-10">48v</th><th className="p-1.5 md:p-2">STAND</th><th className="p-1.5 md:p-2">POSITION</th><th className="p-1.5 md:p-2">OBS</th><th className="p-1.5 md:p-2 w-10 text-center">X</th></tr></thead><tbody>{form.content.inputs.map((row, i) => (<tr key={i} className="border-b border-slate-800 last:border-0"><td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 text-center outline-none focus:border-emerald-500 text-xs" value={row.ch} onChange={e=>updateTable('inputs', i, 'ch', e.target.value)} /></td><td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.name} onChange={e=>updateTable('inputs', i, 'name', e.target.value)} /></td><td className="p-1"><MicDiSelect value={row.mic} onChange={val=>updateTable('inputs', i, 'mic', val)} /></td><td className="p-1"><select className="w-full bg-transparent border border-slate-700 rounded p-1 text-center outline-none focus:border-emerald-500 text-xs" value={row.v48} onChange={e=>updateTable('inputs', i, 'v48', e.target.value)}><option value=""></option><option value="SI">SI</option><option value="NO">NO</option></select></td><td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.stand} onChange={e=>updateTable('inputs', i, 'stand', e.target.value)} /></td><td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.position} onChange={e=>updateTable('inputs', i, 'position', e.target.value)} /></td><td className="p-1"><AutoResizeTextarea className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.obs} onChange={e=>updateTable('inputs', i, 'obs', e.target.value)} /></td><td className="p-1 text-center"><button type="button" onClick={()=>removeRow('inputs', i)} className="text-red-500 p-1 hover:bg-red-500/20 rounded"><Trash2 size={12}/></button></td></tr>))}</tbody></table>
                  </div>
                </div>
              </div>
            )}

            {editTab === 'BACKLINE' && activeTabs.includes('BACKLINE') && (
              <div>
                <div className="flex justify-between items-end mb-2"><h3 className="text-xs md:text-sm font-bold text-emerald-500">BACKLINE ({form.content.backline.length}/100)</h3><Button variant="secondary" className="py-1 px-2.5 text-[10px]" icon={Plus} onClick={() => addRow('backline', { col1: '', col2: '', col3: '', col4: '' })}>Fila</Button></div>
                <div className="overflow-x-auto rounded border border-slate-700 bg-slate-900">
                  <table className="w-full text-left text-xs md:text-sm text-slate-300 min-w-[500px]"><thead className="bg-slate-800 text-[10px] md:text-xs border-b border-slate-700"><tr><th className="p-1.5 md:p-2">ITEM</th><th className="p-1.5 md:p-2 w-16">CANT</th><th className="p-1.5 md:p-2">ESPECIFICACIONES</th><th className="p-1.5 md:p-2">OBS</th><th className="p-1.5 md:p-2 w-10 text-center">X</th></tr></thead><tbody>{form.content.backline.map((row, i) => (<tr key={i} className="border-b border-slate-800 last:border-0"><td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.col1} onChange={e=>updateTable('backline', i, 'col1', e.target.value)} /></td><td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 text-center outline-none focus:border-emerald-500 text-xs" value={row.col2} onChange={e=>updateTable('backline', i, 'col2', e.target.value)} /></td><td className="p-1"><AutoResizeTextarea className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.col3} onChange={e=>updateTable('backline', i, 'col3', e.target.value)} /></td><td className="p-1"><AutoResizeTextarea className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.col4} onChange={e=>updateTable('backline', i, 'col4', e.target.value)} /></td><td className="p-1 text-center"><button type="button" onClick={()=>removeRow('backline', i)} className="text-red-500 p-1 hover:bg-red-500/20 rounded"><Trash2 size={12}/></button></td></tr>))}</tbody></table>
                </div>
              </div>
            )}

            {editTab === 'VISUALES' && activeTabs.includes('VISUALES') && (
              <div>
                <div className="flex justify-between items-end mb-2"><h3 className="text-xs md:text-sm font-bold text-emerald-500">VISUAL / LIGHTS ({form.content.visuals.length}/100)</h3><Button variant="secondary" className="py-1 px-2.5 text-[10px]" icon={Plus} onClick={() => addRow('visuals', { col1: '', col2: '', col3: '', col4: '' })}>Fila</Button></div>
                <div className="overflow-x-auto rounded border border-slate-700 bg-slate-900">
                  <table className="w-full text-left text-xs md:text-sm text-slate-300 min-w-[500px]"><thead className="bg-slate-800 text-[10px] md:text-xs border-b border-slate-700"><tr><th className="p-1.5 md:p-2">SISTEMA/EQUIPO</th><th className="p-1.5 md:p-2 w-16">CANT</th><th className="p-1.5 md:p-2">UBICACIÓN</th><th className="p-1.5 md:p-2">OBS</th><th className="p-1.5 md:p-2 w-10 text-center">X</th></tr></thead><tbody>{form.content.visuals.map((row, i) => (<tr key={i} className="border-b border-slate-800 last:border-0"><td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.col1} onChange={e=>updateTable('visuals', i, 'col1', e.target.value)} /></td><td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 text-center outline-none focus:border-emerald-500 text-xs" value={row.col2} onChange={e=>updateTable('visuals', i, 'col2', e.target.value)} /></td><td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.col3} onChange={e=>updateTable('visuals', i, 'col3', e.target.value)} /></td><td className="p-1"><AutoResizeTextarea className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.col4} onChange={e=>updateTable('visuals', i, 'col4', e.target.value)} /></td><td className="p-1 text-center"><button type="button" onClick={()=>removeRow('visuals', i)} className="text-red-500 p-1 hover:bg-red-500/20 rounded"><Trash2 size={12}/></button></td></tr>))}</tbody></table>
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
          </div>

          <div className="p-3 md:p-4 border-t border-slate-700 bg-slate-900 shrink-0 flex gap-2">
            <Button variant="secondary" className="flex-1 py-2" onClick={() => setIsEditing(false)}>Cancelar</Button>
            <Button variant="primary" className="flex-1 py-2" onClick={handleSave} icon={Save}>Guardar Documento</Button>
          </div>
        </Card>
      ) : fetchError ? (
        <div className="bg-red-500/10 border border-red-500/50 p-3 md:p-4 rounded-xl text-red-400 flex items-center gap-2 text-sm print:hidden">
          <AlertCircle size={18} /> Error al cargar Riders.
        </div>
      ) : loading && riders.length === 0 ? (
        <div className="flex justify-center p-8 print:hidden"><Loader2 className="animate-spin text-emerald-500" size={28}/></div>
      ) : (
        <div className="grid grid-cols-1 gap-6 print:gap-10">
          {riders.map((r, idx) => {
            const IconType = icons[r.type] || FileText;
            return (
              <div key={idx} className="border-t-4 border-t-emerald-500 bg-slate-900 print:bg-white print:border-t-black print:border print:text-black rounded-xl overflow-hidden page-break-inside-avoid shadow-sm print:shadow-none">
                <div className="p-4 md:p-5 border-b border-slate-800 print:border-black flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-800 print:bg-transparent print:border print:border-black rounded-lg flex justify-center items-center"><IconType className="text-emerald-500 print:text-black" size={18}/></div>
                    <div>
                      <h3 className="font-black text-white print:text-black text-lg md:text-xl leading-none">{r.title}</h3>
                      <span className="text-[10px] bg-slate-800 text-emerald-400 print:bg-transparent print:text-black px-2 py-0.5 rounded border border-slate-700 print:border-black font-bold uppercase mt-1.5 inline-block">{r.type}</span>
                    </div>
                  </div>
                  {canManageRiders && (
                    <div className="flex gap-2 print:hidden">
                      <Button variant="danger" className="px-2.5 py-1.5 bg-slate-800" icon={Trash2} onClick={() => requestConfirm("¿Eliminar este Rider permanentemente?", () => handleDelete(r.id))}></Button>
                      <Button variant="secondary" className="py-1.5" icon={Edit3} onClick={() => openEditor(r)}>Editar</Button>
                    </div>
                  )}
                </div>
                
                <div className="p-4 md:p-5 space-y-4 md:space-y-6">
                  {r.content.importante && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 print:bg-transparent print:border-black p-3 md:p-4 rounded-lg">
                      <h4 className="text-emerald-400 print:text-black text-[10px] md:text-xs font-black mb-1.5 uppercase">Importante</h4>
                      <p className="text-xs md:text-sm text-emerald-100 print:text-black whitespace-pre-wrap">{r.content.importante}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {r.content.contacto && (r.content.contacto.mgmtNombre || r.content.contacto.mgmtCel || r.content.contacto.mgmtCorreo) && (
                      <div className="bg-slate-800 print:bg-transparent p-3 md:p-4 rounded-lg border border-slate-700 print:border-black">
                        <h4 className="text-slate-400 print:text-black text-[10px] md:text-xs font-black mb-2 uppercase">Contacto Management</h4>
                        {r.content.contacto.mgmtNombre && <p className="text-xs md:text-sm text-white print:text-black font-bold mb-1">👤 {r.content.contacto.mgmtNombre}</p>}
                        {r.content.contacto.mgmtCel && <p className="text-xs md:text-sm text-white print:text-black">📱 {r.content.contacto.mgmtCel}</p>}
                        {r.content.contacto.mgmtCorreo && <p className="text-xs md:text-sm text-white print:text-black">✉️ {r.content.contacto.mgmtCorreo}</p>}
                      </div>
                    )}
                    {r.content.contacto && (r.content.contacto.prodNombre || r.content.contacto.prodCel || r.content.contacto.prodCorreo) && (
                      <div className="bg-slate-800 print:bg-transparent p-3 md:p-4 rounded-lg border border-slate-700 print:border-black">
                        <h4 className="text-slate-400 print:text-black text-[10px] md:text-xs font-black mb-2 uppercase">Contacto Producción</h4>
                        {r.content.contacto.prodNombre && <p className="text-xs md:text-sm text-white print:text-black font-bold mb-1">👤 {r.content.contacto.prodNombre}</p>}
                        {r.content.contacto.prodCel && <p className="text-xs md:text-sm text-white print:text-black">📱 {r.content.contacto.prodCel}</p>}
                        {r.content.contacto.prodCorreo && <p className="text-xs md:text-sm text-white print:text-black">✉️ {r.content.contacto.prodCorreo}</p>}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {r.content.soundcheck && (
                       <div className="bg-slate-800 print:bg-transparent p-3 md:p-4 rounded-lg border border-slate-700 print:border-black">
                         <h4 className="text-slate-400 print:text-black text-[10px] md:text-xs font-black mb-1.5 uppercase">Requisitos SoundCheck</h4>
                         <p className="text-xs md:text-sm text-slate-300 print:text-black whitespace-pre-wrap">{r.content.soundcheck}</p>
                       </div>
                    )}
                    {r.content.recordatorio && (
                       <div className="bg-red-500/10 print:bg-transparent p-3 md:p-4 rounded-lg border border-red-500/20 print:border-black">
                         <h4 className="text-red-400 print:text-black text-[10px] md:text-xs font-black mb-1.5 uppercase">Recordatorio</h4>
                         <p className="text-xs md:text-sm text-red-100 print:text-black whitespace-pre-wrap">{r.content.recordatorio}</p>
                       </div>
                    )}
                  </div>

                  {/* Tablas (Renderizadas compactas) */}
                  {r.content.inputs && r.content.inputs.length > 0 && r.content.inputs[0].name !== '' && (
                    <div className="mt-3 md:mt-4 break-inside-avoid">
                      <h4 className="text-slate-400 print:text-black text-[10px] md:text-xs font-black mb-1.5 uppercase">INPUT LIST</h4>
                      <div className="overflow-x-auto rounded border border-slate-700 print:border-black">
                        <table className="w-full text-left text-xs md:text-sm text-slate-300 print:text-black min-w-[500px]">
                          <thead className="bg-slate-800 print:bg-gray-200 text-[10px] md:text-xs uppercase text-slate-500 print:text-black border-b border-slate-700 print:border-black">
                            <tr><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0 w-8">CH</th><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0">NAME</th><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0">MIC/DI</th><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0 w-10">48v</th><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0">STAND</th><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0">POSITION</th><th className="p-1.5 md:p-2">OBS</th></tr>
                          </thead>
                          <tbody>
                            {r.content.inputs.map((row, i) => row.name && <tr key={i} className="border-b border-slate-800 print:border-black last:border-0"><td className="p-1.5 md:p-2 font-bold border-r border-slate-800 print:border-black">{row.ch}</td><td className="p-1.5 md:p-2 border-r border-slate-800 print:border-black">{row.name}</td><td className="p-1.5 md:p-2 border-r border-slate-800 print:border-black">{row.mic}</td><td className="p-1.5 md:p-2 text-center border-r border-slate-800 print:border-black">{row.v48}</td><td className="p-1.5 md:p-2 border-r border-slate-800 print:border-black">{row.stand}</td><td className="p-1.5 md:p-2 border-r border-slate-800 print:border-black">{row.position}</td><td className="p-1.5 md:p-2 text-[10px] md:text-xs whitespace-pre-wrap">{row.obs}</td></tr>)}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {r.content.outputs && r.content.outputs.length > 0 && r.content.outputs[0].mix !== '' && (
                    <div className="mt-3 md:mt-4 break-inside-avoid">
                      <h4 className="text-slate-400 print:text-black text-[10px] md:text-xs font-black mb-1.5 uppercase">OUTPUT / MONITOR LIST</h4>
                      <div className="overflow-x-auto rounded border border-slate-700 print:border-black">
                        <table className="w-full text-left text-xs md:text-sm text-slate-300 print:text-black min-w-[400px]">
                          <thead className="bg-slate-800 print:bg-gray-200 text-[10px] md:text-xs uppercase text-slate-500 print:text-black border-b border-slate-700 print:border-black">
                            <tr><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0 w-12">MIX</th><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0">PLAYER</th><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0">MONITOR</th><th className="p-1.5 md:p-2">OBS</th></tr>
                          </thead>
                          <tbody>
                            {r.content.outputs.map((row, i) => row.mix && <tr key={i} className="border-b border-slate-800 print:border-black last:border-0"><td className="p-1.5 md:p-2 font-bold border-r border-slate-800 print:border-black">{row.mix}</td><td className="p-1.5 md:p-2 border-r border-slate-800 print:border-black">{row.player}</td><td className="p-1.5 md:p-2 border-r border-slate-800 print:border-black">{row.monitor}</td><td className="p-1.5 md:p-2 text-[10px] md:text-xs whitespace-pre-wrap">{row.obs}</td></tr>)}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {r.content.backline && r.content.backline.length > 0 && r.content.backline[0].col1 !== '' && (
                    <div className="mt-3 md:mt-4 break-inside-avoid">
                      <h4 className="text-slate-400 print:text-black text-[10px] md:text-xs font-black mb-1.5 uppercase">BACKLINE</h4>
                      <div className="overflow-x-auto rounded border border-slate-700 print:border-black">
                        <table className="w-full text-left text-xs md:text-sm text-slate-300 print:text-black min-w-[400px]">
                          <thead className="bg-slate-800 print:bg-gray-200 text-[10px] md:text-xs uppercase text-slate-500 print:text-black border-b border-slate-700 print:border-black">
                            <tr><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0">ITEM</th><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0 w-12">CANT</th><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0">ESPECIFICACIONES</th><th className="p-1.5 md:p-2">OBS</th></tr>
                          </thead>
                          <tbody>
                            {r.content.backline.map((row, i) => row.col1 && <tr key={i} className="border-b border-slate-800 print:border-black last:border-0"><td className="p-1.5 md:p-2 font-bold border-r border-slate-800 print:border-black">{row.col1}</td><td className="p-1.5 md:p-2 text-center border-r border-slate-800 print:border-black">{row.col2}</td><td className="p-1.5 md:p-2 border-r border-slate-800 print:border-black whitespace-pre-wrap">{row.col3}</td><td className="p-1.5 md:p-2 text-[10px] md:text-xs whitespace-pre-wrap">{row.col4}</td></tr>)}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {r.content.visuals && r.content.visuals.length > 0 && r.content.visuals[0].col1 !== '' && (
                    <div className="mt-3 md:mt-4 break-inside-avoid">
                      <h4 className="text-slate-400 print:text-black text-[10px] md:text-xs font-black mb-1.5 uppercase">VISUAL / LIGHTS</h4>
                      <div className="overflow-x-auto rounded border border-slate-700 print:border-black">
                        <table className="w-full text-left text-xs md:text-sm text-slate-300 print:text-black min-w-[400px]">
                          <thead className="bg-slate-800 print:bg-gray-200 text-[10px] md:text-xs uppercase text-slate-500 print:text-black border-b border-slate-700 print:border-black">
                            <tr><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0">SISTEMA/EQUIPO</th><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0 w-12">CANT</th><th className="p-1.5 md:p-2 border-r border-slate-700 print:border-black last:border-0">UBICACIÓN</th><th className="p-1.5 md:p-2">OBS</th></tr>
                          </thead>
                          <tbody>
                            {r.content.visuals.map((row, i) => row.col1 && <tr key={i} className="border-b border-slate-800 print:border-black last:border-0"><td className="p-1.5 md:p-2 font-bold border-r border-slate-800 print:border-black">{row.col1}</td><td className="p-1.5 md:p-2 text-center border-r border-slate-800 print:border-black">{row.col2}</td><td className="p-1.5 md:p-2 border-r border-slate-800 print:border-black">{row.col3}</td><td className="p-1.5 md:p-2 text-[10px] md:text-xs whitespace-pre-wrap">{row.col4}</td></tr>)}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Render Stageplot in View Mode */}
                  {r.content.stageplot && r.content.stageplot.length > 0 && (
                     <div className="mt-3 md:mt-4 break-inside-avoid">
                        <h4 className="text-slate-400 print:text-black text-[10px] md:text-xs font-black mb-1.5 uppercase">
                           STAGEPLOT: {r.title} ({r.content.stageplotConfig?.width || 10}m x {r.content.stageplotConfig?.depth || 8}m)
                        </h4>
                        <div className="w-full rounded border-2 border-slate-700 print:border-black overflow-hidden bg-white">
                           <StageplotBuilder 
                              items={r.content.stageplot} 
                              config={r.content.stageplotConfig || {width: 10, depth: 8}} 
                              onChange={()=>{}} 
                              onConfigChange={()=>{}} 
                              readOnly={true} 
                              projectName={r.title}
                           />
                        </div>
                     </div>
                  )}
                </div>
              </div>
            );
          })}
          {riders.length === 0 && <div className="text-center p-8 border border-slate-800 border-dashed rounded-xl text-slate-500 text-sm print:hidden">No hay Riders creados aún.</div>}
        </div>
      )}
    </div>
  );
};

// --- 5. DIRECTORIO STAFF Y REPORTE DE CATERING ---
const StaffDirectory = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [localDirectory, setLocalDirectory] = useState([]);
  const [showCatering, setShowCatering] = useState(false);

  useEffect(() => {
    const fetchDirectory = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('getUsuarios');
        if (res.status === 'success') {
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

  const cateringCount = localDirectory.concat([currentUser]).reduce((acc, user) => {
    const dieta = user.dieta || 'OMNÍVORA';
    acc[dieta] = (acc[dieta] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-24 max-w-5xl mx-auto print:m-0 print:p-0 print:w-full">
      <header className="border-b border-slate-800 pb-3 md:pb-4 flex justify-between items-end print:hidden">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2 md:gap-3"><Users className="text-emerald-500" size={24} /> Directorio</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">{[ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role) ? 'Lista del personal activo.' : 'Contactos asignados.'}</p>
        </div>
        {[ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.APV].includes(currentUser.role) && (
          <Button variant="secondary" icon={Utensils} onClick={() => setShowCatering(!showCatering)}>{showCatering ? 'Ocultar Catering' : 'Catering'}</Button>
        )}
      </header>

      {showCatering && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 md:p-6 mb-6 print:border-black print:bg-white print:text-black">
          <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-slate-800 print:border-black pb-3 md:pb-4">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2"><Utensils className="text-amber-500 print:text-black"/> Reporte Catering (APV)</h2>
            <Button variant="secondary" icon={Printer} className="print:hidden py-1.5 px-3 text-xs" onClick={handlePrint}>Imprimir PDF</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-[10px] md:text-xs font-bold text-slate-400 print:text-black mb-2 uppercase tracking-wider">Resumen por Dieta</h3>
              <div className="space-y-1.5">
                {Object.entries(cateringCount).sort((a,b) => b[1] - a[1]).map(([dieta, count]) => (
                  <div key={dieta} className="flex justify-between items-center bg-slate-800 print:bg-transparent border border-slate-700 print:border-black p-2 md:p-3 rounded-lg text-xs md:text-sm">
                    <span className="font-bold print:text-black">{dieta}</span>
                    <span className="bg-emerald-500/20 text-emerald-400 print:bg-transparent print:text-black print:border print:border-black px-2 py-0.5 rounded-full font-black">{count}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center p-2 md:p-3 font-black border-t border-slate-700 print:border-black mt-3 text-xs md:text-sm">
                  <span>Total Staff</span>
                  <span>{localDirectory.length + 1}</span>
                </div>
              </div>
            </div>
            <div>
               <h3 className="text-[10px] md:text-xs font-bold text-slate-400 print:text-black mb-2 uppercase tracking-wider">Detalle de Asignación</h3>
               <div className="overflow-y-auto max-h-[300px] print:max-h-none border border-slate-700 print:border-black rounded-lg custom-scrollbar bg-slate-800 print:bg-transparent">
                 <table className="w-full text-left text-xs md:text-sm print:text-black">
                   <thead className="bg-slate-900 print:bg-gray-200 sticky top-0 border-b border-slate-700 print:border-black">
                     <tr><th className="p-2 pl-3">Nombre</th><th className="p-2">Dieta</th></tr>
                   </thead>
                   <tbody>
                      <tr className="border-b border-slate-700/50 print:border-black/50">
                        <td className="p-2 pl-3 font-bold">{currentUser.name} (Tú)</td>
                        <td className="p-2"><span className="text-[9px] md:text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/30 print:border-black print:text-black px-1.5 py-0.5 rounded font-black uppercase tracking-wider truncate block max-w-[100px] md:max-w-none">{currentUser.dieta || 'OMNÍVORA'}</span></td>
                      </tr>
                     {localDirectory.map(u => (
                       <tr key={u.email} className="border-b border-slate-700/50 print:border-black/50 last:border-0">
                         <td className="p-2 pl-3">{u.name}</td>
                         <td className="p-2"><span className="text-[9px] md:text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/30 print:border-black print:text-black px-1.5 py-0.5 rounded font-black uppercase tracking-wider truncate block max-w-[100px] md:max-w-none">{u.dieta || 'OMNÍVORA'}</span></td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        </div>
      )}

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

// --- 6. CHAT GLOBAL (Conectado a la BD) ---
const ChatView = ({ currentUser, showToast }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const canSendMessages = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.APV].includes(currentUser.role);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const res = await apiFetch('getMensajes');
      if (res.status === 'success') {
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
      fetchMessages();
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
        <Button variant="ghost" className="text-slate-400 hover:text-emerald-400 p-1.5 md:p-2 border border-slate-700 rounded" onClick={() => { setLoading(true); fetchMessages(); }} title="Actualizar Chat"><RefreshCw size={14} className={loading ? "animate-spin text-emerald-500" : ""}/></Button>
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

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('DASHBOARD');
  const [selectedProject, setSelectedProject] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [directory, setDirectory] = useState([]); 
  
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

    const r = currentUser.role;
    const chat = { id: 'CHAT', label: 'Anuncios', icon: MessageSquare };
    const time = { id: 'TIMING', label: 'Timing Global', icon: CalendarDays };
    const dir = { id: 'STAFF', label: 'Directorio', icon: Users };
    const transport = { id: 'TRANSPORT', label: 'Transportes', icon: Truck };
    const riders = { id: 'RIDERS', label: 'Riders Téc.', icon: FileText };
    const admin = { id: 'ADMIN_PANEL', label: 'Admin Panel', icon: ShieldCheck };
    const profile = { id: 'PROFILE', label: 'Mi Perfil', icon: User };
    
    if (r === ROLES.ADMIN) return [ { id: 'DASHBOARD', label: 'Proyectos', icon: Navigation }, time, riders, transport, chat, dir, admin, profile ];
    if (r === ROLES.MANAGER || r === ROLES.TOUR_MANAGER) return [ { id: 'DASHBOARD', label: 'Proyectos', icon: Navigation }, time, riders, transport, chat, dir, profile ];
    
    return [ { id: 'DASHBOARD', label: 'Proyectos', icon: Navigation }, time, riders, transport, chat, dir, profile ];
  };

  const fetchDirectoryGlobal = async () => {
    try {
      const res = await apiFetch('getUsuarios');
      if (res.status === 'success') setDirectory(res.data.filter(u => u.status === 'ACTIVO'));
    } catch(e) { console.error("Error fetching global directory", e); }
  };

  useEffect(() => {
    if (currentUser && currentUser.role !== 'CONDUCTOR') {
      fetchDirectoryGlobal();
    }
  }, [currentUser]);

  // --- MODAL DE CONFIRMACIÓN GLOBAL ---
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

  // --- RENDERIZADO PRINCIPAL ---
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
          {currentView === 'PROJECT_DETAILS' && <ProjectDetailsView currentUser={currentUser} setCurrentView={setCurrentView} selectedProject={selectedProject} showToast={showToast} directory={directory} requestConfirm={requestConfirm} />}
          {currentView === 'ADMIN_PANEL' && <AdminPanel currentUser={currentUser} showToast={showToast} requestConfirm={requestConfirm} />}
          {currentView === 'PROFILE' && <ProfileView currentUser={currentUser} setCurrentUser={setCurrentUser} showToast={showToast} />}
          {currentView === 'STAFF' && <StaffDirectory currentUser={currentUser} />}
          {currentView === 'CHAT' && <ChatView currentUser={currentUser} showToast={showToast} />}
          {currentView === 'TIMING' && <TimingGlobalView currentUser={currentUser} setCurrentView={setCurrentView} setSelectedProject={setSelectedProject} showToast={showToast} />}
          {currentView === 'TRANSPORT' && <TransportView currentUser={currentUser} setCurrentView={setCurrentView} setSelectedProject={setSelectedProject} showToast={showToast} />}
          {currentView === 'TRANSPORT_DETAILS' && <TransportDetailsView currentUser={currentUser} setCurrentView={setCurrentView} selectedProject={selectedProject} showToast={showToast} />}
          {currentView === 'RIDERS' && <RidersView currentUser={currentUser} showToast={showToast} requestConfirm={requestConfirm} />}
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