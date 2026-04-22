import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, 
  Dimensions, Modal, Linking, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Scale, Hash, DollarSign, ChevronLeft, X, Phone, MessageCircle } from 'lucide-react-native';
import { COLORS } from '../theme/constants';
import { mediaUrl } from '../config/api';
import { getStatusLabel, getStatusColor } from '../utils/statusTranslations';

const { width } = Dimensions.get('window');

/**
 * Solo dígitos para wa.me (sin +).
 */
function toWhatsAppDigits(phone: string | undefined | null): string | null {
  if (!phone?.trim()) return null;
  let d = phone.replace(/\D/g, '');
  if (!d) return null;

  if (d.startsWith('593')) return d;
  if (d.startsWith('57') && d.length >= 12) return d;

  if (d.length === 10 && d.startsWith('09')) {
    return `593${d.slice(1)}`;
  }
  if (d.length === 9 && d.startsWith('9')) {
    return `593${d}`;
  }
  if (d.length === 10 && d.startsWith('3')) {
    return `57${d}`;
  }
  return d.length >= 10 ? d : null;
}

export const LivestockDetailScreen = ({ route, navigation }: any) => {
  const { item } = route.params;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = item.images_url?.map((img: string) => mediaUrl(img)) || [];
  const sellerPhone = item.seller?.phone?.trim() || '';

  const openCall = async () => {
    if (!sellerPhone) {
      Alert.alert('Sin teléfono', 'El vendedor no tiene un número registrado.');
      return;
    }
    const tel = sellerPhone.replace(/\s/g, '');
    const url = `tel:${tel}`;
    try {
      const ok = await Linking.canOpenURL(url);
      if (ok) await Linking.openURL(url);
      else Alert.alert('Error', 'No se pudo abrir la app de llamadas.');
    } catch {
      Alert.alert('Error', 'No se pudo iniciar la llamada.');
    }
  };

  const openWhatsApp = async () => {
    const waDigits = toWhatsAppDigits(item.seller?.phone);
    if (!waDigits) {
      Alert.alert('Error', 'El vendedor no tiene un número válido para WhatsApp.');
      return;
    }
    const title = `${item.category} — $${item.total_price?.toLocaleString()}`;
    const text = encodeURIComponent(`Hola, vi tu publicación en Arreos: ${title}`);
    const url = `https://wa.me/${waDigits}?text=${text}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'No se pudo abrir WhatsApp.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color="white" size={28} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          style={styles.imageContainer}
        >
          {images.length > 0 ? (
            images.map((img: string, index: number) => (
              <TouchableOpacity 
                key={index} 
                activeOpacity={0.9}
                onPress={() => setSelectedImage(img)}
              >
                <Image source={{ uri: img }} style={styles.mainImage} />
              </TouchableOpacity>
            ))
          ) : (
            <Image 
              source={{ uri: 'https://via.placeholder.com/600?text=Sin+Foto' }} 
              style={styles.mainImage} 
            />
          )}
        </ScrollView>

        <View style={styles.content}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>${item.total_price?.toLocaleString()}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{item.category} - {item.breed || 'Cruza'}</Text>
          
          <View style={styles.sellerRow}>
            <MapPin size={16} color={COLORS.text.secondary} />
            <Text style={styles.location}>
              {(() => {
                const geo = [item.city, item.province].filter(Boolean).join(', ');
                const finca = item.seller?.profile?.finca_name;
                if (geo && finca) return `${geo} · ${finca}`;
                if (geo) return geo;
                if (finca) return finca;
                return 'Ubicación no disponible';
              })()}
            </Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Scale size={20} color={COLORS.primary} />
              <Text style={styles.statLabel}>Peso Total</Text>
              <Text style={styles.statValue}>{item.weight} lb</Text>
            </View>
            <View style={styles.statCard}>
              <Hash size={20} color={COLORS.primary} />
              <Text style={styles.statLabel}>Cantidad</Text>
              <Text style={styles.statValue}>{item.quantity} cabezas</Text>
            </View>
            <View style={styles.statCard}>
              <DollarSign size={20} color={COLORS.primary} />
              <Text style={styles.statLabel}>Precio/lb</Text>
              <Text style={styles.statValue}>${item.price_per_lb}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>
            {item.description || 'Sin descripción detallada.'}
          </Text>

          <View style={styles.sellerInfoCard}>
            <Text style={styles.sellerTitle}>Vendedor</Text>
            <Text style={styles.sellerName}>{item.seller?.first_name} {item.seller?.last_name}</Text>
            <Text style={styles.sellerContact}>{item.seller?.email}</Text>
            {sellerPhone ? (
              <Text style={styles.sellerPhone}>{sellerPhone}</Text>
            ) : null}
          </View>
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.contactBtn, styles.callBtn]} onPress={openCall}>
          <Phone color="white" size={20} />
          <Text style={styles.contactText}>Llamar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.contactBtn, styles.wsBtn]} onPress={openWhatsApp}>
          <MessageCircle color="white" size={20} />
          <Text style={styles.contactText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={!!selectedImage} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <TouchableOpacity 
            style={styles.closeModal} 
            onPress={() => setSelectedImage(null)}
          >
            <X color="white" size={32} />
          </TouchableOpacity>
          <ScrollView 
            minimumZoomScale={1} 
            maximumZoomScale={5} 
            centerContent={true}
            contentContainerStyle={styles.zoomContainer}
          >
            {selectedImage && (
              <Image 
                source={{ uri: selectedImage }} 
                style={styles.fullImage} 
                resizeMode="contain"
              />
            )}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  headerActions: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  backBtn: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 8 },
  imageContainer: { width: width, height: 350 },
  mainImage: { width: width, height: 350, backgroundColor: '#eee' },
  content: { padding: 20 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 28, fontWeight: '900', color: COLORS.primary },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontWeight: '700', fontSize: 12, color: 'white' },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text.primary, marginTop: 10 },
  sellerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  location: { color: COLORS.text.secondary, fontSize: 14 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25, gap: 10 },
  statCard: { flex: 1, backgroundColor: '#F8FAFC', padding: 15, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  statLabel: { fontSize: 11, color: COLORS.text.secondary, marginTop: 5, textTransform: 'uppercase' },
  statValue: { fontSize: 16, fontWeight: '800', color: COLORS.text.primary, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginTop: 30, marginBottom: 10, color: COLORS.text.primary },
  description: { fontSize: 16, color: COLORS.text.secondary, lineHeight: 24 },
  sellerInfoCard: { marginTop: 30, padding: 20, backgroundColor: '#F1F5F9', borderRadius: 16 },
  sellerTitle: { fontSize: 12, fontWeight: '700', color: COLORS.text.secondary, textTransform: 'uppercase' },
  sellerName: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary, marginTop: 4 },
  sellerContact: { fontSize: 14, color: COLORS.primary, marginTop: 2 },
  sellerPhone: { fontSize: 14, color: COLORS.text.secondary, marginTop: 6, fontWeight: '600' },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, flexDirection: 'row', gap: 12, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: COLORS.border },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 15, gap: 8 },
  callBtn: { backgroundColor: '#2d3436' },
  wsBtn: { backgroundColor: '#25D366' },
  contactText: { color: 'white', fontWeight: '800', fontSize: 16 },
  modalBackground: { flex: 1, backgroundColor: 'black', justifyContent: 'center' },
  closeModal: { position: 'absolute', top: 50, right: 20, zIndex: 20 },
  zoomContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: width, height: '100%' }
});
