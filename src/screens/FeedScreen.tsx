import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react-native';
import { MOCK_DATA } from '../theme/constants';
import { useTheme } from '../context/ThemeContext';

export const FeedScreen = () => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    list: { backgroundColor: theme.background },
    container: { padding: 16 },
    card: { backgroundColor: theme.background, borderRadius: 20, marginBottom: 24, borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: 16 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: 'white', fontWeight: 'bold' },
    headerText: { flex: 1, marginLeft: 12 },
    userName: { fontWeight: '700', fontSize: 16, color: theme.text.primary },
    time: { fontSize: 13, color: theme.text.secondary },
    description: { fontSize: 15, lineHeight: 22, color: theme.text.primary, marginBottom: 12 },
    image: { width: '100%', height: 300, borderRadius: 16, marginBottom: 16 },
    actions: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: theme.surface, paddingTop: 12 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    actionText: { fontSize: 13, color: theme.text.secondary, fontWeight: '500' }
  });

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
          <MoreHorizontal color={theme.text.secondary} size={20} />
        </TouchableOpacity>
      </View>
      <Text style={styles.description}>{item.description || item.text}</Text>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Heart color={theme.text.secondary} size={22} />
          <Text style={styles.actionText}>Me gusta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <MessageCircle color={theme.text.secondary} size={22} />
          <Text style={styles.actionText}>Comentar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Share2 color={theme.text.secondary} size={22} />
          <Text style={styles.actionText}>Compartir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.list}>
      <FlatList
        data={MOCK_DATA.feed}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
