import React from 'react';
import Card from './Card';

const LoadingScreen = ({ title = 'Cargando SmartMaint', subtitle = 'Preparando la experiencia...' }) => (
  <div className="sm-loading-screen">
    <Card className="sm-loading-card">
      <div className="sm-spinner" aria-hidden="true" />
      <h2 className="sm-section-title" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{title}</h2>
      <p className="sm-section-copy">{subtitle}</p>
    </Card>
  </div>
);

export default LoadingScreen;