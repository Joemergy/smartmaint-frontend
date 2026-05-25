import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Panel.css';
import TaskFilters from './components/admin/TaskFilters';
import TaskList from './components/admin/TaskList';
import { getTareasAdmin, actualizarEstado } from './services/tareaService';
import AdminHeader from './AdminHeader';
import Sidebar from './Sidebar';
import { useAuth } from './hooks/useAuth';

const esTareaArchivada = (tarea) => {
  const estado = (tarea?.estado || '').toString().trim().toLowerCase();
  return estado === 'archivado' || estado === 'archivada';
};

const TareasAsignadasAdmin = () => {
  const { logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [tareasAsignadas, setTareasAsignadas] = useState([]);
  const [filtroCampo, setFiltroCampo] = useState('idColaborador');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [ordenFecha, setOrdenFecha] = useState('reciente');
  const navigate = useNavigate();

  const cargarTareas = useCallback(async () => {
    try {
      const data = await getTareasAdmin();
      const tareasActivas = data.filter((t) => !esTareaArchivada(t));
      setTareasAsignadas(tareasActivas.map((t) => ({ ...t, mostrarDetalles: false })));
    } catch (err) {
      console.error('❌ Error cargando tareas:', err);
      alert('No se pudieron cargar las tareas');
      if (err?.status === 401 || err?.status === 403) {
        logout();
        navigate('/login');
      }
    }
  }, [logout, navigate]);

  useEffect(() => {
    cargarTareas();
    const intervalo = setInterval(cargarTareas, 15000);

    return () => clearInterval(intervalo);
  }, [cargarTareas]);

  const abrirDetalles = (id) => {
    setTareasAsignadas((prev) =>
      prev.map((t) => ({ ...t, mostrarDetalles: t.id === id }))
    );
  };

  const cerrarDetallesById = (id) => {
    setTareasAsignadas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, mostrarDetalles: false } : t))
    );
  };

  const archivarTarea = async (id) => {
    try {
      await actualizarEstado(id, 'Archivado');
      alert('📦 Tarea archivada');
      await cargarTareas();
    } catch (err) {
      console.error('❌ Error archivando tarea:', err);
      alert('No se pudo archivar la tarea');
    }
  };

  const handleFiltrar = () => {
    let tareas = [...tareasAsignadas];

    if (filtroTexto) {
      tareas = tareas.filter((t) =>
        String(t[filtroCampo] || '').toLowerCase().includes(filtroTexto.toLowerCase())
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-wrapper">
      <AdminHeader onToggleSidebar={() => setSidebarVisible((prev) => !prev)} />

      <div className="admin-body">
        <Sidebar visible={sidebarVisible} onToggle={() => setSidebarVisible((prev) => !prev)} onLogout={handleLogout} />

        <main className={`admin-content ${sidebarVisible ? 'con-sidebar' : 'sin-sidebar'}`}>
          <div className="page-shell">
            <section className="page-hero">
              <div>
                <p className="page-kicker">Gestión operativa</p>
                <h1>Revisa las tareas que has asignado a cada colaborador</h1>
                <p className="page-hero-copy">Consulta, filtra y gestiona las tareas activas de todos los colaboradores de tu empresa.</p>
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

            <TaskList
              tareas={tareasAsignadas}
              onToggleDetalles={abrirDetalles}
              onCerrarDetalles={cerrarDetallesById}
              onArchivar={archivarTarea}
              onRecargar={cargarTareas}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TareasAsignadasAdmin;
