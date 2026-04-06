import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CredencialesDemo = () => {
  const [credenciales, setCredenciales] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/demo/listar')
      .then(res => setCredenciales(res.data))
      .catch(err => console.error('Error al obtener credenciales demo:', err));
  }, []);

  const admin = credenciales.find(u => u.rol === 'ADMIN');
  const usuario = credenciales.find(u => u.rol === 'USUARIO');

  return (
    <div className="demo-credenciales">
      <h3>🔐 Acceso demo temporal</h3>
      {admin && usuario ? (
        <>
          <p><strong>Admin:</strong> {admin.correo} / <code>demo1234</code></p>
          <p><strong>Usuario:</strong> {usuario.correo} / <code>demo1234</code></p>
          <p className="demo-aviso">Válido por 1 semana. Sin registro. Acceso institucional inmediato.</p>
        </>
      ) : (
        <p>Cargando credenciales demo...</p>
      )}
    </div>
  );
};

export default CredencialesDemo;
