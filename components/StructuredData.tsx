
import React from 'react';
import { Post, Category } from '../types';

interface StructuredDataProps {
    post: Post;
    category?: Category;
    siteUrl?: string;
    siteName?: string;
    logoUrl?: string;
    breadcrumbs?: Array<{ name: string; url: string }>;
}

const StructuredData: React.FC<StructuredDataProps> = ({
    post,
    category,
    siteUrl = 'https://myawesomeblog.com',
    siteName = 'My Awesome Blog',
    logoUrl = 'https://myawesomeblog.com/logo.png',
    breadcrumbs = []
}) => {
    const postUrl = `${siteUrl}/post/${post.slug}`;
    const categoryUrl = category ? `${siteUrl}/category/${category.slug}` : undefined;

    // Clean content for word count and description
    const cleanContent = post.content.replace(/<[^>]*>/g, '').trim();
    const wordCount = cleanContent.split(/\s+/).filter(word => word.length > 0).length;

    // Main Article Schema
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        '@id': postUrl,
        headline: post.title,
        description: post.seoDescription,
        image: post.imageUrl ? {
            '@type': 'ImageObject',
            url: post.imageUrl,
            width: 1200,
            height: 630
        } : undefined,
        author: {
            '@type': 'Person',
            name: post.authorName,
            url: `${siteUrl}/author/${post.authorName.toLowerCase().replace(/\s+/g, '-')}`
        },
        publisher: {
            '@type': 'Organization',
            name: siteName,
            logo: {
                '@type': 'ImageObject',
                url: logoUrl,
                width: 200,
                height: 60
            },
            url: siteUrl
        },
        datePublished: new Date(post.createdAt).toISOString(),
        dateModified: new Date(post.updatedAt || post.createdAt).toISOString(),
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': postUrl
        },
        url: postUrl,
        wordCount: wordCount,
        keywords: post.metaKeywords || post.tags?.join(', '),
        articleSection: category?.name,
        genre: category?.name,
        inLanguage: 'en-US',
        isAccessibleForFree: true,
        isFamilyFriendly: true
    };

    // Website Schema
    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: siteName,
        description: 'A comprehensive blog covering technology, tutorials, and insights',
        publisher: {
            '@id': `${siteUrl}/#organization`
        },
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${siteUrl}/search?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
        }
    };

    // Organization Schema
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: siteName,
        url: siteUrl,
        logo: {
            '@type': 'ImageObject',
            '@id': `${siteUrl}/#logo`,
            url: logoUrl,
            width: 200,
            height: 60
        },
        sameAs: [
            'https://twitter.com/myawesomeblog',
            'https://facebook.com/myawesomeblog',
            'https://linkedin.com/company/myawesomeblog'
        ]
    };

    // Breadcrumb Schema
    const breadcrumbSchema = breadcrumbs.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: crumb.url
        }))
    } : null;

    // Blog Schema
    const blogSchema = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        '@id': `${siteUrl}/#blog`,
        url: siteUrl,
        name: siteName,
        description: 'A comprehensive blog covering technology, tutorials, and insights',
        publisher: {
            '@id': `${siteUrl}/#organization`
        },
        blogPost: {
            '@id': postUrl
        }
    };

    // Combine all schemas
    const combinedSchema = {
        '@context': 'https://schema.org',
        '@graph': [
            websiteSchema,
            organizationSchema,
            blogSchema,
            articleSchema,
            ...(breadcrumbSchema ? [breadcrumbSchema] : [])
        ]
    };

    return (
        <script type="application/ld+json">
            {JSON.stringify(combinedSchema, null, 0)}
        </script>
    );
};

export default StructuredData;
