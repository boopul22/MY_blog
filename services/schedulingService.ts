import { supabase } from '../lib/supabase';
import { ScheduledPost, Post } from '../types';

export class SchedulingService {
  async schedulePost(postId: string, scheduledAt: Date): Promise<ScheduledPost> {
    // First, update the post status to 'scheduled'
    const { error: postError } = await supabase
      .from('posts')
      .update({ 
        status: 'scheduled',
        scheduled_at: scheduledAt.toISOString()
      })
      .eq('id', postId);

    if (postError) {
      throw new Error(`Failed to update post status: ${postError.message}`);
    }

    // Create scheduled post entry
    const { data, error } = await supabase
      .from('scheduled_posts')
      .insert({
        post_id: postId,
        scheduled_at: scheduledAt.toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to schedule post: ${error.message}`);
    }

    return this.mapSupabaseScheduledPost(data);
  }

  async unschedulePost(postId: string): Promise<void> {
    // Update post status back to draft
    const { error: postError } = await supabase
      .from('posts')
      .update({ 
        status: 'draft',
        scheduled_at: null
      })
      .eq('id', postId);

    if (postError) {
      throw new Error(`Failed to update post status: ${postError.message}`);
    }

    // Remove scheduled post entry
    const { error } = await supabase
      .from('scheduled_posts')
      .delete()
      .eq('post_id', postId)
      .eq('status', 'pending');

    if (error) {
      throw new Error(`Failed to unschedule post: ${error.message}`);
    }
  }

  async reschedulePost(postId: string, newScheduledAt: Date): Promise<ScheduledPost> {
    // Update post scheduled_at
    const { error: postError } = await supabase
      .from('posts')
      .update({ scheduled_at: newScheduledAt.toISOString() })
      .eq('id', postId);

    if (postError) {
      throw new Error(`Failed to update post schedule: ${postError.message}`);
    }

    // Update scheduled post entry
    const { data, error } = await supabase
      .from('scheduled_posts')
      .update({
        scheduled_at: newScheduledAt.toISOString(),
        status: 'pending',
        attempts: 0,
        error_message: null
      })
      .eq('post_id', postId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to reschedule post: ${error.message}`);
    }

    return this.mapSupabaseScheduledPost(data);
  }

  async getScheduledPosts(options: {
    status?: 'pending' | 'published' | 'failed';
    limit?: number;
    offset?: number;
  } = {}): Promise<{ scheduledPosts: ScheduledPost[]; total: number }> {
    let query = supabase
      .from('scheduled_posts')
      .select('*, posts(title, slug)', { count: 'exact' });

    if (options.status) {
      query = query.eq('status', options.status);
    }

    query = query.order('scheduled_at', { ascending: true });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch scheduled posts: ${error.message}`);
    }

    return {
      scheduledPosts: (data || []).map(this.mapSupabaseScheduledPost),
      total: count || 0
    };
  }

  async publishScheduledPosts(): Promise<{ published: number; failed: number }> {
    const { data, error } = await supabase.rpc('publish_scheduled_posts');

    if (error) {
      throw new Error(`Failed to publish scheduled posts: ${error.message}`);
    }

    return {
      published: data || 0,
      failed: 0 // This would be calculated based on failed attempts
    };
  }

  async getPostScheduleInfo(postId: string): Promise<{
    isScheduled: boolean;
    scheduledAt?: Date;
    status?: string;
    attempts?: number;
    lastError?: string;
  }> {
    const { data, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('post_id', postId)
      .eq('status', 'pending')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { isScheduled: false };
      }
      throw new Error(`Failed to get schedule info: ${error.message}`);
    }

    return {
      isScheduled: true,
      scheduledAt: new Date(data.scheduled_at),
      status: data.status,
      attempts: data.attempts,
      lastError: data.error_message
    };
  }

  async updatePostStatus(postId: string, status: Post['status']): Promise<void> {
    const updateData: any = { status };

    // Set published_at when publishing
    if (status === 'published') {
      updateData.published_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId);

    if (error) {
      throw new Error(`Failed to update post status: ${error.message}`);
    }
  }

  async getPostsByStatus(status: Post['status'], options: {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  } = {}): Promise<{ posts: any[]; total: number }> {
    let query = supabase
      .from('posts')
      .select('*, categories(name, slug)', { count: 'exact' })
      .eq('status', status);

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

  async bulkUpdatePostStatus(postIds: string[], status: Post['status']): Promise<void> {
    const updateData: any = { status };

    if (status === 'published') {
      updateData.published_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('posts')
      .update(updateData)
      .in('id', postIds);

    if (error) {
      throw new Error(`Failed to bulk update post status: ${error.message}`);
    }
  }

  private mapSupabaseScheduledPost(data: any): ScheduledPost {
    return {
      id: data.id,
      postId: data.post_id,
      scheduledAt: data.scheduled_at,
      status: data.status,
      attempts: data.attempts,
      lastAttemptAt: data.last_attempt_at,
      errorMessage: data.error_message,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  // Utility methods
  getStatusDisplayName(status: Post['status']): string {
    const statusMap: Record<Post['status'], string> = {
      'draft': 'Draft',
      'published': 'Published',
      'scheduled': 'Scheduled',
      'private': 'Private',
      'archived': 'Archived',
      'trash': 'Trash'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: Post['status']): string {
    const colorMap: Record<Post['status'], string> = {
      'draft': 'bg-gray-100 text-gray-800',
      'published': 'bg-green-100 text-green-800',
      'scheduled': 'bg-blue-100 text-blue-800',
      'private': 'bg-yellow-100 text-yellow-800',
      'archived': 'bg-purple-100 text-purple-800',
      'trash': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  }

  getAvailableStatusTransitions(currentStatus: Post['status']): Post['status'][] {
    const transitions: Record<Post['status'], Post['status'][]> = {
      'draft': ['published', 'scheduled', 'private', 'trash'],
      'published': ['draft', 'private', 'archived', 'trash'],
      'scheduled': ['draft', 'published', 'private', 'trash'],
      'private': ['draft', 'published', 'scheduled', 'trash'],
      'archived': ['draft', 'published', 'private', 'trash'],
      'trash': ['draft', 'published', 'private', 'archived']
    };
    return transitions[currentStatus] || [];
  }

  validateScheduleDate(date: Date): { valid: boolean; error?: string } {
    const now = new Date();
    const minScheduleTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now

    if (date <= minScheduleTime) {
      return {
        valid: false,
        error: 'Schedule time must be at least 5 minutes in the future'
      };
    }

    const maxScheduleTime = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
    if (date > maxScheduleTime) {
      return {
        valid: false,
        error: 'Schedule time cannot be more than 1 year in the future'
      };
    }

    return { valid: true };
  }
}

export const schedulingService = new SchedulingService();
