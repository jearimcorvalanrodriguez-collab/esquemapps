import React, { useState, useEffect } from 'react';
import { Trash2, MapPin, Users, Edit3 } from 'lucide-react';
import { Button } from './Button';
import { CACHE, compareProjectIds, apiFetch, clearCache, formatCleanLocation } from '../utils/api';

const getEventStatus = (targetDate, currentTime) => {
  if (targetDate.getTime() === 0) return { border: 'border-slate-700', bg: 'bg-slate-800/50', dot: 'bg-slate-500', text: 'Fecha inválida', timeText: '--:--', pulse: false, textClass: 'text-slate-500' };
  const diffMs = targetDate - currentTime;
  if (diffMs <= 0) return { border: 'border-slate-700', bg: 'bg-slate-800/50', dot: 'bg-slate-500', text: 'Finalizado', timeText: '00h 00m', pulse: false, textClass: 'text-slate-500' };
  const diffSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const timeText = `Faltan ${hh}h ${mm}m`;

  if (hours < 2) return { border: 'border-red-500/50', bg: 'bg-red-500/10', dot: 'bg-red-500', text: '¡INMINENTE!', timeText, pulse: true, textClass: 'text-red-500' };
  else if (hours < 24) return { border: 'border-amber-500/50', bg: 'bg-amber-500/10', dot: 'bg-amber-500', text: 'En preparación', timeText, pulse: false, textClass: 'text-amber-500' };
  else return { border: 'border-emerald-500/50', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500', text: 'Agendado', timeText, pulse: false, textClass: 'text-emerald-500' };
};


export const EventCard = ({ event, canManage, handleDeleteHito, handleEditHito, setAssigningHito, currentUser, requestConfirm, showToast, onRefresh }) => {
  const [now, setNow] = useState(new Date());
  
  const projectObj = (CACHE.proyectos || []).find(p => compareProjectIds(p.id, event.proyectoId));
  const riderObj = (CACHE.riders || []).find(r => String(r.id) === String(event.riderId));
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const status = getEventStatus(event.fullDate, now);
  const isAssignedToMe = event.asignados.includes(currentUser.email);

  const handleToggleSelfAssign = async (e) => {
    e.stopPropagation();
    const newAsignados = isAssignedToMe 
      ? event.asignados.filter(email => email !== currentUser.email) 
      : [...event.asignados, currentUser.email];
    try {
      await apiFetch('updateHitoAsignaciones', { id: event.id, asignados: newAsignados });
      if (showToast) {
        showToast(isAssignedToMe ? "Te has desvinculado del hito." : "Te has vinculado al hito.");
      }
      clearCache('hitos');
      if (onRefresh) onRefresh();
    } catch (err) {
      if (showToast) showToast("Error al actualizar vinculación.");
    }
  };

  let formattedDate = 'Fecha Inválida';
  let dRaw = String(event.date);
  if (dRaw.includes('T')) dRaw = dRaw.split('T')[0];
  const matchISO = dRaw.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (matchISO) {
    formattedDate = `${matchISO[3]}/${matchISO[2]}/${matchISO[1]}`;
  } else {
    const matchLoc = dRaw.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
    if(matchLoc) formattedDate = `${matchLoc[1]}/${matchLoc[2]}/${matchLoc[3]}`;
  }  const timeMatch = String(event.time).match(/\d{2}:\d{2}/);
  const formattedTime = timeMatch ? `${timeMatch[0]} h` : '--:-- h';

  return (
    <div className="relative pl-6 md:pl-8 group">
      {/* Timeline dot (small circle centered on the line) */}
      <div className={`absolute left-[3px] md:left-[7px] top-[17px] md:top-[20px] w-1.5 h-1.5 rounded-full ring-2 ring-slate-950 ${status.dot} ${status.pulse ? 'animate-pulse' : ''} z-10 print:ring-white`}></div>
      
      <div className={`p-2.5 md:p-3 pr-20 sm:pr-24 rounded-lg border transition-all duration-500 bg-slate-900/50 hover:bg-slate-800 print:bg-transparent ${status.border} flex items-center print:border-black relative`}>
        
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4 w-full">
          <div className="shrink-0 text-left min-w-[70px]">
             <span className={`block font-black text-sm md:text-base leading-none print:text-black ${status.textClass}`}>{formattedTime}</span>
             <span className="text-[9px] text-slate-500 font-bold print:text-slate-700">{formattedDate}</span>
          </div>
          
          <div className="flex-1 border-l-0 sm:border-l border-slate-700/50 print:border-black/30 sm:pl-3 flex flex-col justify-center text-left min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs md:text-sm font-bold text-white print:text-black leading-snug">{event.title}</h3>
              {canManage && (
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity print:hidden shrink-0">
                  <button onClick={() => handleEditHito(event)} className="text-slate-500 hover:text-blue-400 transition-colors p-0.5" title="Editar Hito"><Edit3 size={11}/></button>
                  <button onClick={() => requestConfirm("¿Eliminar Hito permanentemente?", () => handleDeleteHito(event.id))} className="text-slate-500 hover:text-red-500 transition-colors p-0.5" title="Eliminar Hito"><Trash2 size={11}/></button>
                </div>
              )}
            </div>
            
            {/* Location placed underneath the title */}
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[9px] md:text-[10px] text-slate-400 hover:text-blue-400 print:text-slate-700 flex items-center gap-1 font-medium mt-1 truncate max-w-full"
            >
              <MapPin size={10} className="text-blue-500 shrink-0"/> 
              <span className="truncate text-left leading-normal">{formatCleanLocation(event.location)}</span>
            </a>
            
            {riderObj && (
              <div className="flex flex-wrap gap-1 mt-1 w-full">
                <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                  Rider: {riderObj.title}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Absolute Top-Right Badges (Smaller and compact) */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 print:hidden z-20">
           {canManage && (
             <button 
               onClick={() => setAssigningHito(event)}
               className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 py-0.5 px-1 text-[8px] rounded font-bold flex items-center gap-1 h-[14px] transition-colors shrink-0"
               title="Asignar Crew"
             >
               <Users size={8}/> {event.asignados.length}
             </button>
           )}
         </div>

      </div>
    </div>
  );
};
