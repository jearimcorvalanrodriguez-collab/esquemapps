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
    if (role === 'ADMIN') return ['DASHBOARD', 'PROJECTS_MANAGE', 'PROJECT_ASSIGN', 'PROJECT_STATUS', 'RIDERS', 'RIDERS_MANAGE', 'HITOS', 'HITOS_MANAGE', 'STAFF', 'ADMIN_PANEL', 'EXPENSES', 'EXPENSES_MANAGE'];
    if (role === 'MANAGER') return ['DASHBOARD', 'PROJECTS_MANAGE', 'PROJECT_ASSIGN', 'PROJECT_STATUS', 'RIDERS', 'RIDERS_MANAGE', 'HITOS', 'HITOS_MANAGE', 'STAFF', 'EXPENSES', 'EXPENSES_MANAGE'];
    if (role === 'TOUR MANAGER') return ['DASHBOARD', 'PROJECTS_MANAGE', 'PROJECT_ASSIGN', 'PROJECT_STATUS', 'RIDERS', 'RIDERS_MANAGE', 'HITOS', 'HITOS_MANAGE', 'STAFF', 'EXPENSES'];
    if (role === 'JEFE CAT/APV') return ['DASHBOARD', 'RIDERS', 'RIDERS_MANAGE', 'HITOS', 'HITOS_MANAGE', 'STAFF', 'EXPENSES'];
    if (role === 'TEC. JEFE') return ['DASHBOARD', 'RIDERS', 'RIDERS_MANAGE', 'HITOS', 'HITOS_MANAGE', 'STAFF'];
    if (role === 'APV/CATERING') return ['DASHBOARD', 'RIDERS', 'HITOS', 'STAFF'];
    if (role === 'TRASLADO') return ['STAFF'];
    return ['DASHBOARD', 'RIDERS', 'HITOS', 'STAFF'];
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
  const [allArtists, setAllArtists] = useState([]);
  const [editingArtist, setEditingArtist] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);

  // Formulario Artista
  const [musName, setMusName] = useState('');
  const [musEmail, setMusEmail] = useState('');
  const [musPhone, setMusPhone] = useState('+569');
  const [musSubRole, setMusSubRole] = useState('Voz Principal');
  const [createdArtist, setCreatedArtist] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [assignToProject, setAssignToProject] = useState(false);
  const [inviteProjectId, setInviteProjectId] = useState('');

  // Formulario Direct Staff
  const [invName, setInvName] = useState('');
  const [invEmail, setInvEmail] = useState('');
  const [invPhone, setInvPhone] = useState('+569');
  const [invRole, setInvRole] = useState(ROLES.TECH);

  const MUSICIAN_SUBROLES = [
    'Voz Principal',
    'Baterista',
    'Bajista',
    'Guitarrista',
    'Pianista / Tecladista',
    'Percusionista',
    'Corista',
    'Vientos',
    'DJ / Sampler',
    'Director Musical'
  ];

  const handleMusicianInvite = async (e) => {
    e.preventDefault(); 
    setProcessingId('musician-inviting');
    try {
      const resSolicitud = await apiFetch('solicitarAcceso', { name: musName, email: musEmail, phone: musPhone, role: 'ARTISTA: ' + musSubRole });
      if(resSolicitud.status === 'success') {
        const resAprob = await apiFetch('aprobarUsuario', { email: musEmail });
        if(resAprob.status === 'success') {
          const tempPass = resAprob.tempPass;
          
          if (assignToProject && inviteProjectId) {
            const proj = (proyectos || []).find(p => String(p.id) === String(inviteProjectId));
            if (proj) {
              const currentAsignados = Array.isArray(proj.asignados) ? [...proj.asignados] : [];
              if (!currentAsignados.map(x => String(x).toLowerCase().trim()).includes(musEmail.toLowerCase().trim())) {
                currentAsignados.push(musEmail.trim());
                await apiFetch('updateProyectoAsignaciones', { id: proj.id, asignados: currentAsignados });
                clearCache('proyectos');
                fetchDirectory(true);
              }
            }
          }

          setCreatedArtist({
            name: musName,
            email: musEmail,
            phone: musPhone,
            tempPass: tempPass || 'Acceso ya existente o correo automático'
          });
          setMusName(''); setMusEmail(''); setMusPhone('+569'); 
          setAssignToProject(false);
          setInviteProjectId('');
          clearCache('usuarios');
          fetchDirectory(true);
          if (refreshPendingCount) refreshPendingCount();
        } else {
          if (showToast) showToast(`Error al aprobar artista: ${resAprob.message}`);
        }
      } else {
        if (showToast) showToast(`Error al crear solicitud de artista: ${resSolicitud.message}`);
      }
    } catch(e) { 
      if (showToast) showToast("Error al invitar músico."); 
    }
    setProcessingId(null);
  };

  const handleEditArtistSave = async (e) => {
    e.preventDefault();
    setProcessingId('editing-artist');
    try {
      const res = await apiFetch('updateUserAdmin', editingArtist);
      if (res.status === 'success') {
        if (showToast) showToast("Músico actualizado con éxito.");
        setEditingArtist(null);
        clearCache('usuarios');
        fetchDirectory(true);
      } else {
        if (showToast) showToast("Error: " + res.message);
      }
    } catch(e) {
      if (showToast) showToast("Error al guardar cambios.");
    }
    setProcessingId(null);
  };

  const handleDeleteArtist = async (email) => {
    setProcessingId(email);
    try {
      const res = await apiFetch('eliminarUsuario', { email });
      if (res.status === 'success') {
        if (showToast) showToast("Músico eliminado de la base de datos.");
        clearCache('usuarios');
        fetchDirectory(true);
      } else {
        if (showToast) showToast("Error: " + res.message);
      }
    } catch(e) {
      if (showToast) showToast("Error al conectar.");
    }
    setProcessingId(null);
  };

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
      const resSolicitud = await apiFetch('solicitarAcceso', { name: invName, email: invEmail, phone: invPhone, role: invRole });
      if(resSolicitud.status === 'success') {
        const resAprob = await apiFetch('aprobarUsuario', { email: invEmail });
        if(resAprob.status === 'success') {
          const tempPass = resAprob.tempPass;
          if (tempPass) {
            alert(`¡Usuario Creado con Éxito!\n\nNombre: ${invName}\nRol: ${invRole}\nToken de Acceso: ${tempPass}\n\nPor favor, copia este token y envíaselo al integrante.`);
          } else {
            showToast(`Acceso creado. Credenciales enviadas a ${invEmail}`);
          }
          setInvName(''); setInvEmail(''); setInvPhone('+569'); setInvRole(ROLES.TECH);
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
      const artists = users.filter(u => u.role && (u.role === 'ARTISTA' || u.role.startsWith('ARTISTA:')));
      setAllArtists(artists);
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
          <h1 className="text-2xl font-black text-white flex items-center gap-2 md:gap-3"><Users className="text-emerald-500" size={24} /> Directorio</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">{[ROLES.ADMIN, ROLES.MANAGER, ROLES.TOUR_MANAGER].includes(currentUser.role) ? 'Gestión de personal y accesos.' : 'Contactos asignados.'}</p>
        </div>
        <Button variant="ghost" icon={RefreshCw} onClick={() => fetchDirectory(true)} className="px-2 border border-slate-700 hover:text-emerald-400" title="Actualizar" />
      </header>

      {isAuthorizedToManageArtists && (
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar mb-4 border-b border-slate-850 print:hidden">
          <Button 
            variant={activeSubTab === 'STAFF_ACTIVO' ? 'primary' : 'secondary'} 
            onClick={() => { setActiveSubTab('STAFF_ACTIVO'); setEditingArtist(null); setEditingUser(null); }}
            icon={Users}
            className="py-1.5 px-3 text-xs shrink-0"
          >
            Directorio Staff
          </Button>
          <Button 
            variant={activeSubTab === 'ARTIST_GEST' ? 'primary' : 'secondary'} 
            onClick={() => { setActiveSubTab('ARTIST_GEST'); setEditingArtist(null); setEditingUser(null); }}
            icon={Music}
            className={`py-1.5 px-3 text-xs shrink-0 ${activeSubTab === 'ARTIST_GEST' ? 'bg-blue-600 border-blue-500 hover:bg-blue-500' : 'border-blue-500/30 text-blue-400 hover:bg-blue-600/10'}`}
          >
            ARTIST-GEST (Músicos)
          </Button>
          <Button 
            variant={activeSubTab === 'PENDIENTES' ? 'primary' : 'secondary'} 
            onClick={() => { setActiveSubTab('PENDIENTES'); setEditingArtist(null); setEditingUser(null); }}
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
            onClick={() => { setActiveSubTab('ROLES_CONFIG'); setEditingArtist(null); setEditingUser(null); }}
            icon={Shield}
            className="py-1.5 px-3 text-xs shrink-0"
          >
            Definición de Roles
          </Button>
          <Button 
            variant={activeSubTab === 'INVITAR' ? 'primary' : 'secondary'} 
            onClick={() => { setActiveSubTab('INVITAR'); setEditingArtist(null); setEditingUser(null); }}
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
                  <Card key={idx} className={`p-3 md:p-4 flex flex-col justify-between ${user.status === 'INACTIVO' ? 'opacity-55 border-red-500/25 bg-red-950/5' : 'border-slate-800'}`}>
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

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Teléfono</label>
                            <input 
                              type="tel" 
                              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white outline-none focus:border-emerald-500" 
                              value={editingUser.phone} 
                              onChange={e => setEditingUser({...editingUser, phone: e.target.value.replace(/[^0-9+]/g, '')})} 
                              required 
                            />
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
                              {Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}
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
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 text-white font-black flex items-center justify-center text-lg shrink-0">{user.name.charAt(0)}</div>
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
                              className="text-slate-500 hover:text-red-500 transition-colors p-1"
                              title="Eliminar Integrante"
                            >
                              {processingId === user.email ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
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
                                {user.permisos.map(p => <span key={p} className="text-[8px] bg-slate-950 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded uppercase">{p}</span>)}
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

          {activeSubTab === 'ARTIST_GEST' && (
            <div className="animate-fade-in text-slate-100 print:hidden">
              {showCreateForm ? (
                <Card className="max-w-xl mx-auto p-4 md:p-6 border-t-4 border-blue-500 bg-slate-900 text-left">
                  {createdArtist ? (
                    <div className="space-y-4 text-left animate-fade-in">
                      <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                        <CheckCircle2 className="text-emerald-500" size={24} />
                        <h2 className="text-base md:text-lg font-bold text-white">¡Músico / Artista Creado con Éxito!</h2>
                      </div>
                      
                      <p className="text-xs text-slate-400">La cuenta ha sido aprobada correctamente en el sistema. Puedes enviar la invitación al artista mediante los siguientes botones rápidos:</p>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2 text-xs font-mono">
                        <p className="text-slate-400"><span className="font-bold text-slate-500 uppercase tracking-wider block text-[9px] mb-0.5">Nombre:</span> <span className="text-white font-sans font-bold">{createdArtist.name}</span></p>
                        <p className="text-slate-400"><span className="font-bold text-slate-500 uppercase tracking-wider block text-[9px] mb-0.5">Correo:</span> <span className="text-white">{createdArtist.email}</span></p>
                        <p className="text-slate-400"><span className="font-bold text-slate-500 uppercase tracking-wider block text-[9px] mb-0.5">Contraseña Temporal:</span> <span className="text-emerald-400 font-bold tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{createdArtist.tempPass}</span></p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <a 
                          href={`https://wa.me/${createdArtist.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `¡Hola ${createdArtist.name}! Te hemos creado tu cuenta de acceso exclusivo para la aplicación de administración de repertorios y ensayos ARTIST-GEST.\n\nPara ingresar, haz clic en el siguiente enlace:\nhttps://jearimcorvalanrodriguez-collab.github.io/artist-gest/?email=${createdArtist.email}&tempPass=${createdArtist.tempPass}\n\nCorreo: ${createdArtist.email}\nContraseña Temporal: ${createdArtist.tempPass}\n\nPor favor, ingresa para aceptar los términos y establecer tu contraseña definitiva.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 md:py-2.5 rounded-lg text-center text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95 duration-100"
                        >
                          Invitar WhatsApp
                        </a>
                        <a 
                          href={`mailto:${createdArtist.email}?subject=Acceso%20Artist-Gest%20-%20Esquemas%20Pro&body=${encodeURIComponent(
                            `Hola ${createdArtist.name}!,\n\nTe hemos creado tu cuenta de acceso exclusivo para la aplicación de administración de repertorios y ensayos ARTIST-GEST.\n\nPara ingresar, haz clic en el siguiente enlace:\nhttps://jearimcorvalanrodriguez-collab.github.io/artist-gest/?email=${createdArtist.email}&tempPass=${createdArtist.tempPass}\n\nCredenciales de Acceso:\n- Correo: ${createdArtist.email}\n- Contraseña Temporal: ${createdArtist.tempPass}\n\nPor favor, actualiza tu contraseña en tu perfil al ingresar.\n\nSaludos,\nEquipo de Logística Esquemas Pro.`
                          )}`}
                          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 md:py-2.5 rounded-lg text-center text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95 duration-100"
                        >
                          Invitar Correo
                        </a>
                        <Button variant="ghost" className="bg-slate-800 text-xs font-bold py-2 md:py-2.5 shrink-0" onClick={() => setCreatedArtist(null)}>
                          Crear Otro
                        </Button>
                        <Button variant="secondary" className="text-xs font-bold py-2 md:py-2.5 shrink-0" onClick={() => { setCreatedArtist(null); setShowCreateForm(false); }}>
                          Volver al Listado
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <Music className="text-blue-500" size={20} />
                        <h2 className="text-base md:text-lg font-bold text-white">Registrar Acceso a Músico / Artista</h2>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">Registra a un artista o miembro de la banda directamente. Al crearlo, la cuenta quedará aprobada automáticamente y podrá ingresar a su panel <b>Artist-Gest</b> con su token temporal.</p>
                      
                      <form onSubmit={handleMusicianInvite} className="space-y-3.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Nombre Completo del Artista</label>
                          <input type="text" value={musName} onChange={e=>setMusName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-white outline-none focus:border-blue-500" placeholder="Ej. Juan Pérez" required />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Correo Electrónico</label>
                            <input type="email" value={musEmail} onChange={e=>setMusEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-white outline-none focus:border-blue-500" placeholder="artista@correo.com" required />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Teléfono Móvil</label>
                            <input type="tel" value={musPhone} onChange={e=>setMusPhone(e.target.value.replace(/[^0-9+]/g, ''))} className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-white outline-none focus:border-blue-500" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Rol Asignado</label>
                            <input type="text" value="ARTISTA" disabled className="w-full bg-slate-950 border border-slate-850 text-slate-500 rounded p-2.5 text-xs font-bold cursor-not-allowed" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Rol de Músico / Instrumento</label>
                            <select 
                              value={musSubRole} 
                              onChange={e => setMusSubRole(e.target.value)} 
                              className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
                            >
                              {MUSICIAN_SUBROLES.map(role => (
                                <option key={role} value={role}>{role}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Asignar a un proyecto */}
                        <div className="space-y-2 pt-1 border-t border-slate-850">
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              id="assignToProjectMus" 
                              checked={assignToProject} 
                              onChange={e => {
                                setAssignToProject(e.target.checked);
                                if (!e.target.checked) setInviteProjectId('');
                              }} 
                              className="accent-blue-500 rounded bg-slate-950 border-slate-800 w-3.5 h-3.5 cursor-pointer"
                            />
                            <label htmlFor="assignToProjectMus" className="text-[11px] text-slate-400 font-bold cursor-pointer uppercase select-none">
                              ¿Vincular a un proyecto técnico activo?
                            </label>
                          </div>

                          {assignToProject && (
                            <div className="animate-fadeIn">
                              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Seleccionar Proyecto Técnico</label>
                              <select
                                value={inviteProjectId}
                                onChange={e => setInviteProjectId(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
                                required
                              >
                                <option value="">-- Selecciona un Proyecto --</option>
                                {(proyectos || []).map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button variant="ghost" className="flex-1 bg-slate-800 py-2 text-xs" onClick={() => setShowCreateForm(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit" variant="primary" className="flex-[2] py-2 text-xs bg-blue-600 hover:bg-blue-500 border-blue-500" disabled={processingId === 'musician-inviting'} icon={Plus}>
                            {processingId === 'musician-inviting' ? 'Creando...' : 'Crear y Aprobar Artista'}
                          </Button>
                        </div>
                      </form>
                    </>
                  )}
                </Card>
              ) : editingArtist ? (
                <Card className="max-w-xl mx-auto p-4 md:p-6 border-t-4 border-blue-500 bg-slate-900 text-left">
                  <h2 className="text-base md:text-lg font-bold text-white mb-3">Editar Perfil de Músico</h2>
                  <form onSubmit={handleEditArtistSave} className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Nombre del Músico</label>
                      <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-white outline-none focus:border-blue-500" value={editingArtist.name} onChange={e=>setEditingArtist({...editingArtist, name: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Correo (No modificable)</label>
                        <input type="email" disabled className="w-full bg-slate-950 border border-slate-850 rounded p-2.5 text-xs text-slate-500 outline-none cursor-not-allowed font-mono" value={editingArtist.email} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Teléfono</label>
                        <input type="tel" className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-white outline-none focus:border-blue-500" value={editingArtist.phone} onChange={e=>setEditingArtist({...editingArtist, phone: e.target.value.replace(/[^0-9+]/g, '')})} required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Estado de la Cuenta</label>
                      <select className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-white outline-none focus:border-blue-500 cursor-pointer" value={editingArtist.status} onChange={e=>setEditingArtist({...editingArtist, status: e.target.value})}>
                        <option value="ACTIVO">ACTIVO (Acceso Permitido)</option>
                        <option value="INACTIVO">BLOQUEADO / INACTIVO (Acceso Denegado)</option>
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="ghost" className="flex-1 bg-slate-800 py-2 text-xs" onClick={() => setEditingArtist(null)}>Cancelar</Button>
                      <Button type="submit" variant="primary" className="flex-1 py-2 text-xs bg-blue-600 hover:bg-blue-500" disabled={processingId === 'editing-artist'}>
                        {processingId === 'editing-artist' ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                    </div>
                  </form>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5"><Music size={14} className="text-blue-400"/> Músicos Registrados</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Total de artistas con acceso a la app hermana ARTIST-GEST.</p>
                    </div>
                    <Button 
                      variant="primary" 
                      onClick={() => { setShowCreateForm(true); setCreatedArtist(null); }}
                      icon={Plus}
                      className="bg-blue-600 border-blue-500 hover:bg-blue-500 py-1.5 px-3 text-xs font-bold"
                    >
                      Registrar Nuevo Artista
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {allArtists.map((user, idx) => (
                      <Card key={idx} className={`p-3 md:p-4 flex flex-col justify-between ${user.status === 'INACTIVO' ? 'opacity-55 border-red-500/25 bg-red-950/5' : 'border-slate-800'}`}>
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-blue-900/30 text-blue-400 font-black flex items-center justify-center text-sm shrink-0"><Music size={14}/></div>
                              <div className="min-w-0 text-left">
                                <h3 className="font-bold text-white text-sm md:text-base truncate leading-snug">{user.name}</h3>
                                <span className={`text-[8px] px-1 rounded uppercase font-black tracking-wider border leading-none inline-block mt-0.5 ${
                                  user.status === 'ACTIVO' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                  {user.status === 'ACTIVO' ? 'ACTIVO' : 'BLOQUEADO'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1 mb-3.5 text-xs text-slate-300 text-left">
                            <p className="flex items-center gap-1.5 text-slate-400 font-mono truncate"><Mail size={11} className="text-slate-600 shrink-0"/> {user.email}</p>
                            <p className="flex items-center gap-1.5 text-slate-400"><Phone size={11} className="text-slate-600 shrink-0"/> {user.phone}</p>
                            <p className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-500 text-[9px] uppercase">Términos:</span> 
                              {user.acceptedTerms ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-0.5 text-[9px]">Aceptados <CheckCircle2 size={9} /></span>
                              ) : (
                                <span className="text-amber-500 font-bold flex items-center gap-0.5 text-[9px]">Pendientes <AlertCircle size={9} /></span>
                              )}
                            </p>
                          </div>

                          <div className="bg-slate-950/80 p-2.5 rounded border border-slate-900 text-left mb-3.5">
                            <span className="text-[8px] uppercase font-bold text-slate-500 block mb-1">Token de Primer Ingreso</span>
                            {user.tempPassToken ? (
                              <div className="flex items-center justify-between gap-2">
                                <code className="text-emerald-400 font-mono font-bold tracking-widest text-xs bg-emerald-500/5 px-1 py-0.5 rounded border border-emerald-500/10">{user.tempPassToken}</code>
                                <span className="text-[8px] font-bold text-amber-500 uppercase">Por Activar</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-medium">Contraseña ya configurada.</span>
                            )}
                          </div>
                        </div>

                        <div className="border-t border-slate-800/60 pt-3 flex flex-col gap-1.5 mt-auto">
                          <div className="flex gap-1.5">
                            <Button variant="secondary" className="flex-1 py-1 text-xs shrink-0 font-bold" icon={Edit3} onClick={() => setEditingArtist(user)}>Editar</Button>
                            <Button 
                              variant="ghost" 
                              className="p-1 px-2.5 text-red-500 hover:text-red-400 border border-red-500/20 hover:bg-red-500/10 rounded-lg text-xs" 
                              icon={Trash2} 
                              disabled={processingId === user.email}
                              onClick={() => requestConfirm(`¿Eliminar definitivamente al músico ${user.name}? Se borrará también de la base de datos de usuarios.`, () => handleDeleteArtist(user.email))}
                            >
                              {processingId === user.email ? '...' : ''}
                            </Button>
                          </div>

                          {user.tempPassToken && (
                            <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                              <a 
                                href={`https://wa.me/${user.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                  `¡Hola ${user.name}! Te hemos creado tu cuenta de acceso exclusivo para la aplicación de administración de repertorios y ensayos ARTIST-GEST.\n\nPara ingresar, haz clic en el siguiente enlace:\nhttps://jearimcorvalanrodriguez-collab.github.io/artist-gest/?email=${user.email}&tempPass=${user.tempPassToken}\n\nCorreo: ${user.email}\nContraseña Temporal: ${user.tempPassToken}\n\nPor favor, ingresa para aceptar los términos y establecer tu contraseña definitiva.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-emerald-600/10 border border-emerald-500/25 hover:bg-emerald-600/15 text-emerald-400 font-bold py-1.5 rounded text-center text-[9px] flex items-center justify-center gap-1 transition-colors"
                              >
                                WhatsApp Inv
                              </a>
                              <a 
                                href={`mailto:${user.email}?subject=Acceso%20Artist-Gest%20-%20Esquemas%20Pro&body=${encodeURIComponent(
                                  `Hola ${user.name}!,\n\nTe hemos creado tu cuenta de acceso exclusivo para la aplicación de administración de repertorios y ensayos ARTIST-GEST.\n\nPara ingresar, haz clic en el siguiente enlace:\nhttps://jearimcorvalanrodriguez-collab.github.io/artist-gest/?email=${user.email}&tempPass=${user.tempPassToken}\n\nCredenciales de Acceso:\n- Correo: ${user.email}\n- Contraseña Temporal: ${user.tempPassToken}\n\nPor favor, actualiza tu contraseña en tu perfil al ingresar.\n\nSaludos,\nEquipo de Logística Esquemas Pro.`
                                )}`}
                                className="bg-blue-600/10 border border-blue-500/25 hover:bg-blue-600/15 text-blue-400 font-bold py-1.5 rounded text-center text-[9px] flex items-center justify-center gap-1 transition-colors"
                              >
                                Correo Inv
                              </a>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                    {allArtists.length === 0 && (
                      <div className="col-span-full text-center p-8 border border-slate-800 border-dashed rounded-xl text-slate-500 text-sm">No se encontraron músicos registrados en el sistema.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500" 
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
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Teléfono</label>
                    <input 
                      type="tel" 
                      value={invPhone} 
                      onChange={e => setInvPhone(e.target.value.replace(/[^0-9+]/g, ''))} 
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500" 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Rol</label>
                  <select 
                    value={invRole} 
                    onChange={e => setInvRole(e.target.value)} 
                    className="w-full max-w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {Object.values(ROLES).map(r => (
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
