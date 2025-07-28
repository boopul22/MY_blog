import { supabase } from '../lib/supabase';
import { Post, Category, Tag } from '../types';
import type { Database, Tables } from '../lib/supabase';
import { imageService, ImageSizes } from './imageService';

// Helper function to convert database post to frontend post format
const convertDbPostToPost = (dbPost: Tables<'posts'>, tags: Tag[] = []): Post => {
  return {
    id: dbPost.id,
    title: dbPost.title,
    content: dbPost.content,
    slug: dbPost.slug,
    imageUrl: dbPost.image_url || undefined,
    status: dbPost.status,
    seoTitle: dbPost.seo_title,
    seoDescription: dbPost.seo_description,
    metaKeywords: dbPost.meta_keywords || undefined,
    categoryId: dbPost.category_id,
    tags: tags.map(tag => tag.id),
    createdAt: dbPost.created_at,
    authorName: dbPost.author_name,
  };
};

// Helper function to convert database category to frontend category format
const convertDbCategoryToCategory = (dbCategory: Tables<'categories'>): Category => {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    slug: dbCategory.slug,
  };
};

// Helper function to convert database tag to frontend tag format
const convertDbTagToTag = (dbTag: Tables<'tags'>): Tag => {
  return {
    id: dbTag.id,
    name: dbTag.name,
  };
};

// Helper function to create slug from title
const slugify = (text: string) => 
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

