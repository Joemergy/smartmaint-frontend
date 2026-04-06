import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

const RutaProtegida = ({ children, rolRequerido }) => {
  const { isAuthenticated, role, session } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const requeridos = Array.isArray(rolRequerido)
    ? rolRequerido.map((r) => String(r || '').toUpperCase())
    : [String(rolRequerido || '').toUpperCase()];

  if (session?.requiereCambioContrasena) {
    return <Navigate to="/cambiar-contrasena-inicial" replace />;
  }

  if (requeridos.includes('ADMIN') && role === 'SUPERADMIN') {
    return children;
  }

  if (!requeridos.includes(role)) return <Navigate to="/login" replace />;

  return children;
};

export default RutaProtegida;