import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { registrarCompraPlan } from './services/authService';
import './ConfirmacionCompra.css';

const ConfirmacionCompra = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const tipoPlan = new URLSearchParams(location.search).get('plan') || 'mensual';
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    idInstitucional: '',
    tipoDocumento: '',
    numeroDocumento: '',
    correoPersonal: '',
    correoInstitucional: '',
    telefonoCelular: '',
    metodoPago: '',
    numeroTarjeta: '',
    cvc: '',
    clave: '',
    fechaExpiracion: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitError) setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const required = [
      'nombre',
      'apellido',
      'idInstitucional',
      'tipoDocumento',
      'numeroDocumento',
      'correoPersonal',
      'telefonoCelular',
    ];

    const missing = required.some((field) => !String(formData[field] || '').trim());
    if (missing) {
      setSubmitError('Completa todos los campos requeridos para crear la cuenta SuperAdmin.');
      return;
    }

    const payload = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      idInstitucional: formData.idInstitucional,
      tipoDocumento: formData.tipoDocumento,
      numeroDocumento: formData.numeroDocumento,
      correoPersonal: formData.correoPersonal,
      correoInstitucional: formData.correoInstitucional,
      telefonoCelular: formData.telefonoCelular,
      plan: tipoPlan.toUpperCase(),
    };

    try {
      setIsSubmitting(true);
      await registrarCompraPlan(payload);
      alert('Compra exitosa. Revisa tus correos para ver detalle del plan y credenciales de acceso.');
      navigate('/registro-confirmado');
    } catch (error) {
      const backendMessage = error?.response?.data?.error || error?.response?.data?.message;
      setSubmitError(backendMessage || 'No se pudo procesar la compra. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="compra-page">
      <header className="compra-banner">
        <div className="compra-banner-content">
          <button className="compra-logo-btn" type="button" onClick={() => navigate('/')}>
            <em>SMARTMAINT</em>
          </button>
          <div className="compra-banner-buttons">
            <button className="compra-banner-btn" onClick={() => navigate('/login')}>
              Iniciar sesión
            </button>
            <button className="compra-banner-btn compra-banner-btn-demo" onClick={() => navigate('/demo')}>
              Solicita tu demo
            </button>
          </div>
        </div>
      </header>

      <section className="compra-wrapper">
        <header className="compra-header">
          <span className="compra-kicker">Activacion guiada</span>
          <h1 className="compra-titulo">¡Confirma tu compra!</h1>
          <p className="compra-subtitulo">
            Completa tus datos y habilita tu entorno en minutos.
          </p>
        </header>

        <div className="compra-layout">
          <aside className="compra-value-panel" aria-label="Beneficios de activacion">
            <div className="compra-value-card">
              <span className="compra-value-label">Valor inmediato</span>
              <h2>Implementa un flujo de trabajo medible y controlado.</h2>
              <p>
                Activa la plataforma y prepárate para iniciar a trabajar con tu equipo.
              </p>

              <ul className="compra-value-list">
                <li>
                  <strong>Acceso inmediato</strong>
                  <span>Credenciales y activacion institucional al confirmar el pago.</span>
                </li>
                <li>
                  <strong>Simulacion real</strong>
                  <span>Valida tareas, responsables, observaciones y evidencia.</span>
                </li>
                <li>
                  <strong>Configuracion rapida</strong>
                  <span>Estructura inicial lista para adaptar a tu operacion.</span>
                </li>
              </ul>

              <div className="compra-trust-badges" role="list" aria-label="Confianza de compra">
                <span role="listitem">Datos seguros</span>
                <span role="listitem">Acceso inmediato</span>
                <span role="listitem">Sin tarjeta de credito</span>
              </div>

              <div className="compra-mockup" aria-hidden="true">
                <div className="compra-mockup-top">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="compra-mockup-grid">
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                </div>
              </div>
            </div>
          </aside>

          <form className="compra-form" onSubmit={handleSubmit}>
            <div className="compra-seccion">
              <h3>Datos personales</h3>
              <div className="compra-grid">
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  autoComplete="given-name"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="apellido"
                  placeholder="Apellido"
                  autoComplete="family-name"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                />
              </div>
              <input
                type="text"
                name="idInstitucional"
                placeholder="ID institucional (Ej: TESLA01)"
                value={formData.idInstitucional}
                onChange={handleChange}
                required
              />
              <select name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} required>
                <option value="">Tipo de documento</option>
                <option>Cedula</option>
                <option>NIT</option>
                <option>Pasaporte</option>
              </select>
              <input
                type="text"
                name="numeroDocumento"
                placeholder="Numero de documento"
                value={formData.numeroDocumento}
                onChange={handleChange}
                required
              />
            </div>

            <div className="compra-seccion">
              <h3>Forma de pago</h3>
              <select name="metodoPago" value={formData.metodoPago} onChange={handleChange}>
                <option value="">Metodo preferido</option>
                <option>Bancolombia</option>
                <option>Visa</option>
                <option>Mastercard</option>
              </select>
              <div className="compra-grid">
                <input
                  type="text"
                  name="numeroTarjeta"
                  placeholder="Numero de tarjeta"
                  value={formData.numeroTarjeta}
                  onChange={handleChange}
                />
                <input type="text" name="cvc" placeholder="CVC" value={formData.cvc} onChange={handleChange} />
              </div>
              <input
                type="password"
                name="clave"
                placeholder="Clave"
                value={formData.clave}
                onChange={handleChange}
              />
              <input
                type="text"
                name="fechaExpiracion"
                placeholder="Fecha de expiracion (MM/AA)"
                value={formData.fechaExpiracion}
                onChange={handleChange}
              />
            </div>

            <div className="compra-seccion">
              <h3>Correos y contacto</h3>
              <div className="compra-grid">
                <input
                  type="email"
                  name="correoPersonal"
                  placeholder="Correo personal"
                  autoComplete="email"
                  value={formData.correoPersonal}
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="correoInstitucional"
                  placeholder="Correo institucional (opcional)"
                  autoComplete="email"
                  value={formData.correoInstitucional}
                  onChange={handleChange}
                />
              </div>
              <input
                type="tel"
                name="telefonoCelular"
                placeholder="Telefono celular"
                autoComplete="tel"
                value={formData.telefonoCelular}
                onChange={handleChange}
                required
              />
            </div>

            {submitError && <p className="compra-alerta">{submitError}</p>}

            <button className="compra-boton" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Procesando compra...' : 'Pagar ahora'}
            </button>

            <section className="compra-extra-value" aria-label="Capacidades al activar tu plan">
              <h3>¿Qué incluye tu activación?</h3>
              <ul>
                <li>Panel inicial con seguimiento de tareas, estado y responsables.</li>
                <li>Gestiones de roles por empresa para administracion y operacion.</li>
                <li>Registro de evidencia y notas para trazabilidad completa.</li>
                <li>Base lista para escalar a mas sedes o equipos tecnicos.</li>
              </ul>
            </section>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ConfirmacionCompra;
