import React, { useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  SafeAreaView,
} from 'react-native';
import * as Location from 'expo-location';
import { FileText, Check, ChevronDown, MapPin, ChevronLeft } from 'lucide-react-native';
import { api, getApiErrorMessage } from '../api/client';
import { mediaUrl } from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLivestock } from '../context/LivestockContext';
import { useAlert } from '../context/AlertContext';
import {
  LIVESTOCK_STATUS_OPTIONS,
  type LivestockStatusApi,
} from '../utils/livestockStatus';

const LIVESTOCK_CATEGORIES = ['Bovino', 'Porcino', 'Equino', 'Ovinos'] as const;
type LivestockCategory = (typeof LIVESTOCK_CATEGORIES)[number];

function normalizeCategory(raw: string | undefined): LivestockCategory {
  if (!raw) return 'Bovino';
  const u = raw.trim();
  return (LIVESTOCK_CATEGORIES as readonly string[]).includes(u) ? (u as LivestockCategory) : 'Bovino';
}

function normalizeListingStatus(raw: string | undefined): LivestockStatusApi {
  const u = String(raw ?? 'AVAILABLE').toUpperCase();
  return LIVESTOCK_STATUS_OPTIONS.some((o) => o.value === u) ? (u as LivestockStatusApi) : 'AVAILABLE';
}

