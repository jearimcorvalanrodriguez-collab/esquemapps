import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Calendar, Clock, Users, Bell, MessageSquare, 
  Truck, Music, CheckCircle2, XCircle, LogOut, Plus, 
  Navigation, User, Settings, ShieldCheck, UserPlus, 
  UserCheck, Edit3, X, Key, AlertCircle, Loader2,
  Phone, Mail, CheckCheck, Send, Timer, Hourglass,
  Shield, CalendarPlus, FileText, Mic2, Lightbulb, Map as MapIcon, Save,
  Trash2, FolderPlus, RefreshCw, ChevronLeft, CheckSquare, Square, Printer, Utensils, CalendarDays
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

//// Wrapper para Fetch que inyecta el Secret automáticamente
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

// Componente Helper: Textarea que crece automáticamente
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

// Componente Helper: Menú desplegable MIC/DI con opción "OTRO"
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
    <select 
      className="w-full bg-transparent border border-slate-700 rounded p-1 outline-none focus:border-emerald-500 text-xs" 
      value={value} 
      onChange={e => {
        if (e.target.value === 'OTRO') {
          setCustomMode(true);
          onChange('');
        } else {
          onChange(e.target.value);
        }
      }}
    >
      <option value=""></option>
      <option value="MIC">MIC</option>
      <option value="DI">DI</option>
      <option value="OTRO">OTRO...</option>
    </select>
  );
};

// --- 1. AUTENTICACIÓN ---
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

// --- 2. VISTA EXCLUSIVA CONDUCTOR ---
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

// --- 3. MÓDULO DE TRANSPORTE (ADMIN/CREW) ---
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
                  <p className="text-xs md:text-sm text-slate-300 flex items-center gap-1.5">
                    <Calendar size={12}/> {formattedProjectDate}
                  </p>
                  <p className="text-xs md:text-sm text-slate-400 flex items-center gap-1.5"><User size={12}/> {proyecto.manager}</p>
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

