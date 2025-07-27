
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';
import { BlogContext } from '../context/SupabaseBlogContext';

interface PostCardProps {
  post: Post;
  variant?: 'default' | 'grid' | 'list' | 'wireframe';
  isLarge?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, variant = 'default', isLarge = false }) => {
  const context = useContext(BlogContext);
  const category = context?.categories.find(c => c.id === post.categoryId);

  const formattedDate = new Date(post.createdAt)
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    .toUpperCase();

  if (variant === 'wireframe') {
    return (
        <div className="group relative">
            <div className="absolute top-0 left-0 -ml-10 transform -translate-x-full h-full flex items-center" aria-hidden="true">
                <p 
                    className="text-xs text-gray-400 font-medium tracking-widest uppercase"
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                >
                    {formattedDate}
                </p>
            </div>
            
            <div className="mb-6">
                <Link to={`/post/${post.slug}`} className="block">
                    <div className={`w-full ${isLarge ? 'aspect-[4/3]' : 'aspect-[4/5]'} bg-gray-300 border border-gray-200 overflow-hidden group-hover:opacity-90 transition-opacity`}>
                        {post.imageUrl && (
                            <img 
                                src={post.imageUrl} 
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                </Link>
            </div>
            
            <div className="space-y-3">
                <div className="flex items-center space-x-4">
                    {category && (
                        <Link to={`/category/${category.slug}`} className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium uppercase tracking-wider hover:bg-gray-300">
                            {category.name}
                        </Link>
                    )}
                    <span className="text-xs text-gray-500">BY {post.authorName.toUpperCase()}</span>
                </div>
                <div className="space-y-2">
                    <Link to={`/post/${post.slug}`} className="block">
                        <h3 className={`font-serif font-bold text-gray-800 hover:text-gray-600 transition-colors leading-tight ${
                            isLarge ? 'text-xl lg:text-2xl' : 'text-lg'
                        }`}>
                            {post.title}
                        </h3>
                    </Link>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {post.content.substring(0, isLarge ? 150 : 100)}...
                    </p>
                </div>
            </div>
        </div>
    );
  }

  if (variant === 'list') {
    return (
      <article className="group border-b border-gray-200 dark:border-gray-700 pb-8 last:border-b-0">
        <div className="grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-1">
            <Link to={`/post/${post.slug}`} className="block overflow-hidden rounded-lg">
              <img 
                src={post.imageUrl} 
                alt={post.title}
                className="w-full h-48 md:h-32 object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
              {category && (
                <Link to={`/category/${category.slug}`} className="uppercase hover:text-primary font-medium tracking-wider">
                  {category.name}
                </Link>
              )}
              <span>•</span>
              <span className="uppercase tracking-wider">{formattedDate}</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-dark-text dark:text-white group-hover:text-primary transition-colors">
              <Link to={`/post/${post.slug}`}>
                {post.title}
              </Link>
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {post.content.substring(0, 120)}...
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span>BY <span className="text-primary font-medium">{post.authorName.toUpperCase()}</span></span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'grid') {
    return (
      <article className="group">
        <div className="space-y-4">
          <Link to={`/post/${post.slug}`} className="block overflow-hidden rounded-lg">
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
              {category && (
                <Link to={`/category/${category.slug}`} className="uppercase hover:text-primary font-medium tracking-wider">
                  {category.name}
                </Link>
              )}
              <span>•</span>
              <span className="uppercase tracking-wider">{formattedDate}</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-dark-text dark:text-white group-hover:text-primary transition-colors leading-tight">
              <Link to={`/post/${post.slug}`}>
                {post.title}
              </Link>
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {post.content.substring(0, 100)}...
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span>BY <span className="text-primary font-medium">{post.authorName.toUpperCase()}</span></span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Default variant
  return (
    <div className="group">
      <div className="relative">
        {/* Date */}
        <div className="absolute left-0 top-0 z-10">
            <div className="absolute top-4 -left-3 transform -rotate-90 origin-bottom-left bg-white dark:bg-dark-text px-2 py-1">
                <span className="text-xs font-semibold tracking-widest text-gray-500 dark:text-gray-300">{formattedDate}</span>
            </div>
        </div>

        {/* Image */}
        <Link to={`/post/${post.slug}`} className="block overflow-hidden">
          <img 
            className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105" 
            src={post.imageUrl} 
            alt={post.title} 
          />
        </Link>
      </div>

      <div className="pt-6">
        {/* Category and Author */}
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wider">
          {category && (
            <Link to={`/category/${category.slug}`} className="uppercase hover:text-primary">{category.name}</Link>
          )}
          <span className="mx-2">•</span>
          <span>BY <span className="text-primary">{post.authorName.toUpperCase()}</span></span>
        </div>
        
        {/* Title */}
        <h2 className="mt-3 text-2xl font-serif font-bold text-dark-text dark:text-white transition-colors group-hover:text-primary">
          <Link to={`/post/${post.slug}`}>
            {post.title}
          </Link>
        </h2>
      </div>
    </div>
  );
};

export default PostCard;
