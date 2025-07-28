import React, { useState, useEffect } from 'react';
import { PostType } from '../types';
import { postTypeService } from '../services/postTypeService';

interface PostTypeManagerProps {
  onPostTypeCreated?: (postType: PostType) => void;
  onPostTypeUpdated?: (postType: PostType) => void;
  onPostTypeDeleted?: (name: string) => void;
}

const PostTypeManager: React.FC<PostTypeManagerProps> = ({
  onPostTypeCreated,
  onPostTypeUpdated,
  onPostTypeDeleted
}) => {
  const [postTypes, setPostTypes] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPostType, setEditingPostType] = useState<PostType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPostTypes();
  }, []);

  const loadPostTypes = async () => {
    try {
      setIsLoading(true);
      const types = await postTypeService.getAllPostTypes();
      setPostTypes(types);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post types');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePostType = async (postTypeData: Omit<PostType, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPostType = await postTypeService.createPostType(postTypeData);
      setPostTypes(prev => [...prev, newPostType]);
      setShowCreateForm(false);
      onPostTypeCreated?.(newPostType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post type');
    }
  };

  const handleUpdatePostType = async (name: string, updates: Partial<PostType>) => {
    try {
      const updatedPostType = await postTypeService.updatePostType(name, updates);
      setPostTypes(prev => prev.map(pt => pt.name === name ? updatedPostType : pt));
      setEditingPostType(null);
      onPostTypeUpdated?.(updatedPostType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post type');
    }
  };

  const handleDeletePostType = async (name: string) => {
    if (!confirm(`Are you sure you want to delete the "${name}" post type? This action cannot be undone.`)) {
      return;
    }

    try {
      await postTypeService.deletePostType(name);
      setPostTypes(prev => prev.filter(pt => pt.name !== name));
      onPostTypeDeleted?.(name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post type');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Post Types
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New Post Type
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Post Types List */}
      <div className="space-y-4">
        {postTypes.map((postType) => (
          <PostTypeCard
            key={postType.id}
            postType={postType}
            onEdit={() => setEditingPostType(postType)}
            onDelete={() => handleDeletePostType(postType.name)}
            isBuiltIn={['post', 'page'].includes(postType.name)}
          />
        ))}
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <PostTypeForm
          onSubmit={handleCreatePostType}
          onCancel={() => setShowCreateForm(false)}
          title="Create New Post Type"
        />
      )}

      {/* Edit Form Modal */}
      {editingPostType && (
        <PostTypeForm
          postType={editingPostType}
          onSubmit={(data) => handleUpdatePostType(editingPostType.name, data)}
          onCancel={() => setEditingPostType(null)}
          title="Edit Post Type"
          isEditing
        />
      )}
    </div>
  );
};

interface PostTypeCardProps {
  postType: PostType;
  onEdit: () => void;
  onDelete: () => void;
  isBuiltIn: boolean;
}

const PostTypeCard: React.FC<PostTypeCardProps> = ({ postType, onEdit, onDelete, isBuiltIn }) => {
  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {postType.label}
            </h3>
            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
              {postType.name}
            </span>
            {isBuiltIn && (
              <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">
                Built-in
              </span>
            )}
            {!postType.public && (
              <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 rounded">
                Private
              </span>
            )}
          </div>
          
          {postType.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              {postType.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">Supports:</span> {postType.supports.join(', ')}
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span>Menu Position: {postType.menuPosition}</span>
            {postType.hierarchical && <span>Hierarchical</span>}
            <span>Created: {new Date(postType.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Edit
          </button>
          {!isBuiltIn && (
            <button
              onClick={onDelete}
              className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface PostTypeFormProps {
  postType?: PostType;
  onSubmit: (data: Omit<PostType, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  title: string;
  isEditing?: boolean;
}

const PostTypeForm: React.FC<PostTypeFormProps> = ({ 
  postType, 
  onSubmit, 
  onCancel, 
  title, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    name: postType?.name || '',
    label: postType?.label || '',
    description: postType?.description || '',
    public: postType?.public ?? true,
    hierarchical: postType?.hierarchical ?? false,
    supports: postType?.supports || ['title', 'content', 'author'],
    menuPosition: postType?.menuPosition || 5,
    menuIcon: postType?.menuIcon || 'dashicons-admin-post'
  });

  const [nameError, setNameError] = useState<string | null>(null);
  const supportOptions = postTypeService.getAllSupportOptions();
  const iconOptions = postTypeService.getMenuIcons();

  const handleNameChange = (name: string) => {
    setFormData(prev => ({ ...prev, name }));
    
    if (!isEditing) {
      const validation = postTypeService.validatePostTypeName(name);
      setNameError(validation.valid ? null : validation.error || null);
    }
  };

  const handleSupportToggle = (support: string) => {
    setFormData(prev => ({
      ...prev,
      supports: prev.supports.includes(support)
        ? prev.supports.filter(s => s !== support)
        : [...prev.supports, support]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEditing && nameError) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Post Type Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                placeholder="e.g., portfolio, testimonial, product"
                required
              />
              {nameError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{nameError}</p>
              )}
              {!isEditing && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Lowercase letters, numbers, hyphens, and underscores only. Max 20 characters.
                </p>
              )}
            </div>

            {/* Label Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Label *
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Portfolio Items, Testimonials, Products"
                required
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Brief description of this post type..."
              />
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Menu Position
                </label>
                <input
                  type="number"
                  value={formData.menuPosition}
                  onChange={(e) => setFormData(prev => ({ ...prev, menuPosition: parseInt(e.target.value) || 5 }))}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Menu Icon
                </label>
                <select
                  value={formData.menuIcon}
                  onChange={(e) => setFormData(prev => ({ ...prev, menuIcon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {iconOptions.map(icon => (
                    <option key={icon.value} value={icon.value}>
                      {icon.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.public}
                  onChange={(e) => setFormData(prev => ({ ...prev, public: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Public (visible to visitors)</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hierarchical}
                  onChange={(e) => setFormData(prev => ({ ...prev, hierarchical: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Hierarchical (can have parent/child relationships)</span>
              </label>
            </div>

            {/* Supports */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Supported Features
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {supportOptions.map(option => (
                  <label key={option.value} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={formData.supports.includes(option.value)}
                      onChange={() => handleSupportToggle(option.value)}
                      className="mr-2 mt-0.5"
                    />
                    <div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isEditing && nameError !== null}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isEditing ? 'Update' : 'Create'} Post Type
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostTypeManager;
