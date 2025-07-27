import React, { useState, useRef, useCallback } from 'react';
import { PhotoIcon, XMarkIcon } from './icons';
import Spinner from './Spinner';
import { ImageSizes } from '../services/imageService';

interface ImageUploadProps {
  onImageUpload: (file: File) => Promise<ImageSizes>;
  currentImageUrl?: string;
  onImageRemove?: () => void;
  disabled?: boolean;
  className?: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  currentImageUrl,
  onImageRemove,
  disabled = false,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      await handleFileUpload(imageFile);
    } else {
      setError('Please drop an image file (JPEG, PNG, or WebP)');
    }
  }, [disabled]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    setError(null);
    setIsUploading(true);
    setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Simulate upload progress (since we can't track real progress with Supabase)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (!prev) return null;
          const newPercentage = Math.min(prev.percentage + 10, 90);
          return {
            ...prev,
            percentage: newPercentage,
            loaded: (prev.total * newPercentage) / 100
          };
        });
      }, 200);

      // Upload the file
      const imageSizes = await onImageUpload(file);
      
      clearInterval(progressInterval);
      setUploadProgress({ loaded: file.size, total: file.size, percentage: 100 });
      
      // Clean up preview URL
      URL.revokeObjectURL(preview);
      setPreviewUrl(null);
      
      setTimeout(() => {
        setUploadProgress(null);
      }, 1000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    if (onImageRemove) {
      onImageRemove();
    }
    setPreviewUrl(null);
    setError(null);
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const displayImageUrl = previewUrl || currentImageUrl;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current/Preview Image */}
      {displayImageUrl && (
        <div className="relative">
          <img 
            src={displayImageUrl} 
            alt="Featured" 
            className="rounded-md w-full h-auto max-h-64 object-cover"
          />
          {!isUploading && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
              title="Remove image"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
              <div className="text-white text-center">
                <Spinner size="md" />
                {uploadProgress && (
                  <div className="mt-2">
                    <div className="text-sm">{uploadProgress.percentage}%</div>
                    <div className="w-32 bg-gray-700 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Area */}
      {!displayImageUrl && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
            ${isDragging 
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-blue-600 dark:text-blue-400">
                Click to upload
              </span>
              {' '}or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              PNG, JPG, WebP up to 10MB
            </p>
          </div>
        </div>
      )}

      {/* Replace Image Button */}
      {displayImageUrl && !isUploading && (
        <button
          type="button"
          onClick={openFileDialog}
          disabled={disabled}
          className="w-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PhotoIcon className="w-5 h-5 mr-2" />
          Replace Image
        </button>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Error Message */}
      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;