import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert 
} from 'react-native';
import { Mail, Lock, LogIn } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const LoginScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      // Simulación de login o llamada real a la API
      // En una app real aquí iría la llamada al backend
      // await login(token, userData, role);
    } catch (error) {
      Alert.alert('Error', 'Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { flex: 1, padding: 30, justifyContent: 'center' },
    title: { fontSize: 32, fontWeight: '900', color: theme.text.primary, marginBottom: 10 },
    subtitle: { fontSize: 16, color: theme.text.secondary, marginBottom: 40 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', color: theme.text.secondary, marginBottom: 8, marginLeft: 4 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 16, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 15 },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, height: 55, fontSize: 16, color: theme.text.primary },
    loginBtn: { backgroundColor: theme.primary, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: theme.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
    loginBtnText: { color: 'white', fontSize: 18, fontWeight: '800' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
    footerText: { color: theme.text.secondary, fontSize: 15 },
    link: { color: theme.primary, fontWeight: '800', fontSize: 15 }
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar en Arreos</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color={theme.text.muted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="ejemplo@correo.com"
                placeholderTextColor={theme.text.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color={theme.text.muted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="********"
                placeholderTextColor={theme.text.muted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={styles.loginBtnText}>Ingresar</Text>
                <LogIn size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
