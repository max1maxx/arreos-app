import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, ShoppingBag, PlayCircle, User } from 'lucide-react-native';
import { FeedScreen } from '../screens/FeedScreen';
import { MarketplaceScreen } from '../screens/MarketplaceScreen';
import { VideoReelScreen } from '../screens/ShortsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { COLORS } from '../theme/constants';

const Tab = createBottomTabNavigator();

export const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: 90,
          paddingBottom: 30,
          paddingTop: 10,
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text.muted,
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#F1F5F9',
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 20,
          color: COLORS.text.primary,
        }
      }}
    >
      <Tab.Screen 
        name="Comunidad" 
        component={FeedScreen} 
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
