import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BlogContext } from '../context/SupabaseBlogContext';

interface BreadcrumbItem {
  name: string;
  url: string;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  customBreadcrumbs?: BreadcrumbItem[];
  showHome?: boolean;
  separator?: string;
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  customBreadcrumbs,
  showHome = true,
  separator = '/',
  className = ''
}) => {
  const location = useLocation();
  const context = useContext(BlogContext);
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Use custom breadcrumbs if provided
  if (customBreadcrumbs) {
    return renderBreadcrumbs(customBreadcrumbs, separator, className);
  }

  if (pathnames.length === 0 && !showHome) {
    return null; // Don't render on the home page if showHome is false
  }

  // Do not render breadcrumbs for admin pages, login, or sitemap
  const adminPaths = ['admin', 'login', 'sitemap.xml'];
  if (adminPaths.some(p => pathnames.includes(p))) {
    return null;
  }

  // Generate breadcrumbs based on current path
  const breadcrumbs = generateBreadcrumbsFromPath(pathnames, context);

  return renderBreadcrumbs(breadcrumbs, separator, className);
};

// Helper function to generate breadcrumbs from path
const generateBreadcrumbsFromPath = (pathnames: string[], context: any): BreadcrumbItem[] => {
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always add home
  breadcrumbs.push({
    name: 'Home',
    url: '/',
    isActive: false
  });

  // Custom display names for specific routes
  const routeDisplayNames: { [key: string]: string } = {
    'all-posts': 'All Posts',
    'post': 'All Posts',
    'category': 'Categories',
    'tag': 'Tags',
    'about': 'About',
    'contact': 'Contact',
    'privacy': 'Privacy Policy',
    'terms': 'Terms of Service'
  };

  pathnames.forEach((value, index) => {
    const url = `/${pathnames.slice(0, index + 1).join('/')}`;
    const isLast = index === pathnames.length - 1;
    let displayName = routeDisplayNames[value] || value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

    // Special handling for dynamic routes
    if (value === 'post' && pathnames[index + 1] && context) {
      // This is a post slug, get the actual post title
      const postSlug = pathnames[index + 1];
      const post = context.posts?.find((p: any) => p.slug === postSlug);
      if (post) {
        // Skip the 'post' breadcrumb and add the actual post title
        return;
      }
    } else if (value === 'category' && pathnames[index + 1] && context) {
      // This is a category slug, get the actual category name
      const categorySlug = pathnames[index + 1];
      const category = context.categories?.find((c: any) => c.slug === categorySlug);
      if (category) {
        // Skip the 'category' breadcrumb and add the actual category name
        return;
      }
    } else if (pathnames[index - 1] === 'post' && context) {
      // This is the actual post slug
      const post = context.posts?.find((p: any) => p.slug === value);
      displayName = post ? post.title : displayName;
    } else if (pathnames[index - 1] === 'category' && context) {
      // This is the actual category slug
      const category = context.categories?.find((c: any) => c.slug === value);
      displayName = category ? category.name : displayName;
    }

    breadcrumbs.push({
      name: displayName,
      url,
      isActive: isLast
    });
  });

  return breadcrumbs;
};

// Helper function to render breadcrumbs with schema markup
const renderBreadcrumbs = (breadcrumbs: BreadcrumbItem[], separator: string, className: string) => {
  if (breadcrumbs.length <= 1) {
    return null;
  }

  // Generate JSON-LD schema for breadcrumbs
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `https://myawesomeblog.com${crumb.url}`
    }))
  };

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />

      {/* Visible Breadcrumbs */}
      <nav
        aria-label="breadcrumb"
        className={`mb-4 text-sm text-gray-500 dark:text-gray-400 ${className}`}
      >
        <ol className="list-none p-0 inline-flex flex-wrap items-center">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <li key={crumb.url} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 text-gray-400 dark:text-gray-500" aria-hidden="true">
                    {separator}
                  </span>
                )}
                {isLast || crumb.isActive ? (
                  <span
                    className="text-gray-700 dark:text-gray-200 font-medium"
                    aria-current="page"
                  >
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    to={crumb.url}
                    className="hover:underline hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    {crumb.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;
