import { Post, Category } from '../types';

interface SitemapUrl {
    loc: string;
    lastmod?: string;
    changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: string;
    images?: Array<{
        loc: string;
        caption?: string;
        title?: string;
    }>;
}

interface SitemapConfig {
    baseUrl: string;
    defaultChangeFreq: SitemapUrl['changefreq'];
    includeImages: boolean;
    maxUrls: number;
}

export class SitemapService {
    private config: SitemapConfig;

    constructor(config: Partial<SitemapConfig> = {}) {
        this.config = {
            baseUrl: 'https://myawesomeblog.com',
            defaultChangeFreq: 'weekly',
            includeImages: true,
            maxUrls: 50000,
            ...config
        };
    }

    private calculatePostPriority(post: Post): string {
        const now = new Date();
        const postDate = new Date(post.createdAt);
        const daysSincePublished = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Higher priority for newer posts
        if (daysSincePublished <= 7) return '0.9';
        if (daysSincePublished <= 30) return '0.8';
        if (daysSincePublished <= 90) return '0.7';
        if (daysSincePublished <= 365) return '0.6';
        return '0.5';
    }

    private calculateChangeFreq(post: Post): SitemapUrl['changefreq'] {
        const now = new Date();
        const postDate = new Date(post.createdAt);
        const daysSincePublished = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSincePublished <= 1) return 'hourly';
        if (daysSincePublished <= 7) return 'daily';
        if (daysSincePublished <= 30) return 'weekly';
        return 'monthly';
    }

    private escapeXml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    generateSitemap(posts: Post[], categories: Category[]): string {
        const urls: SitemapUrl[] = [];

        // Homepage
        urls.push({
            loc: this.config.baseUrl,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: '1.0'
        });

        // Static pages
        const staticPages = [
            { path: '/about', priority: '0.8', changefreq: 'monthly' as const },
            { path: '/contact', priority: '0.7', changefreq: 'monthly' as const },
            { path: '/privacy', priority: '0.3', changefreq: 'yearly' as const },
            { path: '/terms', priority: '0.3', changefreq: 'yearly' as const },
            { path: '/sitemap', priority: '0.5', changefreq: 'weekly' as const }
        ];

        staticPages.forEach(page => {
            urls.push({
                loc: `${this.config.baseUrl}${page.path}`,
                changefreq: page.changefreq,
                priority: page.priority
            });
        });

        // Categories
        categories.forEach(category => {
            const categoryPosts = posts.filter(p => p.categoryId === category.id && p.status === 'published');
            const lastPostDate = categoryPosts.length > 0 
                ? Math.max(...categoryPosts.map(p => new Date(p.updatedAt || p.createdAt).getTime()))
                : Date.now();

            urls.push({
                loc: `${this.config.baseUrl}/category/${category.slug}`,
                lastmod: new Date(lastPostDate).toISOString(),
                changefreq: 'weekly',
                priority: '0.8'
            });
        });

        // Posts
        const publishedPosts = posts.filter(post => post.status === 'published');
        publishedPosts.forEach(post => {
            const images = this.config.includeImages && post.imageUrl ? [{
                loc: post.imageUrl,
                caption: this.escapeXml(post.title),
                title: this.escapeXml(post.title)
            }] : undefined;

            urls.push({
                loc: `${this.config.baseUrl}/post/${post.slug}`,
                lastmod: new Date(post.updatedAt || post.createdAt).toISOString(),
                changefreq: this.calculateChangeFreq(post),
                priority: this.calculatePostPriority(post),
                images
            });
        });

        // Limit URLs if necessary
        const limitedUrls = urls.slice(0, this.config.maxUrls);

        // Generate XML
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${limitedUrls.map(url => `  <url>
    <loc>${this.escapeXml(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
    ${url.images ? url.images.map(img => `    <image:image>
      <image:loc>${this.escapeXml(img.loc)}</image:loc>
      ${img.caption ? `<image:caption>${img.caption}</image:caption>` : ''}
      ${img.title ? `<image:title>${img.title}</image:title>` : ''}
    </image:image>`).join('\n') : ''}
  </url>`).join('\n')}
</urlset>`;

        return sitemap;
    }

    generateSitemapIndex(sitemaps: Array<{ loc: string; lastmod?: string }>): string {
        const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${this.escapeXml(sitemap.loc)}</loc>
    ${sitemap.lastmod ? `<lastmod>${sitemap.lastmod}</lastmod>` : ''}
  </sitemap>`).join('\n')}
</sitemapindex>`;

        return sitemapIndex;
    }

    async submitToSearchEngines(sitemapUrl: string): Promise<{ success: boolean; results: Array<{ engine: string; success: boolean; error?: string }> }> {
        const searchEngines = [
            {
                name: 'Google',
                url: `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
            },
            {
                name: 'Bing',
                url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
            }
        ];

        const results = [];
        let overallSuccess = true;

        for (const engine of searchEngines) {
            try {
                const response = await fetch(engine.url, { method: 'GET' });
                const success = response.ok;
                
                results.push({
                    engine: engine.name,
                    success,
                    error: success ? undefined : `HTTP ${response.status}: ${response.statusText}`
                });

                if (!success) {
                    overallSuccess = false;
                }
            } catch (error) {
                results.push({
                    engine: engine.name,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
                overallSuccess = false;
            }
        }

        return { success: overallSuccess, results };
    }

    generateRobotsTxt(sitemapUrl: string, additionalRules: string[] = []): string {
        const robots = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${sitemapUrl}

# Additional rules
${additionalRules.join('\n')}

# Crawl-delay for polite crawling
Crawl-delay: 1

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /*.json$
Disallow: /*?*utm_*
Disallow: /*?*ref=*
Disallow: /*?*fbclid=*

# Allow important files
Allow: /robots.txt
Allow: /sitemap.xml
Allow: /.well-known/`;

        return robots;
    }

    validateSitemap(sitemapXml: string): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Basic XML validation
        try {
            // Simple XML validation - in a real app, you'd use a proper XML parser
            if (!sitemapXml.includes('<?xml version="1.0"')) {
                errors.push('Missing XML declaration');
            }

            if (!sitemapXml.includes('<urlset')) {
                errors.push('Missing urlset element');
            }

            if (!sitemapXml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
                errors.push('Missing or incorrect namespace');
            }

            // Check for required elements
            const urlMatches = sitemapXml.match(/<url>/g);
            const locMatches = sitemapXml.match(/<loc>/g);

            if (urlMatches && locMatches && urlMatches.length !== locMatches.length) {
                errors.push('Mismatch between url and loc elements');
            }

            // Check URL count
            if (urlMatches && urlMatches.length > 50000) {
                errors.push('Too many URLs (maximum 50,000 per sitemap)');
            }

            // Check file size (approximate)
            if (sitemapXml.length > 50 * 1024 * 1024) { // 50MB
                errors.push('Sitemap too large (maximum 50MB)');
            }

        } catch (error) {
            errors.push('Invalid XML format');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

export const sitemapService = new SitemapService();
