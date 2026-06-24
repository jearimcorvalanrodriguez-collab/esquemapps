import React, { useState, useEffect } from 'react';
import { 
  MapPin, Calendar, Clock, Users, Bell, MessageSquare, 
  Truck, Music, CheckCircle2, XCircle, LogOut, Plus, 
  Map, Navigation, User, Settings, Briefcase,
  Mail, Lock, AlertCircle, ArrowLeft, Coffee, Star, Edit3,
  Save, X, DollarSign, Receipt, UploadCloud, FileText, Send, 
  Loader2, Mic2, Shield, HeartPulse, Shirt, CarFront,
  Download, Lightbulb, Volume2, Flame,
  Navigation2, Route, History, Timer, Hourglass,
  CalendarPlus, Phone, ExternalLink, Hotel, Map as MapIcon,
  ShieldCheck, UserPlus, UserCheck, MoreVertical, Key
} from 'lucide-react';

const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  TOUR_MANAGER: 'TOUR MANAGER',
  TECH: 'TÉCNICO',
  TRASLADO: 'TRASLADO',
  APV: 'APV/CATERING'
};

// Datos visuales de prueba para el Dashboard (Mientras conectamos los módulos de Shows)
const mockTours = [
  { id: 'T001', name: 'Los Rockers - Gira Sudamérica 2026', type: 'Música', imageIcon: Music }
];

const Card = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden ${onClick ? 'cursor-pointer hover:border-emerald-500 transition-colors' : ''} ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, type = 'button', disabled = false }) => {
  const base = "flex flex-row items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-all duration-200 active:scale-95 text-center leading-tight disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed text-sm";
  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 shadow-lg border border-emerald-500/50",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/50",
    accent: "bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-amber-900/20 shadow-lg",
    ghost: "bg-transparent hover:bg-slate-700 text-slate-300",
    blue: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 shadow-lg border border-blue-500/50"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={16} className="shrink-0" />}
      <span className="truncate">{children}</span>
    </button>
  );
};

