// src/PanelHeader.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import './Panel.css';

const PanelHeader = ({ titulo }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    alert("Sesión cerrada correctamente.");
    navigate("/login");
  };

  return (
    <header className="panel-header">
      <div className="panel-logo">
        <h1>SMARTMAINT</h1>
        <span>{titulo}</span>
      </div>
      <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
    </header>
  );
};

export default PanelHeader;
