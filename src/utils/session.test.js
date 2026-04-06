import {
  SESSION_EXPIRED_EVENT,
  clearStoredSession,
  expireSession,
  getAuthHeader,
  getSessionSnapshot,
  isTokenExpired,
  parseJwtPayload,
  persistSessionFromAuth,
  updateStoredSession,
} from './session';

const makeToken = (payload) => {
  const header = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
  const body = window
    .btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `${header}.${body}.signature`;
};

describe('session utils', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  test('parseJwtPayload returns null for malformed token', () => {
    expect(parseJwtPayload('bad-token')).toBeNull();
    expect(parseJwtPayload('')).toBeNull();
  });

  test('persistSessionFromAuth stores session and returns auth header', () => {
    const token = makeToken({ sub: 'user@company.com', exp: Math.floor(Date.now() / 1000) + 600 });

    persistSessionFromAuth({
      token,
      rol: 'admin',
      rolId: 1,
      correo: 'user@company.com',
      empresa: 'Smartmaint',
      plan: 'PRO',
      idUsuario: 99,
      requiereCambioContrasena: true,
    });

    expect(getAuthHeader()).toEqual({ Authorization: `Bearer ${token}` });

    const snapshot = getSessionSnapshot();
    expect(snapshot).not.toBeNull();
    expect(snapshot.rol).toBe('ADMIN');
    expect(snapshot.idUsuario).toBe('99');
    expect(snapshot.requiereCambioContrasena).toBe(true);
    expect(isTokenExpired(token)).toBe(false);
  });

  test('updateStoredSession updates role and expireSession clears state and emits event', () => {
    const token = makeToken({ exp: Math.floor(Date.now() / 1000) + 600 });

    persistSessionFromAuth({ token, rol: 'usuario' });
    const updated = updateStoredSession({ rol: 'superadmin', plan: 'ENTERPRISE' });

    expect(updated.rol).toBe('SUPERADMIN');
    expect(updated.plan).toBe('ENTERPRISE');

    const handler = jest.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, handler);

    expireSession();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(getAuthHeader()).toEqual({});
    expect(getSessionSnapshot()).toBeNull();

    window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
  });

  test('clearStoredSession removes all persisted values', () => {
    const token = makeToken({ exp: Math.floor(Date.now() / 1000) + 600 });

    persistSessionFromAuth({
      token,
      rol: 'admin',
      correo: 'admin@company.com',
      plan: 'PRO',
    });

    clearStoredSession();

    expect(getSessionSnapshot()).toBeNull();
    expect(window.localStorage.getItem('rol')).toBeNull();
    expect(window.localStorage.getItem('correoUsuario')).toBeNull();
  });
});
