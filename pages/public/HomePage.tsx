
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
                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
        </div>;
    }

    const { posts } = context;
    const publishedPosts = posts.filter(post => post.status === 'published');
    const articles = publishedPosts.slice(0, 12);

    return (
        <>
            {/* Main Article Grid */}
            <main className="py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
                    {/* First two large articles */}
                    {articles.slice(0, 2).map(article => (
                        <div key={article.id} className="lg:col-span-6">
                            <PostCard post={article} variant="wireframe" isLarge={true} />
                        </div>
                    ))}
                    
                    {/* Remaining smaller articles */}
                    {articles.slice(2, 12).map(article => (
                        <div key={article.id} className="lg:col-span-4">
                            <PostCard post={article} variant="wireframe" />
                        </div>
                    ))}
                </div>
                
                {/* View All Button */}
                <div className="text-center mt-12">
                    <button className="border border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium py-3 px-8 text-sm hover:bg-gray-100 dark:hover:bg-medium-dark transition-colors">
                        View all trending articles
                    </button>
                </div>
            </main>

            {/* Instagram Feed Section */}
            <section className="py-16">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 text-gray-800 dark:text-gray-200 text-lg">
                        <div className="w-6 h-6 border-2 border-gray-400 dark:border-gray-600 rounded-md flex items-center justify-center">
                            <div className="w-3 h-3 border-2 border-gray-400 dark:border-gray-600 rounded-full"></div>
                        </div>
                        <span className="font-medium">@athena_magazine</span>
                    </div>
                    <h2 className="text-3xl font-serif text-gray-800 dark:text-gray-200 mt-2">Follow Me On Instagram</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Stay updated with our latest stories and behind-the-scenes content</p>
                </div>
                <div className="flex w-full overflow-x-auto space-x-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-1/5">
                            <div className="w-full aspect-square bg-gray-300 dark:bg-gray-700 border border-white dark:border-gray-600 hover:opacity-80 transition-opacity cursor-pointer"></div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
};

export default HomePage;
