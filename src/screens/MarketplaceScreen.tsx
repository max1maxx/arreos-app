import React, { useState, useEffect, useCallback, useContext } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, SlidersHorizontal, MapPin, Plus, X, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { api, getApiErrorMessage } from '../api/client';
import { mediaUrl } from '../config/api';
import { parseLivestockListResponse } from '../utils/parseLivestockListResponse';
import { getStatusLabel, getStatusColor } from '../utils/statusTranslations';
import { useTheme } from '../context/ThemeContext';
import { useLivestock } from '../context/LivestockContext';
import { AuthContext } from '../context/AuthContext';

const chips = ['Todos', 'Bovino', 'Porcino', 'Equino', 'Ovinos'];

export const MarketplaceScreen = () => {
  const navigation = useNavigation<any>();
  const { theme, isDarkMode } = useTheme();
  const { user } = useContext(AuthContext);
  const { listings, isLoading, refreshListings } = useLivestock();
  
  const [localListings, setLocalListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [onlyMine, setOnlyMine] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    radius: '',
    province: '',
    city: '',
    category: 'Todos'
  });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchInput.trim()), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchFilteredListings = useCallback(async () => {
    // Si no hay búsqueda, ni filtros, ni "Solo mías", usamos el estado global optimizado
    const hasActiveFilters = debouncedQ || filters.category !== 'Todos' || filters.minPrice || filters.maxPrice || filters.province || filters.city || onlyMine;
    
    if (!hasActiveFilters) {
      setLocalListings(listings);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params: any = {};
      if (debouncedQ) params.q = debouncedQ;
      if (filters.category !== 'Todos') params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.province) params.province = filters.province;
      if (filters.city) params.city = filters.city;
      
      // Filtro por "Mis Publicaciones" usando el nuevo parámetro del backend
      if (onlyMine && user?.id) {
        params.sellerId = user.id;
      }

      const response = await api.get('/api/livestock', { params });
      setLocalListings(parseLivestockListResponse(response.data));
    } catch (error) {
      console.error('[MARKETPLACE_FILTER_ERROR]', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedQ, filters, onlyMine, listings, user?.id]);

  useEffect(() => {
    if (listings.length === 0 && !isLoading) {
      refreshListings();
    }
  }, []);

  useEffect(() => {
    fetchFilteredListings();
  }, [fetchFilteredListings, listings]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshListings();
    setRefreshing(false);
  };

  const applyFilters = () => {
    setIsFilterVisible(false);
    fetchFilteredListings();
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      radius: '',
      province: '',
      city: '',
      category: 'Todos'
    });
    setOnlyMine(false);
    setSearchInput('');
    setIsFilterVisible(false);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: theme.background, borderBottomWidth: 1, borderBottomColor: theme.border },
    searchContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 12, paddingHorizontal: 12, height: 48, borderWidth: 1, borderColor: theme.border },
    actionButton: { width: 48, height: 48, backgroundColor: theme.surface, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border },
    actionButtonActive: { backgroundColor: theme.primary, borderColor: theme.primary },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: theme.text.primary },
    
    quickFilters: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, gap: 10 },
    pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
    pillActive: { backgroundColor: isDarkMode ? 'rgba(82, 183, 136, 0.2)' : '#F0F9FF', borderColor: theme.primary },
    pillText: { fontSize: 13, fontWeight: '700', color: theme.text.secondary },
    pillTextActive: { color: theme.primary },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: theme.text.primary },
    modalScroll: { marginBottom: 20 },
    filterLabel: { fontSize: 14, fontWeight: '700', color: theme.text.secondary, marginBottom: 8, marginTop: 16 },
    row: { flexDirection: 'row', alignItems: 'center' },
    input: { backgroundColor: theme.surface, borderRadius: 12, padding: 12, fontSize: 14, color: theme.text.primary, borderWidth: 1, borderColor: theme.border },
    modalChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    modalChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
    modalChipActive: { backgroundColor: theme.primary, borderColor: theme.primary },
    modalChipText: { fontSize: 12, color: theme.text.secondary, fontWeight: '600' },
    modalChipTextActive: { color: 'white' },
    modalFooter: { flexDirection: 'row', gap: 12, paddingBottom: Platform.OS === 'ios' ? 20 : 0 },
    clearButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
    clearButtonText: { color: theme.text.secondary, fontWeight: '800' },
    applyButton: { flex: 2, padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: theme.primary },
    applyButtonText: { color: 'white', fontWeight: '800' },
    
    list: { padding: 10 },
    productCard: { flex: 1, margin: 6, backgroundColor: theme.card, borderRadius: 16, overflow: 'hidden', elevation: 2, borderWidth: 1, borderColor: theme.border },
    imageContainer: { width: '100%', height: 150, position: 'relative' },
    productImage: { width: '100%', height: '100%', backgroundColor: theme.surface },
    statusBadge: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusBadgeText: { color: 'white', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    productInfo: { padding: 12 },
    price: { fontSize: 18, fontWeight: '900', color: theme.primary },
    title: { fontSize: 14, fontWeight: '700', color: theme.text.primary, marginVertical: 4 },
    location: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    locationText: { fontSize: 11, color: theme.text.secondary, flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyText: { color: theme.text.muted, fontSize: 16 },
    fab: { position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  });

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
            <MapPin size={12} color={theme.text.muted} />
            <Text style={styles.locationText} numberOfLines={1}>
              {[item.city, item.province].filter(Boolean).join(', ') || item.seller?.profile?.finca_name || 'Ubicación no disponible'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={theme.text.muted} />
            <TextInput
              placeholder="Buscar ganado, raza..."
              placeholderTextColor={theme.text.muted}
              style={styles.searchInput}
              value={searchInput}
              onChangeText={setSearchInput}
            />
            {searchInput !== '' && (
              <TouchableOpacity onPress={() => setSearchInput('')}>
                <X size={18} color={theme.text.muted} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsFilterVisible(true)}
          >
            <SlidersHorizontal size={22} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtro rápido: Mis Publicaciones */}
      <View style={styles.quickFilters}>
        <TouchableOpacity 
          style={[styles.pill, onlyMine && styles.pillActive]}
          onPress={() => setOnlyMine(!onlyMine)}
        >
          <User size={16} color={onlyMine ? theme.primary : theme.text.secondary} />
          <Text style={[styles.pillText, onlyMine && styles.pillTextActive]}>Mis Ofertas</Text>
          {onlyMine && <X size={14} color={theme.primary} />}
        </TouchableOpacity>
      </View>

      <Modal
        visible={isFilterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros Avanzados</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                <X size={24} color={theme.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.filterLabel}>Categoría</Text>
              <View style={styles.modalChips}>
                {chips.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.modalChip, filters.category === c && styles.modalChipActive]}
                    onPress={() => setFilters({ ...filters, category: c })}
                  >
                    <Text style={[styles.modalChipText, filters.category === c && styles.modalChipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterLabel}>Rango de Precio ($)</Text>
              <View style={styles.row}>
                <TextInput
                  placeholder="Mínimo"
                  placeholderTextColor={theme.text.muted}
                  keyboardType="numeric"
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  value={filters.minPrice}
                  onChangeText={(v) => setFilters({ ...filters, minPrice: v })}
                />
                <TextInput
                  placeholder="Máximo"
                  placeholderTextColor={theme.text.muted}
                  keyboardType="numeric"
                  style={[styles.input, { flex: 1 }]}
                  value={filters.maxPrice}
                  onChangeText={(v) => setFilters({ ...filters, maxPrice: v })}
                />
              </View>

              <Text style={styles.filterLabel}>Provincia</Text>
              <TextInput
                placeholder="Nombre de la provincia"
                placeholderTextColor={theme.text.muted}
                style={styles.input}
                value={filters.province}
                onChangeText={(v) => setFilters({ ...filters, province: v })}
              />

              <Text style={styles.filterLabel}>Ciudad</Text>
              <TextInput
                placeholder="Nombre de la ciudad"
                placeholderTextColor={theme.text.muted}
                style={styles.input}
                value={filters.city}
                onChangeText={(v) => setFilters({ ...filters, city: v })}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {(isLoading || loading) && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={localListings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
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
    </SafeAreaView>
  );
};
