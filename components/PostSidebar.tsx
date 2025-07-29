import React from 'react';
import { Link } from 'react-router-dom';
import { Post, Tag } from '../types';

interface PostSidebarProps {
    post: Post;
    tags: Tag[];
    relatedPosts?: Post[];
}

export const PostSidebar: React.FC<PostSidebarProps> = ({ post, tags, relatedPosts = [] }) => {
    // Calculate reading time
    const readTime = Math.ceil((post.content?.length || 0) / 1000);
    
    // Get post tags
    const postTags = post.tags?.map(tagId => tags.find(tag => tag.id === tagId)).filter(Boolean) || [];
    
    // Generate table of contents from content
    const generateTOC = (content: string) => {
        const headingRegex = /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi;
        const headings: { level: number; text: string; id: string }[] = [];
        let match;
        
        while ((match = headingRegex.exec(content)) !== null) {
            const level = parseInt(match[1]);
            const text = match[2].replace(/<[^>]*>/g, '').trim();
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            headings.push({ level, text, id });
        }
        
        return headings;
    };
    
    const tableOfContents = generateTOC(post.content || '');

    return (
        <aside className="post-sidebar">
            {/* Article Information */}
            <div className="sidebar-widget">
                <h3 className="sidebar-widget-title">Article Information</h3>
                <div className="space-y-4">
                    {/* Category */}
                    {postTags.length > 0 && (
                        <div className="post-meta-item">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className="text-sm text-muted-foreground">Category:</span>
                            <Link 
                                to={`/tag/${postTags[0]?.slug}`}
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                {postTags[0]?.name}
                            </Link>
                        </div>
                    )}
                    
                    {/* Date */}
                    <div className="post-meta-item">
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-muted-foreground">Updated:</span>
                        <time className="text-sm font-medium">
                            {new Date(post.updatedAt || post.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </time>
                    </div>
                    
                    {/* Author */}
                    <div className="post-meta-item">
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm text-muted-foreground">Author:</span>
                        <span className="text-sm font-medium text-primary">
                            {post.authorName || 'Author'}
                        </span>
                    </div>
                    
                    {/* Reading Time */}
                    <div className="post-meta-item">
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-muted-foreground">Reading time:</span>
                        <span className="text-sm font-medium">{readTime} min</span>
                    </div>
                </div>
            </div>

            {/* Table of Contents */}
            {tableOfContents.length > 0 && (
                <div className="sidebar-widget">
                    <h3 className="sidebar-widget-title">Table of Contents</h3>
                    <nav>
                        <ul className="space-y-2">
                            {tableOfContents.map((heading, index) => (
                                <li key={index}>
                                    <a
                                        href={`#${heading.id}`}
                                        className={`block text-sm hover:text-primary transition-colors ${
                                            heading.level === 2 ? 'font-medium' : 'ml-4 text-muted-foreground'
                                        }`}
                                    >
                                        {heading.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            )}

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <div className="sidebar-widget">
                    <h3 className="sidebar-widget-title">Related Articles</h3>
                    <div className="space-y-4">
                        {relatedPosts.slice(0, 3).map((relatedPost, index) => (
                            <article key={relatedPost.id} className="group">
                                <Link to={`/post/${relatedPost.slug}`} className="block">
                                    {relatedPost.imageUrl && (
                                        <div className="aspect-video mb-2 overflow-hidden rounded-md bg-muted">
                                            <img
                                                src={relatedPost.imageUrl}
                                                alt={relatedPost.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            />
                                        </div>
                                    )}
                                    <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                        {relatedPost.title}
                                    </h4>
                                    <time className="text-xs text-muted-foreground mt-1 block">
                                        {new Date(relatedPost.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </time>
                                </Link>
                            </article>
                        ))}
                    </div>
                </div>
            )}
        </aside>
    );
};
