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
    <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-bold text-dark-text dark:text-light-text mb-4 relative after:content-[''] after:absolute after:left-0 after:bottom-[-8px] after:w-8 after:h-0.5 after:bg-slate-800 dark:after:bg-slate-200">
        TABLE OF CONTENTS
      </h3>
      <nav>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li key={heading.id}>
              <button
                onClick={() => scrollToHeading(heading.id)}
                className={`text-left w-full text-sm transition-colors hover:text-primary dark:hover:text-primary ${
                  activeId === heading.id
                    ? 'text-primary dark:text-primary font-semibold'
                    : 'text-gray-600 dark:text-gray-400'
                } ${
                  heading.level === 2 ? 'pl-0' :
                  heading.level === 3 ? 'pl-4' : 'pl-8'
                }`}
              >
                <span className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    activeId === heading.id
                      ? 'bg-primary dark:bg-primary'
                      : 'bg-gray-400 dark:bg-gray-500'
                  }`} />
                  {heading.text}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default TableOfContents;