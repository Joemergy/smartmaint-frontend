// src/UsuarioPanel.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import UserSidebar from './UserSidebar';
import TaskFilters from './components/admin/TaskFilters';
import Card from './components/ui/Card';
import UsuarioTaskCard from './components/usuario/UsuarioTaskCard';
import TaskNotesModal from './components/usuario/TaskNotesModal';
import { esTareaArchivada, estados, fieldOptions, formatFechaHora, getCampoTexto, statusOptions, urgencias } from './components/usuario/usuarioPanelConfig';
import { useAuth } from './hooks/useAuth';
import './Panel.css';
import './UsuarioPanel.css';
import { getTareasAsignadas, actualizarEstado, getNotasTarea, crearNotaTarea } from './services/tareaService';
import { API_BASE_URL } from './services/apiClient';

const UsuarioPanel = () => {
  const { session, logout } = useAuth();
  const [tareasBase, setTareasBase] = useState([]);
  const [tareasAsignadas, setTareasAsignadas] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [filtroCampo, setFiltroCampo] = useState('idColaborador');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [ordenFecha, setOrdenFecha] = useState('reciente');
  const [closingTaskId, setClosingTaskId] = useState(null);
  const [modalNota, setModalNota] = useState({ open: false, tareaId: null, texto: '', guardando: false, notas: [], cargandoNotas: false });
  const [notaSuccess, setNotaSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const resolverSesionExpirada = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const cargarTareas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getTareasAsignadas();
      const tareasActivas = data.filter((t) => !esTareaArchivada(t));
      const tareasNormalizadas = tareasActivas.map((t) => ({ ...t, mostrarDetalles: false }));
      setTareasBase(tareasNormalizadas);
      setTareasAsignadas(tareasNormalizadas);
    } catch (err) {
      console.error('❌ Error cargando tareas:', err);
      setError(err?.detalle || err?.message || 'No se pudieron cargar las tareas');
      if ([401, 403].includes(err?.status)) {
        resolverSesionExpirada();
      }
    } finally {
      setIsLoading(false);
    }
  }, [resolverSesionExpirada]);

  useEffect(() => {
    cargarTareas();
    const intervalId = window.setInterval(cargarTareas, 20000);
    return () => window.clearInterval(intervalId);
  }, [cargarTareas]);



  const abrirDetalles = (id) => {
    setClosingTaskId(null);
    setTareasAsignadas((prev) =>
      prev.map((t) => ({ ...t, mostrarDetalles: t.id === id }))
    );
  };

  const cerrarDetalles = (id) => {
    setClosingTaskId(id);
    setTimeout(() => {
      setClosingTaskId(null);
      setTareasAsignadas((prev) =>
        prev.map((t) => (t.id === id ? { ...t, mostrarDetalles: false } : t))
      );
    }, 220);
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    if (nuevoEstado === 'Archivado') {
      alert('Para enviar una tarea al historial, usa el botón Archivar.');
      return;
    }
    try {
      await actualizarEstado(id, nuevoEstado);
      alert(`✅ Estado actualizado a ${nuevoEstado}`);
      await cargarTareas();
    } catch (err) {
      console.error('❌ Error actualizando estado:', err);
      alert(err?.detalle || err?.message || 'No se pudo actualizar el estado');
      if ([401, 403].includes(err?.status)) {
        resolverSesionExpirada();
      }
    }
  };

  const archivarTarea = async (id) => {
    try {
      await actualizarEstado(id, 'Archivado');
      alert('📦 Tarea archivada');
      await cargarTareas();
    } catch (err) {
      console.error('❌ Error archivando tarea:', err);
      alert(err?.detalle || err?.message || 'No se pudo archivar la tarea');
      if ([401, 403].includes(err?.status)) {
        resolverSesionExpirada();
      }
    }
  };

  const aplicarFiltros = () => {
    let tareas = [...tareasBase];

    if (filtroTexto) {
      tareas = tareas.filter((t) =>
        getCampoTexto(t, filtroCampo).toLowerCase().includes(filtroTexto.toLowerCase())
      );
    }

    if (filtroEstado) {
      tareas = tareas.filter((t) => t.estado === filtroEstado);
    }

    if (filtroFecha) {
      tareas = tareas.filter((t) => {
        if (!t.fechaInicio) return false;
        const d = new Date(t.fechaInicio);
        const fechaLocal = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return fechaLocal === filtroFecha;
      });
    }

    tareas.sort((a, b) => {
      const fechaA = new Date(a.fechaInicio);
      const fechaB = new Date(b.fechaInicio);
      return ordenFecha === 'reciente' ? fechaB - fechaA : fechaA - fechaB;
    });

    setTareasAsignadas(tareas.map((t) => ({ ...t, mostrarDetalles: false })));
  };

  const abrirModalNota = async (tarea) => {
    setModalNota({ open: true, tareaId: tarea.id, texto: '', guardando: false, notas: [], cargandoNotas: true });
    try {
      const notas = await getNotasTarea(tarea.id);
      setModalNota(prev => ({ ...prev, notas, cargandoNotas: false }));
    } catch {
      setModalNota(prev => ({ ...prev, cargandoNotas: false }));
    }
  };

  const cerrarModalNota = () => {
    if (modalNota.guardando) return;
    setModalNota({ open: false, tareaId: null, texto: '', guardando: false, notas: [], cargandoNotas: false });
  };

  const guardarNota = async () => {
    if (modalNota.guardando || !modalNota.texto.trim()) return;
    setModalNota(prev => ({ ...prev, guardando: true }));
    try {
      const nombreUsuario = session?.correo?.split('@')[0] || session?.correo || 'Usuario';
      const nuevaNota = await crearNotaTarea(modalNota.tareaId, modalNota.texto, nombreUsuario);
      setModalNota(prev => ({
        ...prev,
        texto: '',
        guardando: false,
        notas: [...prev.notas, nuevaNota]
      }));
      setNotaSuccess(true);
      setTimeout(() => setNotaSuccess(false), 3000);
    } catch (err) {
      console.error('❌ Error guardando nota:', err);
      alert(err?.detalle || err?.message || 'No se pudo guardar la nota');
      setModalNota(prev => ({ ...prev, guardando: false }));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="usuario-wrapper">
      <AdminHeader onToggleSidebar={() => setSidebarVisible(!sidebarVisible)} />

      <div className="admin-body">
        <UserSidebar visible={sidebarVisible} onLogout={handleLogout} onToggle={() => setSidebarVisible((prev) => !prev)} />

        <main className={`admin-content ${sidebarVisible ? 'con-sidebar' : 'sin-sidebar'}`}>
          <div className="content-section page-shell">
            <section className="page-hero">
              <div>
                <p className="page-kicker">Mis tareas</p>
                <h1>Gestiona tus tareas activas y registra el avance</h1>
                <p className="page-hero-copy">Actualiza estados, agrega notas y archiva tareas completadas desde aquí.</p>
              </div>
            </section>

            {error && <div className="usuario-panel-error">{error}</div>}

            <TaskFilters
              className="panel-filtros"
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
              onFiltrar={aplicarFiltros}
              fieldOptions={fieldOptions}
              statusOptions={statusOptions}
            />

            <div className="cuadro-tareas panel-usuario-tareas">
              {isLoading ? (
                <Card className="usuario-empty-card">
                  <p className="mensaje-vacio fade-in">Cargando tus tareas...</p>
                </Card>
              ) : tareasAsignadas.length === 0 ? (
                <p className="mensaje-vacio fade-in">No tienes tareas asignadas por el momento</p>
              ) : (
                tareasAsignadas.map((tarea) => {
                  const urgenciaObj = urgencias[tarea.prioridad] || { color: '#ccc', icon: '❔' };
                  const isClosing = closingTaskId === tarea.id;

                  return (
                    <UsuarioTaskCard
                      key={tarea.id}
                      tarea={tarea}
                      estados={estados}
                      urgenciaObj={urgenciaObj}
                      formatFechaHora={formatFechaHora}
                      isClosing={isClosing}
                      apiBaseUrl={API_BASE_URL}
                      onAbrirDetalles={abrirDetalles}
                      onCerrarDetalles={cerrarDetalles}
                      onCambiarEstado={cambiarEstado}
                      onAbrirNotas={abrirModalNota}
                      onArchivar={archivarTarea}
                    />
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>

      <TaskNotesModal
        modalNota={modalNota}
        notaSuccess={notaSuccess}
        onClose={cerrarModalNota}
        onSave={guardarNota}
        onChangeTexto={(texto) => setModalNota((prev) => ({ ...prev, texto }))}
        onDismissSuccess={() => setNotaSuccess(false)}
      />
    </div>
  );
};

export default UsuarioPanel;
