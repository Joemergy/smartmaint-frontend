import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { SESSION_EXPIRED_EVENT } from './utils/session';
import './Layout.css';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const esDemo = location.pathname === '/demo';
  const esPlanes = location.pathname === '/planes';
  const esLanding = location.pathname === '/';
  const esConfirmacionCompra = location.pathname === '/confirmacion-compra';

  // Rutas privadas donde NO se debe mostrar el Header público
  const rutasPrivadas = [
    '/admin',
    '/super-admin',
    '/dashboard-tareas',
    '/crear-tarea',
    '/crear-usuario',
    '/eliminar-usuario',
    '/tareas-asignadas',
    '/historial-tareas-admin',
    '/exportar-eliminar-tareas-admin',
    '/perfil-admin',
    '/ajustes-admin',
    '/usuario',
    '/mis-tareas',
    '/historial-tareas-usuario',
    '/exportar-eliminar-tareas-usuario',
    '/perfil-usuario',
    '/ajustes-usuario',
    '/ajustes',
    '/perfil',
    '/cambiar-contrasena-inicial'
  ];
  const ocultarHeader = () => rutasPrivadas.some(ruta => location.pathname.startsWith(ruta));
  const estaEnRutaPrivada = ocultarHeader();

  // Verificar si el usuario está logueado
  // Estilo de fondo solo si no es login ni panel
  const esLogin = location.pathname === '/login';
  const fondoClase = esLogin || esDemo || esPlanes || esLanding || esConfirmacionCompra || ocultarHeader() ? '' : 'contenido-fondo';

  const irAPreguntasFrecuentes = () => {
    window.location.assign('/#preguntas-frecuentes');
  };

  useEffect(() => {
    const handleSessionExpired = () => {
      if (estaEnRutaPrivada) {
        navigate('/login', { replace: true, state: { sessionExpired: true } });
      }
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [estaEnRutaPrivada, navigate]);

  return (
    <>
      {!ocultarHeader() && !isAuthenticated && !esLogin && !esDemo && !esPlanes && !esLanding && !esConfirmacionCompra && (
        <header className="topbar">
          <div className="logo">
            <h2>
              <i
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
                onClick={irAPreguntasFrecuentes}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    irAPreguntasFrecuentes();
                  }
                }}
              >
                SMARTMAINT
              </i>
            </h2>
          </div>
        </header>
      )}
      <main className={fondoClase}>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
