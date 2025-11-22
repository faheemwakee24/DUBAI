import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Header,
  PrimaryButton,
} from '../../components/ui';
import { Svgs } from '../../assets/icons';
import Video, { OnLoadData, OnProgressData, VideoRef } from 'react-native-video';
import Slider from '@react-native-community/slider';
import LinearGradient from 'react-native-linear-gradient';
import { downloadVideo, DownloadProgress } from '../../utils/videoDownloader';
import { showToast } from '../../utils/toast';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

const { width, height } = Dimensions.get('window');

export default function PreViewVideo() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'PreViewVedio'>>();
  const { video_url } = route.params || {};
  const videoRef = useRef<VideoRef | null>(null);

  const [paused, setPaused] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [hasEnded, setHasEnded] = useState(false);

  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controlsOpacity = useRef(new Animated.Value(1)).current;

  const formatTime = useCallback((time: number) => {
    if (typeof time !== 'number' || isNaN(time) || time < 0) {
      return '0:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, []);

  useEffect(() => {
    if (showControls) {
      // Animate controls in
      Animated.timing(controlsOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
      hideControlsTimeout.current = setTimeout(() => {
        // Animate controls out
        Animated.timing(controlsOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowControls(false);
        });
      }, 3000);
    } else {
      // Animate controls out immediately
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    return () => {
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    };
  }, [showControls, controlsOpacity]);

  const handleLoad = useCallback((data: OnLoadData) => {
    console.log('[PreViewVedio] ✅ Video loaded successfully', data.duration);
    setDuration(data.duration);
    setVideoLoading(false);
    setVideoError(false);
  }, []);

  const handleProgress = useCallback((data: OnProgressData) => {
    setCurrentTime(data.currentTime);
  }, []);

  const handleError = useCallback((error: any) => {
    console.error('[PreViewVedio] ❌ Video error:', error);
    setVideoError(true);
    setVideoLoading(false);
  }, []);

  const handleScreenPress = useCallback(() => {
    console.log('[PreViewVedio] Screen pressed, showing controls');
    setShowControls(true);
    // Clear any existing timeout
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    // If video has ended and we're trying to play, reset to beginning
    if (hasEnded && paused) {
      setCurrentTime(0);
      setHasEnded(false);
      if (videoRef.current) {
        videoRef.current.seek(0);
      }
    }
    setPaused(prev => !prev);
    setShowControls(true);
  }, [hasEnded, paused]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
    if (videoRef.current) {
      isFullscreen
        ? videoRef.current.dismissFullscreenPlayer()
        : videoRef.current.presentFullscreenPlayer();
    }
  }, [isFullscreen]);

  const handleSeek = useCallback((value: number) => {
    if (videoRef.current) {
      videoRef.current.seek(value);
      setCurrentTime(value);
      // If we seek, video is no longer at the end
      if (hasEnded) {
        setHasEnded(false);
      }
    }
  }, [hasEnded]);

  const handleEnd = useCallback(() => {
    setPaused(true);
    setHasEnded(true);
    // Keep currentTime at duration to show it's at the end
    // Don't reset to 0 here, let the user see it's finished
  }, []);

  // Handle video download
  const handleDownloadVideo = async () => {
    if (!video_url) {
      showToast.error('Error', 'No video URL available');
      return;
    }

    if (isDownloading) {
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const result = await downloadVideo(
        video_url,
        `dubbed_video_${Date.now()}.mp4`,
        (progress: DownloadProgress) => {
          const percent = Math.round(progress.progress * 100);
          setDownloadProgress(percent);
        }
      );

      if (result.success && result.filePath) {
        showToast.success('Success', 'Video downloaded successfully!');
      } else {
        showToast.error('Error', result.error || 'Failed to download video');
      }
    } catch (error: any) {
      showToast.error('Error', error?.message || 'Failed to download video');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar hidden={isFullscreen} />
        <View style={styles.contentContainer}>
          {!isFullscreen && <Header title="Preview Video" showBackButton />}
          <View style={styles.videoContainer}>
            {video_url ? (
              <>
                {!videoError ? (
                  <>
                    <Video
                      ref={videoRef}
                      source={{ uri: video_url }}
                      style={[styles.video, isFullscreen && styles.fullscreenVideo]}
                      resizeMode={isFullscreen ? 'contain' : 'contain'}
                      paused={paused}
                      onProgress={handleProgress}
                      onLoadStart={() => setVideoLoading(true)}
                      onLoad={handleLoad}
                      onError={handleError}
                      onEnd={handleEnd}
                      controls={false}
                      ignoreSilentSwitch="ignore"
                      playInBackground={false}
                      playWhenInactive={false}
                      repeat={false}
                      allowsExternalPlayback={false}
                      onFullscreenPlayerWillPresent={() => setIsFullscreen(true)}
                      onFullscreenPlayerDidDismiss={() => setIsFullscreen(false)}
                    />

                    {videoLoading && (
                      <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load video</Text>
                  </View>
                )}

                {/* Touch overlay - always active to show controls */}
                {!videoError && !videoLoading && (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={handleScreenPress}
                    style={styles.touchOverlay}
                  />
                )}

                {/* Controls overlay */}
                {!videoError && (
                  <Animated.View
                    style={[
                      styles.controlsWrapper,
                      { opacity: controlsOpacity },
                    ]}
                    pointerEvents={showControls ? 'auto' : 'none'}
                  >
                    <LinearGradient
                      colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                      style={styles.controls}
                    >
                      {showControls && (
                        <View style={[styles.controlsInner, isFullscreen && styles.controlsInner2]}>
                          <TouchableOpacity
                            onPress={togglePlayPause}
                            style={styles.controlButton}
                          >
                            {paused ? (
                              <Svgs.PlayIcon
                                width={metrics.width(20)}
                                height={metrics.width(20)}
                                color={colors.white}
                              />
                            ) : (
                              <View style={styles.pauseIcon}>
                                <View style={styles.pauseBar} />
                                <View style={styles.pauseBar} />
                              </View>
                            )}
                          </TouchableOpacity>

                          <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Slider
                              style={styles.slider}
                              value={currentTime}
                              onValueChange={handleSeek}
                              minimumValue={0}
                              maximumValue={duration}
                              minimumTrackTintColor={colors.primary}
                              maximumTrackTintColor={colors.white15}
                              thumbTintColor={colors.primary}
                            />
                          </View>

                          <Text style={styles.timeText}>
                            <Text style={[styles.timeText, { color: colors.white }]}>
                              {formatTime(currentTime)}
                            </Text>
                            /{formatTime(duration)}
                          </Text>

                          <TouchableOpacity
                            onPress={toggleFullscreen}
                            style={styles.controlButton}
                          >
                            {!isFullscreen ? (
                              <View style={styles.maximizeIcon}>
                                <View style={[styles.fullscreenCorner, styles.topLeft]} />
                                <View style={[styles.fullscreenCorner, styles.topRight]} />
                                <View style={[styles.fullscreenCorner, styles.bottomLeft]} />
                                <View style={[styles.fullscreenCorner, styles.bottomRight]} />
                              </View>
                            ) : (
                              <View style={styles.minimizeIcon}>
                                <View style={styles.minimizeLine} />
                              </View>
                            )}
                          </TouchableOpacity>
                        </View>
                      )}
                    </LinearGradient>
                  </Animated.View>
                )}
              </>
            ) : (
              <View style={styles.noVideoContainer}>
                <Text style={styles.noVideoText}>No video available</Text>
              </View>
            )}
          </View>
        </View>

        {!isFullscreen && (
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title="Create New Dub"
              variant="secondary"
              onPress={() => navigation.goBack()}
            />
            <PrimaryButton
              title={isDownloading ? `Downloading ${downloadProgress}%` : 'Download Video'}
              onPress={handleDownloadVideo}
              icon={isDownloading ? undefined : <Svgs.Downloard />}
              disabled={isDownloading || !video_url}
            />
          </View>
        )}
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
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: metrics.width(24),
    paddingBottom: 40,
  },
  videoContainer: {
    height: metrics.width(250),
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: metrics.width(20),
  },
  fullscreenVideo: {
    width: height,
    height: width,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.black,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  errorText: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(16),
    color: colors.white,
  },
  controlsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: metrics.width(5),
  },
  slider: {
    flex: 1,
    backgroundColor: 'transparent',
    height: 10,
    transform: [{ scaleY: 1.5 }],
  },
  timeText: {
    fontSize: metrics.width(13),
    color: colors.subtitle,
    fontFamily: FontFamily.spaceGrotesk.medium,
    marginHorizontal: metrics.width(8),
  },
  controlsInner: {

    flexDirection: 'row',
    margin: metrics.width(12),
    alignItems: 'center',
    borderRadius: 16,
    padding: metrics.width(10),
    gap: metrics.width(7),
    flex: 1,
  },
  controlsInner2: {
    marginBottom: 30,
  },
  pauseIcon: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: metrics.width(4),
  },
  pauseBar: {
    width: metrics.width(4),
    height: metrics.width(16),
    backgroundColor: colors.white,
    borderRadius: metrics.width(2),
  },
  maximizeIcon: {
    width: metrics.width(20),
    height: metrics.width(20),
    position: 'relative',
  },
  fullscreenCorner: {
    position: 'absolute',
    width: metrics.width(6),
    height: metrics.width(6),
    borderColor: colors.white,
    borderWidth: 2,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  minimizeIcon: {
    width: metrics.width(20),
    height: metrics.width(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  minimizeLine: {
    width: metrics.width(12),
    height: metrics.width(2),
    backgroundColor: colors.white,
    borderRadius: metrics.width(1),
  },
  buttonContainer: {
    marginHorizontal: metrics.width(24),
    gap: metrics.width(10),
    marginBottom: metrics.width(40),
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: metrics.width(200),
  },
  noVideoText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(16),
    color: colors.subtitle,
    textAlign: 'center',
  },
  touchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    backgroundColor: 'transparent',
  },
});
