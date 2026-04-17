import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  RefreshControl,
  Platform,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Search, SlidersHorizontal, MapPin, Plus, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { api, getApiErrorMessage } from '../api/client';
import { mediaUrl } from '../config/api';
import { COLORS } from '../theme/constants';
import { parseLivestockListResponse } from '../utils/parseLivestockListResponse';
import { getStatusLabel, getStatusColor } from '../utils/statusTranslations';

const chips = ['Todos', 'Bovino', 'Porcino', 'Equino', 'Ovinos'];

export const MarketplaceScreen = () => {
  const navigation = useNavigation<any>();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeChip, setActiveChip] = useState('Todos');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');

  // Debounce para búsqueda
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchInput.trim()), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (debouncedQ) params.q = debouncedQ;
      if (activeChip !== 'Todos') params.category = activeChip;

      const response = await api.get('/api/livestock', { params });
      const data = parseLivestockListResponse(response.data);
      setListings(data);
    } catch (error) {
      console.error('[MARKETPLACE_FETCH_ERROR]', error);
      Alert.alert('Error', getApiErrorMessage(error, 'No se pudieron cargar las ofertas.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedQ, activeChip]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  const renderItem = ({ item }: { item: any }) => {
    const mainImage = item.images_url?.length > 0 ? mediaUrl(item.images_url[0]) : 'https://via.placeholder.com/400';
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('LivestockDetail', { item })}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: mainImage }} style={styles.productImage} />
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusBadgeText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.price}>${item.total_price?.toLocaleString()}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {item.category} - {item.breed || 'Cruza'}
          </Text>
          <View style={styles.location}>
            <MapPin size={12} color={COLORS.text.muted} />
            <Text style={styles.locationText} numberOfLines={1}>
              {[item.city, item.province].filter(Boolean).join(', ') || item.seller?.profile?.finca_name || 'Ubicación no disponible'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Search size={20} color={COLORS.text.muted} />
          <TextInput
            placeholder="Buscar ganado, raza..."
            style={styles.searchInput}
            value={searchInput}
            onChangeText={setSearchInput}
          />
        </View>
      </View>

      <View style={styles.chipScrollContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {chips.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, activeChip === c && styles.chipActive]}
              onPress={() => setActiveChip(c)}
            >
              <Text style={[styles.chipText, activeChip === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={listings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No se encontraron publicaciones.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateLivestock')}
      >
        <Plus color="white" size={28} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 12, height: 45 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: '#1E293B' },
  chipScrollContainer: { backgroundColor: 'white', paddingVertical: 8 },
  chips: { paddingHorizontal: 16, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: '#64748B', fontWeight: '600' },
  chipTextActive: { color: 'white' },
  list: { padding: 10 },
  productCard: { flex: 1, margin: 6, backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', elevation: 2, borderWidth: 1, borderColor: '#E2E8F0' },
  imageContainer: { width: '100%', height: 150, position: 'relative' },
  productImage: { width: '100%', height: '100%', backgroundColor: '#F1F5F9' },
  statusBadge: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusBadgeText: { color: 'white', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  productInfo: { padding: 12 },
  price: { fontSize: 18, fontWeight: '900', color: COLORS.primary },
  title: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginVertical: 4 },
  location: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 11, color: '#64748B', flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#94A3B8', fontSize: 16 },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 5 },
});
