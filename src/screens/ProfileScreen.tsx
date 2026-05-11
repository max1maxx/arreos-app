import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView } from 'react-native';
import { LayoutGrid, PlusCircle, LogOut, Moon, Sun, Smartphone } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAlert } from '../context/AlertContext';

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useContext(AuthContext);
  const { theme, isDarkMode, themePreference, setThemePreference } = useTheme();
  const { showAlert } = useAlert();

  const handleLogout = () => {
    showAlert({
      title: 'Cerrar Sesión',
      message: '¿Estás seguro de que quieres salir de Arreos App?',
      type: 'warning',
      showCancel: true,
      confirmText: 'Sí, salir',
      cancelText: 'Cancelar',
      onConfirm: logout
    });
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scrollContent: { paddingBottom: 40 },
    header: { alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: theme.border, paddingTop: 40 },
    avatarBig: { width: 90, height: 90, borderRadius: 45, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: theme.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 10 },
    avatarInitial: { color: 'white', fontSize: 32, fontWeight: 'bold' },
    name: { fontSize: 22, fontWeight: '800', color: theme.text.primary, textAlign: 'center' },
    role: { fontSize: 13, color: theme.text.secondary, marginTop: 4, textAlign: 'center' },
    editBtn: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: theme.border },
    editBtnText: { fontWeight: '700', color: theme.text.primary, fontSize: 14 },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, backgroundColor: theme.surface },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 18, fontWeight: '800', color: theme.primary },
    statLabel: { fontSize: 11, color: theme.text.secondary, marginTop: 2 },
    menu: { padding: 16 },
    menuItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: theme.border },
    menuLabel: { fontSize: 16, fontWeight: '600' },
    themeSelector: { marginTop: 10, marginBottom: 20, paddingHorizontal: 4 },
    themeTitle: { fontSize: 12, fontWeight: '800', color: theme.text.muted, textTransform: 'uppercase', marginBottom: 12 },
    themeOptions: { flexDirection: 'row', gap: 8 },
    themeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
    themeOptionActive: { borderColor: theme.primary, backgroundColor: isDarkMode ? 'rgba(82, 183, 136, 0.1)' : '#F0F9FF', borderWidth: 1.5 },
    themeOptionText: { fontSize: 12, fontWeight: '700', color: theme.text.secondary },
    themeOptionTextActive: { color: theme.primary }
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarBig}>
            <Text style={styles.avatarInitial}>
              {user?.first_name ? user.first_name[0] : 'U'}
            </Text>
          </View>
          <Text style={styles.name}>
            {user?.first_name || ''} {user?.last_name || ''}
          </Text>
          <Text style={styles.role}>
            {user?.role === 'ADMIN' ? 'Administrador' : 'Productor Ganadero'} • Arreos App
          </Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editBtnText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <StatItem label="Ofertas" value="0" theme={theme} styles={styles} />
          <StatItem label="Seguidores" value="0" theme={theme} styles={styles} />
          <StatItem label="Ventas" value="0" theme={theme} styles={styles} />
        </View>

        <View style={styles.menu}>
          <View style={styles.themeSelector}>
            <Text style={styles.themeTitle}>Apariencia</Text>
            <View style={styles.themeOptions}>
              <TouchableOpacity 
                style={[styles.themeOption, themePreference === 'light' && styles.themeOptionActive]}
                onPress={() => setThemePreference('light')}
              >
                <Sun size={16} color={themePreference === 'light' ? theme.primary : theme.text.muted} />
                <Text style={[styles.themeOptionText, themePreference === 'light' && styles.themeOptionTextActive]}>Claro</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.themeOption, themePreference === 'dark' && styles.themeOptionActive]}
                onPress={() => setThemePreference('dark')}
              >
                <Moon size={16} color={themePreference === 'dark' ? theme.primary : theme.text.muted} />
                <Text style={[styles.themeOptionText, themePreference === 'dark' && styles.themeOptionTextActive]}>Oscuro</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.themeOption, themePreference === 'system' && styles.themeOptionActive]}
                onPress={() => setThemePreference('system')}
              >
                <Smartphone size={16} color={themePreference === 'system' ? theme.primary : theme.text.muted} />
                <Text style={[styles.themeOptionText, themePreference === 'system' && styles.themeOptionTextActive]}>Sistema</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('MyListings')}>
            <MenuItem Icon={LayoutGrid} label="Mis Ofertas" theme={theme} styles={styles} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CreateLivestock')}>
            <MenuItem Icon={PlusCircle} label="Nueva Oferta" theme={theme} styles={styles} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <MenuItem Icon={LogOut} label="Cerrar Sesión" color="#ff4757" theme={theme} styles={styles} />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
