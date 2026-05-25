import apiClient from './apiClient';

const API_URL = '/notificaciones';
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
    const detalle = data?.error || data?.detalle || data?.message || JSON.stringify(data) || err.message;
    return { status, detalle };
  }

  const isNetworkError = err.message && err.message.toLowerCase().includes('network error');
  if (err.request || isNetworkError) {
    return {
      status: 0,
      detalle: 'No se pudo conectar con el servidor.',
    };
  }

  return { status: 0, detalle: err.message };
};

export const getMisNotificaciones = async () => {
  try {
    const res = await apiClient.get(`${API_URL}/mias`, buildAxiosConfig());
    return {
      items: res.data?.items || [],
      pendientes: Number(res.data?.pendientes || 0),
    };
  } catch (err) {
    throw normalizeAxiosError(err);
  }
};

export const marcarNotificacionLeida = async (idNotificacion) => {
  try {
    const res = await apiClient.put(`${API_URL}/${idNotificacion}/leer`, {}, buildAxiosConfig());
    return res.data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
};
