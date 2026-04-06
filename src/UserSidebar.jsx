import React from 'react';
import { NavLink } from 'react-router-dom';
import './Panel.css';

const UserSidebar = ({ visible, onLogout, onToggle }) => {
  const closeIfMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768 && onToggle) {
      onToggle();
    }
  };

  const getLinkClass = ({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`;

  return (
    <aside className={`usuario-sidebar ${visible ? 'visible' : 'oculto'}`}>
      <ul>
        <li><NavLink to="/dashboard-usuario" className={getLinkClass} onClick={closeIfMobile}>Dashboard</NavLink></li>
        <li><NavLink to="/mis-tareas" className={getLinkClass} onClick={closeIfMobile}>Mis tareas</NavLink></li>
        <li><NavLink to="/historial-tareas-usuario" className={getLinkClass} onClick={closeIfMobile}>Historial de tareas</NavLink></li>
        <li><NavLink to="/exportar-eliminar-tareas-usuario" className={getLinkClass} onClick={closeIfMobile}>Exportar o Eliminar tareas</NavLink></li>
        <li><NavLink to="/perfil-usuario" className={getLinkClass} onClick={closeIfMobile}>Perfil de usuario</NavLink></li>
        <li><NavLink to="/ajustes-usuario" className={getLinkClass} onClick={closeIfMobile}>Ajustes</NavLink></li>
      </ul>
      <button className="logout-btn" onClick={onLogout}>
        <i className="fas fa-sign-out-alt"></i> Cerrar sesión
      </button>
    </aside>
  );
};

export default UserSidebar;
