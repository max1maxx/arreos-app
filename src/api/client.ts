import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import CONFIG, { getApiUrl } from '../config/api';

/**
 * Robust API Client for Mobile
 * Handles:
 * 1. Automatic JWT Attachment
 * 2. 401 (Unauthorized) Redirection/Logout
 * 3. Base Timeout and Headers
 */

const apiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// REQUEST INTERCEPTOR: Inject the Auth Token automatically
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
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

// RESPONSE INTERCEPTOR: Handle global error cases (e.g., 401 Logout)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle session expiration
    if (error.response?.status === 401) {
      console.warn('API Client: Unauthorized request detected. Forcing logout...');
      
      // Clean up local storage
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userData');
      
      // We could add a navigation redirect here or use a Context event
      // emitter to force a login screen if needed.
    }

    // Enhance error message for the UI
    const customError = {
      ...error,
      message: (error.response?.data as any)?.message || error.message || 'Error de conexión con el servidor',
    };

    return Promise.reject(customError);
  }
);

/**
 * Global Utility for API Error Messages
 */
export const getApiErrorMessage = (error: any, defaultMessage: string = 'Error de conexión'): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return defaultMessage;
};

export const api = apiClient;
export default apiClient;
