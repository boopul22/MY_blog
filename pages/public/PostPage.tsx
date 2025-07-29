
import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BlogContext } from '../../context/SupabaseBlogContext';
import { Post } from '../../types';
import StructuredData from '../../components/StructuredData';
import FAQSchema from '../../components/FAQSchema';
import SocialMetaTags from '../../components/SocialMetaTags';
import TableOfContents from '../../components/TableOfContents';

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

            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
                {/* Breadcrumbs */}
                <Breadcrumbs />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content Area */}
                    <main className="lg:col-span-8 bg-card text-card-foreground border rounded-lg p-6 sm:p-8 shadow-sm">
                        
                        {/* Article Header */}
                        <header className="mb-10 pb-8 border-b border-slate-200/30 dark:border-slate-700/30">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-8 text-dark-text dark:text-light-text">
                                {post.title}
                            </h1>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 text-sm text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                                        <div className="w-6 h-6 bg-slate-400 dark:bg-slate-500 rounded-full"></div>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-card-foreground">
                                            {post.authorName || 'Author'}
                                        </div>
                                        <div className="text-xs">Senior Developer</div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                                    <div className="flex items-center gap-2">
                                        <span>📅</span>
                                        <span>{new Date(post.createdAt).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>⏱️</span>
                                        <span>{readTime} min read</span>
                                    </div>
                                </div>
                            </div>

                            {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {post.tags.map((tagId) => {
                                        const tag = context.tags.find(t => t.id === tagId);
                                        return tag ? (
                                            <span key={tagId} className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300">
                                                {tag.name}
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            )}
                        </header>

                        {/* Featured Image */}
                        {post.imageUrl && (
                            <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[28rem] bg-slate-200 dark:bg-slate-700 rounded-xl mb-10 overflow-hidden">
                                <img
                                    src={post.imageUrl}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Article Content */}
                        <article className="mb-12">
                            <div className="enhanced-content prose prose-lg sm:prose-xl dark:prose-invert max-w-none prose-headings:text-dark-text dark:prose-headings:text-light-text prose-p:text-dark-text dark:prose-p:text-light-text prose-li:text-dark-text dark:prose-li:text-light-text prose-strong:text-dark-text dark:prose-strong:text-light-text">
                                <div dangerouslySetInnerHTML={{ __html: post.content }} />
                            </div>
                        </article>

                        {/* Social Sharing */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-12 py-8 border-t border-b border-slate-200/30 dark:border-slate-700/30">
                            <h4 className="text-card-foreground font-semibold text-lg sm:text-xl flex-shrink-0">📢 Share this article:</h4>
                            <div className="flex flex-wrap gap-3">
                                {socialIcons.map(({ label, emoji }, index) => (
                                    <button
                                        key={index}
                                        className="px-4 py-2 sm:px-5 sm:py-2.5 bg-slate-100 dark:bg-slate-700 border border-slate-200/30 dark:border-slate-600/30 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        <span className="hidden sm:inline">{emoji}</span> {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Author Bio */}
                        {post.authorName && (
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 sm:p-8 bg-card text-card-foreground border rounded-xl shadow-sm mb-12">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-200 dark:bg-slate-600 rounded-full flex-shrink-0 flex items-center justify-center">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-400 dark:bg-slate-500 rounded-full"></div>
                                </div>
                                <div className="text-center sm:text-left">
                                    <h4 className="text-lg sm:text-xl font-semibold mb-2 text-card-foreground">
                                        About {post.authorName}
                                    </h4>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
                                        Senior Developer with expertise in modern web technologies. Passionate about sharing knowledge and helping developers grow.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Comments System */}
                        {post.allowComments && (
                            <section>
                                <h3 className="text-2xl font-bold mb-8 text-card-foreground">
                                    💬 Comments
                                </h3>

                            {/* Comment Form */}
                            <div className="bg-card text-card-foreground border p-6 sm:p-8 rounded-xl shadow-sm">
                                <h4 className="text-xl font-semibold mb-6 text-card-foreground">
                                    ✍️ Leave a Comment
                                </h4>
                                <form onSubmit={handleCommentSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Your Name"
                                                className="w-full p-3 sm:p-4 border border-slate-200/40 dark:border-slate-600/40 rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Your Email"
                                                className="w-full p-3 sm:p-4 border border-slate-200/40 dark:border-slate-600/40 rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Share your thoughts..."
                                            className="w-full h-32 p-3 sm:p-4 border border-slate-200/40 dark:border-slate-600/40 rounded-lg bg-background text-foreground resize-y focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors text-sm sm:text-base"
                                    >
                                        Post Comment
                                    </button>
                                </form>
                            </div>
                            </section>
                        )}
                    </main>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4">
                        {/* Table of Contents */}
                        <div className="lg:sticky lg:top-8">
                            <SidebarWidget title="In this article">
                                <TableOfContents content={post.content} />
                            </SidebarWidget>
                        </div>

                        <div className="mt-8 space-y-8">
                            {/* Search Widget */}
                            <SidebarWidget title="🔍 Search">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search articles..."
                                    className="w-full p-3 border border-slate-200/40 dark:border-slate-600/40 rounded bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                />
                            </SidebarWidget>

                            {/* Related Posts */}
                            <SidebarWidget title="📖 Related Posts">
                                {relatedPosts.map((relatedPost) => (
                                    <SidebarItem key={relatedPost.id} post={relatedPost} />
                                ))}
                            </SidebarWidget>

                            {/* Categories */}
                            <SidebarWidget title="📂 Categories">
                                <ul className="space-y-0">
                                    {context.categories.map((cat) => (
                                        <li key={cat.id} className="flex justify-between items-center py-2.5 border-b border-slate-200/20 dark:border-slate-700/20 last:border-b-0">
                                            <Link 
                                                to={`/category/${cat.slug}`}
                                                className="text-slate-700 dark:text-slate-300 hover:text-primary transition-colors text-sm font-medium"
                                            >
                                                {cat.name}
                                            </Link>
                                            <span className="text-slate-500 dark:text-slate-400 text-xs">
                                                ({context.posts.filter(p => p.categoryId === cat.id).length})
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </SidebarWidget>

                            {/* Popular Posts */}
                            <SidebarWidget title="🔥 Popular This Week">
                                {popularPosts.map((popularPost) => (
                                    <SidebarItem key={popularPost.id} post={popularPost} />
                                ))}
                            </SidebarWidget>

                            {/* Newsletter Signup */}
                            <SidebarWidget title="">
                                <div className="text-center bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg p-6 -m-2">
                                    <h3 className="text-lg font-semibold mb-2">📧 Stay Updated!</h3>
                                    <p className="text-sm mb-4 opacity-90">
                                        Get weekly web development tips and tutorials
                                    </p>
                                    <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                                        <input
                                            type="email"
                                            value={newsletterEmail}
                                            onChange={(e) => setNewsletterEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full p-3 border-0 rounded text-dark-text focus:ring-2 focus:ring-white transition"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            className="w-full bg-white text-primary px-5 py-2.5 rounded font-semibold hover:bg-slate-50 transition-colors"
                                        >
                                            Subscribe Now
                                        </button>
                                    </form>
                                </div>
                            </SidebarWidget>

                            {/* Tags Cloud */}
                            <SidebarWidget title="🏷️ Popular Tags">
                                <div className="flex flex-wrap gap-2">
                                    {context.tags.slice(0, 10).map((tag) => (
                                        <span 
                                            key={tag.id}
                                            className="bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                                        >
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                            </SidebarWidget>
                        </div>
                    </aside>
                </div>
            </div>
            
            {/* FAQ Schema */}
            <FAQSchema post={post} />
        </div>
    );
};

export default PostPage;
