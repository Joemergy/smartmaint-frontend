import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RegistroConfirmado.css';

const RegistroConfirmado = () => {
  const navigate = useNavigate();

  return (
    <section className="registro-wrapper">
      <h1 className="registro-titulo">¡Registro exitoso!</h1>
      <p className="registro-mensaje">
        Tu cuenta administrativa ha sido creada. Revisa tu correo con los datos de acceso.
      </p>
      <button className="registro-boton" onClick={() => navigate('/login')}>
        Ir al login
      </button>
    </section>
  );
};

export default RegistroConfirmado;
