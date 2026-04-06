// src/services/correo.service.js
export const generarTokenActivacion = (correo) => {
  const base = `${correo}-${Date.now()}`;
  return btoa(base); // token simple para demo
};

export const enviarCorreoActivacion = async ({ correoInstitucional, idEmpresa, plan }) => {
  const token = generarTokenActivacion(correoInstitucional);

  // Simulación de envío (log + retraso)
  await new Promise((resolve) => setTimeout(resolve, 800));
  console.log('EMAIL_SIMULADO', {
    to: correoInstitucional,
    subject: 'Activación de cuenta SMARTMAINT',
    link: `/activar-cuenta?token=${token}&correo=${encodeURIComponent(correoInstitucional)}&empresa=${encodeURIComponent(idEmpresa)}&plan=${plan}`,
  });

  return { ok: true, token };
};
