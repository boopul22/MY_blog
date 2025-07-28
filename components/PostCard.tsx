
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';
import { BlogContext } from '../context/SupabaseBlogContext';
import { createExcerpt } from '../utils/textUtils';

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

  // Use excerpt if available, otherwise generate from content
  const getExcerpt = (maxLength: number) => {
    return post.excerpt || createExcerpt(post.content, maxLength);
  };

  if (variant === 'wireframe') {
    return (
        <div className="group relative flex flex-col sm:flex-row border border-slate-300 dark:border-slate-500 rounded-lg p-4 mb-4 sm:mb-6 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-400 transition-colors">
            {/* Date positioned vertically within the card boundaries */}
            <div className="flex sm:items-center justify-center sm:pr-4 pb-2 sm:pb-0">
                <p className="text-xs text-secondary font-medium tracking-widest uppercase sm:vertical-text">
                    {formattedDate}
                </p>
            </div>
            
            {/* Main content area */}
            <div className="flex-1">
                <div className="mb-4 sm:mb-6">
                    <Link to={`/post/${post.slug}`} className="block">
                        <div className={`w-full ${isLarge ? 'aspect-[4/3] sm:aspect-[4/3]' : 'aspect-[4/5] sm:aspect-[4/5]'} bg-slate-300 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 overflow-hidden group-hover:opacity-90 transition-opacity`}>
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
                
                <div className="space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        {category && (
                            <Link to={`/category/${category.slug}`} className="inline-block px-3 py-1 bg-light dark:bg-medium-dark text-secondary dark:text-slate-300 rounded-full text-xs font-medium uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-light-dark transition-colors w-fit">
                                {category.name}
                            </Link>
                        )}
                        <span className="text-xs text-secondary">BY {post.authorName.toUpperCase()}</span>
                    </div>
                    <div className="space-y-2">
                        <Link to={`/post/${post.slug}`} className="block">
                            <h3 className={`font-serif font-bold text-dark-text dark:text-light-text hover:text-primary transition-colors leading-tight text-left ${
                                isLarge ? 'text-lg sm:text-xl lg:text-2xl' : 'text-base sm:text-lg'
                            }`}>
                                {post.title}
                            </h3>
                        </Link>
                        <p className="text-sm text-secondary leading-relaxed">
                            {getExcerpt(isLarge ? 150 : 100)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  if (variant === 'list') {
    return (
      <article className="group bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-500 hover:border-slate-400 dark:hover:border-slate-400 transition-colors duration-300 overflow-hidden mb-6">
        <div className="grid md:grid-cols-3 gap-0 items-stretch">
          <div className="md:col-span-1">
            <Link to={`/post/${post.slug}`} className="block h-full">
              <div className="relative bg-slate-50 dark:bg-slate-800 p-3 h-full">
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="w-full h-48 md:h-full object-cover rounded border border-slate-200 dark:border-slate-600 transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-3 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 rounded"></div>
              </div>
            </Link>
          </div>
          <div className="md:col-span-2 p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              {category && (
                <Link to={`/category/${category.slug}`} className="uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                  {category.name}
                </Link>
              )}
              <span className="uppercase tracking-wider">{formattedDate}</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100 leading-tight group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors text-left">
              <Link to={`/post/${post.slug}`}>
                {post.title}
              </Link>
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {getExcerpt(120)}
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wider">
                BY <span className="text-slate-700 dark:text-slate-300">{post.authorName.toUpperCase()}</span>
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'grid') {
    return (
      <article className="group bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-500 hover:border-slate-400 dark:hover:border-slate-400 transition-colors duration-300 overflow-hidden mb-4 sm:mb-6">
        <div className="relative">
          <Link to={`/post/${post.slug}`} className="block">
            <div className="relative bg-slate-50 dark:bg-slate-800 p-3">
              <img 
                src={post.imageUrl} 
                alt={post.title}
                className="w-full h-48 object-cover rounded border border-slate-200 dark:border-slate-600 transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-3 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 rounded"></div>
            </div>
          </Link>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            {category && (
              <Link to={`/category/${category.slug}`} className="uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                {category.name}
              </Link>
            )}
            <span className="uppercase tracking-wider">{formattedDate}</span>
          </div>
          <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100 leading-tight group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors text-left">
            <Link to={`/post/${post.slug}`}>
              {post.title}
            </Link>
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
            {getExcerpt(100)}
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wider">
            BY <span className="text-slate-700 dark:text-slate-300">{post.authorName.toUpperCase()}</span>
            </span>
          </div>
        </div>
      </article>
    );
  }

  // Default variant - Gallery-inspired design with contained date
  return (
    <div className="group bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-500 hover:border-slate-400 dark:hover:border-slate-400 transition-colors duration-300 overflow-hidden mb-4 sm:mb-6">
      <div className="flex">
        {/* Date positioned vertically within the card */}
        <div className="flex items-center justify-center bg-slate-50 dark:bg-slate-800 px-3">
          <div className="transform -rotate-90">
            <span className="text-xs font-medium tracking-widest text-slate-600 dark:text-slate-400 uppercase whitespace-nowrap">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1">
          {/* Image with frame-like styling */}
          <Link to={`/post/${post.slug}`} className="block">
            <div className="relative bg-slate-50 dark:bg-slate-800 p-4">
              <img 
                className="w-full h-64 object-cover rounded border border-slate-200 dark:border-slate-600 transition-transform duration-300 group-hover:scale-[1.02]" 
                src={post.imageUrl} 
                alt={post.title} 
              />
              {/* Subtle overlay on hover */}
              <div className="absolute inset-4 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 rounded"></div>
            </div>
          </Link>

          <div className="p-6 space-y-4">
            {/* Category */}
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {category && (
                <Link to={`/category/${category.slug}`} className="uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                  {category.name}
                </Link>
              )}
            </div>
            
            {/* Title */}
            <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-gray-100 leading-tight group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors text-left">
              <Link to={`/post/${post.slug}`}>
                {post.title}
              </Link>
            </h2>

            {/* Content Preview */}
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
              {getExcerpt(120)}
            </p>

            {/* Author */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wider">
                BY <span className="text-gray-700 dark:text-gray-300">{post.authorName.toUpperCase()}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
