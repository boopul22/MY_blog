
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';
import { BlogContext } from '../context/SupabaseBlogContext';
import { createExcerpt } from '../utils/textUtils';

interface PostCardProps {
  post: Post;
  variant?: 'default' | 'grid' | 'list' | 'wireframe' | 'mobile-fluid';
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

  if (variant === 'mobile-fluid') {
    return (
        <article className="group mobile-post-card-minimal py-6 md:border md:border-border md:rounded-lg md:p-4 md:mb-4 md:bg-card md:shadow-sm">
            {/* Mobile: Edge-to-edge image */}
            <Link to={`/post/${post.slug}`} className="block mb-4">
                <div className="mobile-hero-image md:w-full md:mx-0 md:rounded-lg overflow-hidden">
                    <div className={`w-full ${isLarge ? 'aspect-[16/10]' : 'aspect-[16/9]'} bg-muted`}>
                        {post.imageUrl && (
                            <img
                                src={post.imageUrl}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                                loading="lazy"
                                decoding="async"
                            />
                        )}
                    </div>
                </div>
            </Link>

            {/* Content with mobile-optimized spacing */}
            <div className="space-y-3">
                {/* Category and date - horizontal on mobile */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-3">
                        {category && (
                            <Link to={`/category/${category.slug}`} className="font-medium uppercase tracking-wider hover:text-primary transition-colors">
                                {category.name}
                            </Link>
                        )}
                        <span>•</span>
                        <span>{formattedDate}</span>
                    </div>
                    <span className="hidden sm:inline">BY {post.authorName.toUpperCase()}</span>
                </div>

                {/* Title and excerpt */}
                <div className="space-y-2">
                    <Link to={`/post/${post.slug}`} className="block">
                        <h3 className={`font-serif font-bold text-foreground hover:text-primary transition-colors leading-tight ${
                            isLarge ? 'text-xl sm:text-2xl lg:text-3xl' : 'text-lg sm:text-xl'
                        }`}>
                            {post.title}
                        </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {getExcerpt(isLarge ? 180 : 120)}
                    </p>
                </div>

                {/* Author on mobile */}
                <div className="sm:hidden text-xs text-muted-foreground">
                    BY {post.authorName.toUpperCase()}
                </div>
            </div>
        </article>
    );
  }

  if (variant === 'wireframe') {
    return (
        <div className="group relative flex border border-border rounded-lg p-4 mb-4 sm:mb-6 bg-card text-card-foreground hover:border-muted-foreground transition-colors">
            {/* Date positioned vertically within the card boundaries */}
            <div className="flex items-center justify-center pr-4">
                <p
                    className="text-xs text-muted-foreground font-medium tracking-widest uppercase"
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                >
                    {formattedDate}
                </p>
            </div>

            {/* Main content area */}
            <div className="flex-1">
                <div className="mb-4 sm:mb-6">
                    <Link to={`/post/${post.slug}`} className="block">
                        <div className={`w-full ${isLarge ? 'aspect-[4/3] sm:aspect-[4/3]' : 'aspect-[4/5] sm:aspect-[4/5]'} bg-muted border border-border overflow-hidden group-hover:opacity-90 transition-opacity`}>
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
                    <div className="flex items-center space-x-4">
                        {category && (
                            <Link to={`/category/${category.slug}`} className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium uppercase tracking-wider hover:bg-secondary/20 transition-colors">
                                {category.name}
                            </Link>
                        )}
                        <span className="text-xs text-muted-foreground">BY {post.authorName.toUpperCase()}</span>
                    </div>
                    <div className="space-y-2">
                        <Link to={`/post/${post.slug}`} className="block">
                            <h3 className={`font-serif font-bold text-foreground hover:text-primary transition-colors leading-tight text-left ${
                                isLarge ? 'text-lg sm:text-xl lg:text-2xl' : 'text-base sm:text-lg'
                            }`}>
                                {post.title}
                            </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
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
      <article className="group bg-card text-card-foreground rounded-lg border border-border hover:border-muted-foreground transition-colors duration-200 overflow-hidden mb-6" style={{willChange: 'transform', transform: 'translateZ(0)'}}>
        <div className="grid md:grid-cols-3 gap-0 items-stretch">
          <div className="md:col-span-1">
            <Link to={`/post/${post.slug}`} className="block h-full">
              <div className="relative bg-muted p-3 h-full">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-48 md:h-full object-cover rounded border border-border transition-transform duration-200 group-hover:scale-[1.02]"
                  style={{willChange: 'transform', transform: 'translateZ(0)'}}
                  loading="lazy"
                  decoding="async"
                  width="400"
                  height="192"
                />
                <div className="absolute inset-3 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-opacity duration-200 rounded" style={{willChange: 'opacity'}}></div>
              </div>
            </Link>
          </div>
          <div className="md:col-span-2 p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              {category && (
                <Link to={`/category/${category.slug}`} className="uppercase tracking-wider hover:text-foreground transition-colors">
                  {category.name}
                </Link>
              )}
              <span className="uppercase tracking-wider">{formattedDate}</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-foreground leading-tight group-hover:text-muted-foreground transition-colors text-left">
              <Link to={`/post/${post.slug}`}>
                {post.title}
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {getExcerpt(120)}
            </p>
            <div className="pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground font-medium tracking-wider">
                BY <span className="text-foreground">{post.authorName.toUpperCase()}</span>
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'grid') {
    return (
      <article className="group bg-card text-card-foreground rounded-lg border border-border hover:border-muted-foreground transition-colors duration-200 overflow-hidden mb-4 sm:mb-6" style={{willChange: 'transform', transform: 'translateZ(0)'}}>
        <div className="relative">
          <Link to={`/post/${post.slug}`} className="block">
            <div className="relative bg-muted p-3">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-48 object-cover rounded border border-border transition-transform duration-200 group-hover:scale-[1.02]"
                style={{willChange: 'transform', transform: 'translateZ(0)'}}
                loading="lazy"
                decoding="async"
                width="400"
                height="192"
              />
              <div className="absolute inset-3 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-opacity duration-200 rounded" style={{willChange: 'opacity'}}></div>
            </div>
          </Link>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            {category && (
              <Link to={`/category/${category.slug}`} className="uppercase tracking-wider hover:text-foreground transition-colors">
                {category.name}
              </Link>
            )}
            <span className="uppercase tracking-wider">{formattedDate}</span>
          </div>
          <h3 className="text-lg font-serif font-bold text-foreground leading-tight group-hover:text-muted-foreground transition-colors text-left">
            <Link to={`/post/${post.slug}`}>
              {post.title}
            </Link>
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {getExcerpt(100)}
          </p>
          <div className="pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground font-medium tracking-wider">
            BY <span className="text-foreground">{post.authorName.toUpperCase()}</span>
            </span>
          </div>
        </div>
      </article>
    );
  }

