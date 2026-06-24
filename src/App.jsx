import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Calendar, Clock, Users, Bell, MessageSquare, 
  Truck, Music, CheckCircle2, XCircle, LogOut, Plus, 
  Map, Navigation, User, Settings, Briefcase,
  Mail, Lock, AlertCircle, ArrowLeft, Coffee, Star, Edit3,
  Save, X, DollarSign, Receipt, UploadCloud, FileText, Send, 
  Loader2, Mic2, Shield, HeartPulse, Shirt, CarFront,
  Download, Lightbulb, Volume2, Flame,
  Navigation2, Route, History, Timer, Hourglass,
  CalendarPlus, Phone, ExternalLink, Hotel, Map as MapIcon
} from 'lucide-react';

const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  TOUR_MANAGER: 'TOUR MANAGER',
  TECH: 'TÉCNICO',
  TRASLADO: 'TRASLADO',
  APV: 'APV/CATERING'
};

// --- BASE DE DATOS LOCAL (MOCKS) ---
const mockUsers = [
  { id: 1, name: 'Ana Admin', role: ROLES.ADMIN, phone: '+56911111111', email: 'ana@esquemas.com', password: '123456', privileges: ['TODO_ACCESO'], talla: 'M', dieta: 'OMNIVORA' },
  { id: 2, name: 'Carlos TourMan', role: ROLES.TOUR_MANAGER, phone: '+56922222222', email: 'carlos@esquemas.com', password: '123456', privileges: ['VER_FINANZAS', 'EDITAR_RUTAS'], talla: 'L', dieta: 'VEGETARIANA' },
  { id: 3, name: 'Luis FOH (Sonido)', role: ROLES.TECH, subrole: 'Ingeniero FOH', phone: '+56933333333', email: 'luis@esquemas.com', password: '123456', privileges: ['ACCESO_VIP'], talla: 'XL', dieta: 'OMNIVORA' },
  { id: 4, name: 'Mario (Transporte)', role: ROLES.TRASLADO, subrole: 'Conductor Van 1', phone: '+56944444444', email: 'transporte@esquemas.com', password: '123456', privileges: [], talla: 'M', dieta: 'DIABETICA' },
  { id: 5, name: 'María APV', role: ROLES.APV, subrole: 'Jefa de Catering', phone: '+56955555555', email: 'maria@esquemas.com', password: '123456', privileges: ['VER_FINANZAS'], talla: 'S', dieta: 'VEGANA' },
];

const mockTours = [
  { id: 'T001', name: 'Los Rockers - Gira Sudamérica 2026', type: 'Música', managerId: 2, imageIcon: Music, staffAssigned: [2, 3, 4, 5], budget: 85000 }
];

const now = new Date();
const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

const mockEvents = [
  {
    id: 101, tourId: 'T001', title: 'Prueba de Sonido & Load-in', 
    date: inOneHour.toISOString().split('T')[0], 
    time: `${String(inOneHour.getHours()).padStart(2, '0')}:${String(inOneHour.getMinutes()).padStart(2, '0')}`,
    location: 'Estadio Nacional, Santiago, Chile', 
    pickups: ['Hotel Sheraton, Santiago', 'Providencia 123, Santiago'],
    hotels: ['Hotel Sheraton, Santiago'],
    status: 'CONFIRMED', staffAssigned: [2, 3, 4, 5],
    attendance: { 3: 'PENDING', 4: 'CONFIRMED', 5: 'CONFIRMED' },
    details: { audio: 'PA completo. FOH en torre central. RF coordinado.', catering: 'Camerinos listos a las 14:00 con café caliente.', logistica: 'Ingreso camiones por puerta 4. Control de acceso estricto.' }
  }
];

const mockRoutes = [
  {
    id: 'R001', tourId: 'T001', eventId: 101, driverId: 4, driverName: 'Mario (Van 1)', title: 'Ruta Load-In Staff & FOH', date: now.toISOString().split('T')[0], status: 'IN_PROGRESS', 
    stops: [
      { id: 'S1', time: '13:00', location: 'Hotel Sheraton, Santiago', passengers: 'María APV', status: 'COMPLETED' },
      { id: 'S2', time: '13:45', location: 'Providencia 123, Santiago', passengers: 'Luis FOH', status: 'PENDING' },
      { id: 'S3', time: '14:30', location: 'Estadio Nacional, Santiago', passengers: 'Todos', status: 'PENDING', isDropoff: true }
    ]
  },
  {
    id: 'R002', tourId: 'T001', eventId: 101, driverId: 99, driverName: 'Pedro (Van 2)', title: 'Ruta Artistas', date: now.toISOString().split('T')[0], status: 'PENDING', 
    stops: [
      { id: 'S4', time: '18:00', location: 'Hotel W, Santiago', passengers: 'Banda Principal', status: 'PENDING' },
      { id: 'S5', time: '18:30', location: 'Estadio Nacional, Santiago', passengers: 'Banda Principal', status: 'PENDING', isDropoff: true }
    ]
  }
];

const mockBudgetHistory = [
  { id: 1, tourId: 'T001', date: '2026-06-20', user: 'Ana Admin', type: 'AJUSTE_PRESUPUESTO', amount: 85000, desc: 'Presupuesto inicial aprobado por producción.' },
  { id: 2, tourId: 'T001', date: '2026-06-21', user: 'Carlos TourMan', type: 'GASTO', amount: -1500, desc: 'Pago anticipo empresa de transportes.' }
];

const mockChats = [
  { id: 1, tourId: 'T001', userId: 2, text: '¡Bienvenidos a la gira! Revisen el timing de mañana, cualquier duda por aquí.', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, tourId: 'T001', userId: 3, text: 'Recibido. El PA ya está volado. Listos para ecualizar.', timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: 3, tourId: 'T001', userId: 5, text: 'El comedor de staff estará listo a las 13:00 hrs puntuales.', timestamp: new Date(Date.now() - 900000).toISOString() }
];

