
import React, { useContext } from 'react';
import { BlogContext } from '../../context/SupabaseBlogContext';
import PostCard from '../../components/PostCard';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
    const context = useContext(BlogContext);

    if (!context || !context.criticalDataLoaded) {
        return <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading...</p>
            </div>
        </div>;
    }

    const { posts } = context;
    const publishedPosts = posts.filter(post => post.status === 'published');
    const articles = publishedPosts.slice(0, 12);

    return (
        <>
            <title>My Awesome Blog</title>
            <meta name="description" content="Welcome to my awesome blog where I write about cool stuff." />
            
            {/* Main Article Grid */}
            <main className="py-8 sm:py-12">
                {/* Mobile: Fluid edge-to-edge layout */}
                <div className="md:hidden space-y-0">
                    {articles.slice(0, 8).map(article => (
                        <PostCard key={article.id} post={article} variant="mobile-fluid" isLarge={false} />
                    ))}
                </div>

                {/* Desktop: Grid layout */}
                <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8">
                    {/* First two large articles */}
                    {articles.slice(0, 2).map(article => (
                        <div key={article.id} className="sm:col-span-2 lg:col-span-6">
                            <PostCard post={article} variant="wireframe" isLarge={true} />
                        </div>
                    ))}

                    {/* Remaining smaller articles */}
                    {articles.slice(2, 12).map(article => (
                        <div key={article.id} className="sm:col-span-1 lg:col-span-4">
                            <PostCard post={article} variant="wireframe" />
                        </div>
                    ))}
                </div>
                
                {/* View All Button */}
                <div className="text-center mt-8 sm:mt-12">
                    {publishedPosts.length > 12 && (
                        <Link 
                            to="/all-posts" 
                            className="inline-block border border-slate-400 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium py-3 px-6 sm:px-8 text-sm hover:bg-slate-100 dark:hover:bg-medium-dark transition-colors"
                        >
                            View all trending articles
                        </Link>
                    )}
                </div>
            </main>


        </>
    );
};

export default HomePage;
