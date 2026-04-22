import { Platform } from 'react-native';

/**
 * Host del backend en la red local.
 */
export const API_LAN_HOST = '192.168.101.6';
export const API_PORT = 3000;

export function getApiBaseUrl(): string {
  if (Platform.OS === 'web') {
    return `http://localhost:${API_PORT}`;
  }
  return `http://${API_LAN_HOST}:${API_PORT}`;
}

export const API_BASE_URL = getApiBaseUrl();

/**
 * Genera la URL absoluta para el API, evitando dobles barras.
 */
export function apiPath(path: string): string {
  if (!path) return API_BASE_URL;
  
  // Normalizamos el path: quitamos la barra inicial si existe
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Unimos el BASE_URL con el path usando una sola barra
  return `${API_BASE_URL}/${cleanPath}`;
}

/**
 * URL para mostrar fotos usando el proxy de media.
 * Garantiza una URL limpia sin dobles barras que bloqueen el móvil.
 */
export function mediaUrl(path: string): string {
  if (!path) return 'https://via.placeholder.com/400?text=Sin+Imagen';
  if (path.startsWith('http')) return path;
  
  // 1. Quitamos cualquier rastro de barra inicial del path de la DB
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  
  // 2. Construimos la ruta pasando por el proxy de media
  // Resultado: http://IP:3000/api/media/uploads/users/...
  const finalUrl = apiPath(`api/media/${normalizedPath}`);
  
  console.log('[IMAGE_URL_DEBUG]:', finalUrl);
  return finalUrl;
}
