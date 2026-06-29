import React, { useState, useEffect } from 'react';
import { 
  Truck, RefreshCw, Plus, ChevronLeft, Calendar, MapPin, 
  Navigation, Copy, Mail, Loader2, MessageCircle 
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { NotificationsButton } from '../components/NotificationsButton';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { PianoLoader } from '../components/PianoLoader';
import { CACHE, apiFetch, clearCache, compareProjectIds } from '../utils/api';
import { ROLES } from '../utils/constants';

export const TransportView = ({ currentUser, setCurrentView, showToast, selectedProject }) => {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', time: '', origin: '', dest: '', proyectoId: selectedProject?.id || '', paradas: [] });
  const [stopInput, setStopInput] = useState('');
  const [assigningDriverToken, setAssigningDriverToken] = useState(null);
  const [driverForm, setDriverForm] = useState({ name: '', email: '', phone: '+569' });
  const [sendingId, setSendingId] = useState(null);
  const [editingRouteId, setEditingRouteId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', date: '', time: '', origin: '', dest: '', paradas: [] });
  const [editStopInput, setEditStopInput] = useState('');

  const canSeeTransport = currentUser.role === ROLES.ADMIN || 
                           (currentUser.permisos || []).includes('TRANSPORT') || 
                           (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TRASLADO].includes(currentUser.role));
  const canCreateRoute = currentUser.role === ROLES.ADMIN || 
                          (currentUser.permisos || []).includes('TRANSPORT_CREATE') || 
                          (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TRASLADO].includes(currentUser.role));
  const canEditRoute = currentUser.role === ROLES.ADMIN || 
                        (currentUser.permisos || []).includes('TRANSPORT_EDIT') || 
                        (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role));

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    let str = String(dateStr).trim();
    if (str.includes('T')) {
      str = str.split('T')[0];
    }
    let clean = str.replace(/-/g, '/');
    const parts = clean.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return clean;
  };

  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return '';
    let str = String(timeStr).trim();
    if (str.includes('T')) {
      const timePart = str.split('T')[1];
      const timeSubParts = timePart.split(':');
      if (timeSubParts.length >= 2) {
        return `${timeSubParts[0]}:${timeSubParts[1]}`;
      }
    }
    const parts = str.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return str;
  };

  if (!canSeeTransport) {
    return (
      <div className="p-8 text-center text-red-500 font-bold border border-red-500/20 bg-red-500/5 rounded-xl">
        Acceso Denegado: No tienes privilegios para ver la sección de Transportes.
      </div>
    );
  }

  const fetchTransports = async (force = false, isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      let transData = CACHE.transportes;
      if (force || !transData) {
        const res = await apiFetch('getTransportes');
        if (res.status === 'success') { transData = res.data; CACHE.transportes = res.data; }
      }
      
      if (transData) {
        if (isBackground) {
          const oldLen = transports.length;
          const newLen = transData.filter(t => compareProjectIds(t.proyectoId, selectedProject?.id)).length;
          if (newLen > oldLen) showToast("🚐 ¡Hay un nuevo Transporte en este proyecto!");
        }
        setTransports(transData.filter(t => compareProjectIds(t.proyectoId, selectedProject?.id)));
      }
    } catch(e) {
      if (!isBackground) showToast("Error al cargar transportes.");
    }
    if (!isBackground) setLoading(false);
  };

  useEffect(() => { 
    if(selectedProject) fetchTransports(); 
    const interval = setInterval(() => fetchTransports(true, true), 30000);
    return () => clearInterval(interval);
  }, [selectedProject]);

  if (!selectedProject) return <div className="text-center p-8"><Button onClick={() => setCurrentView('DASHBOARD')}>Volver a Proyectos</Button></div>;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast("¡Token copiado al portapapeles!");
  };

  const handleSaveDriver = async (e, t) => {
    e.preventDefault();
    try {
      const res = await apiFetch('asignarConductor', { 
        token: t.token, 
        conductor: `${driverForm.name.trim()} (${driverForm.email.trim()})`, 
        conductorPhone: driverForm.phone.trim() 
      });
      if (res.status === 'success') {
        showToast("Piloto asignado con éxito.");
        setAssigningDriverToken(null);
        clearCache('transportes');
        fetchTransports(true);
      } else {
        showToast("Error: " + res.message);
      }
    } catch(err) {
      showToast("Error al asignar piloto.");
    }
  };

  const handleUpdateRoute = async (e, routeId) => {
    e.preventDefault();
    try {
      const res = await apiFetch('updateTransporte', { 
        id: routeId, 
        title: editForm.title.trim(),
        date: editForm.date,
        time: editForm.time,
        origin: editForm.origin.trim(),
        dest: editForm.dest.trim(),
        paradas: editForm.paradas
      });
      if (res.status === 'success') {
        showToast("Ruta actualizada y avisos enviados.");
        setEditingRouteId(null);
        clearCache('transportes');
        fetchTransports(true);
      } else {
        showToast("Error: " + res.message);
      }
    } catch(err) {
      showToast("Error al actualizar la ruta.");
    }
  };

  const handleSendNotification = async (t) => {
    setSendingId(t.token);
    try {
      const conductorEmail = t.conductor.match(/\(([^)]+)\)/)?.[1] || t.conductor;
      const conductorName = t.conductor.split(' (')[0];
      const res = await apiFetch('enviarAvisoConductor', {
        token: t.token,
        conductorEmail,
        conductorName,
        title: t.title,
        date: t.date,
        time: t.time,
        origin: t.origin,
        dest: t.dest,
        paradas: t.paradas || []
      });
      if (res.status === 'success') {
        showToast("Aviso enviado por email.");
      } else {
        showToast("Error: " + res.message);
      }
    } catch(err) {
      showToast("Error al enviar correo al conductor.");
    }
    setSendingId(null);
  };

  const getWhatsAppLink = (t) => {
    const cleanPhone = t.conductorPhone.replace(/[^0-9]/g, '');
    const driverName = t.conductor.split(' (')[0];
    const driverAppUrl = window.location.origin + '/esquemas-driver/';
    const msg = `Hola ${driverName}! Te hemos asignado una nueva ruta: '${t.title}'. Para ver el itinerario completo e iniciar navegación con Waze o Google Maps, haz clic en el siguiente enlace:\n\n🔗 ${driverAppUrl}?token=${t.token}\n\n🔑 Token: ${t.token}\n\nPor favor, confirma recepción en el correo que te enviamos. ¡Gracias!`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, proyectoId: selectedProject.id };
      const res = await apiFetch('createTransporte', payload);
      if (res.status === 'success') {
        showToast("Ruta creada con éxito.");
        setIsCreating(false);
        setForm({ title: '', date: '', time: '', origin: '', dest: '', proyectoId: selectedProject.id, paradas: [] });
        clearCache('transportes');
        fetchTransports(true);
      }
    } catch(e) {
      showToast("Error al crear ruta.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 pb-24 animate-fade-in">
      <button onClick={() => setCurrentView('PROJECT_DETAILS')} className="flex items-center gap-1.5 text-xs md:text-sm text-slate-400 hover:text-white transition-colors mb-2"><ChevronLeft size={16}/> Volver a {selectedProject.name}</button>
      
      <header className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2"><Truck className="text-blue-500" size={24}/> Transportes</h1>
          <p className="text-sm text-slate-400">Rutas para: {selectedProject.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <NotificationsButton currentUser={currentUser} />
          <Button variant="ghost" icon={RefreshCw} onClick={() => fetchTransports(true)} className="px-2 border border-slate-700 hover:text-emerald-400" title="Actualizar Transportes" />
          {canCreateRoute && !isCreating && <Button icon={Plus} onClick={() => setIsCreating(true)}>Nueva Ruta</Button>}
        </div>
      </header>

      {isCreating && (
        <Card className="p-4 md:p-6 border-blue-500 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Crear Nueva Ruta</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div><label className="text-xs text-slate-400 block mb-1">Título de la Ruta</label><input required className="w-full bg-slate-900 border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} placeholder="Ej. Traslado Hotel - Recinto" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-slate-400 block mb-1">Fecha</label><input required type="date" className="w-full bg-slate-900 border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} /></div>
              <div><label className="text-xs text-slate-400 block mb-1">Hora</label><input required type="time" className="w-full bg-slate-900 border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500" value={form.time} onChange={e=>setForm({...form, time: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Origen</label>
                <AddressAutocomplete 
                  required 
                  value={form.origin} 
                  onChange={val => setForm({...form, origin: val})} 
                  placeholder="Dirección o recinto de origen..." 
                  className="w-full bg-slate-900 border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Destino</label>
                <AddressAutocomplete 
                  required 
                  value={form.dest} 
                  onChange={val => setForm({...form, dest: val})} 
                  placeholder="Dirección o recinto de destino..." 
                  className="w-full bg-slate-900 border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none" 
                />
              </div>
            </div>

            <div className="text-left space-y-2 border-t border-slate-800 pt-3">
              <label className="text-xs text-slate-400 block font-bold">Paradas Intermedias (Recogidas / Puntos de Ruta)</label>
              <div className="flex gap-2">
                <AddressAutocomplete 
                  value={stopInput} 
                  onChange={setStopInput} 
                  placeholder="Buscar dirección de parada..." 
                  className="flex-1 bg-slate-900 border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none" 
                />
                <Button 
                  type="button" 
                  onClick={() => {
                    if (stopInput.trim()) {
                      setForm(prev => ({ ...prev, paradas: [...(prev.paradas || []), stopInput.trim()] }));
                      setStopInput('');
                    } else {
                      showToast("Ingresa una dirección válida primero.");
                    }
                  }} 
                  variant="blue" 
                  className="px-4 py-2 shrink-0 text-xs"
                >
                  Agregar Parada
                </Button>
              </div>
              
              {form.paradas && form.paradas.length > 0 && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar p-2.5 bg-slate-950 rounded border border-slate-800 mt-2">
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-2">Secuencia de Recogidas:</p>
                  {form.paradas.map((st, idx) => (
                    <div key={idx} className="flex justify-between items-center gap-2 text-xs bg-slate-900 px-2.5 py-2 rounded border border-slate-800 transition-colors hover:border-slate-700">
                      <span className="text-slate-300 truncate flex-1"><span className="font-bold text-blue-400 mr-1.5">#{idx + 1}</span> {st}</span>
                      <button 
                        type="button" 
                        onClick={() => setForm(prev => ({ ...prev, paradas: prev.paradas.filter((_, i) => i !== idx) }))}
                        className="text-red-400 hover:text-red-300 font-bold px-1 text-sm hover:scale-110 transition-transform"
                        title="Eliminar parada"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2"><Button variant="secondary" className="flex-1 py-2.5" onClick={()=>setIsCreating(false)}>Cancelar</Button><Button type="submit" variant="blue" className="flex-1 py-2.5">Guardar Ruta</Button></div>
          </form>
        </Card>
      )}

      {loading ? <div className="flex justify-center p-8"><PianoLoader size={40} /></div> : transports.length === 0 ? <div className="text-center p-12 border border-slate-800 border-dashed rounded-xl bg-slate-900/50 text-slate-500">No hay transportes programados en este proyecto.</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transports.map(t => {
            const hasDriver = !!t.conductor;
            return (
              <Card key={t.id} className="p-4 border-l-4 border-l-blue-500 flex flex-col justify-between min-h-[280px]">
                {editingRouteId === t.id ? (
                  <form onSubmit={(e) => handleUpdateRoute(e, t.id)} className="space-y-3 text-left animate-fade-in w-full">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 mb-1.5">
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Editar Ruta</h4>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">{t.token}</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5 font-bold uppercase">Título de la Ruta</label>
                      <input required className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-blue-500" value={editForm.title} onChange={e=>setEditForm({...editForm, title: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5 font-bold uppercase">Fecha</label>
                        <input required type="date" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-blue-500" value={editForm.date} onChange={e=>setEditForm({...editForm, date: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5 font-bold uppercase">Hora</label>
                        <input required type="time" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-blue-500" value={editForm.time} onChange={e=>setEditForm({...editForm, time: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5 font-bold uppercase">Origen</label>
                      <AddressAutocomplete value={editForm.origin} onChange={val=>setEditForm({...editForm, origin: val})} placeholder="Buscar origen..." className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-blue-500"/>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5 font-bold uppercase">Destino</label>
                      <AddressAutocomplete value={editForm.dest} onChange={val=>setEditForm({...editForm, dest: val})} placeholder="Buscar destino..." className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-blue-500"/>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 block font-bold uppercase">Paradas Intermedias</label>
                      <div className="flex gap-1.5">
                        <AddressAutocomplete value={editStopInput} onChange={setEditStopInput} placeholder="Añadir parada..." className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-blue-500"/>
                        <Button type="button" variant="blue" className="px-2.5 py-1.5 text-xs shrink-0" onClick={() => { if(editStopInput.trim()) { setEditForm(prev => ({...prev, paradas: [...(prev.paradas || []), editStopInput.trim()]})); setEditStopInput(''); } }}>+</Button>
                      </div>
                      {editForm.paradas && editForm.paradas.length > 0 && (
                        <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar p-2 bg-slate-950 rounded border border-slate-800">
                          {editForm.paradas.map((s, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[10px] bg-slate-900 px-2 py-1 rounded border border-slate-850">
                              <span className="text-slate-300 truncate">#{idx+1}: {s}</span>
                              <button type="button" className="text-red-400 hover:text-red-300 ml-1 font-bold text-xs" onClick={() => setEditForm(prev => ({...prev, paradas: prev.paradas.filter((_, i) => i !== idx)}))}>✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-2 border-t border-slate-800">
                      <Button type="button" variant="secondary" className="flex-1 py-2 text-xs" onClick={()=>setEditingRouteId(null)}>Cancelar</Button>
                      <Button type="submit" variant="blue" className="flex-1 py-2 text-xs">Guardar Cambios</Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-base md:text-lg text-white leading-tight">{t.title}</h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {canEditRoute && (
                            <button 
                              type="button" 
                              onClick={() => {
                                  setEditingRouteId(t.id);
                                  setEditForm({ title: t.title, date: t.date, time: t.time, origin: t.origin, dest: t.dest, paradas: t.paradas || [] });
                                  setEditStopInput('');
                              }} 
                              className="text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded transition-all font-bold"
                              title="Editar Ruta"
                            >
                              Editar
                            </button>
                          )}
                          <span className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                            t.status === 'PENDING' || t.status === 'PENDIENTE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                            t.status === 'COMENZADO' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                            t.status === 'EN VIAJE' || t.status === 'EN RUTA' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                            t.status === 'LLEGADO' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                            t.status === 'FINALIZADO' ? 'bg-slate-500/10 text-slate-400 border-slate-700' :
                            'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>{t.status || 'PENDIENTE'}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-xs md:text-sm text-slate-300 mb-4 text-left">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          <p className="flex items-center gap-2 font-mono"><Calendar size={13}/> {formatDisplayDate(t.date)} {formatDisplayTime(t.time)}</p>
                          {t.status === 'FINALIZADO' && t.endTime && (
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                              ✅ Finalizado a las {t.endTime}
                            </span>
                          )}
                        </div>
                        
                        <div className="border border-slate-800/80 bg-slate-900/40 rounded-lg p-2.5 space-y-1.5">
                          <p className="flex items-start gap-1.5">
                            <MapPin size={13} className="text-amber-500 shrink-0 mt-0.5"/> 
                            <span className="font-bold shrink-0">Origen: </span>
                            <span className="text-slate-300 truncate">{t.origin}</span>
                          </p>
                          
                          {t.paradas && t.paradas.length > 0 && (
                            <div className="pl-4 border-l border-slate-800 space-y-1 my-1">
                              {t.paradas.map((st, i) => (
                                <p key={i} className="flex items-start gap-1 text-slate-400 text-xs">
                                  <span className="font-bold text-blue-400">📍 Stop {i+1}:</span>
                                  <span className="truncate">{st}</span>
                                </p>
                              ))}
                            </div>
                          )}
                          
                          <p className="flex items-start gap-1.5 pt-1 border-t border-slate-800/50">
                            <Navigation size={13} className="text-emerald-500 shrink-0 mt-0.5"/> 
                            <span className="font-bold shrink-0">Destino: </span>
                            <span className="text-slate-300 truncate">{t.dest}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-slate-800 pt-3 w-full">
                      <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                        <div className="text-left">
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Piloto Asignado</p>
                          {hasDriver ? (
                            <div>
                              <p className="text-xs font-bold text-white leading-tight">{t.conductor.split(' (')[0]}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 leading-none">{t.conductorPhone}</p>
                              <span className={`text-[9px] font-black uppercase inline-block mt-1 ${t.conductorAceptado === 'Ruta aceptada por conductor' ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
                                ● {t.conductorAceptado || 'PENDIENTE'}
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic">Sin conductor asignado</p>
                          )}
                        </div>
                        {canEditRoute && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            className="py-1 px-2 text-[10px] border border-slate-700 bg-slate-900"
                            onClick={() => {
                              setAssigningDriverToken(t.token);
                              if (hasDriver) {
                                const name = t.conductor.split(' (')[0];
                                const email = t.conductor.match(/\(([^)]+)\)/)?.[1] || '';
                                setDriverForm({ name, email, phone: t.conductorPhone });
                              } else {
                                setDriverForm({ name: '', email: '', phone: '+569' });
                              }
                            }}
                          >
                            {hasDriver ? 'Cambiar' : 'Asignar'}
                          </Button>
                        )}
                      </div>

                      {assigningDriverToken === t.token && (
                        <form onSubmit={(e) => handleSaveDriver(e, t)} className="p-3 bg-slate-900 border border-slate-700 rounded-lg space-y-2 text-left animate-fade-in w-full">
                          <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Configurar Conductor</h4>
                          <input required type="text" placeholder="Nombre completo" value={driverForm.name} onChange={e=>setDriverForm({...driverForm, name: e.target.value})} className="w-full bg-slate-950 border-slate-800 rounded p-1.5 text-xs text-white outline-none focus:border-blue-500"/>
                          <input required type="email" placeholder="Email (recibe confirmación)" value={driverForm.email} onChange={e=>setDriverForm({...driverForm, email: e.target.value})} className="w-full bg-slate-950 border-slate-800 rounded p-1.5 text-xs text-white outline-none focus:border-blue-500"/>
                          <input required type="tel" placeholder="WhatsApp (ej. +56912345678)" value={driverForm.phone} onChange={e=>setDriverForm({...driverForm, phone: e.target.value.replace(/[^0-9+]/g, '')})} className="w-full bg-slate-950 border-slate-800 rounded p-1.5 text-xs text-white outline-none focus:border-blue-500"/>
                          <div className="flex gap-2 pt-1">
                            <Button type="button" variant="secondary" className="flex-1 py-1 text-xs" onClick={()=>setAssigningDriverToken(null)}>Cancelar</Button>
                            <Button type="submit" variant="blue" className="flex-1 py-1 text-xs">Guardar</Button>
                          </div>
                        </form>
                      )}

                      <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg flex justify-between items-center gap-3">
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Token Piloto</p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-blue-400 font-bold tracking-widest text-xs md:text-sm truncate">{t.token}</span>
                            <button 
                              type="button" 
                              onClick={() => copyToClipboard(t.token)} 
                              className="text-slate-400 hover:text-white p-0.5"
                              title="Copiar Token"
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                        </div>
                        {hasDriver && canEditRoute && (
                          <div className="flex items-center gap-1.5">
                            <button 
                              type="button" 
                              onClick={() => handleSendNotification(t)}
                              disabled={sendingId === t.token}
                              className="p-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-blue-400 hover:text-blue-300 rounded-lg transition-colors flex items-center justify-center shrink-0"
                              title="Enviar Token por Correo"
                            >
                              {sendingId === t.token ? <Loader2 size={12} className="animate-spin"/> : <Mail size={12} />}
                            </button>
                            <a 
                              href={getWhatsAppLink(t)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-emerald-400 hover:text-emerald-300 rounded-lg transition-colors flex items-center justify-center shrink-0"
                              title="Enviar Token por WhatsApp"
                            >
                              <MessageCircle size={12} />
                            </a>
                          </div>
                        )}
                      </div>

                      {hasDriver && (
                        <button 
                          type="button" 
                          onClick={() => {
                            window.localStorage.setItem('esquemapps_selected_transport', JSON.stringify(t));
                            setCurrentView('TRANSPORT_DETAILS');
                          }} 
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors mt-2"
                        >
                          <Navigation size={12} className="rotate-45" /> Rastrear Conductor en Vivo
                        </button>
                      )}
                    </div>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const TransportDetailsView = ({ currentUser, setCurrentView, showToast }) => {
  const [transport, setTransport] = useState(() => {
    try {
      const saved = window.localStorage.getItem('esquemapps_selected_transport');
      return saved ? JSON.parse(saved) : null;
    } catch(e) { return null; }
  });
  const [loading, setLoading] = useState(false);

  const fetchUpdatedDetails = async () => {
    if (!transport) return;
    setLoading(true);
    try {
      const res = await apiFetch('getTransportes');
      if (res.status === 'success') {
        const updated = res.data.find(t => t.token === transport.token);
        if (updated) {
          setTransport(updated);
          window.localStorage.setItem('esquemapps_selected_transport', JSON.stringify(updated));
        }
      }
    } catch(e) {
      console.error("Error fetching updated transport details", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUpdatedDetails();
    const interval = setInterval(fetchUpdatedDetails, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!transport) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>No se ha seleccionado ninguna ruta para el seguimiento.</p>
        <Button variant="secondary" className="mx-auto mt-4" onClick={() => setCurrentView('TRANSPORT')}>
          Volver a Transportes
        </Button>
      </div>
    );
  }

  const breadcrumbs = transport.breadcrumbs || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 text-left animate-fade-in">
      <button onClick={() => setCurrentView('TRANSPORT')} className="flex items-center gap-1.5 text-xs md:text-sm text-slate-400 hover:text-white transition-colors mb-2">
        <ChevronLeft size={16}/> Volver a Transportes
      </button>

      <header className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <span className="font-mono text-xs text-blue-400 font-bold tracking-wider">{transport.token}</span>
          <h1 className="text-2xl font-black text-white flex items-center gap-2 mt-1">
            <Truck className="text-blue-500" size={24}/> Seguimiento de Ruta en Vivo
          </h1>
          <p className="text-sm text-slate-400">{transport.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
            transport.status === 'PENDING' || transport.status === 'PENDIENTE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
            transport.status === 'COMENZADO' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
            transport.status === 'EN VIAJE' || transport.status === 'EN RUTA' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse' :
            transport.status === 'LLEGADO' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
            transport.status === 'FINALIZADO' ? 'bg-slate-500/10 text-slate-400 border-slate-700' :
            'bg-slate-800 text-slate-400 border-slate-700'
          }`}>{transport.status || 'PENDIENTE'}</span>
          <Button variant="ghost" onClick={fetchUpdatedDetails} className="p-1 border border-slate-700 hover:text-blue-400" title="Actualizar">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-5 border-slate-800 bg-slate-900/50">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Información del Chofer</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black">Conductor</p>
                <p className="text-sm font-bold text-white mt-0.5">{transport.conductor ? transport.conductor.split(' (')[0] : 'Sin asignar'}</p>
                <p className="text-xs text-slate-400">{transport.conductor?.match(/\(([^)]+)\)/)?.[1] || ''}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black">Teléfono</p>
                <p className="text-xs text-white font-mono mt-0.5">{transport.conductorPhone || '—'}</p>
              </div>
              <div className="border-t border-slate-800 pt-3">
                <p className="text-[10px] text-slate-500 uppercase font-black">Última Ubicación GPS</p>
                <p className="text-xs font-mono text-white mt-0.5">
                  {transport.lastLocation ? transport.lastLocation : 'Sin datos de ubicación aún'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-slate-800 bg-slate-900/50">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Telemetry Breadcrumbs ({breadcrumbs.length})</h3>
            {breadcrumbs.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">Esperando coordenadas del conductor...</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {breadcrumbs.slice().reverse().map((b, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-slate-950 p-2 rounded-lg border border-slate-850">
                    <div className="text-left">
                      <p className="font-bold text-slate-300">Punto #{breadcrumbs.length - idx}</p>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">{b.time}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-emerald-400 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30 text-[10px]">
                        {b.speed} km/h
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-2.5 border-slate-800 bg-slate-900/30 overflow-hidden">
            <div className="w-full aspect-[4/3] md:aspect-video bg-slate-950 relative">
              <iframe
                title="Seguimiento de Ruta"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0, minHeight: '350px' }}
                src={
                  transport.lastLocation 
                    ? `https://maps.google.com/maps?q=${encodeURIComponent(transport.lastLocation)}&z=15&output=embed`
                    : `https://maps.google.com/maps?saddr=${encodeURIComponent(transport.origin)}&daddr=${[...(transport.paradas || []), transport.dest].map(stop => encodeURIComponent(stop)).join('+to:')}&output=embed`
                }
                allowFullScreen
                className="w-full h-full rounded-lg"
              ></iframe>
            </div>
            <div className="p-3 bg-slate-900/50 text-xs text-slate-400 border-t border-slate-850/80 leading-relaxed flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              <div>
                <p className="font-bold text-white flex items-center gap-1">
                  <MapPin size={12} className="text-amber-500 animate-pulse"/> 
                  {transport.lastLocation ? 'El mapa muestra la última ubicación reportada por el chofer.' : 'Mostrando ruta de planificación original.'}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">La ubicación del conductor se sincroniza automáticamente cada 30 segundos.</p>
              </div>
              <div className="flex gap-2">
                {transport.lastLocation && (
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(transport.lastLocation)}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg border border-slate-700 text-[10px] transition-colors"
                  >
                    Google Maps
                  </a>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default TransportView;
