import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

const RoleRedirect = ({ target }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (target === 'ajustes') {
    if (role === 'ADMIN' || role === 'SUPERADMIN') {
      return <Navigate to="/ajustes-admin" replace />;
    }
    return <Navigate to="/ajustes-usuario" replace />;
  }

  if (target === 'perfil') {
    if (role === 'ADMIN' || role === 'SUPERADMIN') {
      return <Navigate to="/perfil-admin" replace />;
    }
    return <Navigate to="/perfil-usuario" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default RoleRedirect;
