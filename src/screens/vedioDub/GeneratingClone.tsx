import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, ProgressBar } from '../../components/ui';
import { Images } from '../../assets/images';
import {
  useUploadVideoDubbingMutation,
  useLazyGetVideoDubbingStatusQuery,
} from '../../store/api/videoDubbingApi';
import { showToast } from '../../utils/toast';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function GeneratingClone() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'GeneratingClone'>>();
  const { video, language, voiceStyle } = route.params;

  const [uploadVideo, { isLoading: isUploading }] = useUploadVideoDubbingMutation();
  const [getVideoStatus] = useLazyGetVideoDubbingStatusQuery();

  // Progress state
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'created' | 'processing' | 'done' | 'failed' | 'completed'>('idle');
  const [jobId, setJobId] = useState<string | null>(null);
  
  // Refs for intervals
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  console.log('[GeneratingClone] Component mounted');
  console.log('[GeneratingClone] Video:', video);
  console.log('[GeneratingClone] Language:', language);
  console.log('[GeneratingClone] Voice Style:', voiceStyle);

  const handleGoNext = (videoUrl: string) => {
    console.log('[GeneratingClone] handleGoNext called with video URL:', videoUrl);
    console.log('[GeneratingClone] Navigating to PreViewVedio screen...');
    navigation.navigate('PreViewVedio', { video_url: videoUrl });
    console.log('[GeneratingClone] ✅ Navigation to PreViewVedio completed');
  };

  // Upload video on mount
  useEffect(() => {
    const uploadAndPoll = async () => {
      if (!video || !language) {
        console.error('[GeneratingClone] ❌ Video or language is missing');
        showToast.error('Error', 'Video or language is missing');
        navigation.goBack();
        return;
      }

      try {
        // Step 1: Upload video
        console.log('[GeneratingClone] Starting video upload...');
        setStatus('uploading');
        setProgress(5);

        const uploadResult = await uploadVideo({
          file: {
            uri: video.uri,
            type: video.type,
            name: video.name,
          },
          language: language,
        }).unwrap();

        console.log('[GeneratingClone] ✅ Upload successful:', JSON.stringify(uploadResult, null, 2));

        // Extract jobId from response
        const uploadedJobId = uploadResult.jobId || uploadResult.job_id || uploadResult.id;
        if (!uploadedJobId) {
          console.error('[GeneratingClone] ❌ Job ID not found in upload response');
          showToast.error('Error', 'Failed to get job ID from upload response');
          setStatus('failed');
          setProgress(0);
          setTimeout(() => {
            navigation.goBack();
          }, 2000);
          return;
        }

        setJobId(uploadedJobId);
        setStatus('created');
        setProgress(10);
        console.log('[GeneratingClone] Job ID:', uploadedJobId);

        // Step 2: Start polling for status
        let pollCount = 0;

        const pollVideoStatus = async () => {
          pollCount++;
          console.log(`[GeneratingClone] Polling video status (attempt ${pollCount}) for jobId:`, uploadedJobId);

          try {
            const result = await getVideoStatus(uploadedJobId).unwrap();
            console.log(`[GeneratingClone] ✅ Status poll ${pollCount} successful:`, JSON.stringify(result, null, 2));

            if (result.status) {
              const statusLower = result.status.toLowerCase();
              setStatus(prevStatus => {
                if (prevStatus !== statusLower) {
                  console.log(`[GeneratingClone] Status changed: ${prevStatus} → ${statusLower}`);
                }
                return statusLower as 'created' | 'processing' | 'done' | 'failed' | 'completed';
              });

              // Update progress from API response - always prioritize API progress
              if (result.progress !== undefined && result.progress !== null) {
                const apiProgress = Math.min(100, Math.max(0, result.progress)); // Clamp between 0-100
                setProgress(apiProgress);
                console.log(`[GeneratingClone] Progress from API: ${apiProgress}%`);
                
                // Stop animation interval when we have real progress from API
                if (progressIntervalRef.current) {
                  console.log('[GeneratingClone] Stopping progress animation - using API progress');
                  clearInterval(progressIntervalRef.current);
                  progressIntervalRef.current = null;
                }
              } else {
                // Fallback to status-based progress only if API doesn't provide progress
                if (statusLower === 'created' || statusLower === 'pending') {
                  console.log('[GeneratingClone] Status: created/pending, setting progress to 10%');
                  setProgress(10);
                } else if (statusLower === 'processing') {
                  console.log('[GeneratingClone] Status: processing, setting progress to 50%');
                  setProgress(50);
                }
              }
              
              console.log('--------------------------------statusLower', statusLower);
              console.log('--------------------------------result.progress', result.progress);
              console.log('--------------------------------result.dubbedVideoPath', result.dubbedVideoPath);
              // Check for completion
              if ((statusLower === 'done' || statusLower === 'completed') && result.dubbedVideoPath) {
                console.log('[GeneratingClone] ✅ Status: completed, video path received:', result.dubbedVideoPath);
                setProgress(100);
                // Clear intervals
                if (pollIntervalRef.current) {
                  console.log('[GeneratingClone] Clearing poll interval');
                  clearInterval(pollIntervalRef.current);
                  pollIntervalRef.current = null;
                }
                if (progressIntervalRef.current) {
                  console.log('[GeneratingClone] Clearing progress interval');
                  clearInterval(progressIntervalRef.current);
                  progressIntervalRef.current = null;
                }
                // Navigate to preview screen
                console.log('[GeneratingClone] Waiting 1 second before navigation...');
                setTimeout(() => {
                  handleGoNext(result.dubbedVideoPath!);
                }, 1000);
              } else if (statusLower === 'failed' || result.error) {
                console.error('[GeneratingClone] ❌ Status: failed');
                const errorMessage = result.error || 'Video dubbing failed';
                console.error('[GeneratingClone] Error message:', errorMessage);
                setProgress(0);
                if (pollIntervalRef.current) {
                  console.log('[GeneratingClone] Clearing poll interval due to failure');
                  clearInterval(pollIntervalRef.current);
                  pollIntervalRef.current = null;
                }
                if (progressIntervalRef.current) {
                  console.log('[GeneratingClone] Clearing progress interval due to failure');
                  clearInterval(progressIntervalRef.current);
                  progressIntervalRef.current = null;
                }
                showToast.error('Error', errorMessage);
                setTimeout(() => {
                  console.log('[GeneratingClone] Navigating back due to failure');
                  navigation.goBack();
                }, 2000);
              }
            } else {
              console.warn('[GeneratingClone] ⚠️ Status not found in response');
            }
          } catch (error: any) {
            console.error(`[GeneratingClone] ❌ Error polling video status (attempt ${pollCount}):`, error);
            console.error('[GeneratingClone] Error details:', {
              message: error?.message,
              data: error?.data,
              status: error?.status,
            });
            // Continue polling on error (might be temporary)
            console.log('[GeneratingClone] Continuing to poll despite error...');
          }
        };

        // Initial status check
        console.log('[GeneratingClone] Starting initial status check...');
        pollVideoStatus();

        // Poll every 3 seconds
        console.log('[GeneratingClone] Setting up polling interval (every 3 seconds)');
        pollIntervalRef.current = setInterval(() => {
          pollVideoStatus();
        }, 3000);

        // Simulate progress animation (only as fallback - will be stopped when API provides progress)
        // This provides visual feedback while waiting for first status response
        console.log('[GeneratingClone] Setting up progress animation interval (fallback only)');
        progressIntervalRef.current = setInterval(() => {
          setProgress(prev => {
            // Don't animate beyond 90% - wait for API to confirm completion
            // Only animate if we don't have real progress from API yet
            if (prev >= 90) {
              return 90;
            }
            // Increment slowly to show activity
            return Math.min(prev + 0.5, 90);
          });
        }, 500);
      } catch (error: any) {
        console.error('[GeneratingClone] ❌ Upload error:', error);
        setStatus('failed');
        setProgress(0);
        showToast.error('Error', error?.data?.message || error?.message || 'Failed to upload video');
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      }
    };

    uploadAndPoll();

    // Cleanup function
    return () => {
      console.log('[GeneratingClone] Cleanup: clearing intervals');
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [video, language]);

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          <Header title="Dubbing Video" showBackButton />
          <View style={styles.bodyContainer}>
            <Image
              source={Images.GeneratingVedio}
              style={styles.generatingVedioImage}
            />
            <Text style={styles.title2}>Generating your Dub</Text>
            <Text style={styles.valueText}>
              Our AI is translating and syncing the audio
            </Text>

            {/* Custom Progress Bar */}
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={progress}
                containerStyle={styles.progressBarContainer}
              />
            </View>
            <Text style={styles.valueText}>{Math.round(progress)}%</Text>
          </View>
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
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  title2: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(20),
    color: colors.white,
  },
  valueText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
    textAlign: 'center',
    marginTop: metrics.width(5),
  },
  bodyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  generatingVedioImage: {
    height: metrics.width(120),
    width: metrics.width(120),
    marginBottom: metrics.width(11),
  },
  progressContainer: {
    width: '90%',
    marginTop: metrics.width(20),
  },
  progressBarContainer: {
 
  },
});

