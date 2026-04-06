import React from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from './components/ui/Badge';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import './LandingPage.css';
import ComoFunciona from './ComoFunciona';

const benefitCards = [
  {
    title: 'Operación visible en tiempo real',
    copy: 'Ve qué está pendiente, qué está en riesgo y qué ya fue resuelto sin perseguir mensajes ni archivos sueltos.',
  },
  {
    title: 'Responsables, notas y evidencia',
    copy: 'Cada tarea conserva asignación, observaciones y archivos para que el historial sea realmente útil.',
  },
  {
    title: 'Escalable para SaaS institucional',
    copy: 'La plataforma ya separa roles, empresas, demos y rutas protegidas para crecer con estructura.',
  },
];

const useCases = [
  'Plantas y operaciones de mantenimiento preventivo y correctivo.',
  'Instituciones con múltiples responsables, áreas y equipos técnicos.',
  'Empresas que necesitan demo rápida para validar valor antes de contratar.',
];

const testimonials = [
  {
    quote: 'Pasamos de coordinar tareas por chats dispersos a tener seguimiento completo en una sola vista.',
    author: 'Laura Díaz',
    role: 'Jefe de Operaciones',
  },
  {
    quote: 'La demo institucional nos permitió validar el flujo en horas, no en semanas.',
    author: 'Andrés Molina',
    role: 'Director de Mantenimiento',
  },
  {
    quote: 'El equipo ganó claridad: responsables, prioridad y evidencia quedaron centralizados.',
    author: 'Camila Rojas',
    role: 'Coordinadora Administrativa',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  const irAPreguntasFrecuentes = () => {
    window.location.assign('/#preguntas-frecuentes');
  };

  return (
    <>
      <header className="landing-banner">
        <div className="banner-content">
          <div className="logo">
            <em
              role="button"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
              onClick={irAPreguntasFrecuentes}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  irAPreguntasFrecuentes();
                }
              }}
            >
              SMARTMAINT
            </em>
          </div>
          <div className="banner-buttons">
            <button className="banner-btn login-btn" onClick={() => navigate('/login')}>
              Iniciar sesión
            </button>
            <button className="banner-btn demo-btn" onClick={() => navigate('/demo')}>
              Solicita tu demo
            </button>
          </div>
        </div>
      </header>

      <main className="landing-container">
        <section className="landing-hero landing-section">
          <div className="hero-content">
            <div className="hero-copy">
              <Badge tone="info" className="landing-hero-badge">SaaS de mantenimiento institucional</Badge>
              <h1>Gestiona mantenimiento, responsables y seguimiento desde una sola operación <em>SMARTMAINT</em></h1>
              <p>
                SmartMaint centraliza tareas, notas, estados y evidencia operativa para que tu empresa deje de depender de hojas sueltas y coordinación manual.
              </p>
              <div className="hero-actions">
                <Button className="hero-cta" onClick={() => navigate('/demo')}>
                  Probar demo gratis
                </Button>
                <Button variant="ghost" className="hero-secondary-cta" onClick={() => navigate('/planes')}>
                  Ver planes
                </Button>
              </div>
            </div>

            <div className="hero-visual" aria-hidden="true">
              <img src="/imagen-smartmaint.png" alt="" className="hero-visual-image" />
            </div>
          </div>
        </section>

        <section className="landing-section">
          <ComoFunciona />
        </section>

        <section className="landing-section benefits-section">
          <div className="section-heading">
            <span className="section-kicker">Beneficios concretos</span>
            <h2 className="section-title">Diseñado para equipos que necesitan orden operativo y respuesta rápida.</h2>
            <p className="section-copy">No es una landing genérica: la propuesta gira alrededor de mantenimiento, ejecución y control institucional.</p>
          </div>

          <div className="benefits-grid">
            {benefitCards.map((benefit) => (
              <Card key={benefit.title} className="benefit-card">
                <h3>{benefit.title}</h3>
                <p>{benefit.copy}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="landing-section use-cases-section">
          <div className="section-heading">
            <span className="section-kicker">Casos de uso</span>
            <h2 className="section-title">Pensado para organizaciones con carga operativa real.</h2>
          </div>

          <div className="use-cases-grid">
            {useCases.map((item) => (
              <Card key={item} className="use-case-card">
                <p>{item}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="landing-section testimonials-section">
          <div className="section-heading">
            <span className="section-kicker">Validación comercial</span>
            <h2 className="section-title">Cómo se percibiría SmartMaint en una venta SaaS real.</h2>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} className="testimonial-card">
                <p className="testimonial-quote">“{testimonial.quote}”</p>
                <div className="testimonial-author-block">
                  <strong>{testimonial.author}</strong>
                  <span>{testimonial.role}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

      </main>
    </>
  );
};

export default LandingPage;
