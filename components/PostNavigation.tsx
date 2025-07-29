import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';

interface PostNavigationProps {
    currentPost: Post;
    allPosts: Post[];
}

export const PostNavigation: React.FC<PostNavigationProps> = ({ currentPost, allPosts }) => {
    // Find current post index
    const currentIndex = allPosts.findIndex(post => post.id === currentPost.id);
    
    // Get previous and next posts
    const previousPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
    const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

    if (!previousPost && !nextPost) {
        return null;
    }

    return (
        <nav className="post-navigation">
            {/* Previous Post */}
            {previousPost && (
                <Link to={`/post/${previousPost.slug}`} className="post-nav-item">
                    <div className="post-nav-label">Previous Article</div>
                    <div className="post-nav-title">{previousPost.title}</div>
                    <div className="flex items-center justify-between mt-2">
                        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {previousPost.imageUrl && (
                            <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                                <img
                                    src={previousPost.imageUrl}
                                    alt={previousPost.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>
                </Link>
            )}

            {/* Next Post */}
            {nextPost && (
                <Link to={`/post/${nextPost.slug}`} className="post-nav-item text-right">
                    <div className="post-nav-label">Next Article</div>
                    <div className="post-nav-title">{nextPost.title}</div>
                    <div className="flex items-center justify-between mt-2">
                        {nextPost.imageUrl && (
                            <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                                <img
                                    src={nextPost.imageUrl}
                                    alt={nextPost.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </Link>
            )}
        </nav>
    );
};
