
import React, { useState, useContext, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlogContext } from '../../context/SupabaseBlogContext';
import { useNotifications } from '../../context/NotificationProvider';
import { Post } from '../../types';
import { generateBlogPostContent, generateSEOMetadata } from '../../services/geminiService';
import { SparklesIcon, DocumentTextIcon, GlobeAltIcon, CogIcon, RocketLaunchIcon } from '../../components/icons';
import Spinner from '../../components/Spinner';
import ImageUpload from '../../components/ImageUpload';
import EnhancedRichTextEditor from '../../components/EnhancedRichTextEditor';
import { TabContainer, TabList, Tab, TabPanel, useTabContext } from '../../components/Tabs';
import FormField from '../../components/FormField';
import Card from '../../components/Card';
import { ImageSizes } from '../../services/imageService';

const PostEditorPage: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const context = useContext(BlogContext);
    const { showSuccess, showError, showInfo } = useNotifications();

    // Simple state management for the post
    const [post, setPost] = useState<Partial<Post>>({
        title: '',
        content: '',
        status: 'draft',
        categoryId: '',
        tags: [],
        seoTitle: '',
        seoDescription: '',
    });

    const [isGenerating, setIsGenerating] = useState(() => ({ content: false, seo: false }));
    const [newTag, setNewTag] = useState('');
    const [focusKeyword, setFocusKeyword] = useState('');
    const [urlSlug, setUrlSlug] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>(() => ({}));
    const [isSaving, setIsSaving] = useState(false);

    // Generate URL slug from title - moved outside component to prevent re-creation
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
    }, [id, context?.getPost]); // Removed generateSlug from dependencies

    // Prevent accidental navigation away from unsaved content
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



    // Validation logic
    const validateForm = useCallback(() => {
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
    }, [post.title, post.content, post.categoryId]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Simple state update
        setPost(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear validation error when user starts typing
        setValidationErrors(prev => {
            if (prev[name]) {
                return { ...prev, [name]: '' };
            }
            return prev;
        });

        // Auto-generate slug from title
        if (name === 'title') {
            setUrlSlug(generateSlug(value));
        }
    }, []); // Removed generateSlug dependency - using stable reference from useMemo

    // Simplified content change handler with proper memoization
    const handleContentChange = useCallback((content: string) => {
        // Only update if content actually changed
        setPost(prev => {
            if (prev.content === content) {
                return prev; // No change, return same object to prevent re-render
            }
            return {
                ...prev,
                content
            };
        });

        // Clear validation error only if there was one
        setValidationErrors(prev => {
            if (prev.content) {
                return { ...prev, content: '' };
            }
            return prev; // No change, return same object
        });
    }, []); // No dependencies needed since we use functional updates

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

    const handleTagAdd = useCallback(async () => {
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
    }, [newTag, context, post.tags]);
    
    const handleTagRemove = useCallback((tagId: string) => {
        setPost(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tagId) }));
    }, []);

    const handleSave = useCallback(async (status: 'draft' | 'published', shouldRedirect = true) => {
        if (!validateForm()) {
            showError("Validation Error", "Please fix the validation errors before saving.");
            return;
        }

        setIsSaving(true);
        const postData = { ...post, status };

        try {
            if (id) {
                await context?.updatePost(id, postData);
                if (status === 'published') {
                    showSuccess(
                        "Post Published!",
                        "Your post has been successfully published and is now live.",
                        6000
                    );
                } else {
                    showSuccess("Draft Saved", "Your post has been saved as a draft.");
                }
            } else {
                await context?.addPost(postData as Omit<Post, 'id' | 'createdAt' | 'slug'>);
                if (status === 'published') {
                    showSuccess(
                        "Post Published!",
                        "Your new post has been successfully published and is now live.",
                        6000
                    );
                } else {
                    showSuccess("Draft Created", "Your new post has been saved as a draft.");
                }
            }

            if (shouldRedirect) {
                // Small delay to let user see the success message
                setTimeout(() => {
                    navigate('/admin/posts');
                }, 1500);
            }
        } catch (error) {
            console.error('Error saving post:', error);
            showError(
                "Save Failed",
                error instanceof Error ? error.message : "Failed to save post. Please try again.",
                10000
            );
        } finally {
            setIsSaving(false);
        }
    }, [validateForm, showError, post, id, context, showSuccess, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleSave('published');
    };

    const handleSaveDraft = useCallback(async () => {
        await handleSave('draft', false);
    }, [handleSave]);

    const handlePublish = useCallback(async () => {
        // Show confirmation for first-time publish
        if (post.status !== 'published' && !id) {
            const confirmed = window.confirm(
                "Are you ready to publish this post? Once published, it will be visible to all visitors on your blog."
            );
            if (!confirmed) return;
        }
        await handleSave('published');
    }, [handleSave, post.status, id]);

    const handleViewPost = () => {
        if (post.slug) {
            window.open(`/post/${post.slug}`, '_blank');
        } else if (id) {
            // If no slug, try to construct one from title
            const slug = post.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            if (slug) {
                window.open(`/post/${slug}`, '_blank');
            }
        }
    };

    // Keyboard shortcuts - moved here after function definitions
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd/Ctrl + S to save draft
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                if (!isSaving) {
                    handleSaveDraft();
                }
            }
            // Cmd/Ctrl + Shift + P to publish
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                if (!isSaving) {
                    handlePublish();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isSaving, handleSaveDraft, handlePublish]);

    // Tab validation component - memoized to prevent unnecessary re-renders
    const TabValidationWrapper = useMemo(() => {
        return ({ children }: { children: React.ReactNode }) => {
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
    }, [validationErrors]);

    if (!context) return <Spinner />;
    const { categories, tags } = context;

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Fixed Header */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-3">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {id ? 'Edit Post' : 'Create New Post'}
                            </h1>
                            {/* Status Badge */}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                post.status === 'published'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            }`}>
                                {post.status === 'published' ? 'Published' : 'Draft'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {id ? 'Update your blog post content and settings' : 'Create a new blog post with content and SEO optimization'}
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-500">
                                • Ctrl+S save draft • Ctrl+Shift+P publish
                            </span>
                        </p>
                    </div>

                    {/* Action Buttons in Header */}
                    <div className="flex items-center space-x-3">


                        <button
                            type="button"
                            onClick={() => navigate('/admin/posts')}
                            disabled={isSaving}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSaveDraft}
                            disabled={isSaving}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                        >
                            {isSaving && post.status === 'draft' ? (
                                <div className="flex items-center space-x-2">
                                    <Spinner size="sm" />
                                    <span>Saving...</span>
                                </div>
                            ) : 'Save Draft'}
                        </button>

                        {/* View Post Button - only show for published posts */}
                        {post.status === 'published' && id && (
                            <button
                                type="button"
                                onClick={handleViewPost}
                                className="px-4 py-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:ring-2 focus:ring-blue-500 transition-colors"
                            >
                                View Post
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handlePublish}
                            disabled={isSaving}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors font-medium"
                        >
                            {isSaving && post.status === 'published' ? (
                                <div className="flex items-center space-x-2">
                                    <Spinner size="sm" />
                                    <span>Publishing...</span>
                                </div>
                            ) : (
                                post.status === 'published' ? 'Update Post' : 'Publish Post'
                            )}
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
                                    <div className="h-full flex flex-col lg:flex-row">
                                        {/* Left Column - Title and Controls */}
                                        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 p-4 md:p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 space-y-4">
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
                                        <div className="flex-1 p-4 md:p-6 min-h-0">
                                            <FormField
                                                label="Content"
                                                required
                                                error={validationErrors.content}
                                                hint="Write your blog post content using the rich text editor"
                                            >
                                                <div className="h-full">
                                                    <EnhancedRichTextEditor
                                                        key="post-content-editor"
                                                        value={post.content || ''}
                                                        onChange={handleContentChange}
                                                        placeholder="Start writing your blog post content..."
                                                        autoHeight={true}
                                                        className="h-full"
                                                        enableAutoSave={true}
                                                        autoSaveDelay={30000}
                                                        onAutoSave={async (content) => {
                                                            // Auto-save the post content
                                                            if (post.id) {
                                                                try {
                                                                    await updatePost(post.id, { ...post, content });
                                                                    console.log('Auto-saved post content');
                                                                } catch (error) {
                                                                    console.error('Auto-save failed:', error);
                                                                }
                                                            }
                                                        }}
                                                        showWordCount={true}
                                                        showDetailedStats={true}
                                                        enableKeyboardShortcuts={true}
                                                        enableMediaUpload={true}
                                                        enableLinking={true}
                                                        enableTables={true}
                                                        enableFullScreen={true}
                                                        enableSourceCode={true}
                                                        enableAdvancedFormatting={true}
                                                        enableCustomStyles={true}
                                                        enableEmbeds={true}
                                                        enableAnchorLinks={true}
                                                        posts={context?.posts?.filter(p => p.status === 'published').map(p => ({
                                                            id: p.id,
                                                            title: p.title,
                                                            slug: p.slug
                                                        })) || []}
                                                        onExcerptGenerate={(excerpt) => {
                                                            setPost(prev => ({ ...prev, seoDescription: excerpt }));
                                                            showInfo('Excerpt generated and added to SEO description');
                                                        }}
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
