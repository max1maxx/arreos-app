import React, { useState, useContext, useMemo } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  ScrollView, SafeAreaView, ActivityIndicator, Platform, KeyboardAvoidingView 
} from 'react-native';
import { User, Phone, MapPin, AlignLeft, Check, ChevronLeft, Lock, ShieldCheck, ShieldAlert, Shield } from 'lucide-react-native';
import { api, getApiErrorMessage } from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAlert } from '../context/AlertContext';

export const EditProfileScreen = ({ navigation }: any) => {
  const { user, jwtToken, login } = useContext(AuthContext);
  const { theme, isDarkMode } = useTheme();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    finca_name: user?.profile?.finca_name || '',
    bio: user?.profile?.bio || '',
    password: '',
    confirmPassword: '',
  });

  // Lógica del Medidor de Fuerza de Contraseña
  const passwordStrength = useMemo(() => {
    const pass = formData.password;
    if (!pass) return { score: 0, label: '', color: theme.text.muted };
    
    let score = 0;
    if (pass.length > 6) score++;
    if (pass.length > 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;

    switch (score) {
      case 1: return { score: 25, label: 'Muy Débil', color: '#EF4444' };
      case 2: return { score: 50, label: 'Débil', color: '#F59E0B' };
      case 3: return { score: 75, label: 'Segura', color: '#10B981' };
      case 4: return { score: 100, label: 'Muy Segura', color: '#059669' };
      default: return { score: 0, label: 'Insegura', color: '#EF4444' };
    }
  }, [formData.password, theme]);

  const handleUpdate = async () => {
    if (!formData.first_name || !formData.last_name) {
      showAlert({ title: 'Campos faltantes', message: 'Nombre y Apellido son obligatorios.', type: 'warning' });
      return;
    }

    if (formData.password && formData.password.length < 8) {
      showAlert({ title: 'Contraseña débil', message: 'La nueva contraseña debe tener al menos 8 caracteres.', type: 'warning' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showAlert({ title: 'Error', message: 'Las contraseñas no coinciden.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      // Solo enviamos el password si el usuario escribió algo
      const payload: any = { ...formData };
      if (!formData.password) {
        delete payload.password;
        delete payload.confirmPassword;
      }

      const response = await api.patch('/api/profile', payload);
      if (response.data.success) {
        await login(jwtToken!, response.data.data, user.role === 'ADMIN' ? 'Admin' : 'User');
        showAlert({
          title: '¡Éxito!',
          message: 'Tu perfil ha sido actualizado correctamente.',
          type: 'success',
          onConfirm: () => navigation.goBack()
        });
      }
    } catch (error: unknown) {
      showAlert({ title: 'Error', message: getApiErrorMessage(error, 'No se pudo actualizar el perfil.'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, paddingTop: Platform.OS === 'android' ? 40 : 15, borderBottomWidth: 1, borderBottomColor: theme.border },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: theme.text.primary },
    form: { padding: 20 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: theme.text.secondary, textTransform: 'uppercase', marginBottom: 15, marginTop: 25 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 12, borderWidth: 1, borderColor: theme.border, marginBottom: 15, paddingHorizontal: 15 },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, height: 50, fontSize: 16, color: theme.text.primary },
    strengthMeter: { height: 4, width: '100%', backgroundColor: theme.border, borderRadius: 2, marginBottom: 5, overflow: 'hidden' },
    strengthBar: { height: '100%', borderRadius: 2 },
    strengthText: { fontSize: 12, fontWeight: '700', marginBottom: 15, textAlign: 'right' },
    saveBtn: { backgroundColor: theme.primary, padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 30, shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    saveBtnText: { color: 'white', fontSize: 18, fontWeight: '800' }
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color={theme.text.primary} size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <TouchableOpacity onPress={handleUpdate} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color={theme.primary} /> : <Check color={theme.primary} size={28} />}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.form} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Información Personal</Text>
          <View style={styles.inputContainer}>
            <User size={20} color={theme.text.muted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Nombres" placeholderTextColor={theme.text.muted} value={formData.first_name} onChangeText={(v) => setFormData({...formData, first_name: v})} />
          </View>
          <View style={styles.inputContainer}>
            <User size={20} color={theme.text.muted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Apellidos" placeholderTextColor={theme.text.muted} value={formData.last_name} onChangeText={(v) => setFormData({...formData, last_name: v})} />
          </View>
          <View style={styles.inputContainer}>
            <Phone size={20} color={theme.text.muted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Teléfono Celular" placeholderTextColor={theme.text.muted} keyboardType="phone-pad" value={formData.phone} onChangeText={(v) => setFormData({...formData, phone: v})} />
          </View>

          <Text style={styles.sectionTitle}>Información de la Finca</Text>
          <View style={styles.inputContainer}>
            <MapPin size={20} color={theme.text.muted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Nombre de tu Finca" placeholderTextColor={theme.text.muted} value={formData.finca_name} onChangeText={(v) => setFormData({...formData, finca_name: v})} />
          </View>
          <View style={[styles.inputContainer, { alignItems: 'flex-start', height: 100 }]}>
            <AlignLeft size={20} color={theme.text.muted} style={[styles.inputIcon, { marginTop: 15 }]} />
            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Breve descripción o Bio" placeholderTextColor={theme.text.muted} multiline value={formData.bio} onChangeText={(v) => setFormData({...formData, bio: v})} />
          </View>

          <Text style={styles.sectionTitle}>Seguridad (Cambiar Contraseña)</Text>
          <View style={styles.inputContainer}>
            <Lock size={20} color={theme.text.muted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Nueva Contraseña" placeholderTextColor={theme.text.muted} secureTextEntry value={formData.password} onChangeText={(v) => setFormData({...formData, password: v})} />
          </View>
          
          {formData.password.length > 0 && (
            <View style={{ paddingHorizontal: 5 }}>
              <View style={styles.strengthMeter}>
                <View style={[styles.strengthBar, { width: `${passwordStrength.score}%`, backgroundColor: passwordStrength.color }]} />
              </View>
              <Text style={[styles.strengthText, { color: passwordStrength.color }]}>{passwordStrength.label}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Lock size={20} color={theme.text.muted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Confirmar Nueva Contraseña" placeholderTextColor={theme.text.muted} secureTextEntry value={formData.confirmPassword} onChangeText={(v) => setFormData({...formData, confirmPassword: v})} />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Guardar Cambios</Text>}
          </TouchableOpacity>
          <View style={{ height: 80 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
