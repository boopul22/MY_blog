
import React from 'react';
import { Post } from '../types';

interface StructuredDataProps {
    post: Post;
}

const StructuredData: React.FC<StructuredDataProps> = ({ post }) => {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        image: post.imageUrl,
        editor: post.authorName,
        genre: post.tags?.join(', '),
        keywords: post.tags?.join(', '),
        wordcount: post.content.split(' ').length,
        publisher: {
            '@type': 'Organization',
            name: 'My Awesome Blog',
            logo: {
                '@type': 'ImageObject',
                url: 'https://myawesomeblog.com/logo.png',
            },
        },
        url: `https://myawesomeblog.com/post/${post.slug}`,
        datePublished: new Date(post.createdAt).toISOString(),
        dateCreated: new Date(post.createdAt).toISOString(),
        dateModified: new Date(post.updatedAt || post.createdAt).toISOString(),
        description: post.metaDescription,
        author: {
            '@type': 'Person',
            name: post.authorName,
        },
    };

    return (
        <script type="application/ld+json">
            {JSON.stringify(structuredData)}
        </script>
    );
};

export default StructuredData;
