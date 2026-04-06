import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTareasAdminPorRango, eliminarTarea } from './services/tareaService';
import AdminHeader from './AdminHeader';
import Sidebar from './Sidebar';
import { useAuth } from './hooks/useAuth';
import * as XLSX from 'xlsx';
import './Panel.css';
import './ExportarEliminarTareas.css';

const formatFechaHora = (isoString) => {
  if (!isoString) return 'NA';
  const fecha = new Date(isoString);
  const opcionesFecha = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: false };
  return `${fecha.toLocaleDateString('es-CO', opcionesFecha)} ${fecha.toLocaleTimeString('es-CO', opcionesHora)}`;
};

const esTareaArchivada = (tarea) => {
  const estado = (tarea?.estado || '').toString().trim().toLowerCase();
  return estado === 'archivado' || estado === 'archivada';
};

function ExportarEliminarTareasAdmin() {
  const { logout } = useAuth();
  const [tareas, setTareas] = useState([]);
  const [todasLasTareas, setTodasLasTareas] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [expandedTasks, setExpandedTasks] = useState([]);
  const [closingTaskId, setClosingTaskId] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [tareaSeleccionadas, setTareasSeleccionadas] = useState(new Set());
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const navigate = useNavigate();

  const cargarTareasEnRango = async () => {
    setCargando(true);
    setError('');
    try {
      if (!fechaInicio || !fechaFin) {
        setError('Por favor selecciona ambas fechas');
        setCargando(false);
        return;
      }

      const data = await getTareasAdminPorRango(fechaInicio, fechaFin);
      const tareasArchivadas = data.filter(esTareaArchivada);
      setTareas(tareasArchivadas);
      setTodasLasTareas(tareasArchivadas);
      setTareasSeleccionadas(new Set());
    } catch (err) {
      console.error('❌ Error cargando tareas:', err);
      setError(err?.detalle || 'Error al cargar tareas');
      if ([401, 403].includes(err?.status)) {
        logout();
        navigate('/login');
      }
    } finally {
      setCargando(false);
    }
  };

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

  const toggleTareaSeleccionada = (id) => {
    const nuevas = new Set(tareaSeleccionadas);
    if (nuevas.has(id)) {
      nuevas.delete(id);
    } else {
      nuevas.add(id);
    }
    setTareasSeleccionadas(nuevas);
  };

  const seleccionarTodas = () => {
    if (tareaSeleccionadas.size === tareas.length) {
      setTareasSeleccionadas(new Set());
    } else {
      setTareasSeleccionadas(new Set(tareas.map((t) => t.id)));
    }
  };

  const exportarAExcel = () => {
    if (tareaSeleccionadas.size === 0) {
      setError('Por favor selecciona al menos una tarea para exportar');
      return;
    }

    const tareasAExportar = tareas.filter((t) => tareaSeleccionadas.has(t.id));

    const datosParaExportar = tareasAExportar.map((tarea) => ({
      'ID': tarea.id,
      'Título': tarea.titulo,
      'Descripción': tarea.descripcion || 'NA',
      'Colaborador': tarea.nombreColaborador || 'NA',
      'Correo': tarea.correoColaborador || 'NA',
      'ID Máquina': tarea.idMaquina || 'NA',
      'Máquina': tarea.nombreMaquina || 'NA',
      'Ubicación': tarea.ubicacion || 'NA',
      'Estado': tarea.estado || 'NA',
      'Urgencia': tarea.urgencia || 'NA',
      'Fecha Inicio': formatFechaHora(tarea.fechaInicio),
      'Fecha Fin': formatFechaHora(tarea.fechaFin),
      'Observaciones': tarea.observaciones || 'NA',
    }));

    const hoja = XLSX.utils.json_to_sheet(datosParaExportar);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Tareas');

    const nombreArchivo = `Tareas_${fechaInicio}_a_${fechaFin}_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(libro, nombreArchivo);

    setError('');
  };

  const eliminarTareasSeleccionadas = async () => {
    if (tareaSeleccionadas.size === 0) {
      setError('Por favor selecciona al menos una tarea para eliminar');
      return;
    }

    setCargando(true);
    try {
      const tareaIds = Array.from(tareaSeleccionadas);
      await Promise.all(tareaIds.map((id) => eliminarTarea(id)));
      
      // Actualizar lista local
      setTareas(tareas.filter((t) => !tareaSeleccionadas.has(t.id)));
      setTodasLasTareas(todasLasTareas.filter((t) => !tareaSeleccionadas.has(t.id)));
      setTareasSeleccionadas(new Set());
      setMostrarConfirmacion(false);
      setError('');
    } catch (err) {
      console.error('❌ Error eliminando tareas:', err);
      setError(err?.detalle || 'Error al eliminar tareas');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="admin-wrapper">
      <AdminHeader onToggleSidebar={() => setSidebarVisible(!sidebarVisible)} />

      <div className="admin-body">
        <Sidebar visible={sidebarVisible} onToggle={() => setSidebarVisible(!sidebarVisible)} onLogout={handleLogout} />

        <main className={`admin-content ${sidebarVisible ? 'con-sidebar' : 'sin-sidebar'}`}>
          <div className="exportar-eliminar-content">
            <h1>Exportar o Eliminar Tareas</h1>

            {/* Sección de filtros por fecha */}
            <div className="filtro-fechas-seccion">
              <h2>Selecciona rango de fechas</h2>
              <div className="filtro-fechas">
                <div className="fecha-group">
                  <label>Desde:</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="fecha-input"
                  />
                </div>

                <div className="fecha-group">
                  <label>Hasta:</label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="fecha-input"
                  />
                </div>

                <button
                  className="btn-filtrar"
                  onClick={cargarTareasEnRango}
                  disabled={cargando || !fechaInicio || !fechaFin}
                >
                  {cargando ? 'Filtrando...' : 'Filtrar'}
                </button>
              </div>

              {error && <div className="error-message">{error}</div>}
            </div>

            {/* Información y acciones */}
            {tareas.length > 0 && (
              <div className="acciones-seccion">
                <div className="info-tareas">
                  <p><strong>Total de tareas:</strong> {tareas.length}</p>
                  <p><strong>Tareas seleccionadas:</strong> {tareaSeleccionadas.size}</p>
                </div>

                <div className="botones-acciones">
                  <button
                    className="btn-seleccionar-todas"
                    onClick={seleccionarTodas}
                    disabled={cargando}
                  >
                    {tareaSeleccionadas.size === tareas.length
                      ? 'Deseleccionar todas'
                      : 'Seleccionar todas'}
                  </button>

                  <button
                    className="btn-exportar"
                    onClick={exportarAExcel}
                    disabled={cargando || tareaSeleccionadas.size === 0}
                  >
                    📥 Exportar a Excel
                  </button>

                  <button
                    className="btn-eliminar"
                    onClick={() => setMostrarConfirmacion(true)}
                    disabled={cargando || tareaSeleccionadas.size === 0}
                  >
                    🗑️ Eliminar Seleccionadas
                  </button>
                </div>
              </div>
            )}

            {/* Modal de confirmación de eliminación */}
            {mostrarConfirmacion && (
              <div className="modal-confirmacion-overlay" onClick={() => setMostrarConfirmacion(false)}>
                <div className="modal-confirmacion" onClick={(e) => e.stopPropagation()}>
                  <h3>⚠️ Confirmar eliminación</h3>
                  <p>¿Estás seguro de que deseas eliminar {tareaSeleccionadas.size} tarea(s)?</p>
                  <p className="advertencia">Esta acción no se puede deshacer.</p>
                  <div className="modal-botones">
                    <button
                      className="btn-cancelar"
                      onClick={() => setMostrarConfirmacion(false)}
                      disabled={cargando}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn-confirmar-eliminar"
                      onClick={eliminarTareasSeleccionadas}
                      disabled={cargando}
                    >
                      {cargando ? 'Eliminando...' : 'Confirmar eliminación'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Grid de tareas */}
            <div className="tareas-grid exportar-grid">
              {tareas.length === 0 && !cargando && fechaInicio && fechaFin ? (
                <p className="mensaje-vacio fade-in">No hay tareas archivadas en el rango de fechas seleccionado.</p>
              ) : tareas.length === 0 ? (
                <p className="mensaje-vacio fade-in">Selecciona un rango de fechas para ver tareas.</p>
              ) : (
                tareas.map((tarea) => {
                  const isExpanded = expandedTasks.includes(tarea.id);
                  const isClosing = closingTaskId === tarea.id;
                  const isSelected = tareaSeleccionadas.has(tarea.id);

                  return (
                    <div
                      key={tarea.id}
                      className={`tarea-card exportar-card ${isSelected ? 'selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        className="tarea-checkbox"
                        checked={isSelected}
                        onChange={() => toggleTareaSeleccionada(tarea.id)}
                      />

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
                            aria-label="Detalle de tarea"
                          >
                            <button
                              className="detalles-cerrar-btn"
                              onClick={() => cerrarDetalles(tarea.id)}
                            >
                              Cerrar
                            </button>

                            <div className="tarea-detalles modal-detalles">
                              <p><strong>Estado:</strong> {tarea.estado || 'NA'}</p>
                              <p><strong>Descripción:</strong> {tarea.descripcion || 'NA'}</p>
                              <p><strong>Colaborador:</strong> {tarea.nombreColaborador || 'NA'}</p>
                              <p><strong>Correo:</strong> {tarea.correoColaborador || 'NA'}</p>
                              <p><strong>Máquina:</strong> {tarea.nombreMaquina || 'NA'}</p>
                              <p><strong>Ubicación:</strong> {tarea.ubicacion || 'NA'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        className="detalles-btn"
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

export default ExportarEliminarTareasAdmin;
