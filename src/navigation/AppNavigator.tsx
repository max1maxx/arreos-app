import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { MainTabs } from './MainTabs';
import { MyListingsScreen } from '../screens/MyListingsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { LivestockDetailScreen } from '../screens/LivestockDetailScreen';
import { CreateLivestockScreen } from '../screens/CreateLivestockScreen';
import { EditLivestockScreen } from '../screens/EditLivestockScreen';
import { CreatePostScreen } from '../screens/CreatePostScreen';
import { PostDetailScreen } from '../screens/PostDetailScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          // STACK DE AUTENTICACIÓN
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        ) : (
          // STACK DE LA APP PROTEGIDA
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="MyListings" component={MyListingsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="LivestockDetail" component={LivestockDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CreateLivestock" component={CreateLivestockScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EditLivestock" component={EditLivestockScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
