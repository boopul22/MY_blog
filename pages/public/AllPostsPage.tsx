import React, { useContext, useState } from 'react';
import { BlogContext } from '../../context/SupabaseBlogContext';
import PostCard from '../../components/PostCard';


const AllPostsPage: React.FC = () => {
    const context = useContext(BlogContext);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 12;

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

    const { posts } = context;
    const publishedPosts = posts.filter(post => post.status === 'published');
    const totalPages = Math.ceil(publishedPosts.length / postsPerPage);
    const startIndex = (currentPage - 1) * postsPerPage;
    const currentPosts = publishedPosts.slice(startIndex, startIndex + postsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="bg-light dark:bg-dark min-h-screen">
            <title>All Articles - Athena Creative Magazine</title>
            <meta name="description" content="Browse all our published articles and stories. Discover insights, trends, and creative content." />
            
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                
                {/* Page Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-tight text-dark-text dark:text-light-text mb-4">
                        All Articles
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                        Explore our complete collection of articles, insights, and stories
                    </p>
                    <div className="w-16 h-0.5 bg-primary mx-auto mt-6"></div>
                </div>
                
                {/* Posts Grid */}
                {currentPosts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {currentPosts.map(post => (
                                <PostCard key={post.id} post={post} variant="wireframe" />
                            ))}
                        </div>
                        
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2 mt-12">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                                            currentPage === page
                                                ? 'bg-primary text-white'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="w-8 h-8 border-2 border-slate-400 dark:border-slate-500 rounded"></div>
                        </div>
                        <h3 className="text-xl font-semibold text-dark-text dark:text-light-text mb-2">
                            No articles found
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                            There are currently no published articles available.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllPostsPage;