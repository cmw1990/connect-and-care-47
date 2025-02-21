import { supabase } from '@/lib/supabase/client';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Device } from '@capacitor/device';
import { Platform } from '@capacitor/platform';

export type FileCategory =
  | 'profile'
  | 'medical'
  | 'document'
  | 'care_plan'
  | 'message'
  | 'resource';

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  category: FileCategory;
  userId: string;
  path: string;
  url?: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

class FileService {
  private isNative: boolean = false;
  private maxFileSize = 100 * 1024 * 1024; // 100MB
  private allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    medical: ['application/dicom', '.dcm'],
    video: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  };

  constructor() {
    this.initialize();
  }

  private async initialize() {
    const platform = await Platform.get();
    this.isNative = platform.platform !== 'web';
  }

  private getStorageBucket(category: FileCategory): string {
    switch (category) {
      case 'profile':
        return 'profile-images';
      case 'medical':
        return 'medical-records';
      case 'document':
        return 'documents';
      case 'care_plan':
        return 'care-plans';
      case 'message':
        return 'message-attachments';
      case 'resource':
        return 'resources';
      default:
        return 'general';
    }
  }

  private async validateFile(file: File, category: FileCategory): Promise<void> {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum limit of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Check file type
    let isValidType = false;
    for (const types of Object.values(this.allowedTypes)) {
      if (types.includes(file.type)) {
        isValidType = true;
        break;
      }
    }
    if (!isValidType) {
      throw new Error('File type not supported');
    }

    // Additional validation for medical files
    if (category === 'medical') {
      // Add specific medical file validation if needed
    }
  }

  private async generateThumbnail(file: File): Promise<Blob | null> {
    if (!file.type.startsWith('image/')) return null;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        // Set thumbnail dimensions
        const maxDim = 200;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = height * (maxDim / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = width * (maxDim / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.7);
      };

      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  }

  async uploadFile(file: File, category: FileCategory, metadata: Record<string, any> = {}): Promise<FileMetadata> {
    await this.validateFile(file, category);

    const bucket = this.getStorageBucket(category);
    const timestamp = new Date().getTime();
    const path = `${category}/${timestamp}_${file.name}`;

    // Upload original file
    const { data: fileData, error: fileError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (fileError) throw fileError;

    // Generate and upload thumbnail if it's an image
    let thumbnailUrl: string | undefined;
    const thumbnail = await this.generateThumbnail(file);
    if (thumbnail) {
      const thumbnailPath = `${category}/thumbnails/${timestamp}_${file.name}`;
      const { data: thumbnailData, error: thumbnailError } = await supabase.storage
        .from(bucket)
        .upload(thumbnailPath, thumbnail, {
          cacheControl: '3600',
          upsert: false,
        });

      if (!thumbnailError && thumbnailData) {
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(thumbnailData.path);
        thumbnailUrl = publicUrl;
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileData!.path);

    // Create file record in database
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert({
        name: file.name,
        size: file.size,
        type: file.type,
        category,
        path: fileData!.path,
        url: publicUrl,
        thumbnail_url: thumbnailUrl,
        metadata: {
          ...metadata,
          originalName: file.name,
          lastModified: file.lastModified,
        },
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return {
      id: fileRecord.id,
      name: fileRecord.name,
      size: fileRecord.size,
      type: fileRecord.type,
      category: fileRecord.category,
      userId: fileRecord.user_id,
      path: fileRecord.path,
      url: fileRecord.url,
      thumbnailUrl: fileRecord.thumbnail_url,
      metadata: fileRecord.metadata,
      createdAt: fileRecord.created_at,
      updatedAt: fileRecord.updated_at,
    };
  }

  async downloadFile(fileId: string): Promise<Blob | null> {
    // Get file record
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (dbError) throw dbError;

    const bucket = this.getStorageBucket(fileRecord.category);

    if (this.isNative) {
      // Download to device filesystem
      const { data: fileData, error: downloadError } = await supabase.storage
        .from(bucket)
        .download(fileRecord.path);

      if (downloadError) throw downloadError;

      // Save to device
      const fileName = fileRecord.name;
      const base64Data = await this.blobToBase64(fileData);
      
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
      });

      return fileData;
    } else {
      // Web download
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(fileRecord.path);

      if (error) throw error;
      return data;
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  async deleteFile(fileId: string): Promise<void> {
    // Get file record
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (dbError) throw dbError;

    const bucket = this.getStorageBucket(fileRecord.category);

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove([fileRecord.path]);

    if (storageError) throw storageError;

    // Delete thumbnail if exists
    if (fileRecord.thumbnail_url) {
      const thumbnailPath = fileRecord.path.replace(fileRecord.category, `${fileRecord.category}/thumbnails`);
      await supabase.storage
        .from(bucket)
        .remove([thumbnailPath]);
    }

    // Delete record from database
    const { error: deleteError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);

    if (deleteError) throw deleteError;
  }

  async getFileMetadata(fileId: string): Promise<FileMetadata> {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      size: data.size,
      type: data.type,
      category: data.category,
      userId: data.user_id,
      path: data.path,
      url: data.url,
      thumbnailUrl: data.thumbnail_url,
      metadata: data.metadata,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async listFiles(params: {
    category?: FileCategory;
    userId?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    files: FileMetadata[];
    total: number;
    hasMore: boolean;
  }> {
    const {
      category,
      userId,
      type,
      page = 1,
      limit = 20,
    } = params;

    let query = supabase
      .from('files')
      .select('*', { count: 'exact' });

    if (category) {
      query = query.eq('category', category);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      files: data.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type,
        category: file.category,
        userId: file.user_id,
        path: file.path,
        url: file.url,
        thumbnailUrl: file.thumbnail_url,
        metadata: file.metadata,
        createdAt: file.created_at,
        updatedAt: file.updated_at,
      })),
      total: count || 0,
      hasMore: (count || 0) > to + 1,
    };
  }
}

export const fileService = new FileService();
