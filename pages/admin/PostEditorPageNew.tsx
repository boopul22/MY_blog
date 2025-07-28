import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
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
    
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPost(prev => ({ ...prev, [name]: value }));

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
    }, []); // No dependencies needed as we use functional updates

    const handleContentChange = useCallback((content: string) => {
        setPost(prev => ({ ...prev, content }));
        setValidationErrors(prev => {
            if (prev.content) {
                return { ...prev, content: '' };
            }
            return prev;
        });
    }, []); // No dependencies needed as we use functional updates

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
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {id ? 'Edit Post' : 'Create New Post'}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {id ? 'Update your blog post content and settings' : 'Create a new blog post with content and SEO optimization'}
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <TabContainer defaultTab="content" className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <TabValidationWrapper>
                        <div className="px-6 pt-6">
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
                    </TabValidationWrapper>
                </TabContainer>
            </form>
        </div>
    );
};

export default PostEditorPage;
