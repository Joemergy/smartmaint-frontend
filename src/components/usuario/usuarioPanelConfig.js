export const estados = [
  { label: 'Pendiente', color: '#e53935', icon: '🔴' },
  { label: 'En proceso', color: '#FFD700', icon: '🟡' },
  { label: 'Completado', color: '#43a047', icon: '🟢' },
  { label: 'Archivado', color: '#808080', icon: '📦' }
];

export const urgencias = {
  Normal: { color: '#32CD32', icon: '🟢' },
  Medio: { color: '#FFA500', icon: '🟠' },
  Alto: { color: '#FF0000', icon: '🔴' }
};

export const fieldOptions = [
  { value: 'idColaborador', label: 'ID de colaborador' },
  { value: 'descripcion', label: 'Descripción' },
  { value: 'titulo', label: 'Título' },
  { value: 'urgencia', label: 'Urgencia' },
  { value: 'nombreColaborador', label: 'Nombre del colaborador' },
  { value: 'correoColaborador', label: 'Correo del colaborador' },
  { value: 'idMaquina', label: 'ID de máquina' },
  { value: 'ubicacion', label: 'Ubicación' },
  { value: 'nombreMaquina', label: 'Nombre de máquina' },
  { value: 'archivos', label: 'Archivos anexados' },
  { value: 'estado', label: 'Estado' }
];

export const statusOptions = [
  { value: '', label: 'Todos los estados' },
  ...estados.map((estado) => ({ value: estado.label, label: estado.label }))
];

export const formatFechaHora = (isoString) => {
  if (!isoString) return 'NA';

  const fecha = new Date(isoString);
  const opcionesFecha = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: false };
  const fechaStr = fecha.toLocaleDateString('es-CO', opcionesFecha);
  const horaStr = fecha.toLocaleTimeString('es-CO', opcionesHora);

  return `🗓️ ${fechaStr} ⏰ ${horaStr}`;
};

export const esTareaArchivada = (tarea) => (tarea.estado || '').toLowerCase() === 'archivado';

export const getCampoTexto = (tarea, campo) => {
  if (campo === 'correoColaborador') return String(tarea.correoColaborador || '');
  if (campo === 'archivos') {
    return Array.isArray(tarea.archivos) ? tarea.archivos.join(', ') : String(tarea.archivoAdjunto || '');
  }
  return String(tarea[campo] || '');
};
