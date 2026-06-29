import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, FileText, Printer, Edit3, Link, Plus, 
  RefreshCw, Trash2, Mic2, Lightbulb, Map as MapIcon, 
  Utensils, Maximize, Save, AlertCircle, CheckCircle2, X 
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { NotificationsButton } from '../components/NotificationsButton';
import { AutoResizeTextarea } from '../components/AutoResizeTextarea';
import { MicDiSelect } from '../components/MicDiSelect';
import { StageplotBuilder } from '../components/StageplotBuilder';
import { PianoLoader } from '../components/PianoLoader';
import { CACHE, apiFetch, clearCache, compareProjectIds } from '../utils/api';
import { ROLES } from '../utils/constants';

export const RidersView = ({ currentUser, showToast, requestConfirm, activeRider, setActiveRider, directory, selectedProject, setCurrentView }) => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [viewMode, setViewMode] = useState(activeRider ? 'DETAIL' : 'LIST');
  const [editTab, setEditTab] = useState('GENERAL');
  const [allHitos, setAllHitos] = useState([]);
  const [includeTiming, setIncludeTiming] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [linkingRider, setLinkingRider] = useState(false);
  const [proyectos, setProyectos] = useState([]); // Fixed undefined proyectos bug
  
  const canSeeRiders = currentUser.role === ROLES.ADMIN || 
                        (currentUser.permisos || []).includes('RIDERS') || 
                        (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TEC_JEFE, ROLES.JEFE_CAT_APV].includes(currentUser.role));
  const canManageRiders = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TEC_JEFE, ROLES.JEFE_CAT_APV].includes(currentUser.role) || (currentUser.permisos || []).includes('RIDERS_MANAGE');
  const canDeleteRiders = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role) || (currentUser.permisos || []).includes('RIDERS_MANAGE');

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
      let rd = CACHE.riders, hd = CACHE.hitos, pd = CACHE.proyectos;
      
      if (force || !rd) { const res = await apiFetch('getRiders'); if(res.status==='success') { rd = res.data; CACHE.riders = rd; } }
      if (force || !hd) { const res = await apiFetch('getHitos'); if(res.status==='success') { hd = res.data; CACHE.hitos = hd; } }
      if (force || !pd) { const res = await apiFetch('getProyectos'); if(res.status==='success') { pd = res.data; CACHE.proyectos = pd; } }
      
      if (hd) setAllHitos(hd);
      if (pd) setProyectos(pd);
      
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
      .filter(h => compareProjectIds(h.proyectoId, targetRider.content.proyectoId))
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

  const visibleRiders = riders.filter(r => compareProjectIds(r.content.proyectoId, selectedProject.id));
  const unlinkedRiders = riders.filter(r => !r.content.proyectoId);

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
                  <AutoResizeTextarea className="w-full bg-slate-900 border border-slate-700 rounded p-2 md:p-3 text-emerald-400 font-mono text-xs md:text-sm min-h-[60px] focus:border-emerald-500 outline-none" value={form.content.importante} onChange={e=>setForm(prev=>({...prev, content: {...prev.content, importante: e.target.value}}))} placeholder="Información crucial..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                  <div className="p-3 md:p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5">
                    <h4 className="font-bold text-white text-xs md:text-sm mb-1.5">Contacto Management</h4>
                    <div><label className="text-[10px] text-slate-400 uppercase">Nombre y Apellidos</label><input className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs md:text-sm outline-none focus:border-emerald-500" value={form.content.contacto.mgmtNombre || ''} onChange={e=>setForm(prev=>({...prev, content: {...prev.content, contacto: {...prev.content.contacto, mgmtNombre: e.target.value}}}))} placeholder="Ej: Juan Pérez" /></div>
                    <div><label className="text-[10px] text-slate-400 uppercase">Celular</label><input type="tel" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs md:text-sm outline-none focus:border-emerald-500" value={form.content.contacto.mgmtCel} onChange={e=>setForm(prev=>({...prev, content: {...prev.content, contacto: {...prev.content.contacto, mgmtCel: e.target.value.replace(/[^0-9+]/g, '')}}}))} placeholder="+569..." /></div>
                    <div><label className="text-[10px] text-slate-400 uppercase">Correo</label><input className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs md:text-sm outline-none focus:border-emerald-500" value={form.content.contacto.mgmtCorreo} onChange={e=>setForm(prev=>({...prev, content: {...prev.content, contacto: {...prev.content.contacto, mgmtCorreo: e.target.value}}}))} /></div>
                  </div>
                  <div className="p-3 md:p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5">
                    <h4 className="font-bold text-white text-xs md:text-sm mb-1.5">Contacto Producción</h4>
                    <div><label className="text-[10px] text-slate-400 uppercase">Nombre y Apellidos</label><input className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs md:text-sm outline-none focus:border-emerald-500" value={form.content.contacto.prodNombre || ''} onChange={e=>setForm(prev=>({...prev, content: {...prev.content, contacto: {...prev.content.contacto, prodNombre: e.target.value}}}))} placeholder="Ej: Ana Rojas" /></div>
                    <div><label className="text-[10px] text-slate-400 uppercase">Celular</label><input type="tel" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs md:text-sm outline-none focus:border-emerald-500" value={form.content.contacto.prodCel} onChange={e=>setForm(prev=>({...prev, content: {...prev.content, contacto: {...prev.content.contacto, prodCel: e.target.value.replace(/[^0-9+]/g, '')}}}))} placeholder="+569..."/></div>
                    <div><label className="text-[10px] text-slate-400 uppercase">Correo</label><input className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs md:text-sm outline-none focus:border-emerald-500" value={form.content.contacto.prodCorreo} onChange={e=>setForm(prev=>({...prev, content: {...prev.content, contacto: {...prev.content.contacto, prodCorreo: e.target.value}}}))} /></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1.5"><label className="text-xs md:text-sm font-bold text-white block">Requerimientos de SoundCheck</label><Button variant="ghost" className="py-0.5 px-2 text-[10px]" icon={FileText} onClick={() => setForm(prev => ({...prev, content: {...prev.content, soundcheck: templatesTexto.soundcheck}}))}>Usar Plantilla</Button></div>
                  <AutoResizeTextarea className="w-full bg-slate-900 border border-slate-700 rounded p-2 md:p-3 text-emerald-400 font-mono text-xs md:text-sm min-h-[60px] focus:border-emerald-500 outline-none" value={form.content.soundcheck} onChange={e=>setForm(prev=>({...prev, content: {...prev.content, soundcheck: e.target.value}}))} />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1.5"><label className="text-xs md:text-sm font-bold text-white block">Recordatorio Oficial</label><Button variant="ghost" className="py-0.5 px-2 text-[10px]" icon={FileText} onClick={() => setForm(prev => ({...prev, content: {...prev.content, recordatorio: templatesTexto.recordatorio}}))}>Usar Plantilla</Button></div>
                  <AutoResizeTextarea className="w-full bg-slate-900 border border-slate-700 rounded p-2 md:p-3 text-red-400 font-mono text-xs md:text-sm min-h-[60px] outline-none focus:border-red-500" value={form.content.recordatorio} onChange={e=>setForm(prev=>({...prev, content: {...prev.content, recordatorio: e.target.value}}))} />
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
                    <input type="checkbox" checked={form.content.catering.showSizes} onChange={e => setForm(prev => ({...prev, content: {...prev.content, catering: {...prev.content.catering, showSizes: e.target.checked}}}))} className="accent-emerald-500 rounded bg-slate-900 border-slate-700"/>
                    <span>Incluir Tallaje (Merch/Uniformes)</span>
                  </label>
                </div>
                
                <div>
                  <label className="text-[10px] md:text-xs font-bold text-slate-400 block mb-1 uppercase">Requerimientos Específicos / Camarines</label>
                  <AutoResizeTextarea className="w-full bg-slate-900 border border-slate-700 rounded p-2 md:p-3 text-white text-xs md:text-sm min-h-[60px] outline-none focus:border-emerald-500" value={form.content.catering.notes} onChange={e=>setForm(prev => ({...prev, content: {...prev.content, catering: {...prev.content.catering, notes: e.target.value}}}))} placeholder="Ej: Espejo de cuerpo entero, 12 toallas negras, agua sin gas..." />
                </div>

                <div className="space-y-2 mt-4">
                  <label className="text-[10px] md:text-xs font-bold text-slate-400 block uppercase">Añadir Tablas de Requerimientos y Extras</label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {CATERING_SECTIONS.map(sec => (
                       <Button key={sec} type="button" variant="secondary" onClick={() => addCateringTable(sec)} className="py-1 px-2 text-[10px]" icon={Plus}>{sec}</Button>
                    ))}
                    <div className="flex flex-col gap-1 items-start ml-2">
                      <Button type="button" variant={form.content.catering.showCatEquipo ? 'primary' : 'secondary'} onClick={() => setForm(prev => ({...prev, content: {...prev.content, catering: {...prev.content.catering, showCatEquipo: !prev.content.catering.showCatEquipo}}}))} className="py-1.5 px-3 text-[10px]" icon={form.content.catering.showCatEquipo ? X : Plus}>
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
                   <Button variant="secondary" className="py-1.5" icon={Link} onClick={() => handleUnlinkRider(displayRider)}>Desvincular</Button>
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
            <div className="flex justify-center p-8 print:hidden"><PianoLoader size={40} /></div>
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

      {/* MODAL DE VINCULACIÓN */}
      {linkingRider && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in print:hidden">
          <Card className="w-full max-w-md p-4 md:p-6 bg-slate-900 border-emerald-500 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-3">
              <h2 className="text-base md:text-lg font-bold text-white">Vincular Rider Técnico Existente</h2>
              <button onClick={() => setLinkingRider(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            <p className="text-xs text-slate-400 mb-3">Elige uno de tus riders huérfanos/no vinculados para asignarlo a esta gira:</p>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 mb-4 pr-2 custom-scrollbar">
              {unlinkedRiders.length === 0 ? (
                <p className="text-slate-500 text-xs md:text-sm text-center py-6">No hay riders sin proyecto en tu cuenta.</p>
              ) : unlinkedRiders.map(r => (
                <button key={r.id} onClick={() => handleLinkRider(r.id)} className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-850 bg-slate-800 hover:bg-slate-750 text-left transition-colors">
                  <div>
                    <p className="font-bold text-xs md:text-sm text-white">{r.title}</p>
                    <p className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold mt-0.5">{r.type}</p>
                  </div>
                  <ChevronLeft size={16} className="text-slate-500 rotate-180" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};
export default RidersView;
