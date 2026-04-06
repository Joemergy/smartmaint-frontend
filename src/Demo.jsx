import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Demo.css';

const Demo = () => {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [correo, setCorreo] = useState('');
  const [respuesta, setRespuesta] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const irAPreguntasFrecuentes = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    window.location.assign('/#preguntas-frecuentes');
  };

  const formatearExpiracion = (valor) => {
    if (!valor) return '1 semana';
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return '1 semana';
    return fecha.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRespuesta(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/demo/solicitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, empresa, correo }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al generar demo');
      }
      const data = await response.json();
      setRespuesta(data);
    } catch (err) {
      const detalle = err?.message?.toLowerCase().includes('failed to fetch')
        ? 'No se pudo conectar con el backend de SmartMaint. Verifica que el backend esté corriendo en el puerto 8080.'
        : (err.message || 'No se pudo generar la demo. Intenta nuevamente.');
      setError(detalle);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="demo-page">
      <header className="demo-header">
        <div className="demo-header-inner">
          <span className="demo-logo">
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
          </span>
          <div className="demo-header-btns">
            <button className="demo-hbtn demo-hbtn--outline" onClick={() => navigate('/login')}>
              Iniciar sesión
            </button>
            <button className="demo-hbtn demo-hbtn--yellow" onClick={() => navigate('/planes')}>
              Adquirir un plan
            </button>
          </div>
        </div>
      </header>

      <main className="demo-main">
        <div className="demo-wrapper">
          <section className="demo-hero-copy" aria-label="Encabezado de la solicitud">
            <span className="demo-kicker">Experiencia interactiva para ti</span>
            <h1 className="demo-title">
              Solicita tu DEMO
              <span className="demo-title-second-line">ahora mismo.</span>
            </h1>
            <p className="demo-subtitle">
              Evalua <span className="demo-subtitle-brand"><em><strong>SMARTMAINT</strong></em></span> con datos reales de operacion,
              flujo guiado y acceso inmediato para validar decisiones con tu equipo.
            </p>

          </section>

          <div className="demo-content">
            <aside className="demo-info-panel" aria-label="Beneficios de la demo">
              <div className="demo-info-inner">
                <span className="demo-info-kicker">Valor en minutos</span>
                <h2 className="demo-info-title">Visualiza resultados antes de implementar.</h2>
                <p className="demo-info-copy">
                  Ejecuta una simulacion real del flujo operativo, con configuracion inicial rapida y acceso inmediato para equipos clave.
                </p>

                <ul className="demo-benefits">
                  <li>
                    <span className="demo-benefit-icon" aria-hidden="true">01</span>
                    <div>
                      <strong>Acceso inmediato</strong>
                      <p>Credenciales listas para iniciar en pocos minutos.</p>
                    </div>
                  </li>
                  <li>
                    <span className="demo-benefit-icon" aria-hidden="true">02</span>
                    <div>
                      <strong>Simulacion real</strong>
                      <p>Prueba asignaciones, estados, notas y evidencia de tareas.</p>
                    </div>
                  </li>
                  <li>
                    <span className="demo-benefit-icon" aria-hidden="true">03</span>
                    <div>
                      <strong>Configuracion rapida</strong>
                      <p>Activa entorno institucional sin procesos complejos.</p>
                    </div>
                  </li>
                </ul>

                <div className="demo-system-preview" aria-hidden="true">
                  <div className="demo-system-top">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="demo-system-body">
                    <div className="demo-system-col demo-system-col--main">
                      <i></i>
                      <i></i>
                      <i></i>
                    </div>
                    <div className="demo-system-col">
                      <i></i>
                      <i></i>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <div className="demo-card">
              {respuesta ? (
                <div className="demo-success">
                  <div className="demo-success-icon">OK</div>
                  <h2>Solicitud enviada</h2>
                  <p>
                    Las credenciales demo de administrador y usuario fueron enviadas a{' '}
                    <strong>{respuesta.destinatario}</strong>.
                  </p>
                  <p className="demo-expiry">Vigencia hasta {formatearExpiracion(respuesta.expiraEn)}. Luego se deshabilitan automaticamente.</p>
                  {(respuesta.superAdminCorreo || respuesta.adminCorreo || respuesta.usuarioCorreo) && (
                    <div className="demo-fallback-creds" style={{ marginTop: '14px', textAlign: 'left', background: '#f7fbff', border: '1px solid #d8e6fb', borderRadius: '10px', padding: '12px 14px' }}>
                      <p style={{ margin: '0 0 8px', fontWeight: 700 }}>Si el correo no llega, usa estas credenciales ahora:</p>
                      <p style={{ margin: '4px 0' }}><strong>SuperAdmin:</strong> {respuesta.superAdminCorreo} / {respuesta.superAdminContrasena || 'demo1234'}</p>
                      <p style={{ margin: '4px 0' }}><strong>Admin:</strong> {respuesta.adminCorreo} / {respuesta.adminContrasena || 'demo1234'}</p>
                      <p style={{ margin: '4px 0' }}><strong>Usuario:</strong> {respuesta.usuarioCorreo} / {respuesta.usuarioContrasena || 'demo1234'}</p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="demo-form">
                  <div className="demo-field">
                    <label className="demo-label">Nombre completo</label>
                    <div className="demo-input-wrap">
                      <input
                        className="demo-input"
                        type="text"
                        placeholder="Ej. Laura Rojas"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        autoComplete="name"
                        required
                      />
                    </div>
                  </div>

                  <div className="demo-field">
                    <label className="demo-label">Empresa</label>
                    <div className="demo-input-wrap">
                      <input
                        className="demo-input"
                        type="text"
                        placeholder="Ej. Hospital Central"
                        value={empresa}
                        onChange={(e) => setEmpresa(e.target.value)}
                        autoComplete="organization"
                        required
                      />
                    </div>
                  </div>

                  <div className="demo-field">
                    <label className="demo-label">Correo para recibir credenciales</label>
                    <div className="demo-input-wrap">
                      <input
                        className="demo-input"
                        type="email"
                        placeholder="nombre@empresa.com"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  {error && <p className="demo-error">{error}</p>}

                  <button type="submit" className="demo-submit" disabled={loading}>
                    {loading ? 'Enviando...' : 'Solicitar acceso demo'}
                  </button>
                  <p className="demo-microcopy">Sin compromiso. Acceso inmediato.</p>

                  <div className="demo-form-trust" role="list" aria-label="Confianza del formulario">
                    <span role="listitem">Datos seguros</span>
                    <span role="listitem">Acceso inmediato</span>
                    <span role="listitem">Sin tarjeta de credito</span>
                  </div>
                </form>
              )}
            </div>
          </div>

          <section className="demo-value-box" aria-label="Funcionalidades disponibles en la demo">
            <h3>¿Que puedes hacer en la demo?</h3>
            <ul>
              <li>Crear tareas, asignar responsables y seguir estados en tiempo real.</li>
              <li>Registrar notas operativas y adjuntar evidencia por actividad.</li>
              <li>Visualizar cumplimiento por equipo con panel de seguimiento.</li>
              <li>Probar roles institucionales para administracion y operacion.</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Demo;
