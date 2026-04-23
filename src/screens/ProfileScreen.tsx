import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Switch } from 'react-native';
import { LayoutGrid, PlusCircle, Settings, LogOut, Moon, Sun } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useContext(AuthContext);
  const { theme, isDarkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, salir', style: 'destructive', onPress: logout }
      ]
    );
  };

  const dynamicStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: { alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: theme.border },
    avatarBig: { width: 100, height: 100, borderRadius: 50, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: theme.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 10 },
    avatarInitial: { color: 'white', fontSize: 32, fontWeight: 'bold' },
    name: { fontSize: 24, fontWeight: '800', color: theme.text.primary },
    role: { fontSize: 14, color: theme.text.secondary, marginTop: 4 },
    editBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.border },
    editBtnText: { fontWeight: '700', color: theme.text.primary },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, backgroundColor: theme.surface },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: '800', color: theme.primary },
    statLabel: { fontSize: 12, color: theme.text.secondary, marginTop: 2 },
    menu: { padding: 16 },
    menuItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
    menuLabel: { fontSize: 16, fontWeight: '600' }
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.avatarBig}>
          <Text style={dynamicStyles.avatarInitial}>
            {user?.first_name ? user.first_name[0] : 'U'}
          </Text>
        </View>
        <Text style={dynamicStyles.name}>
          {user?.first_name || ''} {user?.last_name || ''}
        </Text>
        <Text style={dynamicStyles.role}>
          {user?.role === 'ADMIN' ? 'Administrador' : 'Productor Ganadero'} • Arreos App
        </Text>
        <TouchableOpacity
          style={dynamicStyles.editBtn}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={dynamicStyles.editBtnText}>Editar Perfil</Text>
        </TouchableOpacity>
      </View>

      <View style={dynamicStyles.statsContainer}>
        <StatItem label="Publicaciones" value="0" theme={theme} styles={dynamicStyles} />
        <StatItem label="Seguidores" value="0" theme={theme} styles={dynamicStyles} />
        <StatItem label="Ventas" value="0" theme={theme} styles={dynamicStyles} />
      </View>

      <View style={dynamicStyles.menu}>
        <View style={[dynamicStyles.menuItem, { justifyContent: 'space-between' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            {isDarkMode ? <Moon size={22} color={theme.text.primary} /> : <Sun size={22} color={theme.text.primary} />}
            <Text style={[dynamicStyles.menuLabel, { color: theme.text.primary }]}>Modo Oscuro</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: theme.primary }}
            thumbColor={isDarkMode ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('MyListings')}>
          <MenuItem Icon={LayoutGrid} label="Mis Publicaciones" theme={theme} styles={dynamicStyles} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('CreateLivestock')}>
          <MenuItem Icon={PlusCircle} label="Nueva Oferta" theme={theme} styles={dynamicStyles} />
        </TouchableOpacity>
        {/* <MenuItem Icon={Settings} label="Configuración" theme={theme} styles={dynamicStyles} /> */}
        <TouchableOpacity onPress={handleLogout}>
          <MenuItem Icon={LogOut} label="Cerrar Sesión" color="#ff4757" theme={theme} styles={dynamicStyles} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const StatItem = ({ label, value, theme, styles }: { label: string, value: string, theme: any, styles: any }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MenuItem = ({ Icon, label, color, theme, styles }: { Icon: any, label: string, color?: string, theme: any, styles: any }) => (
  <View style={styles.menuItem}>
    <Icon size={22} color={color || theme.text.primary} />
    <Text style={[styles.menuLabel, { color: color || theme.text.primary }]}>{label}</Text>
  </View>
);
