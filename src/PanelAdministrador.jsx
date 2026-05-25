import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PanelAdministrador.css';

const PanelAdministrador = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-panel-container">
      <h1>Panel del Administrador</h1>
      <p>Bienvenido. Desde aquí puedes gestionar tareas, usuarios y procesos operativos.</p>

      <div className="admin-actions">
        <button onClick={() => navigate('/crear-tarea')}>Crear nueva tarea</button>
        <button onClick={() => navigate('/tareas-asignadas')}>Tareas asignadas</button>
        <button onClick={() => navigate('/historial-tareas-admin')}>Historial de tareas</button>
        <button onClick={() => navigate('/perfil-admin')}>Mi perfil</button>
      </div>
    </div>
  );
};

export default PanelAdministrador;
