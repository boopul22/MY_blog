
export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  imageUrl?: string;
  status: 'published' | 'draft';
  seoTitle: string;
  seoDescription: string;
  categoryId: string;
  tags: string[];
  createdAt: string;
  authorName: string;
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