// --- COMPONENTES REUTILIZABLES ---
const Card = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden ${onClick ? 'cursor-pointer hover:border-emerald-500 transition-colors' : ''} ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, type = 'button', disabled = false }) => {
  const base = "flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 text-center leading-tight disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 shadow-lg",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/50",
    accent: "bg-amber-500 hover:bg-amber-400 text-slate-900",
    ghost: "bg-transparent hover:bg-slate-700 text-slate-300",
    blue: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 shadow-lg"
  };
  return <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>{Icon && <Icon size={18} className="shrink-0" />}<span className="truncate">{children}</span></button>;
};

const openMap = (query) => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
const openWhatsApp = (phone) => window.open(`https://wa.me/${phone.replace('+', '')}`, '_blank');
const generateGCalLink = (event) => {
  const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  const text = encodeURIComponent(`[ESQUEMAS] ${event.title}`);
  const dateStr = event.date.replace(/-/g, '');
  const timeStr = event.time.replace(':', '');
  const endHour = String((parseInt(timeStr.substring(0,2)) + 3) % 24).padStart(2, '0');
  const dates = `${dateStr}T${timeStr}00Z/${dateStr}T${endHour}${timeStr.substring(2)}00Z`;
  return `${base}&text=${text}&dates=${dates}&location=${encodeURIComponent(event.location)}`;
};


