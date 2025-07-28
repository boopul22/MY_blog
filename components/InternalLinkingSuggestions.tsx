import React, { useState, useEffect, useContext } from 'react';
import { BlogContext } from '../context/SupabaseBlogContext';
import { Post } from '../types';

interface LinkSuggestion {
  post: Post;
  relevanceScore: number;
  suggestedAnchorText: string;
  reason: string;
  contextSnippet?: string;
}

interface InternalLinkingSuggestionsProps {
  currentPost: Partial<Post>;
  onInsertLink: (url: string, anchorText: string) => void;
  maxSuggestions?: number;
}

const InternalLinkingSuggestions: React.FC<InternalLinkingSuggestionsProps> = ({
  currentPost,
  onInsertLink,
  maxSuggestions = 5
}) => {
  const context = useContext(BlogContext);
  const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  useEffect(() => {
    if (currentPost.content && currentPost.title && context) {
      analyzeLinkingOpportunities();
    }
  }, [currentPost.content, currentPost.title, context]);

  const extractKeywords = (text: string): string[] => {
    // Remove HTML tags and clean text
    const cleanText = text.replace(/<[^>]*>/g, ' ').toLowerCase();
    
    // Split into words and filter
    const words = cleanText.split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !/^\d+$/.test(word)) // Remove pure numbers
      .filter(word => !['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other', 'more', 'very', 'what', 'know', 'just', 'first', 'into', 'over', 'think', 'also', 'your', 'work', 'life', 'only', 'can', 'still', 'should', 'after', 'being', 'now', 'made', 'before', 'here', 'through', 'when', 'where', 'much', 'some', 'these', 'many', 'then', 'them', 'well', 'were'].includes(word));

    // Count word frequency
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Return top keywords
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  };

  const calculateRelevanceScore = (targetPost: Post, keywords: string[]): number => {
    const targetContent = (targetPost.title + ' ' + targetPost.content + ' ' + (targetPost.seoDescription || '')).toLowerCase();
    
    let score = 0;
    let matchedKeywords = 0;

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = targetContent.match(regex);
      if (matches) {
        matchedKeywords++;
        // Title matches are worth more
        if (targetPost.title.toLowerCase().includes(keyword)) {
          score += matches.length * 3;
        } else {
          score += matches.length;
        }
      }
    });

    // Normalize score based on content length and keyword matches
    const contentLength = targetContent.length;
    const normalizedScore = (score / contentLength) * 1000 + (matchedKeywords / keywords.length) * 100;
    
    return Math.min(normalizedScore, 100);
  };

  const generateAnchorText = (post: Post, keywords: string[]): string => {
    // Try to find a relevant phrase from the post title
    const titleWords = post.title.toLowerCase().split(/\s+/);
    
    // Look for keyword matches in title
    for (const keyword of keywords) {
      if (titleWords.includes(keyword)) {
        return post.title;
      }
    }

    // Look for phrases in content that contain keywords
    const content = post.content.replace(/<[^>]*>/g, ' ').toLowerCase();
    const sentences = content.split(/[.!?]+/);
    
    for (const sentence of sentences.slice(0, 5)) { // Check first 5 sentences
      for (const keyword of keywords.slice(0, 5)) { // Check top 5 keywords
        if (sentence.includes(keyword)) {
          const words = sentence.trim().split(/\s+/);
          const keywordIndex = words.findIndex(word => word.includes(keyword));
          if (keywordIndex !== -1) {
            // Extract a phrase around the keyword
            const start = Math.max(0, keywordIndex - 2);
            const end = Math.min(words.length, keywordIndex + 3);
            const phrase = words.slice(start, end).join(' ');
            if (phrase.length > 10 && phrase.length < 60) {
              return phrase.charAt(0).toUpperCase() + phrase.slice(1);
            }
          }
        }
      }
    }

    // Fallback to post title
    return post.title;
  };

  const getReasonForSuggestion = (post: Post, score: number, keywords: string[]): string => {
    const matchedKeywords = keywords.filter(keyword => 
      (post.title + ' ' + post.content).toLowerCase().includes(keyword)
    );

    if (score > 50) {
      return `High relevance: Shares ${matchedKeywords.length} keywords including "${matchedKeywords.slice(0, 2).join('", "')}"`;
    } else if (score > 25) {
      return `Medium relevance: Related content with shared topics`;
    } else {
      return `Low relevance: Some topical overlap`;
    }
  };

  const analyzeLinkingOpportunities = async () => {
    if (!context || !currentPost.content || !currentPost.title) return;

    setIsAnalyzing(true);
    try {
      const { posts } = context;
      const publishedPosts = posts.filter(p => 
        p.status === 'published' && 
        p.id !== currentPost.id
      );

      // Extract keywords from current post
      const keywords = extractKeywords(currentPost.title + ' ' + currentPost.content);
      setSelectedKeywords(keywords.slice(0, 10));

      // Calculate relevance scores for all posts
      const scoredPosts = publishedPosts.map(post => {
        const score = calculateRelevanceScore(post, keywords);
        return {
          post,
          relevanceScore: score,
          suggestedAnchorText: generateAnchorText(post, keywords),
          reason: getReasonForSuggestion(post, score, keywords)
        };
      });

      // Sort by relevance and take top suggestions
      const topSuggestions = scoredPosts
        .filter(s => s.relevanceScore > 5) // Minimum threshold
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, maxSuggestions);

      setSuggestions(topSuggestions);
    } catch (error) {
      console.error('Error analyzing linking opportunities:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInsertLink = (suggestion: LinkSuggestion) => {
    const url = `/post/${suggestion.post.slug}`;
    onInsertLink(url, suggestion.suggestedAnchorText);
  };

  if (!context) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Internal Linking Suggestions
        </h3>
        <button
          onClick={analyzeLinkingOpportunities}
          disabled={isAnalyzing}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isAnalyzing ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      {/* Keywords */}
      {selectedKeywords.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Detected Keywords:
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedKeywords.slice(0, 8).map((keyword, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {isAnalyzing ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Analyzing content for linking opportunities...
          </p>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.post.id}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {suggestion.post.title}
                </h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    suggestion.relevanceScore > 50 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : suggestion.relevanceScore > 25
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
                    {Math.round(suggestion.relevanceScore)}% match
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {suggestion.reason}
              </p>
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Suggested anchor: <span className="font-medium">"{suggestion.suggestedAnchorText}"</span>
                </div>
                <button
                  onClick={() => handleInsertLink(suggestion)}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Insert Link
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No relevant internal linking opportunities found.</p>
          <p className="text-xs mt-1">Try adding more content or keywords to get suggestions.</p>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Internal Linking Tips:
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Use descriptive anchor text that tells readers what to expect</li>
          <li>• Link to relevant, high-quality content that adds value</li>
          <li>• Aim for 2-5 internal links per 1000 words</li>
          <li>• Link to both newer and older content to distribute page authority</li>
        </ul>
      </div>
    </div>
  );
};

export default InternalLinkingSuggestions;
