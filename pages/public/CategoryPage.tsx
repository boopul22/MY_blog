
import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { BlogContext } from '../../context/SupabaseBlogContext';
import PostCard from '../../components/PostCard';


const CategoryPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const context = useContext(BlogContext);

    if (!context) {
        return (
            <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-slate-500 dark:text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    const { posts, categories } = context;
    const category = categories.find(c => c.slug === slug);
    const filteredPosts = posts.filter(post => post.categoryId === category?.id && post.status === 'published');

    return (
        <div className="bg-light dark:bg-dark min-h-screen">
            {category ? (
                <>
                    <title>{`${category.name} - Athena Creative Magazine`}</title>
                    <meta name="description" content={`Browse all posts in the ${category.name} category. Discover insightful articles and stories.`} />
                    
                    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                        
                        {/* Category Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-tight text-dark-text dark:text-light-text mb-4">
                                {category.name}
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                                Explore our collection of {category.name.toLowerCase()} articles and insights
                            </p>
                            <div className="w-16 h-0.5 bg-primary mx-auto mt-6"></div>
                        </div>
                        
                        {/* Posts Grid */}
                        {filteredPosts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                {filteredPosts.map(post => (
                                    <PostCard key={post.id} post={post} variant="wireframe" />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <div className="w-8 h-8 border-2 border-slate-400 dark:border-slate-500 rounded"></div>
                                </div>
                                <h3 className="text-xl font-semibold text-dark-text dark:text-light-text mb-2">
                                    No posts found
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    There are currently no published posts in the {category.name} category.
                                </p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <title>Category not found - Athena Creative Magazine</title>
                    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-dark-text dark:text-light-text mb-4">
                                Category Not Found
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 mb-8">
                                The category you're looking for doesn't exist or has been moved.
                            </p>
                            <a href="/" className="inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition-colors">
                                Back to Home
                            </a>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CategoryPage;
