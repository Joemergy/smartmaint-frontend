import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cambiarContrasenaInicial } from './services/authService';
import { useAuth } from './hooks/useAuth';
import './CambioContrasenaInicial.css';

const CambioContrasenaInicial = () => {
  const navigate = useNavigate();
  const { role, updateSession } = useAuth();
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!contrasenaActual || !nuevaContrasena || !confirmarContrasena) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (nuevaContrasena !== confirmarContrasena) {
      setError('La nueva contraseña y la confirmación no coinciden.');
      return;
    }
    if (nuevaContrasena.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setSaving(true);
    try {
      await cambiarContrasenaInicial(contrasenaActual, nuevaContrasena);
      updateSession({ requiereCambioContrasena: false });

      if (role === 'ADMIN' || role === 'SUPERADMIN') {
        navigate('/dashboard-tareas');
      } else {
        navigate('/mis-tareas');
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'No se pudo actualizar la contraseña.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="cambio-pass-page">
      <section className="cambio-pass-box">
        <h2>Cambio de contraseña obligatorio</h2>
        <p>Debes actualizar tu contraseña antes de continuar.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="actual">Contraseña actual</label>
          <input id="actual" type="password" value={contrasenaActual} onChange={(e) => setContrasenaActual(e.target.value)} />

          <label htmlFor="nueva">Nueva contraseña</label>
          <input id="nueva" type="password" value={nuevaContrasena} onChange={(e) => setNuevaContrasena(e.target.value)} />

          <label htmlFor="confirmar">Confirmar nueva contraseña</label>
          <input id="confirmar" type="password" value={confirmarContrasena} onChange={(e) => setConfirmarContrasena(e.target.value)} />

          {error && <div className="cambio-pass-error">{error}</div>}

          <button type="submit" disabled={saving}>
            {saving ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default CambioContrasenaInicial;
