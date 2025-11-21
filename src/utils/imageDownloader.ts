import RNFS from 'react-native-fs';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

export interface ImageDownloadProgress {
  bytesWritten: number;
  contentLength: number;
  progress: number; // 0-1
}

export interface ImageDownloadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

/**
 * Check if storage permission is already granted (Android only)
 */
async function checkImageStoragePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true; // iOS doesn't need this permission for Documents folder
  }

  try {
    const androidVersion = Platform.Version as number;
    
    // For Android 13+ (API 33+), check READ_MEDIA_IMAGES permission
    if (androidVersion >= 33) {
      const checkResult = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      );
      if (checkResult) {
        return true;
      }
      
      // Also check WRITE_EXTERNAL_STORAGE for Downloads folder access
      const writeCheck = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      return writeCheck;
    } else {
      // For Android 6.0-12 (API 23-32), check WRITE_EXTERNAL_STORAGE
      const checkResult = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      return checkResult;
    }
  } catch (err) {
    console.error('[ImageDownloader] Error checking permission:', err);
    return false;
  }
}

/**
 * Request storage permission for Android
 * Required for Android 6.0+ (API level 23+)
 */
async function requestImageStoragePermission(): Promise<{granted: boolean; shouldShowRationale?: boolean}> {
  if (Platform.OS !== 'android') {
    return { granted: true }; // iOS doesn't need this permission for Documents folder
  }

  try {
    // First check if permission is already granted
    const alreadyGranted = await checkImageStoragePermission();
    if (alreadyGranted) {
      console.log('[ImageDownloader] Permission already granted');
      return { granted: true };
    }

    const androidVersion = Platform.Version as number;
    let permission: (typeof PermissionsAndroid.PERMISSIONS)[keyof typeof PermissionsAndroid.PERMISSIONS];
    let permissionName: string;

    // For Android 13+ (API 33+), request READ_MEDIA_IMAGES
    if (androidVersion >= 33) {
      permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
      permissionName = 'READ_MEDIA_IMAGES';
    } else {
      // For Android 6.0-12 (API 23-32), request WRITE_EXTERNAL_STORAGE
      permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
      permissionName = 'WRITE_EXTERNAL_STORAGE';
    }

    console.log(`[ImageDownloader] Requesting ${permissionName} permission for Android ${androidVersion}`);

    const result = await PermissionsAndroid.request(permission, {
      title: 'Storage Permission Required',
      message: 'This app needs access to your device storage to download and save images to your gallery.',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'Grant Permission',
    });

    const granted = result === PermissionsAndroid.RESULTS.GRANTED;
    const shouldShowRationale = result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;

    if (!granted) {
      console.warn(`[ImageDownloader] Permission ${permissionName} denied:`, result);
    }

    return { granted, shouldShowRationale };
  } catch (err) {
    console.error('[ImageDownloader] Error requesting permission:', err);
    return { granted: false };
  }
}

/**
 * Get download directory path based on platform
 */
function getImageDownloadPath(): string {
  if (Platform.OS === 'ios') {
    return RNFS.DocumentDirectoryPath;
  } else {
    return RNFS.DownloadDirectoryPath;
  }
}

/**
 * Generate filename from URL or use provided name
 */
function getImageFileName(url: string, fileName?: string): string {
  if (fileName) {
    return fileName;
  }

  // Extract filename from URL
  const urlParts = url.split('/');
  const urlFileName = urlParts[urlParts.length - 1];
  
  // Remove query parameters if any
  const cleanFileName = urlFileName.split('?')[0];
  
  // If URL doesn't have extension, default to .jpg
  if (!cleanFileName.includes('.')) {
    return `image_${Date.now()}.jpg`;
  }
  
  return cleanFileName || `image_${Date.now()}.jpg`;
}

/**
 * Download image from URL and save to gallery
 * 
 * @param url - Image URL to download
 * @param fileName - Optional custom filename (default: extracted from URL or timestamp)
 * @param onProgress - Optional progress callback
 * @returns Promise with download result
 * 
 * @example
 * ```typescript
 * import { downloadImage } from '../utils/imageDownloader';
 * 
 * const result = await downloadImage('https://example.com/image.jpg');
 * if (result.success) {
 *   console.log('Image saved to:', result.filePath);
 * }
 * ```
 */
