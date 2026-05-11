import React, { useState, useContext, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet, 
  RefreshControl,
  Text,
  SafeAreaView,
  Share,
  TouchableOpacity
} from 'react-native';
import { useSocialFeed, Post } from '../hooks/useSocialFeed';
import { PostCard } from '../components/PostCard';
import { OptionsBottomSheet } from '../components/OptionsBottomSheet';
import { AuthContext } from '../context/AuthContext';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../context/ThemeContext';
import { useAlert } from '../context/AlertContext';
import { Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const CommunityScreen: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();
  const { showAlert } = useAlert();
  const navigation = useNavigation<any>();
  const { 
    posts, 
    isLoading, 
    isRefreshing, 
    onRefresh, 
    loadMore, 
    toggleInteraction,
    deletePost,
    reportPost,
    error 
  } = useSocialFeed();

  // BottomSheet State
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);

  // Manejo estandarizado de errores
  useEffect(() => {
    if (error) {
      showAlert({
        title: 'Error de Red',
        message: error,
        type: 'error'
      });
    }
  }, [error, showAlert]);

  const handleOpenOptions = (post: Post) => {
    setSelectedPost(post);
    setIsOptionsVisible(true);
  };

  const handleShare = async (post: Post) => {
    try {
      await Share.share({
        message: `Mira esta publicación en Arreos: https://arreos.fregodesigns.com/p/${post.shortId}`,
      });
    } catch (error) {
      console.error('Error sharing', error);
    }
  };

  const handleCopyLink = async () => {
    if (selectedPost) {
      await Clipboard.setStringAsync(`https://arreos.fregodesigns.com/p/${selectedPost.shortId}`);
      setIsOptionsVisible(false);
      showAlert({
        title: '¡Enlace Copiado!',
        message: 'El enlace se ha guardado en tu portapapeles.',
        type: 'success'
      });
    }
  };

  const handleReport = () => {
    setIsOptionsVisible(false);
    showAlert({
      title: 'Reportar publicación',
      message: '¿Estás seguro de que deseas reportar este contenido por ser inapropiado?',
      type: 'warning',
      showCancel: true,
      onConfirm: async () => {
        if (selectedPost) {
          const success = await reportPost(selectedPost.id, 'Contenido inapropiado reportado por usuario');
          if (success) {
            showAlert({
              title: 'Reporte Recibido',
              message: 'Nuestro equipo revisará la publicación a la brevedad. Gracias por ayudarnos a mantener la comunidad segura.',
              type: 'success'
            });
          } else {
            showAlert({ title: 'Error', message: 'No se pudo enviar el reporte.', type: 'error' });
          }
        }
      }
    });
  };

  const handleDelete = () => {
    setIsOptionsVisible(false);
    showAlert({
      title: 'Eliminar publicación',
      message: '¿Estás seguro de que deseas eliminar esta publicación permanentemente?',
      type: 'warning',
      showCancel: true,
      onConfirm: async () => {
        if (selectedPost) {
          const success = await deletePost(selectedPost.id);
          if (success) {
            showAlert({ title: 'Eliminada', message: 'Tu publicación fue eliminada.', type: 'success' });
          } else {
            showAlert({ title: 'Error', message: 'No se pudo eliminar la publicación.', type: 'error' });
          }
        }
      }
    });
  };

  const handleSavePost = async () => {
    if (selectedPost) {
      setIsOptionsVisible(false);
      await toggleInteraction(selectedPost.id, 'BOOKMARK');
      showAlert({
        title: 'Guardado',
        message: 'La publicación se ha guardado en tus elementos.',
        type: 'success'
      });
    }
  };

  const renderItem = ({ item }: { item: Post }) => (
    <PostCard 
      post={item}
      onLike={() => toggleInteraction(item.id, 'LIKE')}
      onComment={() => navigation.navigate('PostDetail', { post: item })}
      onShare={() => handleShare(item)}
      onOptions={() => handleOpenOptions(item)}
    />
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.loaderFooter}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading && !isRefreshing) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.text.muted }]}>No hay publicaciones aún.</Text>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.surface,
    },
    loaderFooter: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 100,
    },
    emptyText: {
      fontSize: 16,
    },
    listEmpty: {
      flex: 1,
    },
    fab: {
      position: 'absolute',
      right: 20,
      bottom: 20,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[theme.primary]} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          { paddingBottom: 100 },
          posts.length === 0 ? styles.listEmpty : undefined
        ]}
      />

      <TouchableOpacity 
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Plus color="#FFFFFF" size={28} strokeWidth={2.5} />
      </TouchableOpacity>

      <OptionsBottomSheet 
        isVisible={isOptionsVisible}
        onClose={() => setIsOptionsVisible(false)}
        onSave={handleSavePost}
        onCopyLink={handleCopyLink}
        onReport={handleReport}
        onDelete={handleDelete}
        isOwner={selectedPost?.userId === user?.id}
      />
    </SafeAreaView>
  );
};
