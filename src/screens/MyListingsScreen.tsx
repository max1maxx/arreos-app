import React, { useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Trash2, Edit3, ChevronLeft } from 'lucide-react-native';
import { api, getApiErrorMessage } from '../api/client';
import { mediaUrl } from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../theme/constants';
import { getStatusLabel, getStatusColor } from '../utils/statusTranslations';
import { parseLivestockListResponse } from '../utils/parseLivestockListResponse';

export const MyListingsScreen = ({ navigation }: any) => {
  const { user } = useContext(AuthContext);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyListings = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await api.get(`/api/livestock/user/${user.id}`);
      setListings(parseLivestockListResponse(response.data));
    } catch (error) {
      console.error('[FETCH_MY_LISTINGS_ERROR]', error);
      Alert.alert('Error', getApiErrorMessage(error, 'No se pudieron cargar tus publicaciones.'));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchMyListings();
    }, [fetchMyListings])
  );

  const handleDelete = (id: string) => {
    Alert.alert(
      'Eliminar Publicación',
      '¿Estás seguro? Esta acción borrará permanentemente la oferta y todas sus fotos del servidor.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sí, Eliminar', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await api.delete(`/api/livestock/${id}`);
              setListings(listings.filter(l => l.id !== id));
              Alert.alert('¡Hecho!', 'Publicación eliminada correctamente.');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la publicación.');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const mainImage =
      item.images_url && item.images_url.length > 0
        ? mediaUrl(item.images_url[0])
        : 'https://via.placeholder.com/300?text=Sin+Foto';

    return (
      <View style={styles.card}>
        <Image source={{ uri: mainImage }} style={styles.image} />
        <View style={styles.info}>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusPillText}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.breed}>{item.breed || 'Sin raza especificada'}</Text>
          <Text style={styles.price}>${item.total_price?.toLocaleString()}</Text>
          
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.editBtn]}
              onPress={() => navigation.navigate('EditLivestock', { item })}
            >
              <Edit3 size={18} color={COLORS.primary} />
              <Text style={styles.editText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.deleteBtn]} 
              onPress={() => handleDelete(item.id)}
            >
              <Trash2 size={18} color="#ff4757" />
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
          <ChevronLeft color={COLORS.text.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Publicaciones</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={listings}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aún no has realizado ninguna publicación para la venta.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 20, fontWeight: '800', marginLeft: 15, color: COLORS.text.primary },
  card: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, elevation: 2 },
  image: { width: 120, height: 120, backgroundColor: '#eee' },
  info: { flex: 1, padding: 12, justifyContent: 'space-between' },
  statusPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 6 },
  statusPillText: { fontSize: 11, fontWeight: '800', color: 'white' },
  category: { fontSize: 12, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase' },
  breed: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary },
  price: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, gap: 6 },
  editBtn: { backgroundColor: '#f0f7ff', flex: 1, justifyContent: 'center' },
  deleteBtn: { backgroundColor: '#fff5f5' },
  editText: { color: COLORS.primary, fontWeight: '700' },
  empty: { marginTop: 100, alignItems: 'center' },
  emptyText: { textAlign: 'center', color: COLORS.text.muted, fontSize: 16 }
});
