import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  // URL para el emulador de Android (10.0.2.2 apunta al localhost de la PC).
  // Si usas tu celular físico con Expo Go, cambia esto por la IP local de tu PC (ej: 192.168.X.X:8080)
  baseURL: 'http://10.0.2.2:8080/api', 
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
