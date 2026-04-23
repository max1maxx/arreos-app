import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { LIGHT_THEME, DARK_THEME } from '../theme/constants';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: typeof LIGHT_THEME;
  isDarkMode: boolean;
  themeType: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeType, setThemeType] = useState<ThemeType>(systemColorScheme || 'light');

  useEffect(() => {
    // Cargar preferencia guardada al iniciar
    const loadThemePreference = async () => {
      try {
        const savedTheme = await SecureStore.getItemAsync('themePreference');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setThemeType(savedTheme);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };
    loadThemePreference();
  }, []);

  const toggleTheme = async () => {
    const newTheme = themeType === 'light' ? 'dark' : 'light';
    setThemeType(newTheme);
    try {
      await SecureStore.setItemAsync('themePreference', newTheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const isDarkMode = themeType === 'dark';
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, themeType, toggleTheme }}>
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
