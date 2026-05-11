import React, { useState, useContext, useCallback, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Trash2, Edit3, ChevronLeft } from 'lucide-react-native';
import { mediaUrl } from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLivestock } from '../context/LivestockContext';
import { useAlert } from '../context/AlertContext';
import { getStatusLabel, getStatusColor } from '../utils/statusTranslations';

export const MyListingsScreen = ({ navigation }: any) => {
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();
  const { showAlert } = useAlert();
  const { myListings, refreshMyListings, deleteListing } = useLivestock();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id && myListings.length === 0) {
      setLoading(true);
      refreshMyListings(user.id).finally(() => setLoading(false));
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) refreshMyListings(user.id);
    }, [user?.id])
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: theme.background, borderBottomWidth: 1, borderBottomColor: theme.border },
    headerTitle: { fontSize: 20, fontWeight: '800', marginLeft: 15, color: theme.text.primary },
    card: { flexDirection: 'row', backgroundColor: theme.card, borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, elevation: 2 },
    image: { width: 120, height: 120, backgroundColor: theme.surface },
    info: { flex: 1, padding: 12, justifyContent: 'space-between' },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
    statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusPillText: { fontSize: 10, fontWeight: '800', color: 'white' },
    category: { fontSize: 12, fontWeight: '700', color: theme.primary, textTransform: 'uppercase' },
    breed: { fontSize: 16, fontWeight: '700', color: theme.text.primary, marginBottom: 4 },
    price: { fontSize: 18, fontWeight: '800', color: theme.primary },
    actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, gap: 8, justifyContent: 'center' },
    editBtn: { backgroundColor: theme.primary, flex: 1 },
    deleteBtn: { backgroundColor: theme.error, width: 44, paddingHorizontal: 0 },
    editText: { color: 'white', fontWeight: '800', fontSize: 14 },
    empty: { marginTop: 100, alignItems: 'center', paddingHorizontal: 40 },
    emptyText: { textAlign: 'center', color: theme.text.muted, fontSize: 16 }
  });

  const handleDelete = (id: string) => {
    showAlert({
      title: 'Eliminar Oferta',
      message: '¿Estás seguro? Esta acción borrará permanentemente la oferta y todas sus fotos.',
      type: 'warning',
      showCancel: true,
      confirmText: 'Sí, Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await deleteListing(id);
          showAlert({
            title: '¡Hecho!',
            message: 'Oferta eliminada correctamente.',
            type: 'success'
          });
        } catch (error) {
          showAlert({
            title: 'Error',
            message: 'No se pudo eliminar la oferta.',
            type: 'error'
          });
        }
      }
    });
  };

  const renderItem = ({ item }: { item: any }) => {
    const mainImage = item.images_url && item.images_url.length > 0 ? mediaUrl(item.images_url[0]) : 'https://via.placeholder.com/300?text=Sin+Foto';

    return (
      <View style={styles.card}>
        <Image source={{ uri: mainImage }} style={styles.image} />
        <View style={styles.info}>
          <View style={styles.statusRow}>
            <Text style={styles.category}>{item.category}</Text>
            <View style={[styles.statusPill, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusPillText}>{getStatusLabel(item.status)}</Text>
            </View>
          </View>
          
          <Text style={styles.breed} numberOfLines={1}>{item.breed || 'Sin raza especificada'}</Text>
          <Text style={styles.price}>${item.total_price?.toLocaleString()}</Text>
          
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => navigation.navigate('EditLivestock', { item })}>
              <Edit3 size={18} color="white" />
              <Text style={styles.editText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item.id)}>
              <Trash2 size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color={theme.text.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Ofertas</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={myListings}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aún no has realizado ninguna oferta para la venta.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