  // Default variant - Gallery-inspired design with contained date
  return (
    <div className="group bg-card text-card-foreground rounded-lg border border-border hover:border-muted-foreground transition-colors duration-200 overflow-hidden mb-4 sm:mb-6" style={{willChange: 'transform', transform: 'translateZ(0)'}}>
      <div className="flex">
        {/* Date positioned vertically within the card */}
        <div className="flex items-center justify-center bg-muted px-3">
          <div className="transform -rotate-90">
            <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase whitespace-nowrap">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1">
          {/* Image with frame-like styling */}
          <Link to={`/post/${post.slug}`} className="block">
            <div className="relative bg-muted p-4">
              <img
                className="w-full h-64 object-cover rounded border border-border transition-transform duration-200 group-hover:scale-[1.02]"
                src={post.imageUrl}
                alt={post.title}
                style={{willChange: 'transform', transform: 'translateZ(0)'}}
                loading="lazy"
                decoding="async"
                width="400"
                height="256"
              />
              {/* Subtle overlay on hover */}
              <div className="absolute inset-4 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-opacity duration-200 rounded" style={{willChange: 'opacity'}}></div>
            </div>
          </Link>

          <div className="p-6 space-y-4">
            {/* Category */}
            <div className="text-xs text-muted-foreground font-medium">
              {category && (
                <Link to={`/category/${category.slug}`} className="uppercase tracking-wider hover:text-foreground transition-colors">
                  {category.name}
                </Link>
              )}
            </div>
            
            {/* Title */}
            <h2 className="text-xl font-serif font-bold text-foreground leading-tight group-hover:text-muted-foreground transition-colors text-left">
              <Link to={`/post/${post.slug}`}>
                {post.title}
              </Link>
            </h2>

            {/* Content Preview */}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {getExcerpt(120)}
            </p>

            {/* Author */}
            <div className="pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground font-medium tracking-wider">
                BY <span className="text-foreground">{post.authorName.toUpperCase()}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
