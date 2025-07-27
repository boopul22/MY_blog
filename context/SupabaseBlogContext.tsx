import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Post, Category, Tag } from '../types';
import { postsService, categoriesService, tagsService, authService } from '../services/supabaseService';
import { ImageSizes } from '../services/imageService';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface BlogContextType {
  posts: Post[];
  categories: Category[];
  tags: Tag[];
  isAdmin: boolean;
  loading: boolean;
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
  const [tags, setTags] = useState<Tag[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeChannels, setRealtimeChannels] = useState<RealtimeChannel[]>([]);

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

      // Check authentication state
      const session = await authService.getSession();
      setIsAdmin(!!session?.user);

      // Load initial data
      await refreshData();

      // Set up auth state listener
      authService.onAuthStateChange((event, session) => {
        setIsAdmin(!!session?.user);
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
      const [postsData, categoriesData, tagsData] = await Promise.all([
        postsService.getAllPosts(),
        categoriesService.getAllCategories(),
        tagsService.getAllTags(),
      ]);

      setPosts(postsData);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (err) {
      console.error('Failed to refresh data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    }
  };

  const setupRealtimeSubscriptions = () => {
    const channels: RealtimeChannel[] = [];

    // Subscribe to posts changes
    const postsChannel = postsService.subscribeToChanges((payload) => {
      console.log('Posts change:', payload);
      refreshData(); // Simple approach: refresh all data on any change
    });
    channels.push(postsChannel);

    // Subscribe to categories changes
    const categoriesChannel = categoriesService.subscribeToChanges((payload) => {
      console.log('Categories change:', payload);
      refreshData();
    });
    channels.push(categoriesChannel);

    // Subscribe to tags changes
    const tagsChannel = tagsService.subscribeToChanges((payload) => {
      console.log('Tags change:', payload);
      refreshData();
    });
    channels.push(tagsChannel);

    setRealtimeChannels(channels);
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
      setError(null);
      const newPost = await postsService.addPost(post);
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      console.error('Failed to add post:', err);
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