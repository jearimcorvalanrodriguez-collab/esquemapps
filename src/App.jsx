import React, { useState, useEffect } from 'react';
import { 
  Navigation, DollarSign, Users, ShieldCheck, User, 
  Music, LogOut, AlertCircle, Key, CheckCircle2 
} from 'lucide-react';
import { Card } from './components/Card';
import { Button } from './components/Button';

// Views
import { AuthRouter } from './views/AuthRouter';
import { Dashboard } from './views/Dashboard';
import { ProjectDetailsView } from './views/ProjectDetailsView';
import { ProfileView } from './views/ProfileView';
import { StaffDirectory } from './views/StaffDirectory';
import { RidersView } from './views/RidersView';
import { ExpensesView } from './views/ExpensesView';

// Utilities
import { apiFetch, CACHE } from './utils/api';
import { ROLES } from './utils/constants';

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
  const [riderViewMode, setRiderViewMode] = useState('LIST');
  const [riderEditTab, setRiderEditTab] = useState('GENERAL');
  const [riderSingleSectionOnly, setRiderSingleSectionOnly] = useState(false);
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

    const options = [
      { id: 'DASHBOARD', label: 'Proyectos', icon: Navigation }
    ];

    const canSeeExpenses = (effectiveUser.permisos || []).includes('EXPENSES') || 
                           [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.JEFE_CAT_APV].includes(effectiveUser.role);
    if (canSeeExpenses) {
       options.push({ id: 'EXPENSES', label: 'Gastos', icon: DollarSign });
    }
    
    const isDirAdmin = effectiveUser.role === ROLES.ADMIN || (effectiveUser.permisos || []).includes('ADMIN_PANEL');
    options.push({ 
      id: 'STAFF', 
      label: 'Directorio', 
      icon: Users,
      badgeCount: isDirAdmin ? pendingCount : 0 
    });
    
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
    if (currentUser) {
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

          .light-mode .bg-slate-955\/20 { background-color: rgba(15, 23, 42, 0.05) !important; }
          .light-mode .bg-slate-950\/40 { background-color: rgba(15, 23, 42, 0.1) !important; }
          .light-mode .bg-slate-950\/80 { background-color: rgba(248, 250, 252, 0.85) !important; }
          .light-mode .bg-slate-955\/90 { background-color: rgba(248, 250, 252, 0.92) !important; }
          
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

        <main className="flex-1 relative overflow-y-auto h-screen bg-slate-955 print:bg-white custom-scrollbar print:overflow-visible print:h-auto pb-[70px] lg:pb-0">
          <div className="p-3 md:p-6 print:p-0">
            {currentView === 'DASHBOARD' && <Dashboard currentUser={effectiveUser} setCurrentView={setCurrentView} setSelectedProject={setSelectedProject} showToast={showToast} directory={directory} />}
            {currentView === 'PROJECT_DETAILS' && (
              <ProjectDetailsView 
                currentUser={effectiveUser} 
                setCurrentView={setCurrentView} 
                selectedProject={selectedProject} 
                showToast={showToast} 
                requestConfirm={requestConfirm} 
                setActiveRider={setActiveRider}
                setRiderViewMode={setRiderViewMode}
                setRiderEditTab={setRiderEditTab}
                setRiderSingleSectionOnly={setRiderSingleSectionOnly}
              />
            )}
            {currentView === 'PROFILE' && <ProfileView currentUser={effectiveUser} setCurrentUser={setCurrentUser} showToast={showToast} theme={theme} setTheme={setTheme} requestConfirm={requestConfirm} />}
            {currentView === 'STAFF' && <StaffDirectory currentUser={effectiveUser} showToast={showToast} requestConfirm={requestConfirm} refreshPendingCount={() => fetchDirectoryGlobal(true)} />}
            {currentView === 'RIDERS' && (
              <RidersView 
                currentUser={effectiveUser} 
                showToast={showToast} 
                requestConfirm={requestConfirm} 
                activeRider={activeRider} 
                setActiveRider={setActiveRider} 
                directory={directory} 
                selectedProject={selectedProject} 
                setCurrentView={setCurrentView} 
                viewMode={riderViewMode}
                setViewMode={setRiderViewMode}
                editTab={riderEditTab}
                setEditTab={setRiderEditTab}
                singleSectionOnly={riderSingleSectionOnly}
                setSingleSectionOnly={setRiderSingleSectionOnly}
              />
            )}
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