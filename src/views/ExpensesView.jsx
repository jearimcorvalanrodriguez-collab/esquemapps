import React, { useState, useEffect } from 'react';
import { 
  Wallet, RefreshCw, AlertCircle, Plus, Loader2, 
  FileText, Trash2, Image as ImageIcon, X 
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PianoLoader } from '../components/PianoLoader';
import { CACHE, apiFetch, clearCache, compareProjectIds, setCache } from '../utils/api';
import { ROLES } from '../utils/constants';

export const ExpensesView = ({ currentUser, showToast, requestConfirm, selectedProject, setSelectedProject }) => {
  const [proyectos, setProyectos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState('');
  const [viewingReceipt, setViewingReceipt] = useState(null);

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
  }, []);

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
    if (!selectedProject) {
      showToast("Por favor selecciona un proyecto primero.");
      return;
    }
    if (!newExpense.concepto.trim() || !newExpense.monto) {
      showToast("Completa los campos obligatorios.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        proyectoId: selectedProject.id,
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
    if (!selectedProject) return;
    
    setSubmitting(true);
    try {
      const res = await apiFetch('updateProyectoPresupuesto', {
        id: selectedProject.id,
        presupuesto: Number(newBudget)
      });
      if (res.status === 'success') {
        showToast("Presupuesto actualizado.");
        setEditingBudget(false);
        setProyectos(prev => prev.map(p => p.id === selectedProject.id ? { ...p, presupuesto: Number(newBudget) } : p));
        setSelectedProject(prev => ({ ...prev, presupuesto: Number(newBudget) }));
        clearCache('proyectos');
      } else {
        showToast("Error: " + res.message);
      }
    } catch(e) {
      showToast("Error al actualizar presupuesto.");
    }
    setSubmitting(false);
  };

  const projectExpenses = gastos.filter(g => compareProjectIds(g.proyectoId, selectedProject?.id));
  const totalSpent = projectExpenses.reduce((sum, g) => sum + g.monto, 0);
  const budget = selectedProject?.presupuesto || 0;
  const remaining = budget - totalSpent;
  const percentUsed = budget > 0 ? Math.min(Math.round((totalSpent / budget) * 100), 150) : 0;

  if (loading) {
    return (
      <Card className="p-8 text-center bg-slate-900 border border-slate-800">
        <PianoLoader size={90} />
        <p className="font-bold text-sm text-slate-300 mt-2">Cargando Módulo de Gastos...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Wallet size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white">Control de Gastos y Presupuestos</h1>
            <p className="text-xs text-slate-400">Monitoreo de consumos, registro de boletas y control de saldo de producción.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Proyecto:</label>
          <select 
            value={selectedProject?.id || ''} 
            onChange={(e) => {
              const matched = proyectos.find(p => String(p.id) === e.target.value);
              setSelectedProject(matched || null);
              if (matched) setNewBudget(matched.presupuesto || '');
            }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="">-- Selecciona un Proyecto --</option>
            {proyectos.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <Button variant="ghost" icon={RefreshCw} onClick={() => loadData()} className="px-2 border border-slate-700 hover:text-emerald-400" title="Actualizar" />
        </div>
      </div>

      {!selectedProject ? (
        <Card className="p-8 text-center border-slate-800">
          <Wallet className="text-slate-600 mx-auto mb-3" size={48} />
          <h3 className="text-white font-bold text-base mb-1">Ningún Proyecto Seleccionado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Selecciona un proyecto arriba a la derecha para ver su presupuesto, registrar boletas y realizar auditorías.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-5 border-slate-800">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Estado del Presupuesto</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Presupuesto Asignado:</span>
                  {editingBudget ? (
                    <form onSubmit={handleUpdateBudget} className="flex gap-2">
                      <input 
                        type="number" 
                        value={newBudget} 
                        onChange={e => setNewBudget(e.target.value)} 
                        className="w-24 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white text-right font-mono outline-none"
                        required
                        min="0"
                      />
                      <Button type="submit" variant="primary" className="py-0.5 px-2 text-[10px]" disabled={submitting}>Guardar</Button>
                      <button type="button" onClick={() => setEditingBudget(false)} className="text-[10px] text-slate-500 hover:text-white">X</button>
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
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
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
                    className="w-full text-slate-400 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 file:cursor-pointer outline-none bg-slate-950 p-2 rounded-lg border border-slate-800"
                  />
                  {newExpense.comprobante && (
                    <div className="mt-2.5 relative inline-block">
                      <img src={newExpense.comprobante} alt="Preview Boleta" className="h-16 w-auto rounded border border-slate-700 object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setNewExpense(prev => ({ ...prev, comprobante: '' }))}
                        className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-black hover:bg-red-500 border border-slate-950"
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
                  <h3 className="text-white font-bold text-sm">Detalle de Gastos del Proyecto</h3>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Historial de Boletas e Informes</p>
                </div>
                <div className="text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg font-mono text-slate-400">
                  Total Registros: {projectExpenses.length}
                </div>
              </div>

              {projectExpenses.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="mx-auto text-slate-700 mb-2" size={32} />
                  <p className="text-xs">No hay gastos registrados en este proyecto aún.</p>
                </div>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
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
                        <tr key={g.id} className="hover:bg-slate-900/40 text-slate-300">
                          <td className="py-3 px-3 font-mono text-slate-400">{g.fecha}</td>
                          <td className="py-3 px-3 font-bold text-white max-w-[180px] truncate" title={g.concepto}>{g.concepto}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-400">
                              {g.categoria}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-400 max-w-[120px] truncate" title={g.registradoPor}>{g.registradoPor.split('@')[0]}</td>
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
                          <td className="py-3 px-3 text-right font-mono font-bold text-white">${g.monto.toLocaleString('es-CL')}</td>
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
              )}
            </Card>
          </div>
        </div>
      )}

      {viewingReceipt && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-fade-in print:hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-4 relative flex flex-col items-center">
            <button 
              onClick={() => setViewingReceipt(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white font-bold p-1 bg-slate-950/80 rounded-full"
            >
              <X size={18} />
            </button>
            <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wider self-start flex items-center gap-1.5"><ImageIcon size={16} className="text-emerald-500"/> Comprobante del Gasto</h3>
            <img src={viewingReceipt} alt="Comprobante Boleta" className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain border border-slate-800 bg-slate-950" />
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
    </div>
  );
};
export default ExpensesView;
