import apiClient from './apiClient';
import { getRefreshToken } from '../utils/session';

export const login = async (correo, contrasena) => {
  const response = await apiClient.post('/auth/login', { correo, contrasena });
  return response.data;
};

/**
 * Cierra la sesión revocando el refresh token en el backend.
 * El frontend se encarga de limpiar el storage mediante expireSession().
 */
export const logout = async () => {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } catch {
      // Si falla la llamada al backend, igual limpiamos localmente
    }
  }
};

export const recuperarContrasena = async (correo) => {
  const response = await apiClient.post('/auth/recuperar-contrasena', { correo });
  return response.data;
};

export const cambiarContrasenaInicial = async (contrasenaActual, nuevaContrasena) => {
  const response = await apiClient.put('/auth/cambiar-contrasena-inicial', {
    contrasenaActual,
    nuevaContrasena,
  });
  return response.data;
};

export const registrarEmpresa = async (empresaData) => {
  const response = await apiClient.post('/empresas', empresaData);
  return response.data;
};

export const registrarCompraPlan = async (payload) => {
  const response = await apiClient.post('/empresas/planes/compra', payload);
  return response.data;
};
