import React, { useState, useEffect, useContext, useCallback } from 'react';
import { BlogContext } from '../context/SupabaseBlogContext';
import { ImageSizes } from '../services/imageService';
import { PhotoIcon, XMarkIcon, MagnifyingGlassIcon, CloudArrowUpIcon } from './icons';
import Spinner from './Spinner';

interface MediaItem {
  id: string;
  url: string;
  sizes: ImageSizes;
  name: string;
  uploadedAt: string;
  size: number;
}

interface MediaGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string, alt?: string) => void;
  allowUpload?: boolean;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  allowUpload = true
}) => {
  const { uploadPostImage } = useContext(BlogContext);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState<keyof ImageSizes>('medium');
  const [dragActive, setDragActive] = useState(false);

  // Mock data for now - in real implementation, fetch from Supabase
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Simulate loading media items
      setTimeout(() => {
        setMediaItems([
          {
            id: '1',
            url: 'https://via.placeholder.com/400x300',
            sizes: {
              thumbnail: 'https://via.placeholder.com/150x100',
              medium: 'https://via.placeholder.com/400x300',
              large: 'https://via.placeholder.com/800x600',
              original: 'https://via.placeholder.com/1200x900'
            },
            name: 'sample-image-1.jpg',
            uploadedAt: '2024-01-15T10:30:00Z',
            size: 245760
          },
          {
            id: '2',
            url: 'https://via.placeholder.com/600x400',
            sizes: {
              thumbnail: 'https://via.placeholder.com/150x100',
              medium: 'https://via.placeholder.com/600x400',
              large: 'https://via.placeholder.com/1000x800',
              original: 'https://via.placeholder.com/1400x1000'
            },
            name: 'sample-image-2.jpg',
            uploadedAt: '2024-01-14T15:45:00Z',
            size: 387520
          }
        ]);
        setLoading(false);
      }, 1000);
    }
  }, [isOpen]);

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!files.length || !uploadPostImage) return;

    setUploading(true);
    try {
      const file = files[0];
      const imageSizes = await uploadPostImage(file);
      
      // Add to media items
      const newItem: MediaItem = {
        id: Date.now().toString(),
        url: imageSizes.medium,
        sizes: imageSizes,
        name: file.name,
        uploadedAt: new Date().toISOString(),
        size: file.size
      };
      
      setMediaItems(prev => [newItem, ...prev]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  }, [uploadPostImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && allowUpload) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload, allowUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const filteredItems = mediaItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-bg rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Media Gallery</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Controls */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value as keyof ImageSizes)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="thumbnail">Thumbnail</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="original">Original</option>
            </select>
          </div>
        </div>

        {/* Upload Area */}
        {allowUpload && (
          <div
            className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
              dragActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
              {uploading ? (
                <div className="flex items-center justify-center">
                  <Spinner size="sm" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Uploading...</span>
                </div>
              ) : (
                <>
                  <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Drag and drop images here, or{' '}
                    <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                      browse
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      />
                    </label>
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Media Grid */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <PhotoIcon className="w-16 h-16 mb-4" />
              <p>No images found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                  onClick={() => onSelectImage(item.sizes[selectedSize], item.name)}
                >
                  <div className="aspect-square">
                    <img
                      src={item.sizes.thumbnail}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{item.name}</p>
                    <p className="text-white text-xs">{formatFileSize(item.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaGallery;
