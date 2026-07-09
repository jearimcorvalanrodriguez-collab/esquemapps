import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Calendar, User, FileText, Clock, 
  Timer, Plus, MapPin, CalendarPlus, AlertCircle, X, 
  CheckSquare, Square, RefreshCw, Link, Trash2, DollarSign
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { NotificationsButton } from '../components/NotificationsButton';
import { QuickActionsButton } from '../components/QuickActionsButton';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { LiveClock } from '../components/LiveClock';
import { EventCard } from '../components/EventCard';
import { PianoLoader } from '../components/PianoLoader';
import { CACHE, apiFetch, clearCache, compareProjectIds, setCache } from '../utils/api';
import { ROLES } from '../utils/constants';
import { ExpensesView } from './ExpensesView';

export const ProjectDetailsView = ({ 
  currentUser, 
  setCurrentView, 
  selectedProject, 
  showToast, 
  requestConfirm,
  setActiveRider,
  setRiderViewMode,
  setRiderEditTab,
  setRiderSingleSectionOnly,
  setSelectedProject,
  handleQuickAction
}) => {
  const p = selectedProject;
  const canManage = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role) || (currentUser.permisos || []).includes('PROJECTS_MANAGE');
  const canSeeRiders = currentUser.role === ROLES.ADMIN || 
                        (currentUser.permisos || []).includes('RIDERS') || 
                        (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TEC_JEFE, ROLES.JEFE_CAT_APV].includes(currentUser.role));
  const canSeeHitos = currentUser.role === ROLES.ADMIN || 
                       (currentUser.permisos || []).includes('HITOS') || 
                       (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TEC_JEFE, ROLES.JEFE_CAT_APV].includes(currentUser.role));
  const canManageHitos = currentUser.role === ROLES.ADMIN || 
                          (currentUser.permisos || []).includes('HITOS_MANAGE') || 
                          (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role));
  
  const canSeeExpenses = (currentUser.permisos || []).includes('EXPENSES') || 
                         [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.JEFE_CAT_APV].includes(currentUser.role);
  
  const [hitos, setHitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [directory, setDirectory] = useState([]);
  const [editingHito, setEditingHito] = useState(null);
  const [assigningHito, setAssigningHito] = useState(null);

  // Timing Collapsible states
  const [showCreateTiming, setShowCreateTiming] = useState(false);
  const [form, setForm] = useState({ title: '', location: '', date: '', time: '' });

  // Riders technical list states
  const [riders, setRiders] = useState([]);
  const [allRiders, setAllRiders] = useState([]);
  const [loadingRiders, setLoadingRiders] = useState(true);
  const [showLinkingModal, setShowLinkingModal] = useState(false);
  const [allProjects, setAllProjects] = useState([]);

  const processHitos = (data) => {
    const projectHitos = data.filter(ev => compareProjectIds(ev.proyectoId, p.id) || compareProjectIds(ev.proyectoId, p.name));
    const parsedEvents = projectHitos.map(ev => {
      let fullDate = new Date(0);
      try {
        let dStr = String(ev.date || '').trim();
        if (dStr.includes('T')) {
          dStr = dStr.split('T')[0];
        }
        
        let year, month, day;
        const matchISO = dStr.match(/(\d{4})[-/](\d{2})[-/](\d{2})/);
        if (matchISO) {
          year = parseInt(matchISO[1]);
          month = parseInt(matchISO[2]) - 1;
          day = parseInt(matchISO[3]);
        } else {
          const matchLoc = dStr.match(/(\d{2})[-/](\d{2})[-/](\d{4})/);
          if (matchLoc) {
            year = parseInt(matchLoc[3]);
            month = parseInt(matchLoc[2]) - 1;
            day = parseInt(matchLoc[1]);
          }
        }
        
        let hour = 0, min = 0;
        if (ev.time) {
          const timeMatch = String(ev.time).match(/(\d{2}):(\d{2})/);
          if (timeMatch) {
            hour = parseInt(timeMatch[1]);
            min = parseInt(timeMatch[2]);
          }
        }
        
        if (year !== undefined) {
          const dateObj = new Date(year, month, day, hour, min, 0);
          if (!isNaN(dateObj.getTime())) fullDate = dateObj;
        } else {
          const directDate = new Date(ev.date);
          if (!isNaN(directDate.getTime())) {
             if (ev.time) {
                const timeMatch = String(ev.time).match(/(\d{2}):(\d{2})/);
                if (timeMatch) {
                   directDate.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0, 0);
                }
             }
             fullDate = directDate;
          }
        }
      } catch (err) {}
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
           const myOldHitos = CACHE.hitos ? CACHE.hitos.filter(h => (compareProjectIds(h.proyectoId, p.id) || compareProjectIds(h.proyectoId, p.name)) && h.asignados?.includes(currentUser.email)).length : 0;
           const myNewHitos = res.data.filter(h => (compareProjectIds(h.proyectoId, p.id) || compareProjectIds(h.proyectoId, p.name)) && h.asignados?.includes(currentUser.email)).length;
           if (myNewHitos > myOldHitos) showToast("Tienes un nuevo Hito asignado");
        }
        setCache('hitos', res.data); 
        processHitos(res.data); 
      } 
      else if(!isBackground) setFetchError(res.message || "Error al obtener hitos");
    } catch(e) { if(!isBackground) setFetchError("Fallo de red al obtener hitos."); }
    if (!isBackground) setLoading(false);
  };

  const fetchAllProjects = async () => {
    try {
      const res = await apiFetch('getProyectos');
      if (res.status === 'success') {
        setAllProjects(res.data);
      }
    } catch(e) {
      console.error("Error fetching projects in detail dashboard", e);
    }
  };

  const fetchRidersGlobal = async (force = false) => {
    setLoadingRiders(true);
    try {
      let rd = CACHE.riders;
      if (force || !rd) {
        const res = await apiFetch('getRiders');
        if (res.status === 'success') {
          rd = res.data;
          setCache('riders', rd);
        }
      }
      if (rd) {
        const parsedRiders = rd.map(r => {
          let parsedContent;
          try { 
            parsedContent = JSON.parse(r.content); 
            if(!parsedContent.proyectoId) parsedContent.proyectoId = '';
          } catch(e) { 
            parsedContent = { proyectoId: '', importante: r.content }; 
          }
          return { ...r, content: parsedContent };
        });
        setAllRiders(parsedRiders);
        setRiders(parsedRiders.filter(r => compareProjectIds(r.content.proyectoId, p.id)));
      }
    } catch(e) {
      console.error("Error fetching riders in project details", e);
    }
    setLoadingRiders(false);
  };

  const handleLinkRider = async (rider) => {
    const newContent = { ...rider.content, proyectoId: p.id };
    setLoadingRiders(true);
    try {
      await apiFetch('updateRider', { 
        id: rider.id, 
        title: rider.title, 
        type: rider.type, 
        content: JSON.stringify(newContent) 
      });
      showToast("Rider vinculado a este proyecto.");
      setShowLinkingModal(false);
      clearCache('riders'); 
      fetchRidersGlobal(true);
    } catch(e) { 
      showToast("Error al vincular."); 
      setLoadingRiders(false); 
    }
  };

  const handleUnlinkRider = async (rider) => {
    const newContent = { ...rider.content, proyectoId: '' };
    setLoadingRiders(true);
    try {
      await apiFetch('updateRider', { 
        id: rider.id, 
        title: rider.title, 
        type: rider.type, 
        content: JSON.stringify(newContent) 
      });
      showToast("Rider desvinculado de este proyecto.");
      clearCache('riders'); 
      fetchRidersGlobal(true);
    } catch(err) { 
      showToast("Error al desvincular."); 
      setLoadingRiders(false); 
    }
  };

  const handleDeleteRider = async (rider) => {
    const canDeleteRiders = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role) || (currentUser.permisos || []).includes('RIDERS_MANAGE');
    if (!canDeleteRiders) {
      showToast("No tienes permisos para eliminar Riders.");
      return;
    }
    requestConfirm(`¿Eliminar el Rider "${rider.title}" permanentemente?`, async () => {
      setLoadingRiders(true);
      try {
        await apiFetch('deleteRider', { id: rider.id });
        showToast("Rider eliminado permanentemente.");
        clearCache('riders');
        fetchRidersGlobal(true);
      } catch(e) {
        showToast("Error al eliminar.");
        setLoadingRiders(false);
      }
    });
  };

  useEffect(() => { 
    fetchHitos(); 
    fetchRidersGlobal();
    fetchAllProjects();
    if (CACHE.usuarios) setDirectory(CACHE.usuarios.filter(u => u.status === 'ACTIVO'));
    const interval = setInterval(() => { 
      fetchHitos(true, true); 
      fetchRidersGlobal(true);
      fetchAllProjects();
    }, 30000);
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
      if (editingHito) {
        const payload = { ...form, id: editingHito.id };
        const res = await apiFetch('updateHito', payload);
        if (res.status === 'success') {
          showToast("Hito actualizado."); 
          setShowCreateTiming(false); 
          setEditingHito(null); 
          setForm({ title: '', location: '', date: '', time: '' }); 
          clearCache('hitos'); 
          fetchHitos(true);
        } else {
          showToast("Error: " + res.message); 
        }
      } else {
        const payload = { ...form, proyectoId: p.id };
        const res = await apiFetch('createHito', payload);
        if (res.status === 'success') {
          showToast("Hito agendado."); 
          setShowCreateTiming(false); 
          setForm({ title: '', location: '', date: '', time: '' }); 
          clearCache('hitos'); 
          fetchHitos(true);
        } else {
          showToast("Error: " + res.message); 
        }
      }
    } catch(e) { showToast("Error al procesar hito."); }
  };

  const handleEditClick = (event) => {
    setEditingHito(event);
    let formattedDate = '';
    if (event.date) {
      let dRaw = String(event.date).trim();
      if (dRaw.includes('T')) dRaw = dRaw.split('T')[0];
      
      const matchISO = dRaw.match(/(\d{4})[-/](\d{2})[-/](\d{2})/);
      if (matchISO) {
        formattedDate = `${matchISO[1]}-${matchISO[2]}-${matchISO[3]}`;
      } else {
        const matchLoc = dRaw.match(/(\d{2})[-/](\d{2})[-/](\d{4})/);
        if (matchLoc) formattedDate = `${matchLoc[3]}-${matchLoc[2]}-${matchLoc[1]}`;
      }
    }
    setForm({
      title: event.title || '',
      location: event.location || '',
      date: formattedDate,
      time: event.time || ''
    });
    setShowCreateTiming(true);
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

  const unlinkedRiders = allRiders.filter(r => !r.content.proyectoId);

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-24 max-w-5xl mx-auto text-slate-100">
      <button onClick={() => setCurrentView('DASHBOARD')} className="flex items-center gap-1.5 text-xs md:text-sm text-slate-400 hover:text-white transition-colors mb-2"><ChevronLeft size={16}/> Volver a Proyectos</button>
      
      <header className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start gap-4 w-full text-left">
        <div>
          <span className="text-[9px] md:text-[10px] text-emerald-400 font-black tracking-wider mb-1.5 inline-block uppercase">Detalle Proyecto</span>
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <h1 className="text-xl md:text-3xl font-black text-white leading-tight">{p.name}</h1>
            {hitos.length > 0 && (
              <Button 
                type="button"
                variant="secondary"
                className="py-1 px-2.5 text-[9px] md:text-[10px] font-bold border border-slate-750 flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/30 shrink-0 h-[24px] rounded"
                onClick={() => {
                  window.localStorage.setItem('esquemapps_active_timing_id', String(p.id));
                  setCurrentView('TIMING_VIEW');
                }}
              >
                <Clock size={11} /> Ver Cronograma
              </Button>
            )}
          </div>
          <div className="mt-1.5 space-y-1">
            <p className="text-xs md:text-sm text-slate-350 flex items-center gap-1.5"><Calendar size={12}/> Inicio: {projectDateStr}</p>
            <p className="text-xs md:text-sm text-slate-400 flex items-center gap-1.5"><User size={12}/> Liderado por: {p.manager}</p>
          </div>
        </div>
        <div className="shrink-0 pt-2 flex items-center gap-2">
          <NotificationsButton currentUser={currentUser} />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {/* --- SECCIÓN 1: RIDERS TÉCNICOS --- */}
        {canSeeRiders && (
          <div className="space-y-6">
            {riders.length === 0 ? (
              <Card className="p-5 border-slate-800 bg-slate-950/20 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                      <FileText className="text-slate-500" size={16} />
                      Riders Técnicos
                    </h2>
                    <p className="text-xs text-slate-400">Este proyecto no tiene Riders Técnicos vinculados actualmente.</p>
                  </div>
                  <Button 
                    variant="ghost"
                    className="py-1 px-2.5 text-[10px] font-bold border border-amber-500 text-amber-400 hover:bg-amber-500/10 rounded whitespace-nowrap shrink-0"
                    onClick={() => {
                      setSelectedProject(p);
                      setCurrentView('RIDERS');
                    }}
                  >
                    Ir a Sección de Riders →
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-4 md:p-6 border-slate-800 bg-slate-900/40 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 border-b border-slate-800 pb-3">
                  <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="text-emerald-400" size={20} />
                    Riders Técnicos
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      icon={RefreshCw} 
                      onClick={() => fetchRidersGlobal(true)} 
                      className="px-2 py-1.5 border border-slate-700 hover:text-emerald-400" 
                      title="Actualizar Riders" 
                    />
                    <Button 
                      variant="primary" 
                      className="py-1.5 px-3 text-xs font-bold" 
                      onClick={() => setShowLinkingModal(true)}
                    >
                      Vincular Rider
                    </Button>
                  </div>
                </div>

                {loadingRiders ? (
                  <div className="flex justify-center p-6"><PianoLoader size={30} /></div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {riders.map(rider => {
                      const getTabsForType = (type) => {
                        return ['GENERAL', 'AUDIO', 'BACKLINE', 'VISUALES', 'STAGEPLOT', 'CATERING'];
                      };
                      const tabs = getTabsForType(rider.type);

                      return (
                        <Card key={rider.id} className="p-4 border-slate-800 bg-slate-950/50 flex flex-col justify-between hover:border-slate-700 transition-colors">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded block w-fit text-emerald-500 bg-emerald-500/10">
                                {rider.type}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-slate-550 font-mono">
                                  ID: {rider.id}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleDeleteRider(rider); }}
                                  className="text-slate-500 hover:text-red-500 transition-colors p-1"
                                  title="Eliminar Rider"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                            
                            <h3 className="font-bold text-white text-base leading-snug mb-1">{rider.title}</h3>
                            <p className="text-[11px] text-slate-400 leading-relaxed mb-4 whitespace-pre-wrap">
                              {rider.content.importante || 'Sin requerimientos especiales configurados.'}
                            </p>
                          </div>

                          <div className="border-t border-slate-900 pt-3 space-y-3">
                            <div>
                              <span className="text-[9px] text-slate-550 font-bold uppercase tracking-wider block mb-1.5">
                                Modificar Sección Específica:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {tabs.map(tab => (
                                  <button
                                    key={tab}
                                    onClick={() => {
                                      setActiveRider(rider);
                                      setRiderViewMode('EDIT');
                                      setRiderEditTab(tab);
                                      if (setRiderSingleSectionOnly) setRiderSingleSectionOnly(true);
                                      setCurrentView('RIDERS');
                                    }}
                                    className="text-[9px] font-black uppercase bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:text-emerald-450 text-slate-400 px-2 py-1 rounded transition-colors"
                                  >
                                    {tab}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 border-t border-slate-900/60 pt-2.5">
                              <Button 
                                variant="secondary" 
                                className="flex-1 py-1.5 text-xs font-bold whitespace-nowrap"
                                onClick={() => {
                                  setActiveRider(rider);
                                  setRiderViewMode('DETAIL');
                                  if (setRiderSingleSectionOnly) setRiderSingleSectionOnly(false);
                                  setCurrentView('RIDERS');
                                }}
                              >
                                Vista Previa / PDF
                              </Button>
                              <Button 
                                variant="primary" 
                                className="flex-1 py-1.5 text-xs font-bold whitespace-nowrap"
                                onClick={() => {
                                  setActiveRider(rider);
                                  setRiderViewMode('EDIT');
                                  setRiderEditTab('GENERAL');
                                  if (setRiderSingleSectionOnly) setRiderSingleSectionOnly(false);
                                  setCurrentView('RIDERS');
                                }}
                              >
                                Edición Global
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* --- SECCIÓN 1.5: CRONOGRAMA DE ACTIVIDADES --- */}
        {canSeeHitos && (
          <div className="space-y-6 pt-4 border-t border-slate-800">
            {hitos.length === 0 ? (
              <Card className="p-5 border-slate-800 bg-slate-950/20 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                      <Clock className="text-slate-500" size={16} />
                      Cronograma de Actividades
                    </h2>
                    <p className="text-xs text-slate-400">Este proyecto no tiene Cronogramas vinculados actualmente.</p>
                  </div>
                  <Button 
                    variant="ghost"
                    className="py-1 px-2.5 text-[10px] font-bold border border-amber-500 text-amber-400 hover:bg-amber-500/10 rounded whitespace-nowrap shrink-0"
                    onClick={() => {
                      window.localStorage.setItem('esquemapps_active_timing_id', String(p.id));
                      setCurrentView('TIMING_VIEW');
                    }}
                  >
                    Ir a Sección de Cronogramas →
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-4 md:p-6 border-slate-800 bg-slate-900/40 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 border-b border-slate-800 pb-3">
                  <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                    <Clock className="text-emerald-400" size={20} />
                    Cronograma de Actividades
                  </h2>
                  <Button 
                    variant="ghost" 
                    className="py-1 px-2.5 text-[10px] font-bold border border-amber-500 text-amber-400 hover:bg-amber-500/10 rounded whitespace-nowrap shrink-0"
                    onClick={() => {
                      window.localStorage.setItem('esquemapps_active_timing_id', String(p.id));
                      setCurrentView('TIMING_VIEW');
                    }}
                  >
                    Ir a Sección de Cronogramas →
                  </Button>
                </div>

                <div className="space-y-2">
                  {hitos.slice(0, 3).map((hito) => (
                    <div key={hito.id} className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg flex items-center justify-between gap-3 text-xs font-bold">
                      <div className="space-y-1">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span className="text-emerald-400 font-mono">{hito.time}</span>
                          <span>{hito.title}</span>
                        </div>
                        <div className="text-slate-400 flex items-center gap-1 font-normal">
                          <MapPin size={10} className="text-slate-500" />
                          <span>{hito.location}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                        {hito.date}
                      </span>
                    </div>
                  ))}
                  {hitos.length > 3 && (
                    <p className="text-[10px] text-slate-500 text-center pt-1 font-bold">+ {hitos.length - 3} actividades adicionales en el cronograma completo.</p>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* --- SECCIÓN 2: CONTROL DE GASTOS Y PRESUPUESTOS --- */}
        {canSeeExpenses && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            {!allProjects.some(b => b.type === 'PRESUPUESTO' && b.manager === 'PROYECTO_ID:' + p.id) ? (
              <Card className="p-5 border-slate-800 bg-slate-950/20 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                      <DollarSign className="text-slate-500" size={16} />
                      Control de Gastos y Presupuesto
                    </h2>
                    <p className="text-xs text-slate-400">Este proyecto no tiene Gastos vinculados actualmente.</p>
                  </div>
                  <Button 
                    variant="ghost"
                    className="py-1 px-2.5 text-[10px] font-bold border border-amber-500 text-amber-400 hover:bg-amber-500/10 rounded whitespace-nowrap shrink-0"
                    onClick={() => {
                      setSelectedProject(p);
                      setCurrentView('EXPENSES');
                    }}
                  >
                    Ir a Sección de Gastos →
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2 mb-2">
                  <DollarSign className="text-emerald-400" size={20} />
                  Control de Gastos y Presupuesto
                </h2>
                <ExpensesView 
                  currentUser={currentUser} 
                  showToast={showToast} 
                  requestConfirm={requestConfirm} 
                  selectedProject={p} 
                  setSelectedProject={setSelectedProject}
                  hideHeader={true} 
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL PARA VINCULAR RIDER EXISTENTE --- */}
      {showLinkingModal && (
        <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in text-slate-100">
          <Card className="w-full max-w-lg p-4 md:p-6 bg-slate-900 border-emerald-500 flex flex-col max-h-[80vh] text-left shadow-2xl">
            <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-3">
              <h2 className="text-base md:text-lg font-bold text-white">Vincular Rider Existente</h2>
              <button onClick={() => setShowLinkingModal(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2.5 mb-4 pr-2 custom-scrollbar">
              {unlinkedRiders.length === 0 ? (
                <p className="text-slate-500 text-xs md:text-sm text-center py-8 font-bold">No hay riders sin proyecto asignado actualmente.</p>
              ) : (
                unlinkedRiders.map(rider => (
                  <div key={rider.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-800 bg-slate-950/40 hover:border-slate-700 transition-colors">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded block w-fit text-emerald-500 bg-emerald-500/10">
                        {rider.type}
                      </span>
                      <h4 className="font-bold text-white text-xs md:text-sm mt-1">{rider.title}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{rider.content.importante || 'Sin descripción.'}</p>
                    </div>
                    <Button 
                      variant="primary" 
                      className="py-1 px-3 text-xs font-bold"
                      onClick={() => handleLinkRider(rider)}
                    >
                      Vincular
                    </Button>
                  </div>
                ))
              )}
            </div>
            
            <Button variant="secondary" onClick={() => setShowLinkingModal(false)} className="w-full py-2.5 text-xs">Cerrar</Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsView;
