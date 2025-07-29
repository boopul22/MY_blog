import React, { useEffect, useState, useRef } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ content, className = '' }) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Extract headings from content
    const extractHeadings = () => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      
      const headingElements = tempDiv.querySelectorAll('h2, h3, h4');
      const extractedHeadings: Heading[] = [];
      
      headingElements.forEach((heading, index) => {
        const text = heading.textContent || '';
        const level = parseInt(heading.tagName.charAt(1));
        const id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        
        extractedHeadings.push({ id, text, level });
      });
      
      setHeadings(extractedHeadings);
    };

    extractHeadings();
  }, [content]);

  useEffect(() => {
    // Add IDs to actual headings in the DOM and set up intersection observer
    const addIdsToHeadings = () => {
      const actualHeadings = document.querySelectorAll('h2, h3, h4');
      
      actualHeadings.forEach((heading, index) => {
        const text = heading.textContent || '';
        const id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        heading.id = id;
      });

      // Set up intersection observer for active heading tracking
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        },
        {
          rootMargin: '-20% 0% -35% 0%',
          threshold: 0
        }
      );

      actualHeadings.forEach((heading) => {
        if (observerRef.current) {
          observerRef.current.observe(heading);
        }
      });
    };

    if (headings.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(addIdsToHeadings, 100);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-slate-800 border border-slate-200/20 dark:border-slate-700/20 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-5 pb-3 border-b border-slate-200/30 dark:border-slate-700/30 text-dark-text dark:text-light-text">
        📋 Table of Contents
      </h3>
      <nav className="space-y-1">
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => scrollToHeading(heading.id)}
            className={`
              block w-full text-left py-2 px-3 rounded text-sm transition-colors
              ${heading.level === 2 ? 'font-medium' : ''}
              ${heading.level === 2 ? 'ml-0' : ''}
              ${heading.level === 3 ? 'ml-4' : ''}
              ${heading.level === 4 ? 'ml-8' : ''}
              ${activeId === heading.id
                ? 'bg-primary/10 text-primary border-l-2 border-primary'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }
            `}
          >
            <span className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                activeId === heading.id
                  ? 'bg-primary'
                  : 'bg-slate-400 dark:bg-slate-500'
              }`} />
              <span className="truncate">{heading.text}</span>
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TableOfContents;