
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Post, Category, Tag } from '../types';

interface BlogContextType {
  posts: Post[];
  categories: Category[];
  tags: Tag[];
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
  getPost: (id: string) => Post | undefined;
  getPostBySlug: (slug: string) => Post | undefined;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'slug' | 'authorName'>) => Post;
  updatePost: (id: string, post: Partial<Post>) => void;
  deletePost: (id: string) => void;
  addCategory: (name: string) => void;
  deleteCategory: (id: string) => void;
  addTag: (name: string) => void;
  deleteTag: (id: string) => void;
}

export const BlogContext = createContext<BlogContextType | undefined>(undefined);

const initialCategories: Category[] = [
    { id: '1', name: 'Parenting', slug: 'parenting' },
    { id: '2', name: 'Photography', slug: 'photography' },
    { id: '3', name: 'Business', slug: 'business' },
    { id: '4', name: 'Travel', slug: 'travel' },
    { id: '5', name: 'Design', slug: 'design' },
];

const initialTags: Tag[] = [
    { id: '1', name: 'React' },
    { id: '2', name: 'AI' },
    { id: '3', name: 'Web Dev' },
    { id: '4', name: 'UX' },
];

const initialPosts: Post[] = [
    {
        id: '1',
        title: 'Discover Your Best Self: A Journey to a Vibrant Lifestyle',
        slug: 'discover-your-best-self',
        content: `A vibrant lifestyle is about more than just fleeting moments of happiness; it's a sustained state of well-being, energy, and enthusiasm for life. It's about making conscious choices that nourish your mind, body, and soul. This journey begins with self-discovery. Understanding your values, passions, and what truly makes you feel alive is the foundation upon which you can build a more fulfilling existence. It requires introspection and honesty, and sometimes, the courage to let go of what no longer serves you.`,
        imageUrl: 'https://images.unsplash.com/photo-1542359649-31e03cdde433?q=80&w=2940&auto=format&fit=crop',
        status: 'published',
        seoTitle: 'Discover Your Best Self: A Journey to a Vibrant Lifestyle',
        seoDescription: 'Embark on a journey of self-discovery to unlock a more vibrant, fulfilling lifestyle. Learn to align your actions with your values for lasting well-being.',
        categoryId: '1',
        tags: ['4'],
        createdAt: new Date('2024-12-27').toISOString(),
        authorName: 'Marquise Wiszok',
    },
    {
        id: '2',
        title: 'The Art of Mindful Living: Transforming Your Lifestyle for Inner Peace',
        slug: 'art-of-mindful-living',
        content: `In our fast-paced world, finding moments of peace can feel like a luxury. Mindful living offers a path back to ourselves, a way to transform our daily routines into opportunities for awareness and calm. It's the practice of paying attention to the present moment without judgment. This can be as simple as savoring your morning coffee, feeling the ground beneath your feet as you walk, or truly listening to a friend. Mindfulness isn't about emptying your mind, but about observing your thoughts and feelings as they are.`,
        imageUrl: 'https://images.unsplash.com/photo-1508447650322-2c5b3b14644d?q=80&w=2940&auto=format&fit=crop',
        status: 'published',
        seoTitle: 'The Art of Mindful Living: A Guide to Inner Peace',
        seoDescription: 'Transform your life and find inner peace through the art of mindful living. Discover simple practices to bring awareness and calm to your daily routine.',
        categoryId: '3',
        tags: [],
        createdAt: new Date('2024-12-27').toISOString(),
        authorName: 'Mable Chaplin',
    },
     {
        id: '3',
        title: 'Top 5 Productivity Hacks for Developers',
        slug: 'top-5-productivity-hacks-for-developers',
        content: `Being productive is key. Here are five hacks to boost your output:

1.  **Timeboxing**: Allocate fixed time slots to tasks.
2.  **The Pomodoro Technique**: Work in focused 25-minute intervals.
3.  **Learn Your Tools**: Master your IDE and shortcuts.
4.  **Automate Repetitive Tasks**: Scripts are your friend.
5.  **Take Regular Breaks**: Avoid burnout.
`,
        imageUrl: 'https://picsum.photos/seed/productivity/1200/630',
        status: 'published',
        seoTitle: '5 Productivity Hacks for Developers to Get More Done',
        seoDescription: 'Boost your efficiency with these top 5 productivity hacks, including timeboxing, the Pomodoro Technique, and more.',
        categoryId: '5',
        tags: ['1', '3'],
        createdAt: new Date('2024-12-20').toISOString(),
        authorName: 'Admin',
    },
    {
        id: '4',
        title: 'My First Draft',
        slug: 'my-first-draft',
        content: 'This is a draft post. It is not yet visible to the public.',
        status: 'draft',
        seoTitle: 'Draft Post',
        seoDescription: 'This is a draft.',
        categoryId: '5',
        tags: ['4'],
        createdAt: new Date().toISOString(),
        authorName: 'Admin',
    }
];

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

export const BlogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [tags, setTags] = useState<Tag[]>(initialTags);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Persist admin state to session storage
        const storedAdminState = sessionStorage.getItem('isAdmin');
        if (storedAdminState === 'true') {
            setIsAdmin(true);
        }
    }, []);

    const login = () => {
        setIsAdmin(true);
        sessionStorage.setItem('isAdmin', 'true');
    };

    const logout = () => {
        setIsAdmin(false);
        sessionStorage.removeItem('isAdmin');
    };

    const getPost = (id: string) => posts.find(p => p.id === id);
    const getPostBySlug = (slug: string) => posts.find(p => p.slug === slug);
    
    const addPost = (post: Omit<Post, 'id' | 'createdAt' | 'slug' | 'authorName'>) => {
        const newPost: Post = {
            ...post,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            slug: slugify(post.title),
            authorName: 'Admin', // Default author name
        };
        setPosts(prev => [newPost, ...prev]);
        return newPost;
    };

    const updatePost = (id: string, postUpdate: Partial<Post>) => {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, ...postUpdate, slug: postUpdate.title ? slugify(postUpdate.title) : p.slug } : p));
    };

    const deletePost = (id: string) => {
        setPosts(prev => prev.filter(p => p.id !== id));
    };

    const addCategory = (name: string) => {
        const newCategory: Category = {
            id: Date.now().toString(),
            name,
            slug: slugify(name),
        };
        setCategories(prev => [...prev, newCategory]);
    };

    const deleteCategory = (id: string) => {
        setCategories(prev => prev.filter(c => c.id !== id));
    };
    
    const addTag = (name: string) => {
        if (!tags.some(t => t.name.toLowerCase() === name.toLowerCase())) {
            const newTag: Tag = {
                id: Date.now().toString(),
                name,
            };
            setTags(prev => [...prev, newTag]);
        }
    };

    const deleteTag = (id: string) => {
        setTags(prev => prev.filter(t => t.id !== id));
    };

    return (
        <BlogContext.Provider value={{ 
            posts, categories, tags, isAdmin, login, logout, getPost, getPostBySlug, addPost, updatePost, deletePost, addCategory, deleteCategory, addTag, deleteTag 
        }}>
            {children}
        </BlogContext.Provider>
    );
};