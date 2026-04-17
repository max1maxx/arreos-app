import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import { Heart, MessageCircle, Share2, UserPlus, Phone } from 'lucide-react-native';
import { COLORS } from '../theme/constants';

const { width, height } = Dimensions.get('window');

export const VideoReelScreen = () => {
  return (
    <View style={styles.container}>
      {/* Simulación de Video con Imagen a pantalla completa */}
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?q=80&w=1000&auto=format&fit=crop' }} 
        style={styles.fullScreenVideo}
      />
      
      {/* Overlay de información */}
      <View style={styles.overlay}>
        <View style={styles.infoContainer}>
          <View style={styles.userInfo}>
            <View style={styles.avatar} />
            <Text style={styles.userName}>Rancho El Porvenir</Text>
            <TouchableOpacity style={styles.followBtn}>
              <Text style={styles.followText}>Seguir</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.lotName}>Lote #402: Novillos de Registro</Text>
          <Text style={styles.price}>Precio: $32.50 / kg</Text>
          <TouchableOpacity style={styles.contactBtn}>
            <Phone size={18} color="white" />
            <Text style={styles.contactText}>Contactar Vendedor</Text>
          </TouchableOpacity>
        </View>

        {/* Acciones laterales */}
        <View style={styles.sideActions}>
          <ActionItem Icon={Heart} count="1.2k" />
          <ActionItem Icon={MessageCircle} count="45" />
          <ActionItem Icon={Share2} count="128" />
        </View>
      </View>
    </View>
  );
};

const ActionItem = ({ Icon, count }: { Icon: any, count: string }) => (
  <TouchableOpacity style={styles.actionItem}>
    <View style={styles.iconCircle}>
      <Icon size={28} color="white" />
    </View>
    <Text style={styles.actionCount}>{count}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  fullScreenVideo: { width: width, height: height, position: 'absolute' },
  overlay: { flex: 1, justifyContent: 'flex-end', padding: 20, backgroundColor: 'rgba(0,0,0,0.2)' },
  infoContainer: { marginBottom: 40, gap: 12, flex: 1, justifyContent: 'flex-end' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#DDD' },
  userName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  followBtn: { borderWidth: 1, borderColor: 'white', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  followText: { color: 'white', fontSize: 12, fontWeight: '700' },
  lotName: { color: 'white', fontSize: 20, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4 },
  price: { color: COLORS.success, fontSize: 18, fontWeight: '700' },
  contactBtn: { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderRadius: 16, marginTop: 10 },
  contactText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  sideActions: { position: 'absolute', right: 16, bottom: 120, gap: 20 },
  actionItem: { alignItems: 'center', gap: 4 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  actionCount: { color: 'white', fontSize: 13, fontWeight: '700' }
});
