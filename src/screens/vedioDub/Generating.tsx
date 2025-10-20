import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, ProgressBar } from '../../components/ui';
import { Images } from '../../assets/images';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function GeneratingVedio() {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  // Progress state
  const [progress, setProgress] = useState(0);
const handleGoNext = () => {
  navigation.navigate('PreViewVedio');
}
  useEffect(() => {
    // Simulate progress over 10 seconds
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Navigate to next screen after progress completes
          setTimeout(() => {
            handleGoNext();
          }, 1000); // Wait 1 second before navigating
          return 100;
        }
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, []);

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
              Our AI is translating and syncing the audio
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
