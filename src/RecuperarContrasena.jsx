import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const RecuperarContrasena = () => {
  const [correo, setCorreo] = useState('');
  const [enviado, setEnviado] = useState(false);
  const navigate = useNavigate();

  const handleRecuperacion = async (e) => {
    e.preventDefault();

    if (!correo) {
      alert("⚠️ Por favor ingresa tu correo electrónico");
      return;
    }

    try {
      // En el futuro, llamar al endpoint del backend
      alert("✅ Se ha enviado un enlace de recuperación a tu correo: " + correo);
      setEnviado(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error("❌ Error:", err);
      alert("❌ Error al procesar la solicitud. Intenta nuevamente.");
    }
  };

  return (
    <main className="login-page">
      <section className="login-section">
        <div className="login-box" data-aos="fade-up">
          <h2><em>Recuperar contraseña</em></h2>
          {!enviado ? (
            <form className="login-form" onSubmit={handleRecuperacion}>
              <label htmlFor="correo">Correo electrónico</label>
              <input
                type="email"
                id="correo"
                placeholder="tu-email@smartmaint.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
              <p style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center', marginTop: '10px' }}>
                Ingresa el correo asociado a tu cuenta para recibir un enlace de recuperación.
              </p>
              <button type="submit">Enviar enlace</button>
              <p className="helper-text">
                <a href="/login">Volver al login</a>
              </p>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ color: '#004080', fontSize: '1.1rem' }}>✅ Enlace enviado correctamente</p>
              <p style={{ color: '#666', marginTop: '10px' }}>
                Hemos enviado un enlace de recuperación a <strong>{correo}</strong>
              </p>
              <p style={{ color: '#666', marginTop: '15px' }}>Redirigiendo al login en 3 segundos...</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default RecuperarContrasena;
