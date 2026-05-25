import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ActivarCuenta.css';

const ActivarCuenta = () => {
  const { search } = useLocation();
  const navigate = useNavigate();

  const params = useMemo(() => new URLSearchParams(search), [search]);
  const correo = params.get('correo') || '';
  const empresa = params.get('empresa') || '';
  const plan = params.get('plan') || '';
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  const validar = () => {
    if (!token || !correo) return "Token o correo inválidos.";
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (!/[A-Z]/.test(password)) return "Incluye al menos una mayúscula.";
    if (!/[a-z]/.test(password)) return "Incluye al menos una minúscula.";
    if (!/[0-9]/.test(password)) return "Incluye al menos un número.";
    if (password !== confirmar) return "Las contraseñas no coinciden.";
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = validar();
    if (msg) {
      setError(msg);
      return;
    }
    setError('');

    // Simulación de guardado en backend
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log('ACTIVACION_SIMULADA', { correo, empresa, plan, token, passwordHash: '***' });

    setOk(true);
  };

  return (
    <section className="activar-wrapper">
      <h1 className="activar-titulo">Activar cuenta</h1>
      <p className="activar-info">
        <strong>Correo:</strong> {correo} · <strong>Empresa:</strong> {empresa} · <strong>Plan:</strong> {plan}
      </p>

      {!ok ? (
        <form className="activar-form" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nueva contraseña (min 8, con mayúscula, minúscula y número)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
          />
          {error && <p className="activar-error">⚠️ {error}</p>}
          <button className="activar-boton" type="submit">Guardar contraseña</button>
        </form>
      ) : (
        <div className="activar-exito">
          <p>Tu cuenta ha sido activada correctamente.</p>
          <button className="activar-boton" onClick={() => navigate('/login')}>Ir al login</button>
        </div>
      )}
    </section>
  );
};

export default ActivarCuenta;
