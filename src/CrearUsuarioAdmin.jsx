import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import Sidebar from './Sidebar';
import { crearUsuarioAdmin, listarUsuariosAdmin, listarRolesSistema } from './services/usuarioService';
import { useAuth } from './hooks/useAuth';
import './Panel.css';
import './CrearUsuarioAdmin.css';

const CARGOS = ['Analista', 'Diseñador', 'Gerente', 'Coordinador', 'Supervisor', 'Técnico', 'Otro'];
const AREAS = ['Finanzas', 'Marketing', 'IT', 'Operaciones', 'Recursos Humanos', 'Compras', 'Otro'];
const METADATA_KEY = 'smartmaint_user_profiles';

const defaultForm = {
  idColaborador: '',
  estado: 'Activo',
  nombreCompleto: '',
  correo: '',
  cargo: '',
  area: '',
  telefono: '',
  fechaIngreso: '',
  direccion: '',
  fotoPerfil: '',
  rolSistema: 'Usuario estándar',
};

const buildPassword = (idColaborador) => {
  const seed = (idColaborador || 'SMART').replace(/\s+/g, '').slice(0, 6).toUpperCase();
  return `${seed}#2026`;
};

const CrearUsuarioAdmin = () => {
  const navigate = useNavigate();
  const { role, logout } = useAuth();
  const rolActual = role;
  const esSuperAdmin = rolActual === 'SUPERADMIN';
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [errorMsg, setErrorMsg] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [idsRegistrados, setIdsRegistrados] = useState([]);
  const [roleMap, setRoleMap] = useState({ admin: 1, usuario: 2 });
  const [cargoPersonalizado, setCargoPersonalizado] = useState('');
  const [areaPersonalizada, setAreaPersonalizada] = useState('');
  const [passwordAsignada, setPasswordAsignada] = useState('');
  const contrasenaInicial = buildPassword(form.idColaborador);

  useEffect(() => {
    const rawMetadata = localStorage.getItem(METADATA_KEY);
    if (rawMetadata) {
      try {
        const parsed = JSON.parse(rawMetadata);
        const ids = parsed.map((item) => String(item.idColaborador || '').toLowerCase()).filter(Boolean);
        setIdsRegistrados(ids);
      } catch (err) {
        console.error('No se pudo leer metadata de usuarios:', err);
      }
    }

    Promise.all([listarUsuariosAdmin(), listarRolesSistema()])
      .then(([usuarios, roles]) => {
        const idsDesdeDB = usuarios
          .map((u) => String(u.idColaborador || '').toLowerCase())
          .filter(Boolean);

        setIdsRegistrados((prev) => Array.from(new Set([...prev, ...idsDesdeDB])));

        const map = { admin: 1, usuario: 2 };
        (Array.isArray(roles) ? roles : []).forEach((rol) => {
          const nombre = String(rol?.nombre || '').toUpperCase();
          if (nombre === 'ADMIN' && rol?.id) map.admin = rol.id;
          if (nombre === 'USUARIO' && rol?.id) map.usuario = rol.id;
        });
        setRoleMap(map);
      })
      .catch((err) => {
        console.error('No se pudo obtener mapa de roles:', err);
      });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, fotoPerfil: String(reader.result || '') }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    if (!form.idColaborador.trim()) return 'El ID de colaborador es obligatorio.';
    if (!form.estado) return 'El estado es obligatorio.';
    if (!form.nombreCompleto.trim()) return 'El nombre completo es obligatorio.';
    if (!form.correo.trim()) return 'El correo electrónico corporativo es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) {
      return 'El correo debe tener formato válido.';
    }
    if (!form.cargo) return 'Debes seleccionar un cargo de la lista predefinida.';
    if (form.cargo === 'Otro' && !cargoPersonalizado.trim()) return 'Escribe el cargo personalizado.';
    if (!form.area) return 'Debes seleccionar un área/departamento de la lista predefinida.';
    if (form.area === 'Otro' && !areaPersonalizada.trim()) return 'Escribe el área o departamento personalizado.';
    if (!form.telefono.trim()) return 'El teléfono de contacto es obligatorio.';
    if (!form.fechaIngreso) return 'La fecha de ingreso es obligatoria.';
    if (!form.fotoPerfil) return 'La foto de perfil es obligatoria.';
    if (!form.rolSistema) return 'El rol dentro del sistema es obligatorio.';

    const idNormalized = form.idColaborador.trim().toLowerCase();
    if (idsRegistrados.includes(idNormalized)) {
      return 'El ID de colaborador ya existe. Debe ser único.';
    }

    return '';
  };

  const handleGuardar = async (event) => {
    event.preventDefault();
    setErrorMsg('');

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setSaving(true);
    try {
      const rolKey = form.rolSistema === 'Admin' ? 'admin' : 'usuario';
      const rolId = roleMap[rolKey];
      if (!rolId) {
        throw new Error('No se pudo resolver el rol seleccionado.');
      }
      const contrasenaTemporal = contrasenaInicial;
      const payload = {
        nombre: form.nombreCompleto.trim(),
        correo: form.correo.trim().toLowerCase(),
        contrasena: contrasenaTemporal,
        rolId,
        idColaborador: form.idColaborador.trim(),
        activo: form.estado === 'Activo',
        cargo: form.cargo === 'Otro' ? cargoPersonalizado.trim() : form.cargo,
        area: form.area === 'Otro' ? areaPersonalizada.trim() : form.area,
        telefono: form.telefono.trim(),
        fechaIngreso: form.fechaIngreso,
        direccion: form.direccion.trim(),
        fotoPerfil: form.fotoPerfil,
      };

      const creado = await crearUsuarioAdmin(payload);
      const nuevoIdUsuario = creado?.id || creado?.idUsuario || null;

      const metadataRaw = localStorage.getItem(METADATA_KEY);
      const metadata = metadataRaw ? JSON.parse(metadataRaw) : [];
      const nuevoPerfil = {
        idUsuario: nuevoIdUsuario,
        idColaborador: form.idColaborador.trim(),
        estado: form.estado,
        nombreCompleto: form.nombreCompleto.trim(),
        correo: form.correo.trim().toLowerCase(),
        cargo: form.cargo === 'Otro' ? cargoPersonalizado.trim() : form.cargo,
        area: form.area === 'Otro' ? areaPersonalizada.trim() : form.area,
        telefono: form.telefono.trim(),
        fechaIngreso: form.fechaIngreso,
        direccion: form.direccion.trim(),
        fotoPerfil: form.fotoPerfil,
        rolSistema: form.rolSistema,
      };

      metadata.push(nuevoPerfil);
      localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
      setIdsRegistrados((prev) => [...prev, form.idColaborador.trim().toLowerCase()]);

      setForm(defaultForm);
      setPasswordAsignada(contrasenaTemporal);
      setShowConfirmModal(true);
    } catch (err) {
      setErrorMsg(err?.detalle || 'No se pudo guardar el usuario.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelar = () => {
    navigate('/tareas-asignadas');
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
          <section className="crear-usuario-content page-shell">
            <div className="page-hero">
              <div>
                <p className="page-kicker">Gestión de equipo</p>
                <h1>¡Dale una bienvenida a tu nuevo colaborador!</h1>
                <p className="page-hero-copy">Registra un nuevo usuario en tu empresa y asigna su rol dentro del sistema.</p>
              </div>
            </div>

            <form className="crear-usuario-form" onSubmit={handleGuardar}>
              {errorMsg && <div className="form-error-box">{errorMsg}</div>}

              <div className="campo-group">
                <label htmlFor="idColaborador">ID de colaborador</label>
                <input id="idColaborador" name="idColaborador" value={form.idColaborador} onChange={handleChange} required />
              </div>

              <div className="campo-group">
                <label htmlFor="estado">Estado</label>
                <select id="estado" name="estado" value={form.estado} onChange={handleChange} required>
                  <option value="">Seleccione...</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              <div className="campo-group full">
                <label htmlFor="nombreCompleto">Nombre completo del colaborador</label>
                <input id="nombreCompleto" name="nombreCompleto" value={form.nombreCompleto} onChange={handleChange} required />
              </div>

              <div className="campo-group">
                <label htmlFor="correo">Correo electrónico corporativo</label>
                <input id="correo" type="email" name="correo" value={form.correo} onChange={handleChange} required />
              </div>

              <div className="campo-group">
                <label htmlFor="contrasenaInicial">Contraseña inicial</label>
                <input
                  id="contrasenaInicial"
                  value={contrasenaInicial}
                  readOnly
                  title="Se genera automáticamente a partir del ID de colaborador"
                />
              </div>

              <div className="campo-group">
                <label htmlFor="telefono">Teléfono de contacto</label>
                <input id="telefono" name="telefono" value={form.telefono} onChange={handleChange} required />
              </div>

              <div className="campo-group">
                <label htmlFor="cargo">Cargo en la empresa</label>
                <select id="cargo" name="cargo" value={form.cargo} onChange={handleChange} required>
                  <option value="">Seleccione...</option>
                  {CARGOS.map((cargo) => (
                    <option key={cargo} value={cargo}>{cargo}</option>
                  ))}
                </select>
                {form.cargo === 'Otro' && (
                  <input
                    type="text"
                    placeholder="Escribe el cargo"
                    value={cargoPersonalizado}
                    onChange={(e) => setCargoPersonalizado(e.target.value)}
                    style={{ marginTop: '0.5rem' }}
                    required
                  />
                )}
              </div>

              <div className="campo-group">
                <label htmlFor="area">Área o departamento</label>
                <select id="area" name="area" value={form.area} onChange={handleChange} required>
                  <option value="">Seleccione...</option>
                  {AREAS.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
                {form.area === 'Otro' && (
                  <input
                    type="text"
                    placeholder="Escribe el área o departamento"
                    value={areaPersonalizada}
                    onChange={(e) => setAreaPersonalizada(e.target.value)}
                    style={{ marginTop: '0.5rem' }}
                    required
                  />
                )}
              </div>

              <div className="campo-group">
                <label htmlFor="fechaIngreso">Fecha de ingreso</label>
                <input id="fechaIngreso" type="date" name="fechaIngreso" value={form.fechaIngreso} onChange={handleChange} required />
              </div>

              <div className="campo-group">
                <label htmlFor="rolSistema">Rol dentro del sistema</label>
                <select
                  id="rolSistema"
                  name="rolSistema"
                  value={form.rolSistema}
                  onChange={handleChange}
                  disabled={!esSuperAdmin}
                  required
                >
                  <option value="Usuario estándar">Usuario estándar</option>
                  {esSuperAdmin && <option value="Admin">Admin</option>}
                </select>
              </div>

              <div className="campo-group">
                <label htmlFor="fotoPerfil">Foto de perfil</label>
                <input id="fotoPerfil" type="file" accept="image/*" onChange={handleFoto} required />
              </div>

              <div className="campo-group full">
                <label htmlFor="direccion">Dirección (opcional)</label>
                <textarea id="direccion" name="direccion" value={form.direccion} onChange={handleChange} />
              </div>

              <div className="acciones-form">
                <button type="button" className="btn-cancelar" onClick={handleCancelar}>Cancelar</button>
                <button type="submit" className="btn-guardar" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar usuario'}
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>

      {showConfirmModal && (
        <div className="confirm-modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Usuario creado correctamente</h3>
            <div className="confirm-modal-circulo">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline
                  points="20 6 9 17 4 12"
                  stroke="#004080"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="confirm-modal-pass"><strong>Contraseña temporal:</strong> {passwordAsignada}</p>
            <button type="button" onClick={() => setShowConfirmModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearUsuarioAdmin;
