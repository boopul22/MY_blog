
import React, { useContext } from 'react';
import { BlogContext } from '../../context/SupabaseBlogContext';
import PostCard from '../../components/PostCard';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
    const context = useContext(BlogContext);

    if (!context) {
        return <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-slate-500 dark:text-slate-400">Loading...</p>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8">
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
                    <button className="border border-slate-400 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium py-3 px-6 sm:px-8 text-sm hover:bg-slate-100 dark:hover:bg-medium-dark transition-colors">
                        View all trending articles
                    </button>
                </div>
            </main>

            {/* Instagram Feed Section */}
            <section className="py-12 sm:py-16">
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center gap-3 text-slate-800 dark:text-slate-200 text-base sm:text-lg">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-slate-400 dark:border-slate-600 rounded-md flex items-center justify-center">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 border-2 border-slate-400 dark:border-slate-600 rounded-full"></div>
                        </div>
                        <span className="font-medium">@athena_magazine</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif text-slate-800 dark:text-slate-200 mt-2">Follow Me On Instagram</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base px-4">Stay updated with our latest stories and behind-the-scenes content</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-square bg-slate-300 dark:bg-slate-700 border border-white dark:border-slate-600 hover:opacity-80 transition-opacity cursor-pointer rounded-sm overflow-hidden">
                            {/* Placeholder for Instagram image */}
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
};

export default HomePage;
