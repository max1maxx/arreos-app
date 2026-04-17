import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { User, LayoutGrid, PlusCircle, Settings, LogOut } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../theme/constants';

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useContext(AuthContext);

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

  return (
    <SafeAreaView style={styles.container}>
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
        <StatItem label="Publicaciones" value="0" />
        <StatItem label="Seguidores" value="0" />
        <StatItem label="Ventas" value="0" />
      </View>

      <View style={styles.menu}>
        <TouchableOpacity onPress={() => navigation.navigate('MyListings')}>
          <MenuItem Icon={LayoutGrid} label="Mis Publicaciones" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('CreateLivestock')}>
          <MenuItem Icon={PlusCircle} label="Nueva Oferta" />
        </TouchableOpacity>
        <MenuItem Icon={Settings} label="Configuración" />
        <TouchableOpacity onPress={handleLogout}>
          <MenuItem Icon={LogOut} label="Cerrar Sesión" color="#ff4757" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const StatItem = ({ label, value }: { label: string, value: string }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MenuItem = ({ Icon, label, color = COLORS.text.primary }: { Icon: any, label: string, color?: string }) => (
  <View style={styles.menuItem}>
    <Icon size={22} color={color} />
    <Text style={[styles.menuLabel, { color }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  avatarBig: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 10 },
  avatarInitial: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: '800', color: COLORS.text.primary },
  role: { fontSize: 14, color: COLORS.text.secondary, marginTop: 4 },
  editBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  editBtnText: { fontWeight: '700', color: COLORS.text.primary },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, backgroundColor: COLORS.surface },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.text.secondary, marginTop: 2 },
  menu: { padding: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuLabel: { fontSize: 16, fontWeight: '600' }
});
