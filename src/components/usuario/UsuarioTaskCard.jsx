import React from 'react';
import Badge from '../ui/Badge';
import EstadoDropdown from './EstadoDropdown';

const renderArchivos = (tarea, apiBaseUrl) => {
  if (!Array.isArray(tarea.archivos) || tarea.archivos.length === 0 || tarea.archivos[0] === 'NA') {
    return null;
  }

  return (
    <div>
      <strong>Archivos anexados:</strong>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
        {tarea.archivos.map((archivo, index) => {
          const ext = archivo.split('.').pop().toLowerCase();
          const esImagen = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
          const url = `${apiBaseUrl}/api/archivos/${encodeURIComponent(archivo)}`;

          if (esImagen) {
            return (
              <a key={index} href={url} target="_blank" rel="noreferrer">
                <img
                  src={url}
                  alt={archivo}
                  style={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                    objectFit: 'contain',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    cursor: 'pointer'
                  }}
                  onError={(event) => {
                    event.target.style.display = 'none';
                  }}
                />
              </a>
            );
          }

          return (
            <a key={index} href={url} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
              📎 {archivo}
            </a>
          );
        })}
      </div>
    </div>
  );
};

const UsuarioTaskCard = ({
  tarea,
  estados,
  urgenciaObj,
  formatFechaHora,
  isClosing,
  apiBaseUrl,
  onAbrirDetalles,
  onCerrarDetalles,
  onCambiarEstado,
  onAbrirNotas,
  onArchivar
}) => {
  const isExpanded = tarea.mostrarDetalles;

  return (
    <div className="tarea-card">
      <div className="tarea-preview">
        <div className="preview-item"><strong>Título:</strong> {tarea.titulo}</div>
        <div className="preview-item"><strong>Inicio:</strong> {formatFechaHora(tarea.fechaInicio)}</div>
        <div className="preview-item"><strong>Entrega Estimada:</strong> {tarea.fechaCierre ? formatFechaHora(tarea.fechaCierre) : 'NA'}</div>
        <div className="preview-item"><strong>ID de colaborador:</strong> {tarea.idColaborador || 'NA'}</div>
        <div className="preview-item" style={{ color: urgenciaObj.color }}>
          <strong>Urgencia:</strong> {urgenciaObj.icon} {tarea.prioridad || 'NA'}
        </div>
        <div className="preview-item usuario-status-badge-row">
          <Badge tone={(tarea.estado || '').toLowerCase() === 'completado' ? 'success' : (tarea.estado || '').toLowerCase() === 'en proceso' ? 'warning' : 'danger'}>
            {tarea.estado || 'Sin estado'}
          </Badge>
        </div>
      </div>

      <div className="tarea-actions">
        <div className="tarea-estado-selector-inline">
          <label>Estado:</label>
          <EstadoDropdown
            estadoActual={tarea.estado}
            estados={estados.filter((estado) => estado.label !== 'Archivado')}
            onChange={(nuevoEstado) => onCambiarEstado(tarea.id, nuevoEstado)}
            disabled={!tarea.estado}
          />
        </div>

        <div className="tarea-actions-right">
          <button
            className="ver-detalles-btn"
            onClick={() => (isExpanded ? onCerrarDetalles(tarea.id) : onAbrirDetalles(tarea.id))}
            type="button"
          >
            {isExpanded ? 'Cerrar detalles' : 'Ver más detalles'}
          </button>
          <button className="agregar-nota-btn" onClick={() => onAbrirNotas(tarea)} type="button">
            Ver / Agregar nota
          </button>
          <button className="archivar-btn" onClick={() => onArchivar(tarea.id)} type="button">
            Archivar
          </button>
        </div>
      </div>

      {isExpanded && (
        <div
          className={`detalles-overlay ${isClosing ? 'closing' : 'open'}`}
          onClick={() => onCerrarDetalles(tarea.id)}
        >
          <div
            className={`detalles-modal ${isClosing ? 'closing' : 'open'}`}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Detalle de tarea del usuario"
          >
            <button className="detalles-cerrar-btn" type="button" onClick={() => onCerrarDetalles(tarea.id)}>
              Cerrar
            </button>

            <div className="tarea-detalles modal-detalles">
              {tarea.nombreColaborador && tarea.nombreColaborador !== 'NA' && <p><strong>Nombre de colaborador:</strong> {tarea.nombreColaborador}</p>}
              {tarea.idColaborador && tarea.idColaborador !== 'NA' && <p><strong>ID de colaborador:</strong> {tarea.idColaborador}</p>}
              {tarea.correoColaborador && tarea.correoColaborador !== 'NA' && <p><strong>Correo del colaborador:</strong> {tarea.correoColaborador}</p>}
              {tarea.estado && tarea.estado !== 'NA' && <p><strong>Estado actual:</strong> {tarea.estado}</p>}
              {tarea.titulo && tarea.titulo !== 'NA' && <p><strong>Título:</strong> {tarea.titulo}</p>}
              {tarea.descripcion && tarea.descripcion !== 'NA' && <p><strong>Descripción:</strong> {tarea.descripcion}</p>}
              {tarea.fechaCierre && <p><strong>Entrega Estimada:</strong> {formatFechaHora(tarea.fechaCierre)}</p>}
              {tarea.nombreMaquina && tarea.nombreMaquina !== 'NA' && <p><strong>Nombre de máquina:</strong> {tarea.nombreMaquina}</p>}
              {tarea.idMaquina && tarea.idMaquina !== 'NA' && <p><strong>ID de máquina:</strong> {tarea.idMaquina}</p>}
              {tarea.ubicacion && tarea.ubicacion !== 'NA' && <p><strong>Ubicación:</strong> {tarea.ubicacion}</p>}
              {tarea.notaTecnica && tarea.notaTecnica !== 'NA' && <p><strong>Nota técnica:</strong> {tarea.notaTecnica}</p>}
              <p><strong>Tarea grupal:</strong> {tarea.grupal ? 'Sí' : 'No'}</p>
              {tarea.observaciones && tarea.observaciones !== 'NA' && <p><strong>Observaciones:</strong> {tarea.observaciones}</p>}
              {renderArchivos(tarea, apiBaseUrl)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuarioTaskCard;
