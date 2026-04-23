import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, setGlobalLogoutHandler } from '../api/client';

export type Role = 'ADMIN' | 'PRODUCER' | 'DRIVER' | null;

interface AuthContextType {
  user: any;
  role: Role;
  jwtToken: string | null;
  isLoading: boolean;
  login: (token: string, userData: any, userRole: Role) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<Role>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await SecureStore.deleteItemAsync('jwtToken');
      await SecureStore.deleteItemAsync('userRole');
      await SecureStore.deleteItemAsync('userData');
      
      setJwtToken(null);
      setUser(null);
      setRole(null);
      console.log('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Registrar el logout global al montar el contexto
  useEffect(() => {
    setGlobalLogoutHandler(() => {
      logout();
    });
  }, [logout]);

  // Cargar y VALIDAR datos al iniciar la App
  useEffect(() => {
    const loadAndValidateSession = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('jwtToken');
        const storedUser = await SecureStore.getItemAsync('userData');
        const storedRole = await SecureStore.getItemAsync('userRole');
        
        if (storedToken && storedUser) {
          // PASO 1: Cargar datos locales inmediatamente para que la app no se vea vacía
          const parsedUser = JSON.parse(storedUser);
          setJwtToken(storedToken);
          setUser(parsedUser);
          setRole(storedRole as Role);
          setIsLoading(false); // Ya podemos mostrar la app con datos locales

          console.log('Sesión local cargada, validando con servidor...');
          
          // PASO 2: Validar en segundo plano
          try {
            const response = await api.get('/api/auth/me', {
              headers: { Authorization: `Bearer ${storedToken}` }
            });

            if (response.data?.user) {
              // Actualizar datos con lo más reciente del servidor si es necesario
              setUser(response.data.user);
              await SecureStore.setItemAsync('userData', JSON.stringify(response.data.user));
              console.log('Sesión confirmada por servidor');
            }
          } catch (e: any) {
            // SOLO cerramos sesión si el servidor responde explícitamente 401 (No autorizado)
            // Si es un error de red (500, timeout, sin internet), MANTENEMOS la sesión local.
            if (e.response?.status === 401) {
              console.warn('Token inválido. Cerrando sesión...');
              await logout();
            } else {
              console.log('No se pudo conectar al servidor, manteniendo sesión offline');
            }
          }
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error en inicialización de Auth:', error);
        setIsLoading(false);
      }
    };
    loadAndValidateSession();
  }, [logout]);

  const login = async (token: string, userData: any, userRole: Role) => {
    try {
      await SecureStore.setItemAsync('jwtToken', token);
      await SecureStore.setItemAsync('userRole', userRole || 'User');
      await SecureStore.setItemAsync('userData', JSON.stringify(userData));
      
      setJwtToken(token);
      setUser(userData);
      setRole(userRole);
      
      console.log('Login exitoso para:', userData.email);
    } catch (error) {
      console.error('Error al persistir el login:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, jwtToken, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
