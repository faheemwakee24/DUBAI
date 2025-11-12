import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  Text,
  Platform,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { FontFamily } from '../../constants/fonts';
import { Header, LiquidGlassBackground, Checkbox, PrimaryButton } from '../../components/ui';
import { Images } from '../../assets/images';
import { showToast } from '../../utils/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ViewShot from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { PermissionsAndroid } from 'react-native';

export default function AvatarCustomization() {
  const [beard, setBeard] = useState(false);
  const [beard2, setBeard2] = useState(false);
  const [lips, setLips] = useState(false);
  const [smileLips, setSmileLips] = useState(false);
  const [eyes, setEyes] = useState(false);
  const [nose, setNose] = useState(false);
  const [cap, setCap] = useState(false);
  const [cap2, setCap2] = useState(false);
  const [glasses, setGlasses] = useState(false);
  const [glasses2, setGlasses2] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const viewShotRef = useRef<ViewShot | null>(null);

  // Handle Cap selection - mutually exclusive with Cap 2
  const handleCapChange = (value: boolean) => {
    setCap(value);
    if (value) {
      setCap2(false); // Deselect Cap 2 if Cap is selected
    }
  };

  // Handle Cap 2 selection - mutually exclusive with Cap
  const handleCap2Change = (value: boolean) => {
    setCap2(value);
    if (value) {
      setCap(false); // Deselect Cap if Cap 2 is selected
    }
  };

  // Handle Glasses selection - mutually exclusive with Glasses 2
  const handleGlassesChange = (value: boolean) => {
    setGlasses(value);
    if (value) {
      setGlasses2(false); // Deselect Glasses 2 if Glasses is selected
    }
  };

  // Handle Glasses 2 selection - mutually exclusive with Glasses
  const handleGlasses2Change = (value: boolean) => {
    setGlasses2(value);
    if (value) {
      setGlasses(false); // Deselect Glasses if Glasses 2 is selected
    }
  };

  // Handle Beard selection - mutually exclusive with Beard 2
  const handleBeardChange = (value: boolean) => {
    setBeard(value);
    if (value) {
      setBeard2(false); // Deselect Beard 2 if Beard is selected
    }
  };

  // Handle Beard 2 selection - mutually exclusive with Beard
  const handleBeard2Change = (value: boolean) => {
    setBeard2(value);
    if (value) {
      setBeard(false); // Deselect Beard if Beard 2 is selected
    }
  };

  // Handle Lips selection - mutually exclusive with Smile Lips
  const handleLipsChange = (value: boolean) => {
    setLips(value);
    if (value) {
      setSmileLips(false); // Deselect Smile Lips if Lips is selected
    }
  };

  // Handle Smile Lips selection - mutually exclusive with Lips
  const handleSmileLipsChange = (value: boolean) => {
    setSmileLips(value);
    if (value) {
      setLips(false); // Deselect Lips if Smile Lips is selected
    }
  };

  // Save avatar configuration to AsyncStorage
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const avatarConfig = {
        beard,
        beard2,
        lips,
        smileLips,
        eyes,
        nose,
        cap,
        cap2,
        glasses,
        glasses2,
      };
      
      console.log('Saving avatar config:', avatarConfig);
      await AsyncStorage.setItem('avatarConfig', JSON.stringify(avatarConfig));
      
      // Verify it was saved
      const saved = await AsyncStorage.getItem('avatarConfig');
      if (saved) {
        console.log('Avatar config saved successfully');
        showToast.success('Saved', 'Avatar configuration saved successfully!');
      } else {
        throw new Error('Failed to verify save');
      }
    } catch (error: any) {
      console.error('Error saving avatar config:', error);
      const errorMessage = error?.message || 'Failed to save avatar configuration';
      showToast.error('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Request Android permissions for saving to gallery
  const requestAndroidPermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      // For Android 13+ (API 33+), we need different permissions
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: 'Photo Library Permission',
            message: 'App needs access to your photo library to save images',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // For Android < 13, use WRITE_EXTERNAL_STORAGE
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to storage to save images',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  };

  // Download avatar as image and save to gallery
  const handleDownload = async () => {
    if (!viewShotRef.current) {
      console.error('ViewShot ref is null');
      showToast.error('Error', 'Unable to capture avatar');
      return;
    }

    setIsDownloading(true);
    try {
      console.log('Capturing avatar...');
      
      // Request permissions for Android
      if (Platform.OS === 'android') {
        const hasPermission = await requestAndroidPermission();
        if (!hasPermission) {
          showToast.error('Permission Denied', 'Please grant storage permission to save images');
          setIsDownloading(false);
          return;
        }
      }
      
      // Add a small delay to ensure the view is rendered
      await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
      
      if (!viewShotRef.current?.capture) {
        throw new Error('ViewShot capture method not available');
      }
      
      const uri = await viewShotRef.current.capture();
      console.log('Avatar captured at:', uri);
      
      if (!uri) {
        throw new Error('Failed to capture image');
      }
      
      // Save to gallery using CameraRoll
      const savedUri = await CameraRoll.save(uri, { type: 'photo' });
      console.log('Image saved to gallery:', savedUri);
      
      showToast.success('Downloaded', 'Avatar image saved to gallery successfully!');
    } catch (error: any) {
      console.error('Error downloading avatar:', error);
      const errorMessage = error?.message || 'Failed to download avatar image';
      showToast.error('Error', errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Customize Avatar" showBackButton />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Display Section */}
          <View style={styles.avatarContainer}>
            <LiquidGlassBackground style={styles.avatarBackground}>
              <ViewShot
                ref={viewShotRef}
                options={{ format: 'png', quality: 1.0 }}
                style={styles.viewShot}
              >
                <View style={styles.avatarWrapper}>
                {/* Body Image */}
                <Image
                  source={Images.CharacterBody}
                  style={styles.bodyImage}
                  resizeMode="contain"
                />
                
                {/* Overlay Images - Only show if checked */}
                {eyes && (
                  <Image
                    source={Images.CharacterEye}
                    style={[styles.overlayImage, styles.eyesOverlay]}
                    resizeMode="contain"
                  />
                )}
                {nose && (
                  <Image
                    source={Images.CharacterNose}
                    style={[styles.overlayImage, styles.noseOverlay]}
                    resizeMode="contain"
                  />
                )}
                {lips && (
                  <Image
                    source={Images.CharacterLips}
                    style={[styles.overlayImage, styles.lipsOverlay]}
                    resizeMode="contain"
                  />
                )}
                {smileLips && (
                  <Image
                    source={Images.CharacterSmileLips}
                    style={[styles.overlayImage, styles.smileLipsOverlay]}
                    resizeMode="contain"
                  />
                )}
                {beard && (
                  <Image
                    source={Images.CharacterBeard}
                    style={[styles.overlayImage, styles.beardOverlay]}
                    resizeMode="contain"
                  />
                )}
                {beard2 && (
                  <Image
                    source={Images.CharacterBeard2}
                    style={[styles.overlayImage, styles.beard2Overlay]}
                    resizeMode="contain"
                  />
                )}
                {glasses && (
                  <Image
                    source={Images.CharacterGlasses}
                    style={[styles.overlayImage, styles.glassesOverlay]}
                    resizeMode="contain"
                  />
                )}
                {glasses2 && (
                  <Image
                    source={Images.CharacterGlasses2}
                    style={[styles.overlayImage, styles.glassesOverlay]}
                    resizeMode="contain"
                  />
                )}
                {cap && (
                  <Image
                    source={Images.CharacterCap}
                    style={[styles.overlayImage, styles.capOverlay]}
                    resizeMode="contain"
                  />
                )}
                {cap2 && (
                  <Image
                    source={Images.CharacterCap2}
                    style={[styles.overlayImage, styles.cap2Overlay]}
                    resizeMode="contain"
                  />
                )}
              </View>
              </ViewShot>
            </LiquidGlassBackground>
          </View>

          {/* Checkboxes Section */}
          <View style={styles.checkboxesContainer}>
            <LiquidGlassBackground style={styles.checkboxesBackground}>
              <View style={styles.checkboxesContent}>
                <Text style={styles.sectionTitle}>Customize Features</Text>
                
                <View style={styles.checkboxesList}>
                  <Checkbox
                    label="Eyes"
                    value={eyes}
                    onValueChange={setEyes}
                  />
                  <Checkbox
                    label="Nose"
                    value={nose}
                    onValueChange={setNose}
                  />
                  
                  {/* Beard Row */}
                  <View style={styles.checkboxRow}>
                    <View style={styles.checkboxItem}>
                      <Checkbox
                        label="Beard"
                        value={beard}
                        onValueChange={handleBeardChange}
                      />
                    </View>
                    <View style={styles.checkboxItem}>
                      <Checkbox
                        label="Beard 2"
                        value={beard2}
                        onValueChange={handleBeard2Change}
                      />
                    </View>
                  </View>
                  
                  {/* Lips Row */}
                  <View style={styles.checkboxRow}>
                    <View style={styles.checkboxItem}>
                      <Checkbox
                        label="Lips"
                        value={lips}
                        onValueChange={handleLipsChange}
                      />
                    </View>
                    <View style={styles.checkboxItem}>
                      <Checkbox
                        label="Smile Lips"
                        value={smileLips}
                        onValueChange={handleSmileLipsChange}
                      />
                    </View>
                  </View>
                  
                  {/* Cap Row */}
                  <View style={styles.checkboxRow}>
                    <View style={styles.checkboxItem}>
                      <Checkbox
                        label="Cap"
                        value={cap}
                        onValueChange={handleCapChange}
                      />
                    </View>
                    <View style={styles.checkboxItem}>
                      <Checkbox
                        label="Cap 2"
                        value={cap2}
                        onValueChange={handleCap2Change}
                      />
                    </View>
                  </View>
                  
                  {/* Glasses Row */}
                  <View style={styles.checkboxRow}>
                    <View style={styles.checkboxItem}>
                      <Checkbox
                        label="Glasses"
                        value={glasses}
                        onValueChange={handleGlassesChange}
                      />
                    </View>
                    <View style={styles.checkboxItem}>
                      <Checkbox
                        label="Glasses 2"
                        value={glasses2}
                        onValueChange={handleGlasses2Change}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </LiquidGlassBackground>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <PrimaryButton
            title={isSaving ? 'Saving...' : 'Save'}
            onPress={handleSave}
            variant="secondary"
            style={styles.saveButton}
            loading={isSaving}
            disabled={isSaving || isDownloading}
          />
          <PrimaryButton
            title={isDownloading ? 'Downloading...' : 'Download'}
            onPress={handleDownload}
            variant="primary"
            style={styles.downloadButton}
            loading={isDownloading}
            disabled={isSaving || isDownloading}
          />
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    marginHorizontal: metrics.width(25),
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: metrics.width(20),
    paddingBottom: metrics.width(40),
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: metrics.width(30),
  },
  avatarBackground: {
    width: '100%',
    borderRadius: 16,
    padding: metrics.width(20),
  },
  avatarWrapper: {
    width: '100%',
    height: metrics.width(400),
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyImage: {
    width: 300,
    height: 300,
    position: 'absolute',

  },
  overlayImage: {
    position: 'absolute',
    width: 300,
    height: 300,
    
  },
  eyesOverlay: {
    zIndex: 4,
  },
  noseOverlay: {
    zIndex: 3,
  },
  lipsOverlay: {
    zIndex: 2,
  },
  smileLipsOverlay: {
    zIndex: 2,
  },
  beardOverlay: {
    zIndex: 1,
  },
  beard2Overlay: {
    zIndex: 1,
  },
  glassesOverlay: {
    zIndex: 5,
  },
  glasses2Overlay: {
    zIndex: 5,
  },
  capOverlay: {
    zIndex: 6,
  },
  cap2Overlay: {
    zIndex: 6,
  },
  checkboxesContainer: {
    marginTop: metrics.width(20),
  },
  checkboxesBackground: {
    borderRadius: 16,
    padding: metrics.width(20),
  },
  checkboxesContent: {
    gap: metrics.width(20),
  },
  sectionTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(20),
    color: colors.white,
  },
  checkboxesList: {
    gap: metrics.width(20),
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: metrics.width(20),
    width: '100%',
  },
  checkboxItem: {
    flex: 1,
  },
  viewShot: {
    width: '100%',
    height: metrics.width(400),
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: metrics.width(15),
    paddingHorizontal: metrics.width(25),
    paddingBottom: metrics.width(25),
    paddingTop: metrics.width(15),
  },
  saveButton: {
    flex: 1,
  },
  downloadButton: {
    flex: 1,
  },
});

