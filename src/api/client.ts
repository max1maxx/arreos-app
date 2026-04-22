import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../config/api';

/**
 * Cliente Axios profesional y flexible.
 * No forzamos Content-Type para permitir que Axios detecte 
 * automáticamente entre JSON y FormData.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// Interceptor para inyectar el Token
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // IMPORTANTE: No definimos Content-Type aquí. 
    // Si config.data es un FormData, Axios pondrá multipart/form-data.
    // Si config.data es un objeto { }, Axios pondrá application/json.
  } catch (error) {
    console.error('[API_CLIENT] Error al leer token');
  }
  return config;
});

// Manejo centralizado de errores
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    let message = 'Error inesperado';
    
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('jwtToken');
      await SecureStore.deleteItemAsync('userRole');
      await SecureStore.deleteItemAsync('userData');
    }

    if (error.response) {
      const data = error.response.data as any;
      message = data?.message || data?.error || `Error ${error.response.status}`;
    } else if (error.request) {
      message = 'El servidor no respondió. Revisa la IP y tu conexión WiFi.';
    } else {
      message = error.message;
    }
    
    const customError = error as any;
    customError.userMessage = message;
    return Promise.reject(customError);
  }
);

export function getApiErrorMessage(error: any, fallback = 'Error'): string {
  return error?.userMessage || error?.message || fallback;
}
