import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { api, getApiErrorMessage } from '../api/client';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa tu correo y contraseña');
      return;
    }
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', {
        email: email.trim(),
        password,
      });

      const { token, data } = response.data;
      
      // Mapeo de roles del backend (ADMIN/PRODUCER) a los de la App (Admin/User)
      const appRole = data.role === 'ADMIN' ? 'Admin' : 'User';

      await login(token, data, appRole);
      
    } catch (error: unknown) {
      console.error('[LOGIN_ERROR]', error);
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      const message =
        err.response?.status === 401 || err.response?.status === 400
          ? err.response?.data?.message || 'Correo o contraseña incorrectos.'
          : getApiErrorMessage(error, 'No se pudo conectar con el servidor.');

      Alert.alert('Error de Inicio de Sesión', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Arreos</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Ingresar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>¿No tienes cuenta? <Text style={styles.linkTextBold}>Regístrate aquí</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0984e3',
    marginBottom: 5,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 15,
    color: '#636e72',
    marginBottom: 30,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#f1f2f6',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#2d3436',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#0984e3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#0984e3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    textAlign: 'center',
    color: '#636e72',
    marginTop: 25,
    fontSize: 14,
  },
  linkTextBold: {
    fontWeight: 'bold',
    color: '#0984e3',
  }
});
