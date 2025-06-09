import { ApolloClient } from '@apollo/client';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { UPLOAD_IMAGE } from '../graphql';

// Types
export interface DirectUploadInput {
  fileName: string;
  fileData: string; // Base64 encoded
  folder?: string;
  type?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileData {
  uri: string;
  type: string;
  name: string;
  size?: number;
}

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: ImageManipulator.SaveFormat;
}

// Default compression settings
const DEFAULT_COMPRESSION: ImageCompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  format: ImageManipulator.SaveFormat.JPEG,
};

// File size validation (5MB max for base64)
export const validateFileSize = (size: number): boolean => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  return size <= maxSize;
};

// Validate file type
export const validateFileType = (mimeType: string): boolean => {
  if (!mimeType) {
    console.log('No MIME type provided, assuming image');
    return true;
  }

  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
    'image/webp', 'image/svg+xml', 'image/bmp', 'image'
  ];
  
  const isValid = allowedTypes.includes(mimeType) || mimeType.startsWith('image/');
  console.log('MIME type validation:', { mimeType, isValid });
  
  return isValid;
};

// Get MIME type from file extension
export const getMimeType = (filename: string): string => {
  if (!filename) return 'image/jpeg';

  const extension = filename.toLowerCase().split('.').pop();
  const mimeTypes: { [key: string]: string } = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
  };
  
  return mimeTypes[extension || ''] || 'image/jpeg';
};

// Compress image before upload
export const compressImage = async (
  uri: string, 
  options: ImageCompressionOptions = DEFAULT_COMPRESSION
): Promise<string> => {
  try {
    console.log('Compressing image:', uri);
    
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: options.maxWidth,
            height: options.maxHeight,
          },
        },
      ],
      {
        compress: options.quality || 0.8,
        format: options.format || ImageManipulator.SaveFormat.JPEG,
      }
    );

    console.log('Image compressed:', {
      original: uri,
      compressed: result.uri,
      width: result.width,
      height: result.height,
    });

    return result.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    return uri; // Return original if compression fails
  }
};

// Convert file to base64
export const convertToBase64 = async (uri: string): Promise<string> => {
  try {
    console.log('Converting to base64:', uri);
    
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    // Check file size
    if (fileInfo.size && !validateFileSize(fileInfo.size)) {
      throw new Error('File size exceeds 5MB limit');
    }

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('Base64 conversion complete:', {
      originalSize: fileInfo.size,
      base64Length: base64.length,
    });

    return base64;
  } catch (error) {
    console.error('Error converting to base64:', error);
    throw error;
  }
};

// Image picker with validation
export const pickImage = async (options: {
  allowsMultipleSelection?: boolean;
  allowsEditing?: boolean;
  quality?: number;
  compressionOptions?: ImageCompressionOptions;
}): Promise<FileData[]> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh!');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: options.allowsMultipleSelection || false,
    allowsEditing: options.allowsEditing || false,
    quality: options.quality || 0.8,
  });

  if (result.canceled) {
    return [];
  }

  const processedFiles: FileData[] = [];

  for (const asset of result.assets) {
    try {
      // Compress image if needed
      const compressedUri = await compressImage(asset.uri, options.compressionOptions);
      
      // Determine MIME type
      let mimeType: string;
      if (asset.type === 'image') {
        mimeType = asset.fileName ? getMimeType(asset.fileName) : 'image/jpeg';
      } else {
        mimeType = asset.fileName ? getMimeType(asset.fileName) : 'image/jpeg';
      }

      processedFiles.push({
        uri: compressedUri,
        type: mimeType,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        size: asset.fileSize,
      });
    } catch (error) {
      console.error('Error processing picked image:', error);
      throw error;
    }
  }

  return processedFiles;
};

// Camera capture
export const captureImage = async (options: {
  allowsEditing?: boolean;
  quality?: number;
  compressionOptions?: ImageCompressionOptions;
}): Promise<FileData | null> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Ứng dụng cần quyền truy cập camera để chụp ảnh!');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: options.allowsEditing || true,
    quality: options.quality || 0.8,
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];
  
  try {
    // Compress image
    const compressedUri = await compressImage(asset.uri, options.compressionOptions);
    
    // Determine MIME type
    let mimeType: string;
    if (asset.type === 'image') {
      mimeType = asset.fileName ? getMimeType(asset.fileName) : 'image/jpeg';
    } else {
      mimeType = asset.fileName ? getMimeType(asset.fileName) : 'image/jpeg';
    }

    return {
      uri: compressedUri,
      type: mimeType,
      name: asset.fileName || `camera_${Date.now()}.jpg`,
      size: asset.fileSize,
    };
  } catch (error) {
    console.error('Error processing captured image:', error);
    throw error;
  }
};

