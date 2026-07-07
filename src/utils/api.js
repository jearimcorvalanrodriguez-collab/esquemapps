import { ESQUEMAS_MASTER_SECRET } from './constants';

export const CACHE = {
  proyectos: null,
  hitos: null,
  riders: null,
  usuarios: null,
  transportes: null,
  mensajes: null
};

export const clearCache = (key) => { CACHE[key] = null; };

export const setCache = (key, value) => { CACHE[key] = value; };

export const compareProjectIds = (idA, idB) => {
  if (idA === undefined || idA === null || idB === undefined || idB === null) return false;
  let strA = String(idA).trim();
  let strB = String(idB).trim();
  if (strA.endsWith('.0')) strA = strA.slice(0, -2);
  if (strB.endsWith('.0')) strB = strB.slice(0, -2);
  
  if (strA === strB) return true;
  if (strA.toLowerCase() === strB.toLowerCase()) return true;

  const numA = Number(strA);
  const numB = Number(strB);
  if (!isNaN(numA) && !isNaN(numB)) {
    if (numA === numB) return true;
    
    // Fallback para notación científica o diferencias mínimas de redondeo
    const sA = String(Math.round(numA));
    const sB = String(Math.round(numB));
    if (sA.substring(0, 9) === sB.substring(0, 9)) return true;
  }
  return false;
};

export const apiFetch = async (action, payload = {}) => {
  const url = import.meta.env.VITE_GAS_URL || 'https://script.google.com/macros/s/AKfycbwNXxsCfNlOV-JkeUO2Sl55SquzwcrwP50ZpfSUyeg-mI1ugvtCw-1E1mLF-2OS5tmAEw/exec';
  
  // Get active user email from localStorage
  const storedUser = window.localStorage.getItem('esquemapps_user');
  let requesterEmail = null;
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed && parsed.email) requesterEmail = parsed.email;
    } catch (e) {}
  }

  const securePayload = { ...payload };
  if (requesterEmail && !securePayload.requesterEmail) {
    securePayload.requesterEmail = requesterEmail;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ app_secret: ESQUEMAS_MASTER_SECRET, action, payload: securePayload })
  });
  return response.json();
};
