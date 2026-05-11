import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  FlatList 
} from 'react-native';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Bookmark,
  Link,
  Flag
} from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Post } from '../hooks/useSocialFeed';
import { mediaUrl } from '../config/api';

import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onOptions: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  onOptions 
}) => {
  const { theme } = useTheme();
  const [showFullText, setShowFullText] = useState(false);
  const isLongText = post.content.length > 150;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.background,
      marginHorizontal: 12,
      marginTop: 12,
      borderRadius: 16,
      overflow: 'hidden',
      // Shadow for iOS
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      // Elevation for Android
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    avatarPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    userName: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text.primary,
    },
    timeAgo: {
      fontSize: 12,
      color: theme.text.muted,
    },
    body: {
      paddingHorizontal: 12,
      paddingBottom: 12,
    },
    content: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.text.primary,
    },
    seeMore: {
      color: theme.primary,
      fontSize: 14,
      fontWeight: '500',
      marginTop: 4,
    },
    mediaContainer: {
      width: width,
      height: width * 0.8,
      backgroundColor: theme.surface,
    },
    mediaImage: {
      width: width,
      height: '100%',
    },
    paginationDot: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    paginationText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: theme.surface,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    actionText: {
      fontSize: 14,
      color: theme.text.secondary,
      fontWeight: '500',
    },
    activeText: {
      color: theme.error,
    },
  });

  const renderMedia = () => {
    if (!post.media_urls || post.media_urls.length === 0) return null;

    return (
      <View style={styles.mediaContainer}>
        <FlatList
          data={post.media_urls}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Image 
              source={{ uri: mediaUrl(item) }} 
              style={styles.mediaImage} 
              resizeMode="cover"
            />
          )}
        />
        {post.media_urls.length > 1 && (
          <View style={styles.paginationDot}>
            <Text style={styles.paginationText}>1/{post.media_urls.length}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {post.user.first_name?.[0] || 'U'}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>
              {post.user.first_name} {post.user.last_name}
            </Text>
            <Text style={styles.timeAgo}>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: es })}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onOptions} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MoreHorizontal size={20} color={theme.text.muted} />
        </TouchableOpacity>
      </View>

      {/* Body and Media (Tappable to go to details) */}
      <TouchableOpacity activeOpacity={0.9} onPress={onComment}>
        <View style={styles.body}>
          <Text style={styles.content} numberOfLines={showFullText ? undefined : 4}>
            {post.content}
          </Text>
          {isLongText && (
            <TouchableOpacity onPress={() => setShowFullText(!showFullText)}>
              <Text style={styles.seeMore}>
                {showFullText ? 'Ver menos' : 'Ver más'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Media */}
        {renderMedia()}
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onLike} style={styles.actionButton}>
            <Animatable.View animation={post.isLiked ? 'pulse' : undefined} duration={300}>
              <Heart 
                size={22} 
                color={post.isLiked ? theme.error : theme.text.secondary} 
                fill={post.isLiked ? theme.error : 'transparent'}
              />
            </Animatable.View>
            <Text style={[styles.actionText, post.isLiked && styles.activeText]}>
              {post._count.interactions}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onComment} style={styles.actionButton}>
            <MessageCircle size={22} color={theme.text.secondary} />
            <Text style={styles.actionText}>{post._count.comments}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onShare} style={styles.actionButton}>
          <Share2 size={22} color={theme.text.secondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
