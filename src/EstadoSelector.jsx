// src/components/EstadoSelector.jsx
import React, { useState } from 'react';
import './EstadoSelector.css';

const estados = [
  { label: 'Pendiente', color: '#FFA500', icon: '🟠' },
  { label: 'En proceso', color: '#FFD700', icon: '🟡' },
  { label: 'Completado', color: '#32CD32', icon: '🟢' }
];

const EstadoSelector = ({ estado }) => {
  const [visible, setVisible] = useState(false);
  const [estadoActual, setEstadoActual] = useState(estado);

  const cambiarEstado = (nuevo) => {
    setEstadoActual(nuevo.label);
    setVisible(false);
    // Aquí podrías guardar en localStorage si quieres persistencia
  };

  const estadoObj = estados.find(e => e.label === estadoActual);

  return (
    <div className="estado-selector">
      <div className="estado-actual" onClick={() => setVisible(!visible)}>
        <span className="estado-icon">{estadoObj.icon}</span>
        <span>{estadoActual}</span>
        <span className="flecha">▼</span>
      </div>

      {visible && (
        <ul className="estado-opciones">
          {estados.map(e => (
            <li key={e.label} onClick={() => cambiarEstado(e)}>
              <span className="estado-icon">{e.icon}</span> {e.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EstadoSelector;
