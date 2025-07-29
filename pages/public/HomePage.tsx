
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

            {/* Main Article Grid with Enhanced Layout Structure */}
            <main className="content-section">
                <div className="main-container">
                    {/* Mobile: Fluid edge-to-edge layout */}
                    <div className="mobile-only">
                        <div className="content-section-compact">
                            {articles.slice(0, 8).map(article => (
                                <PostCard key={article.id} post={article} variant="mobile-fluid" isLarge={false} />
                            ))}
                        </div>
                    </div>

                    {/* Desktop: Enhanced Grid layout */}
                    <div className="desktop-only">
                        <div className="content-section-compact">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-fluid-md">
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
                        </div>
                    </div>

                    {/* View All Button Section */}
                    <div className="content-footer">
                        <div className="text-center">
                            {publishedPosts.length > 12 && (
                                <Link
                                    to="/all-posts"
                                    className="touch-target inline-flex items-center justify-center border border-border text-foreground font-medium rounded-lg text-fluid-sm hover:bg-muted transition-colors"
                                >
                                    View all trending articles
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default HomePage;
