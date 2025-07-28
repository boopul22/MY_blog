import { supabase } from '../lib/supabase';
import { PostType } from '../types';

export class PostTypeService {
  async getAllPostTypes(): Promise<PostType[]> {
    const { data, error } = await supabase
      .from('post_types')
      .select('*')
      .order('menu_position', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch post types: ${error.message}`);
    }

    return data.map(this.mapSupabasePostType);
  }

  async getPostType(name: string): Promise<PostType | null> {
    const { data, error } = await supabase
      .from('post_types')
      .select('*')
      .eq('name', name)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch post type: ${error.message}`);
    }

    return this.mapSupabasePostType(data);
  }

  async createPostType(postType: Omit<PostType, 'id' | 'createdAt' | 'updatedAt'>): Promise<PostType> {
    const { data, error } = await supabase
      .from('post_types')
      .insert({
        name: postType.name,
        label: postType.label,
        description: postType.description,
        public: postType.public,
        hierarchical: postType.hierarchical,
        supports: postType.supports,
        menu_position: postType.menuPosition,
        menu_icon: postType.menuIcon
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create post type: ${error.message}`);
    }

    return this.mapSupabasePostType(data);
  }

  async updatePostType(name: string, updates: Partial<PostType>): Promise<PostType> {
    const updateData: any = {};
    
    if (updates.label !== undefined) updateData.label = updates.label;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.public !== undefined) updateData.public = updates.public;
    if (updates.hierarchical !== undefined) updateData.hierarchical = updates.hierarchical;
    if (updates.supports !== undefined) updateData.supports = updates.supports;
    if (updates.menuPosition !== undefined) updateData.menu_position = updates.menuPosition;
    if (updates.menuIcon !== undefined) updateData.menu_icon = updates.menuIcon;

    const { data, error } = await supabase
      .from('post_types')
      .update(updateData)
      .eq('name', name)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update post type: ${error.message}`);
    }

    return this.mapSupabasePostType(data);
  }

  async deletePostType(name: string): Promise<void> {
    // Prevent deletion of built-in post types
    if (['post', 'page'].includes(name)) {
      throw new Error('Cannot delete built-in post types');
    }

    const { error } = await supabase
      .from('post_types')
      .delete()
      .eq('name', name);

    if (error) {
      throw new Error(`Failed to delete post type: ${error.message}`);
    }
  }

  async getPostsByType(postType: string, options: {
    status?: string[];
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  } = {}): Promise<{ posts: any[]; total: number }> {
    let query = supabase
      .from('posts')
      .select('*, categories(name, slug)', { count: 'exact' })
      .eq('post_type', postType);

    if (options.status && options.status.length > 0) {
      query = query.in('status', options.status);
    }

    if (options.orderBy) {
      query = query.order(options.orderBy, { 
        ascending: options.orderDirection === 'asc' 
      });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }

    return {
      posts: data || [],
      total: count || 0
    };
  }

  async getPostTypeCapabilities(postType: string): Promise<{
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canPublish: boolean;
    supports: string[];
  }> {
    const type = await this.getPostType(postType);
    
    if (!type) {
      throw new Error('Post type not found');
    }

    // For now, return basic capabilities
    // In a real application, this would check user permissions
    return {
      canCreate: true,
      canEdit: true,
      canDelete: !['post', 'page'].includes(postType), // Can't delete built-in types
      canPublish: true,
      supports: type.supports
    };
  }

  private mapSupabasePostType(data: any): PostType {
    return {
      id: data.id,
      name: data.name,
      label: data.label,
      description: data.description,
      public: data.public,
      hierarchical: data.hierarchical,
      supports: data.supports || [],
      menuPosition: data.menu_position,
      menuIcon: data.menu_icon,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  // Utility methods for post type features
  getDefaultSupports(): string[] {
    return ['title', 'content', 'author', 'thumbnail', 'excerpt'];
  }

  getAllSupportOptions(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'title', label: 'Title', description: 'Post title field' },
      { value: 'content', label: 'Content', description: 'Main content editor' },
      { value: 'excerpt', label: 'Excerpt', description: 'Short description field' },
      { value: 'author', label: 'Author', description: 'Author information' },
      { value: 'thumbnail', label: 'Featured Image', description: 'Featured image support' },
      { value: 'comments', label: 'Comments', description: 'Comment system' },
      { value: 'tags', label: 'Tags', description: 'Tag taxonomy' },
      { value: 'categories', label: 'Categories', description: 'Category taxonomy' },
      { value: 'custom-fields', label: 'Custom Fields', description: 'Additional metadata fields' },
      { value: 'revisions', label: 'Revisions', description: 'Version history' },
      { value: 'page-attributes', label: 'Page Attributes', description: 'Menu order, parent page' },
      { value: 'post-formats', label: 'Post Formats', description: 'Different post formats' }
    ];
  }

  getMenuIcons(): Array<{ value: string; label: string }> {
    return [
      { value: 'dashicons-admin-post', label: 'Post' },
      { value: 'dashicons-admin-page', label: 'Page' },
      { value: 'dashicons-portfolio', label: 'Portfolio' },
      { value: 'dashicons-products', label: 'Products' },
      { value: 'dashicons-camera', label: 'Gallery' },
      { value: 'dashicons-video-alt3', label: 'Video' },
      { value: 'dashicons-format-audio', label: 'Audio' },
      { value: 'dashicons-book', label: 'Documentation' },
      { value: 'dashicons-testimonial', label: 'Testimonials' },
      { value: 'dashicons-groups', label: 'Team' },
      { value: 'dashicons-calendar-alt', label: 'Events' },
      { value: 'dashicons-location', label: 'Locations' },
      { value: 'dashicons-star-filled', label: 'Reviews' },
      { value: 'dashicons-admin-generic', label: 'Generic' }
    ];
  }

  validatePostTypeName(name: string): { valid: boolean; error?: string } {
    if (!name) {
      return { valid: false, error: 'Post type name is required' };
    }

    if (name.length > 20) {
      return { valid: false, error: 'Post type name must be 20 characters or less' };
    }

    if (!/^[a-z0-9_-]+$/.test(name)) {
      return { valid: false, error: 'Post type name can only contain lowercase letters, numbers, hyphens, and underscores' };
    }

    const reservedNames = ['post', 'page', 'attachment', 'revision', 'nav_menu_item'];
    if (reservedNames.includes(name)) {
      return { valid: false, error: 'This name is reserved and cannot be used' };
    }

    return { valid: true };
  }
}

export const postTypeService = new PostTypeService();
