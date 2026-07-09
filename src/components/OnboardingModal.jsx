import React, { useState } from 'react';
import { 
  Sparkles, Navigation, Clock, DollarSign, FileText, 
  Users, ChevronRight, ChevronLeft, X, Check
} from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

export const OnboardingModal = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Sparkles className="text-emerald-400" size={32} />,
      title: "¡Te damos la bienvenida a Esquemas Pro!",
      description: "La plataforma definitiva para la logística y administración técnica de giras, conciertos y eventos de alta producción. Prepárate para organizar todo tu flujo en un solo lugar.",
      bulletPoints: [
        "Gestión unificada de personal y accesos.",
        "Monitoreo financiero e itinerarios minuto a minuto.",
        "Sincronización en tiempo real con el staff de producción."
      ]
    },
    {
      icon: <Navigation className="text-emerald-400" size={32} />,
      title: "Gestión de Proyectos Activos",
      description: "Crea y administra tus eventos, giras de conciertos o jornadas de ensayo. Cada proyecto funciona como una bitácora central que unifica el trabajo del staff.",
      bulletPoints: [
        "Configura fechas, recintos y líderes de proyecto.",
        "Icono de basurero para eliminar proyectos conservando cronogramas y riders de manera independiente.",
        "Acceso directo rápido a los detalles operativos."
      ]
    },
    {
      icon: <Clock className="text-emerald-400" size={32} />,
      title: "Cronogramas (Timings)",
      description: "Controla cada hito en el itinerario de producción minuto a minuto. Mantén a todo el staff alineado sobre horarios de viaje, pruebas de sonido, showtime y desmontaje.",
      bulletPoints: [
        "Define múltiples timings y asócialos a tus proyectos.",
        "Visualización en lista y descarga/impresión en PDF.",
        "Fácil actualización y sincronización instantánea."
      ]
    },
    {
      icon: <DollarSign className="text-emerald-450" size={32} />,
      title: "Finanzas y Control de Gastos",
      description: "Mantén un control riguroso de la caja chica de producción, consumos y boletas de gasto. Revisa saldos disponibles y aprueba presupuestos asignados.",
      bulletPoints: [
        "Registro inmediato de boletas o facturas con detalles de emisor.",
        "Monitoreo de saldo de producción en tiempo real.",
        "Gestión simplificada para Tour Managers y Administradores."
      ]
    },
    {
      icon: <FileText className="text-emerald-400" size={32} />,
      title: "Fichas Técnicas (Riders)",
      description: "Administra las especificaciones técnicas de tus espectáculos. Configura las necesidades de audio, iluminación, catering y dibuja la distribución en escenario.",
      bulletPoints: [
        "Diseñador interactivo de escenario (Stageplot Builder).",
        "Control detallado de micrófonos, cajas D.I. y canales de entrada.",
        "Generación y descarga de riders técnicos en formato PDF."
      ]
    },
    {
      icon: <Users className="text-emerald-400" size={32} />,
      title: "Directorio Staff y Privilegios",
      description: "Administra los accesos de tu equipo. Divide los privilegios en 3 roles principales: Tour Manager, Técnicos y Artistas, personalizando sus permisos individuales.",
      bulletPoints: [
        "Tour Manager posee control global de la administración.",
        "Técnicos acceden según permisos detallados (Ver/Gestionar).",
        "Artistas visualizan de forma simplificada sus timings y riders."
      ]
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    window.localStorage.setItem('esquemapps_onboarded', 'true');
    if (onClose) onClose();
  };

  const stepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fade-in text-slate-100 print:hidden">
      <Card className="w-full max-w-lg bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800/80 shadow-2xl rounded-2xl flex flex-col relative overflow-hidden text-left p-6 md:p-8">
        
        {/* Floating background glows */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header: Skip button */}
        <div className="flex justify-between items-center mb-6 z-10">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Paseo Guiado
            </span>
          </div>
          <button 
            type="button"
            onClick={handleComplete} 
            className="text-slate-500 hover:text-white transition-colors p-1"
            title="Omitir paseo guiado"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Content */}
        <div className="flex-1 space-y-4 md:space-y-6 z-10 select-none animate-fade-in min-h-[280px] flex flex-col justify-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800/60 shrink-0 shadow-lg">
              {stepData.icon}
            </div>
            <h2 className="text-lg md:text-xl font-black text-white leading-tight">
              {stepData.title}
            </h2>
          </div>

          <p className="text-xs md:text-sm text-slate-350 leading-relaxed font-light">
            {stepData.description}
          </p>

          <ul className="space-y-2 pt-2">
            {stepData.bulletPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2.5 text-xs text-slate-400">
                <Check className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-col items-center gap-4 mt-6 pt-4 border-t border-slate-850 z-10 w-full">
          {/* Progress Indicators (Cuadrados con letra y punto indicador) */}
          <div className="flex gap-2 justify-center items-start">
            {steps.map((_, idx) => {
              const letter = ['I', 'P', 'C', 'G', 'R', 'D'][idx];
              return (
                <div key={idx} className="flex flex-col items-center gap-1 shrink-0">
                  <div className={`w-5 h-5 flex items-center justify-center border rounded-md text-[8px] font-black select-none transition-all duration-200 ${
                    idx === currentStep 
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-black' 
                      : 'border-slate-800 bg-slate-950/40 text-slate-500'
                  }`}>
                    {letter}
                  </div>
                  <div className="h-1 flex items-center justify-center">
                    {idx === currentStep && (
                      <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nav Buttons (Centrados y más pequeños) */}
          <div className="flex justify-center gap-2">
            {currentStep > 0 && (
              <Button 
                variant="ghost" 
                onClick={handleBack} 
                className="py-1 px-3 text-[10px] border border-slate-800 hover:bg-slate-900 text-slate-300 font-bold"
                icon={ChevronLeft}
              >
                Atrás
              </Button>
            )}

            <Button 
              variant="primary" 
              onClick={handleNext} 
              className="py-1 px-4 text-[10px] font-bold bg-emerald-600 border-emerald-500 hover:bg-emerald-500"
              icon={currentStep === steps.length - 1 ? Check : ChevronRight}
              iconPosition="right"
            >
              {currentStep === steps.length - 1 ? 'Entendido' : 'Siguiente'}
            </Button>
          </div>

          {/* Omitir text below buttons */}
          <button 
            type="button"
            onClick={handleComplete} 
            className="text-[9px] text-slate-500 hover:text-slate-300 transition-colors font-medium underline uppercase tracking-wider mt-1"
          >
            Omitir Paseo Guiado
          </button>
        </div>

      </Card>
    </div>
  );
};
