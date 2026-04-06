import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const estaEnLogin = location.pathname === '/login';
  const { isAuthenticated } = useAuth();

  // Rutas donde NO se debe mostrar el Header (paneles autenticados)
  const rutasAutenticadas = ['/admin', '/usuario', '/crear-tarea', '/historial-tareas-admin', '/historial-tareas-usuario', '/perfil-admin', '/perfil-usuario', '/dashboard-tareas'];
  const ocultarHeader = rutasAutenticadas.some(ruta => location.pathname.startsWith(ruta));

  if (ocultarHeader) {
    return null; // No renderizar el header en rutas autenticadas
  }

  return (
    <header className="topbar">
      <div className="logo">
        <Link to="/">
          <img
            src="/Smartmaintlogo.png"
            alt="Smartmaint Logo"
            style={{ cursor: 'pointer', height: '80px', backgroundColor: 'transparent' }}
          />
        </Link>
      </div>
      <nav>
        <ul>
          {/* 🔄 Solo mostrar si NO hay token y NO estás en login */}
          {!estaEnLogin && !isAuthenticated && (
            <li><Link to="/login">Iniciar Sesión</Link></li>
          )}
          <li><Link to="/planes">Adquirir un Plan</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
