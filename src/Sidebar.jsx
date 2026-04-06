// src/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import './Panel.css';

const Sidebar = ({ visible, onToggle, onLogout }) => {
  const { session } = useAuth();
  const rolId = Number(session?.rolId || 0);
  const esUsuarioEstandar = rolId === 2;

  const closeIfMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768 && onToggle) {
      onToggle();
    }
  };

  const getLinkClass = ({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`;

  return (
    <aside className={`admin-sidebar ${visible ? 'visible' : 'oculto'}`}>
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