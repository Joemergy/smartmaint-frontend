import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import UserSidebar from './UserSidebar';
import Badge from './components/ui/Badge';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import { getTareasAsignadas } from './services/tareaService';
import { esTareaArchivada } from './components/usuario/usuarioPanelConfig';
import { useAuth } from './hooks/useAuth';
import './Panel.css';
import './DashboardTareas.css';

const estadoToneMap = {
  pendiente: 'danger',
  'en proceso': 'warning',
  completado: 'success',
  archivado: 'info',
  archivada: 'info',
  cancelado: 'danger',
};

const formatFecha = (fecha) => {
  if (!fecha) return 'Sin fecha';
  const parsed = new Date(fecha);
  if (Number.isNaN(parsed.getTime())) return 'Sin fecha';
  return parsed.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

const DashboardUsuario = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [tareas, setTareas] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [quickFilter, setQuickFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const cargarDashboard = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await getTareasAsignadas();
        if (!ignore) {
          const activas = Array.isArray(data) ? data.filter((t) => !esTareaArchivada(t)) : [];
          setTareas(activas);
        }
      } catch (err) {
        if (!ignore) {
          setError(err?.detalle || 'No se pudieron cargar los indicadores.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    cargarDashboard();
    const intervalId = window.setInterval(cargarDashboard, 20000);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const stats = useMemo(() => {
    const pendientes = tareas.filter((t) => (t.estado || '').toLowerCase() === 'pendiente').length;
    const enProceso = tareas.filter((t) => (t.estado || '').toLowerCase() === 'en proceso').length;
    const completadas = tareas.filter((t) => (t.estado || '').toLowerCase() === 'completado').length;
    const canceladas = tareas.filter((t) => (t.estado || '').toLowerCase() === 'cancelado').length;

    return { pendientes, enProceso, completadas, canceladas };
  }, [tareas]);

  const visibleTasks = useMemo(() => {
    if (quickFilter === 'pending') {
      return tareas.filter((t) => (t.estado || '').toLowerCase() === 'pendiente');
    }
    if (quickFilter === 'inprogress') {
      return tareas.filter((t) => (t.estado || '').toLowerCase() === 'en proceso');
    }
    if (quickFilter === 'completed') {
      return tareas.filter((t) => (t.estado || '').toLowerCase() === 'completado');
    }
    if (quickFilter === 'cancelled') {
      return tareas.filter((t) => (t.estado || '').toLowerCase() === 'cancelado');
    }
    return tareas;
  }, [quickFilter, tareas]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-wrapper">
      <AdminHeader onToggleSidebar={() => setSidebarVisible((prev) => !prev)} />

      <div className="admin-body">
        <UserSidebar visible={sidebarVisible} onToggle={() => setSidebarVisible((prev) => !prev)} onLogout={handleLogout} />

        <main className={`admin-content ${sidebarVisible ? 'con-sidebar' : 'sin-sidebar'}`}>
          <div className="dashboard-tareas-container sm-panel-shell sm-stack-lg">
            <section className="dashboard-hero sm-card sm-card-panel sm-card-padding-lg">
              <div className="dashboard-hero-copy sm-stack">
                <p className="dashboard-kicker sm-eyebrow">Dashboard personal</p>
                <h1 className="sm-section-title">Supervisa tus tareas, identifica prioridades y mantén el ritmo.</h1>
                <p className="dashboard-copy">
                  Aquí tienes un resumen de tus tareas activas, con acceso rápido a lo más urgente.
                </p>
              </div>

              <div className="dashboard-actions">
                <Button size="lg" onClick={() => navigate('/mis-tareas')}>Mis tareas</Button>
                <Button variant="ghost" size="lg" onClick={() => navigate('/historial-tareas-usuario')}>Ver historial</Button>
              </div>
            </section>

            <section className="sm-kpi-grid dashboard-kpis">
              <Card
                variant="panel" padding="md"
                className={`dashboard-kpi-card dashboard-kpi-card-danger dashboard-kpi-clickable${quickFilter === 'pending' ? ' dashboard-kpi-active' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setQuickFilter(quickFilter === 'pending' ? 'all' : 'pending')}
              >
                <span className="dashboard-kpi-label">Pendientes</span>
                <strong>{stats.pendientes}</strong>
                <span>Trabajo aún sin iniciar</span>
              </Card>
              <Card
                variant="panel" padding="md"
                className={`dashboard-kpi-card dashboard-kpi-card-success dashboard-kpi-clickable${quickFilter === 'inprogress' ? ' dashboard-kpi-active' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setQuickFilter(quickFilter === 'inprogress' ? 'all' : 'inprogress')}
              >
                <span className="dashboard-kpi-label">En proceso</span>
                <strong>{stats.enProceso}</strong>
                <span>Tareas en ejecución activa</span>
              </Card>
              <Card
                variant="panel" padding="md"
                className={`dashboard-kpi-card dashboard-kpi-card-warning dashboard-kpi-clickable${quickFilter === 'completed' ? ' dashboard-kpi-active' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setQuickFilter(quickFilter === 'completed' ? 'all' : 'completed')}
              >
                <span className="dashboard-kpi-label">Completadas</span>
                <strong>{stats.completadas}</strong>
                <span>Listas para archivar</span>
              </Card>
              <Card
                variant="panel" padding="md"
                className={`dashboard-kpi-card dashboard-kpi-card-info dashboard-kpi-clickable${quickFilter === 'cancelled' ? ' dashboard-kpi-active' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setQuickFilter(quickFilter === 'cancelled' ? 'all' : 'cancelled')}
              >
                <span className="dashboard-kpi-label">Canceladas</span>
                <strong>{stats.canceladas}</strong>
                <span>Tareas fuera de operación</span>
              </Card>
            </section>

            {error && <div className="dashboard-error">{error}</div>}

            <section className="dashboard-task-list">
              {isLoading ? (
                <Card variant="panel" padding="md" className="dashboard-empty-state sm-empty-state">
                  <p>Cargando tus tareas...</p>
                </Card>
              ) : visibleTasks.length === 0 ? (
                <Card variant="panel" padding="md" className="dashboard-empty-state sm-empty-state">
                  <p>No hay tareas para el estado seleccionado.</p>
                </Card>
              ) : (
                visibleTasks.slice(0, 8).map((tarea) => {
                  const estado = String(tarea.estado || 'Sin estado').toLowerCase();
                  const dueDate = tarea.fechaCierre || tarea.entregaEstimada || tarea.fechaInicio;
                  return (
                    <Card key={tarea.id} variant="panel" padding="md" className="dashboard-task-card">
                      <div className="dashboard-task-header">
                        <div>
                          <h3>{tarea.titulo || 'Tarea sin título'}</h3>
                          <p>{tarea.descripcion || 'Sin descripción registrada.'}</p>
                        </div>
                        <Badge tone={estadoToneMap[estado] || 'info'}>{tarea.estado || 'Sin estado'}</Badge>
                      </div>

                      <div className="dashboard-task-meta">
                        <span><strong>Máquina:</strong> {tarea.nombreMaquina || tarea.idMaquina || 'No aplica'}</span>
                        <span><strong>Entrega:</strong> {formatFecha(dueDate)}</span>
                        <span><strong>Prioridad:</strong> {tarea.prioridad || 'Normal'}</span>
                      </div>
                    </Card>
                  );
                })
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardUsuario;
