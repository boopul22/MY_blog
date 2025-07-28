import React, { useMemo } from 'react';

interface SEOAnalyzerProps {
  title: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  focusKeyword?: string;
  slug: string;
}

interface SEOCheck {
  id: string;
  name: string;
  status: 'good' | 'warning' | 'error';
  message: string;
  score: number;
}

interface SEOAnalysis {
  overallScore: number;
  checks: SEOCheck[];
  readabilityScore: number;
  keywordDensity: number;
}

const SEOAnalyzer: React.FC<SEOAnalyzerProps> = ({
  title,
  content,
  seoTitle,
  seoDescription,
  focusKeyword = '',
  slug,
}) => {
  const analysis = useMemo((): SEOAnalysis => {
    const checks: SEOCheck[] = [];
    let totalScore = 0;
    const maxScore = 100;

    // Helper functions
    const stripHtml = (html: string): string => {
      return html.replace(/<[^>]*>/g, '').trim();
    };

    const getWordCount = (text: string): number => {
      return stripHtml(text).split(/\s+/).filter(word => word.length > 0).length;
    };

    const getSentenceCount = (text: string): number => {
      return stripHtml(text).split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    };

    const getKeywordDensity = (text: string, keyword: string): number => {
      if (!keyword) return 0;
      const words = stripHtml(text).toLowerCase().split(/\s+/);
      const keywordWords = keyword.toLowerCase().split(/\s+/);
      let matches = 0;
      
      for (let i = 0; i <= words.length - keywordWords.length; i++) {
        const phrase = words.slice(i, i + keywordWords.length).join(' ');
        if (phrase === keyword.toLowerCase()) {
          matches++;
        }
      }
      
      return words.length > 0 ? (matches / words.length) * 100 : 0;
    };

    const contentText = stripHtml(content);
    const wordCount = getWordCount(content);
    const sentenceCount = getSentenceCount(content);
    const keywordDensity = getKeywordDensity(content, focusKeyword);

    // 1. Title Length Check
    if (title.length >= 30 && title.length <= 60) {
      checks.push({
        id: 'title-length',
        name: 'Title Length',
        status: 'good',
        message: `Title length is optimal (${title.length} characters)`,
        score: 10,
      });
      totalScore += 10;
    } else if (title.length > 0) {
      checks.push({
        id: 'title-length',
        name: 'Title Length',
        status: 'warning',
        message: `Title should be 30-60 characters (currently ${title.length})`,
        score: 5,
      });
      totalScore += 5;
    } else {
      checks.push({
        id: 'title-length',
        name: 'Title Length',
        status: 'error',
        message: 'Title is required',
        score: 0,
      });
    }

    // 2. SEO Title Check
    if (seoTitle.length >= 50 && seoTitle.length <= 60) {
      checks.push({
        id: 'seo-title',
        name: 'SEO Title',
        status: 'good',
        message: `SEO title length is optimal (${seoTitle.length} characters)`,
        score: 10,
      });
      totalScore += 10;
    } else if (seoTitle.length > 0) {
      checks.push({
        id: 'seo-title',
        name: 'SEO Title',
        status: 'warning',
        message: `SEO title should be 50-60 characters (currently ${seoTitle.length})`,
        score: 5,
      });
      totalScore += 5;
    } else {
      checks.push({
        id: 'seo-title',
        name: 'SEO Title',
        status: 'error',
        message: 'SEO title is required',
        score: 0,
      });
    }

    // 3. Meta Description Check
    if (seoDescription.length >= 150 && seoDescription.length <= 160) {
      checks.push({
        id: 'meta-description',
        name: 'Meta Description',
        status: 'good',
        message: `Meta description length is optimal (${seoDescription.length} characters)`,
        score: 10,
      });
      totalScore += 10;
    } else if (seoDescription.length > 0) {
      checks.push({
        id: 'meta-description',
        name: 'Meta Description',
        status: 'warning',
        message: `Meta description should be 150-160 characters (currently ${seoDescription.length})`,
        score: 5,
      });
      totalScore += 5;
    } else {
      checks.push({
        id: 'meta-description',
        name: 'Meta Description',
        status: 'error',
        message: 'Meta description is required',
        score: 0,
      });
    }

    // 4. Content Length Check
    if (wordCount >= 300) {
      checks.push({
        id: 'content-length',
        name: 'Content Length',
        status: 'good',
        message: `Content has sufficient length (${wordCount} words)`,
        score: 10,
      });
      totalScore += 10;
    } else if (wordCount >= 150) {
      checks.push({
        id: 'content-length',
        name: 'Content Length',
        status: 'warning',
        message: `Content could be longer for better SEO (${wordCount} words)`,
        score: 5,
      });
      totalScore += 5;
    } else {
      checks.push({
        id: 'content-length',
        name: 'Content Length',
        status: 'error',
        message: `Content is too short (${wordCount} words). Aim for at least 300 words.`,
        score: 0,
      });
    }

    // 5. Focus Keyword in Title
    if (focusKeyword && title.toLowerCase().includes(focusKeyword.toLowerCase())) {
      checks.push({
        id: 'keyword-in-title',
        name: 'Focus Keyword in Title',
        status: 'good',
        message: 'Focus keyword appears in title',
        score: 10,
      });
      totalScore += 10;
    } else if (focusKeyword) {
      checks.push({
        id: 'keyword-in-title',
        name: 'Focus Keyword in Title',
        status: 'warning',
        message: 'Focus keyword should appear in title',
        score: 0,
      });
    }

    // 6. Focus Keyword Density
    if (focusKeyword) {
      if (keywordDensity >= 0.5 && keywordDensity <= 2.5) {
        checks.push({
          id: 'keyword-density',
          name: 'Keyword Density',
          status: 'good',
          message: `Keyword density is optimal (${keywordDensity.toFixed(1)}%)`,
          score: 10,
        });
        totalScore += 10;
      } else if (keywordDensity > 0) {
        checks.push({
          id: 'keyword-density',
          name: 'Keyword Density',
          status: 'warning',
          message: `Keyword density should be 0.5-2.5% (currently ${keywordDensity.toFixed(1)}%)`,
          score: 5,
        });
        totalScore += 5;
      } else {
        checks.push({
          id: 'keyword-density',
          name: 'Keyword Density',
          status: 'error',
          message: 'Focus keyword not found in content',
          score: 0,
        });
      }
    }

    // 7. URL Structure
    const isSlugOptimal = slug.length <= 75 && /^[a-z0-9-]+$/.test(slug) && !slug.includes('--');
    if (isSlugOptimal) {
      checks.push({
        id: 'url-structure',
        name: 'URL Structure',
        status: 'good',
        message: 'URL structure is SEO-friendly',
        score: 10,
      });
      totalScore += 10;
    } else {
      checks.push({
        id: 'url-structure',
        name: 'URL Structure',
        status: 'warning',
        message: 'URL could be more SEO-friendly (use lowercase, hyphens, keep under 75 chars)',
        score: 5,
      });
      totalScore += 5;
    }

    // 8. Readability Score (simplified Flesch Reading Ease)
    const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    const avgSyllablesPerWord = 1.5; // Simplified assumption
    const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    
    let readabilityStatus: 'good' | 'warning' | 'error' = 'good';
    let readabilityMessage = '';
    let readabilityScore = 10;

    if (fleschScore >= 60) {
      readabilityStatus = 'good';
      readabilityMessage = 'Content is easy to read';
      readabilityScore = 10;
    } else if (fleschScore >= 30) {
      readabilityStatus = 'warning';
      readabilityMessage = 'Content readability could be improved';
      readabilityScore = 5;
    } else {
      readabilityStatus = 'error';
      readabilityMessage = 'Content is difficult to read';
      readabilityScore = 0;
    }

    checks.push({
      id: 'readability',
      name: 'Readability',
      status: readabilityStatus,
      message: readabilityMessage,
      score: readabilityScore,
    });
    totalScore += readabilityScore;

    // 9. Headings Structure
    const headingMatches = content.match(/<h[1-6][^>]*>/gi) || [];
    if (headingMatches.length >= 2) {
      checks.push({
        id: 'headings',
        name: 'Heading Structure',
        status: 'good',
        message: `Good use of headings (${headingMatches.length} found)`,
        score: 10,
      });
      totalScore += 10;
    } else if (headingMatches.length === 1) {
      checks.push({
        id: 'headings',
        name: 'Heading Structure',
        status: 'warning',
        message: 'Consider adding more headings to structure content',
        score: 5,
      });
      totalScore += 5;
    } else {
      checks.push({
        id: 'headings',
        name: 'Heading Structure',
        status: 'error',
        message: 'No headings found. Add headings to structure content.',
        score: 0,
      });
    }

    // 10. Images with Alt Text
    const imageMatches = content.match(/<img[^>]*>/gi) || [];
    const imagesWithAlt = content.match(/<img[^>]*alt\s*=\s*["'][^"']*["'][^>]*>/gi) || [];
    
    if (imageMatches.length === 0) {
      checks.push({
        id: 'images',
        name: 'Images',
        status: 'warning',
        message: 'No images found. Consider adding relevant images.',
        score: 5,
      });
      totalScore += 5;
    } else if (imagesWithAlt.length === imageMatches.length) {
      checks.push({
        id: 'images',
        name: 'Images',
        status: 'good',
        message: `All images have alt text (${imageMatches.length} images)`,
        score: 10,
      });
      totalScore += 10;
    } else {
      checks.push({
        id: 'images',
        name: 'Images',
        status: 'warning',
        message: `${imageMatches.length - imagesWithAlt.length} images missing alt text`,
        score: 5,
      });
      totalScore += 5;
    }

    const overallScore = Math.round((totalScore / maxScore) * 100);

    return {
      overallScore,
      checks,
      readabilityScore: Math.max(0, Math.min(100, fleschScore)),
      keywordDensity,
    };
  }, [title, content, seoTitle, seoDescription, focusKeyword, slug]);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'error'): JSX.Element => {
    switch (status) {
      case 'good':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SEO Analysis</h3>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getScoreColor(analysis.overallScore)}`}>
            {analysis.overallScore}/100
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Overall Score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Readability Score</div>
          <div className={`text-xl font-semibold ${getScoreColor(analysis.readabilityScore)}`}>
            {Math.round(analysis.readabilityScore)}/100
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Keyword Density</div>
          <div className={`text-xl font-semibold ${getScoreColor(analysis.keywordDensity * 20)}`}>
            {analysis.keywordDensity.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">SEO Checks</h4>
        {analysis.checks.map((check) => (
          <div key={check.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex-shrink-0 mt-0.5">
              {getStatusIcon(check.status)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {check.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {check.message}
              </div>
            </div>
            <div className="flex-shrink-0 text-sm font-medium text-gray-500 dark:text-gray-400">
              {check.score}/10
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SEOAnalyzer;
