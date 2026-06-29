import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, RefreshCw, Send, CheckCheck } from 'lucide-react';
import { Button } from './Button';
import { CACHE, compareProjectIds, apiFetch, clearCache } from '../utils/api';
import { ROLES } from '../utils/constants';

export const ProjectChatSidebar = ({ currentUser, selectedProject, showToast }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const canSendMessages = currentUser.role === ROLES.ADMIN || 
    (currentUser.permisos || []).includes('CHAT_SEND') || 
    (!(currentUser.permisos) && [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TEC_JEFE, ROLES.JEFE_CAT_APV, ROLES.APV].includes(currentUser.role));

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };

  const fetchMessages = async (force = false, isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      let msgData = CACHE.mensajes;
      if (force || !msgData) {
        const res = await apiFetch('getMensajes');
        if (res.status === 'success') { msgData = res.data; CACHE.mensajes = res.data; }
      }
      if (msgData) {
        const isNew = CACHE.mensajes && CACHE.mensajes.length < msgData.length;
        const projMsgs = msgData.filter(m => compareProjectIds(m.proyectoId, selectedProject.id));
        setMessages(projMsgs);
        if (!isBackground || isNew) setTimeout(scrollToBottom, 100);
      }
    } catch (e) { if (!isBackground) showToast("Error al conectar con chat."); }
    if (!isBackground) setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => fetchMessages(true, true), 10000);
    return () => clearInterval(interval);
  }, [selectedProject]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !canSendMessages) return;
    
    const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const tempId = Date.now();
    const newMsgObj = { id: tempId, proyectoId: selectedProject.id, sender: currentUser.name, role: currentUser.role, text: newMsg, time: timeStr, readBy: [] };
    
    setMessages([...messages, newMsgObj]); 
    setNewMsg('');
    setTimeout(scrollToBottom, 100);

    try {
      await apiFetch('sendMensaje', { proyectoId: selectedProject.id, sender: currentUser.name, role: currentUser.role, text: newMsgObj.text, time: timeStr });
      clearCache('mensajes');
      fetchMessages(true, true);
    } catch (e) { showToast("No se pudo enviar el mensaje."); }
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
    } catch (e) { showToast("Error al marcar como leído."); }
  };

  return (
    <div className="flex flex-col h-[500px] lg:h-[calc(100vh-8rem)] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg print:hidden">
      <header className="p-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-amber-500" size={18} />
          <div>
            <h2 className="font-black text-white text-sm leading-tight">Anuncios</h2>
            <p className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">Canal Oficial</p>
          </div>
        </div>
        <Button variant="ghost" className="text-slate-400 hover:text-emerald-400 p-1 border border-slate-700 rounded" onClick={() => fetchMessages(true)} title="Actualizar Chat"><RefreshCw size={12} className={loading ? "animate-spin text-emerald-500" : ""}/></Button>
      </header>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {messages.length === 0 && !loading && <div className="text-center text-slate-500 mt-8 text-xs">No hay comunicados en esta gira.</div>}
        
        {messages.map(msg => {
          const isMe = msg.sender === currentUser.name;
          const hasRead = msg.readBy.includes(currentUser.name);
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-slide-up`}>
              <div className={`flex flex-col mb-1 ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] font-bold text-slate-300">{msg.sender}</span>
                  <span className="text-[9px] text-slate-500">{msg.time}</span>
                </div>
                <span className="text-[8px] text-amber-500 uppercase font-black leading-none mt-0.5">{msg.role}</span>
              </div>
              <div className={`p-2 rounded-xl max-w-[85%] text-xs shadow-sm ${isMe ? 'bg-amber-600 text-white rounded-tr-none' : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'}`}>{msg.text}</div>
              {!isMe && ( <button onClick={() => toggleReadReceipt(msg.id)} disabled={hasRead} className={`mt-1 flex items-center gap-1 text-[9px] font-bold px-1.5 py-1 rounded transition-colors ${hasRead ? 'bg-blue-500/20 text-blue-400 cursor-default' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}><CheckCheck size={10} /> {hasRead ? 'Leído' : 'Marcar Leído'}</button> )}
              {isMe && msg.readBy.length > 0 && ( <span className="text-[8px] text-blue-400 mt-1 font-bold flex items-center gap-1"><CheckCheck size={10} /> Visto por {msg.readBy.length}</span> )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {canSendMessages ? (
        <form onSubmit={handleSend} className="p-2 bg-slate-800 border-t border-slate-700 flex gap-2">
          <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Escribe un anuncio..." className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"/>
          <Button type="submit" variant="primary" icon={Send} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 border-amber-500 shadow-amber-900/30"></Button>
        </form>
      ) : (
        <div className="p-2 bg-slate-800 border-t border-slate-700 text-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">Solo Producción envía anuncios. Usa "Marcar Leído".</div>
      )}
    </div>
  );
};
