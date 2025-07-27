import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) {
    return null; // Don't render on the home page
  }

  // Do not render breadcrumbs for admin pages, login, or sitemap
  const adminPaths = ['admin', 'login', 'sitemap.xml'];
  if (adminPaths.some(p => pathnames.includes(p))) {
    return null;
  }

  // Custom display names for specific routes
  const routeDisplayNames: { [key: string]: string } = {
    'all-posts': 'All Posts',
    'post': 'All Posts', // Since /post redirects to /all-posts
  };

  return (
    <nav aria-label="breadcrumb" className="mb-4 text-sm text-gray-500 dark:text-gray-400">
      <ol className="list-none p-0 inline-flex">
        <li className="flex items-center">
          <Link to="/" className="hover:underline">Home</Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          // Use custom display name if available, otherwise capitalize and format
          const displayValue = routeDisplayNames[value] || value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

          return (
            <li key={to} className="flex items-center">
              <span className="mx-2">/</span>
              {isLast ? (
                <span className="text-gray-700 dark:text-gray-200">{displayValue}</span>
              ) : (
                <Link to={to} className="hover:underline">{displayValue}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
