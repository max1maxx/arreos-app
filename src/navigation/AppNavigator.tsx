import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import { AuthContext } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import UserDashboardScreen from '../screens/UserDashboardScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { jwtToken, role, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f9' }}>
        <ActivityIndicator size="large" color="#0984e3" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {jwtToken == null ? (
          // El usuario no ha iniciado sesión
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : role === 'Admin' ? (
          // El usuario es un Administrador
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        ) : (
          // El usuario es un Usuario Normal
          <Stack.Screen name="UserDashboard" component={UserDashboardScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
