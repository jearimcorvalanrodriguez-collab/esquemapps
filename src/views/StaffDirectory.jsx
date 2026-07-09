import React, { useState, useEffect } from 'react';
import { 
  Users, RefreshCw, Music, Plus, Edit3, Trash2, Mail, 
  Phone, MessageSquare, Utensils, Printer, CheckCircle2, 
  AlertCircle, X, Loader2, ShieldCheck, UserPlus, Shield, 
  UserCheck, Save, Bell, Key
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PianoLoader } from '../components/PianoLoader';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { COUNTRY_CODES, detectCountryCode, parsePhone } from '../utils/phoneHelper';
import { openWhatsApp, openEmail } from '../components/NotificationsButton';
import { CACHE, apiFetch, clearCache, setCache } from '../utils/api';
import { ROLES } from '../utils/constants';

const MODULOS = [
  { id: 'DASHBOARD', label: 'Ver Proyectos' },
  { id: 'PROJECTS_MANAGE', label: 'Gestionar Proyectos' },
  { id: 'RIDERS', label: 'Ver Riders' },
  { id: 'RIDERS_MANAGE', label: 'Gestionar Riders' },
  { id: 'HITOS', label: 'Ver Timing (Hitos)' },
  { id: 'HITOS_MANAGE', label: 'Gestionar Timing (Hitos)' },
  { id: 'STAFF', label: 'Ver Directorio' },
  { id: 'EXPENSES', label: 'Ver Gastos y Registrar Boletas' },
  { id: 'EXPENSES_MANAGE', label: 'Gestionar Presupuestos (Admin/Manager)' }
];

