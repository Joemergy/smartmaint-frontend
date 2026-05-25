import apiClient from './apiClient';

const API_URL = '/usuarios';
const DEFAULT_TIMEOUT = 10000;

const buildAxiosConfig = () => ({
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

const normalizeAxiosError = (err) => {
  if (err.response) {
    const status = err.response.status;
    const data = err.response.data;
    const detalle = data?.detalle || data?.message || JSON.stringify(data) || err.message;
    return { status, detalle };
  }

  if (err.request) {
    return {
      status: 0,
      detalle: 'No se pudo conectar con el servidor.',
    };
  }

  return { status: 0, detalle: err.message };
};

export const listarUsuariosAdmin = async () => {
  try {
    const res = await apiClient.get(API_URL, buildAxiosConfig());
    return res.data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
};

export const listarColaboradoresAdmin = async () => {
  const usuarios = await listarUsuariosAdmin();
  return (Array.isArray(usuarios) ? usuarios : []).map((u) => ({
    id: u.id,
    idColaborador: u.idColaborador || '',
    nombreCompleto: (u.nombreCompleto || u.nombre || '').trim(),
    correo: (u.correo || '').trim(),
    cargo: u.cargo || '',
    rol: u.rol || '',
  }));
};

export const crearUsuarioAdmin = async (payload) => {
  try {
    const res = await apiClient.post(API_URL, payload, buildAxiosConfig());
    return res.data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
};

export const eliminarUsuarioAdmin = async (idUsuario) => {
  try {
    await apiClient.delete(`${API_URL}/${idUsuario}`, buildAxiosConfig());
    return true;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
};

export const listarRolesSistema = async () => {
  try {
    const res = await apiClient.get('/roles', buildAxiosConfig());
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    throw normalizeAxiosError(err);
  }
};
