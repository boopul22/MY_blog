import React, { useState, useEffect } from 'react';

interface URLValidationResult {
  isValid: boolean;
  score: number;
  issues: Array<{
    type: 'error' | 'warning' | 'suggestion';
    message: string;
    fix?: string;
  }>;
  suggestions: string[];
}

interface URLValidatorProps {
  title: string;
  currentSlug?: string;
  onSlugChange: (slug: string) => void;
  className?: string;
}

const URLValidator: React.FC<URLValidatorProps> = ({
  title,
  currentSlug = '',
  onSlugChange,
  className = ''
}) => {
  const [slug, setSlug] = useState(currentSlug);
  const [validation, setValidation] = useState<URLValidationResult | null>(null);
  const [isManuallyEdited, setIsManuallyEdited] = useState(false);

  useEffect(() => {
    if (!isManuallyEdited && title) {
      const autoSlug = generateSlugFromTitle(title);
      setSlug(autoSlug);
      onSlugChange(autoSlug);
    }
  }, [title, isManuallyEdited, onSlugChange]);

  useEffect(() => {
    if (slug) {
      const result = validateURL(slug);
      setValidation(result);
    }
  }, [slug]);

  const generateSlugFromTitle = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      // Replace spaces and special characters with hyphens
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      // Remove multiple consecutive hyphens
      .replace(/-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-|-$/g, '')
      // Limit length
      .substring(0, 75);
  };

  const validateURL = (url: string): URLValidationResult => {
    const issues: URLValidationResult['issues'] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check length
    if (url.length === 0) {
      issues.push({
        type: 'error',
        message: 'URL slug is required',
        fix: 'Generate from title or enter manually'
      });
      score -= 50;
    } else if (url.length > 75) {
      issues.push({
        type: 'warning',
        message: `URL is too long (${url.length} characters). Keep under 75 characters.`,
        fix: 'Shorten the URL slug'
      });
      score -= 20;
    } else if (url.length > 50) {
      issues.push({
        type: 'suggestion',
        message: `URL is getting long (${url.length} characters). Consider shortening for better SEO.`,
        fix: 'Remove unnecessary words'
      });
      score -= 10;
    }

    // Check for invalid characters
    const invalidChars = url.match(/[^a-z0-9-]/g);
    if (invalidChars) {
      issues.push({
        type: 'error',
        message: `Invalid characters found: ${[...new Set(invalidChars)].join(', ')}`,
        fix: 'Use only lowercase letters, numbers, and hyphens'
      });
      score -= 30;
    }

    // Check for uppercase letters
    if (/[A-Z]/.test(url)) {
      issues.push({
        type: 'warning',
        message: 'URL contains uppercase letters',
        fix: 'Convert to lowercase'
      });
      score -= 15;
    }

    // Check for multiple consecutive hyphens
    if (/--+/.test(url)) {
      issues.push({
        type: 'warning',
        message: 'URL contains multiple consecutive hyphens',
        fix: 'Replace with single hyphens'
      });
      score -= 10;
    }

    // Check for leading/trailing hyphens
    if (url.startsWith('-') || url.endsWith('-')) {
      issues.push({
        type: 'warning',
        message: 'URL starts or ends with hyphen',
        fix: 'Remove leading/trailing hyphens'
      });
      score -= 10;
    }

    // Check for stop words
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
    const urlWords = url.split('-');
    const foundStopWords = urlWords.filter(word => stopWords.includes(word));
    
    if (foundStopWords.length > 2) {
      issues.push({
        type: 'suggestion',
        message: `URL contains many stop words: ${foundStopWords.join(', ')}`,
        fix: 'Remove unnecessary stop words for cleaner URL'
      });
      score -= 5;
    }

    // Check for numbers at the beginning
    if (/^\d/.test(url)) {
      issues.push({
        type: 'suggestion',
        message: 'URL starts with a number',
        fix: 'Consider starting with a descriptive word'
      });
      score -= 5;
    }

    // Check for readability
    if (urlWords.length > 8) {
      issues.push({
        type: 'suggestion',
        message: `URL has many words (${urlWords.length}). Consider simplifying.`,
        fix: 'Focus on 3-6 key words'
      });
      score -= 5;
    }

    // Generate suggestions for improvement
    if (url) {
      // Suggest cleaned version
      const cleanedUrl = url
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      if (cleanedUrl !== url && cleanedUrl) {
        suggestions.push(cleanedUrl);
      }

      // Suggest shortened version
      const shortenedUrl = urlWords
        .filter(word => !stopWords.includes(word))
        .slice(0, 6)
        .join('-');
      
      if (shortenedUrl !== url && shortenedUrl && !suggestions.includes(shortenedUrl)) {
        suggestions.push(shortenedUrl);
      }

      // Suggest version with key words only
      const keyWords = urlWords
        .filter(word => word.length > 3 && !stopWords.includes(word))
        .slice(0, 4)
        .join('-');
      
      if (keyWords !== url && keyWords && !suggestions.includes(keyWords)) {
        suggestions.push(keyWords);
      }
    }

    return {
      isValid: issues.filter(i => i.type === 'error').length === 0,
      score: Math.max(0, score),
      issues,
      suggestions: suggestions.slice(0, 3) // Limit to 3 suggestions
    };
  };

  const handleSlugChange = (newSlug: string) => {
    setSlug(newSlug);
    setIsManuallyEdited(true);
    onSlugChange(newSlug);
  };

  const applySuggestion = (suggestion: string) => {
    setSlug(suggestion);
    setIsManuallyEdited(true);
    onSlugChange(suggestion);
  };

  const autoFix = () => {
    const fixed = generateSlugFromTitle(slug);
    setSlug(fixed);
    onSlugChange(fixed);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getIssueIcon = (type: 'error' | 'warning' | 'suggestion'): JSX.Element => {
    switch (type) {
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'suggestion':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          URL Optimization
        </h3>
        {validation && (
          <div className="text-right">
            <div className={`text-xl font-bold ${getScoreColor(validation.score)}`}>
              {validation.score}/100
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">SEO Score</div>
          </div>
        )}
      </div>

      {/* URL Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          URL Slug
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
            /post/
          </span>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="enter-url-slug-here"
          />
        </div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Preview: <span className="font-mono">https://myawesomeblog.com/post/{slug || 'your-slug-here'}</span>
        </div>
      </div>

      {/* Auto-fix button */}
      <div className="mb-4">
        <button
          onClick={autoFix}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Auto-fix URL
        </button>
      </div>

      {/* Validation Results */}
      {validation && validation.issues.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Issues</h4>
          <div className="space-y-2">
            {validation.issues.map((issue, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                {getIssueIcon(issue.type)}
                <div className="flex-1">
                  <div className="text-gray-900 dark:text-white">{issue.message}</div>
                  {issue.fix && (
                    <div className="text-gray-600 dark:text-gray-400 text-xs">
                      Fix: {issue.fix}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {validation && validation.suggestions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Suggestions</h4>
          <div className="space-y-2">
            {validation.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm font-mono text-gray-900 dark:text-white">{suggestion}</span>
                <button
                  onClick={() => applySuggestion(suggestion)}
                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Use
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEO Tips */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          URL SEO Best Practices:
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Keep URLs short and descriptive (under 75 characters)</li>
          <li>• Use hyphens to separate words, not underscores</li>
          <li>• Include target keywords naturally</li>
          <li>• Avoid stop words when possible</li>
          <li>• Use lowercase letters only</li>
        </ul>
      </div>
    </div>
  );
};

export default URLValidator;
