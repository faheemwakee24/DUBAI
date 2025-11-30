import {
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import { showToast } from './toast';

export interface SelectedImage {
  uri: string;
  type: string;
  name: string;
}

export interface ImagePickerOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  mediaType?: MediaType;
}

/**
 * Check if photo library permission is granted (Android only)
 * iOS permissions are handled automatically by react-native-image-picker
 */
async function checkPhotoLibraryPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true; // iOS handles permissions automatically
  }

  try {
    const androidVersion = Platform.Version as number;

    // For Android 13+ (API 33+), check READ_MEDIA_IMAGES
    if (androidVersion >= 33) {
      const checkResult = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      );
      return checkResult;
    } else {
      // For Android 6.0-12 (API 23-32), check READ_EXTERNAL_STORAGE
      const checkResult = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
      return checkResult;
    }
  } catch (err) {
    console.error('[ImagePicker] Error checking permission:', err);
    return false;
  }
}

/**
 * Request photo library permission for Android
 * iOS permissions are handled automatically by react-native-image-picker
 */
async function requestPhotoLibraryPermission(): Promise<{
  granted: boolean;
  shouldShowRationale?: boolean;
}> {
  if (Platform.OS !== 'android') {
    return { granted: true }; // iOS handles permissions automatically
  }

  try {
    // First check if permission is already granted
    const alreadyGranted = await checkPhotoLibraryPermission();
    if (alreadyGranted) {
      console.log('[ImagePicker] Permission already granted');
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
      // For Android 6.0-12 (API 23-32), request READ_EXTERNAL_STORAGE
      permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      permissionName = 'READ_EXTERNAL_STORAGE';
    }

    console.log(
      `[ImagePicker] Requesting ${permissionName} permission for Android ${androidVersion}`,
    );

    const result = await PermissionsAndroid.request(permission, {
      title: 'Photo Library Permission',
      message:
        'This app needs access to your photo library to select images.',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'Grant Permission',
    });

    const granted = result === PermissionsAndroid.RESULTS.GRANTED;
    const shouldShowRationale =
      result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;

    if (!granted) {
      console.warn(
        `[ImagePicker] Permission ${permissionName} denied:`,
        result,
      );
    }

    return { granted, shouldShowRationale };
  } catch (err) {
    console.error('[ImagePicker] Error requesting permission:', err);
    return { granted: false };
  }
}

/**
 * Show alert to open app settings when permission is permanently denied
 */
function showPermissionDeniedAlert() {
  Alert.alert(
    'Permission Required',
    'Photo library permission is required to select images. Please enable it in app settings.',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: () => {
          Linking.openSettings();
        },
      },
    ],
  );
}

/**
 * Global function to select an image from the device gallery
 * Handles permissions automatically for both iOS and Android
 * @param options - Optional configuration for image picker
 * @returns Promise that resolves with selected image data or null if cancelled
 */
export const selectImage = async (
  options: ImagePickerOptions = {},
): Promise<SelectedImage | null> => {
  // Request permission on Android before launching picker
  if (Platform.OS === 'android') {
    const permissionResult = await requestPhotoLibraryPermission();
    if (!permissionResult.granted) {
      if (permissionResult.shouldShowRationale) {
        showPermissionDeniedAlert();
      } else {
        showToast.error(
          'Permission Denied',
          'Photo library permission is required to select images.',
        );
      }
      return null;
    }
  }

  return new Promise((resolve) => {
    const pickerOptions: ImageLibraryOptions = {
      mediaType: options.mediaType || 'photo',
      quality: (options.quality ?? 0.8) as any,
      maxWidth: options.maxWidth ?? 1920,
      maxHeight: options.maxHeight ?? 1080,
    };

    launchImageLibrary(pickerOptions, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        resolve(null);
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        
        // Handle specific error codes
        if (response.errorCode === 'permission') {
          showToast.error(
            'Permission Denied',
            'Photo library permission is required. Please enable it in settings.',
          );
          if (Platform.OS === 'android') {
            // Show alert to open settings after a short delay
            setTimeout(() => {
              showPermissionDeniedAlert();
            }, 1500);
          }
        } else {
          showToast.error(
            'Error',
            response.errorMessage || 'Failed to pick image',
          );
        }
        resolve(null);
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        const imageData: SelectedImage = {
          uri: asset.uri || '',
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `image_${Date.now()}.jpg`,
        };
        resolve(imageData);
      } else {
        resolve(null);
      }
    });
  });
};

