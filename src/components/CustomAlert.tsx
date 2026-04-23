import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type: AlertType;
  onClose: () => void;
  onConfirm?: () => void;
  showCancel?: boolean; // Nueva propiedad
  confirmText?: string;
  cancelText?: string;
}

export const CustomAlert = ({ 
  visible, 
  title, 
  message, 
  type, 
  onClose, 
  onConfirm, 
  showCancel = false, // Por defecto no se muestra
  confirmText = 'Aceptar', 
  cancelText = 'Cancelar' 
}: CustomAlertProps) => {
  const { theme, isDarkMode } = useTheme();

  const getIcon = () => {
    const size = 50;
    switch (type) {
      case 'success': return <CheckCircle2 size={size} color={theme.success} />;
      case 'error': return <XCircle size={size} color={theme.error} />;
      case 'warning': return <AlertTriangle size={size} color="#F59E0B" />;
      case 'info': return <Info size={size} color={theme.primary} />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'success': return theme.success;
      case 'error': return theme.error;
      case 'warning': return "#F59E0B";
      case 'info': return theme.primary;
    }
  };

  const handlePrimaryPress = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.alertContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}>
            {getIcon()}
          </View>
          
          <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.text.secondary }]}>{message}</Text>

          <View style={styles.buttonContainer}>
            {showCancel && (
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton, { borderColor: theme.border }]} 
                onPress={onClose}
              >
                <Text style={[styles.buttonText, { color: theme.text.secondary }]}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: getTypeColor() }]} 
              onPress={handlePrimaryPress}
            >
              <Text style={[styles.buttonText, { color: 'white' }]}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  alertContainer: { width: width * 0.85, borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
  iconContainer: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '900', marginBottom: 10, textAlign: 'center' },
  message: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 30, paddingHorizontal: 10 },
  buttonContainer: { flexDirection: 'row', gap: 12, width: '100%' },
  button: { flex: 1, height: 55, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  cancelButton: { borderWidth: 1, backgroundColor: 'transparent' },
  buttonText: { fontSize: 16, fontWeight: '800' }
});
