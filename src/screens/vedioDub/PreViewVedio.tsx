// PreViewVideo.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  PanResponder,
  LayoutChangeEvent,
  Dimensions,
  Platform,
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
  LiquidGlassBackground,
  ProgressBar,
} from '../../components/ui';
import { Svgs } from '../../assets/icons';
import Video, { OnLoadData, OnProgressData, VideoRef } from 'react-native-video';
import { downloadVideo, DownloadProgress } from '../../utils/videoDownloader';
import { showToast } from '../../utils/toast';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function PreViewVideo() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'PreViewVedio'>>();
  const { video_url } = route.params || {};
  const videoRef = useRef<VideoRef | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const controlsVisibleRef = useRef(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<number | null>(null);

  const progressBarWidth = useRef(0);
  const [seekDragging, setSeekDragging] = useState(false);
  const [thumbLeft, setThumbLeft] = useState(0);

  // Logging (kept from your original)
  useEffect(() => {
    console.log('[PreViewVedio] Component mounted');
    console.log('[PreViewVedio] Route params:', { video_url });
    if (!video_url) console.warn('[PreViewVedio] ⚠️ Video URL is missing');
  }, [video_url]);

  const formatTime = (seconds = 0) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const setControlsVisibility = (visible: boolean) => {
    controlsVisibleRef.current = visible;
    setControlsVisible(visible);
  };

  const showControls = (autoHide = true) => {
    setControlsVisibility(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (autoHide) {
      // auto-hide after 3s
      controlsTimeoutRef.current = (setTimeout(() => {
        hideControls();
      }, 3000) as unknown) as number;
    }
  };

  const hideControls = () => {
    setControlsVisibility(false);
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    // hide controls when loading
    if (isLoading) {
      hideControls();
    } else if (!hasError) {
      // show controls after video loads
      showControls(true);
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isLoading, hasError]);

  const handleLoad = (data: OnLoadData) => {
    console.log('[PreViewVedio] ✅ Video loaded successfully', data.duration);
    setDuration(data.duration);
    setIsLoading(false);
    setHasError(false);
  };

  const handleProgress = (data: OnProgressData) => {
    if (!seekDragging) {
      setCurrentTime(data.currentTime);
      updateThumb(data.currentTime);
    }
  };

  const handleError = (error: any) => {
    console.error('[PreViewVedio] ❌ Video error:', error);
    setHasError(true);
    setIsLoading(false);
  };

  const togglePlayPause = () => {
    setIsPaused((p) => !p);
    showControls(true);
  };

  const handleVideoPress = () => {
    console.log('[PreViewVedio] handleVideoPress called');
    // tap to toggle controls (not playback)
    if (controlsVisibleRef.current) {
      hideControls();
    } else {
      showControls(true);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.presentFullscreenPlayer();
      } else {
        videoRef.current.dismissFullscreenPlayer();
      }
    }
  };

  const handleFullscreenWillPresent = () => {
    setIsFullscreen(true);
    hideControls();
  };
  const handleFullscreenWillDismiss = () => {
    setIsFullscreen(false);
    showControls(false);
  };

  const getProgressPercent = (t = currentTime) => {
    if (duration === 0) return 0;
    return Math.min(100, Math.max(0, (t / duration) * 100));
  };

  const updateThumb = (time: number) => {
    const pct = getProgressPercent(time);
    const w = progressBarWidth.current || 0;
    setThumbLeft((pct / 100) * w);
  };

  // PanResponder for dragging the thumb to seek
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setSeekDragging(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      },
      onPanResponderMove: (_, gestureState) => {
        const w = progressBarWidth.current || 0;
        const x = Math.max(0, Math.min(w, thumbLeft + gestureState.dx));
        const pct = w > 0 ? x / w : 0;
        const seekTime = pct * duration;
        setThumbLeft(x);
        setCurrentTime(seekTime);
      },
      onPanResponderRelease: (_, gestureState) => {
        const w = progressBarWidth.current || 0;
        const x = Math.max(0, Math.min(w, thumbLeft + gestureState.dx));
        const pct = w > 0 ? x / w : 0;
        const seekTime = pct * duration;
        if (videoRef.current) {
          videoRef.current.seek(seekTime);
        }
        setCurrentTime(seekTime);
        setSeekDragging(false);
        showControls(true);
      },
      onPanResponderTerminationRequest: () => true,
    })
  ).current;

  // Seeking by tapping on progress bar
  const onProgressBarPress = (evt: any) => {
    const x = evt.nativeEvent.locationX;
    const w = progressBarWidth.current || 0;
    const pct = Math.max(0, Math.min(1, x / w));
    const seekTime = pct * duration;
    if (videoRef.current) videoRef.current.seek(seekTime);
    setCurrentTime(seekTime);
    updateThumb(seekTime);
    showControls(true);
  };

  // layout capture for progress width
  const onProgressBarLayout = (e: LayoutChangeEvent) => {
    progressBarWidth.current = e.nativeEvent.layout.width;
    updateThumb(currentTime);
  };

  // Clean up timers
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  // Default thumb position update when duration changes
  useEffect(() => {
    updateThumb(currentTime);
  }, [duration]);

  // Handle video download
  const handleDownloadVideo = async () => {
    if (!video_url) {
      showToast.error('Error', 'No video URL available');
      return;
    }

    if (isDownloading) {
      return; // Prevent multiple simultaneous downloads
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
          console.log(`[PreViewVedio] Download progress: ${percent}%`);
        }
      );

      if (result.success && result.filePath) {
        showToast.success('Success', 'Video downloaded successfully!');
        console.log('[PreViewVedio] Video saved to:', result.filePath);
      } else {
        showToast.error('Error', result.error || 'Failed to download video');
        console.error('[PreViewVedio] Download failed:', result.error);
      }
    } catch (error: any) {
      console.error('[PreViewVedio] Download error:', error);
      showToast.error('Error', error?.message || 'Failed to download video');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          <Header title="Character Video" showBackButton />
          <Text style={styles.title}>Preview Character Video</Text>
          <View style={styles.videoContainer}>
            {video_url ? (
              <>
                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.videoTouchable}
                  onPress={handleVideoPress}
                >
                  <Video
                    ref={videoRef}
                    source={{ uri: video_url }}
                    style={styles.video}
                    resizeMode="contain"
                    paused={isPaused}
                    onLoad={handleLoad}
                    onProgress={handleProgress}
                    onError={handleError}
                    onEnd={() => {
                      setIsPaused(true);
                      setCurrentTime(0);
                      updateThumb(0);
                    }}
                    controls={false}
                    ignoreSilentSwitch="ignore"
                    playInBackground={false}
                    playWhenInactive={false}
                    repeat={false}
                    allowsExternalPlayback={false}
                    fullscreen={isFullscreen}
                    onFullscreenPlayerWillPresent={handleFullscreenWillPresent}
                    onFullscreenPlayerWillDismiss={handleFullscreenWillDismiss}
                  />
                </TouchableOpacity>

                {/* Loading overlay */}
                {isLoading && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading video...</Text>
                  </View>
                )}

                {/* Error overlay */}
                {hasError && (
                  <View style={styles.errorOverlay}>
                    <Text style={styles.errorText}>Failed to load video</Text>
                    <Text style={styles.videoUrlText} numberOfLines={2}>
                      {video_url}
                    </Text>
                  </View>
                )}

                {/* Touch overlay - only when controls are hidden */}
                {!controlsVisible && !isLoading && !hasError && (
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.touchOverlay}
                    onPress={handleVideoPress}
                  />
                )}

                {/* Controls (animated) */}
                {!isLoading && (
                  <Animated.View
                    style={[
                      styles.controlsContainer,
                      { opacity: controlsOpacity },
                    ]}
                    pointerEvents={controlsVisible ? 'auto' : 'none'}
                  >
                  {/* Center Play / Pause */}
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.centerControls}
                    onPress={handleVideoPress}
                  >
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={togglePlayPause}
                      style={styles.playPauseButtonTouchable}
                    >
                      <View style={styles.playPauseCircle}>
                        {isPaused ? (
                          <Svgs.PlayIcon
                            width={metrics.width(26)}
                            height={metrics.width(26)}
                          />
                        ) : (
                          <View style={styles.pauseIcon}>
                            <View style={styles.pauseBar} />
                            <View style={styles.pauseBar} />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  </TouchableOpacity>

                  {/* Bottom bar */}
                  <View style={styles.bottomBar}>
                    <View
                      style={styles.progressTouchable}
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={() => {}}
                      onResponderRelease={onProgressBarPress}
                      onLayout={onProgressBarLayout}
                    >
                      <View style={styles.progressBackground}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${getProgressPercent()}%` },
                          ]}
                        />
                      </View>

                      {/* Thumb */}
                      <View
                        style={[
                          styles.thumb,
                          { left: thumbLeft - THUMB_SIZE / 2 },
                        ]}
                        {...panResponder.panHandlers}
                      />
                    </View>

                    <View style={styles.bottomRow}>
                      <Text style={styles.timeText}>
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </Text>

                      <View style={styles.rightButtons}>
                        <TouchableOpacity
                          onPress={handleFullscreen}
                          style={styles.iconButton}
                          activeOpacity={0.8}
                        >
                          <LiquidGlassBackground
                            style={styles.fullscreenIconContainer}
                          >
                            <View style={styles.fullscreenIcon}>
                              <View style={[styles.fullscreenCorner, styles.topLeft]} />
                              <View style={[styles.fullscreenCorner, styles.topRight]} />
                              <View style={[styles.fullscreenCorner, styles.bottomLeft]} />
                              <View style={[styles.fullscreenCorner, styles.bottomRight]} />
                            </View>
                          </LiquidGlassBackground>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
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

        <View style={styles.buttonContainer}>
          <PrimaryButton title="Create New Dub" variant="secondary" onPress={() => {}} />
          <PrimaryButton
            title={isDownloading ? `Downloading ${downloadProgress}%` : 'Download Video'}
            onPress={handleDownloadVideo}
            icon={isDownloading ? undefined : <Svgs.Downloard />}
            disabled={isDownloading || !video_url}
          />
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

// constants for sizes
const THUMB_SIZE = metrics.width(14);
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(22),
    color: colors.white,
    marginTop: metrics.width(24),
    marginBottom: metrics.width(20),
    textAlign: 'center',
  },
  buttonContainer: {
    marginHorizontal: 24,
    gap: metrics.width(10),
    marginBottom: metrics.width(40),
  },
  downloadProgressContainer: {
    width: '100%',
    marginTop: metrics.width(10),
  },
  downloadProgressBar: {
    height: metrics.width(4),
  },

  nativeVideoWrapper: {
    width: '100%',
    height: metrics.width(200),
    borderRadius: metrics.width(18),
    overflow: 'hidden',
    marginTop: metrics.width(12),
    marginBottom: metrics.width(16),
    backgroundColor: colors.black,
  },
  nativeVideo: {
    width: '100%',
    height: '100%',
  },
  nativeTimerMask: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: metrics.width(50),
    backgroundColor: colors.black,
    zIndex: 1,
  },

  videoContainer: {
    height: metrics.screenWidth * 0.6,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.black,
    marginBottom: metrics.width(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  videoTouchable: { width: '100%', height: '100%' },
  video: { width: '100%', height: '100%' },

  // Animated controls container (covers whole video)
  controlsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: 'space-between',
  },

  centerControls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  playPauseButtonTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  playPauseCircle: {
    width: metrics.width(72),
    height: metrics.width(72),
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  pauseIcon: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: metrics.width(6),
  },
  pauseBar: {
    width: metrics.width(5),
    height: metrics.width(24),
    backgroundColor: colors.white,
    borderRadius: metrics.width(2),
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: metrics.width(12),
    paddingBottom: metrics.width(12),
    paddingTop: metrics.width(8),
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  progressTouchable: {
    width: '100%',
    height: metrics.width(26),
    justifyContent: 'center',
    marginBottom: metrics.width(8),
  },

  progressBackground: {
    width: '100%',
    height: metrics.width(4),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: metrics.width(3),
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },

  thumb: {
    position: 'absolute',
    top: (metrics.width(26) - THUMB_SIZE) / 2 - 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  timeText: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(12),
    color: colors.white,
  },

  rightButtons: { flexDirection: 'row', alignItems: 'center' },

  iconButton: {
    marginLeft: metrics.width(8),
  },

  fullscreenIconContainer: {
    borderRadius: metrics.width(8),
    padding: metrics.width(6),
    width: metrics.width(36),
    height: metrics.width(36),
    justifyContent: 'center',
    alignItems: 'center',
  },

  fullscreenIcon: {
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
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  // overlays
  touchOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 5,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 20,
  },
  loadingText: {
    marginTop: metrics.width(10),
    fontFamily: FontFamily.spaceGrotesk.regular,
    color: colors.white,
  },

  errorOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 30,
    padding: metrics.width(20),
  },
  errorText: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(16),
    color: colors.white,
    marginBottom: metrics.width(10),
    textAlign: 'center',
  },
  videoUrlText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(12),
    color: colors.subtitle,
    textAlign: 'center',
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
});
