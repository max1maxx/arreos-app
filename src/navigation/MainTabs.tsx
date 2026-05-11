import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, ShoppingBag, PlayCircle, User } from 'lucide-react-native';
import { CommunityScreen } from '../screens/CommunityScreen';
import { MarketplaceScreen } from '../screens/MarketplaceScreen';
import { VideoReelScreen } from '../screens/ShortsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

export const MainTabs = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: 90,
          paddingBottom: 30,
          paddingTop: 10,
          backgroundColor: theme.background,
          borderTopWidth: 1,
          borderTopColor: theme.border,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.text.muted,
        headerStyle: {
          backgroundColor: theme.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 20,
          color: theme.text.primary,
        }
      }}
    >
      <Tab.Screen 
        name="Comunidad" 
        component={CommunityScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Mercado" 
        component={MarketplaceScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Shorts" 
        component={VideoReelScreen} 
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <PlayCircle color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};
