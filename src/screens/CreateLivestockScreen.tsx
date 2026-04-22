import React, { useState, useContext, useEffect, useCallback } from 'react';
import { 
  View, Text, TextInput, ScrollView, TouchableOpacity, 
  Image, StyleSheet, Alert, ActivityIndicator, Platform, Modal 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';
import { FileText, X, Plus, Check, ChevronDown, MapPin, RefreshCcw } from 'lucide-react-native';
import { api, getApiErrorMessage } from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../theme/constants';

const LIVESTOCK_CATEGORIES = ['Bovino', 'Porcino', 'Equino', 'Ovinos'] as const;
const MAX_PHOTO_EDGE = 1920;
type LivestockCategory = (typeof LIVESTOCK_CATEGORIES)[number];

export const CreateLivestockScreen = ({ navigation }: any) => {
  const { user } = useContext(AuthContext);
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

  // Estados de Ubicación
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
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (result.canceled) return;
    const prepared: string[] = [];
    for (const asset of result.assets) {
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
        if (type === 'guide') setGuide(result.assets[0]);
        else setCertificate(result.assets[0]);
      }
    } catch {
      Alert.alert('Error', 'No se pudo seleccionar el documento.');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.breed || !formData.weight || !formData.price_per_lb || images.length === 0) {
      Alert.alert('Error', 'Completa los campos obligatorios y sube al menos una foto.');
      return;
    }
    if (!user?.id) {
      Alert.alert('Error', 'Sesión no válida.');
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
        body.append('latitude', String(listingLat));
        body.append('longitude', String(listingLng));
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
        Alert.alert('¡Éxito!', 'Publicación creada.');
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert('Error', getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Nueva Publicación</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Categoría</Text>
        <TouchableOpacity style={styles.selectTrigger} onPress={() => setCategoryModalOpen(true)}>
          <Text style={styles.selectTriggerText}>{formData.category}</Text>
          <ChevronDown size={22} color={COLORS.text.muted} />
        </TouchableOpacity>

        <Text style={styles.label}>Raza *</Text>
        <TextInput 
          style={styles.input} 
          value={formData.breed} 
          onChangeText={(v) => setFormData({...formData, breed: v})}
          placeholder="Ej: Brahman, Holstein..."
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Peso total (lb) *</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={formData.weight} onChangeText={(v) => setFormData({...formData, weight: v})} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Cantidad *</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={formData.quantity} onChangeText={(v) => setFormData({...formData, quantity: v})} />
          </View>
        </View>

        <Text style={styles.label}>Precio por Libra ($) *</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={formData.price_per_lb} onChangeText={(v) => setFormData({...formData, price_per_lb: v})} />

        <Text style={styles.label}>Descripción</Text>
        <TextInput style={[styles.input, { height: 80 }]} multiline value={formData.description} onChangeText={(v) => setFormData({...formData, description: v})} />
      </View>

      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={loadPublicationLocation} disabled={locLoading}>
            {locLoading ? <ActivityIndicator size="small" color={COLORS.primary} /> : <RefreshCcw size={18} color={COLORS.primary} />}
            <Text style={styles.refreshBtnText}>GPS</Text>
          </TouchableOpacity>
        </View>
        
        {locError ? <Text style={styles.locError}>{locError}</Text> : null}
        {listingLat && listingLng ? (
          <View style={styles.coordsRow}>
            <MapPin size={14} color={COLORS.text.muted} />
            <Text style={styles.coordsText}>{listingLat.toFixed(4)}, {listingLng.toFixed(4)}</Text>
          </View>
        ) : null}

        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1, marginRight: 10 }]} value={locProvince} onChangeText={setLocProvince} placeholder="Provincia" />
          <TextInput style={[styles.input, { flex: 1 }]} value={locCity} onChangeText={setLocCity} placeholder="Ciudad" />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Fotos del Ganado *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
        <TouchableOpacity style={styles.addCard} onPress={pickImage}>
          <Plus color={COLORS.primary} size={30} />
          <Text style={{ color: COLORS.primary, fontSize: 10, fontWeight: '700' }}>FOTOS</Text>
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
          {guide ? <Check color="white" size={20} /> : <FileText color={COLORS.primary} size={20} />}
          <Text style={[styles.docText, guide && { color: 'white' }]}>Guía Mov.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.docBtn, certificate && styles.docBtnActive]} onPress={() => pickDocument('certificate')}>
          {certificate ? <Check color="white" size={20} /> : <FileText color={COLORS.primary} size={20} />}
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
              <TouchableOpacity key={cat} style={styles.modalOption} onPress={() => {
                setFormData({ ...formData, category: cat });
                setCategoryModalOpen(false);
              }}>
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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text.primary, marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 15, color: COLORS.text.primary },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text.muted, marginBottom: 5 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, fontSize: 16, marginBottom: 15, color: COLORS.text.primary },
  selectTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 14, marginBottom: 15 },
  selectTriggerText: { fontSize: 16, color: COLORS.text.primary, fontWeight: '600' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0F9FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: COLORS.primary },
  refreshBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
  coordsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, marginLeft: 2 },
  coordsText: { fontSize: 12, color: COLORS.text.muted, fontWeight: '600' },
  locError: { fontSize: 12, color: '#EF4444', marginBottom: 10, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 30 },
  modalSheet: { backgroundColor: 'white', borderRadius: 24, padding: 25 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20, textAlign: 'center', color: COLORS.text.primary },
  modalOption: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalOptionText: { fontSize: 17, textAlign: 'center', color: COLORS.text.primary, fontWeight: '600' },
  closeModalBtn: { marginTop: 20, padding: 10 },
  closeModalText: { textAlign: 'center', color: COLORS.primary, fontWeight: '700', fontSize: 16 },
  row: { flexDirection: 'row' },
  imageScroll: { marginBottom: 25 },
  addCard: { width: 90, height: 90, borderRadius: 12, borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  imageCard: { width: 90, height: 90, borderRadius: 12, marginRight: 12, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 4 },
  docRow: { flexDirection: 'row', gap: 12, marginBottom: 35 },
  docBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.primary, gap: 10, backgroundColor: '#F0F9FF' },
  docBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  docText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  submitBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 16, alignItems: 'center', elevation: 2 },
  submitText: { color: 'white', fontSize: 18, fontWeight: '800' },
});
