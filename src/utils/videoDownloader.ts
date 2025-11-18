import RNFS from 'react-native-fs';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

export interface DownloadProgress {
  bytesWritten: number;
  contentLength: number;
  progress: number; // 0-1
}

export interface DownloadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

/**
 * Check if storage permission is already granted (Android only)
 */
async function checkStoragePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true; // iOS doesn't need this permission for Documents folder
  }

  try {
    const androidVersion = Platform.Version as number;
    
    // For Android 13+ (API 33+), check READ_MEDIA_VIDEO permission
    if (androidVersion >= 33) {
      const checkResult = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
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
    console.error('[VideoDownloader] Error checking permission:', err);
    return false;
  }
}

/**
 * Request storage permission for Android
 * Required for Android 6.0+ (API level 23+)
 */
async function requestStoragePermission(): Promise<{granted: boolean; shouldShowRationale?: boolean}> {
  if (Platform.OS !== 'android') {
    return { granted: true }; // iOS doesn't need this permission for Documents folder
  }

  try {
    // First check if permission is already granted
    const alreadyGranted = await checkStoragePermission();
    if (alreadyGranted) {
      console.log('[VideoDownloader] Permission already granted');
      return { granted: true };
    }

    const androidVersion = Platform.Version as number;
    let permission: (typeof PermissionsAndroid.PERMISSIONS)[keyof typeof PermissionsAndroid.PERMISSIONS];
    let permissionName: string;

    // For Android 13+ (API 33+), request READ_MEDIA_VIDEO
    if (androidVersion >= 33) {
      permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO;
      permissionName = 'READ_MEDIA_VIDEO';
    } else {
      // For Android 6.0-12 (API 23-32), request WRITE_EXTERNAL_STORAGE
      permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
      permissionName = 'WRITE_EXTERNAL_STORAGE';
    }

    console.log(`[VideoDownloader] Requesting ${permissionName} permission for Android ${androidVersion}`);

    const result = await PermissionsAndroid.request(permission, {
      title: 'Storage Permission Required',
      message: 'This app needs access to your device storage to download and save videos to your gallery.',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'Grant Permission',
    });

    const granted = result === PermissionsAndroid.RESULTS.GRANTED;
    const shouldShowRationale = result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;

    if (!granted) {
      console.warn(`[VideoDownloader] Permission ${permissionName} denied. Result:`, result);
      
      if (shouldShowRationale) {
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to download videos. Please enable it in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                // Note: Opening settings programmatically requires additional setup
                // For now, we'll just show the alert
                console.log('[VideoDownloader] User should open settings manually');
              },
            },
          ]
        );
      }
    }

    return { granted, shouldShowRationale };
  } catch (err) {
    console.error('[VideoDownloader] Permission request error:', err);
    return { granted: false };
  }
}

/**
 * Get the download directory path for the platform
 */
function getDownloadPath(): string {
  if (Platform.OS === 'android') {
    // Android: Use Downloads folder
    return `${RNFS.DownloadDirectoryPath}`;
  } else {
    // iOS: Use DocumentDirectoryPath
    return `${RNFS.DocumentDirectoryPath}/Downloads`;
  }
}

/**
 * Extract filename from URL or generate one
 */
function getFileName(url: string, customName?: string): string {
  if (customName) {
    return customName;
  }

  // Try to extract filename from URL
  const urlParts = url.split('/');
  let fileName = urlParts[urlParts.length - 1];

  // Remove query parameters if any
  fileName = fileName.split('?')[0];

  // If no extension, default to .mp4
  if (!fileName.includes('.')) {
    fileName = `video_${Date.now()}.mp4`;
  } else if (!fileName.match(/\.(mp4|mov|avi|mkv|webm)$/i)) {
    // If extension is not a video format, add .mp4
    fileName = `${fileName.split('.')[0]}_${Date.now()}.mp4`;
  }

  return fileName;
}

/**
 * Download video file from URL
 * 
 * @param url - Video URL to download
 * @param fileName - Optional custom filename (without path)
 * @param onProgress - Optional progress callback
 * @returns Promise with download result containing file path
 * 
 * @example
 * ```typescript
 * const result = await downloadVideo(
 *   'https://example.com/video.mp4',
 *   'my-video.mp4',
 *   (progress) => {
 *     console.log(`Download progress: ${(progress.progress * 100).toFixed(2)}%`);
 *   }
 * );
 * 
 * if (result.success) {
 *   console.log('Video saved to:', result.filePath);
 * } else {
 *   console.error('Download failed:', result.error);
 * }
 * ```
 */
