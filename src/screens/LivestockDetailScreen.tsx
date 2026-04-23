import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, 
  Dimensions, Modal, Linking, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Scale, Hash, DollarSign, ChevronLeft, X, Phone, MessageCircle, FileText, ChevronRight } from 'lucide-react-native';
import { mediaUrl } from '../config/api';
import { getStatusLabel, getStatusColor } from '../utils/statusTranslations';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

function toWhatsAppDigits(phone: string | undefined | null): string | null {
  if (!phone?.trim()) return null;
  let d = phone.replace(/\D/g, '');
  if (!d) return null;
  if (d.startsWith('593')) return d;
  if (d.startsWith('57') && d.length >= 12) return d;
  if (d.length === 10 && d.startsWith('09')) return `593${d.slice(1)}`;
  if (d.length === 9 && d.startsWith('9')) return `593${d}`;
  if (d.length === 10 && d.startsWith('3')) return `57${d}`;
  return d.length >= 10 ? d : null;
}

export const LivestockDetailScreen = ({ route, navigation }: any) => {
  const { item } = route.params;
  const { theme, isDarkMode } = useTheme();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const images = item.images_url?.map((img: string) => mediaUrl(img)) || [];
  const sellerPhone = item.seller?.phone?.trim() || '';

  const handleScroll = (event: any) => {
    const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
    if (slide !== activeIndex) {
      setActiveIndex(slide);
    }
  };

  const openDocument = async (url: string | null) => {
    if (!url) return;
    const fullUrl = mediaUrl(url);
    try {
      await Linking.openURL(fullUrl);
    } catch {
      Alert.alert('Error', 'No se pudo abrir el documento.');
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    headerActions: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
    backBtn: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 8 },
    imageWrapper: { position: 'relative' },
    imageContainer: { width: width, height: 350 },
    mainImage: { width: width, height: 350, backgroundColor: theme.surface },
    pagination: { position: 'absolute', bottom: 15, width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
    paginationDot: { height: 8, borderRadius: 4 },
    paginationDotActive: { width: 20, backgroundColor: 'white' },
    paginationDotInactive: { width: 8, backgroundColor: 'rgba(255,255,255,0.5)' },
    imageCounter: { position: 'absolute', bottom: 15, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    imageCounterText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    content: { padding: 20 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    price: { fontSize: 28, fontWeight: '900', color: theme.primary },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontWeight: '700', fontSize: 12, color: 'white' },
    title: { fontSize: 22, fontWeight: '800', color: theme.text.primary, marginTop: 10 },
    sellerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
    location: { color: theme.text.secondary, fontSize: 14 },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25, gap: 10 },
    statCard: { flex: 1, backgroundColor: theme.surface, padding: 15, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: theme.border },
    statLabel: { fontSize: 11, color: theme.text.secondary, marginTop: 5, textTransform: 'uppercase' },
    statValue: { fontSize: 16, fontWeight: '800', color: theme.text.primary, marginTop: 2 },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginTop: 30, marginBottom: 15, color: theme.text.primary },
    description: { fontSize: 16, color: theme.text.secondary, lineHeight: 24 },
    docContainer: { gap: 10 },
    docItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: theme.border },
    docIconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: isDarkMode ? '#1e293b' : '#F0F9FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    docInfo: { flex: 1 },
    docLabel: { fontSize: 15, fontWeight: '700', color: theme.text.primary },
    docSub: { fontSize: 12, color: theme.text.muted, marginTop: 2 },
    sellerInfoCard: { marginTop: 30, padding: 20, backgroundColor: theme.surface, borderRadius: 16 },
    sellerTitle: { fontSize: 12, fontWeight: '700', color: theme.text.secondary, textTransform: 'uppercase' },
    sellerName: { fontSize: 18, fontWeight: '800', color: theme.text.primary, marginTop: 4 },
    sellerContact: { fontSize: 14, color: theme.primary, marginTop: 2 },
    sellerPhone: { fontSize: 14, color: theme.text.secondary, marginTop: 6, fontWeight: '600' },
    footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, flexDirection: 'row', gap: 12, backgroundColor: theme.card, borderTopWidth: 1, borderTopColor: theme.border },
    contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 15, gap: 8 },
    callBtn: { backgroundColor: isDarkMode ? '#334155' : '#2d3436' },
    wsBtn: { backgroundColor: '#25D366' },
    contactText: { color: 'white', fontWeight: '800', fontSize: 16 },
    modalBackground: { flex: 1, backgroundColor: 'black', justifyContent: 'center' },
    closeModal: { position: 'absolute', top: 50, right: 20, zIndex: 20 },
    zoomContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    fullImage: { width: width, height: '100%' }
  });

  const openCall = async () => {
    if (!sellerPhone) {
      Alert.alert('Sin teléfono', 'El vendedor no tiene un número registrado.');
      return;
    }
    const url = `tel:${sellerPhone.replace(/\s/g, '')}`;
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
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color="white" size={28} />
          </TouchableOpacity>
        </View>

        <View style={styles.imageWrapper}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16} style={styles.imageContainer}>
            {images.length > 0 ? (
              images.map((img: string, index: number) => (
                <TouchableOpacity key={index} activeOpacity={0.9} onPress={() => setSelectedImage(img)}>
                  <Image source={{ uri: img }} style={styles.mainImage} />
                </TouchableOpacity>
              ))
            ) : (
              <Image source={{ uri: 'https://via.placeholder.com/600?text=Sin+Foto' }} style={styles.mainImage} />
            )}
          </ScrollView>

          {images.length > 1 && (
            <>
              <View style={styles.pagination}>
                {images.map((_: any, i: number) => (
                  <View key={i} style={[styles.paginationDot, activeIndex === i ? styles.paginationDotActive : styles.paginationDotInactive]} />
                ))}
              </View>
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>{activeIndex + 1} / {images.length}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>${item.total_price?.toLocaleString()}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
            </View>
          </View>

          <Text style={styles.title}>{item.category} - {item.breed || 'Cruza'}</Text>
          
          <View style={styles.sellerRow}>
            <MapPin size={16} color={theme.text.secondary} />
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
              <Scale size={20} color={theme.primary} />
              <Text style={styles.statLabel}>Peso Total</Text>
              <Text style={styles.statValue}>{item.weight} lb</Text>
            </View>
            <View style={styles.statCard}>
              <Hash size={20} color={theme.primary} />
              <Text style={styles.statLabel}>Cantidad</Text>
              <Text style={styles.statValue}>{item.quantity} cabezas</Text>
            </View>
            <View style={styles.statCard}>
              <DollarSign size={20} color={theme.primary} />
              <Text style={styles.statLabel}>Precio/lb</Text>
              <Text style={styles.statValue}>${item.price_per_lb}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>
            {item.description || 'Sin descripción detallada.'}
          </Text>

          {(item.guide_url || item.certificate_url) && (
            <>
              <Text style={styles.sectionTitle}>Documentación</Text>
              <View style={styles.docContainer}>
                {item.guide_url && (
                  <TouchableOpacity style={styles.docItem} onPress={() => openDocument(item.guide_url)}>
                    <View style={styles.docIconContainer}>
                      <FileText size={24} color={theme.primary} />
                    </View>
                    <View style={styles.docInfo}>
                      <Text style={styles.docLabel}>Guía de Movilización</Text>
                      <Text style={styles.docSub}>Ver documento legal</Text>
                    </View>
                    <ChevronRight size={20} color={theme.text.muted} />
                  </TouchableOpacity>
                )}
                {item.certificate_url && (
                  <TouchableOpacity style={styles.docItem} onPress={() => openDocument(item.certificate_url)}>
                    <View style={styles.docIconContainer}>
                      <FileText size={24} color={theme.primary} />
                    </View>
                    <View style={styles.docInfo}>
                      <Text style={styles.docLabel}>Certificado Sanitario</Text>
                      <Text style={styles.docSub}>Ver certificado de vacunación</Text>
                    </View>
                    <ChevronRight size={20} color={theme.text.muted} />
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

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
          <TouchableOpacity style={styles.closeModal} onPress={() => setSelectedImage(null)}>
            <X color="white" size={32} />
          </TouchableOpacity>
          <ScrollView minimumZoomScale={1} maximumZoomScale={5} centerContent={true} contentContainerStyle={styles.zoomContainer}>
            {selectedImage && <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