export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('DASHBOARD');
  const [toastMessage, setToastMessage] = useState(null);
  
  const [tours, setTours] = useState(mockTours);
  const [events, setEvents] = useState(mockEvents);
  const [routesData, setRoutesData] = useState(mockRoutes);
  const [budgetHistory, setBudgetHistory] = useState(mockBudgetHistory);
  const [chats, setChats] = useState(mockChats);
  const [notifications, setNotifications] = useState([
    { id: 1, userId: 3, text: 'Tu acreditación VIP ha sido aprobada.', read: false, type: 'ALERT' }
  ]);
  
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
    
    if (r === ROLES.ADMIN || r === ROLES.MANAGER) return [ { id: 'DASHBOARD', label: 'Proyectos', icon: Navigation }, time, chat, { id: 'TRASLADOS', label: 'Torre de Control', icon: Route }, { id: 'FINANCES', label: 'Finanzas', icon: DollarSign }, dir ];
    if (r === ROLES.TOUR_MANAGER) return [ { id: 'DASHBOARD', label: 'Giras', icon: Music }, time, chat, { id: 'TRASLADOS', label: 'Logística', icon: Truck }, dir ];
    if (r === ROLES.TECH) return [ { id: 'DASHBOARD', label: 'Trabajos', icon: Calendar }, time, chat, { id: 'RIDERS', label: 'Riders', icon: FileText }, { id: 'PROFILE', label: 'Perfil', icon: User } ];
    if (r === ROLES.APV) return [ { id: 'DASHBOARD', label: 'Trabajos', icon: Calendar }, time, chat, { id: 'CATERING', label: 'Catering', icon: Coffee }, { id: 'PROFILE', label: 'Perfil', icon: User } ];
    if (r === ROLES.TRASLADO) return [ { id: 'TRASLADOS', label: 'Mi Ruta', icon: Map }, chat, dir, { id: 'PROFILE', label: 'Vehículo', icon: CarFront } ];
    return [];
  };

  // --- 1. RUTAS DE AUTENTICACIÓN (PROXY Y LOCAL) ---
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
      setError('');
      setLoading(true);
      
      try {
        const response = await fetch('/.netlify/functions/api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            payload: { email, password: pass }
          })
        });
        
        if (response.ok) {
           const data = await response.json();
           if (data.status === 'success') {
             setCurrentUser(data.user);
             setLoading(false);
             return;
           } else {
             setError(data.message || "Credenciales incorrectas o usuario no aprobado.");
             setLoading(false);
             return;
           }
        } else {
           throw new Error("Proxy no disponible");
        }
      } catch (err) {
        console.warn("Servidor Netlify no detectado. Pasando a entorno de pruebas local (Mocks).");
        
        // Fallback a Base de Datos Local
        setTimeout(() => {
          const u = mockUsers.find(x => x.email.toLowerCase() === email.toLowerCase() && x.password === pass);
          if (u) {
            setCurrentUser(u);
          } else {
            setError("Credenciales inválidas. Verifica tu correo y contraseña.");
          }
          setLoading(false);
        }, 800);
      }
    };

    const handleRegister = async (e) => {
      e.preventDefault();
      setError(''); 
      setLoading(true);
      
      try {
        const response = await fetch('/.netlify/functions/api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'solicitarAcceso',
            payload: { name: regName, email, phone: regPhone, role: regRole }
          })
        });
        
        if (!response.ok) throw new Error("Error conectando con el servidor");

        const result = await response.json();
        if (result.status === 'success') {
           setMode('LOGIN');
           alert("¡Solicitud enviada! Una vez el administrador te apruebe, te enviaremos tu clave temporal al correo.");
        } else {
           setError(result.message || 'Error al solicitar acceso.');
        }
      } catch (err) {
        setError('Error de red. Para probar el registro en vivo debes usar el comando "netlify dev".');
      }
      setLoading(false);
    };

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="mb-8 text-center animate-fade-in">
          <Music className="text-emerald-500 mx-auto mb-4" size={48} />
          <h1 className="text-4xl font-black text-white tracking-wider">ESQUEMAS</h1>
          <p className="text-slate-400 mt-2 tracking-widest text-sm uppercase">Production Management</p>
        </div>
        <Card className="w-full max-w-md p-8 animate-slide-up">
          <div className="mb-6 text-center border-b border-slate-800 pb-4">
            <h2 className="text-2xl font-bold text-white">{mode === 'LOGIN' ? 'Iniciar Sesión' : 'Solicitar Acceso'}</h2>
          </div>
          
          {mode === 'LOGIN' ? (
            <form onSubmit={handleLogin} className="space-y-5">
               <p className="text-xs text-emerald-500 bg-emerald-500/10 p-3 rounded text-center border border-emerald-500/20">
                 <Shield size={14} className="inline mr-1" />
                 <b>Conexión Segura Activa</b><br/>
                 Tus credenciales viajan encriptadas. (Prueba: luis@esquemas.com / 123456)
               </p>
               
               {error && (
                 <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg flex items-center justify-center gap-2 animate-fade-in">
                   <AlertCircle size={16} className="shrink-0" />
                   <span>{error}</span>
                 </div>
               )}

              <div><label className="block text-xs font-medium text-slate-400 mb-1">Correo Electrónico</label><div className="relative"><Mail className="absolute left-3 top-3 text-slate-500" size={18} /><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@correo.com" className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:border-emerald-500 outline-none transition-colors" required /></div></div>
              <div><label className="block text-xs font-medium text-slate-400 mb-1">Contraseña</label><div className="relative"><Lock className="absolute left-3 top-3 text-slate-500" size={18} /><input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:border-emerald-500 outline-none transition-colors" required /></div></div>
              <Button type="submit" className="w-full py-3" disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : 'Ingresar a Plataforma'}</Button>
              <p className="text-center text-xs text-slate-400 mt-4">¿No eres parte del Crew aún? <button type="button" onClick={()=>setMode('REGISTER')} className="text-emerald-500 font-bold hover:underline">Solicita Acceso</button></p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {error && <div className="bg-red-500/10 text-red-500 border border-red-500/30 text-sm p-3 rounded-lg text-center flex items-center gap-2"><AlertCircle size={16} className="shrink-0" /><span>{error}</span></div>}
              <div><label className="block text-xs font-medium text-slate-400 mb-1">Nombre Completo</label><input type="text" value={regName} onChange={e=>setRegName(e.target.value)} placeholder="Ej: Juan Pérez" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-emerald-500" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-400 mb-1">Correo (Corporativo)</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@correo.com" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-emerald-500" required /></div>
                <div><label className="block text-xs font-medium text-slate-400 mb-1">Teléfono</label><input type="tel" value={regPhone} onChange={e=>setRegPhone(e.target.value)} placeholder="+569..." className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-emerald-500" required /></div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Área Principal / Rol</label>
                <select value={regRole} onChange={e=>setRegRole(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none focus:border-emerald-500 appearance-none" required>
                  {Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <Button type="submit" className="w-full py-3 mt-2" disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : 'Enviar Solicitud de Crew'}</Button>
              <p className="text-center text-xs text-slate-400 mt-4">¿Ya fuiste aprobado? <button type="button" onClick={()=>setMode('LOGIN')} className="text-emerald-500 font-bold hover:underline">Vuelve al Login</button></p>
            </form>
          )}
        </Card>
      </div>
    );
  };

  // --- 2. DASHBOARD Y PROYECTOS ---
  const Dashboard = () => {
    const [selectedTour, setSelectedTour] = useState(null);
    const visibleTours = tours.filter(t => [ROLES.ADMIN, ROLES.MANAGER].includes(currentUser.role) || t.managerId === currentUser.id || t.staffAssigned?.includes(currentUser.id));
    const myNotifications = notifications.filter(n => n.userId === currentUser.id && !n.read);

    if (!selectedTour) {
      return (
        <div className="space-y-6 animate-fade-in pb-24">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white leading-tight">Hola, {currentUser.name.split(' ')[0]}</h1>
              <p className="text-emerald-400 text-sm font-bold uppercase tracking-wider">{currentUser.role}</p>
            </div>
            {[ROLES.ADMIN, ROLES.MANAGER].includes(currentUser.role) && (
              <Button icon={Plus} onClick={() => setCurrentView('TOUR_FORM')}>Nuevo Proyecto (Gira)</Button>
            )}
          </header>

          {myNotifications.map(note => (
            <div key={note.id} className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-4 flex gap-3 items-start mb-6">
              <Bell className="text-emerald-400 shrink-0 mt-0.5" size={18} />
              <div className="flex-1"><h3 className="text-emerald-400 font-bold text-sm">Notificación</h3><p className="text-slate-300 text-sm">{note.text}</p></div>
              <button className="text-slate-400 hover:text-white" onClick={() => setNotifications(prev => prev.filter(n => n.id !== note.id))}><X size={16}/></button>
            </div>
          ))}

          <h2 className="text-lg font-bold text-slate-300 border-b border-slate-800 pb-2">Tus Proyectos Activos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleTours.map(tour => (
              <Card key={tour.id} onClick={() => setSelectedTour(tour)} className="group cursor-pointer hover:border-emerald-500">
                <div className="p-5">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/20"><tour.imageIcon className="text-emerald-500" size={20} /></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">{tour.type}</span>
                  <h2 className="text-lg font-bold text-white leading-tight">{tour.name}</h2>
                </div>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    const tourEvents = events.filter(e => e.tourId === selectedTour.id);

    return (
      <div className="space-y-6 animate-fade-in pb-24">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setSelectedTour(null)} className="p-2 border border-slate-700"><ArrowLeft size={18}/></Button>
            <div><h1 className="text-xl font-bold text-white">{selectedTour.name}</h1><p className="text-slate-400 text-xs">Run of Show</p></div>
          </div>
          {[ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role) && (
            <Button icon={Plus} onClick={() => setCurrentView(`EVENT_FORM_${selectedTour.id}`)}>Añadir Show</Button>
          )}
        </div>

        <div className="space-y-4">
          {tourEvents.map(ev => {
             const status = ev.attendance?.[currentUser.id] || 'PENDING';
             const isCrew = [ROLES.TECH, ROLES.APV, ROLES.TRASLADO].includes(currentUser.role);
             
             return (
               <Card key={ev.id} className="border-l-4 border-l-emerald-500">
                 <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-center min-w-[70px] shrink-0 h-fit">
                      <span className="block text-[10px] text-emerald-400 font-bold uppercase">{new Date(ev.date).toLocaleDateString('es-ES', {month:'short'})}</span>
                      <span className="block text-2xl font-black text-white">{ev.date.split('-')[2]}</span>
                    </div>
                    <div className="flex-1">
                       <h3 className="text-lg font-bold text-white">{ev.title}</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                         <div className="text-xs text-slate-300 flex items-start gap-1.5"><Clock size={14} className="shrink-0 text-emerald-500"/> Call Time: {ev.time}</div>
                         <div className="text-xs text-slate-300 flex items-start gap-1.5 cursor-pointer hover:text-white" onClick={() => openMap(ev.location)}><MapPin size={14} className="shrink-0 text-blue-500"/> {ev.location} <ExternalLink size={10} className="mt-0.5 ml-1"/></div>
                       </div>
                       
                       {ev.details && isCrew && (
                         <div className="bg-slate-900/80 rounded border border-slate-700 p-3 mt-3">
                           <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Brief Específico del Área</span>
                           {currentUser.role === ROLES.TECH && ev.details.audio && <p className="text-xs text-emerald-100 flex items-start gap-2"><Volume2 size={14} className="text-emerald-500 shrink-0"/>{ev.details.audio}</p>}
                           {currentUser.role === ROLES.APV && ev.details.catering && <p className="text-xs text-amber-100 flex items-start gap-2"><Coffee size={14} className="text-amber-500 shrink-0"/>{ev.details.catering}</p>}
                           {currentUser.role === ROLES.TRASLADO && ev.details.logistica && <p className="text-xs text-blue-100 flex items-start gap-2"><Truck size={14} className="text-blue-500 shrink-0"/>{ev.details.logistica}</p>}
                         </div>
                       )}
                    </div>
                    
                    <div className="flex flex-col gap-2 shrink-0 md:w-48 border-t border-slate-700 md:border-t-0 pt-3 md:pt-0">
                       <a href={generateGCalLink(ev)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 text-white text-xs py-2 rounded-lg transition"><CalendarPlus size={14}/> Guardar en Calendario</a>
                       
                       {isCrew && status === 'PENDING' && (
                         <div className="flex gap-2 mt-2">
                           <Button variant="primary" className="flex-1 py-2 text-xs" onClick={() => { setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, attendance: { ...e.attendance, [currentUser.id]: 'CONFIRMED' } } : e)); showToast('Asistencia confirmada'); }}><CheckCircle2 size={14}/> Voy</Button>
                           <Button variant="danger" className="flex-1 py-2 text-xs" onClick={() => { setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, attendance: { ...e.attendance, [currentUser.id]: 'DECLINED' } } : e)); showToast('Asistencia declinada'); }}><X size={14}/> No voy</Button>
                         </div>
                       )}
                       {isCrew && status === 'CONFIRMED' && <div className="text-center text-[10px] font-bold text-emerald-400 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded">✓ ASISTENCIA CONFIRMADA</div>}
                       {isCrew && status === 'DECLINED' && <div className="text-center text-[10px] font-bold text-red-400 py-2 bg-red-500/10 border border-red-500/20 rounded">✗ ASISTENCIA DECLINADA</div>}
                    </div>
                 </div>
               </Card>
             );
          })}
        </div>
      </div>
    );
  };

  // --- 3. FORMULARIO DE CREACIÓN DE SHOWS ---
  const EventForm = () => {
    const parentTourId = currentView.replace('EVENT_FORM_', '');
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [audioDetails, setAudioDetails] = useState('');
    const [cateringDetails, setCateringDetails] = useState('');
    const [logisticsDetails, setLogisticsDetails] = useState('');

    const handleSave = (e) => {
      e.preventDefault();
      setEvents([...events, { 
        id: Date.now(), tourId: parentTourId, title, date, time, location, 
        hotels: [], pickups: [], status: 'CONFIRMED', staffAssigned: [], attendance: {}, 
        details: { audio: audioDetails, catering: cateringDetails, logistica: logisticsDetails } 
      }]);
      showToast("Show creado y briefs asignados.");
      setCurrentView('DASHBOARD');
    };

    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-24 animate-fade-in">
         <header className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <Button variant="ghost" onClick={() => setCurrentView('DASHBOARD')} className="p-2 border border-slate-700"><ArrowLeft size={18}/></Button>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Calendar className="text-emerald-500"/> Añadir Show al Proyecto</h1>
        </header>
        <form onSubmit={handleSave} className="space-y-6">
           <Card className="p-5">
             <h2 className="text-sm font-bold text-emerald-400 mb-4 border-b border-slate-700 pb-2">Información General</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label className="block text-xs text-slate-400 mb-1">Título del Show</label><input required value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white" /></div>
                <div><label className="block text-xs text-slate-400 mb-1">Fecha</label><input type="date" required value={date} onChange={e=>setDate(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white" /></div>
                <div><label className="block text-xs text-slate-400 mb-1">Call Time Oficial</label><input type="time" required value={time} onChange={e=>setTime(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white" /></div>
                <div className="md:col-span-2"><label className="block text-xs text-slate-400 mb-1"><MapPin size={12} className="inline mr-1"/>Venue / Lugar</label><input required value={location} onChange={e=>setLocation(e.target.value)} placeholder="Ej: Estadio Nacional, Santiago" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white" /></div>
             </div>
           </Card>

           <Card className="p-5">
             <h2 className="text-sm font-bold text-blue-400 mb-4 border-b border-slate-700 pb-2">Briefs por Área (Sub-eventos)</h2>
             <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-1"><Volume2 size={14} className="text-emerald-500"/> Audio / FOH / Stage</label>
                  <textarea value={audioDetails} onChange={e=>setAudioDetails(e.target.value)} placeholder="Ej: FOH en torre central, microfonía RF requerida..." className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white h-20 text-sm" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-1"><Coffee size={14} className="text-amber-500"/> Catering / APV</label>
                  <textarea value={cateringDetails} onChange={e=>setCateringDetails(e.target.value)} placeholder="Ej: Montaje de comedor a las 13:00hrs..." className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white h-20 text-sm" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-1"><Truck size={14} className="text-blue-500"/> Logística / Traslados</label>
                  <textarea value={logisticsDetails} onChange={e=>setLogisticsDetails(e.target.value)} placeholder="Ej: Ingreso exclusivo por puerta sur..." className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white h-20 text-sm" />
                </div>
             </div>
           </Card>
           <Button type="submit" className="w-full py-4 text-lg">Guardar Show y Notificar Staff</Button>
        </form>
      </div>
    );
  };

  // --- 4. TIMING EN VIVO ---
  const TimingView = () => {
    const [realTime, setRealTime] = useState(new Date());
    useEffect(() => { const timer = setInterval(() => setRealTime(new Date()), 1000); return () => clearInterval(timer); }, []);
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-24 animate-fade-in">
        <header className="border-b border-slate-800 pb-4"><h1 className="text-2xl font-bold text-white flex items-center gap-2"><Timer className="text-emerald-500" /> Run of Show (En vivo)</h1></header>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-2">HORA LOCAL</p>
           <h2 className="text-6xl md:text-8xl font-black text-white tracking-wider font-mono drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">{realTime.toLocaleTimeString('es-ES', {hour12: false})}</h2>
        </div>
      </div>
    );
  };

  // --- 5. LOGÍSTICA Y TRASLADOS (CONDUCTOR VS ADMIN) ---
  const TrasladosView = () => {
    // VISTA DEL CONDUCTOR (MÓVIL / ULTRA SIMPLIFICADA)
    if (currentUser.role === ROLES.TRASLADO) {
      const myRoute = routesData.find(r => r.driverId === currentUser.id);
      
      if (!myRoute) return <div className="text-center mt-20 text-slate-400">No tienes rutas asignadas para hoy.</div>;

      const activeStopIndex = myRoute.stops.findIndex(s => s.status !== 'COMPLETED');
      const isRouteFinished = activeStopIndex === -1;

      const getButtonState = (status) => {
        if (status === 'PENDING') return { color: 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-amber-900/50', text: '🟡 LLEGUÉ AL PUNTO', next: 'ARRIVED' };
        if (status === 'ARRIVED') return { color: 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-900/50', text: '🟢 PASAJEROS A BORDO', next: 'IN_TRANSIT' };
        if (status === 'IN_TRANSIT') return { color: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50', text: '🔵 LLEGADA A DESTINO', next: 'COMPLETED' };
        return null;
      };

      const handleAction = (stopId, nextStatus) => {
        setRoutesData(prev => prev.map(r => {
          if (r.id !== myRoute.id) return r;
          const updatedStops = r.stops.map(s => s.id === stopId ? { ...s, status: nextStatus } : s);
          return { ...r, stops: updatedStops, status: updatedStops.every(s => s.status === 'COMPLETED') ? 'COMPLETED' : 'IN_PROGRESS' };
        }));
      };

      return (
        <div className="max-w-md mx-auto space-y-6 pb-24 animate-fade-in pt-4">
          <header className="mb-6 text-center">
            <h1 className="text-2xl font-black text-white">{myRoute.title}</h1>
            <p className="text-blue-400 font-bold uppercase text-xs mt-1">{new Date(myRoute.date).toLocaleDateString()}</p>
          </header>

          {isRouteFinished ? (
            <Card className="p-8 text-center border-t-4 border-emerald-500"><CheckCircle2 size={64} className="mx-auto text-emerald-500 mb-4"/><h2 className="text-white text-xl font-bold">Ruta Finalizada</h2><p className="text-slate-400 text-sm mt-2">Excelente trabajo.</p></Card>
          ) : (
            <div className="relative border-l-4 border-slate-700 ml-4 space-y-8 pb-4">
              {myRoute.stops.map((stop, index) => {
                const isCompleted = stop.status === 'COMPLETED';
                const isActive = index === activeStopIndex;
                const btnConfig = isActive ? getButtonState(stop.status) : null;

                return (
                  <div key={stop.id} className={`relative pl-8 transition-all duration-500 ${isCompleted ? 'opacity-30 grayscale' : 'opacity-100'} ${isActive ? 'scale-105 transform origin-left' : ''}`}>
                    <div className={`absolute -left-[14px] top-2 w-6 h-6 rounded-full border-4 border-slate-900 flex items-center justify-center ${isCompleted ? 'bg-emerald-500' : isActive ? 'bg-amber-500 animate-pulse' : 'bg-slate-600'}`}></div>
                    
                    <div className={`bg-slate-900 p-5 rounded-xl border ${isActive ? 'border-amber-500/50 shadow-lg shadow-amber-900/20' : 'border-slate-800'}`}>
                      <h3 className="text-2xl font-black text-white mb-1">{stop.time}</h3>
                      <p className="text-sm font-medium text-blue-300 mb-3 flex items-start gap-2"><MapPin size={16} className="shrink-0 mt-0.5 text-blue-500"/>{stop.location}</p>
                      
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mb-4">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Pasajeros</span>
                        <p className="text-sm text-white font-medium">{stop.passengers}</p>
                      </div>

                      {isActive && btnConfig && (
                        <button 
                          onClick={() => handleAction(stop.id, btnConfig.next)}
                          className={`w-full py-5 rounded-xl text-lg font-black shadow-xl transition-transform active:scale-95 ${btnConfig.color}`}>
                          {btnConfig.text}
                        </button>
                      )}
                      
                      {!isActive && !isCompleted && (
                        <button onClick={() => openMap(stop.location)} className="w-full py-3 bg-slate-800 text-slate-300 text-sm font-bold rounded-lg flex justify-center items-center gap-2"><Navigation2 size={16}/> Ver en Mapa</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // VISTA "TORRE DE CONTROL" (ADMIN / TOUR MANAGER)
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-24 animate-fade-in">
        <header className="border-b border-slate-800 pb-4 flex justify-between items-end">
          <div><h1 className="text-2xl font-bold text-white flex items-center gap-2"><MapIcon className="text-blue-500"/> Torre de Control</h1><p className="text-slate-400 text-sm mt-1">Monitoreo de Rutas en Vivo</p></div>
          <Button icon={Plus} variant="secondary" className="border-slate-600">Crear Ruta</Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {routesData.map(route => {
            const totalStops = route.stops.length;
            const completedStops = route.stops.filter(s => s.status === 'COMPLETED').length;
            const progress = (completedStops / totalStops) * 100;
            const activeStop = route.stops.find(s => s.status !== 'COMPLETED');

            return (
              <Card key={route.id} className="border-t-4 border-blue-500 flex flex-col">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{route.title}</h3>
                      <p className="text-sm text-slate-400 flex items-center gap-1"><CarFront size={14}/> {route.driverName}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${route.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-400'}`}>
                      {route.status === 'COMPLETED' ? 'Finalizada' : 'En Progreso'}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Progreso</span><span>{completedStops} de {totalStops} paradas</span></div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden"><div className="bg-blue-500 h-2 rounded-full transition-all" style={{width: `${progress}%`}}></div></div>
                  </div>

                  {activeStop && (
                     <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                       <span className="text-[10px] font-bold text-amber-500 uppercase block mb-1">Siguiente Parada Activa</span>
                       <div className="flex justify-between items-center">
                         <div className="text-sm font-medium text-white">{activeStop.time} - {activeStop.location}</div>
                         <div className="text-xs px-2 py-1 bg-slate-800 rounded border border-slate-600 text-slate-300">{activeStop.status}</div>
                       </div>
                     </div>
                  )}
                </div>
                <div className="mt-auto border-t border-slate-700 bg-slate-900/30 flex p-2 gap-2">
                  <Button variant="ghost" className="flex-1 py-2 text-xs border border-slate-700 hover:bg-slate-800"><Edit3 size={14}/> Editar Ruta</Button>
                  <Button variant="ghost" className="flex-1 py-2 text-xs border border-slate-700 hover:bg-slate-800"><MessageSquare size={14}/> Contactar</Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    );
  };

  // --- 6. FINANZAS CON AUDITORÍA ---
  const FinancesView = () => {
    const budget = tours[0].budget;
    const spent = budgetHistory.filter(h => h.amount < 0).reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
    const totalAdjustments = budgetHistory.filter(h => h.amount > 0).reduce((acc, curr) => acc + curr.amount, 0);
    const currentBudget = totalAdjustments;
    const pct = currentBudget > 0 ? Math.round((spent/currentBudget)*100) : 0;

    const [isAdjusting, setIsAdjusting] = useState(false);
    const [newAmount, setNewAmount] = useState('');
    const [justification, setJustification] = useState('');

    const handleAjuste = (e) => {
      e.preventDefault();
      const numAmount = parseFloat(newAmount);
      if(!numAmount || !justification) return;
      
      setBudgetHistory([{
        id: Date.now(), tourId: 'T001', date: new Date().toISOString().split('T')[0], 
        user: currentUser.name, type: 'AJUSTE_PRESUPUESTO', amount: numAmount, desc: justification
      }, ...budgetHistory]);
      
      showToast("Ajuste de presupuesto registrado exitosamente.");
      setIsAdjusting(false); setNewAmount(''); setJustification('');
    };

    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-24 animate-fade-in">
         <header className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><DollarSign className="text-amber-500" /> Presupuesto y Auditoría</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="p-6 md:col-span-2 border-t-4 border-amber-500">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-slate-400 text-sm font-bold mb-1">Presupuesto Aprobado (Gira)</h3>
                  <div className="text-4xl font-black text-white">${currentBudget.toLocaleString()} USD</div>
                </div>
                <Button variant="secondary" onClick={() => setIsAdjusting(!isAdjusting)} className="border border-slate-600"><Settings size={16}/> Ajustar</Button>
              </div>

              {isAdjusting && (
                <form onSubmit={handleAjuste} className="bg-slate-900 p-4 rounded-xl border border-slate-700 mb-6 space-y-4 animate-slide-up">
                  <h4 className="text-sm font-bold text-amber-400 border-b border-slate-800 pb-2">Registrar Nuevo Ajuste</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-xs text-slate-400 mb-1">Monto (+/-)</label><input type="number" required value={newAmount} onChange={e=>setNewAmount(e.target.value)} placeholder="Ej: 5000" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" /></div>
                    <div><label className="block text-xs text-slate-400 mb-1">Justificación Obligatoria</label><input required value={justification} onChange={e=>setJustification(e.target.value)} placeholder="Motivo del ajuste..." className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" /></div>
                  </div>
                  <Button type="submit" variant="primary" className="w-full py-3">Confirmar Ajuste en Auditoría</Button>
                </form>
              )}

              <div className="w-full bg-slate-900 rounded-full h-4 mb-2 overflow-hidden"><div className="bg-gradient-to-r from-emerald-500 to-amber-500 h-4 rounded-full" style={{width: `${pct}%`}}></div></div>
              <div className="flex justify-between text-xs text-slate-400"><span>Gastado: ${spent.toLocaleString()}</span><span>{pct}% utilizado</span></div>
           </Card>

           <Card className="p-6 flex flex-col justify-center items-center text-center bg-slate-900/50">
             <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4"><Receipt className="text-emerald-500" size={32}/></div>
             <h3 className="text-white font-bold text-lg">Rendir Nuevo Gasto</h3>
             <p className="text-xs text-slate-400 mt-1 mb-4">Añade boletas y asocia el monto.</p>
             <Button variant="primary" className="w-full text-sm py-3"><UploadCloud size={16}/> Declarar Gasto</Button>
           </Card>

           <Card className="md:col-span-3 p-0 overflow-hidden">
             <div className="p-4 border-b border-slate-800 bg-slate-900"><h3 className="text-white font-bold flex items-center gap-2"><History size={18} className="text-slate-400"/> Historial de Movimientos (Inmutable)</h3></div>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-slate-300">
                 <thead className="bg-slate-900/50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Usuario</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Monto</th><th className="px-4 py-3">Justificación</th></tr></thead>
                 <tbody className="divide-y divide-slate-800">
                   {budgetHistory.map(h => (
                     <tr key={h.id} className="hover:bg-slate-800/50">
                       <td className="px-4 py-3 whitespace-nowrap">{h.date}</td>
                       <td className="px-4 py-3 font-medium text-white">{h.user}</td>
                       <td className="px-4 py-3"><span className={`text-[10px] px-2 py-1 rounded font-bold ${h.amount > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-400'}`}>{h.type}</span></td>
                       <td className={`px-4 py-3 font-black ${h.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{h.amount > 0 ? '+' : ''}{h.amount.toLocaleString()}</td>
                       <td className="px-4 py-3 text-xs">{h.desc}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </Card>
        </div>
      </div>
    );
  };

  // --- 7. CHAT INTERNO (NATIVO & ROLES) ---
  const ChatView = () => {
    const visibleTours = tours.filter(t => [ROLES.ADMIN, ROLES.MANAGER].includes(currentUser.role) || t.managerId === currentUser.id || t.staffAssigned?.includes(currentUser.id));
    const [activeTourId, setActiveTourId] = useState(visibleTours[0]?.id || null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    
    const activeTour = tours.find(t => t.id === activeTourId);
    const tourChats = chats.filter(c => c.tourId === activeTourId);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [tourChats]);

    const handleSend = (e) => {
      e.preventDefault();
      if (!newMessage.trim()) return;
      setChats([...chats, { id: Date.now(), tourId: activeTourId, userId: currentUser.id, text: newMessage.trim(), timestamp: new Date().toISOString() }]);
      setNewMessage('');
    };

    const getRoleColor = (role) => {
      switch(role) {
        case ROLES.ADMIN: case ROLES.MANAGER: return 'bg-red-500/20 text-red-400 border-red-500/30';
        case ROLES.TOUR_MANAGER: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        case ROLES.TECH: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case ROLES.APV: return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        case ROLES.TRASLADO: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        default: return 'bg-slate-700 text-slate-300 border-slate-600';
      }
    };

    if (!activeTour) return <div className="text-center mt-20 text-slate-500">No tienes proyectos asignados.</div>;

    return (
      <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] md:h-[calc(100vh-100px)] flex flex-col pb-safe md:pb-0 animate-fade-in">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2"><MessageSquare className="text-emerald-500" /> Sala de Chat</h1>
          </div>
          <select value={activeTourId} onChange={(e) => setActiveTourId(e.target.value)} className="w-full sm:w-64 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-bold outline-none appearance-none">
            {visibleTours.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </header>

        <Card className="flex-1 flex flex-col overflow-hidden border-t-4 border-t-emerald-500">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/40">
            {tourChats.map(chat => {
              const sender = mockUsers.find(u => u.id === chat.userId);
              const isMe = chat.userId === currentUser.id;
              
              return (
                <div key={chat.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && sender && (
                    <div className="flex items-center gap-2 mb-1 ml-1">
                      <span className="text-xs font-bold text-slate-300">{sender.name}</span>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border tracking-wider ${getRoleColor(sender.role)}`}>
                        {sender.role}
                      </span>
                    </div>
                  )}
                  
                  <div className={`p-3 rounded-2xl text-sm shadow-md max-w-[85%] md:max-w-[70%] ${isMe ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none'}`}>
                    {chat.text}
                    <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-emerald-200' : 'text-slate-500'}`}>
                      {new Date(chat.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-3 bg-slate-900 border-t border-slate-700">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input 
                type="text" 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                placeholder="Escribe un mensaje al equipo..." 
                className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-5 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-colors" 
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()} 
                className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:bg-slate-700 flex items-center justify-center text-white shrink-0 transition-all shadow-lg shadow-emerald-900/20"
              >
                <Send size={18} className="-ml-0.5" />
              </button>
            </form>
          </div>
        </Card>
      </div>
    );
  };

  // --- 8. OTRAS VISTAS (STAFF, RIDERS, CATERING) ---
  const StaffView = () => {
    const [filter, setFilter] = useState('ALL');
    const filteredUsers = filter === 'ALL' ? mockUsers : mockUsers.filter(u => u.role === filter);

    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-24 animate-fade-in">
        <header className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-4"><Users className="text-emerald-500" /> Directorio de Crew</h1>
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            <button onClick={()=>setFilter('ALL')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${filter==='ALL' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Todos</button>
            {Object.values(ROLES).map(r => (
              <button key={r} onClick={()=>setFilter(r)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${filter===r ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{r}</button>
            ))}
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredUsers.map(u => (
            <Card key={u.id} className="p-5 flex flex-col">
               <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center text-xl">{u.name.charAt(0)}</div>
                 <div>
                   <h3 className="font-bold text-white text-lg leading-tight">{u.name}</h3>
                   <span className="text-[10px] bg-slate-900 text-emerald-400 px-2 py-0.5 rounded border border-slate-700 uppercase">{u.subrole || u.role}</span>
                 </div>
               </div>
               <div className="mt-auto space-y-2 pt-4 border-t border-slate-700/50">
                 <div className="text-xs text-slate-300 flex justify-between"><span>Talla: <b>{u.talla}</b></span><span>Dieta: <b>{u.dieta}</b></span></div>
                 <div className="flex gap-2 mt-2">
                   <Button variant="secondary" className="flex-1 py-1.5 text-xs bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20" onClick={() => openWhatsApp(u.phone)}><Phone size={14}/> WhatsApp</Button>
                   <Button variant="secondary" className="flex-1 py-1.5 text-xs" onClick={() => window.location.href=`mailto:${u.email}`}><Mail size={14}/> Correo</Button>
                 </div>
               </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const RidersView = () => {
    const ridersList = [
      { id: 1, title: 'Rider Sonido FOH', icon: Volume2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      { id: 2, title: 'Rider Iluminación (Plot)', icon: Lightbulb, color: 'text-amber-400', bg: 'bg-amber-400/10' },
      { id: 3, title: 'STAGEPLOT Oficial', icon: MapIcon, color: 'text-red-400', bg: 'bg-red-400/10' },
    ];
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-24 animate-fade-in"><header className="mb-6 border-b border-slate-800 pb-4"><h1 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="text-emerald-500" /> Riders y Stageplots</h1></header><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{ridersList.map(rider => (<Card key={rider.id} className="flex flex-col group"><div className="p-5 flex-1 flex items-start gap-4"><div className={`w-12 h-12 rounded-lg ${rider.bg} flex items-center justify-center shrink-0`}><rider.icon className={rider.color} size={24}/></div><div><h3 className="text-sm font-bold text-white leading-tight mb-1">{rider.title}</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">PDF Document</p></div></div><div className="border-t border-slate-700 bg-slate-900/50 flex divide-x divide-slate-700"><button className="flex-1 py-3 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-center gap-2" onClick={() => showToast('Descarga iniciada.')}><Download size={14}/> Descargar</button></div></Card>))}</div></div>
    );
  };

  const CateringView = () => (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 animate-fade-in"><header className="mb-6 border-b border-slate-800 pb-4"><h1 className="text-xl font-bold text-white flex items-center gap-2"><Coffee className="text-amber-500" /> Protocolo APV / Catering</h1></header><div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><Card className="border-t-4 border-t-amber-400"><div className="p-5"><h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><Star className="text-amber-400" size={18}/> Camerino Principal</h2><p className="text-sm text-slate-400">Agua sin gas, toallas negras, fruta picada.</p></div></Card><Card className="border-t-4 border-t-blue-500"><div className="p-5"><h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><Users className="text-blue-500" size={18}/> Comedor Staff</h2><p className="text-sm text-slate-400">15 personas. Almuerzo a las 14:00 hrs.</p></div></Card><Card className="border-t-4 border-t-red-500"><div className="p-5"><h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><Mic2 className="text-red-500" size={18}/> Escenario (Stage)</h2><p className="text-sm text-slate-400">Agua mineral, red bull x4.</p></div></Card></div></div>
  );

  const ProfileView = () => <div className="text-center mt-20"><User size={48} className="mx-auto text-blue-600 mb-4"/><h2 className="text-white text-xl font-bold">Mi Perfil</h2><p className="text-slate-400">Ajustes de cuenta.</p></div>;

  // --- RENDERIZADO PRINCIPAL (LAYOUT) ---
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
        <div className="p-4 flex-1 space-y-1 overflow-y-auto">
          {menuOptions.map(opt => (
            <button key={opt.id} onClick={() => setCurrentView(opt.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-left ${currentView === opt.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><opt.icon size={20} />{opt.label}</button>
          ))}
        </div>
        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center gap-3 mb-4 px-2">
             <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-emerald-500 border border-emerald-500">{currentUser.name.charAt(0)}</div>
             <div className="flex-1 truncate"><p className="text-sm font-bold text-white truncate">{currentUser.name}</p><p className="text-[10px] text-slate-400 uppercase">{currentUser.role}</p></div>
           </div>
           <Button variant="ghost" onClick={() => setCurrentUser(null)} className="w-full text-slate-400 hover:text-red-400 bg-slate-900"><LogOut size={16}/> Cerrar Sesión</Button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative overflow-y-auto h-screen bg-slate-950">
        <div className="p-4 md:p-8">
          {currentView === 'DASHBOARD' && <Dashboard />}
          {currentView === 'TOUR_FORM' && <EventForm />}
          {currentView.startsWith('EVENT_FORM_') && <EventForm />}
          {currentView === 'TIMING' && <TimingView />}
          {currentView === 'TRASLADOS' && <TrasladosView />}
          {currentView === 'FINANCES' && <FinancesView />}
          {currentView === 'STAFF' && <StaffView />}
          {currentView === 'CHAT' && <ChatView />}
          {currentView === 'RIDERS' && <RidersView />}
          {currentView === 'CATERING' && <CateringView />}
          {currentView === 'PROFILE' && <ProfileView />}
        </div>
      </main>
      
      {/* BOTTOM NAV MOBILE */}
      <nav className="md:hidden fixed bottom-0 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex justify-between px-2 pb-safe z-50 overflow-x-auto hide-scrollbar">
         {menuOptions.map(opt => (
            <button key={opt.id} onClick={() => setCurrentView(opt.id)} className={`flex flex-col items-center justify-center gap-1 p-2 min-w-[70px] flex-1 ${currentView === opt.id ? 'text-emerald-400' : 'text-slate-400'}`}>
              <opt.icon size={20} className="shrink-0" />
              <span className="text-[10px] font-medium truncate w-full text-center">{opt.label}</span>
            </button>
          ))}
      </nav>
    </div>
  );
}