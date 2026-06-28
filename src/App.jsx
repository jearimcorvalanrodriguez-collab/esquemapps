import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Calendar, Clock, Users, Bell, MessageSquare, 
  Truck, Music, CheckCircle2, XCircle, LogOut, Plus, 
  Navigation, User, Settings, ShieldCheck, UserPlus, 
  UserCheck, Edit3, X, Key, AlertCircle, Loader2,
  Phone, Mail, CheckCheck, Send, Timer, Hourglass,
  Shield, CalendarPlus, FileText, Mic2, Lightbulb, Map as MapIcon, Save,
  Trash2, FolderPlus, RefreshCw, ChevronLeft, CheckSquare, Square, Printer, Utensils, CalendarDays,
  RotateCw, Maximize, Minimize, Link, Eye, EyeOff, Copy, ExternalLink, MessageCircle, Play, DollarSign, Image as ImageIcon, Wallet
} from 'lucide-react';

const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  TOUR_MANAGER: 'TOUR MANAGER',
  TEC_JEFE: 'TEC. JEFE',
  JEFE_CAT_APV: 'JEFE CAT/APV',
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
  const url = import.meta.env.VITE_GAS_URL || 'https://script.google.com/macros/s/AKfycbwNXxsCfNlOV-JkeUO2Sl55SquzwcrwP50ZpfSUyeg-mI1ugvtCw-1E1mLF-2OS5tmAEw/exec';
  
  // Get active user email from localStorage
  const storedUser = window.localStorage.getItem('esquemapps_user');
  let requesterEmail = null;
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed && parsed.email) requesterEmail = parsed.email;
    } catch (e) {}
  }

  const securePayload = { ...payload };
  if (requesterEmail && !securePayload.requesterEmail) {
    securePayload.requesterEmail = requesterEmail;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ app_secret: ESQUEMAS_MASTER_SECRET, action, payload: securePayload })
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

