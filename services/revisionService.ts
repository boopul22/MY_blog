import { supabase } from '../lib/supabase';
import { PostRevision, Post } from '../types';

export class RevisionService {
  async createRevision(
    postId: string, 
    revisionType: 'revision' | 'autosave' = 'revision'
  ): Promise<PostRevision> {
    // Call the database function to create revision
    const { data, error } = await supabase.rpc('create_post_revision', {
      p_post_id: postId,
      p_revision_type: revisionType
    });

    if (error) {
      throw new Error(`Failed to create revision: ${error.message}`);
    }

    // Fetch the created revision
    const { data: revision, error: fetchError } = await supabase
      .from('post_revisions')
      .select('*')
      .eq('id', data)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch created revision: ${fetchError.message}`);
    }

    return this.mapSupabaseRevision(revision);
  }

  async getRevisions(
    postId: string,
    options: {
      revisionType?: 'revision' | 'autosave';
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ revisions: PostRevision[]; total: number }> {
    let query = supabase
      .from('post_revisions')
      .select('*', { count: 'exact' })
      .eq('post_id', postId);

    if (options.revisionType) {
      query = query.eq('revision_type', options.revisionType);
    }

    query = query.order('created_at', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch revisions: ${error.message}`);
    }

    return {
      revisions: (data || []).map(this.mapSupabaseRevision),
      total: count || 0
    };
  }

  async getRevision(revisionId: string): Promise<PostRevision | null> {
    const { data, error } = await supabase
      .from('post_revisions')
      .select('*')
      .eq('id', revisionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch revision: ${error.message}`);
    }

    return this.mapSupabaseRevision(data);
  }

  async restoreRevision(postId: string, revisionId: string): Promise<void> {
    const { error } = await supabase.rpc('restore_post_from_revision', {
      p_post_id: postId,
      p_revision_id: revisionId
    });

    if (error) {
      throw new Error(`Failed to restore revision: ${error.message}`);
    }
  }

  async deleteRevision(revisionId: string): Promise<void> {
    const { error } = await supabase
      .from('post_revisions')
      .delete()
      .eq('id', revisionId);

    if (error) {
      throw new Error(`Failed to delete revision: ${error.message}`);
    }
  }

  async compareRevisions(
    revisionId1: string, 
    revisionId2: string
  ): Promise<{
    revision1: PostRevision;
    revision2: PostRevision;
    differences: {
      title: boolean;
      content: boolean;
      excerpt: boolean;
      seoTitle: boolean;
      seoDescription: boolean;
      metaKeywords: boolean;
    };
  }> {
    const [revision1, revision2] = await Promise.all([
      this.getRevision(revisionId1),
      this.getRevision(revisionId2)
    ]);

    if (!revision1 || !revision2) {
      throw new Error('One or both revisions not found');
    }

    const differences = {
      title: revision1.title !== revision2.title,
      content: revision1.content !== revision2.content,
      excerpt: revision1.excerpt !== revision2.excerpt,
      seoTitle: revision1.seoTitle !== revision2.seoTitle,
      seoDescription: revision1.seoDescription !== revision2.seoDescription,
      metaKeywords: revision1.metaKeywords !== revision2.metaKeywords
    };

    return { revision1, revision2, differences };
  }

  async getRevisionStats(postId: string): Promise<{
    totalRevisions: number;
    totalAutosaves: number;
    oldestRevision?: Date;
    newestRevision?: Date;
    averageTimeBetweenRevisions?: number;
  }> {
    const { data, error } = await supabase
      .from('post_revisions')
      .select('revision_type, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch revision stats: ${error.message}`);
    }

    const revisions = data || [];
    const totalRevisions = revisions.filter(r => r.revision_type === 'revision').length;
    const totalAutosaves = revisions.filter(r => r.revision_type === 'autosave').length;

    let oldestRevision: Date | undefined;
    let newestRevision: Date | undefined;
    let averageTimeBetweenRevisions: number | undefined;

    if (revisions.length > 0) {
      oldestRevision = new Date(revisions[0].created_at);
      newestRevision = new Date(revisions[revisions.length - 1].created_at);

      if (revisions.length > 1) {
        const timeSpan = newestRevision.getTime() - oldestRevision.getTime();
        averageTimeBetweenRevisions = timeSpan / (revisions.length - 1);
      }
    }

    return {
      totalRevisions,
      totalAutosaves,
      oldestRevision,
      newestRevision,
      averageTimeBetweenRevisions
    };
  }

  async cleanupOldRevisions(
    postId: string, 
    keepCount: number = 10
  ): Promise<{ deleted: number }> {
    // Get revisions to delete (keep the most recent ones)
    const { data, error } = await supabase
      .from('post_revisions')
      .select('id')
      .eq('post_id', postId)
      .eq('revision_type', 'revision')
      .order('created_at', { ascending: false })
      .range(keepCount, 1000); // Get everything after the keep count

    if (error) {
      throw new Error(`Failed to fetch old revisions: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return { deleted: 0 };
    }

    const idsToDelete = data.map(r => r.id);

    const { error: deleteError } = await supabase
      .from('post_revisions')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      throw new Error(`Failed to delete old revisions: ${deleteError.message}`);
    }

    return { deleted: data.length };
  }

  async cleanupAutosaves(
    postId: string, 
    olderThanHours: number = 24
  ): Promise<{ deleted: number }> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - olderThanHours);

    const { data, error } = await supabase
      .from('post_revisions')
      .delete()
      .eq('post_id', postId)
      .eq('revision_type', 'autosave')
      .lt('created_at', cutoffDate.toISOString())
      .select('id');

    if (error) {
      throw new Error(`Failed to cleanup autosaves: ${error.message}`);
    }

    return { deleted: data?.length || 0 };
  }

  generateDiff(text1: string, text2: string): Array<{
    type: 'added' | 'removed' | 'unchanged';
    content: string;
  }> {
    // Simple word-based diff algorithm
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);
    const diff: Array<{ type: 'added' | 'removed' | 'unchanged'; content: string }> = [];

    let i = 0, j = 0;

    while (i < words1.length || j < words2.length) {
      if (i >= words1.length) {
        // Remaining words in text2 are additions
        diff.push({ type: 'added', content: words2[j] });
        j++;
      } else if (j >= words2.length) {
        // Remaining words in text1 are removals
        diff.push({ type: 'removed', content: words1[i] });
        i++;
      } else if (words1[i] === words2[j]) {
        // Words match
        diff.push({ type: 'unchanged', content: words1[i] });
        i++;
        j++;
      } else {
        // Look ahead to find matches
        let found = false;
        for (let k = j + 1; k < Math.min(j + 5, words2.length); k++) {
          if (words1[i] === words2[k]) {
            // Found match, mark intermediate words as additions
            for (let l = j; l < k; l++) {
              diff.push({ type: 'added', content: words2[l] });
            }
            diff.push({ type: 'unchanged', content: words1[i] });
            i++;
            j = k + 1;
            found = true;
            break;
          }
        }

        if (!found) {
          // Look ahead in text1
          for (let k = i + 1; k < Math.min(i + 5, words1.length); k++) {
            if (words1[k] === words2[j]) {
              // Found match, mark intermediate words as removals
              for (let l = i; l < k; l++) {
                diff.push({ type: 'removed', content: words1[l] });
              }
              diff.push({ type: 'unchanged', content: words1[k] });
              i = k + 1;
              j++;
              found = true;
              break;
            }
          }
        }

        if (!found) {
          // No match found, treat as replacement
          diff.push({ type: 'removed', content: words1[i] });
          diff.push({ type: 'added', content: words2[j] });
          i++;
          j++;
        }
      }
    }

    return diff;
  }

  private mapSupabaseRevision(data: any): PostRevision {
    return {
      id: data.id,
      postId: data.post_id,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      seoTitle: data.seo_title,
      seoDescription: data.seo_description,
      metaKeywords: data.meta_keywords,
      customFields: data.custom_fields,
      revisionType: data.revision_type,
      authorName: data.author_name,
      createdAt: data.created_at
    };
  }
}

export const revisionService = new RevisionService();
