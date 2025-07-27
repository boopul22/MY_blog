import { supabase } from '../lib/supabase';

// Image upload and management service using Supabase Storage
export interface ImageUploadOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export interface ImageSizes {
  thumbnail: string;
  medium: string;
  large: string;
  original: string;
}

class ImageService {
  private bucketName = 'blog-images';

  // Initialize storage bucket (call this once during app setup)
  async initializeBucket(): Promise<void> {
    try {
      // Check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === this.bucketName);

      if (!bucketExists) {
        // Create bucket if it doesn't exist
        const { error } = await supabase.storage.createBucket(this.bucketName, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          fileSizeLimit: 10485760, // 10MB
        });

        if (error) {
          console.error('Error creating storage bucket:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error initializing storage bucket:', error);
      throw error;
    }
  }

  // Validate file before upload
  private validateFile(file: File): void {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload JPEG, PNG, or WebP images.');
    }

    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload images smaller than 10MB.');
    }
  }

  // Generate unique filename
  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `${timestamp}-${randomString}.${extension}`;
  }

  // Compress and resize image
  private async processImage(
    file: File,
    options: ImageUploadOptions = {}
  ): Promise<File> {
    const {
      quality = 0.8,
      maxWidth = 1920,
      maxHeight = 1080,
      format = 'webp'
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const processedFile = new File([blob], file.name, {
                type: `image/${format}`,
                lastModified: Date.now(),
              });
              resolve(processedFile);
            } else {
              reject(new Error('Failed to process image'));
            }
          },
          `image/${format}`,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Upload single image and generate multiple sizes
  async uploadImage(
    file: File,
    folder: string = 'posts',
    options: ImageUploadOptions = {}
  ): Promise<ImageSizes> {
    try {
      this.validateFile(file);
      
      const fileName = this.generateFileName(file.name);
      const basePath = `${folder}/${fileName}`;

      // Process image for different sizes
      const [thumbnail, medium, large, original] = await Promise.all([
        this.processImage(file, { ...options, maxWidth: 300, maxHeight: 200, format: 'webp' }),
        this.processImage(file, { ...options, maxWidth: 800, maxHeight: 600, format: 'webp' }),
        this.processImage(file, { ...options, maxWidth: 1200, maxHeight: 800, format: 'webp' }),
        this.processImage(file, { ...options, maxWidth: 1920, maxHeight: 1080, format: 'webp' })
      ]);

      // Upload all sizes
      const uploads = await Promise.all([
        supabase.storage.from(this.bucketName).upload(`${basePath}-thumbnail.webp`, thumbnail),
        supabase.storage.from(this.bucketName).upload(`${basePath}-medium.webp`, medium),
        supabase.storage.from(this.bucketName).upload(`${basePath}-large.webp`, large),
        supabase.storage.from(this.bucketName).upload(`${basePath}-original.webp`, original)
      ]);

      // Check for upload errors
      uploads.forEach((upload, index) => {
        if (upload.error) {
          throw new Error(`Failed to upload ${['thumbnail', 'medium', 'large', 'original'][index]}: ${upload.error.message}`);
        }
      });

      // Get public URLs
      const urls = {
        thumbnail: this.getPublicUrl(`${basePath}-thumbnail.webp`),
        medium: this.getPublicUrl(`${basePath}-medium.webp`),
        large: this.getPublicUrl(`${basePath}-large.webp`),
        original: this.getPublicUrl(`${basePath}-original.webp`)
      };

      return urls;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Get public URL for an image
  getPublicUrl(path: string): string {
    const { data } = supabase.storage.from(this.bucketName).getPublicUrl(path);
    return data.publicUrl;
  }

  // Get optimized image URL with transformations
  getOptimizedUrl(
    path: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
    } = {}
  ): string {
    const { width, height, quality = 80, format = 'webp' } = options;
    const baseUrl = this.getPublicUrl(path);
    
    // Supabase image transformations
    const params = new URLSearchParams();
    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    params.append('quality', quality.toString());
    params.append('format', format);
    
    return `${baseUrl}?${params.toString()}`;
  }

  // Delete image and all its variants
  async deleteImage(basePath: string): Promise<void> {
    try {
      const variants = ['thumbnail', 'medium', 'large', 'original'];
      const pathsToDelete = variants.map(variant => `${basePath}-${variant}.webp`);
      
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove(pathsToDelete);

      if (error) {
        console.error('Error deleting images:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  // List images in a folder
  async listImages(folder: string = 'posts'): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(folder);

      if (error) throw error;

      return data?.map(file => `${folder}/${file.name}`) || [];
    } catch (error) {
      console.error('Error listing images:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const imageService = new ImageService();

// Helper function to extract base path from image URL
export const getImageBasePath = (imageUrl: string): string | null => {
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];
    
    // Remove size suffix and extension
    const baseName = fileName.replace(/-(thumbnail|medium|large|original)\.webp$/, '');
    const folder = pathParts[pathParts.length - 2];
    
    return `${folder}/${baseName}`;
  } catch {
    return null;
  }
};