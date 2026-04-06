const STORAGE_KEYS = {
  token: 'token',
  refreshToken: 'refreshToken',
  rol: 'rol',
  rolId: 'rolId',
  correo: 'correoUsuario',
  empresa: 'empresa',
  plan: 'plan',
  idUsuario: 'idUsuario',
  nombre: 'nombreUsuario',
  idColaborador: 'idColaborador',
  cargo: 'cargo',
  telefono: 'telefonoUsuario',
  requiereCambioContrasena: 'requiereCambioContrasena',
};

export const SESSION_EXPIRED_EVENT = 'smartmaint:session-expired';

const getSessionStorage = () => {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

const readToken = () => {
  const storage = getSessionStorage();
  const token = storage?.getItem(STORAGE_KEYS.token) || localStorage.getItem(STORAGE_KEYS.token) || '';

  if (token && storage && !storage.getItem(STORAGE_KEYS.token)) {
    storage.setItem(STORAGE_KEYS.token, token);
    localStorage.removeItem(STORAGE_KEYS.token);
  }

  return token;
};

const writeToken = (token) => {
  const storage = getSessionStorage();
  if (storage) {
    storage.setItem(STORAGE_KEYS.token, token || '');
  }
  localStorage.removeItem(STORAGE_KEYS.token);
};

const clearToken = () => {
  const storage = getSessionStorage();
  storage?.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.token);
};

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const parseJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = window.atob(normalized);
    return safeJsonParse(decoded);
  } catch {
    return null;
  }
};

export const getToken = () => readToken();

export const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getSessionSnapshot = () => {
  const token = getToken();
  if (!token) return null;

  const payload = parseJwtPayload(token);
  const expiresAt = payload?.exp ? payload.exp * 1000 : null;

  return {
    token,
    rol: (localStorage.getItem(STORAGE_KEYS.rol) || '').toUpperCase(),
    rolId: localStorage.getItem(STORAGE_KEYS.rolId) || '',
    correo: localStorage.getItem(STORAGE_KEYS.correo) || '',
    empresa: localStorage.getItem(STORAGE_KEYS.empresa) || '',
    plan: localStorage.getItem(STORAGE_KEYS.plan) || '',
    idUsuario: localStorage.getItem(STORAGE_KEYS.idUsuario) || '',
    nombre: localStorage.getItem(STORAGE_KEYS.nombre) || '',
    idColaborador: localStorage.getItem(STORAGE_KEYS.idColaborador) || '',
    cargo: localStorage.getItem(STORAGE_KEYS.cargo) || '',
    telefono: localStorage.getItem(STORAGE_KEYS.telefono) || '',
    requiereCambioContrasena: localStorage.getItem(STORAGE_KEYS.requiereCambioContrasena) === 'true',
    expiresAt,
  };
};

export const isTokenExpired = (token = getToken()) => {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
};

export const clearStoredSession = () => {
  clearToken();
  Object.entries(STORAGE_KEYS).forEach(([entry, key]) => {
    if (entry !== 'token') {
      localStorage.removeItem(key);
    }
  });
};

// ── Refresh token ──────────────────────────────────────────────────────────
export const getRefreshToken = () => localStorage.getItem(STORAGE_KEYS.refreshToken) || null;

export const setRefreshToken = (token) => {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.refreshToken, token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
  }
};

/**
 * Actualiza solo el access token en sessionStorage sin tocar el resto de la sesión.
 * Usado por apiClient.js cuando renueva el token de forma silenciosa.
 */
export const updateAccessToken = (newToken) => {
  if (newToken) writeToken(newToken);
};

export const expireSession = () => {
  clearStoredSession();
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
};

export const updateStoredSession = (updates = {}) => {
  const current = getSessionSnapshot();
  if (!current) return null;

  const next = {
    ...current,
    ...updates,
  };

  writeToken(next.token || '');
  localStorage.setItem(STORAGE_KEYS.rol, String(next.rol || '').toUpperCase());
  localStorage.setItem(STORAGE_KEYS.rolId, String(next.rolId || ''));
  localStorage.setItem(STORAGE_KEYS.correo, next.correo || '');
  localStorage.setItem(STORAGE_KEYS.empresa, next.empresa || '');
  localStorage.setItem(STORAGE_KEYS.plan, next.plan || '');
  localStorage.setItem(STORAGE_KEYS.idUsuario, String(next.idUsuario || ''));
  localStorage.setItem(STORAGE_KEYS.nombre, next.nombre || '');
  localStorage.setItem(STORAGE_KEYS.idColaborador, next.idColaborador || '');
  localStorage.setItem(STORAGE_KEYS.cargo, next.cargo || '');
  localStorage.setItem(STORAGE_KEYS.telefono, next.telefono || '');
  localStorage.setItem(
    STORAGE_KEYS.requiereCambioContrasena,
    next.requiereCambioContrasena ? 'true' : 'false'
  );

  return getSessionSnapshot();
};

export const persistSessionFromAuth = (data) => {
  const rol = String(data?.rol || '').toUpperCase();

  writeToken(data?.token || '');
  setRefreshToken(data?.refreshToken || null);
  localStorage.setItem(STORAGE_KEYS.rol, rol);
  localStorage.setItem(STORAGE_KEYS.rolId, String(data?.rolId || ''));
  localStorage.setItem(STORAGE_KEYS.correo, data?.correo || '');
  localStorage.setItem(STORAGE_KEYS.empresa, data?.empresa || '');
  localStorage.setItem(STORAGE_KEYS.plan, data?.plan || '');
  localStorage.setItem(STORAGE_KEYS.idUsuario, String(data?.idUsuario || ''));
  localStorage.setItem(STORAGE_KEYS.nombre, data?.nombre || '');
  localStorage.setItem(STORAGE_KEYS.idColaborador, data?.idColaborador || '');
  localStorage.setItem(STORAGE_KEYS.cargo, data?.cargo || '');
  localStorage.setItem(STORAGE_KEYS.telefono, data?.telefono || '');
  localStorage.setItem(
    STORAGE_KEYS.requiereCambioContrasena,
    data?.requiereCambioContrasena ? 'true' : 'false'
  );

  return getSessionSnapshot();
};