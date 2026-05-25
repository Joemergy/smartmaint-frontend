import React from 'react';

const formatNotaFecha = (fechaCreacion) => {
  if (!fechaCreacion) return '';
  return new Date(fechaCreacion).toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const TaskNotesModal = ({
  modalNota,
  notaSuccess,
  onClose,
  onSave,
  onChangeTexto,
  onDismissSuccess
}) => (
  <>
    {modalNota.open && (
      <div className="nota-modal-overlay" onClick={onClose}>
        <div className="nota-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Ver y agregar notas">
          <h3 className="nota-modal-titulo">Notas de la tarea</h3>

          <div className="nota-lista">
            {modalNota.cargandoNotas ? (
              <p className="nota-cargando">Cargando notas...</p>
            ) : modalNota.notas.length === 0 ? (
              <p className="nota-vacia">Aún no hay notas para esta tarea.</p>
            ) : (
              modalNota.notas.map((nota) => (
                <div key={nota.id} className="nota-item">
                  <div className="nota-item-header">
                    <span className="nota-item-autor">{nota.autorNombre || 'Usuario'}</span>
                    <span className="nota-item-fecha">{formatNotaFecha(nota.fechaCreacion)}</span>
                  </div>
                  <p className="nota-item-texto">{nota.texto}</p>
                </div>
              ))
            )}
          </div>

          <div className="nota-nueva-seccion">
            <label className="nota-modal-label" htmlFor="nota-textarea">Agregar nueva nota</label>
            <textarea
              id="nota-textarea"
              className="nota-modal-textarea"
              value={modalNota.texto}
              onChange={(event) => onChangeTexto(event.target.value)}
              rows={4}
              placeholder="Escribe tu nota aquí..."
              disabled={modalNota.guardando}
            />
            <div className="nota-modal-acciones">
              <button className="nota-modal-cancelar" type="button" onClick={onClose} disabled={modalNota.guardando}>
                Cerrar
              </button>
              <button
                className="nota-modal-guardar"
                type="button"
                onClick={onSave}
                disabled={modalNota.guardando || !modalNota.texto.trim()}
              >
                {modalNota.guardando ? 'Guardando...' : 'Guardar nota'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {notaSuccess && (
      <div className="nota-success-overlay" onClick={onDismissSuccess}>
        <div className="nota-success-modal" onClick={(event) => event.stopPropagation()}>
          <p className="nota-success-texto">Nota agregada correctamente</p>
          <div className="nota-success-circulo">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0b4f99" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      </div>
    )}
  </>
);

export default TaskNotesModal;
