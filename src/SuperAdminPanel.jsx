import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import Sidebar from './Sidebar';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import { useAuth } from './hooks/useAuth';
import './Panel.css';
import './SuperAdminPanel.css';

const SuperAdminPanel = () => {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const acciones = [
    {
      title: 'Supervisar operación',
      copy: 'Ve el dashboard ejecutivo y detecta carga, vencimientos y ejecución en curso.',
      action: 'Abrir dashboard',
      onClick: () => navigate('/dashboard-tareas'),
    },
    {
      title: 'Administrar usuarios',
      copy: 'Crea nuevas cuentas, valida permisos y ajusta estructura operativa.',
      action: 'Gestionar usuarios',
      onClick: () => navigate('/crear-usuario'),
    },
    {
      title: 'Auditar historial',
      copy: 'Consulta historial, exportaciones y eliminación de tareas archivadas.',
      action: 'Ir al historial',
      onClick: () => navigate('/historial-tareas-admin'),
    },
  ];

  return (
    <div className="admin-wrapper">
      <AdminHeader onToggleSidebar={() => setSidebarVisible((prev) => !prev)} />

      <div className="admin-body">
        <Sidebar visible={sidebarVisible} onToggle={() => setSidebarVisible((prev) => !prev)} onLogout={handleLogout} />

        <main className={`admin-content ${sidebarVisible ? 'con-sidebar' : 'sin-sidebar'}`}>
          <div className="superadmin-panel">
            <section className="superadmin-hero">
              <div>
                <p className="superadmin-kicker">Centro de control SUPERADMIN</p>
                <h1>Gobierna empresas, usuarios y operación desde una vista más ejecutiva.</h1>
                <p className="superadmin-copy">
                  Bienvenido {session?.correo || 'superadmin'}. Esta vista concentra accesos de alto impacto para control institucional y seguimiento operativo.
                </p>
              </div>
              <div className="superadmin-hero-actions">
                <Button onClick={() => navigate('/dashboard-tareas')}>Abrir dashboard</Button>
                <Button variant="ghost" onClick={() => navigate('/tareas-asignadas')}>Ver tareas</Button>
              </div>
            </section>

            <section className="superadmin-grid">
              {acciones.map((accion) => (
                <Card key={accion.title} className="superadmin-card">
                  <h2>{accion.title}</h2>
                  <p>{accion.copy}</p>
                  <Button variant="secondary" onClick={accion.onClick}>{accion.action}</Button>
                </Card>
              ))}
            </section>

            <section className="superadmin-summary-grid">
              <Card className="superadmin-summary-card">
                <span className="superadmin-summary-label">Acción sugerida</span>
                <strong>Revisar tareas vencidas y responsables sin cierre</strong>
                <p>El valor del rol SUPERADMIN está en detectar fricción operativa antes de que escale.</p>
              </Card>
              <Card className="superadmin-summary-card">
                <span className="superadmin-summary-label">Siguiente auditoría</span>
                <strong>Validar usuarios, permisos y trazabilidad</strong>
                <p>Usa exportación e historial para dejar la plataforma lista para operación institucional.</p>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminPanel;
