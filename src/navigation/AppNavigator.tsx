import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import { AuthContext } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { CreateLivestockScreen } from '../screens/CreateLivestockScreen';
import { EditLivestockScreen } from '../screens/EditLivestockScreen';
import { MyListingsScreen } from '../screens/MyListingsScreen';
import { LivestockDetailScreen } from '../screens/LivestockDetailScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { MainTabs } from './MainTabs';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { jwtToken, isLoading } = useContext(AuthContext);

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
          // STACK DE AUTENTICACIÓN
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // STACK DE LA APP PROTEGIDA
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="MyListings" component={MyListingsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="LivestockDetail" component={LivestockDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen 
              name="CreateLivestock" 
              component={CreateLivestockScreen} 
              options={{ 
                headerShown: true, 
                title: 'Publicar Ganado',
                headerStyle: { backgroundColor: 'white' },
                headerTintColor: '#000',
              }} 
            />
            <Stack.Screen
              name="EditLivestock"
              component={EditLivestockScreen}
              options={{
                headerShown: true,
                title: 'Editar publicación',
                headerStyle: { backgroundColor: 'white' },
                headerTintColor: '#000',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
