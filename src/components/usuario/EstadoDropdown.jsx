import React, { useEffect, useRef, useState } from 'react';

const EstadoDropdown = ({ estadoActual, estados, onChange, disabled }) => {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  const estadoObj = estados.find((estado) => estado.label === estadoActual) || {};

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
    <div className="estado-custom-dropdown" ref={ref}>
      <button
        type="button"
        className="estado-custom-trigger"
        onClick={() => !disabled && setAbierto((prev) => !prev)}
        disabled={disabled}
      >
        <span>{estadoActual || 'Seleccionar'}</span>
        <span className="estado-circulo" style={{ backgroundColor: estadoObj.color || '#ccc' }} />
        <span className="estado-flecha">▾</span>
      </button>
      {abierto && (
        <ul className="estado-custom-lista">
          {estados.map((estado) => (
            <li
              key={estado.label}
              className={`estado-custom-opcion${estado.label === estadoActual ? ' activo' : ''}`}
              onClick={() => {
                onChange(estado.label);
                setAbierto(false);
              }}
            >
              {estado.label}
              <span className="estado-circulo" style={{ backgroundColor: estado.color }} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EstadoDropdown;
