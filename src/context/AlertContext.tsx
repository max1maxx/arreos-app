import React, { createContext, useState, useContext, useCallback } from 'react';
import { CustomAlert, AlertType } from '../components/CustomAlert';

interface AlertOptions {
  title: string;
  message: string;
  type?: AlertType;
  showCancel?: boolean; // Nueva bandera
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertOptions>({
    title: '',
    message: '',
    type: 'info',
    showCancel: false
  });

  const showAlert = useCallback((options: AlertOptions) => {
    setConfig({
      ...options,
      type: options.type || 'info',
      showCancel: options.showCancel || false
    });
    setVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setVisible(false);
  }, []);

  const handleConfirm = () => {
    if (config.onConfirm) {
      config.onConfirm();
    }
    hideAlert();
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlert 
        visible={visible}
        title={config.title}
        message={config.message}
        type={config.type || 'info'}
        showCancel={config.showCancel}
        onClose={hideAlert}
        onConfirm={config.onConfirm ? handleConfirm : undefined}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