const RoleConfigView = ({ currentUser, showToast }) => {
  const [selectedRole, setSelectedRole] = useState(ROLES.TECH || 'TÉCNICO');
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchRolePermisos = async (role) => {
    setLoading(true);
    try {
      const res = await apiFetch('getRolesConfig');
      if (res.status === 'success') {
        const matched = res.data.find(c => c.role === role);
        if (matched) {
          setPermisos(matched.permisos || []);
        } else {
          setPermisos(getDefaultLocalPermisos(role));
        }
      } else {
        setPermisos(getDefaultLocalPermisos(role));
      }
    } catch(e) {
      setPermisos(getDefaultLocalPermisos(role));
    }
    setLoading(false);
  };

  const getDefaultLocalPermisos = (role) => {
    if (role === 'TOUR MANAGER') return ['DASHBOARD', 'PROJECTS_MANAGE', 'PROJECT_ASSIGN', 'PROJECT_STATUS', 'RIDERS', 'RIDERS_MANAGE', 'HITOS', 'HITOS_MANAGE', 'STAFF', 'ADMIN_PANEL', 'EXPENSES', 'EXPENSES_MANAGE'];
    if (role === 'ARTISTA') return ['DASHBOARD', 'RIDERS'];
    return ['DASHBOARD', 'RIDERS', 'TRANSPORT', 'HITOS', 'CHAT', 'CHAT_SEND', 'STAFF'];
  };

  useEffect(() => {
    fetchRolePermisos(selectedRole);
  }, [selectedRole]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch('updateRoleDefaultPermisos', { role: selectedRole, permisos });
      if (res.status === 'success') {
        showToast(`Plantilla de permisos para ${selectedRole} guardada con éxito.`);
      } else {
        showToast("Error al guardar: " + res.message);
      }
    } catch(e) {
      showToast("Error al conectar con el servidor.");
    }
    setSaving(false);
  };

  return (
    <Card className="max-w-xl mx-auto p-4 md:p-6 border-t-4 border-emerald-500 text-left bg-slate-900 border-slate-800">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
        <div className="p-2 bg-emerald-505/10 text-emerald-400 rounded-lg">
          <Shield size={20} />
        </div>
        <div>
          <h2 className="text-base md:text-lg font-bold text-white">Configuración Base de Roles</h2>
          <p className="text-xs text-slate-400">Define los permisos por defecto para cada rol. Los nuevos usuarios heredarán esta plantilla automáticamente.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Seleccionar Rol / Perfil</label>
          <select 
            value={selectedRole} 
            onChange={e => setSelectedRole(e.target.value)} 
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500 cursor-pointer"
          >
            {Array.from(new Set(Object.values(ROLES))).map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 mb-2.5 uppercase">Privilegios para {selectedRole}</label>
          {loading ? (
            <div className="flex justify-center p-6"><PianoLoader size={30} /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-850">
              {MODULOS.map(mod => {
                const isChecked = permisos.includes(mod.id);
                return (
                  <ToggleSwitch 
                    key={mod.id}
                    label={mod.label}
                    checked={isChecked}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setPermisos(prev => 
                        checked ? [...prev, mod.id] : prev.filter(p => p !== mod.id)
                      );
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        <Button 
          onClick={handleSave} 
          variant="primary" 
          className="w-full py-2.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 border-emerald-500/50 mt-2" 
          disabled={saving || loading}
        >
          {saving ? <Loader2 className="animate-spin mr-1.5" size={14}/> : <Save className="mr-1.5" size={14}/>} 
          Guardar Plantilla de {selectedRole}
        </Button>
      </div>
    </Card>
  );
};

export const StaffDirectory = ({ currentUser, showToast, requestConfirm, refreshPendingCount }) => {
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [localDirectory, setLocalDirectory] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('STAFF_ACTIVO');
  const [editingUser, setEditingUser] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);

  // Formulario Direct Staff
  const [invName, setInvName] = useState('');
  const [invEmail, setInvEmail] = useState('');
  const [invPhoneCode, setInvPhoneCode] = useState(detectCountryCode());
  const [invPhoneNumber, setInvPhoneNumber] = useState('');
  const [invRole, setInvRole] = useState(ROLES.TECH);



  const handleApprove = async (email) => {
    setProcessingId(email);
    try {
      const res = await apiFetch('aprobarUsuario', { email });
      if (res.status === 'success') { 
        const tempPass = res.tempPass;
        if (tempPass) {
          alert(`¡Usuario Aprobado con Éxito!\n\nEmail: ${email}\nToken de Acceso Temporal: ${tempPass}\n\nPor favor, copia este token y envíaselo al usuario.`);
        } else {
          showToast("Usuario aprobado. Correo enviado al usuario."); 
        }
        clearCache('usuarios');
        fetchDirectory(true);
        if (refreshPendingCount) refreshPendingCount();
      } 
      else { showToast("Error: " + res.message); }
    } catch(e) { showToast("Error de conexión al aprobar."); }
    setProcessingId(null);
  };

  const handleReject = async (email) => {
    setProcessingId(email);
    try {
      const res = await apiFetch('rechazarUsuario', { email });
      if (res.status === 'success') { 
        showToast("Solicitud rechazada. Correo enviado."); 
        clearCache('usuarios');
        fetchDirectory(true);
        if (refreshPendingCount) refreshPendingCount();
      } 
      else { showToast("Error: " + res.message); }
    } catch(e) { showToast("Error de conexión al rechazar."); }
    setProcessingId(null);
  };

  const handleDeleteUser = async (email) => {
    setProcessingId(email);
    try {
      const res = await apiFetch('eliminarUsuario', { email });
      if (res.status === 'success') { 
        showToast("Usuario eliminado."); 
        clearCache('usuarios');
        fetchDirectory(true);
        if (refreshPendingCount) refreshPendingCount();
      } 
      else { showToast("Error: " + res.message); }
    } catch(e) { showToast("Error de conexión al eliminar."); }
    setProcessingId(null);
  };

  const handleDirectInvite = async (e) => {
    e.preventDefault(); 
    setProcessingId('inviting-staff');
    try {
      const fullPhone = `${invPhoneCode}${invPhoneNumber}`.trim();
      const resSolicitud = await apiFetch('solicitarAcceso', { name: invName, email: invEmail, phone: fullPhone, role: invRole });
      if(resSolicitud.status === 'success') {
        const resAprob = await apiFetch('aprobarUsuario', { email: invEmail });
        if(resAprob.status === 'success') {
          const tempPass = resAprob.tempPass;
          if (tempPass) {
            alert(`¡Usuario Creado con Éxito!\n\nNombre: ${invName}\nRol: ${invRole}\nToken de Acceso: ${tempPass}\n\nPor favor, copia este token y envíaselo al integrante.`);
          } else {
            showToast(`Acceso creado. Credenciales enviadas a ${invEmail}`);
          }
          setInvName(''); setInvEmail(''); setInvPhoneCode(detectCountryCode()); setInvPhoneNumber(''); setInvRole(ROLES.TECH);
          setActiveSubTab('STAFF_ACTIVO'); 
          clearCache('usuarios');
          fetchDirectory(true);
          if (refreshPendingCount) refreshPendingCount();
        }
      }
    } catch(e) { showToast("Error al invitar integrante."); }
    setProcessingId(null);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setProcessingId('editing-staff-save');
    try {
      const res = await apiFetch('updateUserAdmin', editingUser);
      if (res.status === 'success') {
        showToast("Perfil de usuario actualizado."); 
        setEditingUser(null);
        clearCache('usuarios');
        fetchDirectory(true);
        
        if (res.ceded) {
          showToast("ℹ️ Has transferido el rol de Administrador Único. Tu cuenta ha sido cambiada al rol de Manager. Recargando...");
          setTimeout(() => {
            window.location.reload();
          }, 3000);
          return;
        }
      } else {
        showToast("Error al guardar: " + res.message);
      }
    } catch(err) {
      showToast("Error de conexión al guardar cambios.");
    }
    setProcessingId(null);
  };

  const fetchDirectory = async (force = false) => {
    setLoading(true);
    setFetchError(false);
    try {
      let users = CACHE.usuarios;
      if (force || !users) {
        const res = await apiFetch('getUsuarios');
        if (res.status === 'success') { users = res.data; setCache('usuarios', users); }
        else { users = []; }
      }
      
      let projs = CACHE.proyectos;
      if (force || !projs) {
        const resP = await apiFetch('getProyectos');
        if (resP.status === 'success') { 
          projs = resP.data.map(p => ({ ...p, asignados: Array.isArray(p.asignados) ? p.asignados : [] })); 
          setCache('proyectos', projs); 
        } else { projs = []; }
      }
      setProyectos(projs);

      const pending = users.filter(u => u.status === 'PENDING');
      setPendingUsers(pending);

      const activeUsers = users.filter(u => u.status === 'ACTIVO' && u.email !== currentUser.email);
      const canSeeEveryone = [ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER, ROLES.TEC_JEFE, ROLES.JEFE_CAT_APV, ROLES.APV].includes(currentUser.role);
      
      let visibleEmails = new Set();
      if (!canSeeEveryone) {
         projs.forEach(p => {
            if (p.asignados.includes(currentUser.email)) {
               p.asignados.forEach(e => visibleEmails.add(e));
            }
         });
         setLocalDirectory(activeUsers.filter(u => visibleEmails.has(u.email)));
      } else {
         if ([ROLES.ADMIN, ROLES.MANAGER].includes(currentUser.role)) {
            setLocalDirectory(users.filter(u => (u.status === 'ACTIVO' || u.status === 'INACTIVO') && u.email !== currentUser.email));
         } else {
            setLocalDirectory(activeUsers);
         }
      }
    } catch(e) { setFetchError(true); }
    setLoading(false);
  };

  useEffect(() => {
    fetchDirectory();
  }, [currentUser]);

  const isAuthorizedToManageArtists = [ROLES.ADMIN, ROLES.MANAGER].includes(currentUser.role);

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-24 max-w-5xl mx-auto print:m-0 print:p-0 print:w-full text-slate-100">
      <header className="border-b border-slate-800 pb-3 md:pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2 md:gap-3"><Users className="text-emerald-500" size={24} /> Directorio</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">{[ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role) ? 'Gestión de personal y accesos.' : 'Contactos asignados.'}</p>
        </div>
        <Button variant="ghost" icon={RefreshCw} onClick={() => fetchDirectory(true)} className="px-2 border border-slate-700 hover:text-emerald-400" title="Actualizar" />
      </header>

      {isAuthorizedToManageArtists && (
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar mb-4 border-b border-slate-850 print:hidden">
          <Button 
            variant={activeSubTab === 'STAFF_ACTIVO' ? 'primary' : 'secondary'} 
            onClick={() => { setActiveSubTab('STAFF_ACTIVO'); setEditingUser(null); }}
            icon={Users}
            className="py-1.5 px-3 text-xs shrink-0"
          >
            Directorio Staff
          </Button>
          <Button 
            variant={activeSubTab === 'PENDIENTES' ? 'primary' : 'secondary'} 
            onClick={() => { setActiveSubTab('PENDIENTES'); setEditingUser(null); }}
            icon={Bell}
            className={`py-1.5 px-3 text-xs shrink-0 relative ${activeSubTab === 'PENDIENTES' ? 'bg-amber-600 border-amber-500 hover:bg-amber-500' : 'border-amber-500/30 text-amber-400 hover:bg-amber-600/10'}`}
          >
            Solicitudes ({pendingUsers.length})
            {pendingUsers.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-pulse">
                {pendingUsers.length}
              </span>
            )}
          </Button>
          <Button 
            variant={activeSubTab === 'ROLES_CONFIG' ? 'primary' : 'secondary'} 
            onClick={() => { setActiveSubTab('ROLES_CONFIG'); setEditingUser(null); }}
            icon={Shield}
            className="py-1.5 px-3 text-xs shrink-0"
          >
            Definición de Roles
          </Button>
          <Button 
            variant={activeSubTab === 'INVITAR' ? 'primary' : 'secondary'} 
            onClick={() => { setActiveSubTab('INVITAR'); setEditingUser(null); }}
            icon={UserPlus}
            className="py-1.5 px-3 text-xs shrink-0"
          >
            Invitar Staff
          </Button>
        </div>
      )}

      {fetchError ? (
        <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl text-red-400 flex items-center gap-2 text-sm print:hidden">
          <AlertCircle size={18} /> Error al cargar el directorio.
        </div>
      ) : loading && localDirectory.length === 0 ? ( 
        <div className="flex justify-center p-8 print:hidden"><PianoLoader size={40} /></div> 
      ) : (
        <>
          {activeSubTab === 'STAFF_ACTIVO' && (
            <>
              {/* Reporte Catering Impresión */}
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 md:p-6 mb-6 print:border-black print:bg-white print:text-black hidden print:block">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-800 print:border-black pb-3">
                    <h2 className="text-lg font-bold flex items-center gap-2"><Utensils className="text-amber-500 print:text-black"/> Reporte Catering (APV)</h2>
                    <Button variant="secondary" icon={Printer} className="print:hidden py-1.5 px-3 text-xs" onClick={() => {
                      const originalTitle = document.title;
                      document.title = `Reporte_Catering_${new Date().toLocaleDateString().replace(/\//g, '-')}`;
                      window.print();
                      setTimeout(() => { document.title = originalTitle; }, 1000);
                    }}>Imprimir PDF</Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <h3 className="text-xs font-bold text-slate-400 print:text-black mb-2 uppercase tracking-wider">Detalle de Asignación</h3>
                       <div className="overflow-y-auto max-h-[300px] print:max-h-none border border-slate-700 print:border-black rounded-lg custom-scrollbar bg-slate-800 print:bg-transparent">
                          <table className="w-full text-left text-xs md:text-sm print:text-black">
                            <thead className="bg-slate-900 print:bg-gray-200 sticky top-0 border-b border-slate-700 print:border-black">
                              <tr><th className="p-2 pl-3">Nombre / Rol</th><th className="p-2">Dieta</th></tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-slate-700/50 print:border-black/50">
                                <td className="p-2 pl-3">
                                  <div className="font-bold text-white print:text-black">{currentUser.name} (Tú)</div>
                                  <div className="text-[9px] text-slate-400 print:text-slate-600 uppercase mt-0.5">{currentUser.role}</div>
                                </td>
                                <td className="p-2"><span className="text-[9px] md:text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/30 print:border-black print:text-black px-1.5 py-0.5 rounded font-black uppercase tracking-wider truncate block max-w-[100px] md:max-w-none">{currentUser.dieta || 'OMNÍVORA'}</span></td>
                              </tr>
                             {localDirectory.map(u => (
                               <tr key={u.email} className="border-b border-slate-700/50 print:border-black/50 last:border-0">
                                 <td className="p-2 pl-3">
                                   <div className="font-bold text-white print:text-black">{u.name}</div>
                                   <div className="text-[9px] text-slate-400 print:text-slate-600 uppercase mt-0.5">{u.role}</div>
                                 </td>
                                 <td className="p-2"><span className="text-[9px] md:text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/30 print:border-black print:text-black px-1.5 py-0.5 rounded font-black uppercase tracking-wider truncate block max-w-[100px] md:max-w-none">{u.dieta || 'OMNÍVORA'}</span></td>
                               </tr>
                             ))}
                            </tbody>
                          </table>
                       </div>
                    </div>
                  </div>
              </div>

              {/* Grid de Contactos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 print:hidden">
                {localDirectory.map((user, idx) => (
                  <Card key={idx} className={`p-3 md:p-4 flex flex-col justify-between ${user.status === 'INACTIVO' ? 'opacity-55 border-red-500/25 bg-red-950/5' : 'border-slate-800'} relative`}>
                    {editingUser?.email === user.email ? (
                      <form onSubmit={handleEditSave} className="space-y-3 text-left w-full animate-fade-in">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <h4 className="text-sm font-bold text-emerald-400">Editar a {user.name}</h4>
                          <button type="button" onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white"><X size={16}/></button>
                        </div>
                        
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-emerald-500" 
                            value={editingUser.name} 
                            onChange={e => setEditingUser({...editingUser, name: e.target.value})} 
                            required 
                          />
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Teléfono</label>
                            <div className="flex gap-1.5 w-full">
                              <select 
                                value={parsePhone(editingUser.phone).code} 
                                onChange={e => {
                                  const newCode = e.target.value;
                                  const parsed = parsePhone(editingUser.phone);
                                  setEditingUser(prev => ({
                                    ...prev,
                                    phone: `${newCode}${parsed.number}`
                                  }));
                                }}
                                className="w-[70px] shrink-0 bg-slate-955 border border-slate-700 rounded !h-8 !px-1.5 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
                              >
                                {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                              </select>
                              <input 
                                type="text" 
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-emerald-500" 
                                value={parsePhone(editingUser.phone).number} 
                                onChange={e => {
                                  const cleanNum = e.target.value.replace(/[^0-9]/g, '');
                                  const parsed = parsePhone(editingUser.phone);
                                  setEditingUser(prev => ({
                                    ...prev,
                                    phone: `${parsed.code}${cleanNum}`
                                  }));
                                }}
                                placeholder="Ej. 912345678"
                                required 
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Rol / Perfil</label>
                            <select 
                              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-emerald-500 font-bold cursor-pointer" 
                              value={editingUser.role} 
                              onChange={(e) => {
                                const newRole = e.target.value;
                                if (newRole === 'ADMIN') {
                                  requestConfirm(
                                    `ATENCIÓN: Al cambiar a ${editingUser.name} a ADMINISTRADOR, estarás cediendo tu rol de Administrador Único. Tu cuenta pasará a ser MANAGER para mantener un solo administrador. ¿Confirmas la transferencia?`,
                                    () => setEditingUser(prev => ({ ...prev, role: 'ADMIN' }))
                                  );
                                } else {
                                  setEditingUser(prev => ({ ...prev, role: newRole }));
                                }
                              }}
                            >
                              {Array.from(new Set(Object.values(ROLES))).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Estado de Cuenta</label>
                          <select 
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white font-bold outline-none focus:border-emerald-500 cursor-pointer" 
                            value={editingUser.status} 
                            onChange={e => setEditingUser({...editingUser, status: e.target.value})}
                          >
                            <option value="ACTIVO">ACTIVO (Permitir Acceso)</option>
                            <option value="INACTIVO">BLOQUEADO / INACTIVO</option>
                          </select>
                        </div>

                        <div className="pt-2 border-t border-slate-800">
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-2">Privilegios Detallados</label>
                          <div className="grid grid-cols-1 gap-1.5 max-h-[120px] overflow-y-auto pr-1.5 custom-scrollbar">
                            {MODULOS.map(mod => (
                              <ToggleSwitch 
                                key={mod.id}
                                label={mod.label}
                                checked={(editingUser.permisos || []).includes(mod.id)}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  setEditingUser(prev => {
                                    const currentPerms = prev.permisos || [];
                                    return {
                                      ...prev,
                                      permisos: isChecked 
                                        ? [...currentPerms, mod.id] 
                                        : currentPerms.filter(p => p !== mod.id)
                                    };
                                  });
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-slate-800">
                          <Button variant="ghost" className="flex-1 bg-slate-800 py-1.5 text-xs font-bold" onClick={() => setEditingUser(null)}>Cancelar</Button>
                          <Button type="submit" variant="primary" className="flex-1 py-1.5 text-xs font-bold" disabled={processingId === 'editing-staff-save'}>
                            {processingId === 'editing-staff-save' ? 'Guardando...' : 'Guardar'}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-3 pr-8">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 text-white font-black flex items-center justify-center text-lg shrink-0">{(user.name || '').charAt(0)}</div>
                            <div className="flex-1 min-w-0 text-left">
                              <h3 className="font-bold text-white text-base md:text-lg truncate leading-snug">{user.name}</h3>
                              <div className="flex gap-1 items-center mt-0.5">
                                <span className="text-[9px] md:text-[10px] bg-slate-900 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700 uppercase font-bold inline-block">{user.role}</span>
                                {user.status === 'INACTIVO' && (
                                  <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-1 rounded uppercase font-black tracking-wider">BLOQUEADO</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {currentUser.role === ROLES.ADMIN && (
                            <button 
                               type="button" 
                               onClick={() => requestConfirm(`¿Eliminar definitivamente a ${user.name} de la plataforma?`, () => handleDeleteUser(user.email))}
                               disabled={processingId === user.email}
                               className="absolute top-3 right-3 text-slate-500 hover:text-red-500 transition-colors p-1 bg-slate-900/50 border border-slate-800 hover:border-red-500/30 rounded z-10"
                               title="Eliminar Integrante"
                             >
                               {processingId === user.email ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={15} />}
                             </button>
                          )}
                        </div>

                        <div className="space-y-1.5 mb-4 text-xs text-slate-300 text-left">
                          <p className="flex items-center gap-2"><Phone size={12} className="text-slate-500 shrink-0"/> <span className="truncate">{user.phone}</span></p>
                          <p className="flex items-center gap-2"><Mail size={12} className="text-slate-500 shrink-0"/> <span className="truncate">{user.email}</span></p>
                          {currentUser.role === ROLES.ADMIN && user.permisos && user.permisos.length > 0 && (
                            <div className="pt-1.5 border-t border-slate-800/60 mt-1.5">
                              <span className="text-[8px] uppercase font-bold text-slate-500 block mb-1">Permisos Especiales</span>
                              <div className="flex flex-wrap gap-1 max-h-[40px] overflow-y-auto custom-scrollbar">
                                {user.permisos.map(p => <span key={p} className="text-[7.5px] tracking-widest font-light bg-slate-950/80 text-emerald-400 border border-emerald-500/10 px-1.5 py-0.5 rounded-full uppercase">{p}</span>)}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-row gap-2 mt-auto border-t border-slate-700 pt-3">
                          {currentUser.role === ROLES.ADMIN ? (
                            <>
                              <Button variant="secondary" className="flex-1 py-1.5 text-xs font-bold" icon={Edit3} onClick={() => setEditingUser({ ...user, permisos: user.permisos || [] })}>Editar</Button>
                              <Button variant="primary" className="flex-1 py-1.5 text-xs font-bold" icon={MessageSquare} onClick={() => openWhatsApp(user.phone)}>WhatsApp</Button>
                            </>
                          ) : (
                            <>
                              <Button variant="ghost" className="flex-1 bg-slate-900 border border-slate-700 py-1.5 text-xs" icon={Mail} onClick={() => openEmail(user.email)}>Correo</Button>
                              <Button variant="primary" className="flex-1 py-1.5 text-xs" icon={MessageSquare} onClick={() => openWhatsApp(user.phone)}>WhatsApp</Button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </Card>
                ))}
                {localDirectory.length === 0 && ( <div className="col-span-full text-center p-8 border border-slate-800 border-dashed rounded-xl text-slate-500 text-sm">No se encontraron contactos.</div> )}
              </div>
            </>
          )}

          {activeSubTab === 'PENDIENTES' && (
            <div className="space-y-3">
              {pendingUsers.length === 0 ? (
                <div className="text-center p-8 border border-slate-800 border-dashed rounded-xl text-slate-500 text-sm">
                  No hay solicitudes pendientes.
                </div>
              ) : (
                pendingUsers.map(u => (
                  <Card key={u.email} className="p-4 border-l-4 border-l-amber-500 text-left bg-slate-900">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          {u.name} 
                          <span className="bg-amber-500/20 text-amber-400 text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-wider">
                            PENDIENTE
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">{u.email} • {u.phone}</p>
                        <p className="text-[10px] text-emerald-400 font-bold mt-1 uppercase">Rol Solicitado: {u.role}</p>
                      </div>
                      <div className="flex flex-row gap-2 shrink-0 mt-2 md:mt-0">
                        <Button 
                          variant="danger" 
                          icon={X} 
                          className="flex-1 py-1.5" 
                          disabled={processingId === u.email} 
                          onClick={() => requestConfirm("¿Rechazar esta solicitud?", () => handleReject(u.email))}
                        >
                          {processingId === u.email ? '...' : 'Rechazar'}
                        </Button>
                        <Button 
                          variant="primary" 
                          icon={Key} 
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 border-emerald-500" 
                          disabled={processingId === u.email} 
                          onClick={() => handleApprove(u.email)}
                        >
                          {processingId === u.email ? '...' : 'Aprobar'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeSubTab === 'ROLES_CONFIG' && (
            <RoleConfigView currentUser={currentUser} showToast={showToast} />
          )}

          {activeSubTab === 'INVITAR' && (
            <Card className="max-w-xl mx-auto p-4 md:p-6 border-t-4 border-emerald-500 text-left bg-slate-900">
              <h2 className="text-lg md:text-xl font-bold text-white mb-3 flex items-center gap-2">
                <UserPlus className="text-emerald-500" size={20} /> Crear Acceso Directo a Staff
              </h2>
              <form onSubmit={handleDirectInvite} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Nombre Completo</label>
                  <input 
                    type="text" 
                    value={invName} 
                    onChange={e => setInvName(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg text-white outline-none focus:border-emerald-500" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Correo</label>
                    <input 
                      type="email" 
                      value={invEmail} 
                      onChange={e => setInvEmail(e.target.value)} 
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg text-white outline-none focus:border-emerald-500" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Teléfono</label>
                    <div className="flex gap-1.5 w-full">
                      <select 
                        value={invPhoneCode} 
                        onChange={e => setInvPhoneCode(e.target.value)} 
                        className="w-[95px] shrink-0 bg-slate-955 border border-slate-700 rounded-lg !h-8 !px-1.5 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                      </select>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={invPhoneNumber} 
                        onChange={e => setInvPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))} 
                        className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded-lg text-white outline-none focus:border-emerald-500" 
                        placeholder="Ej. 912345678"
                        required 
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Rol</label>
                  <select 
                    value={invRole} 
                    onChange={e => setInvRole(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg text-white outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {Array.from(new Set(Object.values(ROLES))).map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full py-2.5 md:py-3 text-sm font-bold mt-2" 
                  disabled={processingId === 'inviting-staff'} 
                  icon={UserCheck}
                >
                  {processingId === 'inviting-staff' ? 'Generando...' : 'Crear y Enviar'}
                </Button>
              </form>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default StaffDirectory;
