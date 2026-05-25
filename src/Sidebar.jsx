// src/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { normalizeRole } from './utils/session';
import { useAuth } from './hooks/useAuth';
import './Panel.css';

const Sidebar = ({ visible, onToggle, onLogout }) => {
  const { session, role } = useAuth();
  const sessionRole = normalizeRole(session?.rol || role || '');
  const rolId = Number(session?.rolId || 0);
  const isAdminRole = ['ADMIN', 'SUPERADMIN'].includes(sessionRole);
  const esUsuarioEstandar = !isAdminRole && rolId !== 1 && rolId !== 3;
  const displayRole = sessionRole || (rolId === 1 ? 'ADMIN' : rolId === 3 ? 'SUPERADMIN' : rolId === 2 ? 'USUARIO' : 'DESCONOCIDO');

  const closeIfMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768 && onToggle) {
      onToggle();
    }
  };

  const getLinkClass = ({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`;

  return (
    <aside className={`admin-sidebar ${visible ? 'visible' : 'oculto'}`}>
      <div className="sidebar-role">Rol actual: <strong>{displayRole}</strong></div>
      <ul>
        <li><NavLink to="/dashboard-tareas" className={getLinkClass} onClick={closeIfMobile}>Dashboard</NavLink></li>
        <li><NavLink to="/crear-tarea" className={getLinkClass} onClick={closeIfMobile}>Crear tarea</NavLink></li>
        <li><NavLink to="/tareas-asignadas" className={getLinkClass} onClick={closeIfMobile}>Tareas Asignadas</NavLink></li>
        <li><NavLink to="/historial-tareas-admin" className={getLinkClass} onClick={closeIfMobile}>Historial de tareas</NavLink></li>
        <li><NavLink to="/exportar-eliminar-tareas-admin" className={getLinkClass} onClick={closeIfMobile}>Exportar o Eliminar tareas</NavLink></li>
        {!esUsuarioEstandar && <li><NavLink to="/crear-usuario" className={getLinkClass} onClick={closeIfMobile}>Crear nuevo usuario</NavLink></li>}
        {!esUsuarioEstandar && <li><NavLink to="/eliminar-usuario" className={getLinkClass} onClick={closeIfMobile}>Consultar o Eliminar usuario</NavLink></li>}
        <li><NavLink to="/ajustes-admin" className={getLinkClass} onClick={closeIfMobile}>Ajustes</NavLink></li>
        <li><NavLink to="/perfil-admin" className={getLinkClass} onClick={closeIfMobile}>Administrar perfil</NavLink></li>
      </ul>
      <button className="logout-btn" onClick={onLogout}>
        <i className="fas fa-lock"></i> Cerrar sesión
      </button>
    </aside>
  );
};

export default Sidebar;