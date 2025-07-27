
import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { BlogContext } from '../../context/SupabaseBlogContext';
import PostCard from '../../components/PostCard';

const CategoryPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const context = useContext(BlogContext);

    if (!context) {
        return <div>Loading...</div>;
    }

    const { posts, categories } = context;
    const category = categories.find(c => c.slug === slug);
    const filteredPosts = posts.filter(post => post.categoryId === category?.id && post.status === 'published');

    return (
        <div>
            {category ? (
                <>
                    <title>{`Posts in ${category.name}`}</title>
                    <meta name="description" content={`Browse all posts in the ${category.name} category.`} />
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 border-b-2 border-primary pb-2">
                        Posts in: {category.name}
                    </h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map(post => <PostCard key={post.id} post={post} />)
                        ) : (
                            <p className="col-span-full">No posts found in this category.</p>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <title>Category not found</title>
                    <p>Category not found.</p>
                </>
            )}
        </div>
    );
};

export default CategoryPage;