// Document picker (for non-image files)
export const pickDocument = async (): Promise<FileData[]> => {
  const result = await DocumentPicker.getDocumentAsync({
    multiple: true,
    type: '*/*',
  });

  if (result.canceled) {
    return [];
  }

  return result.assets.map(asset => ({
    uri: asset.uri,
    type: asset.mimeType || getMimeType(asset.name),
    name: asset.name,
    size: asset.size,
  }));
};

// Main upload function using the new GraphQL mutation
export const uploadImage = async (
  apolloClient: ApolloClient<any>,
  fileData: FileData,
  folder: string = 'uploads',
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  try {
    console.log('🚀 Starting image upload:', {
      name: fileData.name,
      type: fileData.type,
      size: fileData.size,
      folder,
    });

    // Validate file
    if (fileData.size && !validateFileSize(fileData.size)) {
      throw new Error('Kích thước file vượt quá 5MB');
    }
    
    if (!validateFileType(fileData.type)) {
      throw new Error(`Định dạng file không được hỗ trợ: ${fileData.type}`);
    }

    // Simulate progress start
    onProgress?.({
      loaded: 0,
      total: 100,
      percentage: 0,
    });

    // Convert to base64
    onProgress?.({
      loaded: 25,
      total: 100,
      percentage: 25,
    });

    const base64Data = await convertToBase64(fileData.uri);

    onProgress?.({
      loaded: 50,
      total: 100,
      percentage: 50,
    });

    // Upload via GraphQL
    console.log('📤 Uploading to backend:', {
      fileName: fileData.name,
      folder,
      type: fileData.type,
      base64Length: base64Data.length,
    });

    const { data, errors } = await apolloClient.mutate({
      mutation: UPLOAD_IMAGE,
      variables: {
        uploadInput: {
          fileName: fileData.name,
          fileData: base64Data,
          folder,
          type: fileData.type,
        },
      },
    });

    onProgress?.({
      loaded: 90,
      total: 100,
      percentage: 90,
    });

    if (errors) {
      console.error('GraphQL errors:', errors);
      throw new Error(`Upload failed: ${errors[0]?.message || 'Unknown error'}`);
    }

    if (!data?.uploadImage) {
      throw new Error('No URL returned from upload');
    }

    const cloudinaryUrl = data.uploadImage;
    console.log('✅ Upload successful:', cloudinaryUrl);

    onProgress?.({
      loaded: 100,
      total: 100,
      percentage: 100,
    });

    return cloudinaryUrl;
  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
};

// Upload multiple images
export const uploadMultipleImages = async (
  apolloClient: ApolloClient<any>,
  files: FileData[],
  folder: string = 'uploads',
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<string[]> => {
  const results: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      console.log(`Uploading file ${i + 1}/${files.length}:`, file.name);
      
      const url = await uploadImage(
        apolloClient,
        file,
        folder,
        (progress) => onProgress?.(i, progress)
      );
      
      results.push(url);
      console.log(`✅ File ${i + 1} uploaded successfully`);
    } catch (error) {
      console.error(`❌ Error uploading file ${i + 1}:`, error);
      throw error;
    }
  }
  
  return results;
};

// Convenience functions for specific use cases
export const uploadAvatar = async (
  apolloClient: ApolloClient<any>,
  imageUri: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  // Compress for avatar (smaller size)
  const compressedUri = await compressImage(imageUri, {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.9,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  const fileData: FileData = {
    uri: compressedUri,
    type: 'image/jpeg',
    name: `avatar_${Date.now()}.jpg`,
  };
  
  return uploadImage(apolloClient, fileData, 'avatars', onProgress);
};

export const uploadBanner = async (
  apolloClient: ApolloClient<any>,
  imageUri: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  // Compress for banner (higher quality, larger size)
  const compressedUri = await compressImage(imageUri, {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.9,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  const fileData: FileData = {
    uri: compressedUri,
    type: 'image/jpeg',
    name: `banner_${Date.now()}.jpg`,
  };
  
  return uploadImage(apolloClient, fileData, 'banners', onProgress);
};

export const uploadGalleryImages = async (
  apolloClient: ApolloClient<any>,
  imageUris: string[],
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<string[]> => {
  const files: FileData[] = [];

  // Process and compress all images first
  for (let i = 0; i < imageUris.length; i++) {
    const compressedUri = await compressImage(imageUris[i], {
      maxWidth: 1440,
      maxHeight: 1440,
      quality: 0.8,
      format: ImageManipulator.SaveFormat.JPEG,
    });

    files.push({
      uri: compressedUri,
      type: 'image/jpeg',
      name: `gallery_${Date.now()}_${i}.jpg`,
    });
  }
  
  return uploadMultipleImages(apolloClient, files, 'galleries', onProgress);
}; 