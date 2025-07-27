
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlogContext } from '../../context/SupabaseBlogContext';
import { Post } from '../../types';
import { generateBlogPostContent, generateSEOMetadata } from '../../services/geminiService';
import { SparklesIcon } from '../../components/icons';
import Spinner from '../../components/Spinner';
import ImageUpload from '../../components/ImageUpload';
import { ImageSizes } from '../../services/imageService';

const PostEditorPage: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const context = useContext(BlogContext);

    const [post, setPost] = useState<Partial<Post>>({
        title: '',
        content: '',
        status: 'draft',
        categoryId: '',
        tags: [],
        seoTitle: '',
        seoDescription: '',
    });
    const [isGenerating, setIsGenerating] = useState({ content: false, seo: false });
    const [newTag, setNewTag] = useState('');

    useEffect(() => {
        if (id && context?.getPost) {
            const existingPost = context.getPost(id);
            if (existingPost) {
                setPost(existingPost);
            }
        }
    }, [id, context]);
    
    const handleInputChange = <T,>(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPost(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerateContent = useCallback(async () => {
        if (!post.title) {
            alert('Please provide a title first to generate content.');
            return;
        }
        setIsGenerating(prev => ({ ...prev, content: true }));
        const content = await generateBlogPostContent(post.title);
        setPost(prev => ({ ...prev, content }));
        setIsGenerating(prev => ({ ...prev, content: false }));
    },[post.title]);

    const handleImageUpload = useCallback(async (file: File): Promise<ImageSizes> => {
        if (!context) throw new Error('Context not available');
        
        try {
            const imageSizes = await context.uploadPostImage(file, id);
            // Use the large size as the main image URL
            setPost(prev => ({ ...prev, imageUrl: imageSizes.large }));
            return imageSizes;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }, [context, id]);

    const handleImageRemove = useCallback(() => {
        setPost(prev => ({ ...prev, imageUrl: undefined }));
    }, []);

    const handleGenerateSEO = useCallback(async () => {
        if (!post.content) {
            alert('Please generate content first to create SEO metadata.');
            return;
        }
        setIsGenerating(prev => ({ ...prev, seo: true }));
        const { seoTitle, seoDescription } = await generateSEOMetadata(post.content);
        setPost(prev => ({ ...prev, seoTitle, seoDescription }));
        setIsGenerating(prev => ({ ...prev, seo: false }));
    }, [post.content]);

    const handleTagAdd = async () => {
        if (newTag && context && !post.tags?.includes(newTag)) {
            const existingTag = context.tags.find(t => t.name.toLowerCase() === newTag.toLowerCase());
            if (existingTag) {
                 setPost(prev => ({ ...prev, tags: [...(prev.tags || []), existingTag.id] }));
            } else {
                try {
                    await context.addTag(newTag);
                    // Find the newly added tag
                    const addedTag = context.tags.find(t => t.name.toLowerCase() === newTag.toLowerCase());
                    if(addedTag) setPost(prev => ({ ...prev, tags: [...(prev.tags || []), addedTag.id] }));
                } catch (error) {
                    console.error('Error adding tag:', error);
                    alert('Failed to add tag. Please try again.');
                }
            }
            setNewTag('');
        }
    };
    
    const handleTagRemove = (tagId: string) => {
        setPost(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tagId) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!post.title || !post.content || !post.categoryId) {
            alert("Title, content and category are required.");
            return;
        }

        try {
            if (id) {
                await context?.updatePost(id, post);
            } else {
                await context?.addPost(post as Omit<Post, 'id' | 'createdAt' | 'slug'>);
            }
            navigate('/admin/posts');
        } catch (error) {
            console.error('Error saving post:', error);
            alert('Failed to save post. Please try again.');
        }
    };

    if (!context) return <Spinner />;
    const { categories, tags } = context;

    return (
        <form onSubmit={handleSubmit}>
            <h1 className="text-3xl font-bold text-dark-text dark:text-light-text mb-6">{id ? 'Edit Post' : 'Create New Post'}</h1>
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Main Content */}
                    <div className="p-6 bg-light dark:bg-dark rounded-lg shadow-md">
                        <label htmlFor="title" className="block text-sm font-medium text-secondary dark:text-gray-400">Title</label>
                        <input type="text" name="title" id="title" value={post.title} onChange={handleInputChange} className="mt-1 block w-full bg-gray-200 dark:bg-medium-dark border-gray-400 dark:border-light-dark rounded-md shadow-sm focus:ring-primary focus:border-primary" required />
                    </div>
                    <div className="p-6 bg-light dark:bg-dark rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-2">
                             <label htmlFor="content" className="block text-sm font-medium text-secondary dark:text-gray-400">Content</label>
                             <button type="button" onClick={handleGenerateContent} disabled={isGenerating.content} className="flex items-center text-sm bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary hover:bg-primary/20 dark:hover:bg-primary/30 font-semibold py-1 px-3 rounded-full transition-colors disabled:opacity-50">
                                {isGenerating.content ? <Spinner size="sm"/> : <SparklesIcon className="w-4 h-4 mr-1" />} Generate with AI
                            </button>
                        </div>
                        <textarea name="content" id="content" value={post.content} onChange={handleInputChange} rows={15} className="mt-1 block w-full bg-gray-200 dark:bg-medium-dark border-gray-400 dark:border-light-dark rounded-md shadow-sm focus:ring-primary focus:border-primary" required />
                    </div>
                     {/* SEO Section */}
                    <div className="p-6 bg-light dark:bg-dark rounded-lg shadow-md">
                         <div className="flex justify-between items-center mb-2">
                           <h3 className="text-lg font-medium text-dark-text dark:text-light-text">SEO Settings</h3>
                             <button type="button" onClick={handleGenerateSEO} disabled={isGenerating.seo} className="flex items-center text-sm bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary hover:bg-primary/20 dark:hover:bg-primary/30 font-semibold py-1 px-3 rounded-full transition-colors disabled:opacity-50">
                                {isGenerating.seo ? <Spinner size="sm"/> : <SparklesIcon className="w-4 h-4 mr-1" />} Auto-Generate SEO
                            </button>
                         </div>
                         <div className="space-y-4 mt-4">
                            <div>
                                <label htmlFor="seoTitle" className="block text-sm font-medium text-secondary dark:text-gray-400">SEO Title</label>
                                <input type="text" name="seoTitle" id="seoTitle" value={post.seoTitle} onChange={handleInputChange} className="mt-1 block w-full bg-gray-200 dark:bg-medium-dark border-gray-400 dark:border-light-dark rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label htmlFor="seoDescription" className="block text-sm font-medium text-secondary dark:text-gray-400">SEO Description</label>
                                <textarea name="seoDescription" id="seoDescription" value={post.seoDescription} onChange={handleInputChange} rows={3} className="mt-1 block w-full bg-gray-200 dark:bg-medium-dark border-gray-400 dark:border-light-dark rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                            </div>
                         </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-4 space-y-6">
                    {/* Publish Actions */}
                    <div className="p-6 bg-light dark:bg-dark rounded-lg shadow-md">
                        <h3 className="text-lg font-medium text-dark-text dark:text-light-text">Publish</h3>
                        <div className="mt-4 space-y-4">
                             <div>
                                <label htmlFor="status" className="block text-sm font-medium text-secondary dark:text-gray-400">Status</label>
                                <select name="status" id="status" value={post.status} onChange={handleInputChange} className="mt-1 block w-full bg-gray-200 dark:bg-medium-dark border-gray-400 dark:border-light-dark rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                             </div>
                            <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-light-text font-bold py-2 px-4 rounded-lg transition-colors">{id ? 'Update Post' : 'Save Post'}</button>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="p-6 bg-light dark:bg-dark rounded-lg shadow-md">
                        <h3 className="text-lg font-medium text-dark-text dark:text-light-text mb-4">Featured Image</h3>
                        <ImageUpload
                            onImageUpload={handleImageUpload}
                            currentImageUrl={post.imageUrl}
                            onImageRemove={handleImageRemove}
                            disabled={false}
                        />
                    </div>

                    {/* Category & Tags */}
                    <div className="p-6 bg-light dark:bg-dark rounded-lg shadow-md">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="categoryId" className="block text-sm font-medium text-secondary dark:text-gray-400">Category</label>
                                <select name="categoryId" id="categoryId" value={post.categoryId} onChange={handleInputChange} className="mt-1 block w-full bg-gray-200 dark:bg-medium-dark border-gray-400 dark:border-light-dark rounded-md shadow-sm focus:ring-primary focus:border-primary" required>
                                    <option value="">Select a category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary dark:text-gray-400">Tags</label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {post.tags?.map(tagId => {
                                        const tag = tags.find(t => t.id === tagId);
                                        return tag ? (
                                            <span key={tagId} className="flex items-center bg-gray-300 dark:bg-medium-dark text-dark-text dark:text-light-text text-xs font-medium px-2.5 py-1 rounded-full">
                                                {tag.name}
                                                <button type="button" onClick={() => handleTagRemove(tagId)} className="ml-1.5 text-secondary hover:text-dark-text dark:hover:text-light-text">&times;</button>
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                                <div className="flex mt-2">
                                    <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} className="flex-grow bg-gray-200 dark:bg-medium-dark border-gray-400 dark:border-light-dark rounded-l-md shadow-sm focus:ring-primary focus:border-primary text-sm"/>
                                    <button type="button" onClick={handleTagAdd} className="bg-gray-300 dark:bg-medium-dark text-secondary dark:text-gray-400 font-bold p-2 rounded-r-md hover:bg-gray-400 dark:hover:bg-light-dark transition-colors">+</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default PostEditorPage;
