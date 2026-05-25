import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import Sidebar from './Sidebar';
import { listarColaboradoresAdmin, eliminarUsuarioAdmin } from './services/usuarioService';
import { useAuth } from './hooks/useAuth';
import './Panel.css';
import './EliminarUsuarioAdmin.css';

const EliminarUsuarioAdmin = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [filtroId, setFiltroId] = useState('');
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroCorreo, setFiltroCorreo] = useState('');
  const [filtroAplicado, setFiltroAplicado] = useState({ id: '', nombre: '', correo: '' });

  const cargarUsuarios = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await listarColaboradoresAdmin();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err?.detalle || 'No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const usuariosFiltrados = useMemo(() => {
    const id = filtroAplicado.id.trim().toLowerCase();
    const nombre = filtroAplicado.nombre.trim().toLowerCase();
    const correo = filtroAplicado.correo.trim().toLowerCase();

    return usuarios.filter((u) => {
      const coincideId = !id || String(u.idColaborador || '').toLowerCase().includes(id);
      const coincideNombre = !nombre || String(u.nombreCompleto || '').toLowerCase().includes(nombre);
      const coincideCorreo = !correo || String(u.correo || '').toLowerCase().includes(correo);
      return coincideId && coincideNombre && coincideCorreo;
    });
  }, [usuarios, filtroAplicado]);

  const aplicarFiltros = () => {
    setFiltroAplicado({
      id: filtroId,
      nombre: filtroNombre,
      correo: filtroCorreo,
    });
  };

  const limpiarFiltros = () => {
    setFiltroId('');
    setFiltroNombre('');
    setFiltroCorreo('');
    setFiltroAplicado({ id: '', nombre: '', correo: '' });
  };

  const handleEliminar = async (usuario) => {
    const confirmado = window.confirm(
      `¿Seguro que deseas eliminar al colaborador ${usuario.nombreCompleto} (${usuario.idColaborador})? Esta acción no se puede deshacer.`
    );

    if (!confirmado) {
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');

    try {
      await eliminarUsuarioAdmin(usuario.id);
      setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id));
      setSuccessMsg(`Usuario ${usuario.nombreCompleto} eliminado correctamente.`);
    } catch (err) {
      setErrorMsg(err?.detalle || 'No se pudo eliminar el usuario.');
    }
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
          <section className="eliminar-usuario-content page-shell">
            <div className="page-hero">
              <div>
                <p className="page-kicker">Administración de usuarios</p>
                <h1>Administra los colaboradores de tu equipo</h1>
                <p className="page-hero-copy">Busca, verifica y gestiona los colaboradores activos registrados en tu empresa.</p>
              </div>
            </div>

            <div className="panel-filtros eliminar-usuario-filtros">
              <input
                type="text"
                className="filter-field"
                placeholder="ID de colaborador"
                value={filtroId}
                onChange={(e) => setFiltroId(e.target.value)}
              />
              <input
                type="text"
                className="filter-search"
                placeholder="Nombre completo"
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
              />
              <input
                type="text"
                className="filter-search"
                placeholder="Correo de colaborador"
                value={filtroCorreo}
                onChange={(e) => setFiltroCorreo(e.target.value)}
              />
              <button type="button" onClick={aplicarFiltros}>Filtrar</button>
              <button type="button" className="btn-secundario" onClick={limpiarFiltros}>Limpiar</button>
            </div>

            {errorMsg && <div className="form-error-box">{errorMsg}</div>}
            {successMsg && <div className="form-success-box">{successMsg}</div>}

            <div className="eliminar-usuario-tabla-wrapper">
              {loading ? (
                <p className="mensaje-vacio">Cargando usuarios...</p>
              ) : usuariosFiltrados.length === 0 ? (
                <p className="mensaje-vacio">No hay usuarios que coincidan con los filtros.</p>
              ) : (
                <table className="eliminar-usuario-tabla">
                  <thead>
                    <tr>
                      <th>ID colaborador</th>
                      <th>Nombre completo</th>
                      <th>Correo</th>
                      <th>Cargo</th>
                      <th>Rol</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map((usuario) => (
                      <tr key={usuario.id}>
                        <td>{usuario.idColaborador}</td>
                        <td>{usuario.nombreCompleto}</td>
                        <td>{usuario.correo}</td>
                        <td>{usuario.cargo || '—'}</td>
                        <td>{usuario.rol || '—'}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-eliminar-usuario"
                            onClick={() => handleEliminar(usuario)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default EliminarUsuarioAdmin;
