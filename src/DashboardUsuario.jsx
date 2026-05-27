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


const formatFechaHora = (fecha) => {
  if (!fecha) return 'NA';
  const parsed = new Date(fecha);
  if (Number.isNaN(parsed.getTime())) return 'NA';
  const fechaFormateada = parsed.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
  const horaFormateada = parsed.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${fechaFormateada} - ${horaFormateada}`;
};

const DashboardUsuario = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [tareas, setTareas] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [quickFilter, setQuickFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTasks, setExpandedTasks] = useState([]);
  const [closingTaskId, setClosingTaskId] = useState(null);

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

  const toggleExpanded = (id) => {
    setExpandedTasks((prev) =>
      prev.includes(id) ? prev.filter((taskId) => taskId !== id) : [...prev, id]
    );
  };

  const abrirDetalles = (id) => {
    setClosingTaskId(null);
    toggleExpanded(id);
  };

  const cerrarDetalles = (id) => {
    setClosingTaskId(id);
    setTimeout(() => {
      setClosingTaskId(null);
      toggleExpanded(id);
    }, 220);
  };

  const handleVerMasDetalles = (tarea) => {
    abrirDetalles(tarea.id);
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
                className={`dashboard-kpi-card dashboard-kpi-card-warning dashboard-kpi-clickable${quickFilter === 'inprogress' ? ' dashboard-kpi-active' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setQuickFilter(quickFilter === 'inprogress' ? 'all' : 'inprogress')}
              >
                <span className="dashboard-kpi-label">En proceso</span>
                <strong>{stats.enProceso}</strong>
                <span>Tareas en ejecución activa</span>
              </Card>
              <Card
                variant="panel" padding="md"
                className={`dashboard-kpi-card dashboard-kpi-card-success dashboard-kpi-clickable${quickFilter === 'completed' ? ' dashboard-kpi-active' : ''}`}
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
                  const titulo = tarea.titulo || 'NA';
                  const isExpanded = expandedTasks.includes(tarea.id);
                  const isClosing = closingTaskId === tarea.id;

                  return (
                    <Card key={tarea.id} variant="panel" padding="md" className="dashboard-task-card">
                      <div className="dashboard-task-header">
                        <div className="dashboard-task-icon-container">
                          <svg className="dashboard-task-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                        </div>
                        <div className="dashboard-task-content">
                          <div className="dashboard-task-title-label">TÍTULO</div>
                          <p className="dashboard-task-title-text">{titulo.toUpperCase()}</p>
                        </div>
                        <div className="dashboard-task-status">
                          <button className="dashboard-task-details-button" onClick={() => handleVerMasDetalles(tarea)}>
                            <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            {isExpanded ? 'Cerrar detalles' : 'Ver más detalles'}
                          </button>
                          <Badge tone={estadoToneMap[estado] || 'info'}>{tarea.estado || 'Sin estado'}</Badge>
                        </div>
                      </div>

                      <div className="dashboard-task-meta dashboard-task-meta-summary">
                        <span>
                          <svg className="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          <strong>Inicio:</strong> {formatFechaHora(tarea.fechaInicio || tarea.fechaCreacion || tarea.fechaCierre)}
                        </span>
                        <span>
                          <svg className="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          <strong>Entrega Estimada:</strong> {formatFechaHora(tarea.entregaEstimada || tarea.fechaCierre)}
                        </span>
                        <span>
                          <svg className="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                            <line x1="4" y1="22" x2="4" y2="15"></line>
                          </svg>
                          <strong>Urgencia:</strong> {tarea.prioridad || 'Normal'}
                        </span>
                      </div>

                      {isExpanded && (
                        <div
                          className={`detalles-overlay ${isClosing ? 'closing' : 'open'}`}
                          onClick={() => cerrarDetalles(tarea.id)}
                        >
                          <div
                            className={`detalles-modal ${isClosing ? 'closing' : 'open'}`}
                            onClick={(event) => event.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                            aria-label="Detalle de tarea"
                          >
                            <button className="detalles-cerrar-btn" onClick={() => cerrarDetalles(tarea.id)}>
                              Cerrar
                            </button>

                            <div className="tarea-detalles modal-detalles">
                              {tarea.estado && tarea.estado !== 'NA' && <p><strong>Estado:</strong> {tarea.estado}</p>}
                              {tarea.descripcion && <p><strong>Descripción:</strong> {tarea.descripcion}</p>}
                              {tarea.nombreColaborador && tarea.nombreColaborador !== 'NA' && <p><strong>Colaborador:</strong> {tarea.nombreColaborador}</p>}
                              {tarea.idColaborador && tarea.idColaborador !== 'NA' && <p><strong>ID de colaborador:</strong> {tarea.idColaborador}</p>}
                              {tarea.correoColaborador && tarea.correoColaborador !== 'NA' && <p><strong>Correo:</strong> {tarea.correoColaborador}</p>}
                              {tarea.idMaquina && tarea.idMaquina !== 'NA' && <p><strong>ID de máquina:</strong> {tarea.idMaquina}</p>}
                              {tarea.nombreMaquina && tarea.nombreMaquina !== 'NA' && <p><strong>Máquina:</strong> {tarea.nombreMaquina}</p>}
                              {tarea.ubicacion && tarea.ubicacion !== 'NA' && <p><strong>Ubicación:</strong> {tarea.ubicacion}</p>}
                              {tarea.notaTecnica && tarea.notaTecnica !== 'NA' && <p><strong>Nota técnica:</strong> {tarea.notaTecnica}</p>}
                              {tarea.observaciones && tarea.observaciones !== 'NA' && <p><strong>Observaciones:</strong> {tarea.observaciones}</p>}
                            </div>
                          </div>
                        </div>
                      )}
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
