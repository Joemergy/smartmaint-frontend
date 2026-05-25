import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { normalizeRole } from './utils/session';

const RoleRedirect = ({ target }) => {
  const { isAuthenticated, role } = useAuth();
  const currentRole = normalizeRole(role);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (target === 'ajustes') {
    if (currentRole === 'ADMIN' || currentRole === 'SUPERADMIN') {
      return <Navigate to="/ajustes-admin" replace />;
    }
    return <Navigate to="/ajustes-usuario" replace />;
  }

  if (target === 'perfil') {
    if (currentRole === 'ADMIN' || currentRole === 'SUPERADMIN') {
      return <Navigate to="/perfil-admin" replace />;
    }
    return <Navigate to="/perfil-usuario" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default RoleRedirect;
