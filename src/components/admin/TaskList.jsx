import React from 'react';
import TaskCard from './TaskCard';

const TaskList = ({ tareas, onToggleDetalles, onCerrarDetalles, onArchivar, onRecargar }) => {
  return (
    <div className="cuadro-tareas">
      {tareas.length === 0 ? (
        <p className="mensaje-vacio fade-in">Tu panel de tareas está vacío</p>
      ) : (
        tareas.map((tarea) => (
          <TaskCard
            key={tarea.id}
            tarea={tarea}
            onToggleDetalles={onToggleDetalles}
            onCerrarDetalles={onCerrarDetalles}
            onArchivar={onArchivar}
            onRecargar={onRecargar}
          />
        ))
      )}
    </div>
  );
};

export default TaskList;
