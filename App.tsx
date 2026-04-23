import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { LivestockProvider } from './src/context/LivestockContext';
import { AlertProvider } from './src/context/AlertContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <AlertProvider>
        <LivestockProvider>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </LivestockProvider>
      </AlertProvider>
    </ThemeProvider>
  );
}
