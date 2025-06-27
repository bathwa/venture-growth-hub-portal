// Storage Module
// Aligned with the new Supabase schema using storage buckets for file management

export type StorageBucket = 
  | 'kyc-documents'
  | 'opportunity-files'
  | 'agreements'
  | 'payment-proofs'
  | 'reports'
  | 'templates'
  | 'user-avatars'
  | 'company-logos';

export interface StorageFile {
  id: string;
  name: string;
  bucket: StorageBucket;
  path: string;
  size: number;
  mime_type: string;
  uploaded_by: string;
  uploaded_at: string;
  metadata?: Record<string, any>;
  is_public: boolean;
}

export interface UploadOptions {
  bucket: StorageBucket;
  path?: string;
  isPublic?: boolean;
  metadata?: Record<string, any>;
  onProgress?: (progress: number) => void;
}

export class StorageManager {
  private supabase: any; // Supabase client
  private currentUser: string | null = null;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  // Set current user
  setCurrentUser(userId: string) {
    this.currentUser = userId;
  }

  // Get bucket configuration
  getBucketConfig(bucket: StorageBucket) {
    const configs: Record<StorageBucket, { maxSize: number; allowedTypes: string[] }> = {
      'kyc-documents': {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
      },
      'opportunity-files': {
        maxSize: 50 * 1024 * 1024, // 50MB
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      },
      'agreements': {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['application/pdf'],
      },
      'payment-proofs': {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
      },
      'reports': {
        maxSize: 20 * 1024 * 1024, // 20MB
        allowedTypes: ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      },
      'templates': {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['application/pdf', 'text/plain', 'application/json'],
      },
      'user-avatars': {
        maxSize: 2 * 1024 * 1024, // 2MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
      },
      'company-logos': {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'],
      },
    };

    return configs[bucket];
  }

  // Validate file before upload
  validateFile(file: File, bucket: StorageBucket): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = this.getBucketConfig(bucket);

