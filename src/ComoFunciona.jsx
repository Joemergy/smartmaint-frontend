import React from 'react';
import './ComoFunciona.css';

const ComoFunciona = () => {
  return (
    <section className="como-funciona">
      <h2 className="como-titulo">¿Cómo <em>FUNCIONA</em>?</h2>
      <div className="como-grid">
        <div className="como-card">
          <span className="como-step">01</span>
          <h3>REGISTRA</h3>
          <p>Tu empresa y centraliza los datos operativos en una sola plataforma.</p>
        </div>
        <div className="como-card">
          <span className="como-step">02</span>
          <h3>CREA</h3>
          <p>Tareas, responsables y prioridades para que cada equipo sepa que hacer.</p>
        </div>
        <div className="como-card">
          <span className="como-step">03</span>
          <h3>ORGANIZA</h3>
          <p>Flujos, tiempos e historial para mantener tu operacion bajo control.</p>
        </div>
      </div>
    </section>
  );
};

export default ComoFunciona;
