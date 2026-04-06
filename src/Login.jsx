import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { login, recuperarContrasena } from './services/authService';
import { useAuth } from './hooks/useAuth';
import './Login.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({ correo: '', contrasena: '' });
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRecuperarModal, setShowRecuperarModal] = useState(false);
  const [recuperarCorreo, setRecuperarCorreo] = useState('');
  const [recuperarStatus, setRecuperarStatus] = useState(''); // 'sending' | 'ok' | 'error'
  const [recuperarMsg, setRecuperarMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { loginFromResponse } = useAuth();

  useEffect(() => {
    if (location.state?.sessionExpired) {
      setSubmitError('Tu sesión expiró. Inicia sesión nuevamente para continuar.');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  const validate = () => {
    const nextErrors = { correo: '', contrasena: '' };

    if (!correo.trim()) {
      nextErrors.correo = 'Ingresa tu correo corporativo.';
    } else if (!EMAIL_REGEX.test(correo.trim())) {
      nextErrors.correo = 'El formato del correo no es valido.';
    }

    if (!contrasena.trim()) {
      nextErrors.contrasena = 'Ingresa tu contraseña.';
    } else if (contrasena.length < 6) {
      nextErrors.contrasena = 'La contraseña debe tener al menos 6 caracteres.';
    }

    setErrors(nextErrors);
    return !nextErrors.correo && !nextErrors.contrasena;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await login(correo, contrasena);
      const session = loginFromResponse(data);
      const rol = session?.rol || String(data?.rol || '').toUpperCase();

      if (data.requiereCambioContrasena) {
        navigate('/cambiar-contrasena-inicial');
        return;
      }

      if (rol === "SUPERADMIN") navigate("/dashboard-tareas");
      else if (rol === "ADMIN") navigate("/dashboard-tareas");
      else if (rol === "USUARIO") navigate("/mis-tareas");
      else setSubmitError('El rol del usuario no es reconocido. Contacta al administrador.');

    } catch (err) {
      console.error("❌ Error en login:", err);
      const backendMessage = err?.response?.data?.error || err?.response?.data?.message || err?.message || '';
      if (backendMessage.toLowerCase().includes('usuario inactivo')) {
        setSubmitError('Usuario inactivo. Contacta al administrador.');
        return;
      }
      if (backendMessage) {
        setSubmitError(backendMessage);
        return;
      }
      setSubmitError('Credenciales invalidas. Verifica tu correo y contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecuperar = async (e) => {
    e.preventDefault();
    if (!recuperarCorreo.trim()) return;
    setRecuperarStatus('sending');
    setRecuperarMsg('');
    try {
      await recuperarContrasena(recuperarCorreo.trim());
      setRecuperarStatus('ok');
      setRecuperarMsg('Si el correo está registrado, recibirás una contraseña temporal en tu bandeja de entrada.');
    } catch {
      setRecuperarStatus('error');
      setRecuperarMsg('No se pudo procesar la solicitud. Inténtalo de nuevo.');
    }
  };

  return (
    <main className="login-page">
      <section className="login-section">
        <div className="login-card" data-aos="fade-up">
          <aside className="login-brand-panel">
            <div className="brand-header">
              <span className="brand-logo-dot" aria-hidden="true" />
              <button className="brand-title-btn" type="button" onClick={() => navigate('/')}>
                <h2 className="brand-title"><em>SMARTMAINT</em></h2>
              </button>
            </div>
            <h3 className="brand-subtitle">Piensa <em>SMART</em>, usa <em>SMARTMAINT</em></h3>
            <p className="brand-support">Centraliza procesos y mejora la coordinacion de tu empresa en una sola plataforma.</p>

            <div className="brand-metrics" aria-label="Indicadores de confianza">
              <div className="metric-item">
                <strong>+100</strong>
                <span>Empresas activas</span>
              </div>
              <div className="metric-item">
                <strong>99.9%</strong>
                <span>Disponibilidad</span>
              </div>
            </div>

            <p className="brand-trust">Plataforma segura · Acceso cifrado · Soporte empresarial</p>
          </aside>

          <div className="login-form-panel">
            <h2>Iniciar sesión</h2>
            <p className="login-subheading">Accede a tu panel de operaciones.</p>

            {submitError && (
              <div className="login-alert" role="alert" aria-live="polite">
                {submitError}
              </div>
            )}

            <form className="login-form" onSubmit={handleLogin}>
              <div className="field-group">
                <label htmlFor="correo">Correo</label>
                <div className="input-wrap">
                  <span className="input-icon" aria-hidden="true">@</span>
                  <input
                    type="email"
                    id="correo"
                    placeholder="usuario@smartmaint.com"
                    value={correo}
                    onChange={(e) => {
                      setCorreo(e.target.value);
                      if (errors.correo) setErrors((prev) => ({ ...prev, correo: '' }));
                    }}
                    aria-invalid={Boolean(errors.correo)}
                    aria-describedby={errors.correo ? 'correo-error' : undefined}
                    required
                  />
                </div>
                {errors.correo && <p className="field-error" id="correo-error">{errors.correo}</p>}
              </div>

              <div className="field-group">
                <label htmlFor="contrasena">Contraseña</label>
                <div className="input-wrap">
                  <span className="input-icon" aria-hidden="true">*</span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    id="contrasena"
                    placeholder="Tu contraseña"
                    value={contrasena}
                    onChange={(e) => {
                      setContrasena(e.target.value);
                      if (errors.contrasena) setErrors((prev) => ({ ...prev, contrasena: '' }));
                    }}
                    aria-invalid={Boolean(errors.contrasena)}
                    aria-describedby={errors.contrasena ? 'contrasena-error' : undefined}
                    required
                  />
                  <span
                    role="button"
                    tabIndex={0}
                    className="toggle-pass-btn"
                    onClick={() => setShowPass((v) => !v)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setShowPass((v) => !v)}
                    aria-label={showPass ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPass ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </span>
                </div>
                {errors.contrasena && <p className="field-error" id="contrasena-error">{errors.contrasena}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className={isSubmitting ? 'is-loading' : ''}>
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </button>

              <p className="helper-text">
                ¿Aún no tienes cuenta? <a href="/planes">Adquiere un plan y regístrala</a>
              </p>
              <p className="forgot-password-text">
                ¿Olvidaste tu contraseña?{' '}
                <span
                  role="button"
                  tabIndex={0}
                  className="forgot-password-btn"
                  onClick={() => { setShowRecuperarModal(true); setRecuperarCorreo(''); setRecuperarStatus(''); setRecuperarMsg(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setShowRecuperarModal(true); setRecuperarCorreo(''); setRecuperarStatus(''); setRecuperarMsg(''); } }}
                >
                  Click aquí
                </span>
              </p>
            </form>
          </div>
        </div>
      </section>

      {showRecuperarModal && (
        <div className="recuperar-overlay" onClick={() => setShowRecuperarModal(false)}>
          <div className="recuperar-modal" onClick={(e) => e.stopPropagation()}>
            <button className="recuperar-close" type="button" aria-label="Cerrar" onClick={() => setShowRecuperarModal(false)}>✕</button>
            {recuperarStatus === 'ok' ? (
              <div className="recuperar-ok">
                <div className="recuperar-circulo">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#0b4f99" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="recuperar-ok-texto">{recuperarMsg}</p>
                <button type="button" className="recuperar-submit" onClick={() => setShowRecuperarModal(false)}>Entendido</button>
              </div>
            ) : (
              <form onSubmit={handleRecuperar} className="recuperar-form">
                <h2 className="recuperar-titulo">Recuperar contraseña</h2>
                <p className="recuperar-instruccion">
                  Ingresa el correo asociado a tu cuenta de{' '}
                  <em className="recuperar-marca">SMARTMAINT</em>{' '}
                  al cual se enviará la contraseña temporal.
                </p>
                <div className="recuperar-field">
                  <label htmlFor="recuperar-correo">Correo electrónico</label>
                  <div className="recuperar-input-wrap">
                    <span aria-hidden="true">@</span>
                    <input
                      id="recuperar-correo"
                      type="email"
                      placeholder="usuario@smartmaint.com"
                      value={recuperarCorreo}
                      onChange={(e) => setRecuperarCorreo(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>
                {recuperarStatus === 'error' && <p className="recuperar-error">{recuperarMsg}</p>}
                <button type="submit" className="recuperar-submit" disabled={recuperarStatus === 'sending'}>
                  {recuperarStatus === 'sending' ? 'Enviando...' : 'Enviar contraseña temporal'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default Login;