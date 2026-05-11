import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TouchableWithoutFeedback,
  Dimensions,
  Platform
} from 'react-native';
import { 
  Bookmark, 
  Link, 
  Flag, 
  Trash2, 
  X 
} from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';

const { height } = Dimensions.get('window');

interface OptionsBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: () => void;
  onCopyLink: () => void;
  onReport: () => void;
  onDelete?: () => void;
  isOwner?: boolean;
}

export const OptionsBottomSheet: React.FC<OptionsBottomSheetProps> = ({
  isVisible,
  onClose,
  onSave,
  onCopyLink,
  onReport,
  onDelete,
  isOwner
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === 'ios' ? 40 : 20,
      maxHeight: height * 0.5,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: theme.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 12,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text.primary,
    },
    closeButton: {
      padding: 4,
    },
    optionsContainer: {
      paddingVertical: 12,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      gap: 16,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionText: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.text.primary,
    },
    spacer: {
      height: 10,
    }
  });

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              {/* Handle */}
              <View style={styles.handle} />

              <View style={styles.header}>
                <Text style={styles.title}>Opciones de publicación</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color={theme.text.muted} />
                </TouchableOpacity>
              </View>

              <View style={styles.optionsContainer}>
                <TouchableOpacity style={styles.option} onPress={onSave}>
                  <View style={[styles.iconContainer, { backgroundColor: theme.surface }]}>
                    <Bookmark size={20} color={theme.primary} />
                  </View>
                  <Text style={styles.optionText}>Guardar en mis elementos</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={onCopyLink}>
                  <View style={[styles.iconContainer, { backgroundColor: theme.surface }]}>
                    <Link size={20} color={theme.success} />
                  </View>
                  <Text style={styles.optionText}>Copiar enlace</Text>
                </TouchableOpacity>

                {!isOwner ? (
                  <TouchableOpacity style={styles.option} onPress={onReport}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.surface }]}>
                      <Flag size={20} color={theme.error} />
                    </View>
                    <Text style={[styles.optionText, { color: theme.error }]}>Denunciar publicación</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.option} onPress={onDelete}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.surface }]}>
                      <Trash2 size={20} color={theme.error} />
                    </View>
                    <Text style={[styles.optionText, { color: theme.error }]}>Eliminar publicación</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.spacer} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
