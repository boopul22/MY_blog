import React, { useState, useCallback, useContext } from 'react';
import { BlogContext } from '../context/SupabaseBlogContext';
import { useNotifications } from '../context/NotificationProvider';
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon } from './icons';

interface MediaLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  allowMultiple?: boolean;
}

interface UploadedImage {
  url: string;
  name: string;
  size: number;
  uploadedAt: Date;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  allowMultiple = false
}) => {
  const { uploadPostImage } = useContext(BlogContext);
  const { showSuccess, showError } = useNotifications();
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!uploadPostImage) {
      showError('Image upload not available');
      return;
    }

    setIsUploading(true);
    const newImages: UploadedImage[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          showError(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          showError(`${file.name} is too large (max 10MB)`);
          continue;
        }

        const imageUrl = await uploadPostImage(file);
        newImages.push({
          url: imageUrl,
          name: file.name,
          size: file.size,
          uploadedAt: new Date()
        });
      }

      setUploadedImages(prev => [...newImages, ...prev]);
      showSuccess(`Uploaded ${newImages.length} image(s) successfully`);
    } catch (error) {
      console.error('Upload failed:', error);
      showError('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  }, [uploadPostImage, showSuccess, showError]);

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  }, [handleFileUpload]);

  // Handle image selection
  const handleImageSelect = useCallback((imageUrl: string) => {
    if (allowMultiple) {
      setSelectedImages(prev => 
        prev.includes(imageUrl) 
          ? prev.filter(url => url !== imageUrl)
          : [...prev, imageUrl]
      );
    } else {
      onSelectImage(imageUrl);
      onClose();
    }
  }, [allowMultiple, onSelectImage, onClose]);

  // Handle multiple selection confirmation
  const handleConfirmSelection = useCallback(() => {
    if (selectedImages.length > 0) {
      selectedImages.forEach(imageUrl => onSelectImage(imageUrl));
      onClose();
    }
  }, [selectedImages, onSelectImage, onClose]);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Media Library
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 px-4 pb-4 sm:p-6 sm:pt-0">
            {/* Upload area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Drop images here or click to upload
                  </span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    accept="image/*"
                    onChange={handleFileInputChange}
                    disabled={isUploading}
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
              {isUploading && (
                <div className="mt-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
                </div>
              )}
            </div>

            {/* Image grid */}
            {uploadedImages.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Uploaded Images
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div
                      key={index}
                      className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 ${
                        selectedImages.includes(image.url)
                          ? 'border-blue-500'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                      onClick={() => handleImageSelect(image.url)}
                    >
                      <div className="aspect-square">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                        <PhotoIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 text-xs">
                        <p className="truncate">{image.name}</p>
                        <p>{formatFileSize(image.size)}</p>
                      </div>
                      {selectedImages.includes(image.url) && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {allowMultiple && selectedImages.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleConfirmSelection}
              >
                Insert {selectedImages.length} Image(s)
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-700"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaLibrary;
