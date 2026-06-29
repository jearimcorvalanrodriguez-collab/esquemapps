import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, RefreshCw, Users, ChevronLeft, Trash2, 
  CheckCheck, Send 
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { NotificationsButton } from '../components/NotificationsButton';
import { PianoLoader } from '../components/PianoLoader';
import { CACHE, apiFetch, clearCache } from '../utils/api';
import { ROLES } from '../utils/constants';

export const ChatView = ({ currentUser, showToast, requestConfirm }) => {
  const [messages, setMessages] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  
  const canSendMessages = currentUser.role === ROLES.ADMIN || 
    (currentUser.permisos || []).includes('CHAT_SEND') || 
    (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TEC_JEFE, ROLES.JEFE_CAT_APV, ROLES.APV].includes(currentUser.role));
  const canViewAllProjects = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchData = async (force = false, isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      // Cargar Proyectos
      let projData = CACHE.proyectos;
      if (force || !projData) {
        const resP = await apiFetch('getProyectos');
        if (resP.status === 'success') { 
          projData = resP.data.map(p => ({ ...p, asignados: Array.isArray(p.asignados) ? p.asignados : [] })); 
          CACHE.proyectos = projData; 
        }
      }
      if (projData) {
        const activeProjs = projData.filter(p => p.status === 'ACTIVO');
        setProyectos(canViewAllProjects ? activeProjs : activeProjs.filter(p => p.asignados.includes(currentUser.email)));
      }

      // Cargar Mensajes
      let msgData = CACHE.mensajes;
      if (force || !msgData) {
        const resM = await apiFetch('getMensajes');
        if (resM.status === 'success') {
          msgData = resM.data;
          CACHE.mensajes = msgData;
        }
      }
      if (msgData) {
        const isNew = CACHE.mensajes && CACHE.mensajes.length < msgData.length;
        setMessages(msgData);
        if (selectedProyecto && (!isBackground || isNew)) setTimeout(scrollToBottom, 100);
      }
    } catch (e) {
      if (!isBackground) showToast("Error al cargar datos del chat.");
    }
    if (!isBackground) setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true, true), 10000);
    return () => clearInterval(interval);
  }, [selectedProyecto]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !canSendMessages || !selectedProyecto) return;
    
    const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const tempId = Date.now();
    const newMsgObj = { id: tempId, proyectoId: selectedProyecto.id, sender: currentUser.name, role: currentUser.role, text: newMsg, time: timeStr, readBy: [] };
    
    setMessages([...messages, newMsgObj]); 
    setNewMsg('');
    setTimeout(scrollToBottom, 100);

    try {
      await apiFetch('sendMensaje', { proyectoId: selectedProyecto.id, sender: currentUser.name, role: currentUser.role, text: newMsgObj.text, time: timeStr });
      clearCache('mensajes');
      fetchData(true, true);
    } catch (e) {
      showToast("No se pudo enviar el mensaje.");
    }
  };

  const handleDeleteClick = (msgId) => {
    requestConfirm("¿Deseas ocultar este mensaje de la vista del chat? (Permanecerá registrado en la base de datos de producción)", async () => {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'OCULTO' } : m));
      try {
        await apiFetch('ocultarMensaje', { id: msgId });
        clearCache('mensajes');
      } catch (e) {
        showToast("Error al ocultar el mensaje.");
      }
    });
  };

  const toggleReadReceipt = async (msgId) => {
    setMessages(messages.map(m => {
      if (m.id === msgId) {
        const hasRead = m.readBy.includes(currentUser.name);
        return { ...m, readBy: hasRead ? m.readBy : [...m.readBy, currentUser.name] };
      }
      return m;
    }));
    try {
      await apiFetch('marcarLeido', { id: msgId, userName: currentUser.name });
      clearCache('mensajes');
    } catch (e) {
      showToast("Error al marcar como leído.");
    }
  };

  // VISTA 1: LISTADO DE PROYECTOS (CANALES)
  if (!selectedProyecto) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 pb-24 animate-fade-in">
        <header className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2"><MessageSquare className="text-emerald-500" size={24}/> Anuncios de Gira</h1>
            <p className="text-sm text-slate-400">Selecciona un proyecto para ver los comunicados.</p>
          </div>
          <Button variant="ghost" icon={RefreshCw} onClick={() => fetchData(true)} className="px-2 border border-slate-700 hover:text-emerald-400" title="Actualizar" />
        </header>

        {loading ? <div className="flex justify-center p-8"><PianoLoader size={40} /></div> : proyectos.length === 0 ? (
          <div className="text-center p-12 border border-slate-800 border-dashed rounded-xl bg-slate-900/50">
             <MessageSquare className="mx-auto text-slate-600 mb-4" size={48} />
             <p className="text-slate-400 text-sm max-w-md mx-auto">No tienes proyectos asignados para visualizar anuncios.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proyectos.map(p => {
              const unreadCount = messages.filter(m => String(m.proyectoId) === String(p.id) && !m.readBy.includes(currentUser.name)).length;
              return (
                <Card key={p.id} onClick={() => { setSelectedProyecto(p); setTimeout(scrollToBottom, 100); }} className="p-4 flex flex-col justify-between cursor-pointer hover:border-emerald-500 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors"><MessageSquare className="text-emerald-500" size={24} /></div>
                      <div>
                        <h3 className="font-bold text-white text-lg leading-tight line-clamp-1">{p.name}</h3>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">{p.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold flex items-center gap-1.5"><Users size={14}/> {p.asignados.length} miembros</span>
                    {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">{unreadCount} Nuevos</span>}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    );
  }

  // VISTA 2: CHAT DEL PROYECTO
  const projectMsgs = messages.filter(m => {
    if (m.status === 'OCULTO') return false;
    if (m.proyectoId === undefined || m.proyectoId === null || m.proyectoId === '') {
      return true;
    }
    return String(m.proyectoId) === String(selectedProyecto.id);
  });

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-4rem)] max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg animate-fade-in">
      <header className="p-3 md:p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedProyecto(null)} className="text-slate-400 hover:text-white transition-colors p-1"><ChevronLeft size={20}/></button>
          <div>
            <h2 className="font-black text-white text-base md:text-lg leading-tight">{selectedProyecto.name}</h2>
            <p className="text-[10px] md:text-xs text-emerald-400 font-bold uppercase tracking-wider">Canal Oficial</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <NotificationsButton currentUser={currentUser} />
          <Button variant="ghost" className="text-slate-400 hover:text-emerald-400 p-1.5 md:p-2 border border-slate-700 rounded" onClick={() => fetchData(true)} title="Actualizar Chat"><RefreshCw size={14} className={loading ? "animate-spin text-emerald-500" : ""}/></Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 custom-scrollbar">
        {projectMsgs.length === 0 && !loading && <div className="text-center text-slate-500 mt-8 text-xs md:text-sm">No hay comunicados en esta gira.</div>}
        
        {projectMsgs.map(msg => {
          const isMe = msg.sender === currentUser.name;
          const hasRead = msg.readBy.includes(currentUser.name);
          const isAdmin = currentUser.role === ROLES.ADMIN;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-slide-up group relative`}>
              <div className={`flex flex-col mb-1 ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-1.5 font-sans">
                  <span className="text-[10px] md:text-xs font-bold text-slate-300">{msg.sender}</span>
                  <span className="text-[9px] text-slate-500">{msg.time}</span>
                </div>
                <span className="text-[9px] text-emerald-500 uppercase font-black leading-none mt-0.5">{msg.role}</span>
              </div>
              
              <div className="flex items-center gap-2 max-w-[85%] w-fit">
                {isMe && isAdmin && (
                  <button type="button" onClick={() => handleDeleteClick(msg.id)} className="text-slate-500 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" title="Ocultar comunicado (Solo Admin)">
                    <Trash2 size={12} />
                  </button>
                )}
                
                <div className={`p-2.5 md:p-3 rounded-xl text-xs md:text-sm shadow-sm ${isMe ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'}`}>{msg.text}</div>
                
                {!isMe && isAdmin && (
                  <button type="button" onClick={() => handleDeleteClick(msg.id)} className="text-slate-500 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" title="Ocultar comunicado (Solo Admin)">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              {!isMe && ( <button onClick={() => toggleReadReceipt(msg.id)} disabled={hasRead} className={`mt-1 flex items-center gap-1 text-[9px] md:text-[10px] font-bold px-1.5 py-1 rounded transition-colors ${hasRead ? 'bg-blue-500/20 text-blue-400 cursor-default' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}><CheckCheck size={10} /> {hasRead ? 'Leído' : 'Marcar Leído'}</button> )}
              {isMe && msg.readBy.length > 0 && ( <span className="text-[9px] md:text-[10px] text-blue-400 mt-1 font-bold flex items-center gap-1"><CheckCheck size={10} /> Visto por {msg.readBy.length} {msg.readBy.length === 1 ? 'persona' : 'personas'}</span> )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {canSendMessages ? (
        <form onSubmit={handleSend} className="p-2 md:p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
          <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Escribe un anuncio..." className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 md:py-2 text-xs md:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"/>
          <Button type="submit" variant="primary" icon={Send} className="px-3 md:px-4 py-1.5 md:py-2 shadow-emerald-900/30"></Button>
        </form>
      ) : (
        <div className="p-2 md:p-3 bg-slate-800 border-t border-slate-700 text-center text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Solo Producción puede enviar mensajes. Utiliza "Marcar Leído".</div>
      )}
    </div>
  );
};
export default ChatView;
