
export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  imageUrl?: string;
  status: 'published' | 'draft' | 'scheduled' | 'private' | 'archived' | 'trash';
  postType?: string;
  authorName: string;
  authorId?: string;
  featuredImageId?: string;
  parentId?: string;
  menuOrder?: number;
  commentStatus?: 'open' | 'closed';
  password?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
  seoTitle: string;
  seoDescription: string;
  metaKeywords?: string;
  categoryId?: string;
  tags: string[];
  customFields?: Record<string, any>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface PostType {
  id: string;
  name: string;
  label: string;
  description?: string;
  public: boolean;
  hierarchical: boolean;
  supports: string[];
  menuPosition: number;
  menuIcon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostRevision {
  id: string;
  postId: string;
  title: string;
  content: string;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  customFields?: Record<string, any>;
  revisionType: 'revision' | 'autosave';
  authorName: string;
  createdAt: string;
}

export interface PostMeta {
  id: string;
  postId: string;
  metaKey: string;
  metaValue?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledPost {
  id: string;
  postId: string;
  scheduledAt: string;
  status: 'pending' | 'published' | 'failed';
  attempts: number;
  lastAttemptAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentTemplate {
  id: string;
  name: string;
  description?: string;
  templateType: 'post' | 'page' | 'email' | 'custom';
  content: string;
  thumbnailUrl?: string;
  isActive: boolean;
  usageCount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReusableBlock {
  id: string;
  name: string;
  description?: string;
  blockType: 'text' | 'image' | 'video' | 'code' | 'quote' | 'custom';
  content: string;
  settings?: Record<string, any>;
  isActive: boolean;
  usageCount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BulkOperation {
  action: 'publish' | 'unpublish' | 'delete' | 'trash' | 'restore' | 'update';
  postIds: string[];
  data?: Partial<Post>;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: {
    status?: string[];
    postType?: string[];
    categoryId?: string;
    authorName?: string;
    dateRange?: {
      start: string;
      end: string;
    };
    tags?: string[];
    customFields?: Record<string, any>;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  createdBy?: string;
  createdAt: string;
}