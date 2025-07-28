import React, { useEffect } from 'react';
import { Post } from '../types';

interface SocialMetaTagsProps {
  post: Post;
  siteUrl?: string;
  siteName?: string;
  twitterHandle?: string;
}

const SocialMetaTags: React.FC<SocialMetaTagsProps> = ({
  post,
  siteUrl = 'https://myawesomeblog.com',
  siteName = 'My Awesome Blog',
  twitterHandle = '@myawesomeblog',
}) => {
  const postUrl = `${siteUrl}/post/${post.slug}`;
  const imageUrl = post.imageUrl || `${siteUrl}/default-og-image.jpg`;
  
  // Truncate description for social media
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  const ogDescription = truncateText(post.seoDescription || post.content.replace(/<[^>]*>/g, ''), 160);
  const twitterDescription = truncateText(post.seoDescription || post.content.replace(/<[^>]*>/g, ''), 200);

  useEffect(() => {
    // Update document title
    document.title = post.seoTitle || post.title;

    // Function to update or create meta tag
    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;

      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic Meta Tags
    updateMetaTag('description', post.seoDescription);
    if (post.metaKeywords) updateMetaTag('keywords', post.metaKeywords);
    updateMetaTag('author', post.authorName);

    // Open Graph Meta Tags
    updateMetaTag('og:type', 'article', true);
    updateMetaTag('og:title', post.seoTitle || post.title, true);
    updateMetaTag('og:description', ogDescription, true);
    updateMetaTag('og:url', postUrl, true);
    updateMetaTag('og:site_name', siteName, true);
    updateMetaTag('og:image', imageUrl, true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);
    updateMetaTag('og:image:alt', post.title, true);
    updateMetaTag('og:locale', 'en_US', true);

    // Article specific Open Graph tags
    updateMetaTag('article:author', post.authorName, true);
    updateMetaTag('article:published_time', new Date(post.createdAt).toISOString(), true);
    updateMetaTag('article:modified_time', new Date(post.updatedAt || post.createdAt).toISOString(), true);

    // Twitter Card Meta Tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:site', twitterHandle);
    updateMetaTag('twitter:creator', twitterHandle);
    updateMetaTag('twitter:title', post.seoTitle || post.title);
    updateMetaTag('twitter:description', twitterDescription);
    updateMetaTag('twitter:image', imageUrl);
    updateMetaTag('twitter:image:alt', post.title);

    // Additional SEO Meta Tags
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('googlebot', 'index, follow');
    updateMetaTag('bingbot', 'index, follow');

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', postUrl);

    // Add JSON-LD structured data
    let jsonLd = document.querySelector('script[type="application/ld+json"]');
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.setAttribute('type', 'application/ld+json');
      document.head.appendChild(jsonLd);
    }

    jsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.seoDescription,
      "image": imageUrl,
      "author": {
        "@type": "Person",
        "name": post.authorName
      },
      "publisher": {
        "@type": "Organization",
        "name": siteName,
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/logo.png`
        }
      },
      "datePublished": new Date(post.createdAt).toISOString(),
      "dateModified": new Date(post.updatedAt || post.createdAt).toISOString(),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": postUrl
      },
      "keywords": post.metaKeywords,
      "wordCount": post.content.replace(/<[^>]*>/g, '').split(/\s+/).length,
      "url": postUrl
    });

    // Cleanup function to remove meta tags when component unmounts
    return () => {
      // Note: In a real app, you might want to restore previous meta tags
      // For now, we'll leave them as they are
    };
  }, [post, postUrl, imageUrl, ogDescription, twitterDescription, siteName, siteUrl, twitterHandle]);

  return null; // This component doesn't render anything visible
};

export default SocialMetaTags;