const AddressAutocomplete = ({ value, onChange, placeholder, className, required }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchAddress = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=es`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSuggestions(data.map(item => ({
          label: item.display_name,
          value: item.display_name
        })));
      }
    } catch (e) {
      console.error("Autocomplete error:", e);
    }
    setLoading(false);
  };

  const timeoutRef = useRef(null);
  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    setShowDropdown(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      searchAddress(val);
    }, 450);
  };

  const handleSelect = (item) => {
    onChange(item.value);
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="flex gap-2">
        <input 
          required={required}
          className={className}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          onFocus={() => { if (value && value.length >= 3) setShowDropdown(true); }}
        />
        <button 
          type="button" 
          onClick={() => window.open(value ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}` : 'https://www.google.com/maps', '_blank')} 
          className="p-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors shrink-0" 
          title="Ver en Google Maps"
        >
          <MapPin size={14} />
        </button>
      </div>
      {showDropdown && (suggestions.length > 0 || loading) && (
        <ul className="absolute z-[9999] w-full bg-slate-900 border border-slate-700 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-2xl text-left">
          {loading && (
            <li className="p-2.5 text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="animate-spin text-blue-500" size={12} />
              <span>Buscando sugerencias...</span>
            </li>
          )}
          {!loading && suggestions.map((item, idx) => (
            <li 
              key={idx} 
              onClick={() => handleSelect(item)}
              className="p-2.5 text-xs text-slate-200 hover:bg-slate-800 cursor-pointer border-b border-slate-800 last:border-0 leading-tight transition-colors"
            >
              📍 {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ToggleSwitch = ({ checked, onChange, label }) => {
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

const NotificationsButton = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadNotifications = () => {
    const list = [];
    if (!currentUser) return;
    const myProjects = (CACHE.proyectos || []).filter(p => 
      [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role) || 
      (p.asignados || []).includes(currentUser.email)
    );
    const myProjectIds = myProjects.map(p => String(p.id));

    // 1. Messages
    const chatMsgs = (CACHE.mensajes || []).filter(m => myProjectIds.includes(String(m.proyectoId)));
    chatMsgs.forEach(m => {
      const projName = myProjects.find(p => String(p.id) === String(m.proyectoId))?.name || "Proyecto";
      list.push({
        id: 'msg-' + m.id,
        type: 'chat',
        title: `Mensaje de ${m.sender}`,
        description: m.text,
        time: m.time,
        timestamp: Number(m.id) || 0,
        projectName: projName
      });
    });

    // 2. Transports
    const trans = (CACHE.transportes || []).filter(t => myProjectIds.includes(String(t.proyectoId)));
    trans.forEach(t => {
      const projName = myProjects.find(p => String(p.id) === String(t.proyectoId))?.name || "Proyecto";
      list.push({
        id: 'trans-' + t.id,
        type: 'transport',
        title: `Nueva Ruta: ${t.title}`,
        description: `${t.origin} ➡️ ${t.dest} (${t.date} ${t.time})`,
        time: `${t.date} ${t.time}`,
        timestamp: Number(t.id) || 0,
        projectName: projName
      });
    });

    // 3. Hitos
    const hitos = (CACHE.hitos || []).filter(h => myProjectIds.includes(String(h.proyectoId)));
    hitos.forEach(h => {
      const projName = myProjects.find(p => String(p.id) === String(h.proyectoId))?.name || "Proyecto";
      list.push({
        id: 'hito-' + h.id,
        type: 'hito',
        title: `Nuevo Hito: ${h.title}`,
        description: `${h.location} (${h.date} ${h.time})`,
        time: `${h.date} ${h.time}`,
        timestamp: Number(h.id) || 0,
        projectName: projName
      });
    });

    list.sort((a, b) => b.timestamp - a.timestamp);
    setNotifications(list.slice(0, 8));
  };

  const handleToggle = () => {
    if (!isOpen) {
      loadNotifications();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div ref={wrapperRef} className="relative inline-block text-left print:hidden">
      <button 
        type="button" 
        onClick={handleToggle}
        className="p-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-amber-500 hover:text-amber-400 rounded-lg transition-colors flex items-center justify-center shrink-0 relative"
        title="Notificaciones de Proyectos"
      >
        <Bell size={14} />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[9999] overflow-hidden animate-slide-up">
          <div className="p-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <span className="font-bold text-xs text-white uppercase tracking-wider font-sans">Actividad Reciente</span>
            <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-black font-sans">Novedades</span>
          </div>
          <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-slate-800/80 text-left">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">No hay novedades recientes en tus proyectos asignados.</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-3 hover:bg-slate-800/50 transition-colors">
                  <div className="flex justify-between items-start gap-2 mb-0.5 font-sans">
                    <span className="text-[9px] font-black text-amber-500 truncate max-w-[140px] uppercase">{n.projectName}</span>
                    <span className="text-[8px] text-slate-500 font-mono shrink-0">{n.time}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug font-sans">{n.title}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-relaxed font-sans">{n.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
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

const StageplotBuilder = ({ items, onChange, config, onConfigChange, readOnly = false, projectName = "" }) => {
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

            <div className="pt-3 border-t border-slate-800 space-y-2 mt-auto">
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
              const isSelected = selectedId === item.id && !readOnly;

              const w = Number(config.width) || 10;
              const d = Number(config.depth) || 8;
              const sizeScale = Math.max(0.6, Math.min(2.0, 10 / w));
              
              // Calculate scale based on physical canvas width to prevent crowded overlapping on mobile/tablet
              let deviceScale = 1.0;
              if (canvasWidth) {
                if (canvasWidth < 500) {
                  deviceScale = 0.65; // Mobile scale
                } else if (canvasWidth < 850) {
                  deviceScale = 0.82;  // iPad / Tablet scale
                }
              }
              const scale = sizeScale * deviceScale;

              const itemWidthPercent = def.width * scale;
              const itemHeightPercent = itemWidthPercent * (def.height / def.width) * (w / d);

              // Determine side label placement (right side by default, flip to left if near right boundary or item to the right)
              let sidePlacement = 'right';
              if (item.x > 70) {
                sidePlacement = 'left';
              } else {
                const itemToRight = items.some(other => {
                  if (other.id === item.id) return false;
                  const dx = other.x - item.x; // distance to the right
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
                  className="absolute flex flex-col items-center justify-center print:cursor-default"
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
    <div className="relative pl-6 md:pl-8 group">
      {/* Timeline dot */}
      <div className={`absolute left-[1px] md:left-[5px] top-4 w-3 h-3 rounded-full ring-4 ring-slate-950 ${status.dot} ${status.pulse ? 'animate-pulse' : ''} z-10 print:ring-white`}></div>
      
      <div className={`p-2.5 md:p-3 rounded-lg border transition-all duration-500 bg-slate-900/50 hover:bg-slate-800 print:bg-transparent ${status.border} flex flex-col sm:flex-row justify-between sm:items-center gap-2 print:border-black`}>
        
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4">
          <div className="shrink-0 text-left min-w-[70px]">
             <span className={`block font-black text-sm md:text-base leading-none print:text-black ${status.textClass}`}>{formattedTime}</span>
             <span className="text-[9px] text-slate-500 font-bold print:text-slate-700">{formattedDate}</span>
          </div>
          
          <div className="flex-1 border-l-0 sm:border-l border-slate-700/50 print:border-black/30 sm:pl-3">
            <div className="flex items-start justify-between">
               <h3 className="text-sm font-bold text-white print:text-black">{event.title}</h3>
               {canManage && (
                 <button onClick={() => requestConfirm("¿Eliminar Hito permanentemente?", () => handleDeleteHito(event.id))} className="text-slate-500 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity print:hidden"><Trash2 size={14}/></button>
               )}
            </div>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 print:text-blue-700 flex items-center gap-1 w-fit mt-0.5">
              <MapPin size={10}/> {event.location}
            </a>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 border-t sm:border-t-0 border-slate-700/50 print:border-transparent pt-2 sm:pt-0 print:hidden">
           {isAssignedToMe && <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase border border-blue-500/50">Tú</span>}
           {canManage && (
             <Button variant="ghost" className="bg-slate-900 border border-slate-700 py-0.5 px-1.5 text-[9px]" icon={Users} onClick={() => setAssigningHito(event)}>
               {event.asignados.length}
             </Button>
           )}
           <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border bg-slate-950 ${status.border} ${status.textClass} font-mono font-bold text-[9px]`}>
             <Hourglass size={10} className={status.pulse ? 'animate-spin-slow' : ''} />{status.timeText}
           </div>
        </div>

      </div>
    </div>
  );
};

// --- CHAT LATERAL POR PROYECTO ---
const ProjectChatSidebar = ({ currentUser, selectedProject, showToast }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const canSendMessages = (currentUser.permisos || []).includes('CHAT_SEND') || 
    (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TEC_JEFE, ROLES.JEFE_CAT_APV, ROLES.APV].includes(currentUser.role));

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };

  const fetchMessages = async (force = false, isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      let msgData = CACHE.mensajes;
      if (force || !msgData) {
        const res = await apiFetch('getMensajes');
        if (res.status === 'success') { msgData = res.data; CACHE.mensajes = res.data; }
      }
      if (msgData) {
        const isNew = CACHE.mensajes && CACHE.mensajes.length < msgData.length;
        const projMsgs = msgData.filter(m => String(m.proyectoId) === String(selectedProject.id));
        setMessages(projMsgs);
        if (!isBackground || isNew) setTimeout(scrollToBottom, 100);
      }
    } catch (e) { if (!isBackground) showToast("Error al conectar con chat."); }
    if (!isBackground) setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => fetchMessages(true, true), 10000);
    return () => clearInterval(interval);
  }, [selectedProject]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !canSendMessages) return;
    
    const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const tempId = Date.now();
    const newMsgObj = { id: tempId, proyectoId: selectedProject.id, sender: currentUser.name, role: currentUser.role, text: newMsg, time: timeStr, readBy: [] };
    
    setMessages([...messages, newMsgObj]); 
    setNewMsg('');
    setTimeout(scrollToBottom, 100);

    try {
      await apiFetch('sendMensaje', { proyectoId: selectedProject.id, sender: currentUser.name, role: currentUser.role, text: newMsgObj.text, time: timeStr });
      clearCache('mensajes');
      fetchMessages(true, true);
    } catch (e) { showToast("No se pudo enviar el mensaje."); }
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
    } catch (e) { showToast("Error al marcar como leído."); }
  };

  return (
    <div className="flex flex-col h-[500px] lg:h-[calc(100vh-8rem)] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg print:hidden">
      <header className="p-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-amber-500" size={18} />
          <div>
            <h2 className="font-black text-white text-sm leading-tight">Anuncios</h2>
            <p className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">Canal Oficial</p>
          </div>
        </div>
        <Button variant="ghost" className="text-slate-400 hover:text-emerald-400 p-1 border border-slate-700 rounded" onClick={() => fetchMessages(true)} title="Actualizar Chat"><RefreshCw size={12} className={loading ? "animate-spin text-emerald-500" : ""}/></Button>
      </header>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {messages.length === 0 && !loading && <div className="text-center text-slate-500 mt-8 text-xs">No hay comunicados en esta gira.</div>}
        
        {messages.map(msg => {
          const isMe = msg.sender === currentUser.name;
          const hasRead = msg.readBy.includes(currentUser.name);
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-slide-up`}>
              <div className={`flex flex-col mb-1 ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] font-bold text-slate-300">{msg.sender}</span>
                  <span className="text-[9px] text-slate-500">{msg.time}</span>
                </div>
                <span className="text-[8px] text-amber-500 uppercase font-black leading-none mt-0.5">{msg.role}</span>
              </div>
              <div className={`p-2 rounded-xl max-w-[85%] text-xs shadow-sm ${isMe ? 'bg-amber-600 text-white rounded-tr-none' : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'}`}>{msg.text}</div>
              {!isMe && ( <button onClick={() => toggleReadReceipt(msg.id)} disabled={hasRead} className={`mt-1 flex items-center gap-1 text-[9px] font-bold px-1.5 py-1 rounded transition-colors ${hasRead ? 'bg-blue-500/20 text-blue-400 cursor-default' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}><CheckCheck size={10} /> {hasRead ? 'Leído' : 'Marcar Leído'}</button> )}
              {isMe && msg.readBy.length > 0 && ( <span className="text-[8px] text-blue-400 mt-1 font-bold flex items-center gap-1"><CheckCheck size={10} /> Visto por {msg.readBy.length}</span> )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {canSendMessages ? (
        <form onSubmit={handleSend} className="p-2 bg-slate-800 border-t border-slate-700 flex gap-2">
          <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Escribe un anuncio..." className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"/>
          <Button type="submit" variant="primary" icon={Send} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 border-amber-500 shadow-amber-900/30"></Button>
        </form>
      ) : (
        <div className="p-2 bg-slate-800 border-t border-slate-700 text-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">Solo Producción envía anuncios. Usa "Marcar Leído".</div>
      )}
    </div>
  );
};

// --- AUTENTICACIÓN ---
const AuthRouter = ({ setCurrentUser, setCurrentView, showToast }) => {
  const [mode, setMode] = useState('LOGIN'); 
  const [email, setEmail] = useState(''); 
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [driverToken, setDriverToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState(ROLES.TECH);
  const [regPhone, setRegPhone] = useState('+569');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [tcAccepted, setTcAccepted] = useState(false);

  useEffect(() => {
    setDisclaimerAccepted(false);
    setTcAccepted(false);
  }, [mode]);

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
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
    e.preventDefault();
    if (!disclaimerAccepted) {
      setError("Debes aceptar los términos y condiciones de tratamiento de datos.");
      return;
    }
    if (!tcAccepted) {
      setError("Debes aceptar los Términos y Condiciones y la Política de Privacidad.");
      return;
    }
    setError(''); setLoading(true);
    try {
      const result = await apiFetch('solicitarAcceso', { 
        name: regName.trim(), 
        email: email.trim(), 
        phone: regPhone.trim(), 
        role: regRole,
        disclaimerAceptado: true,
        tcVersion: 'v1.0'
      });
      if (result.status === 'success') { 
        setMode('REGISTER_SUCCESS'); 
      } 
      else setError(result.message);
    } catch (err) { setError('Error de red al enviar la solicitud.'); }
    setLoading(false);
  };

  const handleRecover = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const result = await apiFetch('recuperarPassword', { email: email.trim() });
      if (result.status === 'success') {
        showToast("Clave temporal enviada a tu correo.");
        setMode('LOGIN');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Error de red al intentar recuperar contraseña.");
    }
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
        {mode !== 'REGISTER_SUCCESS' && (
          <div className="mb-4 text-center border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white">{mode === 'LOGIN' ? 'Iniciar Sesión' : mode === 'CONDUCTOR' ? 'Acceso Conductor' : mode === 'RECOVER' ? 'Recuperar Contraseña' : 'Solicitar Acceso'}</h2>
          </div>
        )}
        
        {mode === 'LOGIN' && (
          <form onSubmit={handleLogin} className="space-y-4">
             {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-2.5 rounded-lg flex items-center gap-2"><AlertCircle size={14} /><span>{error}</span></div>}
            <div><label className="block text-xs font-bold text-slate-400 mb-1">Correo Electrónico</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none transition-colors" required /></div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Contraseña</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={pass} onChange={e=>setPass(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 pr-10 text-white text-sm focus:border-emerald-500 outline-none transition-colors" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="text-right mt-1">
                <button type="button" onClick={() => setMode('RECOVER')} className="text-[10px] text-emerald-500 hover:underline">¿Olvidaste tu contraseña?</button>
              </div>
            </div>
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

        {mode === 'RECOVER' && (
          <form onSubmit={handleRecover} className="space-y-4 animate-fade-in">
            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-2.5 rounded-lg flex items-center gap-2"><AlertCircle size={14} /><span>{error}</span></div>}
            <p className="text-xs text-slate-400 text-center">Ingresa tu correo para recibir una nueva clave de acceso temporal por email.</p>
            <div><label className="block text-xs font-bold text-slate-400 mb-1">Correo Electrónico</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none transition-colors" required /></div>
            <Button type="submit" className="w-full py-2.5" disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : 'Enviar Clave Temporal'}</Button>
            <p className="text-center text-xs text-slate-400 mt-3"><button type="button" onClick={()=>setMode('LOGIN')} className="text-emerald-500 font-bold hover:underline">Volver al Login</button></p>
          </form>
        )}

        {mode === 'REGISTER' && (
          <form onSubmit={handleRegister} className="space-y-3">
            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-2.5 rounded-lg flex items-center gap-2"><AlertCircle size={14} /><span>{error}</span></div>}
            <div><label className="block text-xs font-bold text-slate-400 mb-1">Nombre Completo</label><input type="text" value={regName} onChange={e=>setRegName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none" required /></div>
            <div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-bold text-slate-400 mb-1">Correo</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none" required /></div><div><label className="block text-xs font-bold text-slate-400 mb-1">Teléfono</label><input type="tel" value={regPhone} onChange={e=>setRegPhone(e.target.value.replace(/[^0-9+]/g, ''))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none" required /></div></div>
            <div><label className="block text-xs font-bold text-slate-400 mb-1">Rol</label><select value={regRole} onChange={e=>setRegRole(e.target.value)} className="w-full max-w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none break-words whitespace-normal">{Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}</select></div>
            
            <div className="space-y-2 pt-1 text-left">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-[10px] text-slate-400 max-h-20 overflow-y-auto custom-scrollbar leading-relaxed">
                <p className="font-bold text-slate-300 mb-0.5">AVISO DE TRATAMIENTO DE DATOS</p>
                Al solicitar acceso, aceptas que recopilamos tu nombre, correo, teléfono (para contacto/WhatsApp), talla de vestimenta (para uniformes/merch) y restricciones alimenticias (para catering). Estos datos se usarán solo para fines operativos y se conservarán mientras existan la app y web app.
              </div>
              <label className="flex items-start gap-2 text-[11px] text-slate-300 cursor-pointer select-none">
                <input type="checkbox" required checked={disclaimerAccepted} onChange={e => setDisclaimerAccepted(e.target.checked)} className="accent-emerald-500 rounded bg-slate-900 border-slate-700 mt-0.5" />
                <span>Acepto el tratamiento de mis datos personales y sensibles.</span>
              </label>
              <label className="flex items-start gap-2 text-[11px] text-slate-300 cursor-pointer select-none pt-1">
                <input type="checkbox" required checked={tcAccepted} onChange={e => setTcAccepted(e.target.checked)} className="accent-emerald-500 rounded bg-slate-900 border-slate-700 mt-0.5" />
                <span>He leído y acepto los <a href="#" className="text-emerald-500 hover:underline font-bold">Términos y Condiciones</a> y la <a href="#" className="text-emerald-500 hover:underline font-bold">Política de Privacidad</a>.</span>
              </label>
            </div>

            <Button type="submit" className="w-full py-2.5 mt-2" disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : 'Enviar Solicitud'}</Button>
            <p className="text-center text-xs text-slate-400 mt-3"><button type="button" onClick={()=>setMode('LOGIN')} className="text-emerald-500 font-bold hover:underline">Volver al Login</button></p>
          </form>
        )}

        {mode === 'REGISTER_SUCCESS' && (
          <div className="text-center space-y-4 py-4 animate-fade-in">
            <div className="mx-auto w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-black text-white">¡Solicitud Enviada!</h2>
            <p className="text-sm text-emerald-400 font-bold">¡Muchas gracias por querer ser parte del Crew!</p>
            <p className="text-xs md:text-sm text-slate-300 px-2">Cuando tu acceso sea aprobado, llegará un correo con una clave provisoria que debes actualizar en tu sección <b>Mi Perfil</b>.</p>
            <Button onClick={() => setMode('LOGIN')} className="w-full mt-6 py-2.5" variant="secondary">Volver al Inicio</Button>
          </div>
        )}
      </Card>
    </div>
  );
};

// --- COMPONENTES DE TRANSPORTE ---
const TransportView = ({ currentUser, setCurrentView, showToast, selectedProject }) => {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', time: '', origin: '', dest: '', proyectoId: selectedProject?.id || '', paradas: [] });
  const [stopInput, setStopInput] = useState('');
  const [assigningDriverToken, setAssigningDriverToken] = useState(null);
  const [driverForm, setDriverForm] = useState({ name: '', email: '', phone: '+569' });
  const [sendingId, setSendingId] = useState(null);
  const [editingRouteId, setEditingRouteId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', date: '', time: '', origin: '', dest: '', paradas: [] });
  const [editStopInput, setEditStopInput] = useState('');

  const canSeeTransport = (currentUser.permisos || []).includes('TRANSPORT') || 
                           (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TRASLADO].includes(currentUser.role));
  const canCreateRoute = (currentUser.permisos || []).includes('TRANSPORT_CREATE') || 
                          (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TRASLADO].includes(currentUser.role));
  const canEditRoute = (currentUser.permisos || []).includes('TRANSPORT_EDIT') || 
                        (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role));

  if (!canSeeTransport) {
    return (
      <div className="p-8 text-center text-red-500 font-bold border border-red-500/20 bg-red-500/5 rounded-xl">
        Acceso Denegado: No tienes privilegios para ver la sección de Transportes.
      </div>
    );
  }

  const fetchTransports = async (force = false, isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      let transData = CACHE.transportes;
      if (force || !transData) {
        const res = await apiFetch('getTransportes');
        if (res.status === 'success') { transData = res.data; CACHE.transportes = res.data; }
      }
      
      if (transData) {
        if (isBackground) {
          const oldLen = transports.length;
          const newLen = transData.filter(t => String(t.proyectoId) === String(selectedProject?.id)).length;
          if (newLen > oldLen) showToast("🚐 ¡Hay un nuevo Transporte en este proyecto!");
        }
        setTransports(transData.filter(t => String(t.proyectoId) === String(selectedProject?.id)));
      }
    } catch(e) {
      if (!isBackground) showToast("Error al cargar transportes.");
    }
    if (!isBackground) setLoading(false);
  };

  useEffect(() => { 
    if(selectedProject) fetchTransports(); 
    const interval = setInterval(() => fetchTransports(true, true), 30000);
    return () => clearInterval(interval);
  }, [selectedProject]);

  if (!selectedProject) return <div className="text-center p-8"><Button onClick={() => setCurrentView('DASHBOARD')}>Volver a Proyectos</Button></div>;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast("¡Token copiado al portapapeles!");
  };

  const handleSaveDriver = async (e, t) => {
    e.preventDefault();
    try {
      const res = await apiFetch('asignarConductor', { 
        token: t.token, 
        conductor: `${driverForm.name.trim()} (${driverForm.email.trim()})`, 
        conductorPhone: driverForm.phone.trim() 
      });
      if (res.status === 'success') {
        showToast("Piloto asignado con éxito.");
        setAssigningDriverToken(null);
        clearCache('transportes');
        fetchTransports(true);
      } else {
        showToast("Error: " + res.message);
      }
    } catch(err) {
      showToast("Error al asignar piloto.");
    }
  };

  const handleUpdateRoute = async (e, routeId) => {
    e.preventDefault();
    try {
      const res = await apiFetch('updateTransporte', { 
        id: routeId, 
        title: editForm.title.trim(),
        date: editForm.date,
        time: editForm.time,
        origin: editForm.origin.trim(),
        dest: editForm.dest.trim(),
        paradas: editForm.paradas
      });
      if (res.status === 'success') {
        showToast("Ruta actualizada y avisos enviados.");
        setEditingRouteId(null);
        clearCache('transportes');
        fetchTransports(true);
      } else {
        showToast("Error: " + res.message);
      }
    } catch(err) {
      showToast("Error al actualizar la ruta.");
    }
  };

  const handleSendNotification = async (t) => {
    setSendingId(t.token);
    try {
      const driverEmail = t.conductor.match(/\(([^)]+)\)/)?.[1] || t.conductor;
      const driverName = t.conductor.split(' (')[0];
      const res = await apiFetch('enviarAvisoConductor', {
        token: t.token,
        conductorEmail,
        conductorName,
        title: t.title,
        date: t.date,
        time: t.time,
        origin: t.origin,
        dest: t.dest,
        paradas: t.paradas || []
      });
      if (res.status === 'success') {
        showToast("Aviso enviado por email.");
      } else {
        showToast("Error: " + res.message);
      }
    } catch(err) {
      showToast("Error al enviar correo al conductor.");
    }
    setSendingId(null);
  };

  const getWhatsAppLink = (t) => {
    const cleanPhone = t.conductorPhone.replace(/[^0-9]/g, '');
    const driverName = t.conductor.split(' (')[0];
    const msg = `Hola ${driverName}! Te hemos asignado una nueva ruta: '${t.title}'. Para ver el itinerario completo e iniciar navegacion con Waze o Google Maps, ingresa con tu Token a la app:\n\n🔗 ${window.location.origin}\n🔑 Token: ${t.token}\n\nPor favor, confirma recepcion en el correo que te enviamos. ¡Gracias!`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, proyectoId: selectedProject.id };
      const res = await apiFetch('createTransporte', payload);
      if (res.status === 'success') {
        showToast("Ruta creada con éxito.");
        setIsCreating(false);
        setForm({ title: '', date: '', time: '', origin: '', dest: '', proyectoId: selectedProject.id, paradas: [] });
        clearCache('transportes');
        fetchTransports(true);
      }
    } catch(e) {
      showToast("Error al crear ruta.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 pb-24 animate-fade-in">
      <button onClick={() => setCurrentView('PROJECT_DETAILS')} className="flex items-center gap-1.5 text-xs md:text-sm text-slate-400 hover:text-white transition-colors mb-2"><ChevronLeft size={16}/> Volver a {selectedProject.name}</button>
      
      <header className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2"><Truck className="text-blue-500" size={24}/> Transportes</h1>
          <p className="text-sm text-slate-400">Rutas para: {selectedProject.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <NotificationsButton currentUser={currentUser} />
          <Button variant="ghost" icon={RefreshCw} onClick={() => fetchTransports(true)} className="px-2 border border-slate-700 hover:text-emerald-400" title="Actualizar Transportes" />
          {canCreateRoute && !isCreating && <Button icon={Plus} onClick={() => setIsCreating(true)}>Nueva Ruta</Button>}
        </div>
      </header>

      {isCreating && (
        <Card className="p-4 md:p-6 border-blue-500 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Crear Nueva Ruta</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div><label className="text-xs text-slate-400 block mb-1">Título de la Ruta</label><input required className="w-full bg-slate-900 border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} placeholder="Ej. Traslado Hotel - Recinto" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-slate-400 block mb-1">Fecha</label><input required type="date" className="w-full bg-slate-900 border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} /></div>
              <div><label className="text-xs text-slate-400 block mb-1">Hora</label><input required type="time" className="w-full bg-slate-900 border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500" value={form.time} onChange={e=>setForm({...form, time: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Origen</label>
                <AddressAutocomplete 
                  required 
                  value={form.origin} 
                  onChange={val => setForm({...form, origin: val})} 
                  placeholder="Dirección o recinto de origen..." 
                  className="w-full bg-slate-900 border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Destino</label>
                <AddressAutocomplete 
                  required 
                  value={form.dest} 
                  onChange={val => setForm({...form, dest: val})} 
                  placeholder="Dirección o recinto de destino..." 
                  className="w-full bg-slate-900 border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none" 
                />
              </div>
            </div>

            <div className="text-left space-y-2 border-t border-slate-800 pt-3">
              <label className="text-xs text-slate-400 block font-bold">Paradas Intermedias (Recogidas / Puntos de Ruta)</label>
              <div className="flex gap-2">
                <AddressAutocomplete 
                  value={stopInput} 
                  onChange={setStopInput} 
                  placeholder="Buscar dirección de parada..." 
                  className="flex-1 bg-slate-900 border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none" 
                />
                <Button 
                  type="button" 
                  onClick={() => {
                    if (stopInput.trim()) {
                      setForm(prev => ({ ...prev, paradas: [...(prev.paradas || []), stopInput.trim()] }));
                      setStopInput('');
                    } else {
                      showToast("Ingresa una dirección válida primero.");
                    }
                  }} 
                  variant="blue" 
                  className="px-4 py-2 shrink-0 text-xs"
                >
                  Agregar Parada
                </Button>
              </div>
              
              {form.paradas && form.paradas.length > 0 && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar p-2.5 bg-slate-950 rounded border border-slate-800 mt-2">
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-2">Secuencia de Recogidas:</p>
                  {form.paradas.map((st, idx) => (
                    <div key={idx} className="flex justify-between items-center gap-2 text-xs bg-slate-900 px-2.5 py-2 rounded border border-slate-800 transition-colors hover:border-slate-700">
                      <span className="text-slate-300 truncate flex-1"><span className="font-bold text-blue-400 mr-1.5">#{idx + 1}</span> {st}</span>
                      <button 
                        type="button" 
                        onClick={() => setForm(prev => ({ ...prev, paradas: prev.paradas.filter((_, i) => i !== idx) }))}
                        className="text-red-400 hover:text-red-300 font-bold px-1 text-sm hover:scale-110 transition-transform"
                        title="Eliminar parada"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2"><Button variant="secondary" className="flex-1 py-2.5" onClick={()=>setIsCreating(false)}>Cancelar</Button><Button type="submit" variant="blue" className="flex-1 py-2.5">Guardar Ruta</Button></div>
          </form>
        </Card>
      )}

      {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" size={28}/></div> : transports.length === 0 ? <div className="text-center p-12 border border-slate-800 border-dashed rounded-xl bg-slate-900/50 text-slate-500">No hay transportes programados en este proyecto.</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transports.map(t => {
            const hasDriver = !!t.conductor;
            return (
              <Card key={t.id} className="p-4 border-l-4 border-l-blue-500 flex flex-col justify-between min-h-[280px]">
                {editingRouteId === t.id ? (
                  <form onSubmit={(e) => handleUpdateRoute(e, t.id)} className="space-y-3 text-left animate-fade-in w-full">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 mb-1.5">
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Editar Ruta</h4>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">{t.token}</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5 font-bold uppercase">Título de la Ruta</label>
                      <input required className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-blue-500" value={editForm.title} onChange={e=>setEditForm({...editForm, title: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5 font-bold uppercase">Fecha</label>
                        <input required type="date" className="w-full bg-slate-900 border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-blue-500" value={editForm.date} onChange={e=>setEditForm({...editForm, date: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5 font-bold uppercase">Hora</label>
                        <input required type="time" className="w-full bg-slate-900 border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-blue-500" value={editForm.time} onChange={e=>setEditForm({...editForm, time: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5 font-bold uppercase">Origen</label>
                      <AddressAutocomplete value={editForm.origin} onChange={val=>setEditForm({...editForm, origin: val})} placeholder="Buscar origen..." className="w-full bg-slate-900 border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-blue-500"/>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5 font-bold uppercase">Destino</label>
                      <AddressAutocomplete value={editForm.dest} onChange={val=>setEditForm({...editForm, dest: val})} placeholder="Buscar destino..." className="w-full bg-slate-900 border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-blue-500"/>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 block font-bold uppercase">Paradas Intermedias</label>
                      <div className="flex gap-1.5">
                        <AddressAutocomplete value={editStopInput} onChange={setEditStopInput} placeholder="Añadir parada..." className="flex-1 bg-slate-900 border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-blue-500"/>
                        <Button type="button" variant="blue" className="px-2.5 py-1.5 text-xs shrink-0" onClick={() => { if(editStopInput.trim()) { setEditForm(prev => ({...prev, paradas: [...(prev.paradas || []), editStopInput.trim()]})); setEditStopInput(''); } }}>+</Button>
                      </div>
                      {editForm.paradas && editForm.paradas.length > 0 && (
                        <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar p-2 bg-slate-950 rounded border border-slate-800">
                          {editForm.paradas.map((s, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[10px] bg-slate-900 px-2 py-1 rounded border border-slate-850">
                              <span className="text-slate-300 truncate">#{idx+1}: {s}</span>
                              <button type="button" className="text-red-400 hover:text-red-300 ml-1 font-bold text-xs" onClick={() => setEditForm(prev => ({...prev, paradas: prev.paradas.filter((_, i) => i !== idx)}))}>✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-2 border-t border-slate-800">
                      <Button type="button" variant="secondary" className="flex-1 py-2 text-xs" onClick={()=>setEditingRouteId(null)}>Cancelar</Button>
                      <Button type="submit" variant="blue" className="flex-1 py-2 text-xs">Guardar Cambios</Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-base md:text-lg text-white leading-tight">{t.title}</h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {canEditRoute && (
                            <button 
                              type="button" 
                              onClick={() => {
                                setEditingRouteId(t.id);
                                setEditForm({ title: t.title, date: t.date, time: t.time, origin: t.origin, dest: t.dest, paradas: t.paradas || [] });
                                setEditStopInput('');
                              }} 
                              className="text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded transition-all font-bold"
                              title="Editar Ruta"
                            >
                              Editar
                            </button>
                          )}
                          <span className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded uppercase ${t.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50' : t.status === 'EN RUTA' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/50' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/50'}`}>{t.status}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-xs md:text-sm text-slate-300 mb-4 text-left">
                        <p className="flex items-center gap-2 font-mono"><Calendar size={13}/> {t.date} {t.time}</p>
                        
                        <div className="border border-slate-800/80 bg-slate-900/40 rounded-lg p-2.5 space-y-1.5">
                          <p className="flex items-start gap-1.5">
                            <MapPin size={13} className="text-amber-500 shrink-0 mt-0.5"/> 
                            <span className="font-bold shrink-0">Origen: </span>
                            <span className="text-slate-300 truncate">{t.origin}</span>
                          </p>
                          
                          {t.paradas && t.paradas.length > 0 && (
                            <div className="pl-4 border-l border-slate-800 space-y-1 my-1">
                              {t.paradas.map((st, i) => (
                                <p key={i} className="flex items-start gap-1 text-slate-400 text-xs">
                                  <span className="font-bold text-blue-400">📍 Stop {i+1}:</span>
                                  <span className="truncate">{st}</span>
                                </p>
                              ))}
                            </div>
                          )}
                          
                          <p className="flex items-start gap-1.5 pt-1 border-t border-slate-800/50">
                            <Navigation size={13} className="text-emerald-500 shrink-0 mt-0.5"/> 
                            <span className="font-bold shrink-0">Destino: </span>
                            <span className="text-slate-300 truncate">{t.dest}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-slate-800 pt-3 w-full">
                      <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                        <div className="text-left">
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Piloto Asignado</p>
                          {hasDriver ? (
                            <div>
                              <p className="text-xs font-bold text-white leading-tight">{t.conductor.split(' (')[0]}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 leading-none">{t.conductorPhone}</p>
                              <span className={`text-[9px] font-black uppercase inline-block mt-1 ${t.conductorAceptado === 'Ruta aceptada por conductor' ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
                                ● {t.conductorAceptado || 'PENDIENTE'}
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic">Sin conductor asignado</p>
                          )}
                        </div>
                        {canEditRoute && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            className="py-1 px-2 text-[10px] border border-slate-700 bg-slate-900"
                            onClick={() => {
                              setAssigningDriverToken(t.token);
                              if (hasDriver) {
                                const name = t.conductor.split(' (')[0];
                                const email = t.conductor.match(/\(([^)]+)\)/)?.[1] || '';
                                setDriverForm({ name, email, phone: t.conductorPhone });
                              } else {
                                setDriverForm({ name: '', email: '', phone: '+569' });
                              }
                            }}
                          >
                            {hasDriver ? 'Cambiar' : 'Asignar'}
                          </Button>
                        )}
                      </div>

                      {assigningDriverToken === t.token && (
                        <form onSubmit={(e) => handleSaveDriver(e, t)} className="p-3 bg-slate-900 border border-slate-700 rounded-lg space-y-2 text-left animate-fade-in w-full">
                          <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Configurar Conductor</h4>
                          <input required type="text" placeholder="Nombre completo" value={driverForm.name} onChange={e=>setDriverForm({...driverForm, name: e.target.value})} className="w-full bg-slate-950 border-slate-800 rounded p-1.5 text-xs text-white outline-none focus:border-blue-500"/>
                          <input required type="email" placeholder="Email (recibe confirmación)" value={driverForm.email} onChange={e=>setDriverForm({...driverForm, email: e.target.value})} className="w-full bg-slate-950 border-slate-800 rounded p-1.5 text-xs text-white outline-none focus:border-blue-500"/>
                          <input required type="tel" placeholder="WhatsApp (ej. +56912345678)" value={driverForm.phone} onChange={e=>setDriverForm({...driverForm, phone: e.target.value.replace(/[^0-9+]/g, '')})} className="w-full bg-slate-950 border-slate-800 rounded p-1.5 text-xs text-white outline-none focus:border-blue-500"/>
                          <div className="flex gap-2 pt-1">
                            <Button type="button" variant="secondary" className="flex-1 py-1 text-xs" onClick={()=>setAssigningDriverToken(null)}>Cancelar</Button>
                            <Button type="submit" variant="blue" className="flex-1 py-1 text-xs">Guardar</Button>
                          </div>
                        </form>
                      )}

                      <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg flex justify-between items-center gap-3">
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Token Piloto</p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-blue-400 font-bold tracking-widest text-xs md:text-sm truncate">{t.token}</span>
                            <button 
                              type="button" 
                              onClick={() => copyToClipboard(t.token)} 
                              className="text-slate-400 hover:text-white p-0.5"
                              title="Copiar Token"
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                        </div>
                        {hasDriver && canEditRoute && (
                          <div className="flex items-center gap-1.5">
                            <button 
                              type="button" 
                              onClick={() => handleSendNotification(t)}
                              disabled={sendingId === t.token}
                              className="p-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-blue-400 hover:text-blue-300 rounded-lg transition-colors flex items-center justify-center shrink-0"
                              title="Enviar Token por Correo"
                            >
                              {sendingId === t.token ? <Loader2 size={12} className="animate-spin"/> : <Mail size={12} />}
                            </button>
                            <a 
                              href={getWhatsAppLink(t)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-emerald-400 hover:text-emerald-300 rounded-lg transition-colors flex items-center justify-center shrink-0"
                              title="Enviar Token por WhatsApp"
                            >
                              <MessageCircle size={12} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </Card>
            );
          })}
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
        
        let alertText = '';
        if (newStatus === 'COMENZADO') {
          alertText = `🚐 [Logística] El conductor ha comenzado la preparación/ruta "${routeInfo.title}" (Token: ${routeInfo.token}).`;
        } else if (newStatus === 'EN VIAJE') {
          alertText = `🚐 [Logística] El conductor ha iniciado el viaje para la ruta "${routeInfo.title}". ¡En camino!`;
        } else if (newStatus === 'LLEGADO') {
          alertText = `📢 [AVISO LLEGADA] 🚐 ¡El conductor de la ruta "${routeInfo.title}" ha LLEGADO al punto de destino/espera!`;
        } else if (newStatus === 'FINALIZADO') {
          alertText = `🚐 [Logística] La ruta de transporte "${routeInfo.title}" ha finalizado con éxito.`;
        }

        if (alertText && routeInfo.proyectoId) {
          try {
            await apiFetch('sendMensaje', {
              proyectoId: routeInfo.proyectoId,
              sender: '🚐 Transporte',
              role: 'LOGISTICA',
              text: alertText,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            clearCache('chat');
          } catch(e) {
            console.error("Error al enviar mensaje de notificación de transporte", e);
          }
        }
      } else {
        showToast(`Error: ${res.message}`);
      }
    } catch(e) { 
      showToast("Error al actualizar estado."); 
    }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-lg mx-auto animate-fade-in mt-4">
      <Card className="p-6 border-blue-500/50">
        <h2 className="text-xl font-black text-white mb-2">{routeInfo.title}</h2>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex flex-col justify-center text-left">
             <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Token Ruta</span>
             <span className="font-mono text-emerald-400 font-bold tracking-widest text-base">{routeInfo.token}</span>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex flex-col justify-center text-left">
             <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Estado Actual</span>
             <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold text-center border ${
               routeInfo.status === 'PENDING' || routeInfo.status === 'PENDIENTE' ? 'bg-slate-800 text-slate-400 border-slate-700' :
               routeInfo.status === 'COMENZADO' ? 'bg-indigo-950 text-indigo-400 border-indigo-900/50' :
               routeInfo.status === 'EN VIAJE' || routeInfo.status === 'EN RUTA' ? 'bg-blue-950 text-blue-400 border-blue-900/50' :
               routeInfo.status === 'LLEGADO' ? 'bg-emerald-950 text-emerald-400 border-emerald-900/50' :
               routeInfo.status === 'FINALIZADO' ? 'bg-slate-900 text-slate-500 border-slate-800' :
               'bg-slate-800 text-slate-400'
             }`}>
               {routeInfo.status || 'PENDIENTE'}
             </span>
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-300 mb-6 text-left">
          <p className="flex items-center gap-2"><Calendar size={16} className="text-blue-400"/> Fecha: {routeInfo.date} a las {routeInfo.time}</p>
          
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-4">
             {/* Origen */}
             <div className="relative pl-6 pb-2">
               <div className="absolute left-1.5 top-1.5 bottom-0 w-0.5 bg-blue-500/50"></div>
               <div className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center border-2 border-slate-900">
                 <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
               </div>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Inicio (Origen)</p>
               <p className="font-bold text-white text-sm leading-snug">{routeInfo.origin}</p>
               <div className="flex gap-2 mt-1">
                 <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(routeInfo.origin)}`} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                   <MapIcon size={10}/> Google Maps
                 </a>
                 <a href={`https://waze.com/ul?q=${encodeURIComponent(routeInfo.origin)}&navigate=yes`} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-slate-800 border border-slate-700 hover:bg-slate-700 text-blue-400 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                   <Navigation size={10}/> Waze
                 </a>
               </div>
             </div>

             {/* Paradas Intermedias */}
             {routeInfo.paradas && routeInfo.paradas.length > 0 && routeInfo.paradas.map((stop, sIdx) => (
               <div key={sIdx} className="relative pl-6 pb-2">
                 <div className="absolute left-1.5 top-1.5 bottom-0 w-0.5 bg-blue-500/50"></div>
                 <div className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center border-2 border-slate-900">
                   <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>
                 </div>
                 <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Parada #{sIdx + 1}</p>
                 <p className="font-bold text-slate-300 text-sm leading-snug">{stop}</p>
                 <div className="flex gap-2 mt-1">
                   <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stop)}`} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                     <MapIcon size={10}/> Google Maps
                   </a>
                   <a href={`https://waze.com/ul?q=${encodeURIComponent(stop)}&navigate=yes`} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-slate-800 border border-slate-700 hover:bg-slate-700 text-blue-400 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                     <Navigation size={10}/> Waze
                   </a>
                 </div>
               </div>
             ))}

             {/* Destino */}
             <div className="relative pl-6">
               <div className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-slate-900">
                 <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
               </div>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Llegada (Destino)</p>
               <p className="font-bold text-white text-sm leading-snug">{routeInfo.dest}</p>
               <div className="flex gap-2 mt-1">
                 <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(routeInfo.dest)}`} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                   <MapIcon size={10}/> Google Maps
                 </a>
                 <a href={`https://waze.com/ul?q=${encodeURIComponent(routeInfo.dest)}&navigate=yes`} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-slate-800 border border-slate-700 hover:bg-slate-700 text-blue-400 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                   <Navigation size={10}/> Waze
                 </a>
               </div>
             </div>
          </div>
        </div>

        <div className="mb-6">
          <a 
            href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(routeInfo.origin)}&destination=${encodeURIComponent(routeInfo.dest)}&waypoints=${encodeURIComponent((routeInfo.paradas || []).join('|'))}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm shadow-lg shadow-emerald-950/20"
          >
            <MapIcon size={16}/> Iniciar Ruta Completa (Google Maps)
          </a>
        </div>
        
        <div className="space-y-3">
          <p className="text-xs text-slate-400 uppercase font-bold text-center">Actualizar Estado</p>
          
          <Button 
            variant="secondary" 
            className="w-full py-3 flex justify-center items-center gap-2" 
            onClick={() => updateStatus('COMENZADO')} 
            disabled={loading || routeInfo.status === 'COMENZADO' || routeInfo.status === 'FINALIZADO'}
            icon={Play}
          >
            Comenzar Ruta
          </Button>

          <Button 
            variant="blue" 
            className="w-full py-3 flex justify-center items-center gap-2" 
            onClick={() => updateStatus('EN VIAJE')} 
            disabled={loading || routeInfo.status === 'EN VIAJE' || routeInfo.status === 'FINALIZADO'}
            icon={Truck}
          >
            Comienzo Viaje
          </Button>

          <Button 
            variant="primary" 
            className="w-full py-3 flex justify-center items-center gap-2" 
            onClick={() => updateStatus('LLEGADO')} 
            disabled={loading || routeInfo.status === 'LLEGADO' || routeInfo.status === 'FINALIZADO'}
            icon={MapPin}
          >
            ¡Llegué! (Avisar a equipo)
          </Button>

          <Button 
            variant="danger" 
            className="w-full py-3 flex justify-center items-center gap-2" 
            onClick={() => updateStatus('FINALIZADO')} 
            disabled={loading || routeInfo.status === 'FINALIZADO'}
            icon={CheckCircle2}
          >
            Fin de Ruta
          </Button>
        </div>
      </Card>
    </div>
  );
};

const ExpensesView = ({ currentUser, showToast, requestConfirm, selectedProject, setSelectedProject }) => {
  const [proyectos, setProyectos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState('');
  const [viewingReceipt, setViewingReceipt] = useState(null);

  const canManageBudget = [ROLES.ADMIN, ROLES.MANAGER].includes(currentUser.role) || (currentUser.permisos || []).includes('EXPENSES_MANAGE');
  
  const [newExpense, setNewExpense] = useState({
    concepto: '',
    monto: '',
    categoria: 'Logística/Transporte',
    fecha: new Date().toISOString().split('T')[0],
    comprobante: ''
  });

  const fetchProyectos = async () => {
    try {
      const res = await apiFetch('getProyectos');
      if (res.status === 'success') {
        setProyectos(res.data);
      }
    } catch(e) {
      showToast("Error al cargar proyectos.");
    }
  };

  const fetchGastos = async () => {
    try {
      const res = await apiFetch('getGastos');
      if (res.status === 'success') {
        setGastos(res.data);
      }
    } catch(e) {
      showToast("Error al cargar gastos.");
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchProyectos(), fetchGastos()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast("La imagen es muy grande. Elige una menor a 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        setNewExpense(prev => ({ ...prev, comprobante: compressedBase64 }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!selectedProject) {
      showToast("Por favor selecciona un proyecto primero.");
      return;
    }
    if (!newExpense.concepto.trim() || !newExpense.monto) {
      showToast("Completa los campos obligatorios.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        proyectoId: selectedProject.id,
        concepto: newExpense.concepto.trim(),
        monto: Number(newExpense.monto),
        categoria: newExpense.categoria,
        fecha: newExpense.fecha,
        registradoPor: currentUser.email,
        comprobante: newExpense.comprobante
      };

      const res = await apiFetch('createGasto', payload);
      if (res.status === 'success') {
        showToast("Gasto registrado con éxito.");
        setNewExpense({
          concepto: '',
          monto: '',
          categoria: 'Logística/Transporte',
          fecha: new Date().toISOString().split('T')[0],
          comprobante: ''
        });
        const fileInput = document.getElementById('receipt-upload');
        if (fileInput) fileInput.value = '';
        
        await fetchGastos();
      } else {
        showToast("Error: " + res.message);
      }
    } catch(e) {
      showToast("Error al registrar gasto.");
    }
    setSubmitting(false);
  };

  const handleDeleteExpense = async (id) => {
    try {
      const res = await apiFetch('deleteGasto', { id });
      if (res.status === 'success') {
        showToast("Gasto eliminado.");
        await fetchGastos();
      } else {
        showToast("Error: " + res.message);
      }
    } catch(e) {
      showToast("Error al eliminar gasto.");
    }
  };

  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    
    setSubmitting(true);
    try {
      const res = await apiFetch('updateProyectoPresupuesto', {
        id: selectedProject.id,
        presupuesto: Number(newBudget)
      });
      if (res.status === 'success') {
        showToast("Presupuesto actualizado.");
        setEditingBudget(false);
        setProyectos(prev => prev.map(p => p.id === selectedProject.id ? { ...p, presupuesto: Number(newBudget) } : p));
        setSelectedProject(prev => ({ ...prev, presupuesto: Number(newBudget) }));
        clearCache('proyectos');
      } else {
        showToast("Error: " + res.message);
      }
    } catch(e) {
      showToast("Error al actualizar presupuesto.");
    }
    setSubmitting(false);
  };

  const projectExpenses = gastos.filter(g => String(g.proyectoId) === String(selectedProject?.id || ''));
  const totalSpent = projectExpenses.reduce((sum, g) => sum + g.monto, 0);
  const budget = selectedProject?.presupuesto || 0;
  const remaining = budget - totalSpent;
  const percentUsed = budget > 0 ? Math.min(Math.round((totalSpent / budget) * 100), 150) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="animate-spin text-emerald-500 mb-3" size={32} />
        <p className="font-bold text-sm">Cargando Módulo de Gastos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Wallet size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white">Control de Gastos y Presupuestos</h1>
            <p className="text-xs text-slate-400">Monitoreo de consumos, registro de boletas y control de saldo de producción.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Proyecto:</label>
          <select 
            value={selectedProject?.id || ''} 
            onChange={(e) => {
              const matched = proyectos.find(p => String(p.id) === e.target.value);
              setSelectedProject(matched || null);
              if (matched) setNewBudget(matched.presupuesto || '');
            }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="">-- Selecciona un Proyecto --</option>
            {proyectos.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedProject ? (
        <Card className="p-8 text-center border-slate-800">
          <Wallet className="text-slate-600 mx-auto mb-3" size={48} />
          <h3 className="text-white font-bold text-base mb-1">Ningún Proyecto Seleccionado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Selecciona un proyecto arriba a la derecha para ver su presupuesto, registrar boletas y realizar auditorías.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-5 border-slate-800">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Estado del Presupuesto</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Presupuesto Asignado:</span>
                  {editingBudget ? (
                    <form onSubmit={handleUpdateBudget} className="flex gap-2">
                      <input 
                        type="number" 
                        value={newBudget} 
                        onChange={e => setNewBudget(e.target.value)} 
                        className="w-24 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white text-right font-mono outline-none"
                        required
                        min="0"
                      />
                      <Button type="submit" variant="primary" className="py-0.5 px-2 text-[10px]" disabled={submitting}>Guardar</Button>
                      <button type="button" onClick={() => setEditingBudget(false)} className="text-[10px] text-slate-500 hover:text-white">X</button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white font-black text-sm">${budget.toLocaleString('es-CL')}</span>
                      {canManageBudget && (
                        <button 
                          onClick={() => { setEditingBudget(true); setNewBudget(budget); }} 
                          className="text-[10px] text-emerald-500 hover:underline font-bold"
                        >
                          (Editar)
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Total Gastado:</span>
                  <span className="font-mono text-white font-bold text-sm">${totalSpent.toLocaleString('es-CL')}</span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-800 pt-3">
                  <span className="text-xs text-slate-400">Saldo Disponible:</span>
                  <span className={`font-mono font-black text-sm ${remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {remaining < 0 ? '-' : ''}${Math.abs(remaining).toLocaleString('es-CL')}
                  </span>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>CONSUMIDO</span>
                    <span className={percentUsed > 100 ? 'text-red-400 animate-pulse' : 'text-slate-400'}>{percentUsed}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentUsed >= 100 ? 'bg-red-500 shadow-md shadow-red-950/20' :
                        percentUsed >= 85 ? 'bg-amber-500' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(percentUsed, 100)}%` }}
                    ></div>
                  </div>
                  {remaining < 0 && (
                    <div className="mt-2.5 bg-red-500/10 border border-red-500/30 text-red-400 p-2 rounded-lg text-[10px] leading-relaxed flex items-start gap-1.5">
                      <AlertCircle size={12} className="shrink-0 mt-0.5" />
                      <span><b>Alerta:</b> El total gastado supera el presupuesto establecido para este proyecto.</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-5 border-slate-800">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Registrar Nuevo Gasto</h2>
              
              <form onSubmit={handleAddExpense} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Concepto / Detalle *</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Combustible o Almuerzo Crew"
                    value={newExpense.concepto}
                    onChange={e => setNewExpense({...newExpense, concepto: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-emerald-500 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Monto ($) *</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      value={newExpense.monto}
                      onChange={e => setNewExpense({...newExpense, monto: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white text-right font-mono focus:border-emerald-500 outline-none"
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Fecha *</label>
                    <input 
                      type="date" 
                      value={newExpense.fecha}
                      onChange={e => setNewExpense({...newExpense, fecha: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-emerald-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Categoría</label>
                  <select 
                    value={newExpense.categoria}
                    onChange={e => setNewExpense({...newExpense, categoria: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="Logística/Transporte">Logística/Transporte</option>
                    <option value="Catering/Comida">Catering/Comida</option>
                    <option value="Alojamiento/Hoteles">Alojamiento/Hoteles</option>
                    <option value="Técnica/Equipos">Técnica/Equipos</option>
                    <option value="Merchandising/Uniformes">Merchandising/Uniformes</option>
                    <option value="Gastos Varios">Gastos Varios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Comprobante de Pago (Foto boleta)</label>
                  <input 
                    type="file" 
                    id="receipt-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-slate-400 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 file:cursor-pointer outline-none bg-slate-950 p-2 rounded-lg border border-slate-800"
                  />
                  {newExpense.comprobante && (
                    <div className="mt-2.5 relative inline-block">
                      <img src={newExpense.comprobante} alt="Preview Boleta" className="h-16 w-auto rounded border border-slate-700 object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setNewExpense(prev => ({ ...prev, comprobante: '' }))}
                        className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-black hover:bg-red-500 border border-slate-950"
                      >
                        x
                      </button>
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full py-2.5 mt-2 flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="animate-spin" size={14}/> : <Plus size={14}/>} Registrar Gasto
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5 border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-white font-bold text-sm">Detalle de Gastos del Proyecto</h3>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Historial de Boletas e Informes</p>
                </div>
                <div className="text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg font-mono text-slate-400">
                  Total Registros: {projectExpenses.length}
                </div>
              </div>

              {projectExpenses.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="mx-auto text-slate-700 mb-2" size={32} />
                  <p className="text-xs">No hay gastos registrados en este proyecto aún.</p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                        <th className="py-2.5 px-3">Fecha</th>
                        <th className="py-2.5 px-3">Concepto / Detalle</th>
                        <th className="py-2.5 px-3">Categoría</th>
                        <th className="py-2.5 px-3">Registrado Por</th>
                        <th className="py-2.5 px-3 text-center">Boleta</th>
                        <th className="py-2.5 px-3 text-right">Monto</th>
                        <th className="py-2.5 px-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {projectExpenses.map(g => (
                        <tr key={g.id} className="hover:bg-slate-900/40 text-slate-300">
                          <td className="py-3 px-3 font-mono text-slate-400">{g.fecha}</td>
                          <td className="py-3 px-3 font-bold text-white max-w-[180px] truncate" title={g.concepto}>{g.concepto}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-400">
                              {g.categoria}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-400 max-w-[120px] truncate" title={g.registradoPor}>{g.registradoPor.split('@')[0]}</td>
                          <td className="py-3 px-3 text-center">
                            {g.comprobante ? (
                              <button 
                                onClick={() => setViewingReceipt(g.comprobante)}
                                className="text-emerald-400 hover:text-emerald-300 text-xs inline-flex items-center gap-1 font-bold underline"
                              >
                                <ImageIcon size={14} /> Ver
                              </button>
                            ) : (
                              <span className="text-slate-600 text-[10px]">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-white">${g.monto.toLocaleString('es-CL')}</td>
                          <td className="py-3 px-3 text-center">
                            <button 
                              onClick={() => requestConfirm("¿Eliminar este gasto de forma permanente?", () => handleDeleteExpense(g.id))}
                              className="text-red-500 hover:text-red-400 p-1"
                              title="Eliminar registro"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {viewingReceipt && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-fade-in print:hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-4 relative flex flex-col items-center">
            <button 
              onClick={() => setViewingReceipt(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white font-bold p-1 bg-slate-950/80 rounded-full"
            >
              <X size={18} />
            </button>
            <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wider self-start flex items-center gap-1.5"><ImageIcon size={16} className="text-emerald-500"/> Comprobante del Gasto</h3>
            <img src={viewingReceipt} alt="Comprobante Boleta" className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain border border-slate-800 bg-slate-950" />
            <div className="mt-4 flex gap-3 w-full">
              <a 
                href={viewingReceipt} 
                download={`comprobante_gasto.jpg`} 
                className="flex-1 bg-slate-800 border border-slate-700 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 hover:bg-slate-700 transition-colors"
              >
                Descargar Imagen
              </a>
              <Button 
                variant="primary" 
                onClick={() => setViewingReceipt(null)}
                className="flex-1 py-2 text-xs font-bold"
              >
                Cerrar Vista
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- VISTAS PRINCIPALES ---
const Dashboard = ({ currentUser, setCurrentView, setSelectedProject, showToast, directory }) => {
  const canCreate = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role) || (currentUser.permisos || []).includes('PROJECTS_MANAGE');
  const canAssignTeam = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role) || (currentUser.permisos || []).includes('PROJECT_ASSIGN');
  const canStatusProject = [ROLES.ADMIN, ROLES.MANAGER].includes(currentUser.role) || (currentUser.permisos || []).includes('PROJECT_STATUS');
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Gira Musical' });
  const [assigningProject, setAssigningProject] = useState(null);

  const fetchProyectos = async (force = false, isBackground = false) => {
    if (!isBackground) setLoading(true);
    setFetchError(false);
    
    if (!force && CACHE.proyectos) {
       setProyectos(CACHE.proyectos);
       if (!isBackground) setLoading(false);
       return;
    }
    try {
      const res = await apiFetch('getProyectos');
      if (res.status === 'success') {
        const parsed = res.data.map(p => ({ ...p, asignados: Array.isArray(p.asignados) ? p.asignados : [] }));
        
        // Notificación de nueva asignación en background
        if (isBackground) {
           const myOldCount = CACHE.proyectos ? CACHE.proyectos.filter(p => p.asignados.includes(currentUser.email)).length : 0;
           const myNewCount = parsed.filter(p => p.asignados.includes(currentUser.email)).length;
           if (myNewCount > myOldCount) showToast("🎫 ¡Tienes una nueva asignación de Proyecto!");
        }

        CACHE.proyectos = parsed;
        setProyectos(parsed);
      }
      else if(!isBackground) setFetchError(res.message || "Error al obtener proyectos");
    } catch (e) { if(!isBackground) setFetchError("No se pudo conectar al servidor."); }
    if (!isBackground) setLoading(false);
  };

  useEffect(() => { 
    fetchProyectos(); 
    const interval = setInterval(() => fetchProyectos(true, true), 30000);
    return () => clearInterval(interval);
  }, []);

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
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <NotificationsButton currentUser={currentUser} />
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
          <div className="text-center p-12 border border-slate-800 border-dashed rounded-xl bg-slate-900/50 mt-6">
             <Navigation className="mx-auto text-slate-600 mb-4" size={48} />
             <p className="text-slate-400 text-sm max-w-md mx-auto">No tienes proyectos asignados en este momento. Cuando Producción te incluya en una gira, aparecerá aquí automáticamente.</p>
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
                  <div className="p-4">
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
                      {canAssignTeam && (
                        <Button variant="ghost" className="w-full bg-slate-900 border border-slate-700 hover:text-white text-[10px] md:text-xs py-1.5 mb-1" icon={Users} onClick={(e) => { e.stopPropagation(); setAssigningProject(proyecto); }}>
                          Asignar Equipo ({proyecto.asignados.length})
                        </Button>
                      )}
                      {canStatusProject && (
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

const ProjectDetailsView = ({ currentUser, setCurrentView, selectedProject, showToast, requestConfirm }) => {
  const p = selectedProject;
  const canManage = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role) || (currentUser.permisos || []).includes('PROJECTS_MANAGE');
  const canSeeRiders = (currentUser.permisos || []).includes('RIDERS') || 
                        (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TEC_JEFE, ROLES.JEFE_CAT_APV].includes(currentUser.role));
  const canSeeTransport = (currentUser.permisos || []).includes('TRANSPORT') || 
                           (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TRASLADO].includes(currentUser.role));
  const canSeeHitos = (currentUser.permisos || []).includes('HITOS') || 
                       (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TEC_JEFE, ROLES.JEFE_CAT_APV].includes(currentUser.role));
  const canManageHitos = (currentUser.permisos || []).includes('HITOS_MANAGE') || 
                          (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role));
  
  const [hitos, setHitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ title: '', location: '', date: '', time: '' });
  const [assigningHito, setAssigningHito] = useState(null);
  const [directory, setDirectory] = useState([]);

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
    setHitos(parsedEvents.sort((a,b) => a.fullDate.getTime() - b.fullDate.getTime()));
  };

  const fetchHitos = async (force = false, isBackground = false) => {
    if (!isBackground) setLoading(true);
    setFetchError(false);
    
    if (!force && CACHE.hitos) { processHitos(CACHE.hitos); if (!isBackground) setLoading(false); return; }
    try {
      const res = await apiFetch('getHitos');
      if (res.status === 'success') { 
        if (isBackground) {
           const myOldHitos = CACHE.hitos ? CACHE.hitos.filter(h => String(h.proyectoId) === String(p.id) && h.asignados?.includes(currentUser.email)).length : 0;
           const myNewHitos = res.data.filter(h => String(h.proyectoId) === String(p.id) && h.asignados?.includes(currentUser.email)).length;
           if (myNewHitos > myOldHitos) showToast("⏱️ ¡Tienes un nuevo Hito asignado!");
        }
        CACHE.hitos = res.data; 
        processHitos(res.data); 
      } 
      else if(!isBackground) setFetchError(res.message || "Error al obtener hitos");
    } catch(e) { if(!isBackground) setFetchError("Fallo de red al obtener hitos."); }
    if (!isBackground) setLoading(false);
  };

  useEffect(() => { 
    fetchHitos(); 
    if (CACHE.usuarios) setDirectory(CACHE.usuarios.filter(u => u.status === 'ACTIVO'));
    const interval = setInterval(() => { fetchHitos(true, true); }, 30000);
    return () => clearInterval(interval);
  }, [p]);

  if (!p) return <div className="text-center p-8"><Button onClick={() => setCurrentView('DASHBOARD')}>Volver a Proyectos</Button></div>;

  const firstHito = hitos.length > 0 ? hitos[0] : null;
  let projectDateStr = "Sin hitos programados";
  let showClock = false;

  if (firstHito && firstHito.fullDate && firstHito.fullDate.getTime() !== 0) {
    const fd = firstHito.fullDate;
    projectDateStr = `${String(fd.getDate()).padStart(2, '0')}/${String(fd.getMonth() + 1).padStart(2, '0')}/${fd.getFullYear()}`;
    
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

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-24 max-w-7xl mx-auto">
      <button onClick={() => setCurrentView('DASHBOARD')} className="flex items-center gap-1.5 text-xs md:text-sm text-slate-400 hover:text-white transition-colors mb-2"><ChevronLeft size={16}/> Volver a Proyectos</button>
      
      <header className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start gap-4 w-full">
        <div>
          <span className="text-[9px] md:text-[10px] bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700 uppercase font-bold tracking-wider mb-1.5 inline-block">VISTA PROYECTO</span>
          <h1 className="text-xl md:text-3xl font-black text-white leading-tight">{p.name}</h1>
          <div className="mt-1.5 space-y-1">
            <p className="text-xs md:text-sm text-slate-300 flex items-center gap-1.5"><Calendar size={12}/> Inicio: {projectDateStr}</p>
            <p className="text-xs md:text-sm text-slate-400 flex items-center gap-1.5"><User size={12}/> Liderado por: {p.manager}</p>
          </div>
        </div>
        <div className="shrink-0 pt-2">
          <NotificationsButton currentUser={currentUser} />
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* LADO IZQUIERDO: MÓDULOS Y TIMING */}
        <div className="flex-1 w-full space-y-6">
            
            {/* --- MÓDULOS DEL PROYECTO (TARJETAS COMPACTAS) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {canSeeRiders && (
                  <Card onClick={() => setCurrentView('RIDERS')} className="p-3 flex items-center gap-3 group cursor-pointer hover:border-emerald-500 transition-all">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <FileText className="text-emerald-500" size={24} />
                      </div>
                      <div className="text-left">
                          <h3 className="font-bold text-white text-base leading-tight">Riders Técnicos</h3>
                          <p className="text-[10px] md:text-xs text-slate-400 mt-0.5">Stageplots y Requerimientos</p>
                      </div>
                  </Card>
                )}

                {canSeeTransport && (
                  <Card onClick={() => setCurrentView('TRANSPORT')} className="p-3 flex items-center gap-3 group cursor-pointer hover:border-blue-500 transition-all">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Truck className="text-blue-500" size={24} />
                      </div>
                      <div className="text-left">
                          <h3 className="font-bold text-white text-base leading-tight">Transportes</h3>
                          <p className="text-[10px] md:text-xs text-slate-400 mt-0.5">Logística y Rutas</p>
                      </div>
                  </Card>
                )}
            </div>

            {/* --- SECCIÓN TIMING (LINEA DE TIEMPO) --- */}
            {!canSeeHitos ? (
              <Card className="p-5 border-slate-800 text-center text-slate-500 text-xs">
                <Clock className="mx-auto text-slate-700 mb-2" size={24} />
                No tienes permisos para visualizar el timing o timeline de este proyecto.
              </Card>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 md:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3 border-b border-slate-700/50 pb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2"><Clock className="text-emerald-500" size={20}/> Run of Show / Timing</h2>
                    {showClock && (
                      <div className="bg-slate-900 border border-slate-700 px-3 py-1 rounded flex items-center gap-2 shadow-inner">
                        <Timer className="text-emerald-500 animate-pulse" size={14} />
                        <LiveClock />
                      </div>
                    )}
                  </div>
                  {canManageHitos && !isCreating && <Button icon={Plus} className="py-1.5 px-3 text-xs" onClick={() => setIsCreating(true)}>Agregar Hito</Button>}
                </div>

              {isCreating && (
                <Card className="p-4 md:p-5 border-emerald-500 mb-6 bg-slate-900 shadow-xl">
                  <h2 className="text-base font-bold text-white mb-3">Agendar Nuevo Hito</h2>
                  <form onSubmit={handleCreateHito} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Título del Hito</label>
                        <input list="hitos-list" required className="w-full bg-slate-950 border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-emerald-500" placeholder="Ej: Soundcheck, Load In..." value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
                        <datalist id="hitos-list"><option value="Load In (Montaje)" /><option value="Soundcheck (Prueba de Sonido)" /><option value="Puertas (Apertura al público)" /><option value="Show Telonero" /><option value="Show Principal" /><option value="Load Out (Desmontaje)" /></datalist>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Ubicación / Locación</label>
                        <div className="flex items-center gap-2 w-full">
                          <div className="flex-1 min-w-0">
                            <AddressAutocomplete 
                              required 
                              value={form.location} 
                              onChange={val => setForm({...form, location: val})} 
                              placeholder="Buscar dirección o recinto..." 
                              className="w-full bg-slate-950 border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-emerald-500" 
                            />
                          </div>
                          <Button type="button" variant="secondary" icon={MapPin} onClick={captureGPS} title="Usar GPS" className="px-3 py-2 text-xs" />
                        </div>
                      </div>
                      <div><label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Fecha</label><input required type="date" className="w-full bg-slate-950 border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-emerald-500" onChange={e=>setForm({...form, date: e.target.value})} /></div>
                      <div><label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Hora</label><input required type="time" className="w-full bg-slate-950 border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-emerald-500" onChange={e=>setForm({...form, time: e.target.value})} /></div>
                    </div>
                    <div className="flex gap-2 pt-1"><Button variant="secondary" className="flex-1 py-2" onClick={()=>setIsCreating(false)}>Cancelar</Button><Button type="submit" className="flex-1 py-2">Guardar Hito</Button></div>
                  </form>
                </Card>
              )}

              {fetchError ? (
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-400 flex items-center gap-3"><AlertCircle size={20} /> {fetchError}</div>
              ) : loading && hitos.length === 0 ? (
                <div className="flex justify-center p-6"><Loader2 className="animate-spin text-emerald-500" size={24}/></div>
              ) : hitos.length === 0 ? (
                <div className="text-center p-8 border border-slate-800 border-dashed rounded-xl bg-slate-900/50">
                  <CalendarPlus className="mx-auto text-slate-600 mb-3" size={32} />
                  <p className="text-slate-400 text-xs md:text-sm max-w-md mx-auto">Aún no hay hitos en el timing de este proyecto.</p>
                </div>
              ) : (
                <div className="relative before:absolute before:inset-y-0 before:left-[5px] md:before:left-[9px] before:w-0.5 before:bg-slate-800 ml-1 md:ml-0 space-y-4">
                  {hitos.map((event) => (
                    <EventCard 
                       key={event.id} 
                       event={event} 
                       canManage={canManageHitos} 
                       handleDeleteHito={handleDeleteHito} 
                       setAssigningHito={setAssigningHito} 
                       currentUser={currentUser} 
                       requestConfirm={requestConfirm} 
                    />
                  ))}
                </div>
              )}
            </div>
            )}
        </div>

        {/* LADO DERECHO: SIDEBAR ANUNCIOS */}
        <div className="w-full lg:w-80 shrink-0 sticky top-6">
           <ProjectChatSidebar currentUser={currentUser} selectedProject={selectedProject} showToast={showToast} />
        </div>

      </div>

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
    </div>
  );
};

const RidersView = ({ currentUser, showToast, requestConfirm, activeRider, setActiveRider, directory, selectedProject, setCurrentView }) => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [viewMode, setViewMode] = useState(activeRider ? 'DETAIL' : 'LIST');
  const [editTab, setEditTab] = useState('GENERAL');
  const [allHitos, setAllHitos] = useState([]);
  const [includeTiming, setIncludeTiming] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [linkingRider, setLinkingRider] = useState(false);
  
  const canSeeRiders = (currentUser.permisos || []).includes('RIDERS') || 
                        (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TEC_JEFE, ROLES.JEFE_CAT_APV].includes(currentUser.role));
  const canManageRiders = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TEC_JEFE, ROLES.JEFE_CAT_APV].includes(currentUser.role) || (currentUser.permisos || []).includes('RIDERS_MANAGE');
  const canDeleteRiders = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role) || (currentUser.permisos || []).includes('RIDERS_MANAGE');
  const canManageProjects = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role) || (currentUser.permisos || []).includes('PROJECTS_MANAGE');

  if (!canSeeRiders) {
    return (
      <div className="p-8 text-center text-red-500 font-bold border border-red-500/20 bg-red-500/5 rounded-xl">
        Acceso Denegado: No tienes privilegios para ver la sección de Riders Técnicos.
      </div>
    );
  }

  const defaultContent = {
    proyectoId: selectedProject ? selectedProject.id : '',
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

  const fetchData = async (force = false, isBackground = false) => {
    if (!isBackground) setLoading(true);
    setFetchError(false);
    try {
      let rd = CACHE.riders, hd = CACHE.hitos;
      
      if (force || !rd) { const res = await apiFetch('getRiders'); if(res.status==='success') { rd = res.data; CACHE.riders = rd; } }
      if (force || !hd) { const res = await apiFetch('getHitos'); if(res.status==='success') { hd = res.data; CACHE.hitos = hd; } }
      
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
    } catch(e) { if(!isBackground) setFetchError(true); }
    if (!isBackground) setLoading(false);
  };
  
  useEffect(() => { 
    if(selectedProject) fetchData(); 
    const interval = setInterval(() => fetchData(true, true), 30000);
    return () => clearInterval(interval);
  }, [selectedProject]);
  
  useEffect(() => {
    if (activeRider) setViewMode('DETAIL');
  }, [activeRider]);

  if (!selectedProject) return <div className="text-center p-8"><Button onClick={() => setCurrentView('DASHBOARD')}>Volver a Proyectos</Button></div>;

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const action = form.id ? 'updateRider' : 'createRider';
      const payloadToSave = { ...form, content: JSON.stringify({ ...form.content, proyectoId: selectedProject.id }) };
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

  const handleLinkRider = async (riderId) => {
    const riderToLink = riders.find(r => r.id === riderId);
    if(!riderToLink) return;
    const newContent = { ...riderToLink.content, proyectoId: selectedProject.id };
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
      clearCache('riders'); fetchData(true); 
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
      clearCache('riders'); fetchData(true);
    } catch(err) { 
      showToast("Error al desvincular."); 
      setLoading(false); 
    }
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
      .sort((a,b) => a.fullDate.getTime() - b.fullDate.getTime());
  };
  
  const riderHitos = getRiderHitos();
  const displayRider = (viewMode === 'EDIT' && isPreview) ? form : activeRider;

  const handlePrintRider = () => {
    const originalTitle = document.title;
    const safeProjectName = selectedProject.name.replace(/[^a-z0-9]/gi, '_');
    const safeRiderTitle = displayRider.title.replace(/[^a-z0-9]/gi, '_');
    document.title = `RIDER_${safeProjectName}_${safeRiderTitle}`;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 1000);
  };

  const visibleRiders = riders.filter(r => String(r.content.proyectoId) === String(selectedProject.id));

  return (
    <div className="space-y-4 animate-fade-in pb-24 max-w-5xl mx-auto print:m-0 print:p-0 print:w-full print:max-w-none">
      
      {/* HEADER PRINCIPAL */}
      <header className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 print:hidden">
        <div>
           {(!isPreview && viewMode === 'LIST') ? (
             <button onClick={() => setCurrentView('PROJECT_DETAILS')} className="flex items-center gap-1.5 text-xs md:text-sm text-slate-400 hover:text-white transition-colors mb-2"><ChevronLeft size={16}/> Volver a {selectedProject.name}</button>
           ) : (!isPreview && viewMode === 'DETAIL') && (
             <button onClick={() => { setViewMode('LIST'); setActiveRider(null); }} className="flex items-center gap-1.5 text-xs md:text-sm text-slate-400 hover:text-white transition-colors mb-2"><ChevronLeft size={16}/> Volver a Documentos</button>
           )}
           <h1 className="text-2xl font-black text-white flex items-center gap-2">
             <FileText className="text-emerald-500" size={24}/> 
             {viewMode === 'EDIT' && !isPreview ? 'Editor de Documento' : viewMode === 'EDIT' && isPreview ? 'Vista Previa de Documento' : 'Documentos Técnicos'}
           </h1>
           <p className="text-xs md:text-sm text-slate-400 mt-1">Especificaciones Oficiales para {selectedProject.name}.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {viewMode === 'LIST' && <NotificationsButton currentUser={currentUser} />}
          {viewMode === 'LIST' && <Button variant="ghost" icon={RefreshCw} onClick={() => fetchData(true)} className="px-2 border border-slate-700 hover:text-emerald-400 mr-1" title="Actualizar Documentos" />}
          {(viewMode === 'DETAIL' || isPreview) && riderHitos.length > 0 && (
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer print:hidden mr-2">
              <input type="checkbox" checked={includeTiming} onChange={e => setIncludeTiming(e.target.checked)} className="accent-emerald-500 rounded bg-slate-900 border-slate-700"/>
              <span>Incluir Timing en PDF</span>
            </label>
          )}
          {(viewMode === 'DETAIL' || isPreview) && <Button icon={Printer} variant="secondary" onClick={handlePrintRider} className="flex-1 sm:flex-none" title="Imprimir o Descargar en PDF">Imprimir PDF</Button>}
          {viewMode === 'DETAIL' && canManageRiders && <Button icon={Edit3} onClick={() => openEditor(activeRider)} className="flex-1 sm:flex-none">Editar</Button>}
          {viewMode === 'LIST' && canManageRiders && <Button icon={Link} onClick={() => setLinkingRider(true)} variant="secondary" className="flex-1 sm:flex-none">Vincular</Button>}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  <AutoResizeTextarea className="w-full bg-slate-900 border border-slate-700 rounded p-2 md:p-3 text-emerald-400 font-mono text-xs md:text-sm min-h-[60px] focus:border-emerald-500 outline-none" value={form.content.importante} onChange={e=>setForm({...form, content: {...prev.content, importante: e.target.value}})} placeholder="Información crucial..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                  <div className="p-3 md:p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5">
                    <h4 className="font-bold text-white text-xs md:text-sm mb-1.5">Contacto Management</h4>
                    <div><label className="text-[10px] text-slate-400 uppercase">Nombre y Apellidos</label><input className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs md:text-sm outline-none focus:border-emerald-500" value={form.content.contacto.mgmtNombre || ''} onChange={e=>setForm({...form, content: {...prev.content, contacto: {...prev.content.contacto, mgmtNombre: e.target.value}}})} placeholder="Ej: Juan Pérez" /></div>
                    <div><label className="text-[10px] text-slate-400 uppercase">Celular</label><input type="tel" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs md:text-sm outline-none focus:border-emerald-500" value={form.content.contacto.mgmtCel} onChange={e=>setForm({...form, content: {...prev.content, contacto: {...prev.content.contacto, mgmtCel: e.target.value.replace(/[^0-9+]/g, '')}}})} placeholder="+569..." /></div>
                    <div><label className="text-[10px] text-slate-400 uppercase">Correo</label><input className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs md:text-sm outline-none focus:border-emerald-500" value={form.content.contacto.mgmtCorreo} onChange={e=>setForm({...form, content: {...prev.content, contacto: {...prev.content.contacto, mgmtCorreo: e.target.value}}})} /></div>
                  </div>
                  <div className="p-3 md:p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5">
                    <h4 className="font-bold text-white text-xs md:text-sm mb-1.5">Contacto Producción</h4>
                    <div><label className="text-[10px] text-slate-400 uppercase">Nombre y Apellidos</label><input className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs md:text-sm outline-none focus:border-emerald-500" value={form.content.contacto.prodNombre || ''} onChange={e=>setForm({...form, content: {...prev.content, contacto: {...prev.content.contacto, prodNombre: e.target.value}}})} placeholder="Ej: Ana Rojas" /></div>
                    <div><label className="text-[10px] text-slate-400 uppercase">Celular</label><input type="tel" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs md:text-sm outline-none focus:border-emerald-500" value={form.content.contacto.prodCel} onChange={e=>setForm({...form, content: {...prev.content, contacto: {...prev.content.contacto, prodCel: e.target.value.replace(/[^0-9+]/g, '')}}})} placeholder="+569..."/></div>
                    <div><label className="text-[10px] text-slate-400 uppercase">Correo</label><input className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs md:text-sm outline-none focus:border-emerald-500" value={form.content.contacto.prodCorreo} onChange={e=>setForm({...form, content: {...prev.content, contacto: {...prev.content.contacto, prodCorreo: e.target.value}}})} /></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1.5"><label className="text-xs md:text-sm font-bold text-white block">Requerimientos de SoundCheck</label><Button variant="ghost" className="py-0.5 px-2 text-[10px]" icon={FileText} onClick={() => setForm(prev => ({...prev, content: {...prev.content, soundcheck: templatesTexto.soundcheck}}))}>Usar Plantilla</Button></div>
                  <AutoResizeTextarea className="w-full bg-slate-900 border border-slate-700 rounded p-2 md:p-3 text-emerald-400 font-mono text-xs md:text-sm min-h-[60px] focus:border-emerald-500 outline-none" value={form.content.soundcheck} onChange={e=>setForm({...form, content: {...prev.content, soundcheck: e.target.value}})} />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1.5"><label className="text-xs md:text-sm font-bold text-white block">Recordatorio Oficial</label><Button variant="ghost" className="py-0.5 px-2 text-[10px]" icon={FileText} onClick={() => setForm(prev => ({...prev, content: {...prev.content, recordatorio: templatesTexto.recordatorio}}))}>Usar Plantilla</Button></div>
                  <AutoResizeTextarea className="w-full bg-slate-900 border border-slate-700 rounded p-2 md:p-3 text-red-400 font-mono text-xs md:text-sm min-h-[60px] outline-none focus:border-red-500" value={form.content.recordatorio} onChange={e=>setForm({...form, content: {...prev.content, recordatorio: e.target.value}})} />
                </div>
              </div>
            )}

            {editTab === 'AUDIO' && activeTabs.includes('AUDIO') && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2"><h3 className="text-xs md:text-sm font-bold text-emerald-500">OUTPUT / MONITOR ({form.content.outputs.length}/100)</h3><Button variant="secondary" className="py-1 px-2.5 text-[10px]" icon={Plus} onClick={() => addRow('outputs', { mix: String(form.content.outputs.length + 1), player: '', monitor: '', obs: '' })}>Fila</Button></div>
                  <div className="overflow-x-auto rounded border border-slate-700 bg-slate-900">
                    <table className="w-full text-left text-xs md:text-sm text-slate-300 min-w-[500px]"><thead className="bg-slate-800 text-[10px] md:text-xs border-b border-slate-700"><tr><th className="p-1.5 md:p-2 w-16">MIX</th><th className="p-1.5 md:p-2">PLAYER</th><th className="p-1.5 md:p-2">MONITOR</th><th className="p-1.5 md:p-2">OBS</th><th className="p-1.5 md:p-2 w-10 text-center">X</th></tr></thead><tbody>{form.content.outputs.map((row, i) => (<tr key={i} className="border-b border-slate-800 last:border-0"><td className="p-1"><input type="text" inputMode="numeric" pattern="[0-9]*" className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.mix} onChange={e=>updateTable('outputs', i, 'mix', e.target.value.replace(/[^0-9]/g, ''))} /></td><td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.player} onChange={e=>updateTable('outputs', i, 'player', e.target.value)} /></td><td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.monitor} onChange={e=>updateTable('outputs', i, 'monitor', e.target.value)} /></td><td className="p-1"><AutoResizeTextarea className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.obs} onChange={e=>updateTable('outputs', i, 'obs', e.target.value)} /></td><td className="p-1 text-center"><button type="button" onClick={()=>removeRow('outputs', i)} className="text-red-500 p-1 hover:bg-red-500/20 rounded"><Trash2 size={12}/></button></td></tr>))}</tbody></table>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2"><h3 className="text-xs md:text-sm font-bold text-emerald-500">INPUT LIST ({form.content.inputs.length}/100)</h3><Button variant="secondary" className="py-1 px-2.5 text-[10px]" icon={Plus} onClick={() => addRow('inputs', { ch: String(form.content.inputs.length + 1), name: '', mic: '', v48: '', stand: '', position: '', obs: '' })}>Fila</Button></div>
                  <div className="overflow-x-auto rounded border border-slate-700 bg-slate-900">
                    <table className="w-full text-left text-xs md:text-sm text-slate-300 min-w-[700px]"><thead className="bg-slate-800 text-[10px] md:text-xs border-b border-slate-700"><tr><th className="p-1.5 md:p-2 w-12">CH</th><th className="p-1.5 md:p-2">NAME</th><th className="p-1.5 md:p-2">MIC/DI</th><th className="p-1.5 md:p-2 w-16">48v</th><th className="p-1.5 md:p-2">STAND</th><th className="p-1.5 md:p-2">POSITION</th><th className="p-1.5 md:p-2">OBS</th><th className="p-1.5 md:p-2 w-10 text-center">X</th></tr></thead><tbody>{form.content.inputs.map((row, i) => (<tr key={i} className="border-b border-slate-800 last:border-0"><td className="p-1"><input type="text" inputMode="numeric" pattern="[0-9]*" className="w-full bg-transparent border border-slate-700 rounded p-1 text-center outline-none focus:border-emerald-500 text-xs" value={row.ch} onChange={e=>updateTable('inputs', i, 'ch', e.target.value.replace(/[^0-9]/g, ''))} /></td><td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.name} onChange={e=>updateTable('inputs', i, 'name', e.target.value)} /></td><td className="p-1"><MicDiSelect value={row.mic} onChange={val=>updateTable('inputs', i, 'mic', val)} /></td><td className="p-1"><select className="w-full bg-transparent border border-slate-700 rounded p-1 text-center outline-none focus:border-emerald-500 text-xs" value={row.v48} onChange={e=>updateTable('inputs', i, 'v48', e.target.value)}><option value=""></option><option value="SI">SI</option><option value="NO">NO</option></select></td><td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.stand} onChange={e=>updateTable('inputs', i, 'stand', e.target.value)} /></td><td className="p-1"><input className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.position} onChange={e=>updateTable('inputs', i, 'position', e.target.value)} /></td><td className="p-1"><AutoResizeTextarea className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" value={row.obs} onChange={e=>updateTable('inputs', i, 'obs', e.target.value)} /></td><td className="p-1 text-center"><button type="button" onClick={()=>removeRow('inputs', i)} className="text-red-500 p-1 hover:bg-red-500/20 rounded"><Trash2 size={12}/></button></td></tr>))}</tbody></table>
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
                          <td className="p-1"><input type="text" inputMode="numeric" pattern="[0-9]*" className="w-full bg-transparent border border-slate-700 rounded p-1 text-center outline-none focus:border-emerald-500 text-xs" value={row.col2} onChange={e=>updateTable('backline', i, 'col2', e.target.value.replace(/[^0-9]/g, ''))} /></td>
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
                          <td className="p-1"><input type="text" inputMode="numeric" pattern="[0-9]*" className="w-full bg-transparent border border-slate-700 rounded p-1 text-center outline-none focus:border-emerald-500 text-xs" value={row.col2} onChange={e=>updateTable('visuals', i, 'col2', e.target.value.replace(/[^0-9]/g, ''))} /></td>
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
                    <input type="checkbox" checked={form.content.catering.showSizes} onChange={e => setForm({...form, content: {...prev.content, catering: {...prev.content.catering, showSizes: e.target.checked}}})} className="accent-emerald-500 rounded bg-slate-900 border-slate-700"/>
                    <span>Incluir Tallaje (Merch/Uniformes)</span>
                  </label>
                </div>
                
                <div>
                  <label className="text-[10px] md:text-xs font-bold text-slate-400 block mb-1 uppercase">Requerimientos Específicos / Camarines</label>
                  <AutoResizeTextarea className="w-full bg-slate-900 border border-slate-700 rounded p-2 md:p-3 text-white text-xs md:text-sm min-h-[60px] outline-none focus:border-emerald-500" value={form.content.catering.notes} onChange={e=>setForm({...form, content: {...prev.content, catering: {...prev.content.catering, notes: e.target.value}}})} placeholder="Ej: Espejo de cuerpo entero, 12 toallas negras, agua sin gas..." />
                </div>

                <div className="space-y-2 mt-4">
                  <label className="text-[10px] md:text-xs font-bold text-slate-400 block uppercase">Añadir Tablas de Requerimientos y Extras</label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {CATERING_SECTIONS.map(sec => (
                      <Button key={sec} type="button" variant="secondary" onClick={() => addCateringTable(sec)} className="py-1 px-2 text-[10px]" icon={Plus}>{sec}</Button>
                    ))}
                    <div className="flex flex-col gap-1 items-start ml-2">
                      <Button type="button" variant={form.content.catering.showCatEquipo ? 'primary' : 'secondary'} onClick={() => setForm({...form, content: {...prev.content, catering: {...prev.content.catering, showCatEquipo: !form.content.catering.showCatEquipo}}})} className="py-1.5 px-3 text-[10px]" icon={form.content.catering.showCatEquipo ? X : Plus}>
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

                {/* Tabla de Crew y Dietas Automática */}
                {form.content.catering.showCatEquipo && (() => {
                  if(!form.content.proyectoId) return <div className="p-4 border border-slate-800 border-dashed rounded-xl text-center text-xs text-slate-500 mt-6">⚠️ Vincula este Rider a un Proyecto en la pestaña GENERAL para ver el Crew.</div>;
                  
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
                                  <th className="p-2 pl-3">Nombre / Rol</th>
                                  <th className="p-2">Dieta</th>
                                  {form.content.catering.showSizes && <th className="p-2">Talla</th>}
                               </tr>
                            </thead>
                            <tbody>
                               {assignedCrew.map(u => (
                                  <tr key={u.email} className="border-b border-slate-800 last:border-0">
                                     <td className="p-2 pl-3">
                                        <div className="font-bold text-white">{u.name}</div>
                                        <div className="text-[9px] text-slate-400 uppercase mt-0.5">{u.role}</div>
                                     </td>
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
                   {canDeleteRiders && <Button variant="danger" className="px-2.5 py-1.5 bg-slate-800" icon={Trash2} onClick={() => requestConfirm("¿Eliminar este Rider permanentemente?", () => handleDelete(displayRider.id))}></Button>}
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
                                      <th className="p-2 pl-3 border-r border-slate-700 print:border-black last:border-0">Nombre / Rol</th>
                                      <th className="p-2 border-r border-slate-700 print:border-black last:border-0">Dieta</th>
                                      {displayRider.content.catering.showSizes && <th className="p-2">Talla</th>}
                                   </tr>
                                </thead>
                                <tbody>
                                   {assignedCrew.map(u => (
                                      <tr key={u.email} className="border-b border-slate-800 print:border-black last:border-0">
                                         <td className="p-2 pl-3 border-r border-slate-800 print:border-black">
                                            <div className="font-bold text-white print:text-black">{u.name}</div>
                                            <div className="text-[9px] text-slate-400 print:text-slate-600 uppercase mt-0.5">{u.role}</div>
                                         </td>
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
                               <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.location)}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 print:text-black hover:underline">{h.location}</a>
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
          ) : loading && visibleRiders.length === 0 ? (
            <div className="flex justify-center p-8 print:hidden"><Loader2 className="animate-spin text-emerald-500" size={28}/></div>
          ) : visibleRiders.length === 0 ? (
            <div className="text-center p-8 border border-slate-800 border-dashed rounded-xl text-slate-500 text-sm print:hidden">No tienes Riders asignados para visualizar.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 print:hidden">
              {visibleRiders.map((r) => {
                const IconType = icons[r.type] || FileText;
                return (
                  <Card key={r.id} onClick={() => setActiveRider(r)} className="p-3 md:p-4 group cursor-pointer hover:border-emerald-500 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/20"><IconType className="text-emerald-500" size={20} /></div>
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded block w-fit text-emerald-500 bg-emerald-500/10">{r.type}</span>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-white leading-tight mb-1.5">{r.title}</h3>
                    <p className="text-[10px] md:text-xs text-slate-400 flex items-center gap-1.5">
                      <Link size={12}/> {selectedProject.name}
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
      try {
        let users = CACHE.usuarios;
        if (force || !users) {
          const res = await apiFetch('getUsuarios');
          if (res.status === 'success') { users = res.data; CACHE.usuarios = users; }
          else { users = []; }
        }
        
        let projs = CACHE.proyectos;
        if (force || !projs) {
          const resP = await apiFetch('getProyectos');
          if (resP.status === 'success') { 
            projs = resP.data.map(p => ({ ...p, asignados: Array.isArray(p.asignados) ? p.asignados : [] })); 
            CACHE.proyectos = projs; 
          } else { projs = []; }
        }

        const activeUsers = users.filter(u => u.status === 'ACTIVO' && u.email !== currentUser.email);
        const canSeeEveryone = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TEC_JEFE, ROLES.JEFE_CAT_APV, ROLES.APV].includes(currentUser.role);
        
        let visibleEmails = new Set();
        if (!canSeeEveryone) {
           projs.forEach(p => {
              if (p.asignados.includes(currentUser.email)) {
                 p.asignados.forEach(e => visibleEmails.add(e));
              }
           });
           setLocalDirectory(activeUsers.filter(u => visibleEmails.has(u.email)));
        } else {
           setLocalDirectory(activeUsers);
        }
      } catch(e) { setFetchError(true); }
      setLoading(false);
    };
    fetchDirectory();
  }, [currentUser]);

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-24 max-w-5xl mx-auto print:m-0 print:p-0 print:w-full">
      <header className="border-b border-slate-800 pb-3 md:pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2 md:gap-3"><Users className="text-emerald-500" size={24} /> Directorio</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">{[ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role) ? 'Lista del personal activo.' : 'Contactos asignados.'}</p>
        </div>
      </header>

      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 md:p-6 mb-6 print:border-black print:bg-white print:text-black hidden print:block">
          <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-slate-800 print:border-black pb-3 md:pb-4">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2"><Utensils className="text-amber-500 print:text-black"/> Reporte Catering (APV)</h2>
            <Button variant="secondary" icon={Printer} className="print:hidden py-1.5 px-3 text-xs" onClick={() => {
              const originalTitle = document.title;
              document.title = `Reporte_Catering_${new Date().toLocaleDateString().replace(/\//g, '-')}`;
              window.print();
              setTimeout(() => { document.title = originalTitle; }, 1000);
            }}>Imprimir PDF</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <h3 className="text-[10px] md:text-xs font-bold text-slate-400 print:text-black mb-2 uppercase tracking-wider">Detalle de Asignación</h3>
               <div className="overflow-y-auto max-h-[300px] print:max-h-none border border-slate-700 print:border-black rounded-lg custom-scrollbar bg-slate-800 print:bg-transparent">
                 <table className="w-full text-left text-xs md:text-sm print:text-black">
                   <thead className="bg-slate-900 print:bg-gray-200 sticky top-0 border-b border-slate-700 print:border-black">
                     <tr><th className="p-2 pl-3">Nombre / Rol</th><th className="p-2">Dieta</th></tr>
                   </thead>
                   <tbody>
                      <tr className="border-b border-slate-700/50 print:border-black/50">
                        <td className="p-2 pl-3">
                          <div className="font-bold text-white print:text-black">{currentUser.name} (Tú)</div>
                          <div className="text-[9px] text-slate-400 print:text-slate-600 uppercase mt-0.5">{currentUser.role}</div>
                        </td>
                        <td className="p-2"><span className="text-[9px] md:text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/30 print:border-black print:text-black px-1.5 py-0.5 rounded font-black uppercase tracking-wider truncate block max-w-[100px] md:max-w-none">{currentUser.dieta || 'OMNÍVORA'}</span></td>
                      </tr>
                     {localDirectory.map(u => (
                       <tr key={u.email} className="border-b border-slate-700/50 print:border-black/50 last:border-0">
                         <td className="p-2 pl-3">
                           <div className="font-bold text-white print:text-black">{u.name}</div>
                           <div className="text-[9px] text-slate-400 print:text-slate-600 uppercase mt-0.5">{u.role}</div>
                         </td>
                         <td className="p-2"><span className="text-[9px] md:text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/30 print:border-black print:text-black px-1.5 py-0.5 rounded font-black uppercase tracking-wider truncate block max-w-[100px] md:max-w-none">{u.dieta || 'OMNÍVORA'}</span></td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        </div>

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
              <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-full bg-slate-700 text-white font-black flex items-center justify-center text-lg shrink-0">{user.name.charAt(0)}</div><div className="flex-1 min-w-0"><h3 className="font-bold text-white text-base md:text-lg truncate">{user.name}</h3><span className="text-[9px] md:text-[10px] bg-slate-900 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700 uppercase font-bold inline-block mt-0.5">{user.role}</span></div></div>
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

// --- CHAT GLOBAL Y POR PROYECTO (Conectado a la BD) ---
const ChatView = ({ currentUser, showToast, requestConfirm }) => {
  const [messages, setMessages] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  
  const canSendMessages = (currentUser.permisos || []).includes('CHAT_SEND') || 
    (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TEC_JEFE, ROLES.JEFE_CAT_APV, ROLES.APV].includes(currentUser.role));
  const canViewAllProjects = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchData = async (force = false, isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      // Cargar Proyectos
      let projData = CACHE.proyectos;
      if (force || !projData) {
        const resP = await apiFetch('getProyectos');
        if (resP.status === 'success') { 
          projData = resP.data.map(p => ({ ...p, asignados: Array.isArray(p.asignados) ? p.asignados : [] })); 
          CACHE.proyectos = projData; 
        }
      }
      if (projData) {
        const activeProjs = projData.filter(p => p.status === 'ACTIVO');
        setProyectos(canViewAllProjects ? activeProjs : activeProjs.filter(p => p.asignados.includes(currentUser.email)));
      }

      // Cargar Mensajes
      let msgData = CACHE.mensajes;
      if (force || !msgData) {
        const resM = await apiFetch('getMensajes');
        if (resM.status === 'success') {
          msgData = resM.data;
          CACHE.mensajes = msgData;
        }
      }
      if (msgData) {
        const isNew = CACHE.mensajes && CACHE.mensajes.length < msgData.length;
        setMessages(msgData);
        if (selectedProyecto && (!isBackground || isNew)) setTimeout(scrollToBottom, 100);
      }
    } catch (e) {
      if (!isBackground) showToast("Error al cargar datos del chat.");
    }
    if (!isBackground) setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true, true), 10000);
    return () => clearInterval(interval);
  }, [selectedProyecto]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !canSendMessages || !selectedProyecto) return;
    
    const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const tempId = Date.now();
    const newMsgObj = { id: tempId, proyectoId: selectedProyecto.id, sender: currentUser.name, role: currentUser.role, text: newMsg, time: timeStr, readBy: [] };
    
    setMessages([...messages, newMsgObj]); 
    setNewMsg('');
    setTimeout(scrollToBottom, 100);

    try {
      await apiFetch('sendMensaje', { proyectoId: selectedProyecto.id, sender: currentUser.name, role: currentUser.role, text: newMsgObj.text, time: timeStr });
      clearCache('mensajes');
      fetchData(true, true);
    } catch (e) {
      showToast("No se pudo enviar el mensaje.");
    }
  };

  const handleDeleteClick = (msgId) => {
    requestConfirm("¿Deseas ocultar este mensaje de la vista del chat? (Permanecerá registrado en la base de datos de producción)", async () => {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'OCULTO' } : m));
      try {
        await apiFetch('ocultarMensaje', { id: msgId });
        clearCache('mensajes');
      } catch (e) {
        showToast("Error al ocultar el mensaje.");
      }
    });
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

  // VISTA 1: LISTADO DE PROYECTOS (CANALES)
  if (!selectedProyecto) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 pb-24 animate-fade-in">
        <header className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2"><MessageSquare className="text-emerald-500" size={24}/> Anuncios de Gira</h1>
            <p className="text-sm text-slate-400">Selecciona un proyecto para ver los comunicados.</p>
          </div>
          <Button variant="ghost" icon={RefreshCw} onClick={() => fetchData(true)} className="px-2 border border-slate-700 hover:text-emerald-400" title="Actualizar" />
        </header>

        {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500" size={28}/></div> : proyectos.length === 0 ? (
          <div className="text-center p-12 border border-slate-800 border-dashed rounded-xl bg-slate-900/50">
             <MessageSquare className="mx-auto text-slate-600 mb-4" size={48} />
             <p className="text-slate-400 text-sm max-w-md mx-auto">No tienes proyectos asignados para visualizar anuncios.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proyectos.map(p => {
              const unreadCount = messages.filter(m => String(m.proyectoId) === String(p.id) && !m.readBy.includes(currentUser.name)).length;
              return (
                <Card key={p.id} onClick={() => { setSelectedProyecto(p); setTimeout(scrollToBottom, 100); }} className="p-4 flex flex-col justify-between cursor-pointer hover:border-emerald-500 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors"><MessageSquare className="text-emerald-500" size={24} /></div>
                      <div>
                        <h3 className="font-bold text-white text-lg leading-tight line-clamp-1">{p.name}</h3>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">{p.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold flex items-center gap-1.5"><Users size={14}/> {p.asignados.length} miembros</span>
                    {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">{unreadCount} Nuevos</span>}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    );
  }

  // VISTA 2: CHAT DEL PROYECTO
  const projectMsgs = messages.filter(m => {
    if (m.status === 'OCULTO') return false;
    if (m.proyectoId === undefined || m.proyectoId === null || m.proyectoId === '') {
      return true;
    }
    return String(m.proyectoId) === String(selectedProyecto.id);
  });

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-4rem)] max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg animate-fade-in">
      <header className="p-3 md:p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedProyecto(null)} className="text-slate-400 hover:text-white transition-colors p-1"><ChevronLeft size={20}/></button>
          <div>
            <h2 className="font-black text-white text-base md:text-lg leading-tight">{selectedProyecto.name}</h2>
            <p className="text-[10px] md:text-xs text-emerald-400 font-bold uppercase tracking-wider">Canal Oficial</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <NotificationsButton currentUser={currentUser} />
          <Button variant="ghost" className="text-slate-400 hover:text-emerald-400 p-1.5 md:p-2 border border-slate-700 rounded" onClick={() => fetchData(true)} title="Actualizar Chat"><RefreshCw size={14} className={loading ? "animate-spin text-emerald-500" : ""}/></Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 custom-scrollbar">
        {projectMsgs.length === 0 && !loading && <div className="text-center text-slate-500 mt-8 text-xs md:text-sm">No hay comunicados en esta gira.</div>}
        
        {projectMsgs.map(msg => {
          const isMe = msg.sender === currentUser.name;
          const hasRead = msg.readBy.includes(currentUser.name);
          const isAdmin = currentUser.role === ROLES.ADMIN;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-slide-up group relative`}>
              <div className={`flex flex-col mb-1 ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-1.5 font-sans">
                  <span className="text-[10px] md:text-xs font-bold text-slate-300">{msg.sender}</span>
                  <span className="text-[9px] text-slate-500">{msg.time}</span>
                </div>
                <span className="text-[9px] text-emerald-500 uppercase font-black leading-none mt-0.5">{msg.role}</span>
              </div>
              
              <div className="flex items-center gap-2 max-w-[85%] w-fit">
                {isMe && isAdmin && (
                  <button type="button" onClick={() => handleDeleteClick(msg.id)} className="text-slate-500 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" title="Ocultar comunicado (Solo Admin)">
                    <Trash2 size={12} />
                  </button>
                )}
                
                <div className={`p-2.5 md:p-3 rounded-xl text-xs md:text-sm shadow-sm ${isMe ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'}`}>{msg.text}</div>
                
                {!isMe && isAdmin && (
                  <button type="button" onClick={() => handleDeleteClick(msg.id)} className="text-slate-500 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" title="Ocultar comunicado (Solo Admin)">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

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
const AdminPanel = ({ currentUser, showToast, requestConfirm, refreshPendingCount }) => {
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
    { id: 'DASHBOARD', label: 'Ver Proyectos' },
    { id: 'PROJECTS_MANAGE', label: 'Gestionar Proyectos' },
    { id: 'RIDERS', label: 'Ver Riders' },
    { id: 'RIDERS_MANAGE', label: 'Gestionar Riders' },
    { id: 'TRANSPORT', label: 'Ver Transportes' },
    { id: 'TRANSPORT_MANAGE', label: 'Gestionar Transportes' },
    { id: 'CHAT', label: 'Ver Anuncios (Chat)' },
    { id: 'CHAT_SEND', label: 'Enviar Anuncios (Chat)' },
    { id: 'STAFF', label: 'Ver Directorio' },
    { id: 'ADMIN_PANEL', label: 'Acceso Admin Panel' },
    { id: 'EXPENSES', label: 'Ver Gastos y Registrar Boletas' },
    { id: 'EXPENSES_MANAGE', label: 'Gestionar Presupuestos (Admin/Manager)' }
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
        if (refreshPendingCount) refreshPendingCount();
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
        if (refreshPendingCount) refreshPendingCount();
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
        if (refreshPendingCount) refreshPendingCount();
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
          if (refreshPendingCount) refreshPendingCount();
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
        
        // Si el admin se edita a sí mismo, actualizar la sesión actual en vivo
        if (currentUser.email === editingUser.email) {
          setCurrentUser(prev => ({ ...prev, permisos: editingUser.permisos, role: editingUser.role, status: editingUser.status }));
        }

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

      {pendingUsers.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-pulse">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-500 shrink-0"><Bell size={20} /></div>
            <div>
              <h3 className="text-sm font-bold text-white">Solicitudes de Acceso Pendientes</h3>
              <p className="text-xs text-slate-400 font-medium">Hay {pendingUsers.length} solicitudes de técnicos o miembros del crew esperando aprobación.</p>
            </div>
          </div>
          <Button variant="primary" className="bg-amber-600 hover:bg-amber-500 text-white border-amber-500/50 py-1.5 px-3.5 self-end sm:self-center text-xs" onClick={() => setActiveTab('PENDIENTES')}>Revisar Ahora</Button>
        </div>
      )}

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
                      <div className="grid grid-cols-2 gap-2"><input type="tel" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-emerald-500" value={editingUser.phone} onChange={e=>setEditingUser({...editingUser, phone: e.target.value.replace(/[^0-9+]/g, '')})} /><select className="w-full max-w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-emerald-500 break-words" value={editingUser.role} onChange={e=>setEditingUser({...editingUser, role: e.target.value})}>{Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                      <select className="w-full max-w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-bold outline-none focus:border-emerald-500 break-words" value={editingUser.status} onChange={e=>setEditingUser({...editingUser, status: e.target.value})}><option value="ACTIVO">ACTIVO</option><option value="INACTIVO">BLOQUEADO</option></select>
                      
                      <div className="pt-2 mt-2 border-t border-slate-700">
                          <h4 className="text-[10px] uppercase text-slate-400 font-bold mb-3">Privilegios Detallados</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {MODULOS.map(mod => (
                              <ToggleSwitch 
                                key={mod.id}
                                label={mod.label}
                                checked={(editingUser.permisos || []).includes(mod.id)}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  setEditingUser(prev => {
                                    const currentPerms = prev.permisos || [];
                                    return {
                                      ...prev,
                                      permisos: isChecked 
                                        ? [...currentPerms, mod.id] 
                                        : currentPerms.filter(p => p !== mod.id)
                                    };
                                  });
                                }}
                              />
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
                <div className="grid grid-cols-2 gap-2"><div><label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Correo</label><input type="email" value={invEmail} onChange={e=>setInvEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500" required /></div><div><label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Teléfono</label><input type="tel" value={invPhone} onChange={e=>setInvPhone(e.target.value.replace(/[^0-9+]/g, ''))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500" required /></div></div>
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
const ProfileView = ({ currentUser, setCurrentUser, showToast, theme, setTheme, requestConfirm }) => {
  const [pPhone, setPPhone] = useState(currentUser.phone ? String(currentUser.phone) : '');
  const [pTalla, setPTalla] = useState(currentUser.talla || 'M');
  const [pDieta, setPDieta] = useState(currentUser.dieta || 'OMNÍVORA');
  
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [saving, setSaving] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if ((newPass || confirmPass || oldPass) && !(newPass && confirmPass && oldPass)) {
      return showToast("Para cambiar la contraseña, debes llenar los 3 campos de clave.");
    }
    if (newPass && newPass !== confirmPass) return showToast("Las nuevas contraseñas no coinciden.");

    setSaving(true);
    try {
      const trimmedPhone = String(pPhone).trim();
      const payload = { email: currentUser.email.trim(), phone: trimmedPhone, talla: pTalla, dieta: pDieta };
      if (newPass && oldPass) { payload.oldPassword = oldPass.trim(); payload.newPassword = newPass.trim(); }
      const res = await apiFetch('updateProfile', payload);
      if (res.status === 'success') {
        setCurrentUser({ ...currentUser, phone: trimmedPhone, talla: pTalla, dieta: pDieta });
        setOldPass(''); setNewPass(''); setConfirmPass('');
        showToast(newPass ? "¡Perfil y Contraseña actualizados!" : "¡Perfil actualizado!");
        clearCache('usuarios');
      } else { showToast(res.message); }
    } catch (err) { 
      console.error(err);
      showToast("Error al guardar."); 
    }
    setSaving(false);
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in pb-24">
      <header className="mb-4 md:mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2 md:gap-3">
          <User className="text-emerald-500" size={24}/> Mi Perfil
        </h1>
      </header>
      <Card className="p-4 md:p-6">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="pb-3 border-b border-slate-700">
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Nombre</label>
            <input type="text" value={currentUser.name} disabled className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-500 text-sm cursor-not-allowed" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Teléfono</label>
              <input type="tel" value={pPhone} onChange={e=>setPPhone(e.target.value.replace(/[^0-9+]/g, ''))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500" required />
            </div>
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
          
          <div className="pt-2">
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Aspecto Visual</label>
            <div className="flex gap-2">
              <Button type="button" variant={theme === 'dark' ? 'primary' : 'secondary'} className="flex-1 py-2" onClick={() => setTheme('dark')}>🌙 Oscuro</Button>
              <Button type="button" variant={theme === 'light' ? 'primary' : 'secondary'} className={`flex-1 py-2 ${theme === 'light' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-800 text-slate-300 border-slate-700'}`} onClick={() => setTheme('light')}>☀️ Claro</Button>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-2.5 flex gap-2.5 items-start mt-1">
            <Shield size={14} className="text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed font-bold">Datos usados solo para logística de producción.</p>
          </div>
          <div className="pt-3 border-t border-slate-700 mt-3 space-y-2.5">
            <h3 className="text-xs md:text-sm font-bold text-emerald-400 flex items-center gap-1.5"><Key size={14}/> Cambiar Contraseña (Opcional)</h3>
            
            <div className="relative">
              <input type={showOldPass ? "text" : "password"} placeholder="Contraseña Actual" value={oldPass} onChange={e=>setOldPass(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 pr-10 text-white text-sm outline-none focus:border-emerald-500" />
              <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">{showOldPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
            </div>
            
            <div className="relative">
              <input type={showNewPass ? "text" : "password"} placeholder="Nueva Contraseña" value={newPass} onChange={e=>setNewPass(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 pr-10 text-white text-sm outline-none focus:border-emerald-500" />
              <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">{showNewPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
            </div>
            
            <div className="relative">
              <input type={showConfirmPass ? "text" : "password"} placeholder="Confirmar Nueva Contraseña" value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} className={`w-full bg-slate-900 border rounded-lg p-2.5 pr-10 text-white text-sm outline-none ${confirmPass && newPass !== confirmPass ? 'border-red-500' : 'border-slate-700 focus:border-emerald-500'}`} />
              <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">{showConfirmPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
            </div>

            {confirmPass && newPass !== confirmPass && <p className="text-[10px] text-red-500 font-bold">Las contraseñas no coinciden</p>}
          </div>
          <Button type="submit" variant="primary" className="w-full py-3 mt-4" disabled={saving || (confirmPass && newPass !== confirmPass)}>{saving ? <Loader2 className="animate-spin"/> : 'Guardar Cambios'}</Button>
        </form>
        <div className="pt-4 border-t border-slate-700 mt-4">
          <Button variant="danger" className="w-full py-3 font-bold uppercase tracking-wider text-xs" icon={LogOut} onClick={() => requestConfirm("¿Cerrar sesión?", () => setCurrentUser(null))}>Cerrar Sesión</Button>
        </div>
      </Card>
    </div>
  );
};

export default function App() {
  // Inicializamos leyendo localStorage para mantener la sesión viva tras un Refresh
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = window.localStorage.getItem('esquemapps_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      return null;
    }
  });

  // Mantenemos al usuario en la misma pestaña tras recargar
  const [currentView, setCurrentView] = useState(() => {
    return window.localStorage.getItem('esquemapps_view') || 'DASHBOARD';
  });

  const [selectedProject, setSelectedProject] = useState(() => {
    try {
      const savedProj = window.localStorage.getItem('esquemapps_project');
      return savedProj ? JSON.parse(savedProj) : null;
    } catch (e) { return null; }
  });

  const [toastMessage, setToastMessage] = useState(null);
  const [directory, setDirectory] = useState([]); 
  const [activeRider, setActiveRider] = useState(null);
  const [showPasswordAlert, setShowPasswordAlert] = useState(false);
  const [theme, setTheme] = useState(window.localStorage.getItem('esquemapps_theme') || 'dark');
  const [pendingCount, setPendingCount] = useState(0);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, text: '', onConfirm: null });
  const [simulatedRole, setSimulatedRole] = useState(null);

  // Efecto automático: Si el currentUser cambia (login o perfil actualizado), lo guardamos. Si es null (logout), lo borramos.
  useEffect(() => {
    if (currentUser) {
      window.localStorage.setItem('esquemapps_user', JSON.stringify(currentUser));
    } else {
      window.localStorage.removeItem('esquemapps_user');
      window.localStorage.removeItem('esquemapps_view');
      window.localStorage.removeItem('esquemapps_project');
      setCurrentView('DASHBOARD');
      setSelectedProject(null);
    }
  }, [currentUser]);

  // Efecto automático: Guardamos la vista actual en memoria cada vez que el usuario navega
  useEffect(() => {
    if (currentUser) {
      window.localStorage.setItem('esquemapps_view', currentView);
    }
  }, [currentView, currentUser]);

  useEffect(() => {
    if (selectedProject) {
      window.localStorage.setItem('esquemapps_project', JSON.stringify(selectedProject));
    } else {
      window.localStorage.removeItem('esquemapps_project');
    }
  }, [selectedProject]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const acceptToken = params.get('acceptToken');
    if (acceptToken) {
      window.history.replaceState({}, document.title, window.location.pathname);
      const acceptRoute = async () => {
        try {
          const res = await apiFetch('aceptarRuta', { token: acceptToken });
          if (res.status === 'success') {
            showToast(`¡Ruta ${acceptToken} Aceptada con Éxito!`);
          }
          // Iniciar sesión automático del conductor a través del Token
          const loginRes = await apiFetch('loginConductor', { token: acceptToken });
          if (loginRes.status === 'success') {
            setCurrentUser(loginRes.user);
            setCurrentView('CONDUCTOR_VIEW');
          } else {
            showToast(`Error al loguear conductor: ${loginRes.message}`);
          }
        } catch(e) {
          showToast("Error de conexión al procesar la ruta.");
        }
      };
      acceptRoute();
    }
  }, []);

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

  const effectiveUser = currentUser ? { 
    ...currentUser, 
    role: simulatedRole || currentUser.role, 
    realRole: currentUser.realRole || currentUser.role
  } : null;

  const getMenuOptions = () => {
    if (!effectiveUser) return [];
    if (effectiveUser.role === 'CONDUCTOR') return [{ id: 'CONDUCTOR_VIEW', label: 'Mi Ruta', icon: Truck }, { id: 'LOGOUT', label: 'Salir', icon: LogOut }];

    const options = [
      { id: 'DASHBOARD', label: 'Proyectos', icon: Navigation }
    ];

    const canSeeExpenses = (effectiveUser.permisos || []).includes('EXPENSES') || 
                           [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.JEFE_CAT_APV].includes(effectiveUser.role);
    if (canSeeExpenses) {
       options.push({ id: 'EXPENSES', label: 'Gastos', icon: DollarSign });
    }
    
    options.push({ id: 'STAFF', label: 'Directorio', icon: Users });
    
    if (effectiveUser.role === ROLES.ADMIN || (effectiveUser.permisos || []).includes('ADMIN_PANEL')) {
       options.push({ id: 'ADMIN_PANEL', label: 'Admin Panel', icon: ShieldCheck, badgeCount: pendingCount });
    }
    
    options.push({ id: 'PROFILE', label: 'Mi Perfil', icon: User });
    return options;
  };

  const fetchDirectoryGlobal = async (force = false) => {
    if (!force && CACHE.usuarios) {
       setDirectory(CACHE.usuarios.filter(u => u.status === 'ACTIVO'));
       setPendingCount(CACHE.usuarios.filter(u => u.status === 'PENDING').length);
       return;
    }
    try {
      const res = await apiFetch('getUsuarios');
      if (res.status === 'success') {
         CACHE.usuarios = res.data;
         setDirectory(res.data.filter(u => u.status === 'ACTIVO'));
         setPendingCount(res.data.filter(u => u.status === 'PENDING').length);
      }
    } catch(e) { console.error("Error fetching global directory", e); }
  };

  const handleAcceptDisclaimer = async () => {
    if (!currentUser) return;
    try {
      const res = await apiFetch('updateProfile', { email: currentUser.email, disclaimerAceptado: true });
      if (res.status === 'success') {
        const updated = { ...currentUser, disclaimerAceptado: true };
        setCurrentUser(updated);
        window.localStorage.setItem(`disclaimer_${currentUser.email}`, 'true');
        setShowDisclaimerModal(false);
        showToast("Términos de privacidad aceptados.");
      } else {
        showToast("Error al guardar: " + res.message);
      }
    } catch (err) {
      const updated = { ...currentUser, disclaimerAceptado: true };
      setCurrentUser(updated);
      window.localStorage.setItem(`disclaimer_${currentUser.email}`, 'true');
      setShowDisclaimerModal(false);
      showToast("Aceptado en local");
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role !== 'CONDUCTOR') {
      fetchDirectoryGlobal();
      
      const disclaimerKey = `disclaimer_${currentUser.email}`;
      const acceptedLocal = window.localStorage.getItem(disclaimerKey) === 'true';
      const acceptedRemote = currentUser.disclaimerAceptado === true || currentUser.disclaimerAceptado === 'true';
      
      if (!acceptedLocal && !acceptedRemote) {
        setShowDisclaimerModal(true);
      } else if (acceptedRemote && !acceptedLocal) {
        window.localStorage.setItem(disclaimerKey, 'true');
      }

      if (!window.localStorage.getItem(`pwd_alert_${currentUser.email}`)) {
        setShowPasswordAlert(true);
        window.localStorage.setItem(`pwd_alert_${currentUser.email}`, 'true');
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentView !== 'RIDERS') setActiveRider(null);
  }, [currentView]);

  useEffect(() => {
    window.localStorage.setItem('esquemapps_theme', theme);
    document.documentElement.style.backgroundColor = theme === 'light' ? '#f8fafc' : '#020617';
  }, [theme]);

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

  if (!effectiveUser) return (
    <>
      {toastMessage && <div className="fixed top-4 right-4 z-[300] bg-emerald-500 text-white px-3 md:px-4 py-2.5 md:py-3 rounded-lg shadow-lg flex items-center gap-2.5 animate-fade-in"><CheckCircle2 size={18} /><span className="font-bold text-xs md:text-sm">{toastMessage}</span></div>}
      <AuthRouter setCurrentUser={setCurrentUser} setCurrentView={setCurrentView} showToast={showToast} />
    </>
  );
  
  if (effectiveUser.role === 'CONDUCTOR') {
    return (
      <div className="min-h-screen bg-slate-950 font-sans">
        {toastMessage && <div className="fixed top-4 right-4 z-[300] bg-blue-500 text-white px-3 md:px-4 py-2.5 md:py-3 rounded-lg shadow-lg flex items-center gap-2.5 animate-fade-in"><CheckCircle2 size={18} /><span className="font-bold text-xs md:text-sm">{toastMessage}</span></div>}
        
        {currentUser && (currentUser.role === ROLES.ADMIN || currentUser.realRole === ROLES.ADMIN) && (
          <div className="bg-slate-900 border-b border-amber-500/50 p-2 px-4 text-xs text-white flex flex-wrap items-center justify-between gap-2 shadow-md z-[100] print:hidden">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-amber-500"></span>
              <span className="font-bold text-amber-500 uppercase tracking-wider font-sans">Modo Simulación de Rol</span>
              <span className="text-slate-400">| Rol real: ADMIN</span>
            </div>
            <div className="flex items-center gap-2">
              <select 
                value={simulatedRole || currentUser.role} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === currentUser.role) setSimulatedRole(null);
                  else setSimulatedRole(val);
                }}
                className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-white outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value={currentUser.role}>ADMIN (Original)</option>
                {Object.values(ROLES).filter(r => r !== 'ADMIN').map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
                <option value="CONDUCTOR">CONDUCTOR</option>
              </select>
              {simulatedRole && (
                <button 
                  onClick={() => setSimulatedRole(null)} 
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-2 py-1 rounded text-[10px] transition-colors"
                >
                  Restablecer
                </button>
              )}
            </div>
          </div>
        )}

        <div className="p-3 md:p-4 flex justify-between items-center bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2"><Truck className="text-blue-500" size={20}/><span className="text-white font-bold tracking-widest text-xs md:text-sm">CONDUCTOR</span></div>
          <Button variant="ghost" className="text-red-400 py-1.5 px-3 text-xs md:text-sm" onClick={() => setCurrentUser(null)} icon={LogOut}>Salir</Button>
        </div>
        <ConductorView currentUser={effectiveUser} showToast={showToast} />
      </div>
    );
  }

  const menuOptions = getMenuOptions();

  return (
    <div className="flex flex-col min-h-screen">
      {currentUser && (currentUser.role === ROLES.ADMIN || currentUser.realRole === ROLES.ADMIN) && (
        <div className="bg-slate-900 border-b border-amber-500/50 p-2 px-4 text-xs text-white flex flex-wrap items-center justify-between gap-2 shadow-md z-[100] print:hidden">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-amber-500"></span>
            <span className="font-bold text-amber-500 uppercase tracking-wider font-sans">Modo Simulación de Rol</span>
            <span className="text-slate-400">| Rol real: ADMIN</span>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={simulatedRole || currentUser.role} 
              onChange={(e) => {
                const val = e.target.value;
                if (val === currentUser.role) setSimulatedRole(null);
                else setSimulatedRole(val);
              }}
              className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-white outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value={currentUser.role}>ADMIN (Original)</option>
              {Object.values(ROLES).filter(r => r !== 'ADMIN').map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
              <option value="CONDUCTOR">CONDUCTOR</option>
            </select>
            {simulatedRole && (
              <button 
                onClick={() => setSimulatedRole(null)} 
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-2 py-1 rounded text-[10px] transition-colors"
              >
                Restablecer
              </button>
            )}
          </div>
        </div>
      )}
      
      {theme === 'light' && (
        <style>{`
          .light-mode { background-color: #f8fafc !important; color: #0f172a !important; }
          .light-mode .bg-slate-950 { background-color: #f8fafc !important; }
          .light-mode .bg-slate-900 { background-color: #ffffff !important; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
          .light-mode .bg-slate-800 { background-color: #f1f5f9 !important; border-color: #e2e8f0 !important; }
          .light-mode .bg-slate-700 { background-color: #e2e8f0 !important; color: #334155 !important; }
          
          .light-mode .border-slate-800 { border-color: #e2e8f0 !important; }
          .light-mode .border-slate-700 { border-color: #cbd5e1 !important; }
          .light-mode .border-slate-600 { border-color: #cbd5e1 !important; }
          
          .light-mode .text-white { color: #0f172a !important; }
          .light-mode .text-slate-50 { color: #0f172a !important; }
          .light-mode .text-slate-100 { color: #1e293b !important; }
          .light-mode .text-slate-200 { color: #1e293b !important; }
          .light-mode .text-slate-300 { color: #334155 !important; }
          .light-mode .text-slate-400 { color: #475569 !important; }
          .light-mode .text-slate-500 { color: #64748b !important; }

          .light-mode .bg-emerald-600, .light-mode .bg-emerald-500, 
          .light-mode .bg-blue-600, .light-mode .bg-blue-500, 
          .light-mode .bg-red-600, .light-mode .bg-red-500, 
          .light-mode .bg-amber-600, .light-mode .bg-amber-500 {
              color: #ffffff !important;
          }
          .light-mode .bg-emerald-600 .text-white, .light-mode .bg-emerald-500 .text-white,
          .light-mode .bg-blue-600 .text-white, .light-mode .bg-blue-500 .text-white,
          .light-mode .bg-red-600 .text-white, .light-mode .bg-red-500 .text-white,
          .light-mode .bg-amber-600 .text-white, .light-mode .bg-amber-500 .text-white,
          .light-mode .bg-emerald-600 *, .light-mode .bg-emerald-500 *, 
          .light-mode .bg-blue-600 *, .light-mode .bg-blue-500 *, 
          .light-mode .bg-red-600 *, .light-mode .bg-red-500 *, 
          .light-mode .bg-amber-600 *, .light-mode .bg-amber-500 * {
              color: #ffffff !important;
          }

          .light-mode input:not([type="checkbox"]), .light-mode select, .light-mode textarea {
              background-color: #ffffff !important;
              color: #0f172a !important;
              border-color: #cbd5e1 !important;
          }
          .light-mode input:focus, .light-mode select:focus, .light-mode textarea:focus {
              border-color: #10b981 !important;
          }

          .light-mode .text-emerald-500 { color: #047857 !important; }
          .light-mode .text-emerald-400 { color: #059669 !important; }
          .light-mode .text-emerald-300 { color: #047857 !important; }
          .light-mode .text-emerald-200 { color: #065f46 !important; }
          .light-mode .text-emerald-100 { color: #064e3b !important; }
          .light-mode .text-emerald-50 { color: #022c22 !important; }
          
          .light-mode .text-blue-500 { color: #1d4ed8 !important; }
          .light-mode .text-blue-400 { color: #2563eb !important; }
          
          .light-mode .text-amber-500 { color: #b45309 !important; }
          .light-mode .text-amber-400 { color: #d97706 !important; }
          
          .light-mode .text-red-500 { color: #b91c1c !important; }
          .light-mode .text-red-400 { color: #dc2626 !important; }
          .light-mode .text-red-300 { color: #b91c1c !important; }
          .light-mode .text-red-200 { color: #991b1b !important; }
          .light-mode .text-red-100 { color: #7f1d1d !important; }
          .light-mode .text-red-50 { color: #450a0a !important; }

          .light-mode .bg-emerald-600 { background-color: #059669 !important; color: #ffffff !important; }
          .light-mode .bg-red-600 { background-color: #dc2626 !important; color: #ffffff !important; }

          .light-mode .bg-slate-950\/20 { background-color: rgba(15, 23, 42, 0.05) !important; }
          .light-mode .bg-slate-950\/40 { background-color: rgba(15, 23, 42, 0.1) !important; }
          .light-mode .bg-slate-950\/80 { background-color: rgba(248, 250, 252, 0.85) !important; }
          .light-mode .bg-slate-950\/90 { background-color: rgba(248, 250, 252, 0.92) !important; }
          
          .light-mode .bg-slate-900\/50 { background-color: rgba(255, 255, 255, 0.5) !important; }
          .light-mode .bg-slate-900\/80 { background-color: rgba(255, 255, 255, 0.8) !important; }
          .light-mode .bg-slate-900\/90 { background-color: rgba(255, 255, 255, 0.9) !important; }
          .light-mode .bg-slate-900\/95 { background-color: rgba(255, 255, 255, 0.95) !important; }
          
          .light-mode .bg-slate-800\/50 { background-color: rgba(241, 245, 249, 0.5) !important; }
          .light-mode .bg-slate-800\/80 { background-color: rgba(241, 245, 249, 0.8) !important; }
          
          .light-mode .hover\\:bg-slate-800\\/50:hover { background-color: rgba(241, 245, 249, 0.5) !important; }
          .light-mode .hover\\:bg-slate-850\\/50:hover { background-color: rgba(241, 245, 249, 0.6) !important; }
          
          .light-mode .bg-emerald-500\\/10 { background-color: rgba(5, 150, 105, 0.08) !important; border-color: rgba(5, 150, 105, 0.2) !important; }
          .light-mode .bg-emerald-500\\/20 { background-color: rgba(5, 150, 105, 0.12) !important; border-color: rgba(5, 150, 105, 0.3) !important; }
          .light-mode .bg-emerald-500\\/5 { background-color: rgba(5, 150, 105, 0.04) !important; }
          
          .light-mode thead.bg-slate-800 { background-color: #e2e8f0 !important; }
          .light-mode thead th { color: #475569 !important; }
          .light-mode tr { border-color: #cbd5e1 !important; }
        `}</style>
      )}

      <ConfirmModal />

      {showDisclaimerModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[250] flex items-center justify-center p-4 animate-fade-in print:hidden">
          <Card className="w-full max-w-lg p-5 md:p-7 border-emerald-500/50 flex flex-col gap-4 text-left">
            <div className="flex items-center gap-2 md:gap-3 text-emerald-500 border-b border-slate-800 pb-3">
              <ShieldCheck size={28} />
              <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider">Términos de Privacidad y Tratamiento de Datos</h2>
            </div>
            
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Para poder utilizar la plataforma <b>Esquemas Pro</b>, es necesario que aceptes nuestra política de recopilación y uso de datos operativos, personales y sensibles.
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] md:text-xs text-slate-400 space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar leading-relaxed">
              <p className="font-bold text-slate-200">1. DATOS RECOPILADOS Y SU FINALIDAD</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><b>Datos de Identificación y Contacto:</b> Nombre completo, correo electrónico y número de teléfono (necesario para coordinaciones de logística del equipo y contacto directo mediante WhatsApp).</li>
                <li><b>Datos de Operación Técnica:</b> Rol asignado y permisos de accesos a módulos de la aplicación.</li>
                <li><b>Datos Sensibles y de Bienestar:</b> 
                  <ul className="list-circle pl-4 mt-0.5">
                    <li><b>Talla de Vestimenta:</b> Para la confección, compra y asignación de vestuario de trabajo, uniformes del equipo y merchandising.</li>
                    <li><b>Preferencia de Alimentación / Alergias:</b> Para la planificación adecuada del catering en camarines, eventos y giras, resguardando tu salud y preferencias alimenticias.</li>
                  </ul>
                </li>
              </ul>
              <p className="font-bold text-slate-200 pt-1">2. PLAZO DE CONSERVACIÓN</p>
              <p>
                Los datos se conservarán y utilizarán de manera segura única y exclusivamente para los fines de coordinación del crew <b>mientras exista y se mantenga activa la aplicación y su base de datos web</b>.
              </p>
              <p className="font-bold text-slate-200 pt-1">3. ACEPTACIÓN</p>
              <p>
                Al hacer clic en "Aceptar y Continuar", declaras estar en conocimiento y autorizar el tratamiento de estos datos para la operación de los shows y giras correspondientes.
              </p>
            </div>

            <Button 
              variant="primary" 
              className="w-full py-2.5 md:py-3 text-xs md:text-sm font-bold uppercase tracking-wider mt-2" 
              onClick={handleAcceptDisclaimer}
            >
              Aceptar y Continuar
            </Button>
          </Card>
        </div>
      )}

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

      <div className={`flex-1 min-h-0 ${theme === 'light' ? 'light-mode bg-slate-50' : 'bg-slate-950'} flex flex-col lg:flex-row font-sans print:bg-white print:text-black`}>
        <aside className="bg-slate-900 border-r border-slate-800 w-64 shrink-0 hidden lg:flex flex-col h-screen sticky top-0 print:hidden">
        <div className="p-4 flex items-center gap-2.5 border-b border-slate-800"><Music className="text-emerald-500" size={20} /><h1 className="text-lg font-black text-white tracking-widest">ESQUEMAPPS</h1></div>
        <div className="p-3 flex-1 space-y-1 overflow-y-auto custom-scrollbar">
          {menuOptions.map(opt => (
            <button key={opt.id} onClick={() => { setCurrentView(opt.id); if (opt.id === 'DASHBOARD') setSelectedProject(null); }} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-bold transition-colors text-left text-sm ${currentView === opt.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'}`}>
              <opt.icon size={18} className="shrink-0" />
              <span className="flex-1">{opt.label}</span>
              {opt.badgeCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                  {opt.badgeCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-slate-800">
           <div className="flex items-center gap-2.5 mb-3 px-1">
             <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-xs font-black text-emerald-500 border border-emerald-500 shrink-0">{effectiveUser.name.charAt(0)}</div>
             <div className="flex-1 min-w-0"><p className="text-xs font-bold text-white truncate">{effectiveUser.name}</p><p className="text-[9px] text-slate-400 uppercase font-bold truncate">{effectiveUser.role}</p></div>
           </div>
           <Button variant="danger" icon={LogOut} onClick={() => requestConfirm("¿Cerrar sesión?", () => setCurrentUser(null))} className="w-full py-2 bg-transparent border-transparent hover:bg-red-500/10 text-xs">Cerrar Sesión</Button>
        </div>
      </aside>

      <main className="flex-1 relative overflow-y-auto h-screen bg-slate-950 print:bg-white custom-scrollbar print:overflow-visible print:h-auto pb-[70px] lg:pb-0">
        <div className="p-3 md:p-6 print:p-0">
          {currentView === 'DASHBOARD' && <Dashboard currentUser={effectiveUser} setCurrentView={setCurrentView} setSelectedProject={setSelectedProject} showToast={showToast} directory={directory} />}
          {currentView === 'PROJECT_DETAILS' && <ProjectDetailsView currentUser={effectiveUser} setCurrentView={setCurrentView} selectedProject={selectedProject} showToast={showToast} requestConfirm={requestConfirm} />}
          {currentView === 'ADMIN_PANEL' && <AdminPanel currentUser={effectiveUser} showToast={showToast} requestConfirm={requestConfirm} refreshPendingCount={() => fetchDirectoryGlobal(true)} />}
          {currentView === 'PROFILE' && <ProfileView currentUser={effectiveUser} setCurrentUser={setCurrentUser} showToast={showToast} theme={theme} setTheme={setTheme} requestConfirm={requestConfirm} />}
          {currentView === 'STAFF' && <StaffDirectory currentUser={effectiveUser} />}
          {currentView === 'CHAT' && <ChatView currentUser={effectiveUser} showToast={showToast} requestConfirm={requestConfirm} />}
          {currentView === 'TRANSPORT' && <TransportView currentUser={effectiveUser} setCurrentView={setCurrentView} showToast={showToast} selectedProject={selectedProject} />}
          {currentView === 'TRANSPORT_DETAILS' && <TransportDetailsView currentUser={effectiveUser} setCurrentView={setCurrentView} showToast={showToast} />}
          {currentView === 'RIDERS' && <RidersView currentUser={effectiveUser} showToast={showToast} requestConfirm={requestConfirm} activeRider={activeRider} setActiveRider={setActiveRider} directory={directory} selectedProject={selectedProject} setCurrentView={setCurrentView} />}
          {currentView === 'EXPENSES' && <ExpensesView currentUser={effectiveUser} showToast={showToast} requestConfirm={requestConfirm} selectedProject={selectedProject} setSelectedProject={setSelectedProject} />}
        </div>
      </main>
      
      <nav className="lg:hidden fixed bottom-0 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex justify-between px-1 pb-safe z-50 overflow-x-auto hide-scrollbar print:hidden">
         {menuOptions.map(opt => (
            <button key={opt.id} onClick={() => { setCurrentView(opt.id); if (opt.id === 'DASHBOARD') setSelectedProject(null); }} className={`flex flex-col items-center justify-center gap-0.5 p-1.5 min-w-[64px] flex-1 transition-colors relative ${currentView === opt.id ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}>
              <opt.icon size={18} className="shrink-0" />
              <span className="text-[9px] font-bold truncate w-full text-center">{opt.label}</span>
              {opt.badgeCount > 0 && (
                <span className="absolute top-1 right-4 bg-red-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black animate-pulse">
                  {opt.badgeCount}
                </span>
              )}
            </button>
          ))}
      </nav>
      </div>
    </div>
  );
}