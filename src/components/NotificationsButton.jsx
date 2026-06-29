import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { CACHE, compareProjectIds } from '../utils/api';
import { ROLES } from '../utils/constants';
import { PianoLoader } from './PianoLoader';

export const NotificationsButton = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadNotifications = () => {
    const list = [];
    if (!currentUser) return;
    const myProjects = (CACHE.proyectos || []).filter(p => 
      [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role) || 
      (p.asignados || []).includes(currentUser.email)
    );
    const myProjectIds = myProjects.map(p => String(p.id));

    // 1. Messages
    const chatMsgs = (CACHE.mensajes || []).filter(m => myProjectIds.some(pid => compareProjectIds(pid, m.proyectoId)));
    chatMsgs.forEach(m => {
      const projName = myProjects.find(p => compareProjectIds(p.id, m.proyectoId))?.name || "Proyecto";
      list.push({
        id: 'msg-' + m.id,
        type: 'chat',
        title: `Mensaje de ${m.sender}`,
        description: m.text,
        time: m.time,
        timestamp: Number(m.id) || 0,
        projectName: projName
      });
    });

    // 2. Transports
    const trans = (CACHE.transportes || []).filter(t => myProjectIds.some(pid => compareProjectIds(pid, t.proyectoId)));
    trans.forEach(t => {
      const projName = myProjects.find(p => compareProjectIds(p.id, t.proyectoId))?.name || "Proyecto";
      list.push({
        id: 'trans-' + t.id,
        type: 'transport',
        title: `Nueva Ruta: ${t.title}`,
        description: `${t.origin} ➡️ ${t.dest} (${t.date} ${t.time})`,
        time: `${t.date} ${t.time}`,
        timestamp: Number(t.id) || 0,
        projectName: projName
      });
    });

    // 3. Hitos
    const hitos = (CACHE.hitos || []).filter(h => myProjectIds.some(pid => compareProjectIds(pid, h.proyectoId)));
    hitos.forEach(h => {
      const projName = myProjects.find(p => compareProjectIds(p.id, h.proyectoId))?.name || "Proyecto";
      list.push({
        id: 'hito-' + h.id,
        type: 'hito',
        title: `Nuevo Hito: ${h.title}`,
        description: `${h.location} (${h.date} ${h.time})`,
        time: `${h.date} ${h.time}`,
        timestamp: Number(h.id) || 0,
        projectName: projName
      });
    });

    list.sort((a, b) => b.timestamp - a.timestamp);
    setNotifications(list.slice(0, 8));
  };

  const handleToggle = () => {
    if (!isOpen) {
      loadNotifications();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div ref={wrapperRef} className="relative inline-block text-left print:hidden">
      <button 
        type="button" 
        onClick={handleToggle}
        className="p-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-amber-500 hover:text-amber-400 rounded-lg transition-colors flex items-center justify-center shrink-0 relative"
        title="Notificaciones de Proyectos"
      >
        <Bell size={14} />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[9999] overflow-hidden animate-slide-up">
          <div className="p-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <span className="font-bold text-xs text-white uppercase tracking-wider font-sans">Actividad Reciente</span>
            <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-black font-sans">Novedades</span>
          </div>
          <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-slate-800/80 text-left">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">No hay novedades recientes en tus proyectos asignados.</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-3 hover:bg-slate-800/50 transition-colors">
                  <div className="flex justify-between items-start gap-2 mb-0.5 font-sans">
                    <span className="text-[9px] font-black text-amber-500 truncate max-w-[140px] uppercase">{n.projectName}</span>
                    <span className="text-[8px] text-slate-500 font-mono shrink-0">{n.time}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug font-sans">{n.title}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-relaxed font-sans">{n.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export const openWhatsApp = (phone) => window.open(`https://wa.me/${phone.replace('+', '')}`, '_blank');
export const openEmail = (email) => window.open(`mailto:${email}`, '_blank');
export const handlePrint = () => window.print();
