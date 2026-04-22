import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import { User, Mail, Lock, Phone, Briefcase, Truck, Home, ChevronLeft, CheckCircle2 } from 'lucide-react-native';
import { COLORS } from '../theme/constants';
import { api, getApiErrorMessage } from '../api/client';

export default function RegisterScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'PRODUCER' | 'DRIVER'>('PRODUCER');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    finca_name: '',
    license_type: '',
    vehicle_capacity: '',
  });

  const handleRegister = async () => {
    // Validaciones básicas
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios.');
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    if (role === 'PRODUCER' && !formData.finca_name) {
      Alert.alert('Error', 'El nombre de la finca es obligatorio para productores.');
      return;
    }

    if (role === 'DRIVER' && (!formData.license_type || !formData.vehicle_capacity)) {
      Alert.alert('Error', 'Licencia y capacidad son obligatorias para transportistas.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        role,
        vehicle_capacity: formData.vehicle_capacity ? parseInt(formData.vehicle_capacity) : undefined
      };

      const response = await api.post('/api/auth/register', payload);

      if (response.status === 201) {
        Alert.alert(
          '¡Registro Exitoso!', 
          'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (error: any) {
      console.error('[REGISTER_ERROR]', error);
      Alert.alert('Error de Registro', getApiErrorMessage(error, 'No se pudo completar el registro.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color={COLORS.text.primary} size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear Cuenta</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>¿Cuál es tu rol?</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[styles.roleCard, role === 'PRODUCER' && styles.roleCardActive]} 
              onPress={() => setRole('PRODUCER')}
            >
              <Briefcase color={role === 'PRODUCER' ? COLORS.primary : COLORS.text.muted} size={32} />
              <Text style={[styles.roleText, role === 'PRODUCER' && styles.roleTextActive]}>Productor</Text>
              {role === 'PRODUCER' && <CheckCircle2 size={18} color={COLORS.primary} style={styles.checkIcon} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.roleCard, role === 'DRIVER' && styles.roleCardActive]} 
              onPress={() => setRole('DRIVER')}
            >
              <Truck color={role === 'DRIVER' ? COLORS.primary : COLORS.text.muted} size={32} />
              <Text style={[styles.roleText, role === 'DRIVER' && styles.roleTextActive]}>Transportista</Text>
              {role === 'DRIVER' && <CheckCircle2 size={18} color={COLORS.primary} style={styles.checkIcon} />}
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
              <User size={20} color={COLORS.text.muted} />
              <TextInput 
                style={styles.input} 
                placeholder="Nombre" 
                value={formData.first_name}
                onChangeText={(v) => setFormData({...formData, first_name: v})}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <TextInput 
                style={styles.input} 
                placeholder="Apellido" 
                value={formData.last_name}
                onChangeText={(v) => setFormData({...formData, last_name: v})}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color={COLORS.text.muted} />
            <TextInput 
              style={styles.input} 
              placeholder="Correo electrónico" 
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(v) => setFormData({...formData, email: v})}
            />
          </View>

          <View style={styles.inputContainer}>
            <Phone size={20} color={COLORS.text.muted} />
            <TextInput 
              style={styles.input} 
              placeholder="Teléfono Celular" 
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(v) => setFormData({...formData, phone: v})}
            />
          </View>

          {role === 'PRODUCER' ? (
            <>
              <Text style={styles.sectionTitle}>Datos de Producción</Text>
              <View style={styles.inputContainer}>
                <Home size={20} color={COLORS.text.muted} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Nombre de la Finca" 
                  value={formData.finca_name}
                  onChangeText={(v) => setFormData({...formData, finca_name: v})}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Datos del Vehículo</Text>
              <View style={styles.inputContainer}>
                <Briefcase size={20} color={COLORS.text.muted} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Tipo de Licencia" 
                  value={formData.license_type}
                  onChangeText={(v) => setFormData({...formData, license_type: v})}
                />
              </View>
              <View style={styles.inputContainer}>
                <Truck size={20} color={COLORS.text.muted} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Capacidad de Carga (cabezas)" 
                  keyboardType="numeric"
                  value={formData.vehicle_capacity}
                  onChangeText={(v) => setFormData({...formData, vehicle_capacity: v})}
                />
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>Seguridad</Text>
          <View style={styles.inputContainer}>
            <Lock size={20} color={COLORS.text.muted} />
            <TextInput 
              style={styles.input} 
              placeholder="Contraseña (mín. 8 caracteres)" 
              secureTextEntry
              value={formData.password}
              onChangeText={(v) => setFormData({...formData, password: v})}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={COLORS.text.muted} />
            <TextInput 
              style={styles.input} 
              placeholder="Confirmar Contraseña" 
              secureTextEntry
              value={formData.confirmPassword}
              onChangeText={(v) => setFormData({...formData, confirmPassword: v})}
            />
          </View>

          <TouchableOpacity 
            style={[styles.registerBtn, loading && { opacity: 0.7 }]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.registerBtnText}>Registrarse</Text>}
          </TouchableOpacity>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// Necesitamos importar SafeAreaView de react-native-safe-area-context
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary },
  backBtn: { padding: 5 },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text.muted, textTransform: 'uppercase', marginBottom: 15, marginTop: 20 },
  roleContainer: { flexDirection: 'row', gap: 15 },
  roleCard: { flex: 1, backgroundColor: '#F8FAFC', padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', position: 'relative' },
  roleCardActive: { borderColor: COLORS.primary, backgroundColor: '#F0F9FF', borderWidth: 2 },
  roleText: { marginTop: 10, fontWeight: '700', color: COLORS.text.muted },
  roleTextActive: { color: COLORS.primary },
  checkIcon: { position: 'absolute', top: 10, right: 10 },
  row: { flexDirection: 'row' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 15, paddingHorizontal: 15, height: 55 },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: COLORS.text.primary },
  registerBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 20, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  registerBtnText: { color: 'white', fontSize: 18, fontWeight: '800' }
});
