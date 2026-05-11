import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image as RNImage
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { X, Image as ImageIcon, MapPin, Globe, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTheme } from '../context/ThemeContext';
import { useAlert } from '../context/AlertContext';
import { AuthContext } from '../context/AuthContext';
import { api } from '../api/client';

const MAX_PHOTO_EDGE = 1920;

export const CreatePostScreen: React.FC = () => {
  const { theme } = useTheme();
  const { showAlert } = useAlert();
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_CHARS = 1000;

  const pickImage = async () => {
    if (images.length >= 4) {
      showAlert({
        title: 'Límite alcanzado',
        message: 'Puedes subir hasta 4 fotos por publicación.',
        type: 'warning'
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 4 - images.length,
    });
    
    if (result.canceled) return;

    const prepared: string[] = [];
    const remainingSlots = 4 - images.length;
    const assetsToProcess = result.assets.slice(0, remainingSlots);

    for (const asset of assetsToProcess) {
      try {
        const out = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: MAX_PHOTO_EDGE } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        prepared.push(out.uri);
      } catch {
        prepared.push(asset.uri);
      }
    }
    setImages([...images, ...prepared]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      showAlert({
        title: 'Error',
        message: 'Escribe algo o añade una foto para publicar.',
        type: 'warning'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const body = new FormData();
      body.append('content', content.trim());
      
      images.forEach((uri, index) => {
        const name = `post_photo_${index}_${Date.now()}.jpg`;
        body.append('images', {
          uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
          name,
          type: 'image/jpeg',
        } as any);
      });

      await api.post('/api/social/posts', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data, 
      });
      
      showAlert({
        title: '¡Éxito!',
        message: 'Tu publicación ha sido creada.',
        type: 'success'
      });
      navigation.goBack();
    } catch (error: any) {
      console.log('Error detallado:', error);
      console.log('Error response data:', error.response?.data);
      
      let errorMsg = error.message;
      if (typeof error.response?.data === 'string') {
        errorMsg = `Respuesta del servidor: ${error.response.data}`;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      }
      
      showAlert({
        title: 'Error de servidor',
        message: errorMsg || 'No se pudo crear la publicación. Intenta de nuevo.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text.primary,
    },
    inputContainer: {
      padding: 16,
      flex: 1,
    },
    userInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 12,
    },
    avatarPlaceholder: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    userName: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text.primary,
    },
    visibilityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.surface,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginTop: 4,
      alignSelf: 'flex-start',
    },
    visibilityText: {
      fontSize: 12,
      color: theme.text.secondary,
      fontWeight: '600',
    },
    input: {
      fontSize: 18,
      color: theme.text.primary,
      minHeight: 120,
      textAlignVertical: 'top',
      lineHeight: 26,
    },
    imagePreviewContainer: {
      marginTop: 16,
      marginBottom: 20,
    },
    imageScroll: {
      flexDirection: 'row',
    },
    imageCard: {
      width: 120,
      height: 120,
      borderRadius: 16,
      marginRight: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    removeBtn: {
      position: 'absolute',
      top: 6,
      right: 6,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 12,
      padding: 4,
    },
    footerContainer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.background,
    },
    charCount: {
      fontSize: 12,
      color: content.length > MAX_CHARS * 0.9 ? theme.error : theme.text.muted,
      textAlign: 'right',
      marginBottom: 12,
      fontWeight: '500',
    },
    toolbarContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    toolbarLeft: {
      flexDirection: 'row',
      gap: 16,
    },
    toolButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.surface,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
    },
    toolText: {
      fontSize: 14,
      color: theme.primary,
      fontWeight: '600',
    },
    publishButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 20,
    },
    publishButtonDisabled: {
      opacity: 0.5,
    },
    publishButtonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 15,
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={26} color={theme.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nueva Publicación</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView style={styles.inputContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.userInfoRow}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.first_name?.[0] || 'U'}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>
                {user?.first_name} {user?.last_name}
              </Text>
              <View style={styles.visibilityBadge}>
                <Globe size={12} color={theme.text.secondary} />
                <Text style={styles.visibilityText}>Público</Text>
              </View>
            </View>
          </View>

          <TextInput
            placeholder="¿Qué novedades tienes para compartir?"
            placeholderTextColor={theme.text.muted}
            multiline
            autoFocus
            style={styles.input}
            value={content}
            onChangeText={setContent}
            maxLength={MAX_CHARS}
          />
          
          {images.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imageCard}>
                    <RNImage source={{ uri }} style={styles.image} />
                    <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(index)}>
                      <X color="white" size={14} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>

        {/* Toolbar & Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.charCount}>
            {content.length}/{MAX_CHARS}
          </Text>
          <View style={styles.toolbarContainer}>
            <View style={styles.toolbarLeft}>
              <TouchableOpacity style={styles.toolButton} onPress={pickImage}>
                <ImageIcon size={22} color={theme.primary} />
                <Text style={styles.toolText}>Fotos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolButton}>
                <MapPin size={22} color={theme.primary} />
                <Text style={styles.toolText}>Lugar</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.publishButton, (!content.trim() && images.length === 0) && styles.publishButtonDisabled]} 
              onPress={handleSubmit}
              disabled={(!content.trim() && images.length === 0) || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.publishButtonText}>Publicar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
