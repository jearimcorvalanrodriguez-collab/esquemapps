import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Calendar, User, FileText, Truck, Clock, 
  Timer, Plus, MapPin, CalendarPlus, AlertCircle, X, 
  CheckSquare, Square 
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { NotificationsButton } from '../components/NotificationsButton';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { LiveClock } from '../components/LiveClock';
import { EventCard } from '../components/EventCard';
import { ProjectChatSidebar } from '../components/ProjectChatSidebar';
import { PianoLoader } from '../components/PianoLoader';
import { CACHE, apiFetch, clearCache, compareProjectIds } from '../utils/api';
import { ROLES } from '../utils/constants';

export const ProjectDetailsView = ({ currentUser, setCurrentView, selectedProject, showToast, requestConfirm }) => {
  const p = selectedProject;
  const canManage = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role) || (currentUser.permisos || []).includes('PROJECTS_MANAGE');
  const canSeeRiders = currentUser.role === ROLES.ADMIN || 
                        (currentUser.permisos || []).includes('RIDERS') || 
                        (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TEC_JEFE, ROLES.JEFE_CAT_APV].includes(currentUser.role));
  const canSeeTransport = currentUser.role === ROLES.ADMIN || 
                           (currentUser.permisos || []).includes('TRANSPORT') || 
                           (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TRASLADO].includes(currentUser.role));
  const canSeeHitos = currentUser.role === ROLES.ADMIN || 
                       (currentUser.permisos || []).includes('HITOS') || 
                       (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TEC_JEFE, ROLES.JEFE_CAT_APV].includes(currentUser.role));
  const canManageHitos = currentUser.role === ROLES.ADMIN || 
                          (currentUser.permisos || []).includes('HITOS_MANAGE') || 
                          (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role));
  
  const [hitos, setHitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ title: '', location: '', date: '', time: '' });
  const [assigningHito, setAssigningHito] = useState(null);
  const [directory, setDirectory] = useState([]);

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
                <div className="flex justify-center p-6"><PianoLoader size={70} /></div>
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
export default ProjectDetailsView;
