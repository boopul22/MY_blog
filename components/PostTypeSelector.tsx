import React, { useState, useEffect } from 'react';
import { PostType } from '../types';
import { postTypeService } from '../services/postTypeService';

interface PostTypeSelectorProps {
  value: string;
  onChange: (postType: string) => void;
  disabled?: boolean;
  className?: string;
}

const PostTypeSelector: React.FC<PostTypeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  className = ''
}) => {
  const [postTypes, setPostTypes] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPostType, setSelectedPostType] = useState<PostType | null>(null);

  useEffect(() => {
    loadPostTypes();
  }, []);

  useEffect(() => {
    if (postTypes.length > 0 && value) {
      const selected = postTypes.find(pt => pt.name === value);
      setSelectedPostType(selected || null);
    }
  }, [postTypes, value]);

  const loadPostTypes = async () => {
    try {
      setIsLoading(true);
      const types = await postTypeService.getAllPostTypes();
      setPostTypes(types);
    } catch (error) {
      console.error('Failed to load post types:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (postTypeName: string) => {
    onChange(postTypeName);
    const selected = postTypes.find(pt => pt.name === postTypeName);
    setSelectedPostType(selected || null);
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Post Type
        </label>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 rounded-md"></div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Post Type
      </label>
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        <option value="">Select a post type...</option>
        {postTypes.map((postType) => (
          <option key={postType.name} value={postType.name}>
            {postType.label}
          </option>
        ))}
      </select>
      
      {selectedPostType && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedPostType.label}
              </h4>
              {selectedPostType.description && (
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  {selectedPostType.description}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedPostType.supports.map((support) => (
                  <span
                    key={support}
                    className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded"
                  >
                    {support}
                  </span>
                ))}
              </div>
              {selectedPostType.hierarchical && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  ℹ️ This post type supports parent-child relationships
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostTypeSelector;
