import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { normalizeRole } from './utils/session';

const RutaProtegida = ({ children, rolRequerido }) => {
  const { isAuthenticated, role, session } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const requeridos = Array.isArray(rolRequerido)
    ? rolRequerido.map((r) => String(r || '').toUpperCase())
    : [String(rolRequerido || '').toUpperCase()];

  const normalizedRole = normalizeRole(role);

  if (session?.requiereCambioContrasena) {
    return <Navigate to="/cambiar-contrasena-inicial" replace />;
  }

  if (requeridos.includes('ADMIN') && normalizedRole === 'SUPERADMIN') {
    return children;
  }

  if (!requeridos.includes(normalizedRole)) {
    console.warn('RutaProtegida.jsx - acceso denegado por rol:', {
      ruta: window.location.pathname,
      rolRequerido: requeridos,
      rolActual: normalizedRole,
      sessionRol: session?.rol,
      session: session,
    });
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RutaProtegida;