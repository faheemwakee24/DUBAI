# Video Downloader Usage Guide

Complete guide for downloading videos using `react-native-fs` with permission handling for Android and iOS.

## Installation

The `react-native-fs` package is already installed in this project. If you need to install it in another project:

```bash
npm install react-native-fs
# or
yarn add react-native-fs

# For iOS
cd ios && pod install
```

## Permissions Setup

### Android Permissions

The following permissions are **already configured** in `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Storage permissions for Android 12 and below -->
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
<!-- Media permissions for Android 13+ -->
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
```

**Note:** Permissions are automatically requested when you call `downloadVideo()`. The function will:
- Check if permission is already granted
- Request permission if not granted
- Show appropriate error messages if permission is denied

### iOS Permissions

iOS doesn't require special permissions for saving files to the Documents folder. However, if you want to save videos to the Photos library, the following permissions are **already configured** in `ios/DubAI/Info.plist`:

```xml
<key>NSPhotoLibraryAddUsageDescription</key>
<string>This app needs access to your photo library to save avatar images and downloaded videos.</string>
```

**Note:** The current implementation saves to Documents/Downloads folder, which doesn't require permissions on iOS.

## Basic Usage

### Simple Download

```typescript
import { downloadVideo } from '../utils/videoDownloader';

const handleDownload = async () => {
  const result = await downloadVideo('https://example.com/video.mp4');
  
  if (result.success) {
    console.log('Video saved to:', result.filePath);
    // File is saved to:
    // Android: /storage/emulated/0/Download/video.mp4
    // iOS: /var/mobile/Containers/Data/Application/.../Documents/Downloads/video.mp4
  } else {
    console.error('Download failed:', result.error);
  }
};
```

### Download with Custom Filename

```typescript
import { downloadVideo } from '../utils/videoDownloader';

const handleDownload = async () => {
  const result = await downloadVideo(
    'https://example.com/video.mp4',
    'my-custom-video-name.mp4'
  );
  
  if (result.success) {
    console.log('Video saved to:', result.filePath);
  }
};
```

### Download with Progress Tracking

```typescript
import { downloadVideo, DownloadProgress } from '../utils/videoDownloader';
import { useState } from 'react';

const MyComponent = () => {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    const result = await downloadVideo(
      'https://example.com/video.mp4',
      'video.mp4',
      (progress: DownloadProgress) => {
        const percent = Math.round(progress.progress * 100);
        setDownloadProgress(percent);
        console.log(`Download: ${percent}%`);
        console.log(`Bytes: ${progress.bytesWritten} / ${progress.contentLength}`);
      }
    );

    setIsDownloading(false);

    if (result.success) {
      console.log('Download complete!', result.filePath);
    } else {
      console.error('Download failed:', result.error);
    }
  };

  return (
    <View>
      <Button title="Download" onPress={handleDownload} disabled={isDownloading} />
      {isDownloading && (
        <View>
          <Text>Downloading: {downloadProgress}%</Text>
          <ProgressBar progress={downloadProgress} />
        </View>
      )}
    </View>
  );
};
```

## Complete Example with UI

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { downloadVideo, DownloadProgress } from '../utils/videoDownloader';
import { showToast } from '../utils/toast';

