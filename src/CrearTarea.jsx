// src/CrearTarea.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CrearTarea.css';
import { crearTarea } from './services/tareaService'; // ✅ conexión backend
import { listarColaboradoresAdmin } from './services/usuarioService';
import './Panel.css';
import AdminHeader from './AdminHeader';
import Sidebar from './Sidebar';
import { useAuth } from './hooks/useAuth';
import Card from './components/ui/Card';
import Button from './components/ui/Button';
import InputField from './components/ui/InputField';
import Modal from './components/ui/Modal';

const CrearTarea = () => {
  const { logout } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [idColaborador, setIdColaborador] = useState('');
  const [nombreColaborador, setNombreColaborador] = useState('');
  const [correoColaborador, setCorreoColaborador] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [idMaquina, setIdMaquina] = useState('');
  const [nombreMaquina, setNombreMaquina] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [estado, setEstado] = useState('Pendiente');
  const [notaTecnica, setNotaTecnica] = useState('');
  const [grupal, setGrupal] = useState(false);
  const [colaboradoresGrupales, setColaboradoresGrupales] = useState([]);
  const [observaciones, setObservaciones] = useState('');
  const [archivos, setArchivos] = useState([]);
  const [entregaEstimada, setEntregaEstimada] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [colaboradores, setColaboradores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    listarColaboradoresAdmin()
      .then((data) => {
        setColaboradores(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error('Error cargando colaboradores:', err));
  }, []);

  const handleSeleccionarColaborador = (idSeleccionado) => {
    const col = colaboradores.find((c) => String(c.idColaborador) === String(idSeleccionado));
    if (col) {
      setNombreColaborador(col.nombreCompleto || '');
      setIdColaborador(col.idColaborador || '');
      setCorreoColaborador(col.correo || '');
    } else {
      setNombreColaborador('');
      setIdColaborador('');
      setCorreoColaborador('');
    }
  };

  const handleToggleColaboradorGrupal = (col) => {
    setColaboradoresGrupales((prev) => {
      const exists = prev.some((c) => c.idColaborador === col.idColaborador);
      return exists ? prev.filter((c) => c.idColaborador !== col.idColaborador) : [...prev, col];
    });
  };

  const handleFileChange = (e) => {
    setArchivos([...e.target.files]);
  };

  const formateaFecha = (fecha) => {
    if (!fecha) {
      return null;
    }

    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString().slice(0, 19);
  };

  const validarFormulario = () => {
    if (!titulo.trim()) {
      setErrorMessage('Falta el título');
      return false;
    }
    if (!descripcion.trim()) {
      setErrorMessage('Falta la descripción');
      return false;
    }
    if (!nombreColaborador) {
      setErrorMessage('Seleccione un colaborador de la lista');
      return false;
    }
    const colCoincide = colaboradores.find(
      (c) =>
        c.nombreCompleto === nombreColaborador &&
        String(c.idColaborador) === String(idColaborador) &&
        c.correo === correoColaborador
    );
    if (!colCoincide) {
      setErrorMessage('Los datos de correo, nombre e ID de colaborador no coinciden. Seleccione un colaborador válido de la lista.');
      return false;
    }
    if (!fechaInicio) {
      setErrorMessage('Falta la fecha de inicio');
      return false;
    }

    const fechaISO = formateaFecha(fechaInicio);
    if (!fechaISO) {
      setErrorMessage("Formato de fecha inválido. Usa yyyy-MM-dd'T'HH:mm:ss");
      return false;
    }

    setErrorMessage('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    const fechaISO = formateaFecha(fechaInicio);
    if (!fechaISO) {
      setErrorMessage("Formato de fecha inválido. Usa yyyy-MM-dd'T'HH:mm:ss");
      return;
    }

    // 🔄 Usamos FormData para enviar binarios
    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("descripcion", descripcion);
    formData.append("idColaborador", idColaborador);
    formData.append("nombreColaborador", nombreColaborador);
    formData.append("correoColaborador", correoColaborador);
    formData.append("fechaInicio", fechaISO);
    if (entregaEstimada) formData.append("entregaEstimada", formateaFecha(entregaEstimada));
    formData.append("idMaquina", idMaquina || "NA");
    formData.append("nombreMaquina", nombreMaquina || "NA");
    formData.append("ubicacion", ubicacion || "NA");
    formData.append("categoria", categoria);
    formData.append("estado", estado);
    formData.append("notaTecnica", notaTecnica);
    formData.append("grupal", grupal);
    formData.append("observaciones", observaciones);

    archivos.forEach((file) => {
      formData.append("archivos", file); // 🔄 aquí van los binarios
    });

    try {
      // Create the main task for the primary collaborator
      await crearTarea(formData);

      // If grupal, also create a task copy for each additional collaborator
      if (grupal && colaboradoresGrupales.length > 0) {
        await Promise.all(colaboradoresGrupales.map((col) => {
          const fd = new FormData();
          fd.append("titulo", titulo);
          fd.append("descripcion", descripcion);
          fd.append("idColaborador", col.idColaborador);
          fd.append("nombreColaborador", col.nombreCompleto);
          fd.append("correoColaborador", col.correo);
          fd.append("fechaInicio", fechaISO);
          if (entregaEstimada) fd.append("entregaEstimada", formateaFecha(entregaEstimada));
          fd.append("idMaquina", idMaquina || "NA");
          fd.append("nombreMaquina", nombreMaquina || "NA");
          fd.append("ubicacion", ubicacion || "NA");
          fd.append("categoria", categoria);
          fd.append("estado", estado);
          fd.append("notaTecnica", notaTecnica);
          fd.append("grupal", grupal);
          fd.append("observaciones", observaciones);
          archivos.forEach((file) => { fd.append("archivos", file); });
          return crearTarea(fd);
        }));
      }

      setSuccessMessage('Tarea creada correctamente.');
      setTimeout(() => setSuccessMessage(''), 3000);
      setErrorMessage('');


      // Resetear campos
      setTitulo('');
      setDescripcion('');
      setIdColaborador('');
      setNombreColaborador('');
      setCorreoColaborador('');
      setFechaInicio('');
      setIdMaquina('');
      setNombreMaquina('');
      setUbicacion('');
      setCategoria('');
      setEstado('Pendiente');
      setNotaTecnica('');
      setGrupal(false);
      setColaboradoresGrupales([]);
      setObservaciones('');
      setArchivos([]);
      setEntregaEstimada('');
    } catch (err) {
      console.error("❌ Error creando tarea:", err);
      const detalle = err?.detalle || err?.message || 'No se pudo crear la tarea';
      if (detalle.includes('título')) {
        setErrorMessage('Falta el título o está vacío');
      } else if (detalle.includes('descripción')) {
        setErrorMessage('Falta la descripción o está vacía');
      } else if (detalle.includes('fecha')) {
        setErrorMessage('Formato de fecha inválido');
      } else if (detalle.includes('colaborador')) {
        setErrorMessage('Falta el colaborador (ID o correo)');
      } else {
        setErrorMessage(detalle);
      }
      setSuccessMessage('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
    <div className="admin-wrapper">
      <AdminHeader onToggleSidebar={() => setSidebarVisible((prev) => !prev)} />

      <div className="admin-body">
        <Sidebar visible={sidebarVisible} onToggle={() => setSidebarVisible((prev) => !prev)} onLogout={handleLogout} />

        <main className={`admin-content ${sidebarVisible ? 'con-sidebar' : 'sin-sidebar'}`}>
          <div className="content-section crear-tarea-page sm-panel-shell">
            <Card variant="panel" padding="lg" className="form-container crear-tarea-card">
              <div className="crear-tarea-header sm-section-heading">
                <span className="sm-eyebrow">Operación de tareas</span>
                <h1 className="sm-section-title crear-tarea-title">Crear una tarea con contexto completo y trazabilidad.</h1>
                <p className="sm-section-copy crear-tarea-copy">
                  Asigna responsables, fecha, máquina y observaciones desde una sola vista pensada para operación real.
                </p>
              </div>

              {errorMessage && <div className="form-error">⚠️ {errorMessage}</div>}

              <form onSubmit={handleSubmit} className="crear-tarea-form">
                <Card variant="muted" padding="md" className="crear-tarea-section">
                  <div className="sm-section-heading crear-tarea-section-heading">
                    <span className="sm-eyebrow">Datos base</span>
                    <p className="sm-muted-note">Define el objetivo, responsable y ventana de ejecución.</p>
                  </div>

                  <div className="sm-form-grid">
                    <InputField
                      id="titulo"
                      label="Título"
                      placeholder="Ej. Cambio de rodamientos compresor 2"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      required
                    />

                    <InputField
                      as="textarea"
                      id="descripcion"
                      label="Descripción"
                      placeholder="Describe el alcance, contexto y entregable esperado."
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      required
                    />

                    <div className="sm-form-grid-2">
                      <InputField
                        as="select"
                        id="colaborador"
                        label="Nombre del colaborador"
                        value={idColaborador}
                        onChange={(e) => handleSeleccionarColaborador(e.target.value)}
                      >
                        <option value="">Seleccione un colaborador...</option>
                        {colaboradores.map((col) => (
                          <option key={col.id || col.idColaborador} value={col.idColaborador}>
                            {col.nombreCompleto}
                          </option>
                        ))}
                      </InputField>

                      <InputField
                        id="idColaborador"
                        label="ID del colaborador"
                        value={idColaborador}
                        readOnly
                      />
                    </div>

                    <div className="sm-form-grid-2">
                      <InputField
                        id="correoColaborador"
                        label="Correo del colaborador"
                        type="email"
                        value={correoColaborador}
                        readOnly
                        required
                      />

                      <InputField
                        id="fechaInicio"
                        label="Fecha de inicio (con hora)"
                        type="datetime-local"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        required
                      />
                    </div>

                    <InputField
                      id="entregaEstimada"
                      label="Entrega estimada"
                      type="datetime-local"
                      value={entregaEstimada}
                      onChange={(e) => setEntregaEstimada(e.target.value)}
                    />
                  </div>
                </Card>

                <Card variant="muted" padding="md" className="crear-tarea-section">
                  <div className="sm-section-heading crear-tarea-section-heading">
                    <span className="sm-eyebrow">Activo y clasificación</span>
                    <p className="sm-muted-note">Registra la máquina, ubicación y estado inicial para seguimiento.</p>
                  </div>

                  <div className="sm-form-grid-2">
                    <InputField id="idMaquina" label="ID de la máquina (o NA)" value={idMaquina} onChange={(e) => setIdMaquina(e.target.value)} />
                    <InputField id="nombreMaquina" label="Nombre de la máquina (o NA)" value={nombreMaquina} onChange={(e) => setNombreMaquina(e.target.value)} />
                    <InputField id="ubicacion" label="Ubicación (o NA)" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} />

                    <InputField as="select" id="categoria" label="Categoría" value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
                      <option value="">Seleccione...</option>
                      <option value="industrial">Industrial</option>
                      <option value="administrativo">Administrativo</option>
                      <option value="otros">Otros</option>
                    </InputField>

                    <InputField as="select" id="estado" label="Estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
                      <option value="Pendiente">Pendiente</option>
                      <option value="En proceso">En proceso</option>
                      <option value="Completado">Completado</option>
                      <option value="Archivado">Archivado</option>
                    </InputField>

                    <InputField id="notaTecnica" label="Nota técnica" value={notaTecnica} onChange={(e) => setNotaTecnica(e.target.value)} />
                  </div>
                </Card>

                <Card variant="muted" padding="md" className="crear-tarea-section">
                  <div className="sm-section-heading crear-tarea-section-heading">
                    <span className="sm-eyebrow">Colaboración y evidencia</span>
                    <p className="sm-muted-note">Añade observaciones, archivos y define si la tarea se resuelve en equipo.</p>
                  </div>

                  <div className="grupal-options">
                    <span className="sm-input-label">¿Es tarea grupal?</span>
                    <div className="grupal-row">
                      <label className={`sm-choice-card ${grupal === true ? 'is-active' : ''}`}>
                        <input
                          type="radio"
                          name="tareaGrupal"
                          checked={grupal === true}
                          onChange={() => setGrupal(true)}
                        />
                        <span>Sí</span>
                      </label>
                      <label className={`sm-choice-card ${grupal === false ? 'is-active' : ''}`}>
                        <input
                          type="radio"
                          name="tareaGrupal"
                          checked={grupal === false}
                          onChange={() => { setGrupal(false); setColaboradoresGrupales([]); }}
                        />
                        <span>No</span>
                      </label>
                    </div>

                    {grupal && (
                      <InputField
                        as="select"
                        id="colaboradorGrupal"
                        label="Colaborador adicional"
                        value={colaboradoresGrupales[0]?.idColaborador || ''}
                        onChange={(e) => {
                          const col = colaboradores.find((c) => String(c.idColaborador) === String(e.target.value));
                          setColaboradoresGrupales(col ? [col] : []);
                        }}
                      >
                        <option value="">Seleccione un colaborador...</option>
                        {colaboradores
                          .filter((c) => c.idColaborador !== idColaborador)
                          .map((col) => (
                            <option key={col.id || col.idColaborador} value={col.idColaborador}>
                              {col.nombreCompleto}
                            </option>
                          ))}
                      </InputField>
                    )}
                  </div>

                  <div className="sm-form-grid">
                    <InputField
                      as="textarea"
                      id="observaciones"
                      label="Observaciones"
                      placeholder="Agrega notas adicionales para el equipo o para el cierre posterior."
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                    />

                    <InputField
                      id="archivos"
                      label="Anexar archivos"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      hint="Puedes cargar uno o varios archivos de soporte."
                    />
                  </div>
                </Card>

                <div className="sm-form-actions crear-tarea-actions">
                  <Button type="button" variant="ghost" size="lg" onClick={() => navigate('/dashboard-tareas')}>
                    Cancelar
                  </Button>
                  <Button type="submit" size="lg">
                    Crear tarea
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>

      {successMessage && (
        <Modal
          title="Tarea creada correctamente"
          subtitle="La operación fue registrada y ya puede seguirse desde el dashboard e historial."
          onClose={() => setSuccessMessage('')}
          actions={<Button onClick={() => setSuccessMessage('')}>Continuar</Button>}
        >
          <div className="tarea-creada-circulo" aria-hidden="true">
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
        </Modal>
      )}
    </>
  );
};

export default CrearTarea;
