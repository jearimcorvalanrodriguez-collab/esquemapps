import React, { useState } from 'react';
import { User, Shield, Key, EyeOff, Eye, Loader2, LogOut } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { apiFetch, clearCache } from '../utils/api';
import { COUNTRY_CODES, parsePhone } from '../utils/phoneHelper';

export const ProfileView = ({ currentUser, setCurrentUser, showToast, requestConfirm }) => {
  const parsed = parsePhone(currentUser.phone);
  const [pPhoneCode, setPTPhoneCode] = useState(parsed.code);
  const [pPhoneNumber, setPTPhoneNumber] = useState(parsed.number);
  const [pDieta, setPDieta] = useState(currentUser.dieta || 'OMNÍVORA');
  
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [saving, setSaving] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if ((newPass || confirmPass || oldPass) && !(newPass && confirmPass && oldPass)) {
      return showToast("Para cambiar la contraseña, debes llenar los 3 campos de clave.");
    }
    if (newPass && newPass !== confirmPass) return showToast("Las nuevas contraseñas no coinciden.");

    setSaving(true);
    try {
      const fullPhone = `${pPhoneCode}${pPhoneNumber}`.trim();
      const payload = { email: currentUser.email.trim(), phone: fullPhone, dieta: pDieta };
      if (newPass && oldPass) { payload.oldPassword = oldPass.trim(); payload.newPassword = newPass.trim(); }
      const res = await apiFetch('updateProfile', payload);
      if (res.status === 'success') {
        setCurrentUser({ ...currentUser, phone: fullPhone, dieta: pDieta });
        setOldPass(''); setNewPass(''); setConfirmPass('');
        showToast(newPass ? "¡Perfil y Contraseña actualizados!" : "¡Perfil actualizado!");
        clearCache('usuarios');
      } else { showToast(res.message); }
    } catch (err) { 
      console.error(err);
      showToast("Error al guardar."); 
    }
    setSaving(false);
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in pb-24">
      <header className="mb-4 md:mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2 md:gap-3">
          <User className="text-emerald-500" size={24}/> Mi Perfil
        </h1>
      </header>
      <Card className="p-4 md:p-6">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="pb-3 border-b border-slate-700">
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Nombre</label>
            <input type="text" value={currentUser.name} disabled className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-500 text-sm cursor-not-allowed" />
          </div>
          <div className="pb-3 border-b border-slate-800">
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Teléfono</label>
            <div className="flex gap-1.5 max-w-md">
              <select 
                value={pPhoneCode} 
                onChange={e => setPTPhoneCode(e.target.value)} 
                className="w-[105px] shrink-0 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500 cursor-pointer"
              >
                {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
              <input 
                type="text" 
                inputMode="numeric"
                pattern="[0-9]*"
                value={pPhoneNumber} 
                onChange={e => setPTPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))} 
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500" 
                placeholder="Ej. 912345678"
                required 
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Preferencia Alimentación</label>
            <select value={pDieta} onChange={e=>setPDieta(e.target.value)} className="w-full max-w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none focus:border-emerald-500 break-words whitespace-normal cursor-pointer">
              <option value="OMNÍVORA">Omnívora (Estándar)</option><option value="VEGETARIANA">Vegetariana</option><option value="VEGANA">Vegana</option><option value="CRUDÍVORA">Crudívora</option><option value="FLEXITARIANA">Flexitariana</option><option value="SIN GLUTEN">Sin Gluten</option><option value="BAJA EN FODMAP">Baja en FODMAP</option><option value="HIPOSÓDICA">Hiposódica</option><option value="DIABÉTICA">Diabética</option><option value="KETO">Keto</option><option value="MEDITERRÁNEA">Mediterránea</option>
            </select>
          </div>
          

          <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-2.5 flex gap-2.5 items-start mt-1">
            <Shield size={14} className="text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed font-bold">Datos usados solo para logística de producción.</p>
          </div>
          <div className="pt-3 border-t border-slate-700 mt-3 space-y-2.5">
            <h3 className="text-xs md:text-sm font-bold text-emerald-400 flex items-center gap-1.5"><Key size={14}/> Cambiar Contraseña (Opcional)</h3>
            
            <div className="relative">
              <input type={showOldPass ? "text" : "password"} placeholder="Contraseña Actual" value={oldPass} onChange={e=>setOldPass(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 pr-10 text-white text-sm outline-none focus:border-emerald-500" />
              <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">{showOldPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
            </div>
            
            <div className="relative">
              <input type={showNewPass ? "text" : "password"} placeholder="Nueva Contraseña" value={newPass} onChange={e=>setNewPass(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 pr-10 text-white text-sm outline-none focus:border-emerald-500" />
              <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">{showNewPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
            </div>
            
            <div className="relative">
              <input type={showConfirmPass ? "text" : "password"} placeholder="Confirmar Nueva Contraseña" value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} className={`w-full bg-slate-900 border rounded-lg p-2.5 pr-10 text-white text-sm outline-none ${confirmPass && newPass !== confirmPass ? 'border-red-500' : 'border-slate-700 focus:border-emerald-500'}`} />
              <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">{showConfirmPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
            </div>

            {confirmPass && newPass !== confirmPass && <p className="text-[10px] text-red-500 font-bold">Las contraseñas no coinciden</p>}
          </div>
          <Button type="submit" variant="primary" className="w-full py-3 mt-4" disabled={saving || (confirmPass && newPass !== confirmPass)}>{saving ? <Loader2 className="animate-spin"/> : 'Guardar Cambios'}</Button>
        </form>
        <div className="pt-4 border-t border-slate-700 mt-4">
          <Button variant="danger" className="w-full py-3 font-bold uppercase tracking-wider text-xs" icon={LogOut} onClick={() => requestConfirm("¿Cerrar sesión?", () => setCurrentUser(null))}>Cerrar Sesión</Button>
        </div>
      </Card>
    </div>
  );
};
export default ProfileView;