export async function downloadImage(
  url: string,
  fileName?: string,
  onProgress?: (progress: ImageDownloadProgress) => void
): Promise<ImageDownloadResult> {
  try {
    // Validate URL
    if (!url || !url.trim()) {
      return {
        success: false,
        error: 'Invalid URL provided',
      };
    }

    // Request permission for Android (iOS doesn't need permission for Documents folder)
    const permissionResult = await requestImageStoragePermission();
    if (!permissionResult.granted) {
      const errorMessage = permissionResult.shouldShowRationale
        ? 'Storage permission denied. Please enable it in your device settings to download images.'
        : 'Storage permission is required to download images. Please grant the permission when prompted.';
      
      Alert.alert(
        'Permission Required',
        errorMessage,
        [{ text: 'OK' }]
      );

      return {
        success: false,
        error: errorMessage,
      };
    }

    // Get download directory
    const downloadDir = getImageDownloadPath();

    // Ensure download directory exists
    const dirExists = await RNFS.exists(downloadDir);
    if (!dirExists) {
      await RNFS.mkdir(downloadDir);
    }

    // Get filename
    const finalFileName = getImageFileName(url, fileName);
    const filePath = `${downloadDir}/${finalFileName}`;

    // Check if file already exists
    const fileExists = await RNFS.exists(filePath);
    if (fileExists) {
      // Delete existing file
      await RNFS.unlink(filePath);
    }

    console.log('[ImageDownloader] Starting download...');
    console.log('[ImageDownloader] URL:', url);
    console.log('[ImageDownloader] Saving to:', filePath);

    // Download file
    const downloadResult = await RNFS.downloadFile({
      fromUrl: url,
      toFile: filePath,
      progress: (res) => {
        if (onProgress) {
          const progress = res.contentLength > 0 
            ? res.bytesWritten / res.contentLength 
            : 0;
          onProgress({
            bytesWritten: res.bytesWritten,
            contentLength: res.contentLength,
            progress,
          });
        }
      },
    }).promise;

    console.log('[ImageDownloader] Download status:', downloadResult.statusCode);

    if (downloadResult.statusCode === 200) {
      // Verify file was downloaded
      const fileInfo = await RNFS.stat(filePath);
      console.log('[ImageDownloader] File size:', fileInfo.size, 'bytes');

      // Save to gallery using CameraRoll
      try {
        console.log('[ImageDownloader] Saving image to gallery...');
        
        // For Android, we need to use file:// prefix
        const fileUri = Platform.OS === 'android' 
          ? `file://${filePath}` 
          : filePath;

        const savedUri = await CameraRoll.save(fileUri, { type: 'photo' });
        
        console.log('[ImageDownloader] ✅ Image saved to gallery:', savedUri);

        // Return gallery URI (images will appear in gallery)
        return {
          success: true,
          filePath: savedUri, // Gallery URI
        };
      } catch (saveError: any) {
        console.error('[ImageDownloader] ❌ Error saving to gallery:', saveError);
        
        // If saving to gallery fails, still return success with file path
        // The file is downloaded, just not in gallery
        console.warn('[ImageDownloader] Image downloaded but not saved to gallery');
        return {
          success: true,
          filePath: filePath, // Return downloaded file path as fallback
        };
      }
    } else {
      return {
        success: false,
        error: `Download failed with status code: ${downloadResult.statusCode}`,
      };
    }
  } catch (error: any) {
    console.error('[ImageDownloader] ❌ Download error:', error);
    return {
      success: false,
      error: error?.message || 'Unknown error occurred during download',
    };
  }
}

/**
 * Check if a file exists at the given path
 */
export async function imageFileExists(filePath: string): Promise<boolean> {
  try {
    return await RNFS.exists(filePath);
  } catch (error) {
    console.error('[ImageDownloader] Error checking file existence:', error);
    return false;
  }
}

