import { Platform } from 'react-native';

/**
 * Production-ready API Configuration
 */
const CONFIG = {
  API_URL: 'https://arreos.fregodesigns.com',
  DEV_API_URL: Platform.select({
    android: 'http://10.0.2.2:3000', 
    ios: 'http://localhost:3000',     
    default: 'http://localhost:3000',
  }),
  TIMEOUT: 15000,
};

export const getApiUrl = () => {
  return CONFIG.API_URL;
};

/**
 * Global Utility for Media URLs
 * Automatically formats the path to point to our media route
 */
export const mediaUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Clean path: remove leading slashes if any
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Our backend serves media via /api/media/...
  return `${getApiUrl()}/api/media/${cleanPath}`;
};

export default CONFIG;
