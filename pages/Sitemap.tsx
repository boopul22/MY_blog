
import React, { useContext } from 'react';
import { BlogContext } from '../context/SupabaseBlogContext';

const Sitemap: React.FC = () => {
    const context = useContext(BlogContext);

    if (!context) {
        return null;
    }

    const { posts, categories } = context;

    const generateSitemap = () => {
        const urls = [
            { loc: 'https://myawesomeblog.com/', changefreq: 'daily', priority: '1.0' },
        ];

        categories.forEach(category => {
            urls.push({
                loc: `https://myawesomeblog.com/category/${category.slug}`,
                changefreq: 'weekly',
                priority: '0.8',
            });
        });

        posts.forEach(post => {
            if (post.status === 'published') {
                urls.push({
                    loc: `https://myawesomeblog.com/post/${post.slug}`,
                    changefreq: 'monthly',
                    priority: '0.7',
                });
            }
        });

        const sitemap = `
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                ${urls.map(url => `
                    <url>
                        <loc>${url.loc}</loc>
                        <changefreq>${url.changefreq}</changefreq>
                        <priority>${url.priority}</priority>
                    </url>
                `).join('')}
            </urlset>
        `;

        return sitemap;
    };

    return (
        <pre>
            {generateSitemap()}
        </pre>
    );
};

export default Sitemap;
