import React, { useState, useEffect } from 'react';
import { 
  Wallet, RefreshCw, AlertCircle, Plus, Loader2, DollarSign,
  FileText, Trash2, Image as ImageIcon, X, Link as LinkIcon, Unlink, CheckCircle2
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PianoLoader } from '../components/PianoLoader';
import { CACHE, apiFetch, clearCache, compareProjectIds, setCache } from '../utils/api';
import { ROLES } from '../utils/constants';

export const ExpensesView = ({ 
  currentUser, 
  showToast, 
  requestConfirm, 
  selectedProject, 
  setSelectedProject, 
  hideHeader = false 
}) => {
  const [proyectos, setProyectos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState('');
  const [viewingReceipt, setViewingReceipt] = useState(null);

  // States for independent budget controls
  const [activeBudget, setActiveBudget] = useState(null);
  const [isCreatingBudget, setIsCreatingBudget] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetLimit, setNewBudgetLimit] = useState('');
  const [linkingBudget, setLinkingBudget] = useState(null);
  const [showLinkExistingModal, setShowLinkExistingModal] = useState(false);

  const canManageBudget = [ROLES.ADMIN, ROLES.MANAGER].includes(currentUser.role) || (currentUser.permisos || []).includes('EXPENSES_MANAGE');
  
  const [newExpense, setNewExpense] = useState({
    concepto: '',
    monto: '',
    categoria: 'Logística/Transporte',
    fecha: new Date().toISOString().split('T')[0],
    comprobante: ''
  });

  const fetchProyectos = async () => {
    try {
      const res = await apiFetch('getProyectos');
      if (res.status === 'success') {
        setProyectos(res.data);
        setCache('proyectos', res.data);
      }
    } catch(e) {
      showToast("Error al cargar proyectos.");
    }
  };

  const fetchGastos = async () => {
    try {
      const res = await apiFetch('getGastos');
      if (res.status === 'success') {
        setGastos(res.data);
      }
    } catch(e) {
      showToast("Error al cargar gastos.");
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchProyectos(), fetchGastos()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    if (window.localStorage.getItem('esquemapps_auto_create_expense') === 'true') {
      window.localStorage.removeItem('esquemapps_auto_create_expense');
      setIsCreatingBudget(true);
    }
  }, []);

  // Sync activeBudget when selectedProject or projects list changes
  useEffect(() => {
    if (selectedProject) {
      if (selectedProject.type === 'PRESUPUESTO') {
        setActiveBudget(selectedProject);
        setNewBudget(selectedProject.presupuesto || '');
      } else {
        const linked = proyectos.find(b => b.type === 'PRESUPUESTO' && b.manager === 'PROYECTO_ID:' + selectedProject.id);
        setActiveBudget(linked || null);
        if (linked) setNewBudget(linked.presupuesto || '');
      }
    } else {
      setActiveBudget(null);
    }
  }, [selectedProject, proyectos]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast("La imagen es muy grande. Elige una menor a 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        setNewExpense(prev => ({ ...prev, comprobante: compressedBase64 }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!activeBudget) {
      showToast("Por favor selecciona un presupuesto primero.");
      return;
    }
    if (!newExpense.concepto.trim() || !newExpense.monto) {
      showToast("Completa los campos obligatorios.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        proyectoId: activeBudget.id,
        concepto: newExpense.concepto.trim(),
        monto: Number(newExpense.monto),
        categoria: newExpense.categoria,
        fecha: newExpense.fecha,
        registradoPor: currentUser.email,
        comprobante: newExpense.comprobante
      };

      const res = await apiFetch('createGasto', payload);
      if (res.status === 'success') {
        showToast("Gasto registrado con éxito.");
        setNewExpense({
          concepto: '',
          monto: '',
          categoria: 'Logística/Transporte',
          fecha: new Date().toISOString().split('T')[0],
          comprobante: ''
        });
        const fileInput = document.getElementById('receipt-upload');
        if (fileInput) fileInput.value = '';
        
        await fetchGastos();
      } else {
        showToast("Error: " + res.message);
      }
    } catch(e) {
      showToast("Error al registrar gasto.");
    }
    setSubmitting(false);
  };

  const handleDeleteExpense = async (id) => {
    try {
      const res = await apiFetch('deleteGasto', { id });
      if (res.status === 'success') {
        showToast("Gasto eliminado.");
        await fetchGastos();
      } else {
        showToast("Error: " + res.message);
      }
    } catch(e) {
      showToast("Error al eliminar gasto.");
    }
  };

  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    if (!activeBudget) return;
    
    setSubmitting(true);
    try {
      const res = await apiFetch('updateProyectoPresupuesto', {
        id: activeBudget.id,
        presupuesto: Number(newBudget)
      });
      if (res.status === 'success') {
        showToast("Presupuesto actualizado.");
        setEditingBudget(false);
        setProyectos(prev => prev.map(p => p.id === activeBudget.id ? { ...p, presupuesto: Number(newBudget) } : p));
        setActiveBudget(prev => ({ ...prev, presupuesto: Number(newBudget) }));
        clearCache('proyectos');
      } else {
        showToast("Error: " + res.message);
      }
    } catch(e) {
      showToast("Error al actualizar presupuesto.");
    }
    setSubmitting(false);
  };

  // Create an independent budget
  const handleCreateBudget = async (e) => {
    e.preventDefault();
    if (!newBudgetName.trim() || !newBudgetLimit) {
      showToast("Completa todos los campos.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch('createProyecto', {
        name: newBudgetName.trim(),
        type: 'PRESUPUESTO',
        manager: '' // Independent initially
      });
      if (res.status === 'success') {
        const projectsRes = await apiFetch('getProyectos');
        if (projectsRes.status === 'success') {
          const matched = projectsRes.data.find(p => p.type === 'PRESUPUESTO' && p.name === newBudgetName.trim());
          if (matched) {
            await apiFetch('updateProyectoPresupuesto', {
              id: matched.id,
              presupuesto: Number(newBudgetLimit)
            });
          }
        }
        showToast("Control de gastos creado con éxito.");
        setIsCreatingBudget(false);
        setNewBudgetName('');
        setNewBudgetLimit('');
        clearCache('proyectos');
        await fetchProyectos();
      } else {
        showToast("Error: " + res.message);
      }
    } catch(e) {
      showToast("Error al crear control de gastos.");
    }
    setSubmitting(false);
  };

  // Create a budget linked directly to the project
  const handleCreateBudgetForProject = async (e) => {
    e.preventDefault();
    if (!newBudgetLimit) {
      showToast("Ingresa el presupuesto límite.");
      return;
    }
    setSubmitting(true);
    try {
      const budgetName = `Presupuesto: ${selectedProject.name}`;
      const res = await apiFetch('createProyecto', {
        name: budgetName,
        type: 'PRESUPUESTO',
        manager: 'PROYECTO_ID:' + selectedProject.id
      });
      if (res.status === 'success') {
        const projectsRes = await apiFetch('getProyectos');
        if (projectsRes.status === 'success') {
          const matched = projectsRes.data.find(p => p.type === 'PRESUPUESTO' && p.manager === 'PROYECTO_ID:' + selectedProject.id);
          if (matched) {
            await apiFetch('updateProyectoPresupuesto', {
              id: matched.id,
              presupuesto: Number(newBudgetLimit)
            });
          }
        }
        showToast("Control de gastos creado y vinculado.");
        setNewBudgetLimit('');
        clearCache('proyectos');
        await fetchProyectos();
      } else {
        showToast("Error: " + res.message);
      }
    } catch(e) {
      showToast("Error al crear control de gastos.");
    }
    setSubmitting(false);
  };

  // Link budget control to project
  const handleLinkBudget = async (projectId) => {
    if (!linkingBudget) return;
    try {
      await apiFetch('updateProyectoManager', {
        id: linkingBudget.id,
        manager: 'PROYECTO_ID:' + projectId
      });
      showToast("Presupuesto vinculado con éxito.");
      setLinkingBudget(null);
      clearCache('proyectos');
      await fetchProyectos();
    } catch(e) {
      showToast("Error al vincular presupuesto.");
    }
  };

  // Link existing independent budget to project (from project details)
  const handleLinkExistingBudget = async (budgetId) => {
    try {
      await apiFetch('updateProyectoManager', {
        id: budgetId,
        manager: 'PROYECTO_ID:' + selectedProject.id
      });
      showToast("Presupuesto vinculado.");
      setShowLinkExistingModal(false);
      clearCache('proyectos');
      await fetchProyectos();
    } catch(e) {
      showToast("Error al vincular.");
    }
  };

  // Unlink budget control
  const handleUnlinkBudget = async (budgetId) => {
    requestConfirm("¿Desvincular este presupuesto?", async () => {
      try {
        await apiFetch('updateProyectoManager', {
          id: budgetId,
          manager: ''
        });
        showToast("Presupuesto desvinculado.");
        clearCache('proyectos');
        await fetchProyectos();
      } catch(e) {
        showToast("Error al desvincular.");
      }
    });
  };

  // Delete budget control
  const handleDeleteBudget = async (budgetId) => {
    requestConfirm("¿Eliminar este presupuesto y todos sus gastos registrados permanentemente?", async () => {
      try {
        await apiFetch('deleteProyecto', { id: budgetId });
        showToast("Presupuesto eliminado.");
        clearCache('proyectos');
        await fetchProyectos();
      } catch(e) {
        showToast("Error al eliminar.");
      }
    });
  };

  const budgetControls = proyectos.filter(p => p.type === 'PRESUPUESTO');
  const standardProjects = proyectos.filter(p => p.type !== 'PRESUPUESTO');

  const projectExpenses = activeBudget ? gastos.filter(g => compareProjectIds(g.proyectoId, activeBudget.id)) : [];
  const totalSpent = projectExpenses.reduce((sum, g) => sum + (Number(g.monto) || 0), 0);
  const budget = activeBudget?.presupuesto || 0;
  const remaining = budget - totalSpent;
  const percentUsed = budget > 0 ? Math.min(Math.round((totalSpent / budget) * 100), 100) : 0;

  if (loading) {
    return (
      <Card className="p-8 text-center bg-slate-900 border border-slate-800">
        <PianoLoader size={90} />
        <p className="font-bold text-sm text-slate-300 mt-2">Cargando Presupuestos...</p>
      </Card>
    );
  }

  // --- CASE 1: INSIDE PROJECT DETAILS AND NO BUDGET LINKED ---
  if (hideHeader && !activeBudget) {
    const independentBudgets = budgetControls.filter(b => !b.manager || !b.manager.startsWith('PROYECTO_ID:'));
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card to create a new linked budget */}
        <Card className="p-5 border-slate-800 bg-slate-950/20 text-left">
          <h3 className="text-white font-bold text-sm mb-1">Crear Nuevo Presupuesto</h3>
          <p className="text-slate-400 text-xs mb-4">Inicializa un control de gastos exclusivo para este proyecto.</p>
          <form onSubmit={handleCreateBudgetForProject} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Presupuesto Límite ($) *</label>
              <input 
                type="number" 
                placeholder="Ej. 1500000"
                value={newBudgetLimit}
                onChange={e => setNewBudgetLimit(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-emerald-500 outline-none font-mono"
                required
                min="0"
              />
            </div>
            <Button type="submit" className="w-full py-2 text-xs font-bold" disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" size={14}/> : <Plus size={14}/>} Crear y Vincular
            </Button>
          </form>
        </Card>

        {/* Card to link an existing budget */}
        <Card className="p-5 border-slate-800 bg-slate-950/20 text-left flex flex-col justify-between">
          <div>
            <h3 className="text-white font-bold text-sm mb-1">Vincular Presupuesto Existente</h3>
            <p className="text-slate-400 text-xs mb-4">Asocia un control de gastos independiente creado previamente con este proyecto.</p>
          </div>
          <Button 
            variant="secondary" 
            className="w-full py-2 text-xs font-bold border border-slate-700 hover:text-emerald-400"
            onClick={() => setShowLinkExistingModal(true)}
          >
            <LinkIcon size={14} className="mr-1.5" /> Seleccionar Presupuesto ({independentBudgets.length} libres)
          </Button>
        </Card>

        {/* MODAL TO LINK EXISTING BUDGET */}
        {showLinkExistingModal && (
          <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in text-slate-100">
            <Card className="w-full max-w-lg p-4 md:p-6 bg-slate-900 border-emerald-500 flex flex-col max-h-[80vh] text-left shadow-2xl">
              <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-3">
                <h2 className="text-base md:text-lg font-bold text-white">Vincular Presupuesto Existente</h2>
                <button onClick={() => setShowLinkExistingModal(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2.5 mb-4 pr-2 custom-scrollbar">
                {independentBudgets.length === 0 ? (
                  <p className="text-slate-500 text-xs md:text-sm text-center py-8 font-bold">No hay presupuestos independientes libres actualmente.</p>
                ) : (
                  independentBudgets.map(b => (
                    <div key={b.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-800 bg-slate-950/40 hover:border-slate-700 transition-colors">
                      <div>
                        <h4 className="font-bold text-white text-xs md:text-sm">{b.name}</h4>
                        <p className="text-[10px] text-slate-450 mt-0.5">Límite: <span className="font-mono text-emerald-400">${(Number(b.presupuesto) || 0).toLocaleString('es-CL')}</span></p>
                      </div>
                      <Button 
                        variant="primary" 
                        className="py-1 px-3 text-xs font-bold"
                        onClick={() => handleLinkExistingBudget(b.id)}
                      >
                        Vincular
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // --- CASE 2: GLOBAL VIEW AND NO ACTIVE BUDGET CONTROL SELECTED ---
  if (!hideHeader && !activeBudget) {
    return (
      <div className="space-y-4 md:space-y-6 animate-fade-in pb-24 max-w-5xl mx-auto text-slate-100 text-left">
        <header className="border-b border-slate-800 pb-3 md:pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 text-left print:hidden">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2 md:gap-3">
              <DollarSign className="text-emerald-500" size={24} /> Gastos
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">Monitoreo de consumos, registro de boletas y control de saldo de producción.</p>
          </div>
          <div className="flex items-center gap-2">
            {budgetControls.length > 0 && (
              <Button 
                variant="primary" 
                onClick={() => setIsCreatingBudget(true)}
                className="py-2 text-xs font-bold flex items-center gap-1.5"
              >
                <Plus size={14} /> Nuevo Presupuesto
              </Button>
            )}
            <Button variant="ghost" icon={RefreshCw} onClick={() => loadData()} className="px-2 border border-slate-700 hover:text-emerald-400" title="Actualizar" />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetControls.length === 0 ? (
            <Card className="col-span-full p-12 text-center border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center">
              <DollarSign className="text-slate-600 mx-auto mb-3" size={48} />
              <p className="text-slate-400 font-light text-sm mb-4">Acá estarán los gastos creados</p>
              <button 
                onClick={() => setIsCreatingBudget(true)} 
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-light px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <span>+ Crear Gasto</span>
              </button>
            </Card>
          ) : (
            budgetControls.map(b => {
              const isLinked = b.manager && b.manager.startsWith('PROYECTO_ID:');
              let linkedProjectName = '';
              if (isLinked) {
                const projId = b.manager.split(':')[1];
                const matchedProj = standardProjects.find(sp => String(sp.id) === String(projId));
                linkedProjectName = matchedProj ? matchedProj.name : 'Proyecto Desconocido';
              }

              // Compute budget spent for this specific card
              const cardExpenses = gastos.filter(g => compareProjectIds(g.proyectoId, b.id));
              const cardSpent = cardExpenses.reduce((sum, g) => sum + (Number(g.monto) || 0), 0);
              const cardLimit = b.presupuesto || 0;
              const cardRemaining = cardLimit - cardSpent;
              const cardPercent = cardLimit > 0 ? Math.min(Math.round((cardSpent / cardLimit) * 100), 100) : 0;

              return (
                <Card key={b.id} className="p-4 border-slate-800 bg-slate-950/45 hover:border-slate-700 transition-colors flex flex-col justify-between relative">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded block w-fit ${isLinked ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 bg-slate-800'}`}>
                        {isLinked ? 'Vinculado' : 'Independiente'}
                      </span>
                      <button
                        onClick={() => handleDeleteBudget(b.id)}
                        className="absolute top-3 right-3 text-slate-500 hover:text-red-500 transition-colors p-1 bg-slate-900/50 border border-slate-800 hover:border-red-500/30 rounded z-10"
                        title="Eliminar Presupuesto"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <h3 className="font-bold text-white text-base leading-snug mb-1">{b.name}</h3>
                    {isLinked && (
                      <p className="text-[10px] text-slate-400 mb-3 flex items-center gap-1">
                        <LinkIcon size={10} className="text-emerald-400" />
                        <span>{linkedProjectName}</span>
                      </p>
                    )}

                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-500">Límite:</span>
                        <span className="text-white font-bold">${(Number(cardLimit) || 0).toLocaleString('es-CL')}</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-500">Gastado:</span>
                        <span className="text-slate-300">${cardSpent.toLocaleString('es-CL')}</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono border-t border-slate-900 pt-1.5">
                        <span className="text-slate-550">Saldo:</span>
                        <span className={`font-black ${cardRemaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          ${cardRemaining.toLocaleString('es-CL')}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="pt-2">
                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${cardPercent >= 100 ? 'bg-red-500' : cardPercent >= 85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${cardPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-slate-900 pt-3 mt-4">
                    <Button 
                      variant="primary" 
                      onClick={() => setSelectedProject(b)}
                      className="flex-1 py-1.5 text-xs font-bold"
                    >
                      Ver / Registrar Gastos
                    </Button>
                    {isLinked ? (
                      <Button 
                        variant="secondary" 
                        onClick={() => handleUnlinkBudget(b.id)}
                        className="py-1.5 px-2.5 text-xs border border-slate-800 text-slate-400 hover:text-red-400 shrink-0"
                        title="Desvincular de Proyecto"
                      >
                        <Unlink size={13} />
                      </Button>
                    ) : (
                      <Button 
                        variant="secondary" 
                        onClick={() => setLinkingBudget(b)}
                        className="py-1.5 px-2.5 text-xs border border-slate-800 text-slate-400 hover:text-emerald-400 shrink-0"
                        title="Vincular a Proyecto"
                      >
                        <LinkIcon size={13} />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* MODAL TO CREATE INDEPENDENT BUDGET */}
        {isCreatingBudget && (
          <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in text-slate-100">
            <Card className="w-full max-w-md p-4 md:p-6 bg-slate-900 border-emerald-500 flex flex-col text-left shadow-2xl">
              <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-3">
                <h2 className="text-base md:text-lg font-bold text-white">Nuevo Presupuesto Independiente</h2>
                <button onClick={() => setIsCreatingBudget(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20}/></button>
              </div>
              <form onSubmit={handleCreateBudget} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Nombre del Presupuesto *</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Fondo Gira Copiapó"
                    value={newBudgetName}
                    onChange={e => setNewBudgetName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-emerald-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Presupuesto Límite ($) *</label>
                  <input 
                    type="number" 
                    placeholder="Ej. 800000"
                    value={newBudgetLimit}
                    onChange={e => setNewBudgetLimit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-emerald-500 outline-none font-mono"
                    required
                    min="0"
                  />
                </div>
                <Button type="submit" className="w-full py-2.5 flex items-center justify-center gap-1.5" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" size={14}/> : <Plus size={14}/>} Crear Presupuesto
                </Button>
              </form>
            </Card>
          </div>
        )}

        {/* MODAL TO LINK INDEPENDENT BUDGET TO A PROJECT */}
        {linkingBudget && (
          <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in text-slate-100">
            <Card className="w-full max-w-lg p-4 md:p-6 bg-slate-900 border-emerald-500 flex flex-col max-h-[80vh] text-left shadow-2xl">
              <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-3">
                <h2 className="text-base md:text-lg font-bold text-white">Vincular a Proyecto Existente</h2>
                <button onClick={() => setLinkingBudget(null)} className="text-slate-400 hover:text-white transition-colors"><X size={20}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2.5 mb-4 pr-2 custom-scrollbar">
                {standardProjects.length === 0 ? (
                  <p className="text-slate-500 text-xs md:text-sm text-center py-8 font-bold">No hay proyectos creados actualmente.</p>
                ) : (
                  standardProjects.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-800 bg-slate-950/40 hover:border-slate-700 transition-colors">
                      <div>
                        <h4 className="font-bold text-white text-xs md:text-sm">{p.name}</h4>
                        <p className="text-[10px] text-slate-450 mt-0.5">Líder: {p.manager}</p>
                      </div>
                      <Button 
                        variant="primary" 
                        className="py-1 px-3 text-xs font-bold"
                        onClick={() => handleLinkBudget(p.id)}
                      >
                        Vincular
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // --- CASE 3: ACTIVE BUDGET SELECTION (SHOW EXPENSES GRID) ---
  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-24 max-w-5xl mx-auto text-slate-100 text-left">
      {!hideHeader && (
        <header className="border-b border-slate-800 pb-3 md:pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 text-left print:hidden">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedProject(null)}
              className="text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1 border border-slate-700 bg-slate-900 px-3 py-1.5 rounded-lg transition-colors"
            >
              ← Volver a Presupuestos
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2 md:gap-3">
                <DollarSign className="text-emerald-500" size={24} /> {activeBudget.name}
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1">Control de Presupuesto</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {activeBudget.manager && activeBudget.manager.startsWith('PROYECTO_ID:') ? (
              <Button 
                variant="secondary" 
                onClick={() => handleUnlinkBudget(activeBudget.id)}
                className="py-1.5 px-3 text-xs border border-slate-750 text-slate-300 hover:text-red-400 flex items-center gap-1.5 rounded"
              >
                <Unlink size={12} /> Desvincular de Proyecto
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                onClick={() => setLinkingBudget(activeBudget)}
                className="py-1.5 px-3 text-xs border border-slate-750 text-slate-300 hover:text-emerald-400 flex items-center gap-1.5 rounded"
              >
                <LinkIcon size={12} /> Vincular a Proyecto
              </Button>
            )}
            <Button variant="ghost" icon={RefreshCw} onClick={() => loadData()} className="px-2 border border-slate-700 hover:text-emerald-400" title="Actualizar" />
          </div>
        </header>
      )}

      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-5 border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estado del Presupuesto</h2>
              {hideHeader && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUnlinkBudget(activeBudget.id)}
                    className="text-[10px] text-red-450 hover:underline flex items-center gap-0.5"
                    title="Desvincular de este proyecto"
                  >
                    (Desvincular)
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Presupuesto Asignado:</span>
                {editingBudget ? (
                  <form onSubmit={handleUpdateBudget} className="flex gap-2">
                    <input 
                      type="number" 
                      value={newBudget} 
                      onChange={e => setNewBudget(e.target.value)} 
                      className="w-24 bg-slate-955 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white text-right font-mono outline-none"
                      required
                      min="0"
                    />
                    <Button type="submit" variant="primary" className="py-0.5 px-2 text-[10px]" disabled={submitting}>Guardar</Button>
                    <button type="button" onClick={() => setEditingBudget(false)} className="text-[10px] text-slate-550 hover:text-white">X</button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white font-black text-sm">${budget.toLocaleString('es-CL')}</span>
                    {canManageBudget && (
                      <button 
                        onClick={() => { setEditingBudget(true); setNewBudget(budget); }} 
                        className="text-[10px] text-emerald-500 hover:underline font-bold"
                      >
                        (Editar)
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Total Gastado:</span>
                <span className="font-mono text-white font-bold text-sm">${totalSpent.toLocaleString('es-CL')}</span>
              </div>

              <div className="flex justify-between items-center border-t border-slate-800 pt-3">
                <span className="text-xs text-slate-400">Saldo Disponible:</span>
                <span className={`font-mono font-black text-sm ${remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {remaining < 0 ? '-' : ''}${Math.abs(remaining).toLocaleString('es-CL')}
                </span>
              </div>

              <div className="pt-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-505 mb-1">
                  <span>CONSUMIDO</span>
                  <span className={percentUsed > 100 ? 'text-red-400 animate-pulse' : 'text-slate-400'}>{percentUsed}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-800 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentUsed >= 100 ? 'bg-red-500 shadow-md shadow-red-950/20' :
                      percentUsed >= 85 ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(percentUsed, 100)}%` }}
                  ></div>
                </div>
                {remaining < 0 && (
                  <div className="mt-2.5 bg-red-500/10 border border-red-500/30 text-red-400 p-2 rounded-lg text-[10px] leading-relaxed flex items-start gap-1.5">
                    <AlertCircle size={12} className="shrink-0 mt-0.5" />
                    <span><b>Alerta:</b> El total gastado supera el presupuesto establecido para este proyecto.</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-5 border-slate-800">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Registrar Nuevo Gasto</h2>
            
            <form onSubmit={handleAddExpense} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Concepto / Detalle *</label>
                <input 
                  type="text" 
                  placeholder="Ej. Combustible o Almuerzo Crew"
                  value={newExpense.concepto}
                  onChange={e => setNewExpense({...newExpense, concepto: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Monto ($) *</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={newExpense.monto}
                    onChange={e => setNewExpense({...newExpense, monto: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white text-right font-mono focus:border-emerald-500 outline-none"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Fecha *</label>
                  <input 
                    type="date" 
                    value={newExpense.fecha}
                    onChange={e => setNewExpense({...newExpense, fecha: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Categoría</label>
                <select 
                  value={newExpense.categoria}
                  onChange={e => setNewExpense({...newExpense, categoria: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-emerald-500 outline-none"
                >
                  <option value="Logística/Transporte">Logística/Transporte</option>
                  <option value="Catering/Comida">Catering/Comida</option>
                  <option value="Alojamiento/Hoteles">Alojamiento/Hoteles</option>
                  <option value="Técnica/Equipos">Técnica/Equipos</option>
                  <option value="Merchandising/Uniformes">Merchandising/Uniformes</option>
                  <option value="Gastos Varios">Gastos Varios</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Comprobante de Pago (Foto boleta)</label>
                <input 
                  type="file" 
                  id="receipt-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-slate-450 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 file:cursor-pointer outline-none bg-slate-950 p-2 rounded-lg border border-slate-800"
                />
                {newExpense.comprobante && (
                  <div className="mt-2.5 relative inline-block">
                    <img src={newExpense.comprobante} alt="Preview Boleta" className="h-16 w-auto rounded border border-slate-700 object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setNewExpense(prev => ({ ...prev, comprobante: '' }))}
                      className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-black hover:bg-red-500 border border-slate-955"
                    >
                      x
                    </button>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full py-2.5 mt-2 flex items-center justify-center gap-2"
                disabled={submitting}
              >
                {submitting ? <Loader2 className="animate-spin" size={14}/> : <Plus size={14}/>} Registrar Gasto
              </Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-white font-bold text-sm">Detalle de Gastos</h3>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Historial de Boletas e Informes</p>
              </div>
              <div className="text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg font-mono text-slate-400 font-bold">
                Total Registros: {projectExpenses.length}
              </div>
            </div>

            {projectExpenses.length === 0 ? (
              <div className="text-center py-12 text-slate-550">
                <FileText className="mx-auto text-slate-700 mb-2" size={32} />
                <p className="text-xs">No hay gastos registrados en este presupuesto aún.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mobile/Tablet - Cards */}
                <div className="space-y-3 md:hidden">
                  {projectExpenses.map(g => (
                    <div key={g.id} className="bg-slate-900 border border-slate-850 rounded-xl p-3.5 flex justify-between items-start gap-2.5">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-slate-450">{g.fecha}</span>
                        <h4 className="font-bold text-white text-sm leading-tight">{g.concepto}</h4>
                        <div className="flex flex-wrap gap-1.5 items-center mt-1">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-400">
                            {g.categoria}
                          </span>
                          <span className="text-[9px] text-slate-550 font-mono">
                            Por: {(g.registradoPor || 'admin@esquemas.pro').split('@')[0]}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between min-h-[64px] shrink-0">
                        <span className="font-mono font-black text-sm text-emerald-400">${(Number(g.monto) || 0).toLocaleString('es-CL')}</span>
                        <div className="flex items-center gap-2 mt-2">
                          {g.comprobante ? (
                            <button 
                              onClick={() => setViewingReceipt(g.comprobante)}
                              className="text-emerald-400 hover:text-emerald-300 text-xs font-bold underline flex items-center gap-1"
                            >
                              <ImageIcon size={12} /> Ver
                            </button>
                          ) : (
                            <span className="text-slate-650 text-[10px] font-bold">—</span>
                          )}
                          <button 
                            onClick={() => requestConfirm("¿Eliminar este gasto de forma permanente?", () => handleDeleteExpense(g.id))}
                            className="text-red-500 hover:text-red-400 p-1"
                            title="Eliminar registro"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop - Table */}
                <div className="hidden md:block overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                        <th className="py-2.5 px-3">Fecha</th>
                        <th className="py-2.5 px-3">Concepto / Detalle</th>
                        <th className="py-2.5 px-3">Categoría</th>
                        <th className="py-2.5 px-3">Registrado Por</th>
                        <th className="py-2.5 px-3 text-center">Boleta</th>
                        <th className="py-2.5 px-3 text-right">Monto</th>
                        <th className="py-2.5 px-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {projectExpenses.map(g => (
                        <tr key={g.id} className="hover:bg-slate-900/40 text-slate-350">
                          <td className="py-3 px-3 font-mono text-slate-450">{g.fecha}</td>
                          <td className="py-3 px-3 font-bold text-white max-w-[180px] truncate" title={g.concepto}>{g.concepto}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-400">
                              {g.categoria}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-450 max-w-[120px] truncate" title={g.registradoPor || ''}>{(g.registradoPor || 'admin@esquemas.pro').split('@')[0]}</td>
                          <td className="py-3 px-3 text-center">
                            {g.comprobante ? (
                              <button 
                                onClick={() => setViewingReceipt(g.comprobante)}
                                className="text-emerald-400 hover:text-emerald-300 text-xs inline-flex items-center gap-1 font-bold underline"
                              >
                                <ImageIcon size={14} /> Ver
                              </button>
                            ) : (
                              <span className="text-slate-600 text-[10px]">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-white">${(Number(g.monto) || 0).toLocaleString('es-CL')}</td>
                          <td className="py-3 px-3 text-center">
                            <button 
                              onClick={() => requestConfirm("¿Eliminar este gasto de forma permanente?", () => handleDeleteExpense(g.id))}
                              className="text-red-500 hover:text-red-400 p-1"
                              title="Eliminar registro"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* RECEIPT VIEWER MODAL */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-slate-955/90 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-fade-in print:hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-4 relative flex flex-col items-center">
            <button 
              onClick={() => setViewingReceipt(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white font-bold p-1 bg-slate-950/80 rounded-full"
            >
              <X size={18} />
            </button>
            <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wider self-start flex items-center gap-1.5"><ImageIcon size={16} className="text-emerald-500"/> Comprobante del Gasto</h3>
            <img src={viewingReceipt} alt="Comprobante Boleta" className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain border border-slate-800 bg-slate-955" />
            <div className="mt-4 flex gap-3 w-full">
              <a 
                href={viewingReceipt} 
                download={`comprobante_gasto.jpg`} 
                className="flex-1 bg-slate-800 border border-slate-700 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 hover:bg-slate-700 transition-colors"
              >
                Descargar Imagen
              </a>
              <Button 
                variant="primary" 
                onClick={() => setViewingReceipt(null)}
                className="flex-1 py-2 text-xs font-bold"
              >
                Cerrar Vista
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TO LINK INDEPENDENT BUDGET TO A PROJECT (FROM DETAIL VIEW) */}
      {linkingBudget && (
        <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in text-slate-100">
          <Card className="w-full max-w-lg p-4 md:p-6 bg-slate-900 border-emerald-500 flex flex-col max-h-[80vh] text-left shadow-2xl">
            <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-3">
              <h2 className="text-base md:text-lg font-bold text-white">Vincular a Proyecto Existente</h2>
              <button onClick={() => setLinkingBudget(null)} className="text-slate-400 hover:text-white transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2.5 mb-4 pr-2 custom-scrollbar">
              {standardProjects.length === 0 ? (
                <p className="text-slate-500 text-xs md:text-sm text-center py-8 font-bold">No hay proyectos creados actualmente.</p>
              ) : (
                standardProjects.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-800 bg-slate-950/40 hover:border-slate-700 transition-colors">
                    <div>
                      <h4 className="font-bold text-white text-xs md:text-sm">{p.name}</h4>
                      <p className="text-[10px] text-slate-450 mt-0.5">Líder: {p.manager}</p>
                    </div>
                    <Button 
                      variant="primary" 
                      className="py-1 px-3 text-xs font-bold"
                      onClick={() => handleLinkBudget(p.id)}
                    >
                      Vincular
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
export default ExpensesView;
