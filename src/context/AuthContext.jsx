import React, { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { clearStoredSession, expireSession, getSessionSnapshot, isTokenExpired, persistSessionFromAuth, SESSION_EXPIRED_EVENT, updateStoredSession } from '../utils/session';
import { logout as apiLogout } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    const snapshot = getSessionSnapshot();
    if (snapshot?.token && isTokenExpired(snapshot.token)) {
      clearStoredSession();
      return null;
    }
    return snapshot;
  });
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!session?.expiresAt) return undefined;

    const remainingMs = session.expiresAt - Date.now();
    if (remainingMs <= 0) {
      expireSession();
      setSession(null);
      return undefined;
    }

    timeoutRef.current = window.setTimeout(() => {
      expireSession();
      setSession(null);
    }, remainingMs);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [session]);

  useEffect(() => {
    const syncSession = () => {
      const next = getSessionSnapshot();
      if (!next?.token || isTokenExpired(next.token)) {
        clearStoredSession();
        setSession(null);
        return;
      }
      setSession(next);
    };

    const handleStorage = () => syncSession();
    const handleExpired = () => syncSession();

    window.addEventListener('storage', handleStorage);
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    };
  }, []);

  const value = useMemo(() => ({
    session,
    isAuthenticated: Boolean(session?.token),
    role: session?.rol || '',
    loginFromResponse: (data) => {
      const next = persistSessionFromAuth(data);
      setSession(next);
      return next;
    },
    logout: async () => {
      await apiLogout(); // revoca el refresh token en el backend
      clearStoredSession();
      setSession(null);
    },
    refreshSession: () => {
      const next = getSessionSnapshot();
      setSession(next);
      return next;
    },
    updateSession: (updates) => {
      const next = updateStoredSession(updates);
      setSession(next);
      return next;
    },
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};