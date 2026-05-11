import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { ChevronLeft, Send, MessageCircle } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { api, getApiErrorMessage } from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { PostCard } from '../components/PostCard';
import { Post } from '../hooks/useSocialFeed';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
}

export const PostDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useContext(AuthContext);
  const inputRef = useRef<TextInput>(null);
  
  const post = route.params?.post as Post;
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (post?.id) {
      fetchComments();
    }
  }, [post?.id]);

  const fetchComments = async () => {
    try {
      // Por ahora simulamos los comentarios o usamos los existentes si los hubiera
      setComments([]); 
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post(`/api/social/posts/${post.id}/comment`, {
        content: newComment.trim(),
      });
      
      const newCommentData: Comment = {
        id: response.data?.id || Date.now().toString(),
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
        user: {
          id: user?.id || '',
          first_name: user?.first_name || 'Yo',
          last_name: user?.last_name || '',
        }
      };

      setComments([newCommentData, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{item.user.first_name?.[0] || 'U'}</Text>
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.userName}>{item.user.first_name} {item.user.last_name}</Text>
          <Text style={styles.timeAgo}>
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: es })}
          </Text>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
      </View>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text.primary,
      marginLeft: 16,
    },
    commentContainer: {
      flexDirection: 'row',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.surface,
    },
    avatarPlaceholder: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    avatarText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.text.secondary,
    },
    commentContent: {
      flex: 1,
    },
    commentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    userName: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text.primary,
    },
    timeAgo: {
      fontSize: 12,
      color: theme.text.muted,
    },
    commentText: {
      fontSize: 14,
      color: theme.text.primary,
      lineHeight: 20,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.background,
    },
    input: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 15,
      color: theme.text.primary,
      maxHeight: 100,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 12,
    },
    sendButtonDisabled: {
      backgroundColor: theme.border,
    },
    emptyContainer: {
      padding: 40,
      alignItems: 'center',
    },
    emptyText: {
      marginTop: 12,
      fontSize: 15,
      color: theme.text.muted,
      textAlign: 'center',
    }
  });

  if (!post) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={28} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publicación</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={{ marginBottom: 8 }}>
              <PostCard 
                post={post}
                onLike={() => {}}
                onComment={() => inputRef.current?.focus()}
                onShare={() => {}}
                onOptions={() => {}}
              />
              <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                <Text style={{ fontWeight: '700', fontSize: 16, color: theme.text.primary }}>
                  Comentarios ({comments.length || post._count.comments})
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <MessageCircle size={40} color={theme.border} />
                <Text style={styles.emptyText}>Sé el primero en comentar esta publicación.</Text>
              </View>
            ) : <ActivityIndicator style={{ marginTop: 20 }} color={theme.primary} />
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Escribe un comentario..."
            placeholderTextColor={theme.text.muted}
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!newComment.trim() || isSubmitting) && styles.sendButtonDisabled]}
            onPress={handleAddComment}
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