// Posts service
export const postsService = {
  // Get all posts with their tags
  async getAllPosts(): Promise<Post[]> {
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        post_tags (
          tag_id,
          tags (
            id,
            name
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return posts.map(post => {
      const tags = post.post_tags?.map((pt: any) => pt.tags).filter(Boolean) || [];
      return convertDbPostToPost(post, tags as Tag[]);
    });
  },

  // Get published posts only
  async getPublishedPosts(): Promise<Post[]> {
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        post_tags (
          tag_id,
          tags (
            id,
            name
          )
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return posts.map(post => {
      const tags = post.post_tags?.map((pt: any) => pt.tags).filter(Boolean) || [];
      return convertDbPostToPost(post, tags as Tag[]);
    });
  },

  // Get post by ID
  async getPostById(id: string): Promise<Post | null> {
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        post_tags (
          tag_id,
          tags (
            id,
            name
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    const tags = post.post_tags?.map((pt: any) => pt.tags).filter(Boolean) || [];
    return convertDbPostToPost(post, tags as Tag[]);
  },

  // Get post by slug
  async getPostBySlug(slug: string): Promise<Post | null> {
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        post_tags (
          tag_id,
          tags (
            id,
            name
          )
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    const tags = post.post_tags?.map((pt: any) => pt.tags).filter(Boolean) || [];
    return convertDbPostToPost(post, tags as Tag[]);
  },

  // Add new post
  async addPost(post: Omit<Post, 'id' | 'createdAt' | 'slug' | 'authorName'>): Promise<Post> {
    console.log('postsService.addPost called with:', post);
    const slug = slugify(post.title);
    console.log('Generated slug:', slug);

    const insertData = {
      title: post.title,
      content: post.content,
      slug,
      image_url: post.imageUrl || null,
      status: post.status,
      seo_title: post.seoTitle,
      seo_description: post.seoDescription,
      category_id: post.categoryId,
      author_name: 'Admin',
    };
    console.log('Insert data:', insertData);

    const { data: newPost, error } = await supabase
      .from('posts')
      .insert(insertData)
      .select()
      .single();

    console.log('Supabase insert result:', { data: newPost, error });
    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    // Add tags if any
    if (post.tags && post.tags.length > 0) {
      const tagInserts = post.tags.map(tagId => ({
        post_id: newPost.id,
        tag_id: tagId,
      }));

      const { error: tagError } = await supabase
        .from('post_tags')
        .insert(tagInserts);

      if (tagError) throw tagError;
    }

    // Get the complete post with tags
    const completePost = await this.getPostById(newPost.id);
    if (!completePost) throw new Error('Failed to retrieve created post');

    return completePost;
  },

  // Update post
  async updatePost(id: string, postUpdate: Partial<Post>): Promise<void> {
    const updateData: any = {};
    
    if (postUpdate.title !== undefined) {
      updateData.title = postUpdate.title;
      updateData.slug = slugify(postUpdate.title);
    }
    if (postUpdate.content !== undefined) updateData.content = postUpdate.content;
    if (postUpdate.imageUrl !== undefined) updateData.image_url = postUpdate.imageUrl;
    if (postUpdate.status !== undefined) updateData.status = postUpdate.status;
    if (postUpdate.seoTitle !== undefined) updateData.seo_title = postUpdate.seoTitle;
    if (postUpdate.seoDescription !== undefined) updateData.seo_description = postUpdate.seoDescription;
    if (postUpdate.categoryId !== undefined) updateData.category_id = postUpdate.categoryId;
    if (postUpdate.authorName !== undefined) updateData.author_name = postUpdate.authorName;

    const { error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    // Update tags if provided
    if (postUpdate.tags !== undefined) {
      // Delete existing tags
      await supabase
        .from('post_tags')
        .delete()
        .eq('post_id', id);

      // Insert new tags
      if (postUpdate.tags.length > 0) {
        const tagInserts = postUpdate.tags.map(tagId => ({
          post_id: id,
          tag_id: tagId,
        }));

        const { error: tagError } = await supabase
          .from('post_tags')
          .insert(tagInserts);

        if (tagError) throw tagError;
      }
    }
  },

  // Delete post
  async deletePost(id: string): Promise<void> {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Semantic search using vector similarity
  async searchPosts(query: string, threshold: number = 0.78, limit: number = 10): Promise<Post[]> {
    // This would require generating embeddings for the query
    // For now, we'll implement a simple text search as a fallback
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        post_tags (
          tag_id,
          tags (
            id,
            name
          )
        )
      `)
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return posts.map(post => {
      const tags = post.post_tags?.map((pt: any) => pt.tags).filter(Boolean) || [];
      return convertDbPostToPost(post, tags as Tag[]);
    });
  },

  // Upload image for post
  async uploadPostImage(file: File, postId?: string): Promise<ImageSizes> {
    try {
      const folder = postId ? `posts/${postId}` : 'posts/temp';
      return await imageService.uploadImage(file, folder);
    } catch (error) {
      console.error('Error uploading post image:', error);
      throw error;
    }
  },

  // Delete post image
  async deletePostImage(imageUrl: string): Promise<void> {
    try {
      // Extract base path from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const folder = pathParts[pathParts.length - 2];
      
      // Remove size suffix and extension to get base path
      const baseName = fileName.replace(/-(thumbnail|medium|large|original)\.webp$/, '');
      const basePath = `${folder}/${baseName}`;
      
      await imageService.deleteImage(basePath);
    } catch (error) {
      console.error('Error deleting post image:', error);
      throw error;
    }
  },

  // Subscribe to real-time changes
  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('posts_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'posts' }, 
        callback
      )
      .subscribe();
  },
};

// Categories service
export const categoriesService = {
  // Get all categories
  async getAllCategories(): Promise<Category[]> {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;

    return categories.map(convertDbCategoryToCategory);
  },

  // Add new category
  async addCategory(name: string): Promise<Category> {
    const slug = slugify(name);
    
    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert({ name, slug })
      .select()
      .single();

    if (error) throw error;

    return convertDbCategoryToCategory(newCategory);
  },

  // Delete category
  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Subscribe to real-time changes
  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('categories_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'categories' }, 
        callback
      )
      .subscribe();
  },
};

// Tags service
export const tagsService = {
  // Get all tags
  async getAllTags(): Promise<Tag[]> {
    const { data: tags, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) throw error;

    return tags.map(convertDbTagToTag);
  },

  // Add new tag
  async addTag(name: string): Promise<Tag> {
    // Check if tag already exists
    const { data: existingTag } = await supabase
      .from('tags')
      .select('*')
      .ilike('name', name)
      .single();

    if (existingTag) {
      return convertDbTagToTag(existingTag);
    }

    const { data: newTag, error } = await supabase
      .from('tags')
      .insert({ name })
      .select()
      .single();

    if (error) throw error;

    return convertDbTagToTag(newTag);
  },

  // Delete tag
  async deleteTag(id: string): Promise<void> {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Subscribe to real-time changes
  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('tags_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tags' }, 
        callback
      )
      .subscribe();
  },
};

// Authentication service
export const authService = {
  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Subscribe to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};