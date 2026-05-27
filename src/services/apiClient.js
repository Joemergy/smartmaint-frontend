import axios from 'axios';
import {
  getAuthHeader,
  getRefreshToken,
  setRefreshToken,
  updateAccessToken,
} from '../utils/session';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 12000,
});

const PUBLIC_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout', '/auth/recuperar-contrasena', '/empresas'];

// ── Estado de renovación de token ─────────────────────────────────────────────
// Garantiza que si múltiples requests fallan simultáneamente por 401,
// solo se haga UNA llamada de refresh y todas las demás esperan el resultado.
let isRefreshing = false;
let pendingQueue = []; // [{ resolve, reject }]

const drainQueue = (error, newToken) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(newToken)
  );
  pendingQueue = [];
};

// ── Request interceptor ───────────────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const requestUrl = String(config?.url || '');
  const normalizedUrl = requestUrl.toLowerCase();
  const isPublic = PUBLIC_ENDPOINTS.some((endpoint) => {
    const normalizedEndpoint = endpoint.toLowerCase();
    return normalizedUrl.endsWith(normalizedEndpoint) || normalizedUrl.includes(normalizedEndpoint);
  });

  // La sesión no expira automáticamente, solo cuando el usuario decide cerrar sesión
  // if (!isPublic && !config?.headers?.Authorization && isTokenExpired()) {
  //   const refreshToken = getRefreshToken();
  //   if (!refreshToken) {
  //     expireSession();
  //     return Promise.reject(new Error('Sesión expirada. Inicia sesión nuevamente.'));
  //   }
  // }

  const nextConfig = { ...config };
  nextConfig.headers = {
    'Content-Type': 'application/json',
    ...config.headers,
  };

  if (isPublic) {
    Object.keys(nextConfig.headers).forEach((key) => {
      if (key.toLowerCase() === 'authorization') {
        delete nextConfig.headers[key];
      }
    });
  } else {
    nextConfig.headers = {
      ...nextConfig.headers,
      ...getAuthHeader(),
    };
  }

  return nextConfig;
});

// ── Response interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config;

    // 429: rate limit superado en login
    if (status === 429) {
      return Promise.reject(error);
    }

    // 401: intentar renovar el access token con el refresh token
    // La sesión no expira automáticamente, solo cuando el usuario decide cerrar sesión
    if (status === 401 && originalRequest && !originalRequest._retry) {
      // Si ya estamos renovando, encolar la request fallida
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        });
      }

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        // No cerrar sesión automáticamente, dejar que el usuario decida
        // expireSession();
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Llamada directa con axios para no circular a través de apiClient
        const { data } = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          { refreshToken }
        );

        const newAccessToken = data.token;
        const newRefreshToken = data.refreshToken;

        updateAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);

        // Reintentar la request original con el nuevo token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        drainQueue(null, newAccessToken);

        return apiClient(originalRequest);
      } catch (refreshError) {
        drainQueue(refreshError, null);
        // No cerrar sesión automáticamente, dejar que el usuario decida
        // expireSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 403: acceso denegado (diferente de token expirado, no cerrar sesión)
    if (status === 403) {
      console.error('apiClient.js 403 Forbidden:', originalRequest?.method, originalRequest?.url, error?.response?.data);
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
