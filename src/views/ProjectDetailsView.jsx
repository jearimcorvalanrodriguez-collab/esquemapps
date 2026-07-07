import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Calendar, User, FileText, Clock, 
  Timer, Plus, MapPin, CalendarPlus, AlertCircle, X, 
  CheckSquare, Square, RefreshCw, Link
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { NotificationsButton } from '../components/NotificationsButton';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { LiveClock } from '../components/LiveClock';
import { EventCard } from '../components/EventCard';
import { PianoLoader } from '../components/PianoLoader';
import { CACHE, apiFetch, clearCache, compareProjectIds } from '../utils/api';
import { ROLES } from '../utils/constants';

export const ProjectDetailsView = ({ 
  currentUser, 
  setCurrentView, 
  selectedProject, 
  showToast, 
  requestConfirm,
  setActiveRider,
  setRiderViewMode,
  setRiderEditTab,
  setRiderSingleSectionOnly
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
        CACHE.hitos = res.data; 
        processHitos(res.data); 
      } 
      else if(!isBackground) setFetchError(res.message || "Error al obtener hitos");
    } catch(e) { if(!isBackground) setFetchError("Fallo de red al obtener hitos."); }
    if (!isBackground) setLoading(false);
  };

  const fetchRidersGlobal = async (force = false) => {
    setLoadingRiders(true);
    try {
      let rd = CACHE.riders;
      if (force || !rd) {
        const res = await apiFetch('getRiders');
        if (res.status === 'success') {
          rd = res.data;
          CACHE.riders = rd;
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

  useEffect(() => { 
    fetchHitos(); 
    fetchRidersGlobal();
    if (CACHE.usuarios) setDirectory(CACHE.usuarios.filter(u => u.status === 'ACTIVO'));
    const interval = setInterval(() => { 
      fetchHitos(true, true); 
      fetchRidersGlobal(true);
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
          <span className="text-[9px] md:text-[10px] bg-slate-850 text-emerald-400 border border-slate-800 px-1.5 py-0.5 rounded font-black tracking-wider mb-1.5 inline-block uppercase">Detalle de Proyecto</span>
          <h1 className="text-xl md:text-3xl font-black text-white leading-tight">{p.name}</h1>
          <div className="mt-1.5 space-y-1">
            <p className="text-xs md:text-sm text-slate-350 flex items-center gap-1.5"><Calendar size={12}/> Inicio: {projectDateStr}</p>
            <p className="text-xs md:text-sm text-slate-400 flex items-center gap-1.5"><User size={12}/> Liderado por: {p.manager}</p>
          </div>
        </div>
        <div className="shrink-0 pt-2 flex items-center gap-2">
          <NotificationsButton currentUser={currentUser} />
        </div>
      </header>

      <div className="space-y-6">
        {/* --- SECCIÓN 1: RIDERS TÉCNICOS --- */}
        {canSeeRiders && (
          <Card className="p-4 md:p-6 border-slate-800 bg-slate-900/40 text-left">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
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
                  variant="secondary" 
                  className="py-1.5 px-3 text-xs font-bold border border-slate-700 hover:text-emerald-400" 
                  onClick={() => setShowLinkingModal(true)}
                >
                  Vincular Rider
                </Button>
                <Button 
                  variant="primary" 
                  className="py-1.5 px-3 text-xs font-bold" 
                  icon={Plus}
                  onClick={() => {
                    setActiveRider(null);
                    setRiderViewMode('EDIT');
                    setRiderEditTab('GENERAL');
                    if (setRiderSingleSectionOnly) setRiderSingleSectionOnly(false);
                    setCurrentView('RIDERS');
                  }}
                >
                  Nuevo Rider
                </Button>
              </div>
            </div>

            {loadingRiders && riders.length === 0 ? (
              <div className="flex justify-center p-6"><PianoLoader size={30} /></div>
            ) : riders.length === 0 ? (
              <div className="text-center p-6 border border-slate-800 border-dashed rounded-xl bg-slate-950/20">
                <p className="text-slate-400 text-xs">No hay riders técnicos vinculados a este proyecto.</p>
                <button 
                  onClick={() => setShowLinkingModal(true)}
                  className="text-xs text-emerald-400 font-bold hover:underline mt-2 inline-block"
                >
                  Vincular un documento existente
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {riders.map(rider => {
                  const getTabsForType = (type) => {
                    switch(type) {
                      case 'SONIDO': return ['GENERAL', 'AUDIO', 'BACKLINE', 'STAGEPLOT'];
                      case 'ILUMINACIÓN': return ['GENERAL', 'VISUALES', 'STAGEPLOT'];
                      case 'STAGEPLOT': return ['GENERAL', 'BACKLINE', 'STAGEPLOT'];
                      case 'HOSPITALITY': return ['GENERAL', 'CATERING'];
                      default: return ['GENERAL', 'AUDIO', 'BACKLINE', 'VISUALES', 'STAGEPLOT', 'CATERING'];
                    }
                  };
                  const tabs = getTabsForType(rider.type);

                  return (
                    <Card key={rider.id} className="p-4 border-slate-800 bg-slate-950/50 flex flex-col justify-between hover:border-slate-700 transition-colors">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] bg-slate-900 text-emerald-400 border border-slate-800 px-2 py-0.5 rounded font-black tracking-wider uppercase">
                            {rider.type}
                          </span>
                          <span className="text-[9px] text-slate-550 font-mono">
                            ID: {rider.id}
                          </span>
                        </div>
                        
                        <h3 className="font-bold text-white text-base leading-snug mb-1">{rider.title}</h3>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-4">
                          {rider.content.importante || 'Sin requerimientos especiales configurados.'}
                        </p>
                      </div>

                      <div className="border-t border-slate-900 pt-3 space-y-3">
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">
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
                                className="text-[9px] font-black uppercase bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:text-emerald-400 text-slate-400 px-2 py-1 rounded transition-colors"
                              >
                                {tab}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 border-t border-slate-900/60 pt-2.5">
                          <Button 
                            variant="secondary" 
                            className="py-1.5 px-2.5 text-xs font-bold border border-slate-800 text-slate-400 hover:text-red-400"
                            onClick={() => handleUnlinkRider(rider)}
                            title="Desvincular Rider"
                          >
                            Desvincular
                          </Button>
                          <Button 
                            variant="secondary" 
                            className="flex-1 py-1.5 text-xs font-bold"
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
                            className="flex-1 py-1.5 text-xs font-bold"
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

        {/* --- SECCIÓN 2: TIMING & TIMELINE REUNIDOS --- */}
        {canSeeHitos && (
          <div className="space-y-4">
            
            {/* 2.1 CREAR TIMING (FORMULARIO DESPLEGABLE) */}
            {canManageHitos && (
              <Card className="border-slate-800 bg-slate-900/60 overflow-hidden">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowCreateTiming(!showCreateTiming);
                    if (!showCreateTiming && !editingHito) {
                      setForm({ title: '', location: '', date: '', time: '' });
                    }
                  }}
                  className="w-full p-4 flex justify-between items-center hover:bg-slate-800/40 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="text-emerald-500" size={20} />
                    <div>
                      <h3 className="font-bold text-white text-sm md:text-base uppercase tracking-wide">
                        {editingHito ? 'EDITAR HITO ACTIVO' : 'CREAR TIMING / AGREGAR HITOS'}
                      </h3>
                      <p className="text-[10px] md:text-xs text-slate-400 mt-0.5">
                        {editingHito ? `Modificando hito: ${editingHito.title}` : 'Planifica la pauta del show y crea los hitos del timing del proyecto.'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                    {showCreateTiming ? 'Ocultar Panel' : 'Desplegar Panel'}
                  </span>
                </button>

                {showCreateTiming && (
                  <div className="p-4 md:p-5 bg-slate-955/85 border-t border-slate-800/80 animate-slide-down">
                    <form onSubmit={handleCreateHito} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Título del Hito</label>
                          <input 
                            list="hitos-list-collapsible" 
                            required 
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-xs text-white outline-none focus:border-emerald-500" 
                            placeholder="Ej: Soundcheck, Load In, Montaje..." 
                            value={form.title} 
                            onChange={e => setForm({...form, title: e.target.value})} 
                          />
                          <datalist id="hitos-list-collapsible">
                            <option value="Load In (Montaje)" />
                            <option value="Soundcheck (Prueba de Sonido)" />
                            <option value="Puertas (Apertura al público)" />
                            <option value="Show Telonero" />
                            <option value="Show Principal" />
                            <option value="Load Out (Desmontaje)" />
                          </datalist>
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
                                className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-xs text-white outline-none focus:border-emerald-500" 
                              />
                            </div>
                            <Button type="button" variant="secondary" icon={MapPin} onClick={captureGPS} title="Usar GPS" className="px-3 py-2 text-xs border-slate-750" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Fecha</label>
                          <input 
                            required 
                            type="date" 
                            value={form.date} 
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer" 
                            onChange={e => setForm({...form, date: e.target.value})} 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Hora</label>
                          <input 
                            required 
                            type="time" 
                            value={form.time} 
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer" 
                            onChange={e => setForm({...form, time: e.target.value})} 
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button 
                          type="button" 
                          variant="secondary" 
                          className="flex-1 py-2 text-xs font-bold" 
                          onClick={() => {
                            setShowCreateTiming(false);
                            setEditingHito(null);
                            setForm({ title: '', location: '', date: '', time: '' });
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1 py-2 text-xs font-bold">
                          {editingHito ? 'Guardar Cambios' : 'Crear Hito'}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </Card>
            )}

            {/* 2.2 TIMELINE / LISTADO DE HITOS */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 md:p-6 text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3 border-b border-slate-700/50 pb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2"><Clock className="text-emerald-500" size={20}/> Timeline / Timing General</h2>
                  {showClock && (
                    <div className="bg-slate-900 border border-slate-700 px-3 py-1 rounded flex items-center gap-2 shadow-inner">
                      <Timer className="text-emerald-500 animate-pulse" size={14} />
                      <LiveClock />
                    </div>
                  )}
                </div>
              </div>

              {fetchError ? (
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-400 flex items-center gap-3"><AlertCircle size={20} /> {fetchError}</div>
              ) : loading && hitos.length === 0 ? (
                <div className="flex justify-center p-6"><PianoLoader size={70} /></div>
              ) : hitos.length === 0 ? (
                <div className="text-center p-8 border border-slate-800 border-dashed rounded-xl bg-slate-900/50">
                  <CalendarPlus className="mx-auto text-slate-600 mb-3" size={32} />
                  <p className="text-slate-400 text-xs md:text-sm max-w-md mx-auto">Aún no hay hitos programados en el timing de este proyecto.</p>
                </div>
              ) : (
                <div className="relative before:absolute before:inset-y-0 before:left-[5px] md:before:left-[9px] before:w-0.5 before:bg-slate-800 ml-1 md:ml-0 space-y-4">
                  {hitos.map((event) => (
                    <EventCard 
                       key={event.id} 
                       event={event} 
                       canManage={canManageHitos} 
                       handleDeleteHito={handleDeleteHito} 
                       handleEditHito={handleEditClick} 
                       setAssigningHito={setAssigningHito} 
                       currentUser={currentUser} 
                       requestConfirm={requestConfirm} 
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {assigningHito && (
        <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in text-slate-100">
          <Card className="w-full max-w-md p-4 md:p-6 bg-slate-900 border-emerald-500 flex flex-col max-h-[80vh] text-left">
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
                    <div className="flex items-center gap-2.5 text-left">
                      {isChecked ? <CheckSquare className="text-emerald-500" size={18}/> : <Square size={18}/>}
                      <div><p className="font-bold text-xs md:text-sm">{u.name}</p><p className="text-[9px] uppercase tracking-wider">{u.role}</p></div>
                    </div>
                  </button>
                );
              })}
            </div>
            <Button onClick={saveAsignaciones} className="w-full py-2.5 md:py-3 text-xs md:text-sm">Guardar Asignaciones</Button>
          </Card>
        </div>
      )}

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
                      <span className="text-[8px] bg-slate-800 text-emerald-400 border border-slate-750 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">
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