    // Check file size
    if (file.size > config.maxSize) {
      errors.push(`File size must be less than ${config.maxSize / (1024 * 1024)}MB`);
    }

    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed. Allowed types: ${config.allowedTypes.join(', ')}`);
    }

    // Check file name
    if (file.name.length > 255) {
      errors.push('File name is too long (max 255 characters)');
    }

    // Check for invalid characters in filename
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(file.name)) {
      errors.push('File name contains invalid characters');
    }

    return { valid: errors.length === 0, errors };
  }

  // Generate file path
  generateFilePath(bucket: StorageBucket, fileName: string, userId?: string): string {
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    switch (bucket) {
      case 'kyc-documents':
        return `${userId || this.currentUser}/${timestamp}_${sanitizedName}`;
      case 'opportunity-files':
        return `${userId || this.currentUser}/opportunities/${timestamp}_${sanitizedName}`;
      case 'agreements':
        return `${userId || this.currentUser}/agreements/${timestamp}_${sanitizedName}`;
      case 'payment-proofs':
        return `${userId || this.currentUser}/payments/${timestamp}_${sanitizedName}`;
      case 'reports':
        return `${userId || this.currentUser}/reports/${timestamp}_${sanitizedName}`;
      case 'templates':
        return `system/templates/${timestamp}_${sanitizedName}`;
      case 'user-avatars':
        return `${userId || this.currentUser}/avatar/${timestamp}_${sanitizedName}`;
      case 'company-logos':
        return `${userId || this.currentUser}/company/${timestamp}_${sanitizedName}`;
      default:
        return `${userId || this.currentUser}/${timestamp}_${sanitizedName}`;
    }
  }

  // Upload file
  async uploadFile(
    file: File, 
    options: UploadOptions
  ): Promise<{ success: boolean; file?: StorageFile; error?: string }> {
    try {
      // Validate file
      const validation = this.validateFile(file, options.bucket);
      if (!validation.valid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      // Generate file path
      const filePath = options.path || this.generateFilePath(options.bucket, file.name);

      // Upload to Supabase storage
      const { data, error } = await this.supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: options.metadata,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      // Get public URL if needed
      let publicUrl = null;
      if (options.isPublic) {
        const { data: urlData } = this.supabase.storage
          .from(options.bucket)
          .getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      }

      // Create storage file record
      const storageFile: StorageFile = {
        id: data.path,
        name: file.name,
        bucket: options.bucket,
        path: data.path,
        size: file.size,
        mime_type: file.type,
        uploaded_by: this.currentUser || '',
        uploaded_at: new Date().toISOString(),
        metadata: options.metadata,
        is_public: options.isPublic || false,
      };

      return { success: true, file: storageFile };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
    }
  }

  // Download file
  async downloadFile(bucket: StorageBucket, path: string): Promise<{ success: boolean; data?: Blob; error?: string }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .download(path);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Download failed' };
    }
  }

  // Get file URL
  async getFileUrl(bucket: StorageBucket, path: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        console.error('Error getting file URL:', error);
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  }

  // Get public URL
  getPublicUrl(bucket: StorageBucket, path: string): string {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  // Delete file
  async deleteFile(bucket: StorageBucket, path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Delete failed' };
    }
  }

  // List files in bucket
  async listFiles(bucket: StorageBucket, path?: string): Promise<{ success: boolean; files?: StorageFile[]; error?: string }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .list(path || '');

      if (error) {
        return { success: false, error: error.message };
      }

      const files: StorageFile[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        bucket,
        path: item.name,
        size: item.metadata?.size || 0,
        mime_type: item.metadata?.mimetype || '',
        uploaded_by: item.metadata?.uploaded_by || '',
        uploaded_at: item.updated_at,
        metadata: item.metadata,
        is_public: false,
      }));

      return { success: true, files };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'List failed' };
    }
  }

  // Update file metadata
  async updateFileMetadata(
    bucket: StorageBucket, 
    path: string, 
    metadata: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.storage
        .from(bucket)
        .update(path, { metadata });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Update failed' };
    }
  }

  // Copy file
  async copyFile(
    sourceBucket: StorageBucket,
    sourcePath: string,
    destBucket: StorageBucket,
    destPath: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Download source file
      const downloadResult = await this.downloadFile(sourceBucket, sourcePath);
      if (!downloadResult.success || !downloadResult.data) {
        return { success: false, error: 'Failed to download source file' };
      }

      // Upload to destination
      const uploadResult = await this.uploadFile(
        new File([downloadResult.data], sourcePath.split('/').pop() || 'file'),
        { bucket: destBucket, path: destPath }
      );

      if (!uploadResult.success) {
        return { success: false, error: uploadResult.error };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Copy failed' };
    }
  }

  // Get storage usage statistics
  async getStorageStats(bucket: StorageBucket): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .list('', { limit: 1000 });

      if (error) {
        return { success: false, error: error.message };
      }

      const stats = {
        totalFiles: data.length,
        totalSize: data.reduce((acc: number, file: any) => acc + (file.metadata?.size || 0), 0),
        averageFileSize: data.length > 0 ? data.reduce((acc: number, file: any) => acc + (file.metadata?.size || 0), 0) / data.length : 0,
      };

      return { success: true, stats };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Stats failed' };
    }
  }
}

// Export a singleton instance (will be initialized with Supabase client)
export let storageManager: StorageManager;

// Initialize storage manager
export const initializeStorage = (supabaseClient: any) => {
  storageManager = new StorageManager(supabaseClient);
  return storageManager;
};

// Helper functions
export const uploadFile = (file: File, options: UploadOptions) => storageManager.uploadFile(file, options);
export const downloadFile = (bucket: StorageBucket, path: string) => storageManager.downloadFile(bucket, path);
export const deleteFile = (bucket: StorageBucket, path: string) => storageManager.deleteFile(bucket, path);
export const getFileUrl = (bucket: StorageBucket, path: string, expiresIn?: number) => storageManager.getFileUrl(bucket, path, expiresIn); 