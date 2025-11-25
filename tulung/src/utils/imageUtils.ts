import * as ImagePicker from 'expo-image-picker';
import { getInfoAsync } from 'expo-file-system/legacy';

/**
 * Image utility functions for camera and gallery access
 */

export interface ImageResult {
  uri: string;
  width: number;
  height: number;
  size?: number;
}

/**
 * Request camera permissions
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
};

/**
 * Request media library permissions
 */
export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
};

/**
 * Open camera to capture image
 */
export const captureImageFromCamera = async (): Promise<ImageResult | null> => {
  try {
    // Request permission
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      throw new Error('Camera permission denied');
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false, // Skip crop screen - go straight to processing
      quality: 0.8, // Compress to reduce size
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
    };
  } catch (error) {
    console.error('Error capturing image:', error);
    throw error;
  }
};

/**
 * Pick image from gallery
 */
export const pickImageFromGallery = async (): Promise<ImageResult | null> => {
  try {
    // Request permission
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      throw new Error('Media library permission denied');
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false, // Skip crop screen - go straight to processing
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
    };
  } catch (error) {
    console.error('Error picking image:', error);
    throw error;
  }
};

/**
 * Get image file size
 */
export const getImageSize = async (uri: string): Promise<number> => {
  try {
    const fileInfo = await getInfoAsync(uri);
    if (fileInfo.exists && 'size' in fileInfo) {
      return fileInfo.size;
    }
    return 0;
  } catch (error) {
    console.error('Error getting image size:', error);
    return 0;
  }
};

/**
 * Compress image if too large (> 2MB)
 */
export const compressImage = async (uri: string): Promise<string> => {
  try {
    const size = await getImageSize(uri);
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (size <= maxSize) {
      return uri; // No compression needed
    }

    // Calculate compression quality
    const compressionQuality = Math.min(0.8, maxSize / size);

    // Re-save with lower quality
    const manipResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: compressionQuality,
      allowsEditing: false,
    });

    if (!manipResult.canceled) {
      return manipResult.assets[0].uri;
    }

    return uri; // Return original if compression fails
  } catch (error) {
    console.error('Error compressing image:', error);
    return uri;
  }
};

/**
 * Get image dimensions
 */
export const getImageDimensions = async (
  uri: string
): Promise<{ width: number; height: number }> => {
  try {
    // Use Image.getSize for web compatibility
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = uri;
    });
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    return { width: 0, height: 0 };
  }
};
