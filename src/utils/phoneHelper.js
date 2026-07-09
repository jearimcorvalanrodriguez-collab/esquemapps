export const COUNTRY_CODES = [
  { code: '+56', country: 'CL', label: '🇨🇱 +56' },
  { code: '+54', country: 'AR', label: '🇦🇷 +54' },
  { code: '+51', country: 'PE', label: '🇵🇪 +51' },
  { code: '+57', country: 'CO', label: '🇨🇴 +57' },
  { code: '+52', country: 'MX', label: '🇲🇽 +52' },
  { code: '+34', country: 'ES', label: '🇪🇸 +34' },
  { code: '+598', country: 'UY', label: '🇺🇾 +598' },
  { code: '+591', country: 'BO', label: '🇧🇴 +591' },
  { code: '+593', country: 'EC', label: '🇪🇨 +593' },
  { code: '+58', country: 'VE', label: '🇻🇪 +58' },
  { code: '+1', country: 'US', label: '🇺🇸 +1' },
  { code: '+55', country: 'BR', label: '🇧🇷 +55' },
  { code: '+595', country: 'PY', label: '🇵🇾 +595' }
];

export const detectCountryCode = () => {
  try {
    const locale = navigator.language || navigator.languages?.[0] || 'es-CL';
    const country = locale.split('-')[1]?.toUpperCase();
    if (country) {
      const match = COUNTRY_CODES.find(c => c.country === country);
      if (match) return match.code;
    }
    // Fallback based on timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      if (tz.includes('Santiago')) return '+56';
      if (tz.includes('Buenos_Aires')) return '+54';
      if (tz.includes('Lima')) return '+51';
      if (tz.includes('Bogota')) return '+57';
      if (tz.includes('Mexico')) return '+52';
      if (tz.includes('Madrid')) return '+34';
      if (tz.includes('Montevideo')) return '+598';
      if (tz.includes('La_Paz')) return '+591';
      if (tz.includes('Quito')) return '+593';
      if (tz.includes('Caracas')) return '+58';
      if (tz.includes('Asuncion')) return '+595';
    }
  } catch (e) {
    // ignore
  }
  return '+56'; // Default default
};

export const parsePhone = (phoneStr) => {
  const cleanStr = String(phoneStr || '').replace(/[\s\-\(\)]+/g, '');
  // Find which COUNTRY_CODES prefix matches the cleanStr
  const match = COUNTRY_CODES.find(c => cleanStr.startsWith(c.code));
  if (match) {
    return {
      code: match.code,
      number: cleanStr.slice(match.code.length).replace(/[^0-9]/g, '')
    };
  }
  // If cleanStr starts with '+' but doesn't match, or is empty:
  if (cleanStr.startsWith('+')) {
    // try to find code matching first few digits
    for (let len = 4; len >= 2; len--) {
      const prefix = cleanStr.slice(0, len);
      const matchPrefix = COUNTRY_CODES.find(c => c.code === prefix);
      if (matchPrefix) {
        return {
          code: matchPrefix.code,
          number: cleanStr.slice(len).replace(/[^0-9]/g, '')
        };
      }
    }
  }
  return {
    code: detectCountryCode(),
    number: cleanStr.replace(/[^0-9]/g, '')
  };
};
