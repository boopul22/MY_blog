
import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BlogContext } from '../../context/SupabaseBlogContext';
import { Post } from '../../types';
import StructuredData from '../../components/StructuredData';
import FAQSchema from '../../components/FAQSchema';
import SocialMetaTags from '../../components/SocialMetaTags';
import TableOfContents from '../../components/TableOfContents';
import { PostSidebar } from '../../components/PostSidebar';
import { PostNavigation } from '../../components/PostNavigation';

import { useEnhancedCodeBlocks } from '../../utils/contentRenderer';

import {
    FacebookIcon,
    TwitterIcon,
    LinkedInIcon,
    MailIcon
} from '../../components/icons';

const PostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const context = useContext(BlogContext);
    const [post, setPost] = useState<Post | undefined>(undefined);
    const [comment, setComment] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Use enhanced code blocks for syntax highlighting
    useEnhancedCodeBlocks();

    useEffect(() => {
        if (slug && context) {
            const foundPost = context.getPostBySlug(slug);
            setPost(foundPost);
        }
    }, [slug, context]);

    if (!post || !context) {
        return (
            <div className="min-h-screen bg-background">
                <title>Post not found</title>
                <div className="text-center py-20">
                    <h1 className="text-2xl text-foreground">Post not found</h1>
                    <Link to="/" className="text-primary hover:underline mt-4 inline-block">Back to Home</Link>
                </div>
            </div>
        );
    }
    
    const category = context.categories.find(c => c.id === post.categoryId);
    const publishedPosts = context.posts.filter(p => p.status === 'published' && p.id !== post.id);
    const relatedPosts = publishedPosts.slice(0, 3);
    const popularPosts = publishedPosts.slice(0, 2);

    // Generate breadcrumbs for schema markup
    const breadcrumbs = [
        { name: 'Home', url: 'https://myawesomeblog.com/' },
        ...(category ? [{ name: category.name, url: `https://myawesomeblog.com/category/${category.slug}` }] : []),
        { name: post.title, url: `https://myawesomeblog.com/post/${post.slug}` }
    ];

    const socialIcons = [
        { icon: FacebookIcon, label: 'Facebook', emoji: '📘' },
        { icon: TwitterIcon, label: 'Twitter', emoji: '🐦' },
        { icon: LinkedInIcon, label: 'LinkedIn', emoji: '💼' },
        { icon: MailIcon, label: 'Email', emoji: '🔗' }
    ];

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Comment submitted:', { comment, name, email });
        setComment('');
        setName('');
        setEmail('');
    };

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Newsletter subscription:', newsletterEmail);
        setNewsletterEmail('');
    };

    // Calculate read time (rough estimate: 200 words per minute)
    const wordCount = post.content.split(' ').length;
    const readTime = Math.ceil(wordCount / 200);



    const SidebarWidget: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div className="bg-card text-card-foreground border rounded-lg p-6 shadow-sm">
            {title && (
                <h3 className="text-lg font-semibold mb-5 pb-3 border-b border-slate-200/30 dark:border-slate-700/30">
                    {title}
                </h3>
            )}
            {children}
        </div>
    );

    const SidebarItem: React.FC<{ post: Post }> = ({ post: sidebarPost }) => {
        const postCategory = context.categories.find(c => c.id === sidebarPost.categoryId);
        return (
            <div className="flex gap-3 mb-4 pb-4 border-b border-slate-200/20 dark:border-slate-700/20 last:border-b-0 last:mb-0 last:pb-0">
                <div className="w-15 h-15 bg-slate-200 dark:bg-slate-700 rounded flex-shrink-0 flex items-center justify-center">
                    {sidebarPost.imageUrl ? (
                        <img 
                            src={sidebarPost.imageUrl} 
                            alt={sidebarPost.title}
                            className="w-full h-full object-cover rounded"
                        />
                    ) : (
                        <div className="w-8 h-8 border-2 border-slate-400/30 dark:border-slate-500/30 rounded"></div>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <h5 className="text-sm font-medium leading-tight mb-1 text-card-foreground">
                        <Link to={`/post/${sidebarPost.slug}`} className="hover:text-primary transition-colors">
                            {sidebarPost.title}
                        </Link>
                    </h5>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        {postCategory?.name} • {new Date(sidebarPost.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </div>
                </div>
            </div>
        );
    };



    // Breadcrumbs component
    const Breadcrumbs: React.FC = () => (
        <nav className="mb-8 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center space-x-2">
                <Link to="/" className="hover:text-primary transition-colors">
                    Home
                </Link>
                <span>/</span>
                {category && (
                    <>
                        <Link
                            to={`/category/${category.slug}`}
                            className="hover:text-primary transition-colors"
                        >
                            {category.name}
                        </Link>
                        <span>/</span>
                    </>
                )}
                <span className="text-dark-text dark:text-light-text font-medium">
                    {post.title}
                </span>
            </div>
        </nav>
    );

    return (
        <div className="bg-background min-h-screen">
            <SocialMetaTags post={post} />
            <StructuredData
                post={post}
                category={category}
                breadcrumbs={breadcrumbs}
            />

            {/* Mobile: Enhanced edge-to-edge layout */}
            <div className="mobile-only">
                {/* Mobile Breadcrumbs */}
                <div className="section-container bg-background">
                    <div className="main-container">
                        <Breadcrumbs />
                    </div>
                </div>

                {/* Mobile Main Content */}
                <main className="bg-background">
                    {/* Featured Image - Full width on mobile */}
                    {post.imageUrl && (
                        <div className="container-edge-to-edge h-64 xs:h-72 sm:h-80 bg-muted overflow-hidden">
                            <img
                                src={post.imageUrl}
                                alt={post.title}
                                className="w-full h-full object-cover"
                                loading="eager"
                                decoding="async"
                                sizes="100vw"
                            />
                        </div>
                    )}

                    {/* Article Header */}
                    <div className="content-header">
                        <div className="content-container">
                            <h1 className="text-fluid-2xl font-bold leading-tight mb-fluid-sm text-foreground">
                                {post.title}
                            </h1>

                            <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 mb-fluid-sm text-fluid-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                                        <div className="w-4 h-4 bg-muted-foreground rounded-full"></div>
                                    </div>
                                    <span className="font-medium text-foreground">{post.authorName || 'Author'}</span>
                                </div>
                                <div className="flex items-center gap-2 xs:gap-4">
                                    <span className="hidden xs:inline">•</span>
                                    <span>{new Date(post.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}</span>
                                    <span>•</span>
                                    <span>{readTime} min read</span>
                                </div>
                            </div>

                            {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map((tagId) => {
                                        const tag = context.tags.find(t => t.id === tagId);
                                        return tag ? (
                                            <span key={tagId} className="bg-muted px-3 py-1 rounded-full text-fluid-xs font-medium text-muted-foreground">
                                                {tag.name}
                                            </span>
                                    ) : null;
                                })}
                            </div>
                        )}
                        </div>
                    </div>

                    {/* Article Content with enhanced reading experience */}
                    <article className="content-body">
                        <div className="content-container">
                            <div className="enhanced-content prose prose-base dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-p:text-fluid-base prose-headings:text-fluid-lg">
                                <div dangerouslySetInnerHTML={{ __html: post.content }} />
                            </div>
                        </div>
                    </article>

                    {/* Mobile Social Sharing */}
                    <div className="content-footer">
                        <div className="content-container">
                            <h4 className="text-foreground font-semibold text-fluid-lg mb-fluid-sm">Share this article</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {socialIcons.map(({ label, emoji }, index) => (
                                    <button
                                        key={index}
                                        className="touch-target bg-muted border border-border rounded-lg text-fluid-sm font-medium text-foreground hover:bg-secondary transition-colors"
                                    >
                                        {emoji} {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Desktop: Enhanced post layout */}
            <div className="hidden md:block">
                <div className="main-container py-fluid-lg">
                    {/* Breadcrumbs */}
                    <div className="mb-fluid-md">
                        <Breadcrumbs />
                    </div>

                    <div className="post-layout">
                        {/* Main Content Area */}
                        <main className="post-content-area">
                            <article className="article-box">
                        
                                {/* Featured Image */}
                                {post.imageUrl && (
                                    <div className="mb-fluid-lg -mx-6 sm:-mx-8 overflow-hidden rounded-lg">
                                        <img
                                            src={post.imageUrl}
                                            alt={post.title}
                                            className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                                            loading="eager"
                                            decoding="async"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                                        />
                                    </div>
                                )}

                                {/* Article Header */}
                                <header className="content-header">
                                    <h1 className="text-fluid-2xl md:text-fluid-3xl lg:text-fluid-4xl font-bold leading-tight mb-fluid-sm text-foreground">
                                        {post.title}
                                    </h1>

                                    <div className="post-meta">
                                        <div className="post-meta-item">
                                            <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center flex-shrink-0">
                                                <div className="w-4 h-4 bg-primary rounded-full"></div>
                                            </div>
                                            <span className="font-medium text-foreground">{post.authorName || 'Author'}</span>
                                        </div>
                                        <span className="post-meta-separator">•</span>
                                        <time className="post-meta-item">
                                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </time>
                                        <span className="post-meta-separator">•</span>
                                        <span className="post-meta-item">{readTime} min read</span>
                                    </div>

                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-fluid-sm">
                                            {post.tags.map((tagId) => {
                                                const tag = context.tags.find(t => t.id === tagId);
                                                return tag ? (
                                                    <span key={tagId} className="bg-muted px-3 py-1 rounded-full text-xs font-medium text-muted-foreground">
                                                        {tag.name}
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    )}
                                </header>

                                {/* Article Content */}
                                <div className="content-body">
                                    <div className="enhanced-content prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-p:text-fluid-base prose-headings:text-fluid-lg">
                                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                                    </div>
                                </div>

                                {/* Social Sharing */}
                                <div className="social-sharing">
                                    <h5 className="social-sharing-title">Share Article:</h5>
                                    <div className="social-buttons">
                                        {socialIcons.map(({ label, emoji }, index) => (
                                            <button
                                                key={index}
                                                className="social-button"
                                            >
                                                <span>{emoji}</span> {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </article>
                        </main>

                        {/* Sidebar */}
                        <PostSidebar
                            post={post}
                            tags={context.tags}
                            relatedPosts={publishedPosts.filter(p => p.id !== post.id).slice(0, 3)}
                        />
                    </div>

                    {/* Post Navigation */}
                    <PostNavigation currentPost={post} allPosts={publishedPosts} />
                </div>
            </div>

            {/* Author Bio Section - Outside main layout */}
            <div className="hidden md:block">
                <div className="main-container">
                    <div className="content-box">
                        {/* Author Bio */}
                        {post.authorName && (
                            <div className="content-box">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex-shrink-0 flex items-center justify-center">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full"></div>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h4 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">
                                            About {post.authorName}
                                        </h4>
                                        <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                                            Senior Developer with expertise in modern web technologies. Passionate about sharing knowledge and helping developers grow.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            
            {/* FAQ Schema */}
            <FAQSchema post={post} />
        </div>
    );
};

export default PostPage;
