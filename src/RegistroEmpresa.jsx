import React, { useState } from 'react';
import './RegistroEmpresa.css';

const RegistroEmpresa = () => {
  const [id_empresa, setIdEmpresa] = useState('');
  const [idDisponible, setIdDisponible] = useState(null);
  const [sector, setSector] = useState('');
  const [correo_admin, setCorreoAdmin] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [plan, setPlan] = useState('');

  const validarIdEmpresa = async (id) => {
    setIdEmpresa(id);
    if (!id) { setIdDisponible(null); return; }
    try {
      // ✅ URL corregida: /api/empresas/validar-id/
      const res = await fetch(`http://localhost:8080/api/empresas/validar-id/${id}`);
      const data = await res.json();
      setIdDisponible(data.disponible);
    } catch (err) {
      console.error("Error al validar ID:", err);
      setIdDisponible(null);
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    if (!id_empresa || idDisponible === false || !sector || !correo_admin || !contrasena || !plan) {
      alert("⚠️ Todos los campos son obligatorios y el ID debe estar disponible");
      return;
    }
    try {
      // ✅ URL corregida: /api/empresas
      const res = await fetch("http://localhost:8080/api/empresas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idEmpresa: id_empresa, sector, correoAdmin: correo_admin, contrasena, plan })
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Empresa registrada. Revisa tu correo para activar la cuenta.");
        setIdEmpresa(''); setIdDisponible(null); setSector('');
        setCorreoAdmin(''); setContrasena(''); setPlan('');
      } else {
        alert("⚠️ " + (data.error || "Error al registrar"));
      }
    } catch (err) {
      alert("❌ Error de conexión con el servidor");
      console.error(err);
    }
  };

  return (
    <section className="register-section" id="registrar-empresa">
      <div className="register-container" data-aos="fade-up">
        <h2>Registrar Empresa</h2>
        <form className="register-form" onSubmit={handleRegistro}>
          <label htmlFor="id_empresa">ID de Empresa</label>
          <input type="text" id="id_empresa" placeholder="Ej: EMP001"
            value={id_empresa} onChange={(e) => validarIdEmpresa(e.target.value)} required />
          {idDisponible === false && <p className="error-text">⚠️ Este ID ya está en uso.</p>}

          <label htmlFor="sector">Sector</label>
          <input type="text" id="sector" placeholder="Ej: Manufactura, Salud"
            value={sector} onChange={(e) => setSector(e.target.value)} required />

          <label htmlFor="correo_admin">Correo del Administrador</label>
          <input type="email" id="correo_admin" placeholder="admin@empresa.com"
            value={correo_admin} onChange={(e) => setCorreoAdmin(e.target.value)} required />

          <label htmlFor="contrasena">Contraseña</label>
          <input type="password" id="contrasena" placeholder="Crea una contraseña segura"
            value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />

          <label htmlFor="plan">Plan</label>
          <select id="plan" value={plan} onChange={(e) => setPlan(e.target.value)} required>
            <option value="">Seleccione un plan</option>
            <option value="MENSUAL">MENSUAL</option>
            <option value="ANUAL">ANUAL</option>
          </select>

          <button type="submit" disabled={idDisponible === false}>Registrar Empresa</button>
        </form>
      </div>
    </section>
  );
};

export default RegistroEmpresa;