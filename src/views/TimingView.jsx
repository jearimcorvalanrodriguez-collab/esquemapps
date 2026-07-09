import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, Calendar, Plus, X, AlertCircle, CheckSquare, Square, 
  CalendarPlus, Share2, ChevronLeft
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { EventCard } from '../components/EventCard';
import { PianoLoader } from '../components/PianoLoader';
import { CACHE, apiFetch, clearCache, setCache, formatCleanLocation } from '../utils/api';
import { ROLES } from '../utils/constants';

// Custom TimePicker component for 00:00 h friendly modern selection
const TimePicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const parts = String(value || '12:00').split(':');
  const currentHour = parts[0] || '12';
  const currentMin = parts[1] || '00';

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  const handleSelectHour = (h) => {
    onChange(`${h}:${currentMin}`);
  };

  const handleSelectMin = (m) => {
    onChange(`${currentHour}:${m}`);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full text-left">
      <div className="flex items-center bg-slate-900 border border-slate-700 rounded text-xs text-white relative">
        <input 
          type="text" 
          required
          value={value} 
          placeholder="00:00"
          className="w-full bg-transparent p-2 outline-none text-xs text-white font-mono cursor-pointer" 
          onChange={e => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        <button 
          type="button"
          className="px-2.5 text-slate-400 hover:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Clock size={14} />
        </button>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)}></div>
          <div className="absolute left-0 mt-1 w-44 bg-slate-955 border border-slate-800 rounded-lg shadow-2xl p-2 z-40 flex gap-2 animate-fade-in h-64">
            
            {/* Hours Column */}
            <div className="flex-1 overflow-y-auto custom-scrollbar h-full">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest pb-1 mb-1 border-b border-slate-800 text-center sticky top-0 bg-slate-950 block">Hora</span>
              <div className="flex flex-col gap-0.5">
                {hours.map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleSelectHour(h)}
                    className={`py-1 text-xs font-bold rounded w-full ${h === currentHour ? 'bg-emerald-600 text-white font-mono' : 'text-slate-400 hover:bg-slate-800 hover:text-white font-mono'}`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes Column */}
            <div className="flex-1 overflow-y-auto custom-scrollbar h-full">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest pb-1 mb-1 border-b border-slate-800 text-center sticky top-0 bg-slate-950 block">Min</span>
              <div className="flex flex-col gap-0.5">
                {minutes.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSelectMin(m)}
                    className={`py-1 text-xs font-bold rounded w-full ${m === currentMin ? 'bg-emerald-600 text-white font-mono' : 'text-slate-400 hover:bg-slate-800 hover:text-white font-mono'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export const TimingView = ({ 
  currentUser, 
  showToast, 
  requestConfirm, 
  directory 
}) => {
  const canManageHitos = currentUser.role === ROLES.ADMIN || 
                        (currentUser.permisos || []).includes('HITOS_MANAGE') || 
                        (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role));

  const [hitos, setHitos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [editingHito, setEditingHito] = useState(null);
  const [assigningHito, setAssigningHito] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showProjectLinkDropdown, setShowProjectLinkDropdown] = useState(false);
  const [saving, setSaving] = useState(false);

  // Multi-timing states
  const [initializedProjectIds, setInitializedProjectIds] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('esquemapps_initialized_projects') || '[]');
    } catch (e) {
      return [];
    }
  });

  const saveInitializedProjects = (ids) => {
    setInitializedProjectIds(ids);
    window.localStorage.setItem('esquemapps_initialized_projects', JSON.stringify(ids));
  };

  const [virtualTimings, setVirtualTimings] = useState(() => {
    return JSON.parse(window.localStorage.getItem('esquemapps_virtual_timings') || '[]');
  });
  const [activeTiming, setActiveTiming] = useState(() => {
    const preselectedId = window.localStorage.getItem('esquemapps_active_timing_id');
    window.localStorage.removeItem('esquemapps_active_timing_id');
    if (preselectedId) {
      return { id: preselectedId, isResolvePlaceholder: true };
    }
    return null;
  });

  // Compile list of all timings
  const timingsList = useMemo(() => [
    ...projects
      .filter(p => {
        const pIdStr = String(p.id);
        const count = hitos.filter(h => String(h.proyectoId) === pIdStr).length;
        return count > 0 || initializedProjectIds.includes(pIdStr);
      })
      .map(p => {
        const pIdStr = String(p.id);
        const count = hitos.filter(h => String(h.proyectoId) === pIdStr).length;
        return {
          id: p.id,
          name: `Cronograma - ${p.name}`,
          projectName: p.name,
          isProject: true,
          hitosCount: count,
          date: p.date || new Date(Number(p.id)).toLocaleDateString('sv-SE')
        };
      }),
    ...virtualTimings.map(vt => {
      const count = hitos.filter(h => String(h.proyectoId) === String(vt.id)).length;
      return {
        ...vt,
        isProject: false,
        hitosCount: count
      };
    })
  ], [projects, hitos, virtualTimings, initializedProjectIds]);

  // Resolve preselected activeTiming from localStorage once projects/data are loaded
  useEffect(() => {
    if (activeTiming?.isResolvePlaceholder && projects.length > 0) {
      const match = timingsList.find(t => String(t.id) === String(activeTiming.id));
      if (match) {
        setActiveTiming(match);
      } else {
        const proj = projects.find(p => String(p.id) === String(activeTiming.id));
        if (proj) {
          if (!initializedProjectIds.includes(String(proj.id))) {
            const nextList = [...initializedProjectIds, String(proj.id)];
            saveInitializedProjects(nextList);
          }
          setActiveTiming({
            id: proj.id,
            name: `Cronograma - ${proj.name}`,
            projectName: proj.name,
            isProject: true,
            hitosCount: 0,
            date: proj.date || new Date(Number(proj.id)).toLocaleDateString('sv-SE')
          });
        } else {
          setActiveTiming(null);
        }
      }
    }
  }, [projects, hitos, activeTiming, initializedProjectIds]);

  const [showCreateVTModal, setShowCreateVTModal] = useState(false);
  const [newVTName, setNewVTName] = useState('');
  const [newVTDate, setNewVTDate] = useState(() => new Date().toLocaleDateString('sv-SE'));
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedLinkingTiming, setSelectedLinkingTiming] = useState(null);

  // Form Reset / Initial State Helper
  const getInitialFormState = (existingHitos = hitos) => {
    const todayStr = activeTiming?.date || new Date().toLocaleDateString('sv-SE');
    
    let defaultTime = "12:00";
    if (activeTiming) {
      const timingHitos = existingHitos.filter(h => String(h.proyectoId) === String(activeTiming.id));
      if (timingHitos.length > 0) {
        const lastHito = timingHitos[timingHitos.length - 1];
        if (lastHito.time) {
          const timeMatch = String(lastHito.time).match(/(\d{2}):(\d{2})/);
          if (timeMatch) {
            const hour = (parseInt(timeMatch[1]) + 1) % 24;
            defaultTime = `${String(hour).padStart(2, '0')}:${timeMatch[2]}`;
          }
        }
      }
    }

    return {
      title: '',
      location: '',
      date: todayStr,
      time: defaultTime,
      proyectoId: activeTiming?.id || '',
      riderId: ''
    };
  };

  // Creator form state
  const [form, setForm] = useState({ 
    title: '', 
    location: '', 
    date: new Date().toLocaleDateString('sv-SE'), 
    time: '12:00',
    proyectoId: '',
    riderId: ''
  });

  // Adjust defaults when activeTiming or hitos change
  useEffect(() => {
    if (activeTiming) {
      setForm(getInitialFormState(hitos));
    }
  }, [activeTiming]);

  const processHitos = (data) => {
    const parsedEvents = data.map(ev => {
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
        }
      } catch (err) {}
      return { ...ev, fullDate };
    });

    // Sort chronologically
    parsedEvents.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
    setHitos(parsedEvents);
  };

  const fetchGlobalData = async (force = false) => {
    if (force) setLoading(true);
    setFetchError(false);

    // Load Projects
    let projs = CACHE.proyectos;
    if (force || !projs) {
      try {
        const res = await apiFetch('getProyectos');
        if (res.status === 'success') {
          projs = res.data;
          setCache('proyectos', projs);
        }
      } catch (e) { console.error("Error loading projects", e); }
    }
    setProjects(projs || []);

    // Load Riders
    let rds = CACHE.riders;
    if (force || !rds) {
      try {
        const res = await apiFetch('getRiders');
        if (res.status === 'success') {
          rds = res.data;
          setCache('riders', rds);
        }
      } catch (e) { console.error("Error loading riders", e); }
    }
    setRiders(rds || []);

    // Load Hitos
    let hts = CACHE.hitos;
    if (force || !hts) {
      try {
        const res = await apiFetch('getHitos');
        if (res.status === 'success') {
          hts = res.data;
          setCache('hitos', hts);
        }
      } catch (e) { 
        setFetchError("Error al obtener hitos."); 
      }
    }
    if (hts) {
      processHitos(hts);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGlobalData();
    if (window.localStorage.getItem('esquemapps_auto_create_timing') === 'true') {
      window.localStorage.removeItem('esquemapps_auto_create_timing');
      setShowCreateVTModal(true);
    }
    const interval = setInterval(() => {
      fetchGlobalData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Multi-timing operations
  const handleCreateVirtualTiming = (e) => {
    e.preventDefault();
    if (!newVTName.trim()) return;

    if (selectedProjectId) {
      // Initialize project timing
      const nextList = [...initializedProjectIds, String(selectedProjectId)];
      saveInitializedProjects(nextList);

      const proj = projects.find(p => String(p.id) === String(selectedProjectId));
      if (proj) {
        // Set the activeTiming to the newly initialized project timing
        setActiveTiming({
          id: proj.id,
          name: `Cronograma - ${proj.name}`,
          projectName: proj.name,
          isProject: true,
          hitosCount: 0,
          date: proj.date || new Date(Number(proj.id)).toLocaleDateString('sv-SE')
        });
      }
      showToast("Cronograma de proyecto inicializado.");
    } else {
      // Create independent virtual timing
      const newVT = {
        id: `unlinked-${Date.now()}`,
        name: newVTName.trim(),
        date: newVTDate
      };

      const updated = [...virtualTimings, newVT];
      setVirtualTimings(updated);
      window.localStorage.setItem('esquemapps_virtual_timings', JSON.stringify(updated));

      // Instantly view the new timing
      setActiveTiming({
        ...newVT,
        isProject: false,
        hitosCount: 0
      });
      showToast("Cronograma independiente creado.");
    }

    // Clear and close
    setNewVTName('');
    setNewVTDate(new Date().toLocaleDateString('sv-SE'));
    setSelectedProjectId('');
    setShowCreateVTModal(false);
  };

  const handleDeleteVirtualTiming = async (vtId) => {
    const updated = virtualTimings.filter(vt => vt.id !== vtId);
    setVirtualTimings(updated);
    window.localStorage.setItem('esquemapps_virtual_timings', JSON.stringify(updated));

    // Clean up hitos in sheets
    const hitosToDelete = hitos.filter(h => String(h.proyectoId) === String(vtId));
    try {
      for (const h of hitosToDelete) {
        await apiFetch('deleteHito', { id: h.id });
      }
      clearCache('hitos');
      fetchGlobalData(true);
      showToast("Cronograma eliminado.");
    } catch(err) {
      showToast("Error al limpiar actividades.");
    }
  };

  const handleLinkTimingToProject = async (timingId, projectId) => {
    setLoading(true);
    try {
      const hitosToUpdate = hitos.filter(h => String(h.proyectoId) === String(timingId));
      for (const h of hitosToUpdate) {
        await apiFetch('updateHito', {
          ...h,
          proyectoId: String(projectId),
          riderId: ''
        });
      }

      // Remove virtual timing from local state
      const updatedVirtuals = virtualTimings.filter(vt => String(vt.id) !== String(timingId));
      setVirtualTimings(updatedVirtuals);
      window.localStorage.setItem('esquemapps_virtual_timings', JSON.stringify(updatedVirtuals));

      if (!initializedProjectIds.includes(String(projectId))) {
        const nextList = [...initializedProjectIds, String(projectId)];
        saveInitializedProjects(nextList);
      }

      const targetProject = projects.find(p => String(p.id) === String(projectId));
      // Update local view state if it is currently open
      if (activeTiming && String(activeTiming.id) === String(timingId)) {
        setActiveTiming({
          id: targetProject.id,
          name: `Cronograma - ${targetProject.name}`,
          projectName: targetProject.name,
          isProject: true,
          date: targetProject.date || new Date(Number(targetProject.id)).toLocaleDateString('sv-SE')
        });
      }

      showToast("Cronograma vinculado al proyecto.");
      clearCache('hitos');
      await fetchGlobalData(true);
    } catch(err) {
      showToast("Error al vincular cronograma.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkTimingFromProject = async (projectId) => {
    setLoading(true);
    try {
      const project = projects.find(p => String(p.id) === String(projectId));
      const newVirtualId = `unlinked-${Date.now()}`;
      
      const newVT = {
        id: newVirtualId,
        name: `Pauta Libre - ${project ? project.name : 'Gira'}`,
        date: new Date().toLocaleDateString('sv-SE')
      };

      const updatedVirtuals = [...virtualTimings, newVT];
      setVirtualTimings(updatedVirtuals);
      window.localStorage.setItem('esquemapps_virtual_timings', JSON.stringify(updatedVirtuals));

      const nextList = initializedProjectIds.filter(id => String(id) !== String(projectId));
      saveInitializedProjects(nextList);

      const hitosToUpdate = hitos.filter(h => String(h.proyectoId) === String(projectId));
      for (const h of hitosToUpdate) {
        await apiFetch('updateHito', {
          ...h,
          proyectoId: newVirtualId,
          riderId: ''
        });
      }

      // Update local view state if it is currently open
      if (activeTiming && String(activeTiming.id) === String(projectId)) {
        setActiveTiming({
          ...newVT,
          isProject: false
        });
      }

      showToast("Cronograma desvinculado.");
      clearCache('hitos');
      await fetchGlobalData(true);
    } catch(err) {
      showToast("Error al desvincular.");
    } finally {
      setLoading(false);
    }
  };

  // Hito modifications
  const handleCreateHito = async (e) => {
    e.preventDefault(); 
    if (!activeTiming) return;
    setSaving(true);

    const timingId = activeTiming.id;
    const isProj = activeTiming.isProject;

    const payload = { 
      ...form,
      proyectoId: timingId,
      riderId: isProj ? (riders.find(r => {
        try {
          const content = JSON.parse(r.content);
          return String(content.proyectoId) === String(timingId);
        } catch(err) { return false; }
      })?.id || '') : ''
    };

    // Optimistic UI Update
    if (!editingHito) {
      const optimisticHito = {
        ...payload,
        id: `temp-${Date.now()}`,
        asignados: []
      };
      processHitos([...hitos, optimisticHito]);
    }

    try {
      if (editingHito) {
        const updatePayload = { ...form, id: editingHito.id };
        const res = await apiFetch('updateHito', updatePayload);
        if (res.status === 'success') {
          showToast("Hito actualizado."); 
          setEditingHito(null); 
          setForm(getInitialFormState(hitos)); 
          clearCache('hitos'); 
          fetchGlobalData(true);
        } else {
          showToast("Error: " + res.message); 
        }
      } else {
        const res = await apiFetch('createHito', payload);
        if (res.status === 'success') {
          showToast("Hito agendado."); 
          clearCache('hitos'); 
          const finalHitosRes = await apiFetch('getHitos');
          if (finalHitosRes.status === 'success') {
            setCache('hitos', finalHitosRes.data);
            processHitos(finalHitosRes.data);
            setForm(getInitialFormState(finalHitosRes.data));
          } else {
            fetchGlobalData(true);
          }
        } else {
          showToast("Error: " + res.message); 
          fetchGlobalData(true);
        }
      }
    } catch(err) { 
      showToast("Error al procesar hito."); 
      fetchGlobalData(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHito = async (id) => {
    try {
      const res = await apiFetch('deleteHito', { id });
      if (res.status === 'success') {
        showToast("Hito eliminado."); 
        clearCache('hitos'); 
        fetchGlobalData(true);
      } else {
        showToast("Error: " + res.message); 
      }
    } catch(e) { 
      showToast("Error de conexión."); 
    }
  };

  const handleEditClick = (event) => {
    setEditingHito(event);
    setForm({
      title: event.title,
      location: event.location,
      date: String(event.date || '').split('T')[0],
      time: event.time || '12:00',
      proyectoId: event.proyectoId || '',
      riderId: event.riderId || ''
    });
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
      const res = await apiFetch('updateHitoAsignaciones', { id: assigningHito.id, asignados: assigningHito.asignados });
      if (res.status === 'success') {
        showToast("Crew asignado al hito."); setAssigningHito(null); 
        clearCache('hitos'); fetchGlobalData(true);
      } else {
        showToast("Error: " + res.message);
      }
    } catch(e) { showToast("Error al guardar."); }
  };



  const filteredHitos = activeTiming 
    ? hitos.filter(h => String(h.proyectoId) === String(activeTiming.id))
    : [];

  const getShareText = () => {
    let text = `📅 TIMING: ${activeTiming ? activeTiming.name : 'GENERAL'}\n\n`;
    filteredHitos.forEach(h => {
      const timeStr = h.time || '--:--';
      let formattedDate = '';
      if (h.date) {
        let dRaw = String(h.date).trim();
        if (dRaw.includes('T')) dRaw = dRaw.split('T')[0];
        const matchISO = dRaw.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (matchISO) {
          formattedDate = `${matchISO[3]}/${matchISO[2]}/${matchISO[1]}`;
        }
      }
      text += `• ${formattedDate} [${timeStr}] | ${h.title}\n📍 Lugar: ${formatCleanLocation(h.location)}\n\n`;
    });
    return encodeURIComponent(text);
  };

  const shareWhatsApp = () => {
    const text = getShareText();
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareEmail = () => {
    const text = getShareText();
    window.location.href = `mailto:?subject=Pauta%20y%20Timing%20Oficial&body=${text}`;
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-24 max-w-5xl mx-auto text-slate-100">
      
      {/* HEADER PRINCIPAL */}
      <header className="border-b border-slate-800 pb-3 md:pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 text-left print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2 md:gap-3">
            <Clock className="text-emerald-500" size={24} /> 
            {activeTiming ? activeTiming.name : 'Cronogramas'}
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {activeTiming 
              ? `Organiza los hitos para: ${activeTiming.name}`
              : 'Administra múltiples timings y asócialos a tus proyectos.'
            }
          </p>
        </div>
        {!activeTiming && timingsList.length > 0 && (
          <Button 
            variant="primary" 
            icon={Plus} 
            className="py-2 px-4 text-xs font-bold w-full sm:w-auto"
            onClick={() => setShowCreateVTModal(true)}
          >
            Nuevo Cronograma
          </Button>
        )}
      </header>

      {/* REJILLA DE TARJETAS (Si no hay timing activo) */}
      {!activeTiming ? (
        timingsList.length === 0 ? (
          <div className="text-center p-12 border border-slate-800 border-dashed rounded-xl bg-slate-900/50 mt-4 flex flex-col items-center justify-center">
             <Clock className="mx-auto text-slate-600 mb-3" size={48} />
             <p className="text-slate-400 font-light text-sm mb-4">Acá estarán los cronogramas creados</p>
             <button 
               onClick={() => setShowCreateVTModal(true)}
               className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-light px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
             >
               <span>+ Crear Cronograma</span>
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {timingsList.map(t => (
            <Card 
              key={t.id} 
              className="p-4 bg-slate-900 border border-slate-800 hover:border-emerald-500 transition-all flex flex-col justify-between cursor-pointer group"
              onClick={() => setActiveTiming(t)}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/20">
                    <Calendar className="text-emerald-500" size={16} />
                  </div>
                  <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    t.isProject ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-400 bg-slate-800 border border-slate-700'
                  }`}>
                    {t.isProject ? 'Proyecto' : 'Pauta Libre'}
                  </span>
                </div>
                
                <h3 className="font-bold text-white text-sm md:text-base leading-snug mb-1.5 truncate">
                  {t.projectName || t.name}
                </h3>
                
                <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mb-1.5">
                  <Clock size={11}/> {t.hitosCount} {t.hitosCount === 1 ? 'actividad' : 'actividades'}
                </p>
                
                {t.isProject && (
                  <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                    Gira Activa: {t.projectName}
                  </p>
                )}
              </div>

              <div className="flex gap-1.5 pt-3 border-t border-slate-800/60 mt-3 print:hidden">
                <Button 
                  variant="secondary" 
                  className="flex-1 py-1 text-[10px] font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTiming(t);
                  }}
                >
                  Ver Timing
                </Button>
                
                {t.isProject ? (
                  <Button 
                    variant="danger" 
                    className="py-1 px-2.5 text-[10px] font-bold bg-red-650 hover:bg-red-500 text-white shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnlinkTimingFromProject(t.id);
                    }}
                  >
                    Desvincular
                  </Button>
                ) : (
                  <div className="relative shrink-0">
                    <Button 
                      variant="primary" 
                      className="py-1 px-2.5 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLinkingTiming(t.id);
                      }}
                    >
                      Vincular
                    </Button>
                    
                    {selectedLinkingTiming === t.id && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setSelectedLinkingTiming(null); }}></div>
                        <div className="absolute right-0 bottom-full mb-1.5 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1.5 z-40 text-left">
                          <div className="px-3 py-1 border-b border-slate-800 mb-1">
                            <span className="text-[8px] font-bold text-slate-500 uppercase">Vincular a:</span>
                          </div>
                          {projects.filter(p => !timingsList.some(vt => vt.isProject && String(vt.id) === String(p.id))).map(p => (
                            <button 
                              key={p.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLinkTimingToProject(t.id, p.id);
                                setSelectedLinkingTiming(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition-colors truncate"
                            >
                              {p.name}
                            </button>
                          ))}
                          {projects.filter(p => !timingsList.some(vt => vt.isProject && String(vt.id) === String(p.id))).length === 0 && (
                            <div className="px-3 py-2 text-[10px] text-slate-500">No hay proyectos libres.</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {!t.isProject && (
                  <Button 
                    variant="secondary" 
                    className="py-1 px-2 text-slate-500 hover:text-red-500 border border-slate-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      requestConfirm("¿Eliminar este cronograma y todas sus actividades?", () => handleDeleteVirtualTiming(t.id));
                    }}
                  >
                    Eliminar
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )) : (
        /* VISTA DETALLADA DEL TIMING ACTIVO */
        <div className="space-y-4">
          <button 
            onClick={() => setActiveTiming(null)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2 text-left print:hidden"
          >
            <ChevronLeft size={16} /> Volver a Cronogramas
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Column: Form to Add/Edit Hito */}
            <div className="lg:col-span-4 flex flex-col space-y-6 print:hidden">
              {canManageHitos && (
                <Card className="p-4 md:p-6 border-slate-800 bg-slate-900/40 text-left">
                  <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-3">
                    <div>
                      <h2 className="text-sm md:text-base font-black text-white flex items-center gap-1.5">
                        <Plus className="text-emerald-500" size={16}/> 
                        {editingHito ? 'Editar Hito' : 'Añadir Hito'}
                      </h2>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {editingHito ? 'Modificando pauta seleccionada' : 'Crear un nuevo hito en el cronograma'}
                      </p>
                    </div>
                  </div>

                  {saving ? (
                    <div className="p-12 flex flex-col items-center justify-center space-y-4 animate-fade-in">
                      <PianoLoader size={60} />
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                        Guardando hito en la base de datos...
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateHito} className="space-y-4">
                      <div className="space-y-3 text-left">
                        
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Título del Hito</label>
                          <input 
                            list="global-hitos-list" 
                            required 
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-emerald-500" 
                            placeholder="Ej: Soundcheck, Show Principal, Load Out..." 
                            value={form.title} 
                            onChange={e => setForm({...form, title: e.target.value})} 
                          />
                          <datalist id="global-hitos-list">
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
                          <AddressAutocomplete 
                            required 
                            value={form.location} 
                            onChange={val => setForm({...form, location: val})} 
                            placeholder="Buscar dirección o recinto..." 
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white outline-none font-sans" 
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Fecha</label>
                            <input 
                              required 
                              type="date" 
                              value={form.date} 
                              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white outline-none cursor-pointer" 
                              onChange={e => setForm({...form, date: e.target.value})} 
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Hora</label>
                            <TimePicker 
                              value={form.time} 
                              onChange={val => setForm({...form, time: val})} 
                            />
                          </div>
                        </div>

                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-800">
                        <Button 
                          type="button" 
                          variant="secondary" 
                          className="flex-1 py-1.5 text-xs font-bold" 
                          onClick={() => {
                            setEditingHito(null);
                            setForm(getInitialFormState(hitos));
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1 py-1.5 text-xs font-bold">
                          {editingHito ? 'Guardar' : 'Crear'}
                        </Button>
                      </div>
                    </form>
                  )}
                </Card>
              )}
            </div>
            
            {/* Right Column: Timeline Event list */}
            <div className="lg:col-span-8 flex flex-col h-full print:col-span-12 print:w-full print:p-0">
              <Card className="p-4 md:p-6 border-slate-800 bg-slate-900/40 text-left flex-1 flex flex-col print:p-0 print:bg-transparent print:border-none">
                
                {/* Table Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-2 border-b border-slate-700/50 pb-3 text-left">
                  <div className="flex items-center gap-3 shrink-0">
                    <div>
                      <h2 className="text-sm md:text-base font-black text-white flex items-center gap-1.5 whitespace-nowrap">
                        <Clock className="text-emerald-500" size={16}/> Cronograma de Actividades
                      </h2>
                      {activeTiming.isProject && (
                        <span className="text-[9px] font-bold text-emerald-450 mt-0.5 block uppercase tracking-wider leading-none">
                          Proyecto Vinculado: {activeTiming.projectName}
                        </span>
                      )}
                    </div>
                  </div>
                         
                  <div className="flex items-center gap-1 print:hidden shrink-0 mt-1 md:mt-0 relative">
                    
                    {/* Global Project Link Dropdown Button */}
                    <div className="relative shrink-0">
                      {activeTiming.isProject ? (
                        <Button 
                          type="button" 
                          variant="danger" 
                          className="py-0.5 px-2 text-[9px] md:text-[10px] font-bold bg-red-650 hover:bg-red-500 text-white flex items-center gap-1 shrink-0 h-[24px] rounded"
                          onClick={() => handleUnlinkTimingFromProject(activeTiming.id)}
                        >
                          Desvincular
                        </Button>
                      ) : (
                        <div className="relative">
                          <Button 
                            type="button" 
                            className="py-0.5 px-2 text-[9px] md:text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shrink-0 h-[24px] rounded"
                            onClick={() => setShowProjectLinkDropdown(!showProjectLinkDropdown)}
                          >
                            Vincular
                          </Button>
                          {showProjectLinkDropdown && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setShowProjectLinkDropdown(false)}></div>
                              
                              <div className="absolute right-0 mt-1.5 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1.5 z-40 animate-fade-in text-left">
                                <div className="px-3 py-1 border-b border-slate-800 mb-1">
                                  <span className="text-[8px] font-bold text-slate-500 uppercase">Selecciona Proyecto</span>
                                </div>
                                {projects.filter(p => !timingsList.some(vt => vt.isProject && String(vt.id) === String(p.id))).map(p => (
                                  <button 
                                    key={p.id}
                                    onClick={() => {
                                      handleLinkTimingToProject(activeTiming.id, p.id);
                                      setShowProjectLinkDropdown(false);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition-colors truncate"
                                  >
                                    {p.name}
                                  </button>
                                ))}
                                {projects.filter(p => !timingsList.some(vt => vt.isProject && String(vt.id) === String(p.id))).length === 0 && (
                                  <div className="px-3 py-2 text-xs text-slate-500">No hay proyectos activos.</div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <Button 
                      variant="secondary" 
                      className="py-0.5 px-2 text-[9px] md:text-[10px] font-bold border border-slate-750 flex items-center gap-1 shrink-0 h-[24px] rounded"
                      onClick={() => window.print()}
                    >
                      PDF
                    </Button>

                    <div className="relative shrink-0">
                      <Button 
                        variant="secondary" 
                        className="py-0.5 px-2 text-[9px] md:text-[10px] font-bold border border-slate-750 flex items-center gap-1 text-slate-300 hover:text-white shrink-0 h-[24px] rounded"
                        onClick={() => setShowShareMenu(!showShareMenu)}
                      >
                        <Share2 size={10} /> Compartir
                      </Button>
                      
                      {showShareMenu && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setShowShareMenu(false)}></div>
                          
                          <div className="absolute right-0 mt-1.5 w-40 bg-slate-900 border border-slate-855 rounded-lg shadow-xl py-1.5 z-40 animate-fade-in text-left">
                            <button 
                              onClick={() => { shareWhatsApp(); setShowShareMenu(false); }}
                              className="w-full px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-850 hover:text-emerald-400 flex items-center gap-2 transition-colors text-left"
                            >
                              WhatsApp
                            </button>
                            <button 
                              onClick={() => { shareEmail(); setShowShareMenu(false); }}
                              className="w-full px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-850 hover:text-blue-400 flex items-center gap-2 transition-colors text-left"
                            >
                              Correo
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Loader / Errors / Data */}
                {fetchError ? (
                  <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-400 flex items-center gap-3">
                    <AlertCircle size={20} /> {fetchError}
                  </div>
                ) : loading && filteredHitos.length === 0 ? (
                  <div className="flex justify-center p-12 flex-1 items-center"><PianoLoader size={70} /></div>
                ) : filteredHitos.length === 0 ? (
                  <div className="text-center p-12 border border-slate-800 border-dashed rounded-xl bg-slate-900/50 flex-1 flex flex-col items-center justify-center">
                    <CalendarPlus className="text-slate-600 mb-3" size={36} />
                    <p className="text-slate-400 text-xs md:text-sm max-w-sm mx-auto">
                      Aún no hay hitos programados para este cronograma.
                    </p>
                  </div>
                ) : (
                  <div className="relative before:absolute before:inset-y-0 before:left-[5px] md:before:left-[9px] before:w-0.5 before:bg-slate-800 ml-1 md:ml-0 space-y-4 flex-1">
                    {filteredHitos.map((event) => (
                      <EventCard 
                         key={event.id} 
                         event={event} 
                         canManage={canManageHitos} 
                         handleDeleteHito={handleDeleteHito} 
                         handleEditHito={handleEditClick} 
                         setAssigningHito={setAssigningHito} 
                         currentUser={currentUser} 
                         requestConfirm={requestConfirm} 
                         showToast={showToast}
                         onRefresh={() => fetchGlobalData(true)}
                      />
                    ))}
                  </div>
                )}

              </Card>
            </div>

          </div>
        </div>
      )}

      {/* POPUP DE CREACIÓN DE VIRTUAL TIMING */}
      {showCreateVTModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in text-slate-100">
          <Card className="w-full max-w-sm p-4 md:p-6 bg-slate-900 border-emerald-500 flex flex-col text-left shadow-2xl">
            <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-3">
              <h2 className="text-base md:text-lg font-bold text-white">Crear Nuevo Cronograma</h2>
              <button onClick={() => setShowCreateVTModal(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleCreateVirtualTiming} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Nombre del Cronograma</label>
                <input 
                  required 
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-emerald-500" 
                  placeholder="Ej: Ensayo General Lollapalooza"
                  value={newVTName}
                  onChange={e => setNewVTName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Fecha de Inicio</label>
                <input 
                  required 
                  type="date"
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white outline-none cursor-pointer" 
                  value={newVTDate}
                  onChange={e => setNewVTDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Vincular a Proyecto (Opcional)</label>
                <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white outline-none cursor-pointer"
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                >
                  <option value="">Independiente / No vincular</option>
                  {projects.filter(p => !timingsList.some(t => t.isProject && String(t.id) === String(p.id))).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="flex-1 py-1.5 text-xs font-bold" 
                  onClick={() => setShowCreateVTModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" className="flex-1 py-1.5 text-xs font-bold">
                  Crear
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL DE ASIGNACIÓN DE CREW */}
      {assigningHito && (
        <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in text-slate-100">
          <Card className="w-full max-w-md p-4 md:p-6 bg-slate-900 border-emerald-500 flex flex-col max-h-[80vh] text-left">
            <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-3">
              <h2 className="text-base md:text-lg font-bold text-white">Asignar Crew al Hito</h2>
              <button onClick={() => setAssigningHito(null)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            <p className="text-xs md:text-sm text-emerald-400 font-bold mb-3">{assigningHito.title}</p>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 mb-3 pr-2 custom-scrollbar">
              {directory.length === 0 ? (
                <p className="text-slate-500 text-xs md:text-sm text-center">Cargando directorio...</p>
              ) : (
                directory.map(u => {
                  const isChecked = assigningHito.asignados.includes(u.email);
                  return (
                    <button 
                      key={u.email} 
                      onClick={() => toggleAssign(u.email)} 
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-colors ${isChecked ? 'bg-emerald-500/10 border-emerald-500/50 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                    >
                      <div className="flex items-center gap-2.5 text-left">
                        {isChecked ? <CheckSquare className="text-emerald-500" size={18}/> : <Square size={18}/>}
                        <div>
                          <p className="font-bold text-xs md:text-sm">{u.name}</p>
                          <p className="text-[9px] uppercase tracking-wider">{u.role}</p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            <Button onClick={saveAsignaciones} className="w-full py-2.5 md:py-3 text-xs md:text-sm">Guardar Asignaciones</Button>
          </Card>
        </div>
      )}

    </div>
  );
};
