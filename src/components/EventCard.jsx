import React, { useState, useEffect } from 'react';
import { Trash2, MapPin, Users, Hourglass } from 'lucide-react';
import { Button } from './Button';

const getEventStatus = (targetDate, currentTime) => {
  if (targetDate.getTime() === 0) return { border: 'border-slate-700', bg: 'bg-slate-800/50', dot: 'bg-slate-500', text: 'Fecha inválida', timeText: '--:--', pulse: false, textClass: 'text-slate-500' };
  const diffMs = targetDate - currentTime;
  if (diffMs <= 0) return { border: 'border-slate-700', bg: 'bg-slate-800/50', dot: 'bg-slate-500', text: 'Finalizado', timeText: '00h 00m 00s', pulse: false, textClass: 'text-slate-500' };
  const diffSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const timeText = `Faltan ${hh}h ${mm}m ${ss}s`;

  if (hours < 2) return { border: 'border-red-500/50', bg: 'bg-red-500/10', dot: 'bg-red-500', text: '¡INMINENTE!', timeText, pulse: true, textClass: 'text-red-500' };
  else if (hours < 24) return { border: 'border-amber-500/50', bg: 'bg-amber-500/10', dot: 'bg-amber-500', text: 'En preparación', timeText, pulse: false, textClass: 'text-amber-500' };
  else return { border: 'border-emerald-500/50', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500', text: 'Agendado', timeText, pulse: false, textClass: 'text-emerald-500' };
};

export const EventCard = ({ event, canManage, handleDeleteHito, setAssigningHito, currentUser, requestConfirm }) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const status = getEventStatus(event.fullDate, now);
  const isAssignedToMe = event.asignados.includes(currentUser.email);

  let formattedDate = 'Fecha Inválida';
  let dRaw = String(event.date);
  if (dRaw.includes('T')) dRaw = dRaw.split('T')[0];
  const matchISO = dRaw.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (matchISO) {
    formattedDate = `${matchISO[3]}/${matchISO[2]}/${matchISO[1]}`;
  } else {
    const matchLoc = dRaw.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
    if(matchLoc) formattedDate = `${matchLoc[1]}/${matchLoc[2]}/${matchLoc[3]}`;
  }
  
  const timeMatch = String(event.time).match(/\d{2}:\d{2}/);
  const formattedTime = timeMatch ? `${timeMatch[0]} h` : '--:-- h';

  return (
    <div className="relative pl-6 md:pl-8 group">
      {/* Timeline dot */}
      <div className={`absolute left-[1px] md:left-[5px] top-4 w-3 h-3 rounded-full ring-4 ring-slate-950 ${status.dot} ${status.pulse ? 'animate-pulse' : ''} z-10 print:ring-white`}></div>
      
      <div className={`p-2.5 md:p-3 rounded-lg border transition-all duration-500 bg-slate-900/50 hover:bg-slate-800 print:bg-transparent ${status.border} flex flex-col sm:flex-row justify-between sm:items-center gap-2 print:border-black`}>
        
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4">
          <div className="shrink-0 text-left min-w-[70px]">
             <span className={`block font-black text-sm md:text-base leading-none print:text-black ${status.textClass}`}>{formattedTime}</span>
             <span className="text-[9px] text-slate-500 font-bold print:text-slate-700">{formattedDate}</span>
          </div>
          
          <div className="flex-1 border-l-0 sm:border-l border-slate-700/50 print:border-black/30 sm:pl-3">
            <div className="flex items-start justify-between">
               <h3 className="text-sm font-bold text-white print:text-black">{event.title}</h3>
               {canManage && (
                 <button onClick={() => requestConfirm("¿Eliminar Hito permanentemente?", () => handleDeleteHito(event.id))} className="text-slate-500 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity print:hidden"><Trash2 size={14}/></button>
               )}
            </div>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 print:text-blue-700 flex items-center gap-1 w-fit mt-0.5">
              <MapPin size={10}/> {event.location}
            </a>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 border-t sm:border-t-0 border-slate-700/50 print:border-transparent pt-2 sm:pt-0 print:hidden">
           {isAssignedToMe && <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase border border-blue-500/50">Tú</span>}
           {canManage && (
             <Button variant="ghost" className="bg-slate-900 border border-slate-700 py-0.5 px-1.5 text-[9px]" icon={Users} onClick={() => setAssigningHito(event)}>
               {event.asignados.length}
             </Button>
           )}
           <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border bg-slate-950 ${status.border} ${status.textClass} font-mono font-bold text-[9px]`}>
             <Hourglass size={10} className={status.pulse ? 'animate-spin-slow' : ''} />{status.timeText}
           </div>
        </div>

      </div>
    </div>
  );
};
