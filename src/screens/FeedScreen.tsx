import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react-native';
import { COLORS, MOCK_DATA } from '../theme/constants';

export const FeedScreen = () => {
  const renderItem = ({ item }: { item: typeof MOCK_DATA.feed[0] }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{item.user[0]}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.userName}>{item.user}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <TouchableOpacity>
          <MoreHorizontal color={COLORS.text.secondary} size={20} />
        </TouchableOpacity>
      </View>
      <Text style={styles.description}>{item.text}</Text>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Heart color={COLORS.text.secondary} size={22} />
          <Text style={styles.actionText}>Me gusta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <MessageCircle color={COLORS.text.secondary} size={22} />
          <Text style={styles.actionText}>Comentar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Share2 color={COLORS.text.secondary} size={22} />
          <Text style={styles.actionText}>Compartir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={MOCK_DATA.feed}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: COLORS.background },
  card: { backgroundColor: COLORS.background, borderRadius: 20, marginBottom: 24, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: 'white', fontWeight: 'bold' },
  headerText: { flex: 1, marginLeft: 12 },
  userName: { fontWeight: '700', fontSize: 16, color: COLORS.text.primary },
  time: { fontSize: 13, color: COLORS.text.secondary },
  description: { fontSize: 15, lineHeight: 22, color: COLORS.text.primary, marginBottom: 12 },
  image: { width: '100%', height: 300, borderRadius: 16, marginBottom: 16 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.surface, paddingTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 13, color: COLORS.text.secondary, fontWeight: '500' }
});
