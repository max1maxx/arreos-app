import React, { useState, useContext, useEffect, useCallback } from 'react';
import { 
  View, Text, TextInput, ScrollView, TouchableOpacity, 
  Image, StyleSheet, Alert, ActivityIndicator, Platform, Modal, SafeAreaView 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';
import { FileText, X, Plus, Check, ChevronDown, MapPin, RefreshCcw, ChevronLeft } from 'lucide-react-native';
import { api, getApiErrorMessage } from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLivestock } from '../context/LivestockContext';
import { useAlert } from '../context/AlertContext';

const LIVESTOCK_CATEGORIES = ['Bovino', 'Porcino', 'Equino', 'Ovinos'] as const;
const MAX_PHOTO_EDGE = 1920;
type LivestockCategory = (typeof LIVESTOCK_CATEGORIES)[number];

export const CreateLivestockScreen = ({ navigation }: any) => {
  const { user } = useContext(AuthContext);
  const { theme, isDarkMode } = useTheme();
  const { addListing } = useLivestock();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Bovino' as LivestockCategory,
    breed: '',
    weight: '',
    quantity: '1',
    price_per_lb: '',
    description: '',
  });

  const [images, setImages] = useState<string[]>([]);
  const [guide, setGuide] = useState<any>(null);
  const [certificate, setCertificate] = useState<any>(null);

  const [listingLat, setListingLat] = useState<number | null>(null);
  const [listingLng, setListingLng] = useState<number | null>(null);
  const [locProvince, setLocProvince] = useState('');
  const [locCity, setLocCity] = useState('');
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const loadPublicationLocation = useCallback(async () => {
    setLocLoading(true);
    setLocError(null);
    try {
      if (Platform.OS === 'web') {
        setLocLoading(false);
        setLocError('Ubicación manual requerida en web.');
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocError('Permiso de ubicación denegado.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = pos.coords;
      setListingLat(latitude);
      setListingLng(longitude);
      
      const places = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (places[0]) {
        setLocCity(places[0].city || places[0].district || '');
        setLocProvince(places[0].region || '');
      }
    } catch {
      setLocError('No se pudo obtener la ubicación GPS.');
    } finally {
      setLocLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPublicationLocation();
  }, [loadPublicationLocation]);

  const pickImage = async () => {
    if (images.length >= 10) {
      showAlert({
        title: 'Límite alcanzado',
        message: 'Solo puedes subir un máximo de 10 fotos por publicación.',
        type: 'warning'
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10 - images.length,
    });
    if (result.canceled) return;

    const prepared: string[] = [];
    const remainingSlots = 10 - images.length;
    const assetsToProcess = result.assets.slice(0, remainingSlots);

    for (const asset of assetsToProcess) {
      try {
        const out = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: MAX_PHOTO_EDGE } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        prepared.push(out.uri);
      } catch {
        prepared.push(asset.uri);
      }
    }
    setImages([...images, ...prepared]);
  };

  const pickDocument = async (type: 'guide' | 'certificate') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
      });
      if (!result.canceled) {
        const file = result.assets[0];
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        if (file.size && file.size > MAX_FILE_SIZE) {
          showAlert({
            title: 'Archivo muy pesado',
            message: `El documento "${file.name}" pesa ${(file.size / (1024 * 1024)).toFixed(2)}MB. El límite máximo permitido es de 5MB.`,
            type: 'error'
          });
          return;
        }
        if (type === 'guide') setGuide(file);
        else setCertificate(file);
      }
    } catch {
      showAlert({ title: 'Error', message: 'No se pudo seleccionar el documento.', type: 'error' });
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.breed || !formData.weight || !formData.price_per_lb || images.length === 0) {
      showAlert({ title: 'Faltan datos', message: 'Completa los campos obligatorios y sube al menos una foto.', type: 'warning' });
      return;
    }
    if (!user?.id) {
      showAlert({ title: 'Sesión no válida', message: 'Por favor inicia sesión nuevamente.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const body = new FormData();
      body.append('sellerId', user.id);
      body.append('category', formData.category);
      body.append('breed', formData.breed);
      body.append('weight', formData.weight);
      body.append('quantity', formData.quantity);
      body.append('price_per_lb', formData.price_per_lb);
      body.append('description', formData.description);
      body.append('province', locProvince);
      body.append('city', locCity);

      if (listingLat && listingLng) {
        body.append('listingLatitude', String(listingLat));
        body.append('listingLongitude', String(listingLng));
      }

      images.forEach((uri, index) => {
        const name = `photo_${index}_${Date.now()}.jpg`;
        body.append('images', {
          uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
          name,
          type: 'image/jpeg',
        } as any);
      });

      if (guide) {
        body.append('guide', { uri: guide.uri, name: guide.name, type: guide.mimeType || 'application/pdf' } as any);
      }
      if (certificate) {
        body.append('certificate', { uri: certificate.uri, name: certificate.name, type: certificate.mimeType || 'application/pdf' } as any);
      }

      const response = await api.post('/api/livestock', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data, 
      });

      if (response.data.success) {
        addListing(response.data.data);
        showAlert({
          title: '¡Éxito!',
          message: 'Tu oferta ha sido publicada correctamente.',
          type: 'success',
          onConfirm: () => navigation.goBack()
        });
      }
    } catch (error: any) {
      showAlert({ title: 'Error', message: getApiErrorMessage(error), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, paddingTop: Platform.OS === 'android' ? 40 : 15, borderBottomWidth: 1, borderBottomColor: theme.border },
    headerTitle: { fontSize: 18, fontWeight: '800', color: theme.text.primary, marginLeft: 15 },
    content: { padding: 20 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 15, color: theme.text.primary },
    label: { fontSize: 14, fontWeight: '600', color: theme.text.secondary, marginBottom: 5 },
    input: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 12, fontSize: 16, marginBottom: 15, color: theme.text.primary },
    selectTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 14, marginBottom: 15 },
    selectTriggerText: { fontSize: 16, color: theme.text.primary, fontWeight: '600' },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: isDarkMode ? '#1e293b' : '#F0F9FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: theme.primary },
    refreshBtnText: { color: theme.primary, fontWeight: '700', fontSize: 12 },
    coordsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, marginLeft: 2 },
    coordsText: { fontSize: 12, color: theme.text.muted, fontWeight: '600' },
    locError: { fontSize: 12, color: theme.error, marginBottom: 10, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 30 },
    modalSheet: { backgroundColor: theme.card, borderRadius: 24, padding: 25 },
    modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20, textAlign: 'center', color: theme.text.primary },
    modalOption: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
    modalOptionText: { fontSize: 17, textAlign: 'center', color: theme.text.primary, fontWeight: '600' },
    closeModalBtn: { marginTop: 20, padding: 10 },
    closeModalText: { textAlign: 'center', color: theme.primary, fontWeight: '700', fontSize: 16 },
    row: { flexDirection: 'row' },
    imageScroll: { marginBottom: 25 },
    addCard: { width: 90, height: 90, borderRadius: 12, borderWidth: 2, borderColor: theme.primary, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    imageCard: { width: 90, height: 90, borderRadius: 12, marginRight: 12, overflow: 'hidden' },
    image: { width: '100%', height: '100%' },
    removeBtn: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 4 },
    docRow: { flexDirection: 'row', gap: 12, marginBottom: 35 },
    docBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 14, borderWidth: 1.5, borderColor: theme.primary, gap: 10, backgroundColor: isDarkMode ? '#1e293b' : '#F0F9FF' },
    docBtnActive: { backgroundColor: theme.primary, borderColor: theme.primary },
    docText: { color: theme.primary, fontWeight: '700', fontSize: 14 },
    submitBtn: { backgroundColor: theme.primary, padding: 18, borderRadius: 16, alignItems: 'center', elevation: 2 },
    submitText: { color: 'white', fontSize: 18, fontWeight: '800' },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color={theme.text.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Publicación</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Categoría</Text>
          <TouchableOpacity style={styles.selectTrigger} onPress={() => setCategoryModalOpen(true)}>
            <Text style={styles.selectTriggerText}>{formData.category}</Text>
            <ChevronDown size={22} color={theme.text.muted} />
          </TouchableOpacity>
          <Text style={styles.label}>Raza *</Text>
          <TextInput style={styles.input} value={formData.breed} onChangeText={(v) => setFormData({...formData, breed: v})} placeholder="Ej: Brahman, Holstein..." placeholderTextColor={theme.text.muted} />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Peso total (lb) *</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={formData.weight} onChangeText={(v) => setFormData({...formData, weight: v})} placeholderTextColor={theme.text.muted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Cantidad *</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={formData.quantity} onChangeText={(v) => setFormData({...formData, quantity: v})} placeholderTextColor={theme.text.muted} />
            </View>
          </View>
          <Text style={styles.label}>Precio por Libra ($) *</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={formData.price_per_lb} onChangeText={(v) => setFormData({...formData, price_per_lb: v})} placeholderTextColor={theme.text.muted} />
          <Text style={styles.label}>Descripción</Text>
          <TextInput style={[styles.input, { height: 80 }]} multiline value={formData.description} onChangeText={(v) => setFormData({...formData, description: v})} placeholderTextColor={theme.text.muted} />
        </View>

        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Ubicación</Text>
            <TouchableOpacity style={styles.refreshBtn} onPress={loadPublicationLocation} disabled={locLoading}>
              {locLoading ? <ActivityIndicator size="small" color={theme.primary} /> : <RefreshCcw size={18} color={theme.primary} />}
              <Text style={styles.refreshBtnText}>GPS</Text>
            </TouchableOpacity>
          </View>
          {locError ? <Text style={styles.locError}>{locError}</Text> : null}
          {listingLat && listingLng ? (
            <View style={styles.coordsRow}>
              <MapPin size={14} color={theme.text.muted} />
              <Text style={styles.coordsText}>{listingLat.toFixed(4)}, {listingLng.toFixed(4)}</Text>
            </View>
          ) : null}
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1, marginRight: 10 }]} value={locProvince} onChangeText={setLocProvince} placeholder="Provincia" placeholderTextColor={theme.text.muted} />
            <TextInput style={[styles.input, { flex: 1 }]} value={locCity} onChangeText={setLocCity} placeholder="Ciudad" placeholderTextColor={theme.text.muted} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Fotos del Ganado *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          <TouchableOpacity style={styles.addCard} onPress={pickImage}>
            <Plus color={theme.primary} size={30} />
            <Text style={{ color: theme.primary, fontSize: 10, fontWeight: '700' }}>FOTOS</Text>
          </TouchableOpacity>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageCard}>
              <Image source={{ uri }} style={styles.image} />
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(index)}>
                <X color="white" size={14} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Documentos Legales (Opcional)</Text>
        <View style={styles.docRow}>
          <TouchableOpacity style={[styles.docBtn, guide && styles.docBtnActive]} onPress={() => pickDocument('guide')}>
            {guide ? <Check color="white" size={20} /> : <FileText color={theme.primary} size={20} />}
            <Text style={[styles.docText, guide && { color: 'white' }]}>Guía Mov.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.docBtn, certificate && styles.docBtnActive]} onPress={() => pickDocument('certificate')}>
            {certificate ? <Check color="white" size={20} /> : <FileText color={theme.primary} size={20} />}
            <Text style={[styles.docText, certificate && { color: 'white' }]}>Cert. Sani.</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>Publicar para la Venta</Text>}
        </TouchableOpacity>

        <Modal visible={categoryModalOpen} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Seleccionar Categoría</Text>
              {LIVESTOCK_CATEGORIES.map((cat) => (
                <TouchableOpacity key={cat} style={styles.modalOption} onPress={() => { setFormData({ ...formData, category: cat }); setCategoryModalOpen(false); }}>
                  <Text style={styles.modalOptionText}>{cat}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setCategoryModalOpen(false)}>
                <Text style={styles.closeModalText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
};
