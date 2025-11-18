import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Alert,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import PrimaryButton from '../../components/ui/PrimaryButton';
import Input from '../../components/ui/Input';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { FontFamily, Typography } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { Svgs } from '../../assets/icons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, LiquidGlassBackground } from '../../components/ui';
import { Images } from '../../assets/images';
import { useUploadVideoDubbingMutation } from '../../store/api';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function UploadVedio() {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const [selectedVideo, setSelectedVideo] = useState<{
    uri: string;
    type: string;
    name: string;
    fileSize?: number;
    duration?: number;
  } | null>(null);

  const selectVideo = () => {
    const options = {
      mediaType: 'video' as MediaType,
      quality: 1,
      videoQuality: 'high' as const,
      maxWidth: 1920,
      maxHeight: 1080,
    };

    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled video picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', response.errorMessage || 'Failed to pick video');
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        console.log('asset', asset);
        setSelectedVideo({
          uri: asset.uri || '',
          type: asset.type || 'video/mp4',
          name: asset.fileName || `video_${Date.now()}.mp4`,
          fileSize: asset.fileSize,
          duration: asset.duration,
        });
      }
    });
  };

  const handleSelectFile = () => {
    if (selectedVideo) {
      // Navigate to next screen with selected video
      navigation.navigate('SelectVedioDescription', {
        video: selectedVideo,
      });
    } else {
      // Show video picker
      selectVideo();
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Header
            title="Video Dubbing"
            showBackButton
            RigthIcon={
              <TouchableOpacity onPress={()=>navigation.navigate('VideoHistory')}>
                <Svgs.HistoryIcon
                  height={metrics.width(20)}
                  width={metrics.width(20)}
                />
              </TouchableOpacity>
            }
          />
          <LiquidGlassBackground style={styles.liquidCotaier}>
            <View style={styles.imageContainer}>
              <Image source={Images.UploadVedio} />
              {!selectedVideo && (
                <>
                  <Text style={styles.title}>Upload your Video</Text>
                  <Text style={styles.subtitle}>
                    Drag and drop or click to browse
                  </Text>
                </>
              )}
              {selectedVideo && (
                <View style={styles.videoInfoContainer}>
                  <Text style={styles.videoInfoText} numberOfLines={1}>
                    {selectedVideo.name}
                  </Text>
                  <View style={styles.videoMetaRow}>
                    <Text style={styles.videoMetaText}>
                      {formatDuration(selectedVideo.duration)}
                    </Text>
                    <View style={styles.dot} />
                    <Text style={styles.videoMetaText}>
                      {formatFileSize(selectedVideo.fileSize)}
                    </Text>
                  </View>
                </View>
              )}
              <PrimaryButton
                title={selectedVideo ? 'Continue' : 'Select File'}
                onPress={handleSelectFile}
                variant="primary"
                size="small"
                extraContainerStyle={styles.button}
              />
              {selectedVideo && (
                <TouchableOpacity
                  onPress={selectVideo}
                  style={styles.changeButton}
                >
                  <Text style={styles.changeButtonText}>Change Video</Text>
                </TouchableOpacity>
              )}
            </View>
          </LiquidGlassBackground>

          <Text style={styles.title2}>How it Works</Text>
          <View style={styles.howItWorksContainer}>
            <View style={styles.stepContainer}>
              <LinearGradient
                colors={colors.gradientLine}
                style={styles.gradientLine}
              />

              <View style={styles.roww}>
                <Image source={Images.Elipse} style={styles.elipse} />
                <Text style={styles.stepText}>
                  Upload your video in any language
                </Text>
              </View>
              <View style={styles.roww}>
                <Image source={Images.Elipse} style={styles.elipse} />
                <Text style={styles.stepText}>
                  AI detects the original language{' '}
                </Text>
              </View>
              <View style={styles.roww}>
                <Image source={Images.Elipse} style={styles.elipse} />
                <Text style={styles.stepText}>
                  Select target language and voice{' '}
                </Text>
              </View>
              <View style={styles.roww}>
                <Image source={Images.Elipse} style={styles.elipse} />
                <Text style={styles.stepText}>
                  Generate dubbed video with lip-sync{' '}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
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
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  liquidCotaier: {},
  title: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(17),
    color: colors.white,
    marginTop: metrics.width(10),
  },
  subtitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
    marginTop: metrics.width(5),
  },
  imageContainer: {
    paddingVertical: metrics.width(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    borderRadius: 8,
    paddingHorizontal: metrics.width(20),
    marginTop: metrics.width(25),
    paddingVertical: metrics.width(5),
  },
  title2: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(17),
    color: colors.white,
    marginTop: metrics.width(40),
  },
  howItWorksContainer: {
    flexDirection: 'row',
    marginTop: metrics.width(20),
  },
  roww: {
    flexDirection: 'row',
    gap: metrics.width(10),
  },
  stepText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(17),
    color: colors.subtitle,
  },
  stepContainer: {
    gap: metrics.width(20),
  },
  elipse: {
    width: metrics.width(20),
    height: metrics.width(20),
  },
  gradientLine: {
    height: '100%',
    width: 1,
    zIndex: -1,
    left: 9.5,
    marginTop: 8,
    position: 'absolute',
  },
  vedioIcon2: {
    height: metrics.width(100),
    width: metrics.width(100),
    resizeMode: 'contain',
  },
  videoInfoContainer: {
    width: '100%',
    marginTop: metrics.width(15),
    paddingHorizontal: metrics.width(10),
  },
  videoInfoText: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(14),
    color: colors.white,
    textAlign: 'center',
  },
  videoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: metrics.width(8),
    marginTop: metrics.width(5),
  },
  videoMetaText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(12),
    color: colors.subtitle,
  },
  dot: {
    height: metrics.width(4),
    width: metrics.width(4),
    borderRadius: 100,
    backgroundColor: colors.subtitle,
  },
  changeButton: {
    marginTop: metrics.width(10),
  },
  changeButtonText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.primary,
    textAlign: 'center',
  },
});