export async function downloadVideo(
  url: string,
  fileName?: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<DownloadResult> {
  try {
    // Validate URL
    if (!url || !url.trim()) {
      return {
        success: false,
        error: 'Invalid URL provided',
      };
    }

    // Request permission for Android (iOS doesn't need permission for Documents folder)
    const permissionResult = await requestStoragePermission();
    if (!permissionResult.granted) {
      const errorMessage = permissionResult.shouldShowRationale
        ? 'Storage permission denied. Please enable it in your device settings to download videos.'
        : 'Storage permission is required to download videos. Please grant the permission when prompted.';
      
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
    const downloadDir = getDownloadPath();

    // Ensure download directory exists
    const dirExists = await RNFS.exists(downloadDir);
    if (!dirExists) {
      await RNFS.mkdir(downloadDir);
    }

    // Get filename
    const finalFileName = getFileName(url, fileName);
    const filePath = `${downloadDir}/${finalFileName}`;

    // Check if file already exists
    const fileExists = await RNFS.exists(filePath);
    if (fileExists) {
      // Option 1: Delete existing file
      await RNFS.unlink(filePath);
      
      // Option 2: Or add timestamp to filename (uncomment if preferred)
      // const timestamp = Date.now();
      // const nameParts = finalFileName.split('.');
      // const newFileName = `${nameParts[0]}_${timestamp}.${nameParts[1]}`;
      // filePath = `${downloadDir}/${newFileName}`;
    }

    console.log('[VideoDownloader] Starting download...');
    console.log('[VideoDownloader] URL:', url);
    console.log('[VideoDownloader] Saving to:', filePath);

    // Download file
    const downloadResult = await RNFS.downloadFile({
      fromUrl: url,
      toFile: filePath,
      progress: (res) => {
        if (onProgress) {
          onProgress({
            bytesWritten: res.bytesWritten,
            contentLength: res.contentLength,
            progress: res.bytesWritten / res.contentLength,
          });
        }
      },
      progressDivider: 10, // Report progress every 10%
    }).promise;

    if (downloadResult.statusCode === 200) {
      console.log('[VideoDownloader] ✅ Download successful');
      console.log('[VideoDownloader] File path:', filePath);

      // Verify file exists
      const exists = await RNFS.exists(filePath);
      if (!exists) {
        return {
          success: false,
          error: 'File downloaded but not found at path',
        };
      }

      // Get file info
      const fileInfo = await RNFS.stat(filePath);
      console.log('[VideoDownloader] File size:', fileInfo.size, 'bytes');

      // Save to gallery using CameraRoll
      try {
        console.log('[VideoDownloader] Saving video to gallery...');
        
        // For Android, we need to use file:// prefix
        const fileUri = Platform.OS === 'android' 
          ? `file://${filePath}` 
          : filePath;

        const savedUri = await CameraRoll.save(fileUri, { type: 'video' });
        
        console.log('[VideoDownloader] ✅ Video saved to gallery:', savedUri);

        // Return gallery URI (videos will appear in gallery)
        return {
          success: true,
          filePath: savedUri, // Gallery URI
        };
      } catch (saveError: any) {
        console.error('[VideoDownloader] ❌ Error saving to gallery:', saveError);
        
        // If saving to gallery fails, still return success with file path
        // The file is downloaded, just not in gallery
        console.warn('[VideoDownloader] Video downloaded but not saved to gallery');
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
    console.error('[VideoDownloader] ❌ Download error:', error);
    return {
      success: false,
      error: error?.message || 'Unknown error occurred during download',
    };
  }
}

/**
 * Check if a file exists at the given path
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    return await RNFS.exists(filePath);
  } catch (error) {
    console.error('[VideoDownloader] Error checking file existence:', error);
    return false;
  }
}

/**
 * Delete a file at the given path
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const exists = await RNFS.exists(filePath);
    if (exists) {
      await RNFS.unlink(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('[VideoDownloader] Error deleting file:', error);
    return false;
  }
}

/**
 * Get file size in bytes
 */
export async function getFileSize(filePath: string): Promise<number | null> {
  try {
    const exists = await RNFS.exists(filePath);
    if (!exists) {
      return null;
    }
    const stat = await RNFS.stat(filePath);
    return stat.size;
  } catch (error) {
    console.error('[VideoDownloader] Error getting file size:', error);
    return null;
  }
}

/**
 * Check if storage permission is granted (Android only)
 * iOS doesn't require permission for Documents folder
 * 
 * @returns Promise<boolean> - true if permission is granted, false otherwise
 * 
 * @example
 * ```typescript
 * const hasPermission = await checkVideoDownloadPermission();
 * if (!hasPermission) {
 *   // Request permission or show message
 * }
 * ```
 */
export async function checkVideoDownloadPermission(): Promise<boolean> {
  return checkStoragePermission();
}

/**
 * Request storage permission for video downloads (Android only)
 * iOS doesn't require permission for Documents folder
 * 
 * @returns Promise with permission result
 * 
 * @example
 * ```typescript
 * const result = await requestVideoDownloadPermission();
 * if (result.granted) {
 *   // Permission granted, proceed with download
 * } else {
 *   // Permission denied, show error message
 * }
 * ```
 */
export async function requestVideoDownloadPermission(): Promise<{granted: boolean; shouldShowRationale?: boolean}> {
  return requestStoragePermission();
}

