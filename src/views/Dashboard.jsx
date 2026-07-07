import React, { useState, useEffect } from 'react';
import { 
  Navigation, RefreshCw, FolderPlus, Music, Calendar, 
  User, Users, AlertCircle, X, CheckSquare, Square 
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { NotificationsButton } from '../components/NotificationsButton';
import { PianoLoader } from '../components/PianoLoader';
import { CACHE, apiFetch, clearCache, setCache } from '../utils/api';
import { ROLES } from '../utils/constants';

export const Dashboard = ({ currentUser, setCurrentView, setSelectedProject, showToast, directory }) => {
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
           if (myNewCount > myOldCount) showToast("Tienes una nueva asignación de Proyecto!");
        }

        setCache('proyectos', parsed);
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
          <div className="flex justify-center p-8"><PianoLoader size={40} /></div>
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
export default Dashboard;
