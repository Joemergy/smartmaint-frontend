// src/BarraFiltros.jsx
import React, { useState } from 'react';
import './BarraFiltros.css';

const BarraFiltros = ({ onFiltrar }) => {
  const [criterio, setCriterio] = useState('idColaborador');
  const [valor, setValor] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (valor.trim() !== '') {
      onFiltrar({ criterio, valor });
    }
  };

  return (
    <form className="barra-filtros" onSubmit={handleSubmit}>
      <div className="filtro-select">
        <select value={criterio} onChange={(e) => setCriterio(e.target.value)}>
          <option value="idColaborador">ID de colaborador</option>
          <option value="nombreColaborador">Nombre de colaborador</option>
          <option value="idMaquina">ID de máquina</option>
          <option value="nombreMaquina">Nombre de máquina</option>
          <option value="ubicacion">Ubicación</option>
          <option value="estado">Estado</option>
        </select>
      </div>
      <input
        type="text"
        className="filtro-input"
        placeholder="Buscar..."
        value={valor}
        onChange={(e) => setValor(e.target.value)}
      />
      <button type="submit" className="filtro-btn">Filtrar</button>
    </form>
  );
};

export default BarraFiltros;
