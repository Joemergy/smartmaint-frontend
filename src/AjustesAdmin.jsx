import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import Sidebar from './Sidebar';
import { applyTheme, applyLanguage } from './services/themeService';
import Button from './components/ui/Button';
import { useAuth } from './hooks/useAuth';
import './Panel.css';
import './AjustesAdmin.css';

const STORAGE_KEY = 'smartmaint_admin_settings';

const AjustesAdmin = () => {
  const navigate = useNavigate();
  const { session, role, logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [settings, setSettings] = useState({
    notificacionesCorreo: true,
    notificacionesApp: true,
    notificacionesTareasProximas: true,
    maxTareasPorPagina: 10,
    tema: 'claro',
    idioma: 'es',
    privacidadDatos: 'privada',
    visualizacion: 'grid',
  });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('No se pudo cargar la configuracion guardada:', error);
      }
    }
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleMaxTareas = (event) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) return;
    setSettings((prev) => ({ ...prev, maxTareasPorPagina: Math.max(1, Math.min(100, value)) }));
  };

  const handleGuardar = (event) => {
    event.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    
    // Aplicar tema y idioma
    applyTheme(settings.tema);
    applyLanguage(settings.idioma);
    
    setSaveMessage('Configuración actualizada correctamente.');
    window.setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-wrapper">
      <AdminHeader onToggleSidebar={() => setSidebarVisible(!sidebarVisible)} />

      <div className="admin-body">
        <Sidebar
          visible={sidebarVisible}
          onToggle={() => setSidebarVisible(!sidebarVisible)}
          onLogout={handleLogout}
        />

        <main className={`admin-content ${sidebarVisible ? 'con-sidebar' : 'sin-sidebar'}`}>
          <section className="ajustes-admin-content">
            <div className="ajustes-hero">
              <div>
                <p className="ajustes-kicker">Ajusta tu experiencia</p>
                <h2>Define tus preferencias para una gestión más cómoda.</h2>
                <p className="ajustes-copy">Sesión actual: {session?.correo || 'admin@empresa.com'} · Rol: {role === 'SUPERADMIN' ? 'Superadministrador' : 'Administrador'}.</p>
              </div>
              {saveMessage && <div className="ajustes-feedback">{saveMessage}</div>}
            </div>

            <form className="ajustes-form" onSubmit={handleGuardar}>
              <div className="ajuste-card">
                <h3>Notificaciones</h3>

                <label className="switch-row">
                  <span>Alertas por correo</span>
                  <input
                    type="checkbox"
                    name="notificacionesCorreo"
                    checked={settings.notificacionesCorreo}
                    onChange={handleChange}
                  />
                </label>

                <label className="switch-row">
                  <span>Alertas en la aplicacion</span>
                  <input
                    type="checkbox"
                    name="notificacionesApp"
                    checked={settings.notificacionesApp}
                    onChange={handleChange}
                  />
                </label>

                <label className="switch-row">
                  <span>Tareas proximas a vencer</span>
                  <input
                    type="checkbox"
                    name="notificacionesTareasProximas"
                    checked={settings.notificacionesTareasProximas}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="ajuste-card">
                <label htmlFor="maxTareasPorPagina">Cantidad maxima de tareas visibles por pagina</label>
                <input
                  id="maxTareasPorPagina"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxTareasPorPagina}
                  onChange={handleMaxTareas}
                />
              </div>

              <div className="ajuste-card">
                <h3>Apariencia</h3>
                
                <label htmlFor="tema">Tema</label>
                <select
                  id="tema"
                  name="tema"
                  value={settings.tema}
                  onChange={handleChange}
                >
                  <option value="claro">Claro</option>
                  <option value="oscuro">Oscuro</option>
                  <option value="automatico">Automatico</option>
                </select>

                <label htmlFor="visualizacion">Visualizacion de tareas</label>
                <select
                  id="visualizacion"
                  name="visualizacion"
                  value={settings.visualizacion}
                  onChange={handleChange}
                >
                  <option value="grid">Cuadricula</option>
                  <option value="lista">Lista</option>
                </select>
              </div>

              <div className="ajuste-card">
                <h3>Idioma y Privacidad</h3>
                
                <label htmlFor="idioma">Idioma</label>
                <select
                  id="idioma"
                  name="idioma"
                  value={settings.idioma}
                  onChange={handleChange}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>

                <label htmlFor="privacidadDatos">Privacidad de datos</label>
                <select
                  id="privacidadDatos"
                  name="privacidadDatos"
                  value={settings.privacidadDatos}
                  onChange={handleChange}
                >
                  <option value="privada">Privada</option>
                  <option value="semipublica">Semi-publica</option>
                  <option value="publica">Publica</option>
                </select>
              </div>

              <Button type="submit" className="guardar-ajustes-btn">Guardar ajustes</Button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AjustesAdmin;
