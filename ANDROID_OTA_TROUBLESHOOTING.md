# Android OTA Update Troubleshooting Guide

## Current Configuration Status

### ✅ What's Configured:
1. CodePush HOC in `App.tsx` with immediate installation
2. Explicit `codePush.sync()` call with logging
3. Deployment key in `strings.xml`
4. Gradle plugin applied
5. Internet permission granted

## Common Issues & Solutions

### 1. **Testing on Debug Build**
**Problem**: CodePush only works on **RELEASE** builds, not debug builds.

**Solution**: 
```bash
# Build release APK
cd android
./gradlew assembleRelease

# Install on device
adb install app/build/outputs/apk/release/app-release.apk
```

### 2. **Version Mismatch**
**Problem**: OTA update `targetBinaryVersion` doesn't match app's `versionName`.

**Check**:
- `android/app/build.gradle`: `versionName "1.0"`
- Release command: `--targetBinaryVersion "1.0"` (must match exactly)

**Solution**: Ensure versions match exactly.

### 3. **Deployment Key Mismatch**
**Problem**: Deployment key in `strings.xml` doesn't match Revopush dashboard.

**Check**:
- `android/app/src/main/res/values/strings.xml`: Deployment key
- Revopush dashboard: Verify the key matches

**Solution**: 
```bash
# Check your deployment keys
npx @revopush/code-push-cli deployment ls "DUB Nxt" -k
```

### 4. **No Release Available**
**Problem**: No OTA release has been published yet.

**Solution**: 
```bash
# Release an update
npx @revopush/code-push-cli release-react "DUB Nxt" android \
  --deploymentName Production \
  --description "Test update" \
  --mandatory \
  --targetBinaryVersion "1.0"
```

### 5. **Network Issues**
**Problem**: App can't reach Revopush server.

**Check**:
- Internet permission in `AndroidManifest.xml` ✅
- Device has internet connection
- Firewall/proxy not blocking `https://api.revopush.org`

**Solution**: Check device logs:
```bash
adb logcat | grep -i codepush
```

### 6. **CodePush Not Initialized**
**Problem**: CodePush native module not properly initialized.

**Check Logs**:
```bash
adb logcat | grep -i "CodePush\|codepush"
```

Look for:
- `[CodePush]` prefixed logs
- Any initialization errors
- Bundle URL logs

### 7. **App Not Restarting After Update**
**Problem**: Update downloaded but app doesn't restart.

**Current Config**: `installMode: IMMEDIATE` should auto-restart.

**Check**: Look for `UPDATE_INSTALLED` status in logs.

## Debugging Steps

### Step 1: Check Logs
```bash
# Filter CodePush logs
adb logcat | grep -i codepush

# Or view all React Native logs
adb logcat | grep -i "ReactNative\|CodePush"
```

### Step 2: Verify Release Exists
```bash
# List releases
npx @revopush/code-push-cli deployment ls "DUB Nxt" Production

# Check release history
npx @revopush/code-push-cli deployment history "DUB Nxt" Production
```

### Step 3: Test with Manual Check
Add this to a button in your app temporarily:
```typescript
import codePush from '@revopush/react-native-code-push';

const checkUpdate = async () => {
  try {
    const update = await codePush.checkForUpdate();
    console.log('Update available:', update);
    if (update) {
      await codePush.sync({
        installMode: codePush.InstallMode.IMMEDIATE,
      });
    }
  } catch (error) {
    console.error('Update check error:', error);
  }
};
```

### Step 4: Verify Build Configuration
```bash
# Check if release build was created
ls -la android/app/build/outputs/apk/release/

# Verify version in APK
aapt dump badging app-release.apk | grep version
```

## Expected Behavior

1. **App Start**: CodePush checks for updates automatically
2. **Update Found**: Downloads in background
3. **Download Complete**: Installs immediately (IMMEDIATE mode)
4. **Installation**: App restarts automatically

## Console Logs to Look For

When working correctly, you should see:
```
CodePush: Checking for updates...
CodePush sync status: CHECKING_FOR_UPDATE
CodePush sync status: DOWNLOADING_PACKAGE
CodePush download progress: { receivedBytes: X, totalBytes: Y }
CodePush sync status: INSTALLING_UPDATE
CodePush sync status: UPDATE_INSTALLED
CodePush: Update installed, restarting...
```

## Quick Test Command

```bash
# 1. Build release APK
cd android && ./gradlew assembleRelease

# 2. Install on device
adb install app/build/outputs/apk/release/app-release.apk

# 3. Release an OTA update
cd ..
npx @revopush/code-push-cli release-react "DUB Nxt" android \
  --deploymentName Production \
  --description "Test OTA" \
  --mandatory \
  --targetBinaryVersion "1.0"

# 4. Restart app and check logs
adb logcat -c  # Clear logs
adb logcat | grep -i codepush
```

## Still Not Working?

1. Verify you're testing on a **release build** (not debug)
2. Check that a release exists with matching `targetBinaryVersion`
3. Verify deployment key matches dashboard
4. Check device logs for CodePush errors
5. Ensure device has internet connection
6. Try clearing app data and reinstalling






