import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../config/api';

/**
 * Cliente Axios configurado profesionalmente.
 * El timeout es generoso para conexiones móviles inestables.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Inyección automática de Token JWT
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // Silencioso: si no hay token, la API lo rechazará si es necesario
  }
  return config;
});

// Manejo centralizado de errores de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    let message = 'Ocurrió un error inesperado';
    
    // Si recibimos un 401 (No autorizado), el token probablemente expiró
    if (error.response?.status === 401) {
      console.warn('[AUTH] Token expirado o inválido. Cerrando sesión...');
      await SecureStore.deleteItemAsync('jwtToken');
      await SecureStore.deleteItemAsync('userRole');
      await SecureStore.deleteItemAsync('userData');
      // Podríamos emitir un evento o usar un callback para resetear el estado global
    }

    if (error.response) {
      // El servidor respondió con un error (4xx, 5xx)
      const data = error.response.data as any;
      message = data?.message || data?.error || `Error ${error.response.status}`;
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta (Network Error)
      message = 'No se pudo conectar con el servidor. Verifica tu internet e IP.';
    } else {
      message = error.message;
    }
    
    // Adjuntamos el mensaje legible para la UI
    const customError = error as any;
    customError.userMessage = message;
    
    return Promise.reject(customError);
  }
);

/**
 * Helper para obtener mensajes de error limpios.
 */
export function getApiErrorMessage(error: any, fallback?: string): string {
  return error?.userMessage || error?.message || fallback || 'Error desconocido';
}
