import { Platform } from 'react-native';

/**
 * Host del backend en la red local (mismo Wi‑Fi que el teléfono con Expo).
 * Cambia solo aquí si tu PC obtiene otra IP.
 */
export const API_LAN_HOST = '192.168.101.6';

export const API_PORT = 3000;

/**
 * URL base del API (sin barra final): http://HOST:PORT
 * En web usa localhost; en iOS/Android usa la IP de la máquina que corre Next.js.
 */
export function getApiBaseUrl(): string {
  if (Platform.OS === 'web') {
    return `http://localhost:${API_PORT}`;
  }
  return `http://${API_LAN_HOST}:${API_PORT}`;
}

export const API_BASE_URL = getApiBaseUrl();

/**
 * Ruta absoluta del backend (ej. `/api/livestock`).
 */
export function apiPath(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${p}`;
}

/**
 * URL para mostrar un recurso estático (imagen subida: `/uploads/...` o URL ya absoluta).
 */
export function mediaUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return apiPath(path.startsWith('/') ? path : `/${path}`);
}
