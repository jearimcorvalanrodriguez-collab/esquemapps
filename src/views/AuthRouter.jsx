import React, { useState, useEffect } from 'react';
import { Music, AlertCircle, EyeOff, Eye, Loader2, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ROLES } from '../utils/constants';
import { apiFetch } from '../utils/api';

export const AuthRouter = ({ setCurrentUser, setCurrentView, showToast }) => {
  const [mode, setMode] = useState('LOGIN'); 
  const [email, setEmail] = useState(''); 
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState(ROLES.TECH);
  const [regPhone, setRegPhone] = useState('+569');
  const [adminTempPass, setAdminTempPass] = useState('');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [tcAccepted, setTcAccepted] = useState(false);
  const [alreadyAcceptedTC, setAlreadyAcceptedTC] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const tempPassParam = params.get('tempPass');
    if (emailParam) setEmail(emailParam);
    if (tempPassParam) setPass(tempPassParam);
    if (emailParam && tempPassParam) {
      window.history.replaceState({}, document.title, window.location.pathname);
      showToast("Credenciales cargadas desde el enlace.");
    }
  }, []);

  const checkEmailTCStatus = async (emailToCheck) => {
    if (!emailToCheck || !emailToCheck.includes('@')) {
      setAlreadyAcceptedTC(false);
      return;
    }
    try {
      const res = await apiFetch('checkEmailTC', { email: emailToCheck });
      if (res.status === 'success' && res.accepted) {
        setAlreadyAcceptedTC(true);
        setDisclaimerAccepted(true);
        setTcAccepted(true);
      } else {
        setAlreadyAcceptedTC(false);
        setDisclaimerAccepted(false);
        setTcAccepted(false);
      }
    } catch(e) {
      setAlreadyAcceptedTC(false);
    }
  };

  useEffect(() => {
    setDisclaimerAccepted(false);
    setTcAccepted(false);
    setAlreadyAcceptedTC(false);
  }, [mode]);

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = await apiFetch('login', { email: email.trim(), password: pass.trim() });
      if (data.status === 'success') setCurrentUser(data.user); 
      else setError(data.message);
    } catch (err) { setError("Error de red conectando al servidor."); }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!disclaimerAccepted) {
      setError("Debes aceptar los términos y condiciones de tratamiento de datos.");
      return;
    }
    if (!tcAccepted) {
      setError("Debes aceptar los Términos y Condiciones y la Política de Privacidad.");
      return;
    }
    setError(''); setLoading(true);
    try {
      const result = await apiFetch('solicitarAcceso', { 
        name: regName.trim(), 
        email: email.trim(), 
        phone: regPhone.trim(), 
        role: regRole,
        disclaimerAceptado: true,
        tcVersion: 'v1.0'
      });
      if (result.status === 'success') { 
        if (result.isNewAdmin) {
          setAdminTempPass(result.tempPass);
          setMode('REGISTER_ADMIN_SUCCESS');
        } else {
          setMode('REGISTER_SUCCESS'); 
        }
      } 
      else setError(result.message);
    } catch (err) { setError('Error de red al enviar la solicitud.'); }
    setLoading(false);
  };

  const handleRecover = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const result = await apiFetch('recuperarClave', { email: email.trim() }); // Note: 'recuperarClave' is the backend action name in Codigo_GS.js
      if (result.status === 'success') {
        showToast("Clave temporal enviada a tu correo.");
        setMode('LOGIN');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Error de red al intentar recuperar contraseña.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="mb-6 text-center animate-fade-in">
        <Music className="text-emerald-500 mx-auto mb-3" size={40} />
        <h1 className="text-3xl font-black text-white tracking-wider">ESQUEMAPPS</h1>
        <p className="text-slate-400 mt-1 tracking-widest text-xs uppercase font-bold">Production Management</p>
      </div>
      <Card className="w-full max-w-md p-6 animate-slide-up border-slate-700/50">
        {mode !== 'REGISTER_SUCCESS' && (
          <div className="mb-4 text-center border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white">{mode === 'LOGIN' ? 'Iniciar Sesión' : mode === 'RECOVER' ? 'Recuperar Contraseña' : 'Solicitar Acceso'}</h2>
          </div>
        )}
        
        {mode === 'LOGIN' && (
          <form onSubmit={handleLogin} className="space-y-4">
             {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-2.5 rounded-lg flex items-center gap-2"><AlertCircle size={14} /><span>{error}</span></div>}
            <div><label className="block text-xs font-bold text-slate-400 mb-1">Correo Electrónico</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none transition-colors" required /></div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Contraseña</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={pass} onChange={e=>setPass(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 pr-10 text-white text-sm focus:border-emerald-500 outline-none transition-colors" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="text-right mt-1">
                <button type="button" onClick={() => setMode('RECOVER')} className="text-[10px] text-emerald-500 hover:underline">¿Olvidaste tu contraseña?</button>
              </div>
            </div>
            <Button type="submit" className="w-full py-2.5" disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : 'Ingresar a Plataforma'}</Button>
            <div className="border-t border-slate-800 pt-3 mt-3">
              <p className="text-center text-xs text-slate-400">¿No eres parte del Crew aún? <button type="button" onClick={()=>setMode('REGISTER')} className="text-emerald-500 font-bold hover:underline">Solicitar Acceso</button></p>
            </div>
          </form>
        )}

        {mode === 'RECOVER' && (
          <form onSubmit={handleRecover} className="space-y-4 animate-fade-in">
            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-2.5 rounded-lg flex items-center gap-2"><AlertCircle size={14} /><span>{error}</span></div>}
            <p className="text-xs text-slate-400 text-center">Ingresa tu correo para recibir una nueva clave de acceso temporal por email.</p>
            <div><label className="block text-xs font-bold text-slate-400 mb-1">Correo Electrónico</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none transition-colors" required /></div>
            <Button type="submit" className="w-full py-2.5" disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : 'Enviar Clave Temporal'}</Button>
            <p className="text-center text-xs text-slate-400 mt-3"><button type="button" onClick={()=>setMode('LOGIN')} className="text-emerald-500 font-bold hover:underline">Volver al Login</button></p>
          </form>
        )}

        {mode === 'REGISTER' && (
          <form onSubmit={handleRegister} className="space-y-3">
            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-2.5 rounded-lg flex items-center gap-2"><AlertCircle size={14} /><span>{error}</span></div>}
            <div><label className="block text-xs font-bold text-slate-400 mb-1">Nombre Completo</label><input type="text" value={regName} onChange={e=>setRegName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none" required /></div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Correo</label>
                <input type="email" value={email} onChange={e=>{ setEmail(e.target.value); checkEmailTCStatus(e.target.value); }} onBlur={e => checkEmailTCStatus(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Teléfono</label>
                <input type="tel" value={regPhone} onChange={e=>setRegPhone(e.target.value.replace(/[^0-9+]/g, ''))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Rol</label>
              <select value={regRole} onChange={e=>setRegRole(e.target.value)} className="w-full max-w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-emerald-500 outline-none break-words whitespace-normal">
                {Object.values(ROLES).filter(r => r !== ROLES.ADMIN).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {!alreadyAcceptedTC && (
               <div className="space-y-2 pt-1 text-left">
                 <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-[10px] text-slate-400 max-h-20 overflow-y-auto custom-scrollbar leading-relaxed">
                   <p className="font-bold text-slate-300 mb-0.5">AVISO DE TRATAMIENTO DE DATOS</p>
                   Al solicitar acceso, aceptas que recopilamos tu nombre, correo, teléfono (para contacto/WhatsApp), talla de vestimenta (para uniformes/merch) y restricciones alimenticias (para catering). Estos datos se usarán solo para fines operativos y se conservarán mientras existan la app y web app.
                 </div>
                 <label className="flex items-start gap-2 text-[11px] text-slate-300 cursor-pointer select-none">
                   <input type="checkbox" required checked={disclaimerAccepted} onChange={e => setDisclaimerAccepted(e.target.checked)} className="accent-emerald-500 rounded bg-slate-900 border-slate-700 mt-0.5" />
                   <span>Acepto el tratamiento de mis datos personales y sensibles.</span>
                 </label>
                 <label className="flex items-start gap-2 text-[11px] text-slate-300 cursor-pointer select-none pt-1">
                   <input type="checkbox" required checked={tcAccepted} onChange={e => setTcAccepted(e.target.checked)} className="accent-emerald-500 rounded bg-slate-900 border-slate-700 mt-0.5" />
                   <span>He leído y acepto los <a href="#" className="text-emerald-500 hover:underline font-bold">Términos y Condiciones</a> y la <a href="#" className="text-emerald-500 hover:underline font-bold">Política de Privacidad</a>.</span>
                 </label>
               </div>
             )}

            <Button type="submit" className="w-full py-2.5 mt-2" disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : 'Enviar Solicitud'}</Button>
            <p className="text-center text-xs text-slate-400 mt-3"><button type="button" onClick={()=>setMode('LOGIN')} className="text-emerald-500 font-bold hover:underline">Volver al Login</button></p>
          </form>
        )}

        {mode === 'REGISTER_SUCCESS' && (
          <div className="text-center space-y-4 py-4 animate-fade-in">
            <div className="mx-auto w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-black text-white">¡Solicitud Enviada!</h2>
            <p className="text-sm text-emerald-400 font-bold">¡Muchas gracias por querer ser parte del Crew!</p>
            <p className="text-xs md:text-sm text-slate-300 px-2">Cuando tu acceso sea aprobado, llegará un correo con una clave provisoria que debes actualizar en tu sección <b>Mi Perfil</b>.</p>
            <Button onClick={() => setMode('LOGIN')} className="w-full mt-6 py-2.5" variant="secondary">Volver al Inicio</Button>
          </div>
        )}

        {mode === 'REGISTER_ADMIN_SUCCESS' && (
          <div className="text-center space-y-4 py-4 animate-fade-in">
            <div className="mx-auto w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-black text-white">¡Administrador Activado!</h2>
            <p className="text-sm text-emerald-400 font-bold">La plataforma ha sido inicializada y tu cuenta es ADMINISTRADOR.</p>
            <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl space-y-1.5 text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tu Clave Temporal de Acceso:</span>
              <div className="font-mono text-lg font-black text-emerald-400 select-all tracking-widest text-center bg-slate-950 p-2.5 rounded border border-emerald-500/30">{adminTempPass}</div>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">Copia esta clave. Se ha enviado una copia por correo, pero ya puedes iniciar sesión inmediatamente.</p>
            </div>
            <Button onClick={() => { setAdminTempPass(''); setMode('LOGIN'); }} className="w-full mt-6 py-2.5" variant="primary">Ir al Login</Button>
          </div>
        )}
      </Card>
    </div>
  );
};