const openWhatsApp = (phone) => window.open(`https://wa.me/${phone.replace('+', '')}`, '_blank');

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('DASHBOARD');
  const [toastMessage, setToastMessage] = useState(null);
  
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getMenuOptions = () => {
    if (!currentUser) return [];
    const r = currentUser.role;
    const chat = { id: 'CHAT', label: 'Mensajes', icon: MessageSquare };
    const time = { id: 'TIMING', label: 'Timing', icon: Timer };
    const dir = { id: 'STAFF', label: 'Directorio', icon: Users };
    const admin = { id: 'ADMIN_PANEL', label: 'Admin Panel', icon: ShieldCheck };
    const profile = { id: 'PROFILE', label: 'Mi Perfil', icon: User };
    
    if (r === ROLES.ADMIN) return [ { id: 'DASHBOARD', label: 'Proyectos', icon: Navigation }, admin, time, chat, dir, profile ];
    if (r === ROLES.MANAGER) return [ { id: 'DASHBOARD', label: 'Proyectos', icon: Navigation }, time, chat, dir, profile ];
    if (r === ROLES.TOUR_MANAGER) return [ { id: 'DASHBOARD', label: 'Giras', icon: Music }, time, chat, dir, profile ];
    return [ { id: 'DASHBOARD', label: 'Mis Shows', icon: Calendar }, time, chat, dir, profile ];
  };

  const AuthRouter = () => {
    const [mode, setMode] = useState('LOGIN');
    const [email, setEmail] = useState(''); 
    const [pass, setPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [regName, setRegName] = useState('');
    const [regRole, setRegRole] = useState(ROLES.TECH);
    const [regPhone, setRegPhone] = useState('+569');

    const handleLogin = async (e) => {
      e.preventDefault(); 
      setError(''); setLoading(true);
      try {
        const response = await fetch('/.netlify/functions/api', {
          method: 'POST', body: JSON.stringify({ action: 'login', payload: { email, password: pass } })
        });
        const data = await response.json();
        if (data.status === 'success') { setCurrentUser(data.user); } 
        else { setError(data.message || "Credenciales incorrectas."); }
      } catch (err) {
        setError("Error de red conectando al servidor seguro.");
      }
      setLoading(false);
    };

    const handleRegister = async (e) => {
      e.preventDefault(); setError(''); setLoading(true);
      try {
        const response = await fetch('/.netlify/functions/api', {
          method: 'POST', body: JSON.stringify({ action: 'solicitarAcceso', payload: { name: regName, email, phone: regPhone, role: regRole } })
        });
        const result = await response.json();
        if (result.status === 'success') {
           setMode('LOGIN'); 
           alert("¡Solicitud enviada! Producción la revisará pronto.");
        } else { setError(result.message || 'Error al solicitar.'); }
      } catch (err) { setError('Error de red.'); }
      setLoading(false);
    };

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="mb-8 text-center animate-fade-in">
          <Music className="text-emerald-500 mx-auto mb-4" size={48} />
          <h1 className="text-4xl font-black text-white tracking-wider">ESQUEMAS</h1>
          <p className="text-slate-400 mt-2 tracking-widest text-sm uppercase font-bold">Production Management</p>
        </div>
        <Card className="w-full max-w-md p-8 animate-slide-up">
          <div className="mb-6 text-center border-b border-slate-800 pb-4">
            <h2 className="text-2xl font-bold text-white">{mode === 'LOGIN' ? 'Iniciar Sesión' : 'Solicitar Acceso'}</h2>
          </div>
          {mode === 'LOGIN' ? (
            <form onSubmit={handleLogin} className="space-y-5">
               {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg flex items-center gap-2"><AlertCircle size={16} className="shrink-0" /><span>{error}</span></div>}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Correo Electrónico</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-emerald-500" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Contraseña</label>
                <input type="password" value={pass} onChange={e=>setPass(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-emerald-500" required />
              </div>
              <Button type="submit" className="w-full py-3" disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : 'Ingresar a Plataforma'}</Button>
              <p className="text-center text-xs text-slate-400 mt-4">¿No eres parte del Crew aún? <button type="button" onClick={()=>setMode('REGISTER')} className="text-emerald-500 font-bold hover:underline">Solicitar Acceso</button></p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {error && <div className="bg-red-500/10 text-red-500 border border-red-500/30 text-sm p-3 rounded-lg flex gap-2"><AlertCircle size={16} /><span>{error}</span></div>}
              <div><label className="block text-xs font-bold text-slate-400 mb-1">Nombre Completo</label><input type="text" value={regName} onChange={e=>setRegName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-emerald-500" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold text-slate-400 mb-1">Correo</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-emerald-500" required /></div>
                <div><label className="block text-xs font-bold text-slate-400 mb-1">Teléfono</label><input type="tel" value={regPhone} onChange={e=>setRegPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-emerald-500" required /></div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Rol Solicitado</label>
                <select value={regRole} onChange={e=>setRegRole(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-emerald-500 appearance-none">
                  {Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <Button type="submit" className="w-full py-3 mt-2" disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : 'Enviar Solicitud'}</Button>
              <p className="text-center text-xs text-slate-400 mt-4"><button type="button" onClick={()=>setMode('LOGIN')} className="text-emerald-500 font-bold hover:underline">Volver al Login</button></p>
            </form>
          )}
        </Card>
      </div>
    );
  };

  const AdminPanel = () => {
    const [dbUsers, setDbUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('PENDIENTES');
    const [processingId, setProcessingId] = useState(null);
    
    // Formulario de Invitación Directa
    const [invName, setInvName] = useState('');
    const [invEmail, setInvEmail] = useState('');
    const [invPhone, setInvPhone] = useState('+569');
    const [invRole, setInvRole] = useState(ROLES.TECH);

    // Formulario de Edición
    const [editingUser, setEditingUser] = useState(null);

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch('/.netlify/functions/api', { method: 'POST', body: JSON.stringify({ action: 'getUsuarios' }) });
        const json = await res.json();
        if (json.status === 'success') setDbUsers(json.data.filter(u => u.name));
        else setDbUsers([]);
      } catch(e) { setDbUsers([]); }
      setLoading(false);
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleApprove = async (email) => {
      setProcessingId(email);
      try {
        const res = await fetch('/.netlify/functions/api', {
          method: 'POST', body: JSON.stringify({ action: 'aprobarUsuario', payload: { email } })
        });
        const json = await res.json();
        if (json.status === 'success') {
          showToast("Usuario aprobado. Clave enviada por correo.");
          fetchUsers();
        } else { showToast("Error: " + json.message); }
      } catch(e) { showToast("Error de conexión."); }
      setProcessingId(null);
    };

    const handleDirectInvite = async (e) => {
      e.preventDefault();
      setProcessingId('inviting');
      try {
        await fetch('/.netlify/functions/api', {
          method: 'POST', body: JSON.stringify({ action: 'solicitarAcceso', payload: { name: invName, email: invEmail, phone: invPhone, role: invRole } })
        });
        const res = await fetch('/.netlify/functions/api', {
          method: 'POST', body: JSON.stringify({ action: 'aprobarUsuario', payload: { email: invEmail } })
        });
        const json = await res.json();
        if(json.status === 'success') {
          showToast(`Acceso creado. Credenciales enviadas a ${invEmail}`);
          setInvName(''); setInvEmail(''); setActiveTab('DIRECTORIO');
          fetchUsers();
        }
      } catch(e) { showToast("Error al invitar integrante."); }
      setProcessingId(null);
    };

    const handleEditSave = (e) => {
      e.preventDefault();
      setDbUsers(prev => prev.map(u => u.email === editingUser.email ? editingUser : u));
      showToast("Perfil local actualizado. (Falta conexión BD)");
      setEditingUser(null);
    };

    const pendingUsers = dbUsers.filter(u => u.status === 'PENDING');
    const activeUsers = dbUsers.filter(u => u.status === 'ACTIVO' || u.status === 'INACTIVO');

    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-24 animate-fade-in">
        <header className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-black text-white flex items-center gap-3"><ShieldCheck className="text-emerald-500" size={28} /> Consola de Administración</h1>
          <p className="text-sm text-slate-400 mt-1">Gestión global de accesos, roles y perfiles.</p>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          <Button variant={activeTab === 'PENDIENTES' ? 'primary' : 'secondary'} onClick={() => setActiveTab('PENDIENTES')} icon={Bell}>
            Solicitudes ({pendingUsers.length})
          </Button>
          <Button variant={activeTab === 'DIRECTORIO' ? 'primary' : 'secondary'} onClick={() => setActiveTab('DIRECTORIO')} icon={Users}>
            Directorio y Edición
          </Button>
          <Button variant={activeTab === 'INVITAR' ? 'primary' : 'secondary'} onClick={() => setActiveTab('INVITAR')} icon={UserPlus}>
            Invitar Integrante
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin text-emerald-500" size={32}/></div>
        ) : (
          <>
            {activeTab === 'PENDIENTES' && (
              <div className="space-y-4">
                {pendingUsers.length === 0 ? (
                  <div className="text-center p-10 border border-slate-800 border-dashed rounded-xl text-slate-500 font-bold">No hay solicitudes pendientes.</div>
                ) : pendingUsers.map(u => (
                  <Card key={u.id || u.email} className="p-5 border-l-4 border-l-amber-500">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">{u.name} <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded uppercase font-black tracking-wider">PENDIENTE</span></h3>
                        <p className="text-sm text-slate-400 mt-1">{u.email} • {u.phone}</p>
                        <p className="text-xs text-emerald-400 font-bold mt-1 uppercase">Rol Solicitado: {u.role}</p>
                      </div>
                      <div className="flex flex-row gap-2 shrink-0">
                        <Button variant="danger" icon={X} className="flex-1" onClick={() => showToast("Solicitud rechazada.")}>Rechazar</Button>
                        <Button variant="primary" icon={Key} className="flex-1" disabled={processingId === u.email} onClick={() => handleApprove(u.email)}>
                          {processingId === u.email ? 'Aprobando...' : 'Aprobar y Enviar Clave'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'DIRECTORIO' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeUsers.map(u => (
                  <Card key={u.id || u.email} className={`p-5 flex flex-col ${u.status === 'INACTIVO' ? 'opacity-50 grayscale' : ''}`}>
                    {editingUser?.email === u.email ? (
                      <form onSubmit={handleEditSave} className="space-y-3 animate-fade-in">
                        <h4 className="text-sm font-bold text-emerald-400 border-b border-slate-700 pb-2">Editar Perfil de {u.name}</h4>
                        <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" value={editingUser.name} onChange={e=>setEditingUser({...editingUser, name: e.target.value})} />
                        <div className="grid grid-cols-2 gap-2">
                          <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" value={editingUser.phone} onChange={e=>setEditingUser({...editingUser, phone: e.target.value})} />
                          <select className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" value={editingUser.role} onChange={e=>setEditingUser({...editingUser, role: e.target.value})}>
                            {Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                        <select className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white font-bold" value={editingUser.status} onChange={e=>setEditingUser({...editingUser, status: e.target.value})}>
                          <option value="ACTIVO">ESTADO: ACTIVO</option>
                          <option value="INACTIVO">ESTADO: INACTIVO (Bloqueado)</option>
                        </select>
                        <div className="flex flex-row gap-2 mt-3">
                          <Button variant="ghost" className="flex-1 bg-slate-800" onClick={() => setEditingUser(null)}>Cancelar</Button>
                          <Button type="submit" variant="primary" className="flex-1">Guardar</Button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-slate-700 text-white font-black flex items-center justify-center text-xl shrink-0">{u.name?.charAt(0) || '?'}</div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white text-lg truncate">{u.name}</h3>
                            <span className="text-[10px] bg-slate-900 text-emerald-400 px-2 py-0.5 rounded border border-slate-700 uppercase font-bold">{u.role}</span>
                          </div>
                          {u.status === 'INACTIVO' && <span className="text-[10px] text-red-500 font-bold border border-red-500/50 px-2 py-1 rounded">BLOQUEADO</span>}
                        </div>
                        <div className="mt-auto pt-4 border-t border-slate-700/50 flex flex-row gap-2">
                           <Button variant="secondary" className="flex-1" icon={Edit3} onClick={() => setEditingUser(u)}>Editar</Button>
                           <Button variant="secondary" className="flex-1 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20" icon={MessageSquare} onClick={() => openWhatsApp(u.phone)}>Contactar</Button>
                        </div>
                      </>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'INVITAR' && (
              <Card className="max-w-xl mx-auto p-6 border-t-4 border-emerald-500">
                <h2 className="text-xl font-bold text-white mb-2">Crear Acceso Directo</h2>
                <p className="text-sm text-slate-400 mb-6">El sistema creará el perfil, generará la clave segura y le enviará el correo oficial inmediatamente.</p>
                <form onSubmit={handleDirectInvite} className="space-y-4">
                  <div><label className="block text-xs font-bold text-slate-400 mb-1">Nombre Completo</label><input type="text" value={invName} onChange={e=>setInvName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-emerald-500" required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-bold text-slate-400 mb-1">Correo Electrónico</label><input type="email" value={invEmail} onChange={e=>setInvEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-emerald-500" required /></div>
                    <div><label className="block text-xs font-bold text-slate-400 mb-1">Teléfono</label><input type="tel" value={invPhone} onChange={e=>setInvPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-emerald-500" required /></div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Rol a Asignar</label>
                    <select value={invRole} onChange={e=>setInvRole(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-emerald-500">
                      {Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <Button type="submit" variant="primary" className="w-full py-4 text-lg mt-4" disabled={processingId === 'inviting'} icon={UserCheck}>
                    {processingId === 'inviting' ? 'Generando Acceso...' : 'Crear y Enviar Credenciales'}
                  </Button>
                </form>
              </Card>
            )}
          </>
        )}
      </div>
    );
  };

  const ProfileView = () => {
    const [phone, setPhone] = useState(currentUser.phone || '');
    const [talla, setTalla] = useState(currentUser.talla || 'M');
    const [dieta, setDieta] = useState(currentUser.dieta || 'OMNÍVORA');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSaveProfile = async (e) => {
      e.preventDefault();
      
      // Validación de contraseñas
      if (newPassword && newPassword !== confirmPassword) {
        showToast("Error: Las contraseñas no coinciden.");
        return;
      }

      setSaving(true);
      try {
        const res = await fetch('/.netlify/functions/api', {
          method: 'POST', body: JSON.stringify({
            action: 'updateProfile',
            payload: { email: currentUser.email, phone, talla, dieta, newPassword }
          })
        });
        const json = await res.json();
        if (json.status === 'success') {
          setCurrentUser({...currentUser, phone, talla, dieta});
          setNewPassword(''); 
          setConfirmPassword('');
          showToast("¡Tu perfil y seguridad han sido actualizados exitosamente!");
        } else { showToast("Error: " + json.message); }
      } catch(e) { showToast("Error de conexión al guardar."); }
      setSaving(false);
    };

    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-24 animate-fade-in">
        <header className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-black text-white flex items-center gap-3"><User className="text-emerald-500" size={28} /> Mi Perfil</h1>
          <p className="text-sm text-slate-400 mt-1">Actualiza tus datos de contacto, preferencias y seguridad.</p>
        </header>

        <Card className="p-6 border-t-4 border-emerald-500">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 font-black flex items-center justify-center text-3xl shrink-0 border border-emerald-500/50">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{currentUser.name}</h2>
                <span className="text-xs bg-slate-900 text-emerald-400 px-2 py-1 rounded border border-slate-700 uppercase font-bold mt-1 inline-block">{currentUser.role}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Correo (No modificable)</label>
                  <input type="email" value={currentUser.email} disabled className="w-full bg-slate-900/50 border border-slate-800 rounded-lg p-3 text-slate-500 text-sm outline-none cursor-not-allowed" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Teléfono</label>
                  <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-emerald-500" required />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 flex items-center gap-1"><Shirt size={14}/> Talla Ropa Trabajo</label>
                  <select value={talla} onChange={e=>setTalla(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-emerald-500">
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 flex items-center gap-1"><Coffee size={14}/> Preferencia Alimenticia</label>
                  <select value={dieta} onChange={e=>setDieta(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-emerald-500">
                    <option value="OMNÍVORA">Omnívora (Estándar)</option>
                    <option value="VEGETARIANA">Vegetariana</option>
                    <option value="VEGANA">Vegana</option>
                    <option value="CELÍACA">Celíaca (Sin Gluten)</option>
                  </select>
               </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
               <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2"><Lock size={16}/> Seguridad</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Nueva Contraseña (Opcional)</label>
                    <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Dejar en blanco para no cambiar" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-emerald-500 placeholder:text-slate-600" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Confirmar Contraseña</label>
                    <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Repite tu nueva contraseña" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-emerald-500 placeholder:text-slate-600" />
                 </div>
               </div>
            </div>

            <Button type="submit" variant="primary" className="w-full py-4 text-lg mt-4" disabled={saving} icon={Save}>
              {saving ? 'Guardando...' : 'Guardar Perfil'}
            </Button>
          </form>
        </Card>
      </div>
    );
  };

  const Dashboard = () => {
    return (
      <div className="space-y-6 animate-fade-in pb-24">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-white leading-tight">Hola, {currentUser.name.split(' ')[0]}</h1>
            <p className="text-emerald-400 text-sm font-black uppercase tracking-wider">{currentUser.role}</p>
          </div>
          {[ROLES.ADMIN, ROLES.MANAGER].includes(currentUser.role) && (
            <Button icon={Plus} variant="primary">Nuevo Proyecto</Button>
          )}
        </header>

        <h2 className="text-lg font-bold text-slate-300 border-b border-slate-800 pb-2">Proyectos Activos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTours.map(tour => (
            <Card key={tour.id} className="group hover:border-emerald-500">
              <div className="p-5">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/20"><tour.imageIcon className="text-emerald-500" size={24} /></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">{tour.type}</span>
                <h2 className="text-lg font-bold text-white leading-tight mb-4">{tour.name}</h2>
                <div className="flex flex-row gap-2 border-t border-slate-700 pt-4">
                  <Button variant="ghost" className="flex-1 bg-slate-900 border border-slate-700" icon={Calendar}>Ver Shows</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  if (!currentUser) return <AuthRouter />;
  const menuOptions = getMenuOptions();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[100] bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in"><CheckCircle2 size={20} /><span className="font-bold text-sm">{toastMessage}</span></div>
      )}

      {/* SIDEBAR DESKTOP */}
      <aside className="bg-slate-900 border-r border-slate-800 w-64 shrink-0 hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-5 flex items-center gap-3 border-b border-slate-800"><Music className="text-emerald-500" size={24} /><h1 className="text-xl font-black text-white tracking-widest">ESQUEMAS</h1></div>
        <div className="p-4 flex-1 space-y-2 overflow-y-auto">
          {menuOptions.map(opt => (
            <button key={opt.id} onClick={() => setCurrentView(opt.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-colors text-left ${currentView === opt.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'}`}><opt.icon size={20} />{opt.label}</button>
          ))}
        </div>
        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center gap-3 mb-4 px-2">
             <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-sm font-black text-emerald-500 border border-emerald-500 shrink-0">{currentUser.name.charAt(0)}</div>
             <div className="flex-1 min-w-0"><p className="text-sm font-bold text-white truncate">{currentUser.name}</p><p className="text-[10px] text-slate-400 uppercase font-bold truncate">{currentUser.role}</p></div>
           </div>
           <Button variant="danger" icon={LogOut} onClick={() => setCurrentUser(null)} className="w-full py-2.5 bg-transparent border-transparent hover:bg-red-500/10">Cerrar Sesión</Button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative overflow-y-auto h-screen bg-slate-950">
        <div className="p-4 md:p-8">
          {currentView === 'DASHBOARD' && <Dashboard />}
          {currentView === 'ADMIN_PANEL' && <AdminPanel />}
          {currentView === 'PROFILE' && <ProfileView />}
          {['TIMING', 'CHAT', 'STAFF'].includes(currentView) && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
               <Settings size={48} className="mb-4 text-emerald-500/50" />
               <h2 className="text-xl font-bold text-white mb-2">Módulo en Desarrollo</h2>
               <p>Este módulo será conectado a la base de datos próximamente.</p>
            </div>
          )}
        </div>
      </main>
      
      {/* BOTTOM NAV MOBILE */}
      <nav className="md:hidden fixed bottom-0 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex justify-between px-2 pb-safe z-50 overflow-x-auto hide-scrollbar">
         {menuOptions.map(opt => (
            <button key={opt.id} onClick={() => setCurrentView(opt.id)} className={`flex flex-col items-center justify-center gap-1 p-2 min-w-[70px] flex-1 transition-colors ${currentView === opt.id ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}>
              <opt.icon size={20} className="shrink-0" />
              <span className="text-[10px] font-bold truncate w-full text-center">{opt.label}</span>
            </button>
          ))}
      </nav>
    </div>
  );
}