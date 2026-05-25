import React, { useState } from 'react';
import axios from 'axios';

const SolicitudDemo = () => {
  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [correo, setCorreo] = useState('');
  const [respuesta, setRespuesta] = useState(null);
  const [error, setError] = useState('');

  const solicitarDemo = async () => {
    setError('');
    setRespuesta(null);

    try {
      const res = await axios.post('http://localhost:8080/api/demo/solicitar', {
        nombre,
        empresa,
        correo
      });
      setRespuesta(res.data);
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Error inesperado al solicitar demo.';
      setError(mensaje);
    }
  };

  return (
    <div className="solicitud-demo">
      <h3>🎯 Solicita acceso demo</h3>
      <input
        type="text"
        placeholder="Nombre institucional"
        value={nombre}
        onChange={e => setNombre(e.target.value)}
      />
      <input
        type="text"
        placeholder="Nombre de empresa"
        value={empresa}
        onChange={e => setEmpresa(e.target.value)}
      />
      <input
        type="email"
        placeholder="Correo para recibir credenciales"
        value={correo}
        onChange={e => setCorreo(e.target.value)}
      />
      <button onClick={solicitarDemo}>Solicitar demo</button>

      {respuesta && (
        <div className="demo-respuesta">
          <p>Las credenciales demo de administrador y usuario fueron enviadas a <strong>{respuesta.destinatario}</strong>.</p>
          <p className="demo-aviso">Válido por 1 semana. Revisa tu correo para ingresar.</p>
        </div>
      )}

      {error && (
        <div className="demo-error">
          <p>⚠️ <strong>Solicitud rechazada:</strong> {error}</p>
        </div>
      )}
    </div>
  );
};

export default SolicitudDemo;
