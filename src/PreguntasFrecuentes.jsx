import React, { useState } from 'react';
import './PreguntasFrecuentes.css';

const preguntas = [
  {
    pregunta: '¿SMARTMAINT es compatible con móviles?',
    respuesta: 'Sí, SMARTMAINT funciona en móviles, tablets y escritorio sin necesidad de instalación.'
  },
  {
    pregunta: '¿Puedo asignar tareas por rol?',
    respuesta: 'Sí, puedes asignar tareas a usuarios según su rol técnico, administrativo o supervisor.'
  },
  {
    pregunta: '¿Qué pasa si se pierde conexión?',
    respuesta: 'SMARTMAINT sincroniza los datos automáticamente al reconectarse, sin pérdida de información.'
  },
  {
    pregunta: '¿Incluye soporte técnico?',
    respuesta: 'Todos los planes incluyen soporte técnico por correo y chat. Los planes premium tienen atención prioritaria.'
  },
  {
    pregunta: '¿Puedo adjuntar evidencia en una tarea?',
    respuesta: 'Sí, puedes adjuntar evidencias y comentarios para dejar trazabilidad del trabajo realizado.'
  },
  {
    pregunta: '¿Se pueden generar reportes de avance?',
    respuesta: 'Sí, la plataforma permite visualizar avances, estados y cumplimiento por periodos y responsables.'
  }
];

const PreguntasFrecuentes = () => {
  const [abierta, setAbierta] = useState(null);

  const toggle = (index) => {
    setAbierta(abierta === index ? null : index);
  };

  return (
    <div className="faq-full">
      <div className="faq-wrapper">
        <h2 className="faq-titulo"><em>PREGUNTAS</em> frecuentes</h2>
        <div className="faq-grid">
          {preguntas.map((item, index) => (
            <div key={index} className={`faq-item ${abierta === index ? 'activa' : ''}`}>
              <button
                className="faq-pregunta"
                onClick={() => toggle(index)}
                aria-expanded={abierta === index}
              >
                <span>{item.pregunta}</span>
                <span className="faq-indicador">{abierta === index ? '-' : '+'}</span>
              </button>
              {abierta === index && (
                <div className="faq-respuesta">
                  {item.respuesta}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreguntasFrecuentes;
