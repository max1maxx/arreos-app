import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

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

  // Cargar datos al iniciar la App
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('jwtToken');
        const storedRole = await SecureStore.getItemAsync('userRole');
        const storedUser = await SecureStore.getItemAsync('userData');
        
        console.log('Cargando sesión persistente...');
        
        if (storedToken && storedRole) {
          setJwtToken(storedToken);
          setRole(storedRole as Role);
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            console.log('Usuario cargado:', parsedUser.first_name, parsedUser.last_name);
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos de sesión:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredData();
  }, []);

  const login = async (token: string, userData: any, userRole: Role) => {
    try {
      // Guardar en el celular
      await SecureStore.setItemAsync('jwtToken', token);
      await SecureStore.setItemAsync('userRole', userRole || 'User');
      await SecureStore.setItemAsync('userData', JSON.stringify(userData));
      
      // Actualizar estado global
      setJwtToken(token);
      setUser(userData);
      setRole(userRole);
      
      console.log('Login exitoso para:', userData.first_name, userData.last_name);
    } catch (error) {
      console.error('Error al persistir el login:', error);
    }
  };

  const logout = async () => {
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
  };

  return (
    <AuthContext.Provider value={{ user, role, jwtToken, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
