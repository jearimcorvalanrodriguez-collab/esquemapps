import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, RefreshCw, Bell, Users, Shield, 
  UserPlus, AlertCircle, X, Key, Loader2, Edit3, 
  UserCheck, Save 
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { PianoLoader } from '../components/PianoLoader';
import { CACHE, apiFetch, clearCache } from '../utils/api';
import { ROLES } from '../utils/constants';

const RoleConfigView = ({ currentUser, showToast, MODULOS }) => {
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
    if (role === 'ADMIN') return ['DASHBOARD', 'PROJECTS_MANAGE', 'PROJECT_ASSIGN', 'PROJECT_STATUS', 'RIDERS', 'RIDERS_MANAGE', 'TRANSPORT', 'TRANSPORT_CREATE', 'TRANSPORT_EDIT', 'HITOS', 'HITOS_MANAGE', 'CHAT', 'CHAT_SEND', 'STAFF', 'ADMIN_PANEL', 'EXPENSES', 'EXPENSES_MANAGE'];
    if (role === 'MANAGER') return ['DASHBOARD', 'PROJECTS_MANAGE', 'PROJECT_ASSIGN', 'PROJECT_STATUS', 'RIDERS', 'RIDERS_MANAGE', 'TRANSPORT', 'TRANSPORT_CREATE', 'TRANSPORT_EDIT', 'HITOS', 'HITOS_MANAGE', 'CHAT', 'CHAT_SEND', 'STAFF', 'EXPENSES', 'EXPENSES_MANAGE'];
    if (role === 'TOUR MANAGER') return ['DASHBOARD', 'PROJECTS_MANAGE', 'PROJECT_ASSIGN', 'PROJECT_STATUS', 'RIDERS', 'RIDERS_MANAGE', 'TRANSPORT', 'TRANSPORT_CREATE', 'TRANSPORT_EDIT', 'HITOS', 'HITOS_MANAGE', 'CHAT', 'CHAT_SEND', 'STAFF', 'EXPENSES'];
    if (role === 'JEFE CAT/APV') return ['DASHBOARD', 'RIDERS', 'RIDERS_MANAGE', 'TRANSPORT', 'TRANSPORT_CREATE', 'HITOS', 'HITOS_MANAGE', 'CHAT', 'CHAT_SEND', 'STAFF', 'EXPENSES'];
    if (role === 'TEC. JEFE') return ['DASHBOARD', 'RIDERS', 'RIDERS_MANAGE', 'TRANSPORT', 'TRANSPORT_CREATE', 'HITOS', 'HITOS_MANAGE', 'CHAT', 'CHAT_SEND', 'STAFF'];
    if (role === 'APV/CATERING') return ['DASHBOARD', 'RIDERS', 'TRANSPORT', 'HITOS', 'CHAT', 'CHAT_SEND', 'STAFF'];
    if (role === 'TRASLADO') return ['TRANSPORT', 'TRANSPORT_CREATE', 'CHAT', 'CHAT_SEND', 'STAFF'];
    return ['DASHBOARD', 'RIDERS', 'TRANSPORT', 'HITOS', 'CHAT', 'STAFF'];
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
    <Card className="max-w-xl mx-auto p-4 md:p-6 border-t-4 border-blue-500 text-left">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
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
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-blue-500"
          >
            {Object.values(ROLES).map(r => (
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
          className="w-full py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-500 border-blue-500/50 mt-2" 
          disabled={saving || loading}
        >
          {saving ? <Loader2 className="animate-spin mr-1.5" size={14}/> : <Save className="mr-1.5" size={14}/>} 
          Guardar Plantilla de {selectedRole}
        </Button>
      </div>
    </Card>
  );
};

export const AdminPanel = ({ currentUser, showToast, requestConfirm, refreshPendingCount }) => {
  const [dbUsers, setDbUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [activeTab, setActiveTab] = useState('PENDIENTES');
  const [processingId, setProcessingId] = useState(null);
  
  const [invName, setInvName] = useState('');
  const [invEmail, setInvEmail] = useState('');
  const [invPhone, setInvPhone] = useState('+569');
  const [invRole, setInvRole] = useState(ROLES.TECH);
  const [editingUser, setEditingUser] = useState(null);

  const MODULOS = [
    { id: 'DASHBOARD', label: 'Ver Proyectos' },
    { id: 'PROJECTS_MANAGE', label: 'Gestionar Proyectos' },
    { id: 'RIDERS', label: 'Ver Riders' },
    { id: 'RIDERS_MANAGE', label: 'Gestionar Riders' },
    { id: 'TRANSPORT', label: 'Ver Transportes' },
    { id: 'TRANSPORT_CREATE', label: 'Crear Rutas de Transporte' },
    { id: 'TRANSPORT_EDIT', label: 'Editar Rutas y Choferes' },
    { id: 'HITOS', label: 'Ver Timing (Hitos)' },
    { id: 'HITOS_MANAGE', label: 'Gestionar Timing (Hitos)' },
    { id: 'CHAT', label: 'Ver Anuncios (Chat)' },
    { id: 'CHAT_SEND', label: 'Enviar Anuncios (Chat)' },
    { id: 'STAFF', label: 'Ver Directorio' },
    { id: 'ADMIN_PANEL', label: 'Acceso Admin Panel' },
    { id: 'EXPENSES', label: 'Ver Gastos y Registrar Boletas' },
    { id: 'EXPENSES_MANAGE', label: 'Gestionar Presupuestos (Admin/Manager)' }
  ];

  const fetchUsers = async (force = false) => {
    setLoading(true); setFetchError(false);
    if (!force && CACHE.usuarios) {
      setDbUsers(CACHE.usuarios.filter(u => u.name));
      setLoading(false);
      return;
    }
    try {
      const res = await apiFetch('getUsuarios');
      if (res.status === 'success') {
         CACHE.usuarios = res.data;
         setDbUsers(res.data.filter(u => u.name));
      }
    } catch(e) { setFetchError(true); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

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
        setDbUsers(prev => prev.map(u => u.email === email ? { ...u, status: 'ACTIVO' } : u));
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
        setDbUsers(prev => prev.filter(u => u.email !== email));
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
        showToast("Usuario eliminado y notificado."); 
        clearCache('usuarios');
        setDbUsers(prev => prev.filter(u => u.email !== email));
        if (refreshPendingCount) refreshPendingCount();
      } 
      else { showToast("Error: " + res.message); }
    } catch(e) { showToast("Error de conexión al eliminar."); }
    setProcessingId(null);
  };

  const handleDirectInvite = async (e) => {
    e.preventDefault(); setProcessingId('inviting');
    try {
      const resSolicitud = await apiFetch('solicitarAcceso', { name: invName, email: invEmail, phone: invPhone, role: invRole });
      if(resSolicitud.status === 'success') {
        const resAprob = await apiFetch('aprobarUsuario', { email: invEmail });
        if(resAprob.status === 'success') {
          const tempPass = resAprob.tempPass;
          if (tempPass) {
            alert(`¡Usuario Creado con Éxito!\n\nNombre: ${invName}\nRol: ${invRole}\nToken de Acceso: ${tempPass}\n\nPor favor, copia este token y envíaselo al artista.`);
          } else {
            showToast(`Acceso creado. Credenciales enviadas a ${invEmail}`);
          }
          setInvName(''); setInvEmail(''); setActiveTab('DIRECTORIO'); 
          clearCache('usuarios');
          fetchUsers(true);
          if (refreshPendingCount) refreshPendingCount();
        }
      }
    } catch(e) { showToast("Error al invitar integrante."); }
    setProcessingId(null);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setProcessingId('editing');
    try {
      const res = await apiFetch('updateUserAdmin', editingUser);
      if (res.status === 'success') {
        showToast("Perfil de usuario actualizado."); 
        clearCache('usuarios');
        setDbUsers(prev => prev.map(u => u.email === editingUser.email ? editingUser : u));
        
        if (res.ceded) {
          showToast("ℹ️ Has transferido el rol de Administrador Único. Tu cuenta ha sido cambiada al rol de Manager. Recargando...");
          setTimeout(() => {
            window.location.reload();
          }, 3000);
          return;
        }

        // Si el admin se edita a sí mismo, actualizar la sesión actual en vivo
        if (currentUser.email === editingUser.email) {
          currentUser.permisos = editingUser.permisos;
          currentUser.role = editingUser.role;
          currentUser.status = editingUser.status;
        }

        setEditingUser(null);
      } else {
        showToast("Error al guardar: " + res.message);
      }
    } catch(err) {
      showToast("Error de conexión al guardar cambios.");
    }
    setProcessingId(null);
  };

  const pendingUsers = dbUsers.filter(u => u.status === 'PENDING');
  const activeUsers = dbUsers.filter(u => u.status === 'ACTIVO' || u.status === 'INACTIVO');

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 pb-24 animate-fade-in">
      <header className="border-b border-slate-800 pb-3 md:pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2 md:gap-3"><ShieldCheck className="text-emerald-500" size={24} /> Admin Panel</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">Gestión global de accesos, roles y perfiles.</p>
        </div>
        <Button variant="ghost" icon={RefreshCw} onClick={() => fetchUsers(true)} className="px-2 py-1.5 border border-slate-700 hover:text-emerald-400" title="Actualizar Solicitudes" />
      </header>

      {pendingUsers.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-pulse">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-500 shrink-0"><Bell size={20} /></div>
            <div>
              <h3 className="text-sm font-bold text-white">Solicitudes de Acceso Pendientes</h3>
              <p className="text-xs text-slate-400 font-medium">Hay {pendingUsers.length} solicitudes de técnicos o miembros del crew esperando aprobación.</p>
            </div>
          </div>
          <Button variant="primary" className="bg-amber-600 hover:bg-amber-500 text-white border-amber-500/50 py-1.5 px-3.5 self-end sm:self-center text-xs" onClick={() => setActiveTab('PENDIENTES')}>Revisar Ahora</Button>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <Button variant={activeTab === 'PENDIENTES' ? 'primary' : 'secondary'} onClick={() => { setActiveTab('PENDIENTES'); }} icon={Bell}>Solicitudes ({pendingUsers.length})</Button>
        <Button variant={activeTab === 'DIRECTORIO' ? 'primary' : 'secondary'} onClick={() => { setActiveTab('DIRECTORIO'); }} icon={Users}>Directorio</Button>
        <Button variant={activeTab === 'ROLES_CONFIG' ? 'primary' : 'secondary'} onClick={() => { setActiveTab('ROLES_CONFIG'); }} icon={Shield}>Definición de Roles</Button>
        <Button variant={activeTab === 'INVITAR' ? 'primary' : 'secondary'} onClick={() => { setActiveTab('INVITAR'); }} icon={UserPlus}>Invitar Staff</Button>
      </div>
      
      {fetchError ? (
        <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl text-red-400 flex items-center gap-2 text-sm"><AlertCircle size={18} /> Error al cargar la data.</div>
      ) : loading && dbUsers.length === 0 ? ( 
        <div className="flex justify-center p-8"><PianoLoader size={40} /></div> 
      ) : (
        <>
          {activeTab === 'PENDIENTES' && (
            <div className="space-y-3">
              {pendingUsers.length === 0 ? <div className="text-center p-8 border border-slate-800 border-dashed rounded-xl text-slate-500 text-sm">No hay solicitudes pendientes.</div> : pendingUsers.map(u => (
                <Card key={u.email} className="p-4 border-l-4 border-l-amber-500">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                    <div><h3 className="text-base font-bold text-white flex items-center gap-2">{u.name} <span className="bg-amber-500/20 text-amber-400 text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-wider">PENDIENTE</span></h3><p className="text-xs text-slate-400 mt-0.5">{u.email} • {u.phone}</p><p className="text-[10px] text-emerald-400 font-bold mt-1 uppercase">Rol: {u.role}</p></div>
                    <div className="flex flex-row gap-2 shrink-0 mt-2 md:mt-0"><Button variant="danger" icon={X} className="flex-1 py-1.5" disabled={processingId === u.email} onClick={() => requestConfirm("¿Rechazar esta solicitud?", () => handleReject(u.email))}>{processingId === u.email ? '...' : 'Rechazar'}</Button><Button variant="primary" icon={Key} className="flex-1 py-1.5" disabled={processingId === u.email} onClick={() => handleApprove(u.email)}>{processingId === u.email ? '...' : 'Aprobar'}</Button></div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {activeTab === 'DIRECTORIO' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {activeUsers.map(u => (
                <Card key={u.email} className={`p-4 flex flex-col ${u.status === 'INACTIVO' ? 'opacity-50 grayscale' : ''}`}>
                  {editingUser?.email === u.email ? (
                    <form onSubmit={handleEditSave} className="space-y-2 animate-fade-in">
                      <h4 className="text-xs font-bold text-emerald-400 border-b border-slate-700 pb-1.5">Editar a {u.name}</h4>
                      <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-emerald-500" value={editingUser.name} onChange={e=>setEditingUser({...editingUser, name: e.target.value})} />
                      <div className="grid grid-cols-2 gap-2"><input type="tel" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-emerald-500" value={editingUser.phone} onChange={e=>setEditingUser({...editingUser, phone: e.target.value.replace(/[^0-9+]/g, '')})} /><select className="w-full max-w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-emerald-500 break-words" value={editingUser.role} onChange={(e) => {
                        const newRole = e.target.value;
                        if (newRole === 'ADMIN') {
                          requestConfirm(
                            `⚠️ ATENCIÓN: Al cambiar a ${editingUser.name} a ADMINISTRADOR, estarás cediendo tu rol de Administrador Único. Tu cuenta pasará a ser MANAGER para mantener un solo administrador. ¿Confirmas la transferencia?`,
                            () => setEditingUser(prev => ({ ...prev, role: 'ADMIN' }))
                          );
                        } else {
                          setEditingUser(prev => ({ ...prev, role: newRole }));
                        }
                      }}>{Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                      <select className="w-full max-w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-bold outline-none focus:border-emerald-500 break-words" value={editingUser.status} onChange={e=>setEditingUser({...editingUser, status: e.target.value})}><option value="ACTIVO">ACTIVO</option><option value="INACTIVO">BLOQUEADO</option></select>
                      
                      <div className="pt-2 mt-2 border-t border-slate-700">
                          <h4 className="text-[10px] uppercase text-slate-400 font-bold mb-3">Privilegios Detallados</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

                      <div className="flex flex-row gap-2 mt-2"><Button variant="ghost" className="flex-1 bg-slate-800 py-1.5" onClick={() => setEditingUser(null)}>Cancelar</Button><Button type="submit" variant="primary" className="flex-1 py-1.5" disabled={processingId === 'editing'}>{processingId === 'editing' ? '...' : 'Guardar'}</Button></div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 text-white font-black flex items-center justify-center text-base shrink-0">{u.name?.charAt(0) || '?'}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white text-base truncate">{u.name}</h3>
                          <span className="text-[9px] bg-slate-900 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700 uppercase font-bold inline-block mt-0.5">{u.role}</span>
                        </div>
                        {u.status === 'INACTIVO' && <span className="text-[9px] text-red-500 font-bold border border-red-500/50 px-1.5 py-0.5 rounded mr-2">BLOCK</span>}
                        <button onClick={() => requestConfirm(`¿Eliminar definitivamente a ${u.name} de la plataforma?`, () => handleDeleteUser(u.email))} disabled={processingId === u.email} className="text-slate-500 hover:text-red-500 transition-colors p-1" title="Eliminar Usuario">
                          {processingId === u.email ? <Loader2 size={18} className="animate-spin" /> : <X size={18} />}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(u.permisos || []).map(p => <span key={p} className="text-[8px] bg-slate-900 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded uppercase">{p}</span>)}
                      </div>
                      <div className="mt-auto pt-3 border-t border-slate-700/50 flex flex-row gap-2">
                        <Button variant="secondary" className="flex-1 py-1.5" icon={Edit3} onClick={() => setEditingUser(u)}>Editar Perfil y Accesos</Button>
                      </div>
                    </>
                  )}
                </Card>
              ))}
            </div>
          )}
          {activeTab === 'INVITAR' && (
            <Card className="max-w-xl mx-auto p-4 md:p-6 border-t-4 border-emerald-500">
              <h2 className="text-lg md:text-xl font-bold text-white mb-3">Crear Acceso Directo</h2>
              <form onSubmit={handleDirectInvite} className="space-y-3">
                <div><label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Nombre Completo</label><input type="text" value={invName} onChange={e=>setInvName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500" required /></div>
                <div className="grid grid-cols-2 gap-2"><div><label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Correo</label><input type="email" value={invEmail} onChange={e=>setInvEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500" required /></div><div><label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Teléfono</label><input type="tel" value={invPhone} onChange={e=>setInvPhone(e.target.value.replace(/[^0-9+]/g, ''))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500" required /></div></div>
                <div><label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Rol</label><select value={invRole} onChange={e=>setInvRole(e.target.value)} className="w-full max-w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500 break-words">{Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                <Button type="submit" variant="primary" className="w-full py-2.5 md:py-3 text-sm md:text-base mt-2" disabled={processingId === 'inviting'} icon={UserCheck}>{processingId === 'inviting' ? 'Generando...' : 'Crear y Enviar'}</Button>
              </form>
            </Card>
          )}
          {activeTab === 'ROLES_CONFIG' && (
            <RoleConfigView currentUser={currentUser} showToast={showToast} MODULOS={MODULOS} />
          )}
        </>
      )}
    </div>
  );
};
export default AdminPanel;
