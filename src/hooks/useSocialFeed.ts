import { useState, useEffect, useCallback } from 'react';
import { api, getApiErrorMessage } from '../api/client';

export interface Post {
  id: string;
  shortId: string;
  userId: string;
  content: string;
  media_urls: string[];
  createdAt: string;
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
  _count: {
    comments: number;
    interactions: number;
  };
  isLiked?: boolean; // Estado local para UI
  isBookmarked?: boolean; // Estado local para UI
}

interface SocialFeedResponse {
  posts: Post[];
  nextCursor: string | null;
}

export const useSocialFeed = (limit = 10) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = useCallback(async (currentCursor: string | null, isRefresh = false) => {
    if (isLoading || (!hasMore && !isRefresh)) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<SocialFeedResponse>('/api/social/posts', {
        params: {
          cursor: currentCursor,
          limit,
        },
      });

      const newPosts = response.data.posts;
      const nextCursor = response.data.nextCursor;

      setPosts(prev => isRefresh ? newPosts : [...prev, ...newPosts]);
      setCursor(nextCursor);
      setHasMore(!!nextCursor);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo cargar el feed'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isLoading, hasMore, limit]);

  const onRefresh = () => {
    setIsRefreshing(true);
    setHasMore(true);
    fetchFeed(null, true);
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      fetchFeed(cursor);
    }
  };

  const toggleInteraction = async (postId: string, type: 'LIKE' | 'BOOKMARK') => {
    // 1. Optimistic Update
    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === postId) {
          const isLiked = type === 'LIKE' ? !post.isLiked : post.isLiked;
          const isBookmarked = type === 'BOOKMARK' ? !post.isBookmarked : post.isBookmarked;
          const countChange = type === 'LIKE' ? (isLiked ? 1 : -1) : 0;
          
          return {
            ...post,
            isLiked,
            isBookmarked,
            _count: {
              ...post._count,
              interactions: post._count.interactions + countChange
            }
          };
        }
        return post;
      })
    );

    try {
      await api.post(`/api/social/posts/${postId}/interaction`, { type });
    } catch (err) {
      // 2. Revert on error
      console.error('Error toggling interaction', err);
      // Opcional: recargar el feed o el post individual para sincronizar
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await api.delete(`/api/social/posts/${postId}`);
      setPosts(currentPosts => currentPosts.filter(p => p.id !== postId));
      return true;
    } catch (err) {
      console.error('Error deleting post:', err);
      return false;
    }
  };

  const reportPost = async (postId: string, reason: string) => {
    try {
      await api.post(`/api/social/posts/${postId}/report`, { reason });
      return true;
    } catch (err) {
      console.error('Error reporting post:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchFeed(null, true);
  }, []);

  return {
    posts,
    isLoading,
    isRefreshing,
    error,
    hasMore,
    onRefresh,
    loadMore,
    toggleInteraction,
    deletePost,
    reportPost,
  };
};
