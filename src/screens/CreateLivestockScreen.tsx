import React, { useState, useContext, useEffect, useCallback } from 'react';
import { 
  View, Text, TextInput, ScrollView, TouchableOpacity, 
  Image, StyleSheet, Alert, ActivityIndicator, Platform, Modal 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';
import { Camera, FileText, X, Plus, Check, ChevronDown, MapPin } from 'lucide-react-native';
import { api, getApiErrorMessage } from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../theme/constants';

const LIVESTOCK_CATEGORIES = ['Bovino', 'Porcino', 'Equino', 'Ovinos'] as const;
/** Lado máximo al subir (px); baja peso sin notarse en pantalla típica de móvil. */
const MAX_PHOTO_EDGE = 1920;
type LivestockCategory = (typeof LIVESTOCK_CATEGORIES)[number];

export const CreateLivestockScreen = ({ navigation }: any) => {
  const { user } = useContext(AuthContext); // Obtenemos el usuario real logueado
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
  const [locLoading, setLocLoading] = useState(true);
  const [locError, setLocError] = useState<string | null>(null);

  const loadPublicationLocation = useCallback(async () => {
    setLocLoading(true);
    setLocError(null);
    try {
      if (Platform.OS === 'web') {
        setLocLoading(false);
        setLocError('En el navegador indica provincia y ciudad manualmente. En el móvil se usará el GPS.');
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocError('Permiso de ubicación denegado. Actívalo en ajustes del teléfono.');
        setListingLat(null);
        setListingLng(null);
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
      setLocError('No se pudo obtener la ubicación. Pulsa "Actualizar ubicación" o revisa el GPS.');
      setListingLat(null);
      setListingLng(null);
    } finally {
      setLocLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPublicationLocation();
  }, [loadPublicationLocation]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.88,
    });

    if (result.canceled) return;

    const prepared: string[] = [];
    for (const asset of result.assets) {
      try {
        const w = asset.width ?? 4096;
        const h = asset.height ?? 4096;
        const actions: ImageManipulator.Action[] = [];
        if (w > MAX_PHOTO_EDGE || h > MAX_PHOTO_EDGE) {
          if (w >= h) {
            actions.push({ resize: { width: MAX_PHOTO_EDGE } });
          } else {
            actions.push({ resize: { height: MAX_PHOTO_EDGE } });
          }
        }
        const out = await ImageManipulator.manipulateAsync(
          asset.uri,
          actions,
          { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG }
        );
        prepared.push(out.uri);
      } catch {
        prepared.push(asset.uri);
      }
    }
    setImages([...images, ...prepared]);
  };

  const pickDocument = async (type: 'guide' | 'certificate') => {
    let result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
    });

    if (!result.canceled) {
      if (type === 'guide') setGuide(result.assets[0]);
      else setCertificate(result.assets[0]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validaciones básicas
    if (!formData.breed || !formData.weight || !formData.price_per_lb || images.length === 0) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios y sube al menos una foto.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'No se pudo identificar tu sesión. Intenta cerrar e iniciar sesión de nuevo.');
      return;
    }

    if (Platform.OS !== 'web' && (listingLat == null || listingLng == null)) {
      Alert.alert(
        'Ubicación requerida',
        'Necesitamos tu ubicación para registrar la publicación. Pulsa "Actualizar ubicación" y permite el GPS.'
      );
      return;
    }
    if (Platform.OS === 'web' && !locProvince.trim() && !locCity.trim()) {
      Alert.alert('Ubicación', 'Indica al menos provincia o ciudad donde ofertas.');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      
      // USAMOS EL ID REAL DEL USUARIO (Jonathan)
      data.append('sellerId', user.id); 
      data.append('category', formData.category);
      data.append('breed', formData.breed);
      data.append('weight', formData.weight);
      data.append('quantity', formData.quantity);
      data.append('price_per_lb', formData.price_per_lb);
      data.append('description', formData.description);
      if (listingLat != null && listingLng != null) {
        data.append('latitude', String(listingLat));
        data.append('longitude', String(listingLng));
      }
      data.append('province', locProvince.trim());
      data.append('city', locCity.trim());

      // Append Images
      images.forEach((uri, index) => {
        const filename = `image_${index}.jpg`;
        // @ts-ignore
        data.append('images', { uri, name: filename, type: 'image/jpeg' });
      });

      // Append Documents (Optional)
      if (guide) {
        // @ts-ignore
        data.append('guide', { uri: guide.uri, name: guide.name, type: guide.mimeType || 'application/pdf' });
      }
      if (certificate) {
        // @ts-ignore
        data.append('certificate', { uri: certificate.uri, name: certificate.name, type: certificate.mimeType || 'application/pdf' });
      }

      console.log('Enviando publicación para usuario:', user.id);

      const response = await api.post('/api/livestock', data, {
        timeout: 90_000,
      });

      if (response.data.success) {
        Alert.alert('¡Éxito!', 'Publicación de ganado creada correctamente.');
        navigation.goBack();
      }
    } catch (error: unknown) {
      console.error('[UPLOAD_ERROR]', error);
      const base = getApiErrorMessage(error, 'No se pudo crear la publicación.');
      const details = (error as { response?: { data?: { details?: string } } })?.response?.data?.details;
      Alert.alert('Error', details ? `${base}\nDetalle: ${details}` : base);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Nueva Publicación</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Categoría</Text>
        <TouchableOpacity
          style={styles.selectTrigger}
          onPress={() => setCategoryModalOpen(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.selectTriggerText}>{formData.category}</Text>
          <ChevronDown size={22} color={COLORS.text.muted} />
        </TouchableOpacity>

        <Text style={styles.label}>Raza *</Text>
        <TextInput 
          style={styles.input} 
          value={formData.breed} 
          onChangeText={(v) => setFormData({...formData, breed: v})}
          placeholder="Ej: Brahman, Holstein"
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Peso total (lb) *</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric"
              value={formData.weight} 
              onChangeText={(v) => setFormData({...formData, weight: v})}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Cantidad *</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric"
              value={formData.quantity} 
              onChangeText={(v) => setFormData({...formData, quantity: v})}
            />
          </View>
        </View>

        <Text style={styles.label}>Precio por Libra ($) *</Text>
        <TextInput 
          style={styles.input} 
          keyboardType="numeric"
          value={formData.price_per_lb} 
          onChangeText={(v) => setFormData({...formData, price_per_lb: v})}
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput 
          style={[styles.input, { height: 80 }]} 
          multiline
          value={formData.description} 
          onChangeText={(v) => setFormData({...formData, description: v})}
          placeholder="Añade detalles sobre el ganado..."
        />
      </View>

      <Text style={styles.sectionTitle}>Ubicación de la publicación</Text>
      <Text style={styles.locHint}>
        Se guarda para búsquedas y filtros por zona en el mercado. Puedes corregir provincia y ciudad si no coinciden.
      </Text>
      {locLoading ? (
        <View style={styles.locLoadingRow}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.locMeta}>Obteniendo ubicación…</Text>
        </View>
      ) : (
        <>
          {listingLat != null && listingLng != null ? (
            <View style={styles.locMetaRow}>
              <MapPin size={16} color={COLORS.primary} />
              <Text style={styles.locMeta}>
                {listingLat.toFixed(5)}, {listingLng.toFixed(5)}
              </Text>
            </View>
          ) : null}
          {locError ? <Text style={styles.locError}>{locError}</Text> : null}
          <TouchableOpacity style={styles.secondaryBtn} onPress={loadPublicationLocation}>
            <Text style={styles.secondaryBtnText}>Actualizar ubicación</Text>
          </TouchableOpacity>
          <Text style={styles.label}>Provincia / región</Text>
          <TextInput
            style={styles.input}
            value={locProvince}
            onChangeText={setLocProvince}
            placeholder="Ej: Pichincha"
          />
          <Text style={styles.label}>Ciudad</Text>
          <TextInput
            style={styles.input}
            value={locCity}
            onChangeText={setLocCity}
            placeholder="Ej: Quito"
          />
        </>
      )}

      <Text style={styles.sectionTitle}>Fotos del Ganado *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
        <TouchableOpacity style={styles.addCard} onPress={pickImage}>
          <Plus color={COLORS.primary} size={30} />
          <Text style={{ color: COLORS.primary, fontSize: 12 }}>Añadir</Text>
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
        <TouchableOpacity 
          style={[styles.docBtn, guide && styles.docBtnActive]} 
          onPress={() => pickDocument('guide')}
        >
          {guide ? <Check color="white" size={20} /> : <FileText color={COLORS.primary} size={20} />}
          <Text style={[styles.docText, guide && { color: 'white' }]}>Guía Mov.</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.docBtn, certificate && styles.docBtnActive]} 
          onPress={() => pickDocument('certificate')}
        >
          {certificate ? <Check color="white" size={20} /> : <FileText color={COLORS.primary} size={20} />}
          <Text style={[styles.docText, certificate && { color: 'white' }]}>Cert. Sani.</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.submitBtn} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>Publicar para la Venta</Text>}
      </TouchableOpacity>
      
      <View style={{ height: 40 }} />
    </ScrollView>

    <Modal
      visible={categoryModalOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setCategoryModalOpen(false)}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalDismissArea}
          activeOpacity={1}
          onPress={() => setCategoryModalOpen(false)}
        />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Tipo de ganado</Text>
          {LIVESTOCK_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.modalOption,
                formData.category === cat && styles.modalOptionSelected,
              ]}
              onPress={() => {
                setFormData({ ...formData, category: cat });
                setCategoryModalOpen(false);
              }}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  formData.category === cat && styles.modalOptionTextSelected,
                ]}
              >
                {cat}
              </Text>
              {formData.category === cat ? (
                <Check size={20} color={COLORS.primary} />
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text.primary, marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, marginTop: 8, color: COLORS.text.primary },
  locHint: { fontSize: 13, color: COLORS.text.secondary, marginBottom: 12, lineHeight: 18 },
  locLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  locMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  locMeta: { fontSize: 13, color: COLORS.text.secondary },
  locError: { fontSize: 13, color: '#c0392b', marginBottom: 10 },
  secondaryBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 16,
  },
  secondaryBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text.muted, marginBottom: 5 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 15,
  },
  selectTriggerText: { fontSize: 16, color: COLORS.text.primary, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: { flex: 1 },
  modalSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalOptionSelected: { backgroundColor: '#F0F9FF' },
  modalOptionText: { fontSize: 16, color: COLORS.text.primary, fontWeight: '600' },
  modalOptionTextSelected: { color: COLORS.primary },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  imageScroll: { marginBottom: 20 },
  addCard: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  imageCard: { width: 100, height: 100, borderRadius: 12, marginRight: 10, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 2,
  },
  docRow: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  docBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 8,
  },
  docBtnActive: { backgroundColor: COLORS.primary },
  docText: { color: COLORS.primary, fontWeight: '700' },
  submitBtn: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitText: { color: 'white', fontSize: 18, fontWeight: '800' },
});
