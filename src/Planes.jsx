import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Planes.css';
import fondoAdquirirPlan from './assets/Fondo_de_Adquirir_Plan.png';
import Badge from './components/ui/Badge';
import Button from './components/ui/Button';
import Card from './components/ui/Card';

const plans = [
  {
    id: 'mensual',
    name: 'Plan mensual',
    badgeLabel: 'Activación rápida',
    price: '$10',
    period: '/ mes',
    description: 'Ideal para validar adopción rápida, activar equipos y arrancar sin compromiso largo.',
    benefits: [
      'Acceso completo por 30 días',
      'Hasta 12 usuarios activos en la misma empresa',
      'Tablero de tareas en tiempo real',
      'Carga de evidencias fotográficas por tarea',
      'Checklist operativo por actividad',
      'Alertas básicas de vencimiento',
      'Exportación mensual en PDF y Excel',
      'Soporte estándar por correo',
      'Sin permanencia, cancelación flexible',
    ],
    cta: 'Seleccionar mensual',
    tone: 'info',
  },
  {
    id: 'anual',
    name: 'Plan anual',
    highlightLabel: 'Mayor ahorro',
    price: '$100',
    period: '/ año',
    description: 'La mejor opción para operación continua, estandarización y menor fricción administrativa.',
    benefits: [
      'Acceso completo por 12 meses',
      'Usuarios ilimitados',
      'Múltiples sedes y áreas operativas',
      'Historial anual con trazabilidad avanzada',
      'Indicadores de cumplimiento y productividad',
      'Roles y permisos personalizados',
      'Flujos de aprobación para cierres críticos',
      'Notificaciones automáticas por correo',
      'Soporte prioritario continuo',
      'Acompañamiento de implementación inicial',
      'Mejor valor por permanencia',
    ],
    cta: 'Seleccionar anual',
    tone: 'info',
    highlight: 'Más conveniente',
  },
];

const Planes = () => {
  const navigate = useNavigate();

  const seleccionarPlan = (tipo) => {
    navigate(`/confirmacion-compra?plan=${tipo}`);
  };

  const volverAlInicio = () => {
    navigate('/');
  };

  return (
    <section
      className="planes-wrapper"
      style={{ '--planes-bg-image': `url(${fondoAdquirirPlan})` }}
    >
      <header className="planes-banner">
        <div className="planes-banner-content">
          <button className="planes-logo-btn" type="button" onClick={volverAlInicio}>
            <h2 className="planes-logo"><em>SMARTMAINT</em></h2>
          </button>
          <div className="planes-banner-buttons">
            <button className="planes-banner-btn" onClick={() => navigate('/login')}>
              Iniciar sesión
            </button>
            <button className="planes-banner-btn planes-banner-btn-demo" onClick={() => navigate('/demo')}>
              Solicita tu demo
            </button>
          </div>
        </div>
      </header>

      <div className="planes-content">
        <div className="planes-hero-box sm-card sm-card-panel sm-card-padding-lg">
          <div className="planes-hero-copy sm-section-heading">
            <Badge tone="info" className="planes-hero-badge">ELIGE TU MEJOR OPCIÓN</Badge>
            <h1 className="planes-title sm-section-title">
              Piensa <em>SMART</em>, elige el plan que mejor sostiene tu operación.
            </h1>
            <p className="planes-subtitle sm-section-copy">
              Compara en segundos y pasa de la demo a una operación institucional con trazabilidad, responsables y seguimiento real.
            </p>
          </div>

          <div className="planes-hero-actions">
            <Button variant="ghost" size="lg" onClick={() => navigate('/login')}>Ya tengo acceso</Button>
          </div>
        </div>

        <div className="planes-grid">
          {plans.map((plan) => (
            <Card key={plan.id} variant={plan.highlight ? 'panel' : ''} padding="lg" className={`planes-card ${plan.highlight ? 'planes-card-highlight' : ''}`}>
              <div className="planes-card-top">
                <div className="planes-card-badges">
                  {plan.badgeLabel ? <Badge tone={plan.tone}>{plan.badgeLabel}</Badge> : null}
                  {plan.highlight ? <Badge tone="info">{plan.highlightLabel || plan.highlight}</Badge> : null}
                </div>
                <h2 className="plan-nombre">{plan.name}</h2>
                <p className="plan-precio">
                  <span className="plan-precio-monto">{plan.price}</span>
                  <span className="plan-precio-periodo">{plan.period}</span>
                </p>
                <p className="plan-descripcion">{plan.description}</p>
              </div>

              <ul className="plan-lista">
                {plan.benefits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <Button variant={plan.highlight ? 'secondary' : 'primary'} size="lg" className="boton-plan" onClick={() => seleccionarPlan(plan.id)}>
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Planes;