export const EditLivestockScreen = ({ route, navigation }: any) => {
  const { user } = useContext(AuthContext);
  const { item } = route.params as { item: any };
  const { theme, isDarkMode } = useTheme();
  const { updateListingInState } = useLivestock();
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [listingStatus, setListingStatus] = useState<LivestockStatusApi>(() =>
    normalizeListingStatus(item?.status)
  );
  const [formData, setFormData] = useState({
    category: normalizeCategory(item?.category),
    breed: item?.breed ?? '',
    weight: item?.weight != null ? String(item.weight) : '',
    quantity: item?.quantity != null ? String(item.quantity) : '1',
    price_per_lb: item?.price_per_lb != null ? String(item.price_per_lb) : '',
    description: item?.description ?? '',
  });

  const [listingLat, setListingLat] = useState<number | null>(item?.listingLatitude ?? null);
  const [listingLng, setListingLng] = useState<number | null>(item?.listingLongitude ?? null);
  const [locProvince, setLocProvince] = useState(item?.province ?? '');
  const [locCity, setLocCity] = useState(item?.city ?? '');
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const loadPublicationLocation = useCallback(async () => {
    setLocLoading(true);
    setLocError(null);
    try {
      if (Platform.OS === 'web') {
        setLocLoading(false);
        setLocError('En el navegador edita provincia y ciudad manualmente.');
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocError('Permiso de ubicación denegado.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = pos.coords;
      setListingLat(latitude);
      setListingLng(longitude);
      const places = await Location.reverseGeocodeAsync({ latitude, longitude });
      const g = places[0];
      if (g) {
        setLocCity(g.city || g.district || g.subregion || '');
        setLocProvince(g.region || g.subregion || '');
      }
    } catch {
      setLocError('No se pudo obtener la ubicación.');
    } finally {
      setLocLoading(false);
    }
  }, []);

  const handleSave = async () => {
    if (!formData.breed || !formData.weight || !formData.price_per_lb) {
      showAlert({
        title: 'Faltan datos',
        message: 'Completa raza, peso y precio por libra.',
        type: 'warning'
      });
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        sellerId: user?.id,
        category: formData.category,
        breed: formData.breed,
        weight: parseFloat(formData.weight),
        quantity: parseInt(formData.quantity, 10),
        price_per_lb: parseFloat(formData.price_per_lb),
        description: formData.description,
        province: locProvince.trim(),
        city: locCity.trim(),
        status: listingStatus
      };
      if (listingLat != null && listingLng != null) {
        payload.listingLatitude = listingLat;
        payload.listingLongitude = listingLng;
      }

      const res = await api.patch(`/api/livestock/${item.id}`, payload);
      if (res.data?.success) {
        // ACTUALIZACIÓN EN TIEMPO REAL: Actualizar el estado global
        updateListingInState(res.data.data);
        showAlert({
          title: '¡Listo!',
          message: 'Publicación actualizada correctamente.',
          type: 'success',
          onConfirm: () => navigation.goBack()
        });
      }
    } catch (e: any) {
      showAlert({
        title: 'Error',
        message: getApiErrorMessage(e, 'No se pudo guardar.'),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, paddingTop: Platform.OS === 'android' ? 40 : 15, borderBottomWidth: 1, borderBottomColor: theme.border },
    headerTitle: { fontSize: 18, fontWeight: '800', color: theme.text.primary, marginLeft: 15 },
    content: { padding: 20 },
    section: { marginBottom: 8 },
    statusHint: { fontSize: 12, color: theme.text.secondary, marginBottom: 8, lineHeight: 17 },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 12, color: theme.text.primary },
    label: { fontSize: 14, fontWeight: '600', color: theme.text.secondary, marginBottom: 8 },
    input: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 12, fontSize: 16, color: theme.text.primary, marginBottom: 14 },
    selectTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 14, marginBottom: 14 },
    selectTriggerText: { fontSize: 16, color: theme.text.primary, fontWeight: '600' },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    imageScroll: { marginBottom: 16 },
    thumb: { width: 100, height: 100, borderRadius: 12, marginRight: 10, backgroundColor: theme.surface },
    noPhotos: { width: 120, height: 100, borderRadius: 12, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center', gap: 6 },
    noPhotosText: { fontSize: 12, color: theme.text.muted },
    locHint: { fontSize: 13, color: theme.text.secondary, marginBottom: 10 },
    locLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    locMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    locMeta: { fontSize: 13, color: theme.text.secondary },
    locError: { fontSize: 13, color: theme.error, marginBottom: 8 },
    secondaryBtn: { alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.primary, marginBottom: 14 },
    secondaryBtnText: { color: theme.primary, fontWeight: '700', fontSize: 14 },
    submitBtn: { backgroundColor: theme.primary, padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 20, marginBottom: 40 },
    submitText: { color: 'white', fontSize: 17, fontWeight: '800' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    modalDismissArea: { flex: 1 },
    modalSheet: { backgroundColor: theme.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 24 },
    modalTitle: { fontSize: 16, fontWeight: '800', color: theme.text.primary, marginBottom: 12 },
    modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
    modalOptionSelected: { backgroundColor: isDarkMode ? '#1e293b' : '#F0F9FF' },
    modalOptionText: { fontSize: 16, color: theme.text.primary, fontWeight: '600' },
    modalOptionTextSelected: { color: theme.primary },
  });

  const existingImages = item?.images_url?.map((p: string) => mediaUrl(p)) ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color={theme.text.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Publicación</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Categoría</Text>
          <TouchableOpacity style={styles.selectTrigger} onPress={() => setCategoryModalOpen(true)}>
            <Text style={styles.selectTriggerText}>{formData.category}</Text>
            <ChevronDown size={22} color={theme.text.muted} />
          </TouchableOpacity>

          <Text style={styles.label}>Estado de la venta</Text>
          <Text style={styles.statusHint}>Usa «Vendido» cuando cerraste la venta; la publicación dejará de aparecer en el mercado.</Text>
          <TouchableOpacity style={styles.selectTrigger} onPress={() => setStatusModalOpen(true)}>
            <Text style={styles.selectTriggerText}>
              {LIVESTOCK_STATUS_OPTIONS.find((o) => o.value === listingStatus)?.label ?? listingStatus}
            </Text>
            <ChevronDown size={22} color={theme.text.muted} />
          </TouchableOpacity>

          <Text style={styles.label}>Raza *</Text>
          <TextInput
            style={styles.input}
            value={formData.breed}
            onChangeText={(v) => setFormData({ ...formData, breed: v })}
            placeholder="Ej: Brahman"
            placeholderTextColor={theme.text.muted}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Peso total (lb) *</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={formData.weight}
                onChangeText={(v) => setFormData({ ...formData, weight: v })}
                placeholderTextColor={theme.text.muted}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Cantidad *</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={formData.quantity}
                onChangeText={(v) => setFormData({ ...formData, quantity: v })}
                placeholderTextColor={theme.text.muted}
              />
            </View>
          </View>

          <Text style={styles.label}>Precio por libra ($) *</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={formData.price_per_lb}
            onChangeText={(v) => setFormData({ ...formData, price_per_lb: v })}
            placeholderTextColor={theme.text.muted}
          />

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            multiline
            value={formData.description}
            onChangeText={(v) => setFormData({ ...formData, description: v })}
            placeholder="Detalles del lote…"
            placeholderTextColor={theme.text.muted}
          />
        </View>

        <Text style={styles.sectionTitle}>Fotos actuales</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          {existingImages.length > 0 ? (
            existingImages.map((uri: string, index: number) => (
              <Image key={index} source={{ uri }} style={styles.thumb} />
            ))
          ) : (
            <View style={styles.noPhotos}>
              <FileText color={theme.text.muted} size={28} />
              <Text style={styles.noPhotosText}>Sin fotos</Text>
            </View>
          )}
        </ScrollView>

        <Text style={styles.sectionTitle}>Ubicación</Text>
        {locLoading ? (
          <View style={styles.locLoadingRow}>
            <ActivityIndicator color={theme.primary} />
            <Text style={styles.locMeta}>Obteniendo ubicación…</Text>
          </View>
        ) : (
          <>
            {listingLat != null && listingLng != null ? (
              <View style={styles.locMetaRow}>
                <MapPin size={16} color={theme.primary} />
                <Text style={styles.locMeta}>{listingLat.toFixed(5)}, {listingLng.toFixed(5)}</Text>
              </View>
            ) : null}
            {locError ? <Text style={styles.locError}>{locError}</Text> : null}
            <TouchableOpacity style={styles.secondaryBtn} onPress={loadPublicationLocation}>
              <Text style={styles.secondaryBtnText}>Actualizar ubicación (GPS)</Text>
            </TouchableOpacity>
            <Text style={styles.label}>Provincia / región</Text>
            <TextInput style={styles.input} value={locProvince} onChangeText={setLocProvince} placeholder="Provincia" placeholderTextColor={theme.text.muted} />
            <Text style={styles.label}>Ciudad</Text>
            <TextInput style={styles.input} value={locCity} onChangeText={setLocCity} placeholder="Ciudad" placeholderTextColor={theme.text.muted} />
          </>
        )}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>Guardar cambios</Text>}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={categoryModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalDismissArea} onPress={() => setCategoryModalOpen(false)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Categoría</Text>
            {LIVESTOCK_CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat} style={[styles.modalOption, formData.category === cat && styles.modalOptionSelected]} onPress={() => { setFormData({ ...formData, category: cat }); setCategoryModalOpen(false); }}>
                <Text style={[styles.modalOptionText, formData.category === cat && styles.modalOptionTextSelected]}>{cat}</Text>
                {formData.category === cat ? <Check size={20} color={theme.primary} /> : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal visible={statusModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalDismissArea} onPress={() => setStatusModalOpen(false)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Estado</Text>
            {LIVESTOCK_STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity key={opt.value} style={[styles.modalOption, listingStatus === opt.value && styles.modalOptionSelected]} onPress={() => { setListingStatus(opt.value); setStatusModalOpen(false); }}>
                <Text style={[styles.modalOptionText, listingStatus === opt.value && styles.modalOptionTextSelected]}>{opt.label}</Text>
                {listingStatus === opt.value ? <Check size={20} color={theme.primary} /> : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
