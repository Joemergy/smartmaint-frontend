import React from 'react';

const defaultFieldOptions = [
  { value: 'idColaborador', label: 'ID de colaborador' },
  { value: 'estado', label: 'Estado' },
  { value: 'nombreColaborador', label: 'Nombre de colaborador' },
  { value: 'correoColaborador', label: 'Correo del colaborador' },
  { value: 'idMaquina', label: 'ID de máquina' },
  { value: 'nombreMaquina', label: 'Nombre de máquina' },
  { value: 'ubicacion', label: 'Ubicación' },
  { value: 'titulo', label: 'Título' }
];

const defaultStatusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'En proceso', label: 'En proceso' },
  { value: 'Completado', label: 'Completado' },
  { value: 'Cancelado', label: 'Cancelado' }
];

const defaultSortOptions = [
  { value: 'reciente', label: 'Más reciente' },
  { value: 'antiguo', label: 'Más antiguo' }
];

const TaskFilters = ({
  filtroCampo,
  setFiltroCampo,
  filtroTexto,
  setFiltroTexto,
  filtroFecha,
  setFiltroFecha,
  filtroEstado,
  setFiltroEstado,
  ordenFecha,
  setOrdenFecha,
  onFiltrar,
  fieldOptions = defaultFieldOptions,
  statusOptions = defaultStatusOptions,
  sortOptions = defaultSortOptions,
  className = ''
}) => {
  return (
    <div className={`barra-filtros ${className}`.trim()}>
      <select className="filter-field" value={filtroCampo} onChange={(e) => setFiltroCampo(e.target.value)}>
        {fieldOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>

      <input
        className="filter-search"
        type="text"
        placeholder="Buscar..."
        value={filtroTexto}
        onChange={(e) => setFiltroTexto(e.target.value)}
      />

      <select className="filter-status" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
        {statusOptions.map((option) => (
          <option key={option.value || 'all'} value={option.value}>{option.label}</option>
        ))}
      </select>

      <select className="filter-sort" value={ordenFecha} onChange={(e) => setOrdenFecha(e.target.value)}>
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>

      <input
        className="filter-date"
        type="date"
        value={filtroFecha || ''}
        onChange={(e) => setFiltroFecha?.(e.target.value)}
        title="Filtrar por fecha de inicio"
      />

      <button className="filter-action" onClick={onFiltrar} type="button">Filtrar</button>
    </div>
  );
};

export default TaskFilters;
