import React, { useState, useEffect, useContext, useCallback } from 'react';
import { BlogContext } from '../context/SupabaseBlogContext';
import { Post } from '../types';
import { LinkIcon, XMarkIcon, MagnifyingGlassIcon, GlobeAltIcon, DocumentTextIcon } from './icons';
import Spinner from './Spinner';

interface LinkEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertLink: (url: string, text: string, title?: string) => void;
  initialUrl?: string;
  initialText?: string;
  mode?: 'insert' | 'edit';
}

interface LinkPreview {
  title: string;
  description: string;
  image?: string;
  url: string;
}

const LinkEditor: React.FC<LinkEditorProps> = ({
  isOpen,
  onClose,
  onInsertLink,
  initialUrl = '',
  initialText = '',
  mode = 'insert'
}) => {
  const { posts, searchPosts } = useContext(BlogContext);
  const [activeTab, setActiveTab] = useState<'internal' | 'external'>('external');
  const [url, setUrl] = useState(initialUrl);
  const [linkText, setLinkText] = useState(initialText);
  const [title, setTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [openInNewTab, setOpenInNewTab] = useState(false);

  // Search internal posts
  useEffect(() => {
    if (activeTab === 'internal' && searchQuery.trim()) {
      setIsSearching(true);
      const timeoutId = setTimeout(async () => {
        try {
          if (searchPosts) {
            const results = await searchPosts(searchQuery);
            setSearchResults(results);
          } else {
            // Fallback to filtering existing posts
            const filtered = posts.filter(post =>
              post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSearchResults(filtered);
          }
        } catch (error) {
          console.error('Search failed:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, activeTab, posts, searchPosts]);

  // Generate link preview for external URLs
  const generateLinkPreview = useCallback(async (url: string) => {
    if (!url || !isValidUrl(url)) {
      setLinkPreview(null);
      return;
    }

    setIsLoadingPreview(true);
    try {
      // In a real implementation, you'd call a backend service to fetch metadata
      // For now, we'll simulate this with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock preview data
      setLinkPreview({
        title: 'Example Website',
        description: 'This is a sample description of the linked website.',
        image: 'https://via.placeholder.com/400x200',
        url: url
      });
    } catch (error) {
      console.error('Failed to generate preview:', error);
      setLinkPreview(null);
    } finally {
      setIsLoadingPreview(false);
    }
  }, []);

  // Validate URL
  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Handle external URL changes
  useEffect(() => {
    if (activeTab === 'external' && url) {
      const timeoutId = setTimeout(() => {
        generateLinkPreview(url);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [url, activeTab, generateLinkPreview]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !linkText) return;

    const finalUrl = openInNewTab && !url.includes('target=') ? url : url;
    onInsertLink(finalUrl, linkText, title || undefined);
    onClose();
  };

  const handleInternalLinkSelect = (post: Post) => {
    const postUrl = `/blog/${post.slug}`;
    setUrl(postUrl);
    setLinkText(linkText || post.title);
    setTitle(post.title);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-bg rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {mode === 'edit' ? 'Edit Link' : 'Insert Link'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('external')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'external'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <GlobeAltIcon className="w-4 h-4 inline mr-2" />
            External Link
          </button>
          <button
            onClick={() => setActiveTab('internal')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'internal'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <DocumentTextIcon className="w-4 h-4 inline mr-2" />
            Internal Link
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {activeTab === 'external' ? (
            <>
              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              {/* Link Preview */}
              {isLoadingPreview && (
                <div className="flex items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <Spinner size="sm" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading preview...</span>
                </div>
              )}

              {linkPreview && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex gap-3">
                    {linkPreview.image && (
                      <img
                        src={linkPreview.image}
                        alt=""
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{linkPreview.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{linkPreview.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{linkPreview.url}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Internal Post Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Posts
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for posts..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Search Results */}
              {searchQuery && (
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  {isSearching ? (
                    <div className="flex items-center justify-center p-4">
                      <Spinner size="sm" />
                      <span className="ml-2 text-gray-600 dark:text-gray-400">Searching...</span>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No posts found
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {searchResults.map((post) => (
                        <button
                          key={post.id}
                          type="button"
                          onClick={() => handleInternalLinkSelect(post)}
                          className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <h4 className="font-medium text-gray-900 dark:text-white">{post.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {post.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Link Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Link Text
            </label>
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Enter link text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            />
          </div>

          {/* Title (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Link title for accessibility"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Options */}
          {activeTab === 'external' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="newTab"
                checked={openInNewTab}
                onChange={(e) => setOpenInNewTab(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="newTab" className="text-sm text-gray-700 dark:text-gray-300">
                Open in new tab
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!url || !linkText}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {mode === 'edit' ? 'Update Link' : 'Insert Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LinkEditor;
