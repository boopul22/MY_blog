import React, { useState } from 'react';

interface SocialMediaPreviewProps {
  title: string;
  description: string;
  imageUrl?: string;
  url: string;
  siteName?: string;
}

const SocialMediaPreview: React.FC<SocialMediaPreviewProps> = ({
  title,
  description,
  imageUrl,
  url,
  siteName = 'My Awesome Blog',
}) => {
  const [activeTab, setActiveTab] = useState<'facebook' | 'twitter' | 'linkedin'>('facebook');

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  const defaultImage = 'https://via.placeholder.com/1200x630/007bff/ffffff?text=Blog+Post';
  const previewImage = imageUrl || defaultImage;

  const FacebookPreview = () => (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 max-w-md">
      <div className="aspect-[1.91/1] bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <img 
          src={previewImage} 
          alt="Preview" 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
      </div>
      <div className="p-3">
        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
          {new URL(url).hostname}
        </div>
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
          {truncateText(title, 100)}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
          {truncateText(description, 160)}
        </div>
      </div>
    </div>
  );

  const TwitterPreview = () => (
    <div className="border border-gray-300 dark:border-gray-600 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 max-w-md">
      <div className="aspect-[2/1] bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <img 
          src={previewImage} 
          alt="Preview" 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
      </div>
      <div className="p-3">
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
          {new URL(url).hostname}
        </div>
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
          {truncateText(title, 70)}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {truncateText(description, 200)}
        </div>
      </div>
    </div>
  );

  const LinkedInPreview = () => (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 max-w-md">
      <div className="aspect-[1.91/1] bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <img 
          src={previewImage} 
          alt="Preview" 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
      </div>
      <div className="p-3">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
          {truncateText(title, 100)}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
          {siteName}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {new URL(url).hostname}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Social Media Preview
      </h3>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('facebook')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'facebook'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Facebook
        </button>
        <button
          onClick={() => setActiveTab('twitter')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'twitter'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Twitter
        </button>
        <button
          onClick={() => setActiveTab('linkedin')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'linkedin'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          LinkedIn
        </button>
      </div>

      {/* Preview Content */}
      <div className="flex justify-center">
        {activeTab === 'facebook' && <FacebookPreview />}
        {activeTab === 'twitter' && <TwitterPreview />}
        {activeTab === 'linkedin' && <LinkedInPreview />}
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Optimization Tips:
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          {activeTab === 'facebook' && (
            <>
              <li>• Optimal image size: 1200 x 630 pixels</li>
              <li>• Title: Keep under 100 characters</li>
              <li>• Description: Keep under 160 characters</li>
            </>
          )}
          {activeTab === 'twitter' && (
            <>
              <li>• Optimal image size: 1200 x 600 pixels</li>
              <li>• Title: Keep under 70 characters</li>
              <li>• Description: Keep under 200 characters</li>
            </>
          )}
          {activeTab === 'linkedin' && (
            <>
              <li>• Optimal image size: 1200 x 627 pixels</li>
              <li>• Title: Keep under 100 characters</li>
              <li>• Focus on professional tone</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SocialMediaPreview;
