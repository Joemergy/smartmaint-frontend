// src/AdminHeader.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Panel.css';
import { getMisNotificaciones, marcarNotificacionLeida } from './services/notificacionService';

const AdminHeader = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [pendientes, setPendientes] = useState(0);
  const dropdownRef = useRef(null);
  const prevPendientesRef = useRef(0);
  const primerCargaRef = useRef(true);

  const notificacionesVacias = useMemo(() => notificaciones.length === 0, [notificaciones]);

  const reproducirSonido = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const context = new AudioCtx();
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(960, context.currentTime);
      gain.gain.setValueAtTime(0.08, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.2);

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start();
      oscillator.stop(context.currentTime + 0.2);
      oscillator.onended = () => context.close();
    } catch (_) {
      // Si el navegador bloquea audio, la UI continúa sin romperse.
    }
  }, []);

  const cargarNotificaciones = useCallback(async () => {
    try {
      const data = await getMisNotificaciones();
      setNotificaciones(data.items);
      setPendientes(data.pendientes);

      if (primerCargaRef.current) {
        prevPendientesRef.current = data.pendientes;
        primerCargaRef.current = false;
        return;
      }

      if (data.pendientes > prevPendientesRef.current) {
        reproducirSonido();
      }
      prevPendientesRef.current = data.pendientes;
    } catch (err) {
      if ([401, 403].includes(err?.status)) {
        return;
      }
      console.error('❌ Error cargando notificaciones:', err);
    }
  }, [reproducirSonido]);

  const marcarComoLeida = async (idNotificacion) => {
    try {
      await marcarNotificacionLeida(idNotificacion);
      await cargarNotificaciones();
    } catch (err) {
      console.error('❌ Error marcando notificación como leída:', err);
    }
  };

  useEffect(() => {
    cargarNotificaciones();
    const intervalId = window.setInterval(cargarNotificaciones, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [cargarNotificaciones]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    const parsed = new Date(fecha);
    if (Number.isNaN(parsed.getTime())) return 'Sin fecha';
    return parsed.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <header className="admin-header">
      <button className="hamburger-btn" onClick={onToggleSidebar}>
        ☰
      </button>
      <h1 className="banner-title"><em>SMARTMAINT</em></h1>
      <div className="header-icons" ref={dropdownRef}>
        <button
          type="button"
          className="icon-btn notification-icon"
          aria-label="Abrir notificaciones"
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          <i className="fas fa-bell"></i>
          {pendientes > 0 && <span className="notification-badge">{pendientes}</span>}
        </button>

        <button
          type="button"
          className="icon-btn"
          aria-label="Ir a ajustes"
          onClick={() => navigate('/ajustes')}
        >
          <i className="fas fa-cog"></i>
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label="Ir a perfil"
          onClick={() => navigate('/perfil')}
        >
          <i className="fas fa-user"></i>
        </button>

        {dropdownOpen && (
          <div className="notifications-dropdown" role="dialog" aria-label="Notificaciones recientes">
            <div className="notifications-header">Notificaciones recientes</div>
            {notificacionesVacias ? (
              <p className="notifications-empty">No tienes notificaciones.</p>
            ) : (
              <ul className="notifications-list">
                {notificaciones.map((notificacion) => (
                  <li
                    key={notificacion.id}
                    className={`notification-item ${notificacion.leido ? 'read' : 'unread'}`}
                  >
                    <div className="notification-message">{notificacion.mensaje}</div>
                    <div className="notification-meta">
                      <span>{formatearFecha(notificacion.fecha)}</span>
                      <span>{notificacion.leido ? 'Leída' : 'No leída'}</span>
                    </div>
                    {!notificacion.leido && (
                      <button
                        type="button"
                        className="notification-read-btn"
                        onClick={() => marcarComoLeida(notificacion.id)}
                      >
                        Marcar como leída
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;