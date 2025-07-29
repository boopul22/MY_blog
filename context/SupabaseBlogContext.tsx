import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Post, Category, Tag } from '../types';
import { postsService, categoriesService, tagsService, authService } from '../services/supabaseService';
import { ImageSizes } from '../services/imageService';
import { useNonCriticalData } from '../hooks/useNonCriticalData';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface BlogContextType {
  posts: Post[];
  categories: Category[];
  tags: Tag[];
  isAdmin: boolean;
  loading: boolean;
  criticalDataLoaded: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getPost: (id: string) => Post | undefined;
  getPostBySlug: (slug: string) => Post | undefined;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'slug' | 'authorName'>) => Promise<Post>;
  updatePost: (id: string, post: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addTag: (name: string) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  searchPosts: (query: string) => Promise<Post[]>;
  uploadPostImage: (file: File, postId?: string) => Promise<ImageSizes>;
  deletePostImage: (imageUrl: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const SupabaseBlogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [criticalDataLoaded, setCriticalDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeChannels, setRealtimeChannels] = useState<RealtimeChannel[]>([]);

  // Load non-critical data (tags, etc.) off the critical path
  const { tags } = useNonCriticalData(isAdmin);

  // Initialize data and auth state
  useEffect(() => {
    initializeApp();
    setupRealtimeSubscriptions();
    
    // Cleanup subscriptions on unmount
    return () => {
      realtimeChannels.forEach(channel => channel.unsubscribe());
    };
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load critical data first (published posts for homepage)
      const publishedPosts = await postsService.getPublishedPosts(12);
      setPosts(publishedPosts);
      setCriticalDataLoaded(true);

      // Load non-critical data in parallel (don't block UI)
      Promise.all([
        authService.getSession(),
        categoriesService.getAllCategories(),
      ]).then(async ([session, categoriesData]) => {
        const isAdminUser = !!session?.user;
        setIsAdmin(isAdminUser);
        setCategories(categoriesData);

        // Load tags only for admin users (non-critical)
        if (isAdminUser) {
          tagsService.getAllTags().then(tagsData => {
            setTags(tagsData);
          }).catch(err => console.error('Failed to load tags:', err));
        }

        // If admin, load full posts data
        if (isAdminUser) {
          const allPosts = await postsService.getAllPosts();
          setPosts(allPosts);
        }

        // Set up auth state listener
        authService.onAuthStateChange((event, session) => {
          setIsAdmin(!!session?.user);
        });
      }).catch(err => {
        console.error('Failed to load non-critical data:', err);
        // Don't set error for non-critical data failures
      });

    } catch (err) {
      console.error('Failed to initialize app:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize app');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      if (isAdmin) {
        // Admin needs all data
        const [postsData, categoriesData, tagsData] = await Promise.all([
          postsService.getAllPosts(),
          categoriesService.getAllCategories(),
          tagsService.getAllTags(),
        ]);
        setPosts(postsData);
        setCategories(categoriesData);
        setTags(tagsData);
      } else {
        // Public users only need published posts and categories
        const [postsData, categoriesData] = await Promise.all([
          postsService.getPublishedPosts(50), // Load more for all-posts page
          categoriesService.getAllCategories(),
        ]);
        setPosts(postsData);
        setCategories(categoriesData);
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Defer realtime subscriptions to not block initial render
    setTimeout(() => {
      const channels: RealtimeChannel[] = [];

      // Subscribe to posts changes
      const postsChannel = postsService.subscribeToChanges((payload) => {
        console.log('Posts change:', payload);
        // Only refresh if user is admin or if it's a published post change
        if (isAdmin || payload.new?.status === 'published') {
          refreshData();
        }
      });
      channels.push(postsChannel);

      // Subscribe to categories changes (only if admin)
      if (isAdmin) {
        const categoriesChannel = categoriesService.subscribeToChanges((payload) => {
          console.log('Categories change:', payload);
          refreshData();
        });
        channels.push(categoriesChannel);

        // Subscribe to tags changes (only if admin)
        const tagsChannel = tagsService.subscribeToChanges((payload) => {
          console.log('Tags change:', payload);
          refreshData();
        });
        channels.push(tagsChannel);
      }

      setRealtimeChannels(channels);
    }, 2000); // Delay by 2 seconds to not interfere with critical path
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await authService.signIn(email, password);
      setIsAdmin(true);
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await authService.signOut();
      setIsAdmin(false);
    } catch (err) {
      console.error('Logout failed:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
      throw err;
    }
  };

  const getPost = (id: string) => posts.find(p => p.id === id);
  const getPostBySlug = (slug: string) => posts.find(p => p.slug === slug);

  const addPost = async (post: Omit<Post, 'id' | 'createdAt' | 'slug' | 'authorName'>) => {
    try {
      console.log('SupabaseBlogContext.addPost called with:', post);
      console.log('Current isAdmin state:', isAdmin);
      setError(null);
      const newPost = await postsService.addPost(post);
      console.log('Post service returned:', newPost);
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      console.error('Failed to add post in context:', err);
      console.error('Error type:', typeof err);
      console.error('Error message:', err instanceof Error ? err.message : 'Unknown error');
      setError(err instanceof Error ? err.message : 'Failed to add post');
      throw err;
    }
  };

  const updatePost = async (id: string, postUpdate: Partial<Post>) => {
    try {
      setError(null);
      await postsService.updatePost(id, postUpdate);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, ...postUpdate } : p));
    } catch (err) {
      console.error('Failed to update post:', err);
      setError(err instanceof Error ? err.message : 'Failed to update post');
      throw err;
    }
  };

  const deletePost = async (id: string) => {
    try {
      setError(null);
      await postsService.deletePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete post:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete post');
      throw err;
    }
  };

  const addCategory = async (name: string) => {
    try {
      setError(null);
      const newCategory = await categoriesService.addCategory(name);
      setCategories(prev => [...prev, newCategory]);
    } catch (err) {
      console.error('Failed to add category:', err);
      setError(err instanceof Error ? err.message : 'Failed to add category');
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setError(null);
      await categoriesService.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete category:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      throw err;
    }
  };

  const addTag = async (name: string) => {
    try {
      setError(null);
      const newTag = await tagsService.addTag(name);
      setTags(prev => {
        // Check if tag already exists to avoid duplicates
        if (prev.some(t => t.id === newTag.id)) {
          return prev;
        }
        return [...prev, newTag];
      });
    } catch (err) {
      console.error('Failed to add tag:', err);
      setError(err instanceof Error ? err.message : 'Failed to add tag');
      throw err;
    }
  };

  const deleteTag = async (id: string) => {
    try {
      setError(null);
      await tagsService.deleteTag(id);
      setTags(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete tag:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete tag');
      throw err;
    }
  };

  const searchPosts = async (query: string): Promise<Post[]> => {
    try {
      setError(null);
      return await postsService.searchPosts(query);
    } catch (err) {
      console.error('Failed to search posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to search posts');
      throw err;
    }
  };

  const uploadPostImage = async (file: File, postId?: string): Promise<ImageSizes> => {
    try {
      setError(null);
      return await postsService.uploadPostImage(file, postId);
    } catch (err) {
      console.error('Failed to upload image:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      throw err;
    }
  };

  const deletePostImage = async (imageUrl: string): Promise<void> => {
    try {
      setError(null);
      await postsService.deletePostImage(imageUrl);
    } catch (err) {
      console.error('Failed to delete image:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete image');
      throw err;
    }
  };

  return (
    <BlogContext.Provider value={{
      posts,
      categories,
      tags,
      isAdmin,
      loading,
      criticalDataLoaded,
      error,
      login,
      logout,
      getPost,
      getPostBySlug,
      addPost,
      updatePost,
      deletePost,
      addCategory,
      deleteCategory,
      addTag,
      deleteTag,
      searchPosts,
      uploadPostImage,
      deletePostImage,
      refreshData,
    }}>
      {children}
    </BlogContext.Provider>
  );
};