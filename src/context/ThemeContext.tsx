import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { LIGHT_THEME, DARK_THEME } from '../theme/constants';

type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: typeof LIGHT_THEME;
  isDarkMode: boolean;
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Escuchamos el esquema del sistema
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePrefState] = useState<ThemePreference>('system');

  // Cargamos la preferencia guardada al iniciar
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await SecureStore.getItemAsync('themePreference');
        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
          setThemePrefState(savedTheme as ThemePreference);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };
    loadThemePreference();
  }, []);

  const setThemePreference = async (pref: ThemePreference) => {
    setThemePrefState(pref);
    try {
      await SecureStore.setItemAsync('themePreference', pref);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    if (themePreference === 'system') setThemePreference('light');
    else if (themePreference === 'light') setThemePreference('dark');
    else setThemePreference('system');
  };

  // Determinamos el tema visual final
  // Si la preferencia es 'system', usamos el valor real que devuelve el celular
  const effectiveTheme = themePreference === 'system' 
    ? (systemColorScheme === 'dark' ? 'dark' : 'light')
    : themePreference;

  const isDarkMode = effectiveTheme === 'dark';
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      isDarkMode, 
      themePreference, 
      setThemePreference, 
      toggleTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