const VideoDownloadExample = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadPath, setDownloadPath] = useState<string | null>(null);

  const videoUrl = 'https://example.com/sample-video.mp4';

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadPath(null);

    try {
      const result = await downloadVideo(
        videoUrl,
        `downloaded_video_${Date.now()}.mp4`,
        (progress: DownloadProgress) => {
          const percent = Math.round(progress.progress * 100);
          setDownloadProgress(percent);
        }
      );

      if (result.success && result.filePath) {
        setDownloadPath(result.filePath);
        showToast.success('Success', 'Video downloaded successfully!');
        Alert.alert(
          'Download Complete',
          `Video saved to:\n${result.filePath}`,
          [{ text: 'OK' }]
        );
      } else {
        showToast.error('Error', result.error || 'Download failed');
        Alert.alert('Download Failed', result.error || 'Unknown error');
      }
    } catch (error: any) {
      showToast.error('Error', error?.message || 'Download failed');
      Alert.alert('Error', error?.message || 'Unknown error occurred');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Download Example</Text>
      
      <TouchableOpacity
        style={[styles.button, isDownloading && styles.buttonDisabled]}
        onPress={handleDownload}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Download Video</Text>
        )}
      </TouchableOpacity>

      {isDownloading && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Downloading: {downloadProgress}%
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${downloadProgress}%` },
              ]}
            />
          </View>
        </View>
      )}

      {downloadPath && (
        <View style={styles.pathContainer}>
          <Text style={styles.pathLabel}>Saved to:</Text>
          <Text style={styles.pathText}>{downloadPath}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 20,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  pathContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  pathLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pathText: {
    fontSize: 11,
    color: '#666',
  },
});

export default VideoDownloadExample;
```

## Permission Management

### Check Permission Status

You can check if permission is granted before attempting to download:

```typescript
import { checkVideoDownloadPermission } from '../utils/videoDownloader';

const hasPermission = await checkVideoDownloadPermission();
if (hasPermission) {
  // Permission is granted, proceed with download
  const result = await downloadVideo(url);
} else {
  // Permission not granted, request it
  const result = await requestVideoDownloadPermission();
}
```

### Request Permission Manually

You can request permission manually if needed:

```typescript
import { requestVideoDownloadPermission } from '../utils/videoDownloader';

const result = await requestVideoDownloadPermission();
if (result.granted) {
  console.log('Permission granted!');
} else {
  if (result.shouldShowRationale) {
    // User selected "Don't ask again"
    // Show message to open settings
    Alert.alert(
      'Permission Required',
      'Please enable storage permission in Settings to download videos.'
    );
  } else {
    // User denied permission, can ask again
    console.log('Permission denied, can request again');
  }
}
```

**Note:** The `downloadVideo()` function automatically handles permission requests, so you typically don't need to call these functions manually.

## API Reference

### `downloadVideo(url, fileName?, onProgress?)`

Downloads a video file from a URL. **Automatically requests permissions if needed.**

**Parameters:**
- `url` (string, required): The video URL to download
- `fileName` (string, optional): Custom filename (without path). If not provided, extracted from URL or auto-generated
- `onProgress` (function, optional): Progress callback that receives `DownloadProgress` object

**Returns:** `Promise<DownloadResult>`

**DownloadResult:**
```typescript
{
  success: boolean;
  filePath?: string;  // Local file path if successful
  error?: string;     // Error message if failed
}
```

**DownloadProgress:**
```typescript
{
  bytesWritten: number;    // Bytes downloaded so far
  contentLength: number;   // Total file size in bytes
  progress: number;        // Progress ratio (0-1)
}
```

### Permission Functions

#### `checkVideoDownloadPermission(): Promise<boolean>`

Check if storage permission is granted (Android only). iOS always returns `true` as it doesn't require permission for Documents folder.

**Returns:** `Promise<boolean>` - `true` if permission is granted

#### `requestVideoDownloadPermission(): Promise<{granted: boolean; shouldShowRationale?: boolean}>`

Request storage permission for video downloads (Android only). iOS always returns `{granted: true}`.

**Returns:** 
- `granted` (boolean): Whether permission was granted
- `shouldShowRationale` (boolean, optional): `true` if user selected "Don't ask again"

### Helper Functions

#### `fileExists(filePath: string): Promise<boolean>`

Check if a file exists at the given path.

```typescript
import { fileExists } from '../utils/videoDownloader';

const exists = await fileExists('/path/to/video.mp4');
console.log('File exists:', exists);
```

#### `deleteFile(filePath: string): Promise<boolean>`

Delete a file at the given path.

```typescript
import { deleteFile } from '../utils/videoDownloader';

const deleted = await deleteFile('/path/to/video.mp4');
console.log('File deleted:', deleted);
```

#### `getFileSize(filePath: string): Promise<number | null>`

Get file size in bytes.

```typescript
import { getFileSize } from '../utils/videoDownloader';

const size = await getFileSize('/path/to/video.mp4');
if (size !== null) {
  console.log('File size:', size, 'bytes');
  console.log('File size:', (size / 1024 / 1024).toFixed(2), 'MB');
}
```

## Platform-Specific Notes

### Android
- Files are saved to the Downloads folder: `/storage/emulated/0/Download/`
- Requires `WRITE_EXTERNAL_STORAGE` permission (handled automatically)
- Permission dialog is shown automatically on first use

### iOS
- Files are saved to: `Documents/Downloads/` directory
- No special permissions required
- Files are accessible within the app's sandbox

## Error Handling

The function handles common errors:
- Invalid URL
- Permission denied
- Network errors
- File system errors
- File already exists (automatically overwrites)

Always check the `success` field in the result:

```typescript
const result = await downloadVideo(url);

if (!result.success) {
  // Handle error
  console.error('Error:', result.error);
  // Show user-friendly error message
} else {
  // Success
  console.log('File path:', result.filePath);
}
```

## Notes

- The function automatically creates the download directory if it doesn't exist
- If a file with the same name exists, it will be overwritten
- Progress updates are reported every 10% by default
- The function validates URLs and handles edge cases
- All file operations are asynchronous and non-blocking

