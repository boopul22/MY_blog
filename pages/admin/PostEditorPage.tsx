
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlogContext } from '../../context/SupabaseBlogContext';
import { Post } from '../../types';
import { generateBlogPostContent, generateSEOMetadata } from '../../services/geminiService';
import { SparklesIcon, DocumentTextIcon, GlobeAltIcon, CogIcon, RocketLaunchIcon } from '../../components/icons';
import Spinner from '../../components/Spinner';
import ImageUpload from '../../components/ImageUpload';
import RichTextEditor from '../../components/RichTextEditor';
import { TabContainer, TabList, Tab, TabPanel, useTabContext } from '../../components/Tabs';
import FormField from '../../components/FormField';
import Card from '../../components/Card';
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
    const [focusKeyword, setFocusKeyword] = useState('');
    const [urlSlug, setUrlSlug] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (id && context?.getPost) {
            const existingPost = context.getPost(id);
            if (existingPost) {
                setPost(existingPost);
                setUrlSlug(existingPost.title ? generateSlug(existingPost.title) : '');
            }
        }
    }, [id, context]);

    // Generate URL slug from title
    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    // Validation logic
    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!post.title?.trim()) {
            errors.title = 'Title is required';
        }

        if (!post.content?.trim()) {
            errors.content = 'Content is required';
        }

        if (!post.categoryId) {
            errors.categoryId = 'Category is required';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPost(prev => ({ ...prev, [name]: value }));

        // Clear validation error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }

        // Auto-generate slug from title
        if (name === 'title') {
            setUrlSlug(generateSlug(value));
        }
    };

    const handleContentChange = (content: string) => {
        setPost(prev => ({ ...prev, content }));
        if (validationErrors.content) {
            setValidationErrors(prev => ({ ...prev, content: '' }));
        }
    };

    const handleInsertLink = (url: string, anchorText: string) => {
        // This would integrate with the rich text editor to insert a link
        // For now, we'll just copy to clipboard
        const linkHtml = `<a href="${url}">${anchorText}</a>`;
        navigator.clipboard.writeText(linkHtml).then(() => {
            console.log('Link copied to clipboard:', linkHtml);
            // You could show a toast notification here
        });
    };

    const handleGenerateContent = useCallback(async () => {
        if (!post.title) {
            alert('Please provide a title first to generate content.');
            return;
        }
        setIsGenerating(prev => ({ ...prev, content: true }));
        try {
            const content = await generateBlogPostContent(post.title);
            setPost(prev => ({ ...prev, content }));
        } catch (error) {
            console.error('Error generating content:', error);
            alert('Failed to generate content. Please try again.');
        } finally {
            setIsGenerating(prev => ({ ...prev, content: false }));
        }
    }, [post.title]);

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
        try {
            const { seoTitle, seoDescription } = await generateSEOMetadata(post.content);
            setPost(prev => ({ ...prev, seoTitle, seoDescription }));
        } catch (error) {
            console.error('Error generating SEO:', error);
            alert('Failed to generate SEO metadata. Please try again.');
        } finally {
            setIsGenerating(prev => ({ ...prev, seo: false }));
        }
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

        if (!validateForm()) {
            alert("Please fix the validation errors before saving.");
            return;
        }

        setIsSaving(true);
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
        } finally {
            setIsSaving(false);
        }
    };

    // Tab validation component
    const TabValidationWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const { setTabError } = useTabContext();

        useEffect(() => {
            // Update tab error states based on validation
            setTabError('content', !!(validationErrors.title || validationErrors.content));
            setTabError('seo', false); // SEO fields are optional
            setTabError('publishing', !!validationErrors.categoryId);
            setTabError('advanced', false); // Advanced fields are optional
        }, [validationErrors, setTabError]);

        return <>{children}</>;
    };

    if (!context) return <Spinner />;
    const { categories, tags } = context;

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Fixed Header */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {id ? 'Edit Post' : 'Create New Post'}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {id ? 'Update your blog post content and settings' : 'Create a new blog post with content and SEO optimization'}
                        </p>
                    </div>

                    {/* Action Buttons in Header */}
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/posts')}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setPost(prev => ({ ...prev, status: 'draft' }));
                                handleSubmit(new Event('submit') as any);
                            }}
                            disabled={isSaving}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                        >
                            {isSaving ? <Spinner size="sm" /> : 'Save Draft'}
                        </button>

                        <button
                            type="submit"
                            form="post-form"
                            disabled={isSaving}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors font-medium"
                        >
                            {isSaving ? <Spinner size="sm" /> : (id ? 'Update Post' : 'Publish Post')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                <form id="post-form" onSubmit={handleSubmit} className="flex-1 flex flex-col">
                    <TabContainer defaultTab="content" className="flex-1 flex flex-col bg-white dark:bg-gray-800">
                        <TabValidationWrapper>
                            {/* Tab Navigation */}
                            <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-6">
                                <TabList>
                                    <Tab id="content" icon={<DocumentTextIcon />}>
                                        Content
                                    </Tab>
                                    <Tab id="seo" icon={<GlobeAltIcon />}>
                                        SEO & Meta
                                    </Tab>
                                    <Tab id="publishing" icon={<RocketLaunchIcon />}>
                                        Publishing
                                    </Tab>
                                    <Tab id="advanced" icon={<CogIcon />}>
                                        Advanced
                                    </Tab>
                                </TabList>
                            </div>

                            {/* Tab Content Area - Fixed Height */}
                            <div className="flex-1 overflow-hidden">
                                {/* Content Tab */}
                                <TabPanel id="content" className="h-full">
                                    <div className="h-full flex">
                                        {/* Left Column - Title and Controls */}
                                        <div className="w-80 flex-shrink-0 p-6 border-r border-gray-200 dark:border-gray-700 space-y-4">
                                            <FormField
                                                label="Title"
                                                htmlFor="title"
                                                required
                                                error={validationErrors.title}
                                            >
                                                <input
                                                    type="text"
                                                    id="title"
                                                    name="title"
                                                    value={post.title || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    placeholder="Enter your post title..."
                                                    required
                                                />
                                            </FormField>

                                            <FormField
                                                label="Excerpt"
                                                htmlFor="excerpt"
                                                hint="Brief summary (optional)"
                                            >
                                                <textarea
                                                    id="excerpt"
                                                    name="excerpt"
                                                    value={post.excerpt || ''}
                                                    onChange={handleInputChange}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                                                    placeholder="Brief description..."
                                                />
                                            </FormField>

                                            <div className="pt-2">
                                                <button
                                                    type="button"
                                                    onClick={handleGenerateContent}
                                                    disabled={isGenerating.content || !post.title}
                                                    className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {isGenerating.content ? (
                                                        <Spinner size="sm" />
                                                    ) : (
                                                        <SparklesIcon className="w-4 h-4 mr-2" />
                                                    )}
                                                    Generate with AI
                                                </button>
                                            </div>

                                            {/* Content Stats */}
                                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                                <h4 className="text-xs font-medium text-gray-900 dark:text-white mb-2">
                                                    Content Statistics
                                                </h4>
                                                <div className="space-y-1 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500 dark:text-gray-400">Words:</span>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {post.content ? post.content.split(' ').length : 0}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500 dark:text-gray-400">Characters:</span>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {post.content ? post.content.length : 0}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500 dark:text-gray-400">Reading Time:</span>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {post.content ? Math.ceil(post.content.split(' ').length / 200) : 0} min
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column - Content Editor */}
                                        <div className="flex-1 p-6">
                                            <FormField
                                                label="Content"
                                                required
                                                error={validationErrors.content}
                                                hint="Write your blog post content using the rich text editor"
                                            >
                                                <div className="h-full">
                                                    <RichTextEditor
                                                        value={post.content || ''}
                                                        onChange={handleContentChange}
                                                        placeholder="Start writing your blog post content..."
                                                        height={window.innerHeight - 300}
                                                    />
                                                </div>
                                            </FormField>
                                        </div>
                                    </div>
                                </TabPanel>

                                {/* SEO & Meta Tab */}
                                <TabPanel id="seo" className="h-full">
                                    <div className="h-full p-6">
                                        <div className="h-full grid grid-cols-2 gap-8">
                                            {/* Left Column */}
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        SEO Optimization
                                                    </h3>
                                                    <button
                                                        type="button"
                                                        onClick={handleGenerateSEO}
                                                        disabled={isGenerating.seo || !post.content}
                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        {isGenerating.seo ? (
                                                            <Spinner size="sm" />
                                                        ) : (
                                                            <SparklesIcon className="w-4 h-4 mr-2" />
                                                        )}
                                                        Auto-Generate SEO
                                                    </button>
                                                </div>

                                                <FormField
                                                    label="Focus Keyword"
                                                    htmlFor="focusKeyword"
                                                    hint="Main keyword for SEO optimization"
                                                >
                                                    <input
                                                        type="text"
                                                        id="focusKeyword"
                                                        value={focusKeyword}
                                                        onChange={(e) => setFocusKeyword(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        placeholder="Enter your main keyword..."
                                                    />
                                                </FormField>

                                                <FormField
                                                    label="URL Slug"
                                                    htmlFor="urlSlug"
                                                    hint="Auto-generated from title"
                                                >
                                                    <input
                                                        type="text"
                                                        id="urlSlug"
                                                        value={urlSlug}
                                                        onChange={(e) => setUrlSlug(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        placeholder="post-url-slug"
                                                    />
                                                </FormField>

                                                <FormField
                                                    label="SEO Title"
                                                    htmlFor="seoTitle"
                                                    hint="Optimized title for search engines (max 60 characters)"
                                                >
                                                    <input
                                                        type="text"
                                                        id="seoTitle"
                                                        name="seoTitle"
                                                        value={post.seoTitle || ''}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        placeholder="SEO optimized title..."
                                                        maxLength={60}
                                                    />
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {(post.seoTitle || '').length}/60 characters
                                                    </div>
                                                </FormField>
                                            </div>

                                            {/* Right Column */}
                                            <div className="space-y-4">
                                                <FormField
                                                    label="SEO Description"
                                                    htmlFor="seoDescription"
                                                    hint="Meta description for search engines (max 160 characters)"
                                                >
                                                    <textarea
                                                        id="seoDescription"
                                                        name="seoDescription"
                                                        value={post.seoDescription || ''}
                                                        onChange={handleInputChange}
                                                        rows={4}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                                                        placeholder="Brief description for search engines..."
                                                        maxLength={160}
                                                    />
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {(post.seoDescription || '').length}/160 characters
                                                    </div>
                                                </FormField>

                                                {/* SEO Preview */}
                                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                                        Search Engine Preview
                                                    </h4>
                                                    <div className="space-y-2">
                                                        <div className="text-blue-600 dark:text-blue-400 text-sm font-medium truncate">
                                                            {post.seoTitle || post.title || 'Your Post Title'}
                                                        </div>
                                                        <div className="text-green-600 dark:text-green-400 text-xs">
                                                            yoursite.com/post/{urlSlug || 'post-slug'}
                                                        </div>
                                                        <div className="text-gray-600 dark:text-gray-400 text-sm">
                                                            {post.seoDescription || 'Your SEO description will appear here...'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* SEO Score */}
                                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                                        SEO Score
                                                    </h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">Title Length:</span>
                                                            <span className={`font-medium ${(post.seoTitle || post.title || '').length > 0 && (post.seoTitle || post.title || '').length <= 60 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                {(post.seoTitle || post.title || '').length <= 60 ? 'Good' : 'Too Long'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">Description Length:</span>
                                                            <span className={`font-medium ${(post.seoDescription || '').length > 0 && (post.seoDescription || '').length <= 160 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                {(post.seoDescription || '').length > 0 && (post.seoDescription || '').length <= 160 ? 'Good' : 'Needs Work'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">Focus Keyword:</span>
                                                            <span className={`font-medium ${focusKeyword ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                {focusKeyword ? 'Set' : 'Missing'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabPanel>

                                {/* Publishing Tab */}
                                <TabPanel id="publishing" className="h-full">
                                    <div className="h-full p-6">
                                        <div className="h-full grid grid-cols-3 gap-6">
                                            {/* Left Column - Basic Settings */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                    Publishing Settings
                                                </h3>

                                                <FormField
                                                    label="Status"
                                                    htmlFor="status"
                                                    required
                                                >
                                                    <select
                                                        id="status"
                                                        name="status"
                                                        value={post.status || 'draft'}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    >
                                                        <option value="draft">Draft</option>
                                                        <option value="published">Published</option>
                                                    </select>
                                                </FormField>

                                                <FormField
                                                    label="Category"
                                                    htmlFor="categoryId"
                                                    required
                                                    error={validationErrors.categoryId}
                                                >
                                                    <select
                                                        id="categoryId"
                                                        name="categoryId"
                                                        value={post.categoryId || ''}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        required
                                                    >
                                                        <option value="">Select a category</option>
                                                        {categories.map(category => (
                                                            <option key={category.id} value={category.id}>
                                                                {category.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </FormField>

                                                <FormField
                                                    label="Author"
                                                    htmlFor="authorName"
                                                >
                                                    <input
                                                        type="text"
                                                        id="authorName"
                                                        name="authorName"
                                                        value={post.authorName || 'Admin'}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        placeholder="Author name..."
                                                    />
                                                </FormField>
                                            </div>

                                            {/* Middle Column - Featured Image */}
                                            <div className="space-y-4">
                                                <h4 className="text-md font-medium text-gray-900 dark:text-white">
                                                    Featured Image
                                                </h4>
                                                <div className="h-64">
                                                    <ImageUpload
                                                        onImageUpload={handleImageUpload}
                                                        currentImageUrl={post.imageUrl}
                                                        onImageRemove={handleImageRemove}
                                                        disabled={false}
                                                        className="h-full"
                                                    />
                                                </div>
                                            </div>

                                            {/* Right Column - Tags */}
                                            <div className="space-y-4">
                                                <h4 className="text-md font-medium text-gray-900 dark:text-white">
                                                    Tags
                                                </h4>

                                                {/* Add New Tag */}
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={newTag}
                                                        onChange={(e) => setNewTag(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        placeholder="Add a tag..."
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleTagAdd}
                                                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
                                                    >
                                                        Add
                                                    </button>
                                                </div>

                                                {/* Selected Tags */}
                                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                                    {post.tags && post.tags.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {post.tags.map(tagId => {
                                                                const tag = tags.find(t => t.id === tagId);
                                                                return tag ? (
                                                                    <div
                                                                        key={tagId}
                                                                        className="flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-md"
                                                                    >
                                                                        <span className="text-sm text-blue-800 dark:text-blue-200">
                                                                            {tag.name}
                                                                        </span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleTagRemove(tagId)}
                                                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>
                                                                ) : null;
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                            No tags added yet
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabPanel>

                                {/* Advanced Tab */}
                                <TabPanel id="advanced" className="h-full">
                                    <div className="h-full p-6">
                                        <div className="h-full grid grid-cols-2 gap-8">
                                            {/* Left Column */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                    Advanced Settings
                                                </h3>

                                                <FormField
                                                    label="Custom Slug"
                                                    htmlFor="customSlug"
                                                    hint="Custom URL slug (leave empty to auto-generate)"
                                                >
                                                    <input
                                                        type="text"
                                                        id="customSlug"
                                                        value={urlSlug}
                                                        onChange={(e) => setUrlSlug(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        placeholder="custom-url-slug"
                                                    />
                                                </FormField>

                                                <FormField
                                                    label="Post Format"
                                                    htmlFor="postFormat"
                                                    hint="Choose the post format type"
                                                >
                                                    <select
                                                        id="postFormat"
                                                        name="postFormat"
                                                        value={post.postFormat || 'standard'}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    >
                                                        <option value="standard">Standard</option>
                                                        <option value="gallery">Gallery</option>
                                                        <option value="video">Video</option>
                                                        <option value="audio">Audio</option>
                                                        <option value="quote">Quote</option>
                                                        <option value="link">Link</option>
                                                    </select>
                                                </FormField>

                                                <FormField
                                                    label="Comment Status"
                                                    htmlFor="commentStatus"
                                                    hint="Allow comments on this post"
                                                >
                                                    <select
                                                        id="commentStatus"
                                                        name="commentStatus"
                                                        value={post.commentStatus || 'open'}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    >
                                                        <option value="open">Open</option>
                                                        <option value="closed">Closed</option>
                                                    </select>
                                                </FormField>

                                                <FormField
                                                    label="Menu Order"
                                                    htmlFor="menuOrder"
                                                    hint="Order in navigation menus (0 = default)"
                                                >
                                                    <input
                                                        type="number"
                                                        id="menuOrder"
                                                        name="menuOrder"
                                                        value={post.menuOrder || 0}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        placeholder="0"
                                                        min="0"
                                                    />
                                                </FormField>
                                            </div>

                                            {/* Right Column */}
                                            <div className="space-y-4">
                                                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                                                    Post Information
                                                </h4>

                                                {/* Post Statistics */}
                                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                                    <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                                        Content Statistics
                                                    </h5>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">Words:</span>
                                                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                                                {post.content ? post.content.split(' ').length : 0}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">Characters:</span>
                                                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                                                {post.content ? post.content.length : 0}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">Reading Time:</span>
                                                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                                                {post.content ? Math.ceil(post.content.split(' ').length / 200) : 0} min
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                                            <span className={`ml-2 font-medium ${post.status === 'published' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                                                {post.status === 'published' ? 'Published' : 'Draft'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Post Metadata */}
                                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                                    <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                                        Post Metadata
                                                    </h5>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500 dark:text-gray-400">Created:</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {id ? new Date(post.createdAt || '').toLocaleDateString() : 'Not saved yet'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500 dark:text-gray-400">Author:</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {post.authorName || 'Admin'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500 dark:text-gray-400">Category:</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {post.categoryId ? categories.find(c => c.id === post.categoryId)?.name || 'Unknown' : 'Not selected'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500 dark:text-gray-400">Tags:</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {post.tags?.length || 0} tags
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* URL Preview */}
                                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                                    <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        URL Preview
                                                    </h5>
                                                    <div className="text-sm text-blue-600 dark:text-blue-400 break-all">
                                                        yoursite.com/post/{urlSlug || 'post-slug'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabPanel>
                            </div>
                        </TabValidationWrapper>
                    </TabContainer>
                </form>
            </div>
        </div>
    );
};

export default PostEditorPage;
