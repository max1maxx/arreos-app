import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

export type Role = 'Admin' | 'User' | null;

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

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('jwtToken');
        const storedRole = await SecureStore.getItemAsync('userRole');
        
        if (storedToken && storedRole) {
          setJwtToken(storedToken);
          setRole(storedRole as Role);
          // Opcional: Podrías decodificar el JWT aquí o hacer un fetch a /me para obtener los datos completos del usuario
          setUser({ email: 'usuario@cargado.local' }); 
        }
      } catch (error) {
        console.error('Error al cargar el token', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = async (token: string, userData: any, userRole: Role) => {
    setIsLoading(true);
    try {
      await SecureStore.setItemAsync('jwtToken', token);
      await SecureStore.setItemAsync('userRole', userRole || 'User');
      setJwtToken(token);
      setUser(userData);
      setRole(userRole);
    } catch (error) {
      console.error('Error al guardar el token', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await SecureStore.deleteItemAsync('jwtToken');
      await SecureStore.deleteItemAsync('userRole');
      setJwtToken(null);
      setUser(null);
      setRole(null);
    } catch (error) {
      console.error('Error al eliminar el token', error);
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
