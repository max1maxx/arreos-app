import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import CONFIG, { getApiUrl } from '../config/api';

/**
 * Robust API Client for Mobile
 */

const apiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Listener para disparar el logout desde fuera de los componentes
let logoutHandler: (() => void) | null = null;
export const setGlobalLogoutHandler = (handler: () => void) => {
  logoutHandler = handler;
};

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // LLAVE CORRECTA: jwtToken (según AuthContext)
      const token = await SecureStore.getItemAsync('jwtToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('API Client: Error retrieving token', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Si recibimos un 401, el token no es válido o expiró
    if (error.response?.status === 401) {
      console.warn('⚠️ Sesión expirada detectada (401). Cerrando sesión...');
      if (logoutHandler) {
        logoutHandler();
      }
    }

    const customError = {
      ...error,
      message: (error.response?.data as any)?.message || (error.response?.data as any)?.error || error.message || 'Error de conexión con el servidor',
    };

    return Promise.reject(customError);
  }
);

export const getApiErrorMessage = (error: any, defaultMessage: string = 'Error de conexión'): string => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.message) return error.message;
  return defaultMessage;
};

export const api = apiClient;
export default apiClient;
