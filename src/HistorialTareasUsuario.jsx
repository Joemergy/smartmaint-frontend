import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTareasAsignadas } from './services/tareaService';
import AdminHeader from './AdminHeader';
import UserSidebar from './UserSidebar';
import TaskFilters from './components/admin/TaskFilters';
import { useAuth } from './hooks/useAuth';
import './Panel.css';
import './HistorialTareasUsuario.css';

const formatFechaHora = (isoString) => {
  if (!isoString) return 'NA';
  const fecha = new Date(isoString);
  const opcionesFecha = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: false };
  return `${fecha.toLocaleDateString('es-CO', opcionesFecha)} ${fecha.toLocaleTimeString('es-CO', opcionesHora)}`;
};

function HistorialTareasUsuario() {
  const { logout } = useAuth();
  const [tareas, setTareas] = useState([]);
  const [todasLasTareas, setTodasLasTareas] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [expandedTasks, setExpandedTasks] = useState([]);
  const [filtroCampo, setFiltroCampo] = useState('idColaborador');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [ordenFecha, setOrdenFecha] = useState('reciente');
  const [closingTaskId, setClosingTaskId] = useState(null);
  const navigate = useNavigate();

  const esTareaArchivada = (tarea) => {
    const estado = (tarea.estado || '').toLowerCase();
    return estado === 'archivado' || estado === 'archivada';
  };

  const cargarHistorialUsuario = useCallback(async () => {
    try {
      const data = await getTareasAsignadas();
      const tareasArchivadas = data.filter(esTareaArchivada);
      setTareas(tareasArchivadas);
      setTodasLasTareas(tareasArchivadas);
    } catch (err) {
      console.error('❌ Error cargando historial usuario:', err);
      if ([401, 403].includes(err?.status)) {
        logout();
        navigate('/login');
      }
    }
  }, [logout, navigate]);

  useEffect(() => {
    cargarHistorialUsuario();
    const intervalo = setInterval(cargarHistorialUsuario, 15000);
    return () => clearInterval(intervalo);
  }, [cargarHistorialUsuario]);

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

  const handleFiltrar = () => {
    let tareasFiltradas = [...todasLasTareas];

    if (filtroTexto) {
      tareasFiltradas = tareasFiltradas.filter((tarea) =>
        String(tarea[filtroCampo] || '').toLowerCase().includes(filtroTexto.toLowerCase())
      );
    }

    if (filtroEstado) {
      tareasFiltradas = tareasFiltradas.filter((tarea) => tarea.estado === filtroEstado);
    }

    if (filtroFecha) {
      tareasFiltradas = tareasFiltradas.filter((tarea) => {
        if (!tarea.fechaInicio) return false;
        const d = new Date(tarea.fechaInicio);
        const fechaLocal = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return fechaLocal === filtroFecha;
      });
    }

    tareasFiltradas.sort((a, b) => {
      const fechaA = new Date(a.fechaInicio);
      const fechaB = new Date(b.fechaInicio);
      return ordenFecha === 'reciente' ? fechaB - fechaA : fechaA - fechaB;
    });

    setExpandedTasks([]);
    setTareas(tareasFiltradas);
  };

  return (
    <div className="admin-wrapper">
      <AdminHeader onToggleSidebar={() => setSidebarVisible(!sidebarVisible)} />

      <div className="admin-body">
        <UserSidebar visible={sidebarVisible} onLogout={handleLogout} onToggle={() => setSidebarVisible((prev) => !prev)} />

        <main className={`admin-content ${sidebarVisible ? 'con-sidebar' : 'sin-sidebar'}`}>
          <div className="historial-usuario-content page-shell">
            <section className="page-hero">
              <div>
                <p className="page-kicker">Tu historial</p>
                <h1>Visualiza tus tareas completadas y archivadas</h1>
                <p className="page-hero-copy">Revisa el registro de tus tareas cerradas y el historial de tu actividad operativa.</p>
              </div>
            </section>

            <TaskFilters
              filtroCampo={filtroCampo}
              setFiltroCampo={setFiltroCampo}
              filtroTexto={filtroTexto}
              setFiltroTexto={setFiltroTexto}
              filtroFecha={filtroFecha}
              setFiltroFecha={setFiltroFecha}
              filtroEstado={filtroEstado}
              setFiltroEstado={setFiltroEstado}
              ordenFecha={ordenFecha}
              setOrdenFecha={setOrdenFecha}
              onFiltrar={handleFiltrar}
            />

            <div className="tareas-grid historial-usuario-grid">
                {tareas.length === 0 ? (
                  <p className="mensaje-vacio fade-in">No hay tareas en el historial para mostrar.</p>
                ) : (
                  tareas.map((tarea) => {
                    const isExpanded = expandedTasks.includes(tarea.id);
                    const isClosing = closingTaskId === tarea.id;

                    return (
                      <div key={tarea.id} className="tarea-card historial-usuario-card">
                        <p><strong>Título:</strong> {tarea.titulo}</p>
                        <p><strong>Inicio:</strong> {formatFechaHora(tarea.fechaInicio)}</p>
                        <p><strong>Estado:</strong> {tarea.estado || 'NA'}</p>
                        <p><strong>ID de colaborador:</strong> {tarea.idColaborador || 'NA'}</p>
                        <p><strong>Urgencia:</strong> {tarea.urgencia || 'NA'}</p>

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
                              aria-label="Detalle de tarea del historial"
                            >
                              <button className="detalles-cerrar-btn" type="button" onClick={() => cerrarDetalles(tarea.id)}>
                                Cerrar
                              </button>

                              <div className="tarea-detalles modal-detalles">
                                <p><strong>Estado:</strong> {tarea.estado || 'NA'}</p>
                                <p><strong>Descripción:</strong> {tarea.descripcion || 'NA'}</p>
                                <p><strong>Colaborador:</strong> {tarea.nombreColaborador || 'NA'}</p>
                                <p><strong>Correo:</strong> {tarea.correoColaborador || 'NA'}</p>
                                <p><strong>Máquina:</strong> {tarea.nombreMaquina || 'NA'}</p>
                                <p><strong>ID de máquina:</strong> {tarea.idMaquina || 'NA'}</p>
                                <p><strong>Ubicación:</strong> {tarea.ubicacion || 'NA'}</p>
                                <p><strong>Observaciones:</strong> {tarea.observaciones || 'NA'}</p>
                                <p><strong>Nota técnica:</strong> {tarea.notaTecnica || 'NA'}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <button
                          className="detalles-btn"
                          type="button"
                          onClick={() => (isExpanded ? cerrarDetalles(tarea.id) : abrirDetalles(tarea.id))}
                        >
                          {isExpanded ? 'Cerrar detalles' : 'Ver más detalles'}
                        </button>
                      </div>
                    );
                  })
                )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default HistorialTareasUsuario;
