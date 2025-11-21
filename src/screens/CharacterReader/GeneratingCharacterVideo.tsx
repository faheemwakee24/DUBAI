import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, ProgressBar } from '../../components/ui';
import { Images } from '../../assets/images';
import { API_BASE_URL, API_VERSION_PREFIX, API_ENDPOINTS } from '../../constants/api';
import { tokenStorage } from '../../utils/tokenStorage';

type GeneratingCharacterVideoNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GeneratingCharacterVideo'
>;

export default function GeneratingCharacterVideo() {
  const navigation = useNavigation<GeneratingCharacterVideoNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'GeneratingCharacterVideo'>>();
  const { videoId,screenFrom } = route.params;
  console.log('params-------',route.params);

  console.log('videoId-------',videoId);

  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Our AI is translating and syncing the audio');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [currentStatus, setCurrentStatus] = useState<'processing' | 'completed' | 'failed' | null>(null);

  // Poll video status using direct fetch (no RTK Query, no caching)
  const pollStatus = async () => {
    try {
      // Get auth token
      const token = await tokenStorage.getAccessToken();
      
      // Build URL based on screenFrom
      const timestamp = Date.now();
      let url: string;
      
      if (screenFrom === 'translating') {
        // Use translate status API
        url = `${API_BASE_URL}${API_VERSION_PREFIX}${API_ENDPOINTS.HEYGEN.VIDEO_TRANSLATE_STATUS(videoId)}?_t=${timestamp}`;
        console.log('=== Polling translate video status ===');
      } else {
        // Use regular video status API
        url = `${API_BASE_URL}${API_VERSION_PREFIX}${API_ENDPOINTS.HEYGEN.VIDEO_STATUS}?video_id=${videoId}&_t=${timestamp}`;
        console.log('=== Polling video status ===');
      }
      
      console.log('URL:', url);
      
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      };
      
      if (token) {
        headers['authorization'] = `Bearer ${token}`;
      }
      
      // Make direct fetch call (no caching - using timestamp and headers)
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        return;
      }
      
      const apiResponse = await response.json();
      console.log('API Response:', apiResponse);
      
      if (screenFrom === 'translating') {
        // Handle translate status response
        if (apiResponse?.data) {
          const responseData = apiResponse.data;
          const status = responseData.status;
          console.log('Translate Status from API:', status);
          console.log('Video URL:', responseData.url);
          console.log('responseData-------',responseData);
          
          // Map translate status to our status
          if (status === 'success') {
            setCurrentStatus('completed');
          } else if (status === 'processing' || status === 'in_progress'||status === 'pending') {
            setCurrentStatus('processing');
          } else {
            setCurrentStatus('failed');
          }
          
          if (status === 'processing' || status === 'in_progress') {
            setStatusMessage('Our AI is translating and syncing the audio');
          } else if (status === 'success') {
            // Video is ready
            console.log('Video translation completed! Navigating to preview...');
            setProgress(100);
            setStatusMessage('Video translation completed!');
            
            // Clear interval
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }

            // Navigate to preview screen after a short delay
            setTimeout(() => {
              if (responseData.url) {
                navigation.navigate('PreViewVedio', {
                  video_url: responseData.url,
                });
              } else {
                console.error('Video URL is missing in completed response');
              }
            }, 1000);
          } else {
            // Handle error
            setStatusMessage(responseData.message || 'Video translation failed. Please try again.');
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
          }
        } else {
          console.log('No data in translate API response');
        }
      } else {
        // Handle regular video status response
        if (apiResponse?.data) {
          const responseData = apiResponse.data;
          const status = responseData.status;
          console.log('Status from API:', status);
          console.log('Video URL:', responseData.video_url);
          
          setCurrentStatus(status);
          
          if (status === 'processing') {
            setStatusMessage('Our AI is translating and syncing the audio');
          } else if (status === 'completed') {
            // Video is ready
            console.log('Video completed! Navigating to preview...');
            setProgress(100);
            setStatusMessage('Video generation completed!');
            
            // Clear interval
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }

            // Navigate to preview screen after a short delay
            setTimeout(() => {
              if (responseData.video_url) {
                navigation.navigate('PreViewVedio', {
                  video_url: responseData.video_url,
                });
              } else {
                console.error('Video URL is missing in completed response');
              }
            }, 1000);
          } else if (status === 'failed') {
            // Handle error
            setStatusMessage(responseData.error || 'Video generation failed. Please try again.');
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
          } else {
            console.log('Unknown status:', status);
          }
        } else {
          console.log('No data in API response');
        }
      }
    } catch (error: any) {
      console.error('Error polling video status:', error);
      // Don't stop polling on error, just log it
    }
  };

  useEffect(() => {
    if (!videoId) {
      console.error('Video ID is missing');
      return;
    }

    // Start polling immediately
    pollStatus();

    // Set up polling every 5 seconds
    intervalRef.current = setInterval(() => {
      pollStatus();
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [videoId, screenFrom]);

  // Simulate progress animation while processing
  useEffect(() => {
    if (currentStatus === 'processing') {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            return 90; // Cap at 90% until completed
          }
          return prev + 1;
        });
      }, 500);

      return () => clearInterval(progressInterval);
    }
  }, [currentStatus]);

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          <Header title="Video Dubbing" showBackButton />
          <View style={styles.bodyContainer}>
            <Image
              source={Images.GeneratingVedio}
              style={styles.generatingVedioImage}
            />
            <Text style={styles.title2}>Generating your Dub</Text>
            <Text style={styles.valueText}>
              {statusMessage}
            </Text>

            {/* Custom Progress Bar */}
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={progress}
                containerStyle={styles.progressBarContainer}
              />
            </View>
            <Text style={styles.valueText}>{progress}%</Text>
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
  progressBarContainer: {},
});