// --- 4. MÓDULO RIDERS TÉCNICOS (Exportable / Print Ready) ---
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
    visuals: [{ col1: '', col2: '', col3: '', col4: '' }]
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
          try { parsedContent = JSON.parse(r.content); } 
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

  const icons = { 'SONIDO': Mic2, 'ILUMINACIÓN': Lightbulb, 'STAGEPLOT': MapIcon, 'COMPLETO': FileText };

  const getTabsForType = (type) => {
    switch(type) {
      case 'SONIDO': return ['GENERAL', 'AUDIO', 'BACKLINE'];
      case 'ILUMINACIÓN': return ['GENERAL', 'VISUALES'];
      case 'STAGEPLOT': return ['GENERAL', 'BACKLINE'];
      default: return ['GENERAL', 'AUDIO', 'BACKLINE', 'VISUALES'];
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

          <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-slate-950 custom-scrollbar">
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
                  <div className="flex justify-between items-end mb-2"><h3 className="text-xs md:text-sm font-bold text-emerald-500">OUTPUT / MONITOR ({form.content.outputs.length}/100)</h3><Button variant="secondary" className="py-1 px-2.5 text-[10px]" icon={Plus} onClick={() => addRow('outputs', { mix: '', player: '', monitor: '', obs: '' })}>Fila</Button></div>
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

// --- 7. TIMING GLOBAL (Selector de Proyectos Activos) ---
const TimingGlobalView = ({ currentUser, setCurrentView, setSelectedProject, showToast }) => {
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
        <h1 className="text-2xl md:text-3xl font-black text-white leading-tight flex items-center gap-2 md:gap-3"><CalendarDays className="text-emerald-500" size={28} /> Timing Global</h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1.5">Selecciona un proyecto activo para ver su Run of Show y cronograma detallado.</p>
      </header>

      {fetchError ? (
        <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl text-red-400 flex items-center gap-2 text-sm"><AlertCircle size={18} /> {fetchError}</div>
      ) : loading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500" size={28}/></div>
      ) : proyectos.length === 0 ? (
        <div className="text-center p-8 border border-slate-800 border-dashed rounded-xl text-slate-500 text-sm">No hay proyectos activos registrados para el Timing.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {proyectos.map(proyecto => {
            const projectDate = new Date(Number(proyecto.id));
            const formattedProjectDate = `${String(projectDate.getDate()).padStart(2, '0')}/${String(projectDate.getMonth() + 1).padStart(2, '0')}/${projectDate.getFullYear()}`;

            return (
              <Card 
                key={proyecto.id} 
                onClick={() => { setSelectedProject(proyecto); setCurrentView('PROJECT_DETAILS'); }}
                className="group cursor-pointer hover:border-emerald-500 transition-colors p-3 md:p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/20"><CalendarDays className="text-emerald-500" size={20} /></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded block w-fit text-emerald-500 bg-emerald-500/10">{proyecto.status}</span>
                </div>
                
                <h2 className="text-lg font-bold text-white leading-tight mb-1.5">{proyecto.name}</h2>
                <div className="space-y-1 mb-3">
                  <p className="text-xs md:text-sm text-slate-300 flex items-center gap-1.5">
                    <Calendar size={12}/> {formattedProjectDate}
                  </p>
                  <p className="text-xs md:text-sm text-slate-400 flex items-center gap-1.5"><User size={12}/> Liderado por: {proyecto.manager}</p>
                </div>
                
                <div className="border-t border-slate-700 pt-3 mt-3">
                  <Button variant="ghost" className="w-full bg-slate-900 border border-slate-700 hover:text-emerald-400 text-xs py-1.5" icon={Clock}>
                    Ver Timing de Gira
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

// --- 8. PANEL DE ADMINISTRADOR ---
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

  const fetchUsers = async () => {
    setLoading(true); setFetchError(false);
    try {
      const res = await apiFetch('getUsuarios');
      if (res.status === 'success') setDbUsers(res.data.filter(u => u.name));
    } catch(e) { setFetchError(true); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleApprove = async (email) => {
    setProcessingId(email);
    try {
      const res = await apiFetch('aprobarUsuario', { email });
      if (res.status === 'success') { showToast("Usuario aprobado. Clave enviada por correo."); fetchUsers(); } 
      else { showToast("Error: " + res.message); }
    } catch(e) { showToast("Error de conexión al aprobar."); }
    setProcessingId(null);
  };

  const handleDirectInvite = async (e) => {
    e.preventDefault(); setProcessingId('inviting');
    try {
      const resSolicitud = await apiFetch('solicitarAcceso', { name: invName, email: invEmail, phone: invPhone, role: invRole });
      if(resSolicitud.status === 'success') {
        const resAprob = await apiFetch('aprobarUsuario', { email: invEmail });
        if(resAprob.status === 'success') {
          showToast(`Acceso creado. Credenciales enviadas a ${invEmail}`); setInvName(''); setInvEmail(''); setActiveTab('DIRECTORIO'); fetchUsers();
        }
      }
    } catch(e) { showToast("Error al invitar integrante."); }
    setProcessingId(null);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    showToast("Edición simulada. Requiere endpoint de admin."); 
    setDbUsers(prev => prev.map(u => u.email === editingUser.email ? editingUser : u));
    setEditingUser(null);
  };

  const pendingUsers = dbUsers.filter(u => u.status === 'PENDING');
  const activeUsers = dbUsers.filter(u => u.status === 'ACTIVO' || u.status === 'INACTIVO');

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 pb-24 animate-fade-in">
      <header className="border-b border-slate-800 pb-3 md:pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2 md:gap-3"><ShieldCheck className="text-emerald-500" size={24} /> Admin Panel</h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">Gestión global de accesos, roles y perfiles.</p>
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
                    <div className="flex flex-row gap-2 shrink-0 mt-2 md:mt-0"><Button variant="danger" icon={X} className="flex-1 py-1.5" onClick={() => requestConfirm("¿Rechazar esta solicitud?", () => showToast("Solicitud rechazada."))}>Rechazar</Button><Button variant="primary" icon={Key} className="flex-1 py-1.5" disabled={processingId === u.email} onClick={() => handleApprove(u.email)}>{processingId === u.email ? '...' : 'Aprobar'}</Button></div>
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
                      <div className="flex flex-row gap-2 mt-2"><Button variant="ghost" className="flex-1 bg-slate-800 py-1.5" onClick={() => setEditingUser(null)}>Cancelar</Button><Button type="submit" variant="primary" className="flex-1 py-1.5">Guardar</Button></div>
                    </form>
                  ) : (
                    <><div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-full bg-slate-700 text-white font-black flex items-center justify-center text-base shrink-0">{u.name?.charAt(0) || '?'}</div><div className="flex-1 min-w-0"><h3 className="font-bold text-white text-base truncate">{u.name}</h3><span className="text-[9px] bg-slate-900 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700 uppercase font-bold inline-block mt-0.5">{u.role}</span></div>{u.status === 'INACTIVO' && <span className="text-[9px] text-red-500 font-bold border border-red-500/50 px-1.5 py-0.5 rounded">BLOCK</span>}</div><div className="mt-auto pt-3 border-t border-slate-700/50 flex flex-row gap-2"><Button variant="secondary" className="flex-1 py-1.5" icon={Edit3} onClick={() => setEditingUser(u)}>Editar Perfil</Button></div></>
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

// --- 9. MI PERFIL ---
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
      const payload = { email: currentUser.email, phone: pPhone, talla: pTalla, dieta: pDieta };
      if (newPass && oldPass) { payload.oldPassword = oldPass; payload.newPassword = newPass; }
      const res = await apiFetch('updateProfile', payload);
      if (res.status === 'success') {
        setCurrentUser({ ...currentUser, phone: pPhone, talla: pTalla, dieta: pDieta });
        setOldPass(''); setNewPass(''); setConfirmPass('');
        showToast(newPass ? "¡Perfil y Contraseña actualizados!" : "¡Perfil actualizado!");
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

// --- 10. DASHBOARD PRINCIPAL (MÓDULO DE PROYECTOS) ---
const Dashboard = ({ currentUser, setCurrentView, setSelectedProject, showToast, directory }) => {
  const canCreate = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Gira Musical' });
  const [assigningProject, setAssigningProject] = useState(null);

  const fetchProyectos = async () => {
    setFetchError(false);
    try {
      const res = await apiFetch('getProyectos');
      if (res.status === 'success') {
        const parsed = res.data.map(p => ({ ...p, asignados: Array.isArray(p.asignados) ? p.asignados : [] }));
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
        showToast("Proyecto creado exitosamente."); setIsCreating(false); setForm({ name: '', type: 'Gira Musical' }); fetchProyectos();
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
      showToast("Estado actualizado."); fetchProyectos();
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
      showToast("Asignaciones de proyecto guardadas."); setAssigningProject(null); fetchProyectos();
    } catch(e) { showToast("Error al guardar."); }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-24 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b border-slate-800 pb-4">
        <div><h1 className="text-2xl md:text-3xl font-black text-white leading-tight">Hola, {currentUser.name.split(' ')[0]}</h1><p className="text-emerald-400 text-xs md:text-sm font-black uppercase tracking-wider">{currentUser.role}</p></div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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
        ) : proyectos.length === 0 ? (
          <div className="text-center p-8 border border-slate-800 border-dashed rounded-xl text-slate-500 text-sm">No hay proyectos activos.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {proyectos.map(proyecto => {
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
              <h2 className="text-base md:text-lg font-bold text-white">Asignar Equipo</h2>
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

// Función helper para estado de Hitos
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

// Componente Micro-Aislado para los Hitos
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

// --- 11. DETALLES DEL PROYECTO (HITOS INTERNOS) ---
const ProjectDetailsView = ({ currentUser, setCurrentView, selectedProject, showToast, directory, requestConfirm }) => {
  const p = selectedProject;
  const canManage = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role);
  const [hitos, setHitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ title: '', location: '', date: '', time: '' });
  const [assigningHito, setAssigningHito] = useState(null);

  const fetchHitos = async () => {
    setFetchError(false);
    try {
      const res = await apiFetch('getHitos');
      if (res.status === 'success') {
        const projectHitos = res.data.filter(ev => String(ev.proyectoId) === String(p.id));
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
          } catch(e) { console.error("Error parseando fecha", e); }
          return { ...ev, fullDate, asignados: Array.isArray(ev.asignados) ? ev.asignados : [] };
        });
        setHitos(parsedEvents.sort((a,b) => a.fullDate - b.fullDate));
      } else setFetchError(res.message || "Error al obtener hitos");
    } catch(e) { setFetchError("Fallo de red al obtener hitos."); }
    setLoading(false);
  };

  useEffect(() => { fetchHitos(); }, []);

  const firstHito = hitos.length > 0 ? hitos[0] : null;
  let projectDateStr = "Sin hitos";
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
        showToast("Hito agendado."); setIsCreating(false); setForm({ title: '', location: '', date: '', time: '' }); fetchHitos();
      } else {
        showToast("Error: " + res.message); 
      }
    } catch(e) { showToast("Error al crear hito."); }
  };

  const handleDeleteHito = async (id) => {
    try {
      await apiFetch('deleteHito', { id });
      showToast("Hito eliminado."); fetchHitos();
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
      showToast("Asignaciones guardadas."); setAssigningHito(null); fetchHitos();
    } catch(e) { showToast("Error al guardar."); }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-24 max-w-4xl mx-auto">
      <button onClick={() => setCurrentView('DASHBOARD')} className="flex items-center gap-1.5 text-xs md:text-sm text-slate-400 hover:text-white transition-colors mb-2"><ChevronLeft size={16}/> Volver a Proyectos</button>
      
      <header className="border-b border-slate-800 pb-4 flex flex-col items-start gap-2">
        <div>
          <span className="text-[9px] md:text-[10px] bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700 uppercase font-bold tracking-wider mb-1.5 inline-block">PROYECTO</span>
          <h1 className="text-xl md:text-2xl font-black text-white leading-tight">{p.name}</h1>
          <div className="mt-1.5 space-y-1">
            <p className="text-xs md:text-sm text-slate-300 flex items-center gap-1.5"><Calendar size={12}/> Inicio: {projectDateStr}</p>
            <p className="text-xs md:text-sm text-slate-400 flex items-center gap-1.5"><User size={12}/> Liderado por: {p.manager}</p>
          </div>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 mb-3 gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2"><Clock className="text-emerald-500" size={18}/> Timing</h2>
          {showClock && (
            <div className="bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg flex items-center gap-2 shadow-sm animate-fade-in">
              <Timer className="text-emerald-500 animate-pulse" size={14} />
              <LiveClock />
            </div>
          )}
        </div>
        {canManage && !isCreating && <Button icon={Plus} onClick={() => setIsCreating(true)} className="py-1.5 px-3 text-xs md:text-sm">Nuevo Hito</Button>}
      </div>

      {isCreating && (
        <Card className="p-4 md:p-6 border-emerald-500 mb-4">
          <h2 className="text-base font-bold text-white mb-3">Agendar Hito</h2>
          <form onSubmit={handleCreateHito} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] md:text-xs text-slate-400 block mb-1 uppercase font-bold">Título del Hito</label>
                <input list="hitos-list" required className="w-full bg-slate-900 border-slate-700 rounded p-2 md:p-2.5 text-xs md:text-sm text-white outline-none focus:border-emerald-500" placeholder="Ej: Soundcheck, Load In..." value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
                <datalist id="hitos-list"><option value="Load In (Montaje)" /><option value="Soundcheck (Prueba de Sonido)" /><option value="Puertas (Apertura al público)" /><option value="Show Telonero" /><option value="Show Principal" /><option value="Load Out (Desmontaje)" /></datalist>
              </div>
              <div>
                <label className="text-[10px] md:text-xs text-slate-400 block mb-1 uppercase font-bold">Ubicación</label>
                <div className="flex items-center gap-2">
                  <input required className="w-full bg-slate-900 border-slate-700 rounded p-2 md:p-2.5 text-xs md:text-sm text-white outline-none focus:border-emerald-500" placeholder="Ej: Escenario Principal" value={form.location} onChange={e=>setForm({...form, location: e.target.value})} />
                  <Button type="button" variant="secondary" icon={MapPin} onClick={captureGPS} title="Usar GPS" className="px-3" />
                </div>
              </div>
              <div><label className="text-[10px] md:text-xs text-slate-400 block mb-1 uppercase font-bold">Fecha</label><input required type="date" className="w-full bg-slate-900 border-slate-700 rounded p-2 md:p-2.5 text-xs md:text-sm text-white outline-none focus:border-emerald-500" onChange={e=>setForm({...form, date: e.target.value})} /></div>
              <div><label className="text-[10px] md:text-xs text-slate-400 block mb-1 uppercase font-bold">Hora</label><input required type="time" className="w-full bg-slate-900 border-slate-700 rounded p-2 md:p-2.5 text-xs md:text-sm text-white outline-none focus:border-emerald-500" onChange={e=>setForm({...form, time: e.target.value})} /></div>
            </div>
            <div className="flex gap-2 pt-2"><Button variant="secondary" className="flex-1 py-2 md:py-2.5" onClick={()=>setIsCreating(false)}>Cancelar</Button><Button type="submit" className="flex-1 py-2 md:py-2.5">Guardar Hito</Button></div>
          </form>
        </Card>
      )}

      {fetchError ? (
        <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl text-red-400 flex items-center gap-2 text-sm"><AlertCircle size={18} /> {fetchError}</div>
      ) : loading && hitos.length === 0 ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500" size={28}/></div>
      ) : hitos.length === 0 ? (
        <div className="text-center p-8 border border-slate-800 border-dashed rounded-xl bg-slate-900/50">
          <CalendarPlus className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="text-slate-400 text-xs md:text-sm">Aún no hay hitos agendados en este proyecto.</p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
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
              {directory.length === 0 ? <p className="text-slate-500 text-xs text-center">Cargando directorio...</p> : directory.map(u => {
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