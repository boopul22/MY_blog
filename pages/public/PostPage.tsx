
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BlogContext } from '../../context/SupabaseBlogContext';
import { Post } from '../../types';
import { Link } from 'react-router-dom';

const PostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const context = useContext(BlogContext);
    const [post, setPost] = useState<Post | undefined>(undefined);

    useEffect(() => {
        if (slug && context) {
            const foundPost = context.getPostBySlug(slug);
            setPost(foundPost);
            if (foundPost) {
                document.title = foundPost.seoTitle || foundPost.title;
                // In a real app, you'd also set meta description here.
            }
        }
    }, [slug, context]);

    if (!post) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl">Post not found</h1>
                <Link to="/" className="text-primary hover:underline mt-4 inline-block">Back to Home</Link>
            </div>
        );
    }
    
    const category = context?.categories.find(c => c.id === post.categoryId);

    return (
        <article className="max-w-4xl mx-auto bg-white dark:bg-medium-dark rounded-lg shadow-xl p-4 sm:p-8 lg:p-12">
            {category && (
                <Link to={`/category/${category.slug}`} className="text-base font-bold uppercase text-primary dark:text-secondary hover:underline">
                    {category.name}
                </Link>
            )}
            <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
                {post.title}
            </h1>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                Published on {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            {post.imageUrl && (
                <img src={post.imageUrl} alt={post.title} className="mt-8 w-full h-auto max-h-[500px] object-cover rounded-lg" />
            )}
            
            <div 
                className="prose prose-lg dark:prose-invert max-w-none mt-8"
                dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
            />
        </article>
    );
};

export default PostPage;
