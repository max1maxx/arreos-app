import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  ScrollView, SafeAreaView, Alert, ActivityIndicator, Platform 
} from 'react-native';
import { User, Phone, MapPin, AlignLeft, Check, ChevronLeft } from 'lucide-react-native';
import { api, getApiErrorMessage } from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const EditProfileScreen = ({ navigation }: any) => {
  const { user, jwtToken, login } = useContext(AuthContext);
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    finca_name: user?.profile?.finca_name || '',
    bio: user?.profile?.bio || '',
  });

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, paddingTop: Platform.OS === 'android' ? 40 : 15, borderBottomWidth: 1, borderBottomColor: theme.border },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: theme.text.primary },
    form: { padding: 20 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: theme.text.secondary, textTransform: 'uppercase', marginBottom: 15, marginTop: 10 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.border, marginBottom: 15, paddingHorizontal: 15 },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, height: 50, fontSize: 16, color: theme.text.primary },
    saveBtn: { backgroundColor: theme.primary, padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 30, shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    saveBtnText: { color: 'white', fontSize: 18, fontWeight: '800' }
  });

  const handleUpdate = async () => {
    if (!formData.first_name || !formData.last_name) {
      Alert.alert('Error', 'Nombre y Apellido son obligatorios.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.patch('/api/profile', formData);

      if (response.data.success) {
        await login(jwtToken!, response.data.data, user.role === 'ADMIN' ? 'Admin' : 'User');
        Alert.alert('¡Éxito!', 'Perfil actualizado correctamente.');
        navigation.goBack();
      }
    } catch (error: unknown) {
      console.error('[UPDATE_PROFILE_ERROR]', error);
      Alert.alert('Error', getApiErrorMessage(error, 'No se pudo actualizar el perfil.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={theme.text.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity onPress={handleUpdate} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color={theme.primary} /> : <Check color={theme.primary} size={28} />}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.form}>
        <Text style={styles.sectionTitle}>Información Personal</Text>
        
        <View style={styles.inputContainer}>
          <User size={20} color={theme.text.muted} style={styles.inputIcon} />
          <TextInput 
            style={styles.input}
            placeholder="Nombres"
            placeholderTextColor={theme.text.muted}
            value={formData.first_name}
            onChangeText={(v) => setFormData({...formData, first_name: v})}
          />
        </View>

        <View style={styles.inputContainer}>
          <User size={20} color={theme.text.muted} style={styles.inputIcon} />
          <TextInput 
            style={styles.input}
            placeholder="Apellidos"
            placeholderTextColor={theme.text.muted}
            value={formData.last_name}
            onChangeText={(v) => setFormData({...formData, last_name: v})}
          />
        </View>

        <View style={styles.inputContainer}>
          <Phone size={20} color={theme.text.muted} style={styles.inputIcon} />
          <TextInput 
            style={styles.input}
            placeholder="Teléfono Celular"
            placeholderTextColor={theme.text.muted}
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(v) => setFormData({...formData, phone: v})}
          />
        </View>

        <Text style={styles.sectionTitle}>Información de la Finca</Text>

        <View style={styles.inputContainer}>
          <MapPin size={20} color={theme.text.muted} style={styles.inputIcon} />
          <TextInput 
            style={styles.input}
            placeholder="Nombre de tu Finca"
            placeholderTextColor={theme.text.muted}
            value={formData.finca_name}
            onChangeText={(v) => setFormData({...formData, finca_name: v})}
          />
        </View>

        <View style={[styles.inputContainer, { alignItems: 'flex-start', height: 120 }]}>
          <AlignLeft size={20} color={theme.text.muted} style={[styles.inputIcon, { marginTop: 15 }]} />
          <TextInput 
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Breve descripción o Bio"
            placeholderTextColor={theme.text.muted}
            multiline
            value={formData.bio}
            onChangeText={(v) => setFormData({...formData, bio: v})}
          />
        </View>

        <TouchableOpacity 
          style={styles.saveBtn} 
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Guardar Cambios</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
