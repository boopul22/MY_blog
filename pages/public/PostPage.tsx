
import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BlogContext } from '../../context/SupabaseBlogContext';
import { useTheme } from '../../context/ThemeContext';
import { Post } from '../../types';
import { 
    FacebookIcon, 
    TwitterIcon, 
    PinterestIcon, 
    LinkedInIcon, 
    WhatsAppIcon, 
    MailIcon,
    InstagramIcon 
} from '../../components/icons';

const PostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const context = useContext(BlogContext);
    const { isDarkMode } = useTheme();
    const [post, setPost] = useState<Post | undefined>(undefined);
    const [comment, setComment] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [saveInfo, setSaveInfo] = useState(false);

    useEffect(() => {
        if (slug && context) {
            const foundPost = context.getPostBySlug(slug);
            setPost(foundPost);
            if (foundPost) {
                document.title = foundPost.seoTitle || foundPost.title;
            }
        }
    }, [slug, context]);

    if (!post || !context) {
        return (
            <div className="min-h-screen bg-light dark:bg-dark">
                <div className="text-center py-20">
                    <h1 className="text-2xl text-dark-text dark:text-light-text">Post not found</h1>
                    <Link to="/" className="text-primary hover:underline mt-4 inline-block">Back to Home</Link>
                </div>
            </div>
        );
    }
    
    const category = context.categories.find(c => c.id === post.categoryId);
    const publishedPosts = context.posts.filter(p => p.status === 'published' && p.id !== post.id);
    const popularPosts = publishedPosts.slice(0, 5);

    const socialIcons = [
        { icon: FacebookIcon, label: 'Facebook' },
        { icon: TwitterIcon, label: 'Twitter' },
        { icon: PinterestIcon, label: 'Pinterest' },
        { icon: LinkedInIcon, label: 'LinkedIn' },
        { icon: WhatsAppIcon, label: 'WhatsApp' },
        { icon: MailIcon, label: 'Email' }
    ];

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle comment submission here
        console.log('Comment submitted:', { comment, name, email, website, saveInfo });
        // Reset form
        setComment('');
        setName('');
        setEmail('');
        setWebsite('');
        setSaveInfo(false);
    };

    const PopularPostCard: React.FC<{ post: Post }> = ({ post: popularPost }) => {
        const postCategory = context.categories.find(c => c.id === popularPost.categoryId);
        return (
            <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 flex-shrink-0 rounded overflow-hidden">
                    {popularPost.imageUrl ? (
                        <img 
                            src={popularPost.imageUrl} 
                            alt={popularPost.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-slate-400 dark:border-slate-500 rounded"></div>
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-sm leading-tight">
                        <Link to={`/post/${popularPost.slug}`} className="text-dark-text dark:text-light-text hover:text-primary dark:hover:text-primary transition-colors">
                            {popularPost.title}
                        </Link>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {postCategory?.name.toUpperCase()} BY <span className="text-primary font-semibold">{(popularPost.authorName || 'AUTHOR').toUpperCase()}</span>
                    </p>
                </div>
            </div>
        );
    };

    const Sidebar = () => (
        <aside className="space-y-12 bg-light dark:bg-dark">
            <div>
                <h2 className="text-lg font-bold mb-6 relative after:content-[''] after:absolute after:left-0 after:bottom-[-8px] after:w-8 after:h-0.5 after:bg-slate-800 dark:after:bg-slate-200 text-dark-text dark:text-light-text">
                    POPULAR POSTS
                </h2>
                <div className="space-y-6">
                    {popularPosts.map((popularPost) => (
                        <PopularPostCard key={popularPost.id} post={popularPost} />
                    ))}
                </div>
            </div>
        </aside>
    );

    const CommentSection = () => (
        <div className="mt-16 py-12 border-t border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold mb-8 text-dark-text dark:text-light-text">COMMENTS</h2>
            
            {/* Sample Comment */}
            <div className="space-y-8 mb-12">
                <div className="flex space-x-4">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex-shrink-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-slate-400 dark:bg-slate-500 rounded-full"></div>
                    </div>
                    <div className="w-full">
                        <div className="flex items-center space-x-3">
                            <h4 className="font-bold text-dark-text dark:text-light-text">Sample User</h4>
                            <span className="text-sm text-slate-500 dark:text-slate-400">Just now</span>
                        </div>
                        <p className="mt-2 text-slate-700 dark:text-slate-300">This is a sample comment to show the comment layout.</p>
                        <button className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-2 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                            Reply
                        </button>
                    </div>
                </div>
            </div>

            {/* Comment Form */}
            <div className="mt-12">
                <h3 className="text-xl font-bold text-dark-text dark:text-light-text">Leave a comment</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Your email address will not be published. Required fields are marked *
                </p>
                <form onSubmit={handleCommentSubmit} className="mt-6 space-y-6">
                    <div>
                        <label htmlFor="comment" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Comment *
                        </label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full h-32 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-dark-text dark:text-light-text p-3 rounded focus:border-primary dark:focus:border-primary outline-none transition-colors"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-dark-text dark:text-light-text p-3 rounded focus:border-primary dark:focus:border-primary outline-none transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-dark-text dark:text-light-text p-3 rounded focus:border-primary dark:focus:border-primary outline-none transition-colors"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="website" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Website
                        </label>
                        <input
                            type="url"
                            id="website"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="e.g. https://example.com"
                            className="w-full border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-dark-text dark:text-light-text p-3 rounded focus:border-primary dark:focus:border-primary outline-none transition-colors"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="save-info"
                            checked={saveInfo}
                            onChange={(e) => setSaveInfo(e.target.checked)}
                            className="h-5 w-5 border-2 border-gray-400 dark:border-gray-500 rounded-sm mr-2"
                        />
                        <label htmlFor="save-info" className="text-sm text-gray-600 dark:text-gray-400">
                            Save my name, email, and website in this browser for the next time I comment.
                        </label>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="bg-dark-text dark:bg-light-text text-light-text dark:text-dark-text px-8 py-3 font-semibold hover:opacity-85 transition-opacity"
                        >
                            Post Comment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const InstagramFeed = () => (
        <div className="mt-16 py-12 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-dark-text dark:text-light-text">Follow Me On Instagram</h2>
                    <a href="#" className="text-sm text-primary font-semibold flex items-center justify-center space-x-1 mt-1">
                        <InstagramIcon className="w-4 h-4" />
                        <span>@athena</span>
                    </a>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="w-full aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-gray-400 dark:border-gray-500 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-light dark:bg-dark min-h-screen">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <main className="mt-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-x-16">
                        <div className="lg:col-span-2">
                            <article className="max-w-none">
                                {/* Article Header */}
                                <header className="text-center mb-12">
                                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-dark-text dark:text-light-text">
                                        {post.title}
                                    </h1>
                                    <div className="mt-6 flex justify-center items-center space-x-4">
                                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                            <div className="w-6 h-6 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-dark-text dark:text-light-text">
                                                By {post.authorName || 'Author'}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(post.createdAt).toLocaleDateString('en-US', { 
                                                    year: 'numeric', 
                                                    month: 'short', 
                                                    day: 'numeric' 
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    {category && (
                                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                                            <Link to={`/category/${category.slug}`} className="hover:text-primary transition-colors">
                                                {category.name}
                                            </Link>
                                        </p>
                                    )}
                                </header>

                                {/* Main Article Image */}
                                {post.imageUrl && (
                                    <div className="w-full h-96 mb-8 overflow-hidden rounded-lg">
                                        <img 
                                            src={post.imageUrl} 
                                            alt={post.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Article Content */}
                                <div className="prose prose-lg dark:prose-invert max-w-none text-dark-text dark:text-light-text">
                                    <div 
                                        className="text-dark-text dark:text-light-text"
                                        dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} 
                                    />
                                </div>

                                {/* Social Sharing */}
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center my-12">
                                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                                        If you enjoyed reading this story, then we'd love it if you would share it
                                    </p>
                                    <div className="flex justify-center space-x-4">
                                        {socialIcons.map(({ icon: Icon, label }, index) => (
                                            <a
                                                key={index}
                                                href="#"
                                                className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                aria-label={`Share on ${label}`}
                                            >
                                                <Icon className="w-4 h-4" />
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm">
                                    <span className="font-semibold text-dark-text dark:text-light-text">Tags:</span>{' '}
                                    {post.tags && post.tags.length > 0 ? (
                                        post.tags.map((tagId, index) => {
                                            const tag = context.tags.find(t => t.id === tagId);
                                            return tag ? (
                                                <span key={tagId}>
                                                    <a href="#" className="text-gray-600 dark:text-gray-400 hover:underline">
                                                        {tag.name}
                                                    </a>
                                                    {index < post.tags!.length - 1 && ', '}
                                                </span>
                                            ) : null;
                                        })
                                    ) : (
                                        <span className="text-gray-600 dark:text-gray-400">No tags</span>
                                    )}
                                </div>

                                {/* Author Bio */}
                                <div className="mt-16 bg-gray-50 dark:bg-gray-800 p-8 flex items-center space-x-6 rounded-lg">
                                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0 flex items-center justify-center">
                                        <div className="w-12 h-12 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                                    </div>
                                    <div className="w-full">
                                        <h3 className="text-xl font-bold text-dark-text dark:text-light-text">
                                            {post.authorName || 'Author Name'}
                                        </h3>
                                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                                            Author bio and description would go here. This is a placeholder for the author's information and background.
                                        </p>
                                        <div className="mt-4 flex items-center space-x-4 text-gray-500 dark:text-gray-400">
                                            <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors" aria-label="Author's Facebook">
                                                <FacebookIcon className="w-4 h-4" />
                                            </a>
                                            <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors" aria-label="Author's Twitter">
                                                <TwitterIcon className="w-4 h-4" />
                                            </a>
                                            <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors" aria-label="Author's LinkedIn">
                                                <LinkedInIcon className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </article>

                            <CommentSection />
                        </div>

                        <div className="mt-12 lg:mt-0">
                            <Sidebar />
                        </div>
                    </div>
                </main>
            </div>
            
            <InstagramFeed />
        </div>
    );
};

export default PostPage;
