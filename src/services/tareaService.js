// src/services/tareaService.js
import axios from 'axios';
import apiClient, { API_BASE_URL } from './apiClient';
import { getAuthHeader } from '../utils/session';

const API_URL = '/tareas';
const DEFAULT_TIMEOUT = 10000; // ms

const buildAxiosConfig = (extraHeaders = {}) => ({
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...extraHeaders
  }
});

const normalizeAxiosError = (err) => {
  if (err.response) {
    const status = err.response.status;
    const data = err.response.data;
    const detalle = data?.detalle || data?.error || data?.message || JSON.stringify(data) || err.message;
    return { status, detalle };
  }

  const isNetworkError = err.message && err.message.toLowerCase().includes('network error');
  if (err.request || isNetworkError) {
    return {
      status: 0,
      detalle: 'No se pudo conectar con el servidor (posible CORS o servidor apagado).',
    };
  }

  return { status: 0, detalle: err.message };
};

/* ============================================================
   🔍 Listar tareas asignadas al usuario actual
   ============================================================ */
export const getTareasAsignadas = async () => {
  try {
    const config = buildAxiosConfig();
    const res = await apiClient.get(`${API_URL}/mias`, config);
    return res.data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
};

/* ============================================================
   🔍 Listar todas las tareas (solo admin)
   ============================================================ */
export const getTareasAdmin = async () => {
  try {
    const config = buildAxiosConfig();
    const res = await apiClient.get(`${API_URL}/admin`, config);
    return res.data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
};

/* ============================================================
   🔍 Obtener tarea por ID
   ============================================================ */
export const getTareaPorId = async (id) => {
  try {
    const config = buildAxiosConfig();
    const res = await apiClient.get(`${API_URL}/${id}`, config);
    return res.data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
};

/* ============================================================
   ➕ Crear nueva tarea
   ============================================================ */
export const crearTarea = async (tarea) => {
  try {
    let config;

    if (tarea instanceof FormData) {
      // Do NOT set Content-Type manually — axios auto-adds multipart boundary
      config = {
        timeout: DEFAULT_TIMEOUT,
        headers: { ...getAuthHeader() },
      };
    } else {
      config = buildAxiosConfig();
    }

    const response = await apiClient.post(API_URL, tarea, config);
    return response.data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
};

/* ============================================================
   🔄 Actualizar estado de tarea
   ============================================================ */
export const actualizarEstado = async (id, nuevoEstado) => {
  try {
    const config = buildAxiosConfig();
    const response = await apiClient.put(
      `${API_URL}/${id}/estado`,
      { estado: nuevoEstado },
      config
    );
    return response.data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
};

/* ============================================================
   📝 Agregar / reemplazar nota-observación (usuario autenticado)
   ============================================================ */
export const agregarNota = async (id, observaciones) => {
  try {
    const config = buildAxiosConfig();
    const response = await apiClient.patch(
      `${API_URL}/${id}/nota`,
      { observaciones },
      config
    );
    return response.data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
};

/* ============================================================
   📋 Listar notas de una tarea
   ============================================================ */
export const getNotasTarea = async (tareaId) => {
  try {
    const config = buildAxiosConfig();
    const response = await apiClient.get(`${API_URL}/${tareaId}/notas`, config);
    return response.data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
};

/* ============================================================
   📝 Crear nueva nota en una tarea
   ============================================================ */
export const crearNotaTarea = async (tareaId, texto, autorNombre) => {
  try {
    const config = buildAxiosConfig();
    const response = await apiClient.post(
      `${API_URL}/${tareaId}/notas`,
      { texto, autorNombre },
      config
    );
    return response.data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
};

/* ============================================================
   ✏️  Actualizar todos los campos de una tarea (ADMIN)
   ============================================================ */
export const actualizarTarea = async (id, formData) => {
  try {
    const headers = {
      ...getAuthHeader(),
      'Content-Type': 'multipart/form-data',
    };

    try {
      const response = await axios.put(`${API_BASE_URL}/api${API_URL}/${id}`, formData, { headers });
      return response.data;
    } catch (err) {
      if (err?.response?.status === 405) {
        const fallback = await axios.post(`${API_BASE_URL}/api${API_URL}/${id}`, formData, { headers });
        return fallback.data;
      }
      throw err;
    }
  } catch (err) {
    throw normalizeAxiosError(err);
  }
};

/* ============================================================
   🗑️  Eliminar una tarea por ID
   ============================================================ */
export const eliminarTarea = async (id) => {
  try {
    const config = buildAxiosConfig();
    const response = await apiClient.delete(`${API_URL}/${id}`, config);
    return response.data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
};

/* ============================================================
   📅 Filtrar tareas por rango de fechas (Usuario)
   ============================================================ */
export const getTareasAsignadasPorRango = async (fechaInicio, fechaFin) => {
  try {
    const config = buildAxiosConfig();
    const res = await apiClient.get(
      `${API_URL}/mias?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
      config
    );
    return res.data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
};

/* ============================================================
   📅 Filtrar tareas por rango de fechas (Admin)
   ============================================================ */
export const getTareasAdminPorRango = async (fechaInicio, fechaFin) => {
  try {
    const config = buildAxiosConfig();
    const res = await apiClient.get(
      `${API_URL}/admin?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
      config
    );
    return res.data;
  } catch (err) {
    throw normalizeAxiosError(err);
  }
};
