import React, { useState, useEffect } from 'react';
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
import { useLazyGetVideoStatusQuery } from '../../store/api/characterApi';
import { showToast } from '../../utils/toast';
import { useTranslation } from 'react-i18next';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function GeneratingVedio() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'GeneratingVedio'>>();
  const { talkId } = route.params;
  const [getVideoStatus] = useLazyGetVideoStatusQuery();
  const { t } = useTranslation();

  // Progress state
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'created' | 'processing' | 'done' | 'failed'>('created');

  console.log('[GeneratingVedio] Component mounted');
  console.log('[GeneratingVedio] Talk ID:', talkId);

  const handleGoNext = (videoUrl: string) => {
    console.log('[GeneratingVedio] handleGoNext called with video URL:', videoUrl);
    console.log('[GeneratingVedio] Navigating to PreViewVedio screen...');
    navigation.navigate('PreViewVedio', { video_url: videoUrl });
    console.log('[GeneratingVedio] ✅ Navigation to PreViewVedio completed');
  };

  useEffect(() => {
    console.log('[GeneratingVedio] useEffect triggered, talkId:', talkId);
    
    if (!talkId) {
      console.error('[GeneratingVedio] ❌ Talk ID is missing');
      showToast.error('Error', t('generating.errors.missingTalkId'));
      navigation.goBack();
      return;
    }

    let pollInterval: ReturnType<typeof setInterval>;
    let progressInterval: ReturnType<typeof setInterval>;
    let pollCount = 0;

    // Poll video status
    const pollVideoStatus = async () => {
      pollCount++;
      console.log(`[GeneratingVedio] Polling video status (attempt ${pollCount}) for talkId:`, talkId);
      
      try {
        const result = await getVideoStatus(talkId).unwrap();
        console.log(`[GeneratingVedio] ✅ Status poll ${pollCount} successful:`, JSON.stringify(result, null, 2));

        if (result.status) {
          setStatus(prevStatus => {
            if (prevStatus !== result.status) {
              console.log(`[GeneratingVedio] Status changed: ${prevStatus} → ${result.status}`);
            }
            return result.status as 'created' | 'processing' | 'done' | 'failed';
          });

          // Update progress based on status
          if (result.status === 'created') {
            console.log('[GeneratingVedio] Status: created, setting progress to 10%');
            setProgress(10);
          } else if (result.status === 'processing') {
            console.log('[GeneratingVedio] Status: processing, setting progress to 50%');
            setProgress(50);
          } else if (result.status === 'done' && result.video_url) {
            console.log('[GeneratingVedio] ✅ Status: done, video URL received:', result.video_url);
            setProgress(100);
            // Clear intervals
            if (pollInterval) {
              console.log('[GeneratingVedio] Clearing poll interval');
              clearInterval(pollInterval);
            }
            if (progressInterval) {
              console.log('[GeneratingVedio] Clearing progress interval');
              clearInterval(progressInterval);
            }
            // Navigate to preview screen
            console.log('[GeneratingVedio] Waiting 1 second before navigation...');
            setTimeout(() => {
              handleGoNext(result.video_url!);
            }, 1000);
          } else if (result.status === 'failed') {
            console.error('[GeneratingVedio] ❌ Status: failed');
            console.error('[GeneratingVedio] Error message:', result.message);
            setProgress(0);
            if (pollInterval) {
              console.log('[GeneratingVedio] Clearing poll interval due to failure');
              clearInterval(pollInterval);
            }
            if (progressInterval) {
              console.log('[GeneratingVedio] Clearing progress interval due to failure');
              clearInterval(progressInterval);
            }
            showToast.error('Error', result.message || t('generating.errors.videoFailed'));
            setTimeout(() => {
              console.log('[GeneratingVedio] Navigating back due to failure');
              navigation.goBack();
            }, 2000);
          }
        } else {
          console.warn('[GeneratingVedio] ⚠️ Status not found in response');
        }
      } catch (error: any) {
        console.error(`[GeneratingVedio] ❌ Error polling video status (attempt ${pollCount}):`, error);
        console.error('[GeneratingVedio] Error details:', {
          message: error?.message,
          data: error?.data,
          status: error?.status,
        });
        // Continue polling on error (might be temporary)
        console.log('[GeneratingVedio] Continuing to poll despite error...');
      }
    };

    // Initial status check
    console.log('[GeneratingVedio] Starting initial status check...');
    pollVideoStatus();

    // Poll every 3 seconds
    console.log('[GeneratingVedio] Setting up polling interval (every 3 seconds)');
    pollInterval = setInterval(() => {
      pollVideoStatus();
    }, 3000);

    // Simulate progress animation (will be overridden by actual status)
    console.log('[GeneratingVedio] Setting up progress animation interval');
    progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          return 90; // Don't go to 100 until status is done
        }
        return prev + 1;
      });
    }, 200);

    return () => {
      console.log('[GeneratingVedio] Cleanup: clearing intervals');
      if (pollInterval) clearInterval(pollInterval);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [talkId]);

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          <Header title={t('generating.headerTitle')} showBackButton />
          <View style={styles.bodyContainer}>
            <Image
              source={Images.GeneratingVedio}
              style={styles.generatingVedioImage}
            />
            <Text style={styles.title2}>{t('generating.title')}</Text>
            <Text style={styles.valueText}>
              {t('generating.subtitle')}
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
  progressBarContainer: {
 
  },
});
