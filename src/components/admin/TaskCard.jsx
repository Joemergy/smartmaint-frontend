import React, { useEffect, useRef, useState } from 'react';
import { actualizarEstado, actualizarTarea } from '../../services/tareaService';

const ESTADOS = ['Pendiente', 'En proceso', 'Completado', 'Cancelado'];
const ESTADO_COLOR = {
  Pendiente: '#e53935',
  'En proceso': '#FFD700',
  Completado: '#43a047',
  Cancelado: '#8e24aa',
};
const CATEGORIAS = ['Mantenimiento preventivo', 'Mantenimiento correctivo', 'Instalación', 'Inspección', 'Otro'];

const formatFechaHora = (isoString) => {
  if (!isoString) return 'NA';
  const fecha = new Date(isoString);
  const opcionesFecha = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: false };
  const fechaStr = fecha.toLocaleDateString('es-CO', opcionesFecha);
  const horaStr = fecha.toLocaleTimeString('es-CO', opcionesHora);
  return `📅 ${fechaStr} ⏰ ${horaStr}`;
};

const toLocalDatetimeValue = (isoString) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch { return ''; }
};

const EstadoAdminDropdown = ({ id, value, onChange }) => {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  const actual = value || 'Pendiente';

  useEffect(() => {
    const handleClickFuera = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  return (
    <div className="estado-admin-custom-dropdown" ref={ref}>
      <button
        id={id}
        type="button"
        className="estado-admin-custom-trigger"
        onClick={() => setAbierto((prev) => !prev)}
      >
        <span>{actual}</span>
        <span className="estado-admin-circulo" style={{ backgroundColor: ESTADO_COLOR[actual] || '#bdbdbd' }} />
        <span className="estado-admin-flecha">▾</span>
      </button>

      {abierto && (
        <ul className="estado-admin-custom-lista">
          {ESTADOS.map((estado) => (
            <li
              key={estado}
              className={`estado-admin-custom-opcion${estado === actual ? ' activo' : ''}`}
              onClick={() => {
                onChange(estado);
                setAbierto(false);
              }}
            >
              {estado}
              <span className="estado-admin-circulo" style={{ backgroundColor: ESTADO_COLOR[estado] || '#bdbdbd' }} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const TaskCard = ({ tarea, onToggleDetalles, onCerrarDetalles, onArchivar, onRecargar }) => {
  const [cerrandoModal, setCerrandoModal] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, guardando: false });
  const [editForm, setEditForm] = useState({});
  const [nuevosArchivos, setNuevosArchivos] = useState([]);

  const abrirDetalles = () => {
    setCerrandoModal(false);
    onToggleDetalles(tarea.id);
  };

  const cerrarDetalles = () => {
    setCerrandoModal(true);
    setTimeout(() => {
      setCerrandoModal(false);
      if (onCerrarDetalles) {
        onCerrarDetalles(tarea.id);
      } else {
        onToggleDetalles(tarea.id);
      }
    }, 220);
  };

  const abrirEditModal = () => {
    setEditForm({
      titulo: tarea.titulo || '',
      descripcion: tarea.descripcion || '',
      fechaInicio: toLocalDatetimeValue(tarea.fechaInicio),
      entregaEstimada: toLocalDatetimeValue(tarea.fechaCierre),
      estado: tarea.estado || '',
      idColaborador: tarea.idColaborador || '',
      nombreColaborador: tarea.nombreColaborador || '',
      correoColaborador: tarea.correoColaborador || '',
      idMaquina: tarea.idMaquina || '',
      nombreMaquina: tarea.nombreMaquina || '',
      ubicacion: tarea.ubicacion || '',
      categoria: tarea.categoria || '',
      notaTecnica: tarea.notaTecnica || '',
      grupal: tarea.grupal || false,
      observaciones: tarea.observaciones || '',
    });
    setNuevosArchivos([]);
    setEditModal({ open: true, guardando: false });
  };

  const cerrarEditModal = () => {
    if (editModal.guardando) return;
    setEditModal({ open: false, guardando: false });
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const guardarEdicion = async () => {
    if (editModal.guardando) return;
    setEditModal(prev => ({ ...prev, guardando: true }));
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => {
        if (k === 'grupal') fd.append(k, v ? 'true' : 'false');
        else if (v !== undefined && v !== null) fd.append(k, v);
      });
      nuevosArchivos.forEach(f => fd.append('archivos', f));
      await actualizarTarea(tarea.id, fd);
      setEditModal({ open: false, guardando: false });
      if (onRecargar) onRecargar();
    } catch (err) {
      console.error('❌ Error actualizando tarea:', err);
      alert(err?.detalle || err?.message || 'No se pudo actualizar la tarea');
      setEditModal(prev => ({ ...prev, guardando: false }));
    }
  };

  const cambiarEstadoRapido = async (nuevoEstado) => {
    if (!nuevoEstado || nuevoEstado === tarea.estado) return;
    try {
      await actualizarEstado(tarea.id, nuevoEstado);
      if (onRecargar) onRecargar();
    } catch (err) {
      console.error('❌ Error cambiando estado:', err);
      alert(err?.detalle || err?.message || 'No se pudo actualizar el estado');
    }
  };

  return (
    <div className="tarea-card">
      <div className="tarea-preview">
        <div className="preview-item"><strong>Título:</strong> {tarea.titulo}</div>
        <div className="preview-item"><strong>Inicio:</strong> {formatFechaHora(tarea.fechaInicio)}</div>
        <div className="preview-item"><strong>Entrega Estimada:</strong> {formatFechaHora(tarea.fechaCierre || tarea.entregaEstimada)}</div>
        <div className="preview-item"><strong>ID de colaborador:</strong> {tarea.idColaborador || 'NA'}</div>
        <div className="preview-item"><strong>Urgencia:</strong> {tarea.urgencia || 'NA'}</div>
      </div>

      <div className="tarea-actions">
        <div className="estado-admin-inline">
          <label htmlFor={`estado-admin-${tarea.id}`}><strong>Estado:</strong></label>
          <EstadoAdminDropdown
            id={`estado-admin-${tarea.id}`}
            value={tarea.estado || 'Pendiente'}
            onChange={cambiarEstadoRapido}
          />
        </div>

        <div className="acciones-admin-right">
          <button
            className="ver-detalles-btn"
            onClick={tarea.mostrarDetalles ? cerrarDetalles : abrirDetalles}
            type="button"
          >
            {tarea.mostrarDetalles ? 'Cerrar detalles' : 'Ver más detalles'}
          </button>
          <button className="admin-editar-btn" onClick={abrirEditModal} type="button">
            Modificar / Agregar nota
          </button>
          <button className="archivar-btn" onClick={() => onArchivar(tarea.id)} type="button">
            Archivar
          </button>
        </div>
      </div>

      {tarea.mostrarDetalles && (
        <div
          className={`detalles-overlay ${cerrandoModal ? 'closing' : 'open'}`}
          onClick={cerrarDetalles}
        >
          <div
            className={`detalles-modal ${cerrandoModal ? 'closing' : 'open'}`}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Detalle de tarea"
          >
            <button className="detalles-cerrar-btn" type="button" onClick={cerrarDetalles}>
              Cerrar
            </button>

            <div className="tarea-detalles modal-detalles">
              {tarea.estado && tarea.estado !== 'NA' && <p><strong>Estado:</strong> {tarea.estado}</p>}
                            {tarea.fechaCierre && tarea.fechaCierre !== 'NA' && <p><strong>Entrega Estimada:</strong> {formatFechaHora(tarea.fechaCierre)}</p>}
              {tarea.descripcion && tarea.descripcion !== 'NA' && <p><strong>Descripción:</strong> {tarea.descripcion}</p>}
              {tarea.nombreColaborador && tarea.nombreColaborador !== 'NA' && <p><strong>Nombre de colaborador:</strong> {tarea.nombreColaborador}</p>}
              {tarea.idColaborador && tarea.idColaborador !== 'NA' && <p><strong>ID de colaborador:</strong> {tarea.idColaborador}</p>}
              {tarea.correoColaborador && tarea.correoColaborador !== 'NA' && <p><strong>Correo del colaborador:</strong> {tarea.correoColaborador}</p>}
              {tarea.idMaquina && tarea.idMaquina !== 'NA' && <p><strong>ID de máquina:</strong> {tarea.idMaquina}</p>}
              {tarea.ubicacion && tarea.ubicacion !== 'NA' && <p><strong>Ubicación:</strong> {tarea.ubicacion}</p>}
              {tarea.nombreMaquina && tarea.nombreMaquina !== 'NA' && <p><strong>Nombre de máquina:</strong> {tarea.nombreMaquina}</p>}
              {Array.isArray(tarea.archivos) && tarea.archivos.length > 0 && tarea.archivos[0] !== 'NA' && (
                <div>
                  <strong>Archivos anexados:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
                    {tarea.archivos.map((archivo, i) => {
                      const ext = archivo.split('.').pop().toLowerCase();
                      const esImagen = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
                      const url = `http://localhost:8080/api/archivos/${encodeURIComponent(archivo)}`;
                      if (esImagen) {
                        return (
                          <a key={i} href={url} target="_blank" rel="noreferrer">
                            <img
                              src={url}
                              alt={archivo}
                              style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #ddd', cursor: 'pointer' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </a>
                        );
                      }
                      return (
                        <a key={i} href={url} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                          📎 {archivo}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
              {tarea.notaTecnica && tarea.notaTecnica !== 'NA' && <p><strong>Nota técnica:</strong> {tarea.notaTecnica}</p>}
              <p><strong>Tarea grupal:</strong> {tarea.grupal ? 'Sí' : 'No'}</p>
              {tarea.observaciones && tarea.observaciones !== 'NA' && <p><strong>Observaciones:</strong> {tarea.observaciones}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Modal edición completa (Admin) */}
      {editModal.open && (
        <div className="nota-modal-overlay" onClick={cerrarEditModal}>
          <div
            className="admin-edit-modal"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Modificar tarea"
          >
            <h3 className="nota-modal-titulo">Modificar tarea</h3>

            <div className="admin-edit-grid">
              <div className="admin-edit-field">
                <label>Título</label>
                <input type="text" value={editForm.titulo} onChange={e => handleEditChange('titulo', e.target.value)} />
              </div>

              <div className="admin-edit-field">
                <label>Estado</label>
                <select value={editForm.estado} onChange={e => handleEditChange('estado', e.target.value)}>
                  {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="admin-edit-field">
                <label>Fecha de inicio</label>
                <input type="datetime-local" value={editForm.fechaInicio} onChange={e => handleEditChange('fechaInicio', e.target.value)} />
              </div>

              <div className="admin-edit-field">
                <label>Entrega estimada</label>
                <input type="datetime-local" value={editForm.entregaEstimada} onChange={e => handleEditChange('entregaEstimada', e.target.value)} />
              </div>

              <div className="admin-edit-field">
                <label>ID colaborador</label>
                <input type="text" value={editForm.idColaborador} onChange={e => handleEditChange('idColaborador', e.target.value)} />
              </div>

              <div className="admin-edit-field">
                <label>Nombre colaborador</label>
                <input type="text" value={editForm.nombreColaborador} onChange={e => handleEditChange('nombreColaborador', e.target.value)} />
              </div>

              <div className="admin-edit-field">
                <label>Correo colaborador</label>
                <input type="email" value={editForm.correoColaborador} onChange={e => handleEditChange('correoColaborador', e.target.value)} />
              </div>

              <div className="admin-edit-field">
                <label>ID máquina</label>
                <input type="text" value={editForm.idMaquina} onChange={e => handleEditChange('idMaquina', e.target.value)} />
              </div>

              <div className="admin-edit-field">
                <label>Nombre máquina</label>
                <input type="text" value={editForm.nombreMaquina} onChange={e => handleEditChange('nombreMaquina', e.target.value)} />
              </div>

              <div className="admin-edit-field">
                <label>Ubicación</label>
                <input type="text" value={editForm.ubicacion} onChange={e => handleEditChange('ubicacion', e.target.value)} />
              </div>

              <div className="admin-edit-field">
                <label>Categoría</label>
                <select value={editForm.categoria} onChange={e => handleEditChange('categoria', e.target.value)}>
                  <option value="">-- Seleccionar --</option>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="admin-edit-field admin-edit-field--checkbox">
                <label>
                  <input type="checkbox" checked={editForm.grupal} onChange={e => handleEditChange('grupal', e.target.checked)} />
                  Tarea grupal
                </label>
              </div>

              <div className="admin-edit-field admin-edit-field--full">
                <label>Descripción</label>
                <textarea rows={3} value={editForm.descripcion} onChange={e => handleEditChange('descripcion', e.target.value)} />
              </div>

              <div className="admin-edit-field admin-edit-field--full">
                <label>Nota técnica</label>
                <textarea rows={3} value={editForm.notaTecnica} onChange={e => handleEditChange('notaTecnica', e.target.value)} />
              </div>

              <div className="admin-edit-field admin-edit-field--full">
                <label>Observaciones</label>
                <textarea rows={4} value={editForm.observaciones} onChange={e => handleEditChange('observaciones', e.target.value)} placeholder="Agrega observaciones aquí..." />
              </div>

              <div className="admin-edit-field admin-edit-field--full">
                <label>Agregar archivos adicionales</label>
                <input
                  type="file"
                  multiple
                  onChange={e => setNuevosArchivos(Array.from(e.target.files))}
                  disabled={editModal.guardando}
                />
              </div>
            </div>

            <div className="nota-modal-acciones">
              <button className="nota-modal-cancelar" type="button" onClick={cerrarEditModal} disabled={editModal.guardando}>
                Cancelar
              </button>
              <button className="nota-modal-guardar" type="button" onClick={guardarEdicion} disabled={editModal.guardando}>
                {editModal.guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
