import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './TareaDetalle.css';

const TareaDetalle = () => {
  const { id } = useParams(); // ID de la tarea desde la URL
  const [tarea, setTarea] = useState(null);

  useEffect(() => {
    // Simulación de carga de tarea por ID
    const tareasSimuladas = [
      {
        id: '1',
        titulo: 'Revisión de inventario',
        descripcion: 'Verificar stock en bodega principal',
        fechaEntrega: '2025-10-28',
        estado: 'pendiente',
        comentarios: '',
      },
    ];

    const encontrada = tareasSimuladas.find((t) => t.id === id);
    setTarea(encontrada);
  }, [id]);

  const handleCompletar = () => {
    if (tarea) {
      setTarea({ ...tarea, estado: 'completada' });
      // Aquí iría la lógica para actualizar en backend
      console.log('Tarea marcada como completada:', tarea.id);
    }
  };

  const handleComentario = (e) => {
    setTarea({ ...tarea, comentarios: e.target.value });
  };

  if (!tarea) return <p>Cargando tarea...</p>;

  return (
    <div className="tarea-detalle-container">
      <h1>{tarea.titulo}</h1>
      <p><strong>Descripción:</strong> {tarea.descripcion}</p>
      <p><strong>Fecha de entrega:</strong> {tarea.fechaEntrega}</p>
      <p><strong>Estado:</strong> {tarea.estado}</p>

      <label>Comentarios:</label>
      <textarea
        value={tarea.comentarios}
        onChange={handleComentario}
        placeholder="Agrega observaciones o evidencia"
      />

      {tarea.estado !== 'completada' && (
        <button onClick={handleCompletar}>Marcar como completada</button>
      )}
    </div>
  );
};

export default TareaDetalle;
