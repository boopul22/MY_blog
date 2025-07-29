import React, { useState, useContext, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlogContext } from '../../context/SupabaseBlogContext';
import { useNotifications } from '../../context/NotificationProvider';
import { Post } from '../../types';
import { generateBlogPostContent, generateSEOMetadata } from '../../services/geminiService';
import { SparklesIcon } from '../../components/icons';
import Spinner from '../../components/Spinner';
import ImageUpload from '../../components/ImageUpload';
import LazyEnhancedRichTextEditor from '../../components/LazyEnhancedRichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FormField from '../../components/FormField';
import { ImageSizes } from '../../services/imageService';

const PostEditorPage: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const context = useContext(BlogContext);
    const { showSuccess, showError, showInfo } = useNotifications();

    const [post, setPost] = useState<Partial<Post>>({
        title: '',
        content: '',
        status: 'draft',
        categoryId: '',
        tags: [],
        seoTitle: '',
        seoDescription: '',
        excerpt: '',
    });

    const [isGenerating, setIsGenerating] = useState(() => ({ content: false, seo: false }));
    const [newTag, setNewTag] = useState('');
    const [focusKeyword, setFocusKeyword] = useState('');
    const [urlSlug, setUrlSlug] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>(() => ({}));
    const [isSaving, setIsSaving] = useState(false);

    const generateSlug = useMemo(() => {
        return (title: string) => {
            return title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
        };
    }, []);

    useEffect(() => {
        if (id && context?.getPost) {
            const existingPost = context.getPost(id);
            if (existingPost) {
                setPost(existingPost);
                setUrlSlug(existingPost.title ? generateSlug(existingPost.title) : '');
            }
        }
    }, [id, context?.getPost, generateSlug]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (post.title || post.content) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [post.title, post.content]);

    const validateForm = useCallback(() => {
        const errors: Record<string, string> = {};
        if (!post.title?.trim()) errors.title = 'Title is required';
        if (!post.content?.trim()) errors.content = 'Content is required';
        if (!post.categoryId) errors.categoryId = 'Category is required';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [post.title, post.content, post.categoryId]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPost(prev => ({ ...prev, [name]: value }));
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (name === 'title') {
            setUrlSlug(generateSlug(value));
        }
    }, [validationErrors, generateSlug]);

    const handleContentChange = useCallback((content: string) => {
        setPost(prev => ({ ...prev, content }));
        if (validationErrors.content) {
            setValidationErrors(prev => ({ ...prev, content: '' }));
        }
    }, [validationErrors.content]);

    const handleGenerateContent = useCallback(async () => {
        if (!post.title) {
            showError('Title Required', 'Please provide a title first to generate content.');
            return;
        }
        setIsGenerating(prev => ({ ...prev, content: true }));
        try {
            const content = await generateBlogPostContent(post.title);
            setPost(prev => ({ ...prev, content }));
            showSuccess('Content Generated', 'AI-powered content has been generated successfully.');
        } catch (error) {
            showError('Generation Failed', 'Failed to generate content. Please try again.');
        } finally {
            setIsGenerating(prev => ({ ...prev, content: false }));
        }
    }, [post.title, showSuccess, showError]);

    const handleImageUpload = useCallback(async (file: File): Promise<ImageSizes> => {
        if (!context) throw new Error('Context not available');
        try {
            const imageSizes = await context.uploadPostImage(file, id);
            setPost(prev => ({ ...prev, imageUrl: imageSizes.large }));
            showSuccess('Image Uploaded', 'Featured image has been uploaded.');
            return imageSizes;
        } catch (error) {
            showError('Upload Failed', 'Failed to upload image.');
            throw error;
        }
    }, [context, id, showSuccess, showError]);

    const handleImageRemove = useCallback(() => {
        setPost(prev => ({ ...prev, imageUrl: undefined }));
        showInfo('Image Removed', 'Featured image has been removed.');
    }, [showInfo]);

    const handleGenerateSEO = useCallback(async () => {
        if (!post.content) {
            showError('Content Required', 'Please generate content first to create SEO metadata.');
            return;
        }
        setIsGenerating(prev => ({ ...prev, seo: true }));
        try {
            const { seoTitle, seoDescription } = await generateSEOMetadata(post.content);
            setPost(prev => ({ ...prev, seoTitle, seoDescription }));
            showSuccess('SEO Generated', 'SEO metadata has been generated successfully.');
        } catch (error) {
            showError('SEO Failed', 'Failed to generate SEO metadata.');
        } finally {
            setIsGenerating(prev => ({ ...prev, seo: false }));
        }
    }, [post.content, showSuccess, showError]);

    const handleTagAdd = useCallback(async () => {
        if (newTag && context && !post.tags?.includes(newTag)) {
            const existingTag = context.tags.find(t => t.name.toLowerCase() === newTag.toLowerCase());
            if (existingTag) {
                setPost(prev => ({ ...prev, tags: [...(prev.tags || []), existingTag.id] }));
            } else {
                try {
                    await context.addTag(newTag);
                    const addedTag = context.tags.find(t => t.name.toLowerCase() === newTag.toLowerCase());
                    if (addedTag) setPost(prev => ({ ...prev, tags: [...(prev.tags || []), addedTag.id] }));
                } catch (error) {
                    showError('Error', 'Failed to add tag.');
                }
            }
            setNewTag('');
        }
    }, [newTag, context, post.tags, showError]);

    const handleTagRemove = useCallback((tagId: string) => {
        setPost(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tagId) }));
    }, []);

    const handleSave = useCallback(async (status: 'draft' | 'published', shouldRedirect = true) => {
        if (!validateForm()) {
            showError("Validation Error", "Please fix the errors before saving.");
            return;
        }

        setIsSaving(true);
        const postData = { ...post, status, slug: urlSlug };

        try {
            if (id) {
                await context?.updatePost(id, postData);
            } else {
                const newPost = await context?.addPost(postData as Omit<Post, 'id' | 'createdAt'>);
                if (newPost && !id) {
                    // If it's a new post, we need to update the URL to include the new ID
                    // This prevents creating a new post on every save.
                    navigate(`/admin/edit/${newPost.id}`, { replace: true });
                }
            }
            showSuccess(status === 'published' ? "Post Published!" : "Draft Saved", `Your post has been saved as a ${status}.`);
            if (shouldRedirect) {
                setTimeout(() => navigate('/admin/posts'), 1500);
            }
        } catch (error) {
            showError("Save Failed", error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsSaving(false);
        }
    }, [validateForm, showError, post, id, context, showSuccess, navigate, urlSlug]);

    const handleSaveDraft = useCallback(() => handleSave('draft', false), [handleSave]);
    const handlePublish = useCallback(() => handleSave('published'), [handleSave]);

    const handleViewPost = () => {
        if (post.slug) window.open(`/post/${post.slug}`, '_blank');
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                if (!isSaving) handleSaveDraft();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isSaving, handleSaveDraft]);

    if (!context) return <Spinner />;
    const { categories, tags } = context;

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            {/* Header */}
            <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">
                            {id ? 'Edit Post' : 'Create New Post'}
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Cmd/Ctrl+S to save draft
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'}`}>
                            {post.status}
                        </span>
                        {post.status === 'published' && id && (
                            <Button variant="outline" size="sm" onClick={handleViewPost}>View Post</Button>
                        )}
                        <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSaving}>
                            {isSaving && post.status === 'draft' ? <Spinner size="sm" /> : 'Save Draft'}
                        </Button>
                        <Button size="sm" onClick={handlePublish} disabled={isSaving}>
                            {isSaving && post.status === 'published' ? <Spinner size="sm" /> : (post.status === 'published' ? 'Update' : 'Publish')}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor Column */}
                <main className="flex-1 p-6 overflow-y-auto space-y-6">
                    <Textarea
                        id="title"
                        name="title"
                        value={post.title || ''}
                        onChange={handleInputChange}
                        placeholder="Post Title"
                        required
                        className="w-full text-4xl font-extrabold tracking-tight border-none focus:ring-0 resize-none p-0 h-auto bg-transparent"
                    />
                    {validationErrors.title && <p className="text-red-500 text-sm">{validationErrors.title}</p>}

                    <div className="min-h-[500px]">
                        <LazyEnhancedRichTextEditor
                            key={`post-content-editor-${id || 'new'}`}
                            value={post.content || ''}
                            onChange={handleContentChange}
                            placeholder="Start writing your masterpiece..."
                            height="100%"
                            autoHeight={true}
                        />
                        {validationErrors.content && <p className="text-red-500 text-sm mt-2">{validationErrors.content}</p>}
                    </div>
                </main>

                {/* Inspector Sidebar */}
                <aside className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6 space-y-8 overflow-y-auto">
                    {/* Publish Settings */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Publish Settings</h3>
                        <div className="space-y-4">
                            <FormField label="Status" htmlFor="status" required>
                                <select id="status" name="status" value={post.status || 'draft'} onChange={handleInputChange} className="w-full input-class">
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </FormField>
                            <FormField label="Category" htmlFor="categoryId" required error={validationErrors.categoryId}>
                                <select id="categoryId" name="categoryId" value={post.categoryId || ''} onChange={handleInputChange} required className="w-full input-class">
                                    <option value="">Select a category</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </FormField>
                            <FormField label="URL Slug" htmlFor="urlSlug" hint="Auto-generated from title">
                                <Input type="text" id="urlSlug" value={urlSlug} onChange={(e) => setUrlSlug(e.target.value)} placeholder="post-url-slug" />
                            </FormField>
                        </div>
                    </div>

                    {/* SEO */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">SEO</h3>
                            <Button variant="ghost" size="sm" onClick={handleGenerateSEO} disabled={isGenerating.seo || !post.content}>
                                {isGenerating.seo ? <Spinner size="sm" /> : <SparklesIcon className="w-4 h-4 mr-2" />}
                                Generate
                            </Button>
                        </div>
                        <div className="space-y-4">
                            <FormField label="SEO Title" htmlFor="seoTitle" hint="Max 60 characters">
                                <Input type="text" id="seoTitle" name="seoTitle" value={post.seoTitle || ''} onChange={handleInputChange} maxLength={60} />
                                <div className="text-xs text-gray-500 mt-1">{(post.seoTitle || '').length}/60</div>
                            </FormField>
                            <FormField label="SEO Description" htmlFor="seoDescription" hint="Max 160 characters">
                                <Textarea id="seoDescription" name="seoDescription" value={post.seoDescription || ''} onChange={handleInputChange} maxLength={160} rows={4} />
                                <div className="text-xs text-gray-500 mt-1">{(post.seoDescription || '').length}/160</div>
                            </FormField>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Featured Image</h3>
                        <ImageUpload onImageUpload={handleImageUpload} currentImageUrl={post.imageUrl} onImageRemove={handleImageRemove} />
                    </div>

                    {/* Tags */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Tags</h3>
                        <div className="flex gap-2 mb-4">
                            <Input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())} placeholder="Add a tag..." />
                            <Button onClick={handleTagAdd}>Add</Button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {post.tags?.map(tagId => {
                                const tag = tags.find(t => t.id === tagId);
                                return tag ? (
                                    <div key={tagId} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                        <span className="text-sm">{tag.name}</span>
                                        <button onClick={() => handleTagRemove(tagId)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">&times;</button>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Excerpt</h3>
                        <FormField label="Excerpt" htmlFor="excerpt" hint="A short summary of the post.">
                            <Textarea id="excerpt" name="excerpt" value={post.excerpt || ''} onChange={handleInputChange} rows={4} />
                        </FormField>
                    </div>

                </aside>
            </div>
        </div>
    );
};

export default PostEditorPage;