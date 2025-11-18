import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import PrimaryButton from '../../components/ui/PrimaryButton';

import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { Svgs } from '../../assets/icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, LiquidGlassBackground } from '../../components/ui';
import { Images } from '../../assets/images';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

// Language mapping to codes
const LANGUAGE_MAP: Record<string, string> = {
  'Spanish': 'es',
  'Japanese': 'ja',
  'German': 'de',
  'French': 'fr',
  'Urdu': 'ur',
  'English': 'en',
  'Hindi': 'hi',
  'Arabic': 'ar',
  'Chinese': 'zh',
  'Portuguese': 'pt',
  'Russian': 'ru',
  'Italian': 'it',
};

export default function SelectVedioDescription() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'SelectVedioDescription'>>();
  const { video } = route.params || {};

  // State for dropdowns
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Select Language');
  const [selectedVoice, setSelectedVoice] = useState('Select Style');

  // Language options
  const languageOptions = ['Urdu', 'Spanish', 'Japanese', 'German', 'French', 'Hindi', 'Arabic'];

  // Voice style options
  const voiceOptions = ['Female', 'Male'];

  useEffect(() => {
    if (!video) {
      // If no video, go back
      navigation.goBack();
    }
  }, [video]);

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setIsLanguageDropdownOpen(false);
  };

  const handleVoiceSelect = (voice: string) => {
    setSelectedVoice(voice);
    setIsVoiceDropdownOpen(false);
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

  const handleGenerateDub = () => {
    if (selectedLanguage === 'Select Language' || selectedVoice === 'Select Style') {
      // Show error - both fields required
      return;
    }

    const languageCode = LANGUAGE_MAP[selectedLanguage] || selectedLanguage.toLowerCase();
    
    // Navigate to GeneratingClone with all data
    navigation.navigate('GeneratingClone', {
      video: video!,
      language: languageCode,
      voiceStyle: selectedVoice,
    });
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Header title="Video Dubbing" showBackButton />
          <LiquidGlassBackground style={styles.liquidCotaier}>
            <View style={styles.imageContainer}>
              <Image source={Images.VedioIcon} style={styles.vedioIcon} />
              <View style={styles.textContainer}>
                <Text style={styles.title} numberOfLines={1}>
                  {video?.name || 'video.mp4'}
                </Text>
                <View style={styles.roww}>
                  <Text style={styles.subtitle}>
                    {formatDuration(video?.duration)}
                  </Text>
                  <View style={styles.dot} />
                  <Text style={styles.subtitle}>
                    {formatFileSize(video?.fileSize)}
                  </Text>
                </View>
              </View>
            </View>
          </LiquidGlassBackground>
          <LiquidGlassBackground style={styles.liquidCotaier2}>
            <View style={styles.descriptionContainer}>
              <Text style={styles.title2}>Detected Language</Text>
              <Text style={styles.value1}>English (US)</Text>
            </View>
          </LiquidGlassBackground>
          <LiquidGlassBackground style={styles.liquidCotaier2}>
            <TouchableOpacity
              style={styles.descriptionContainer}
              onPress={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
            >
              <Text style={styles.title2}>Target Language *</Text>
              <View style={styles.roww2}>
                <Text style={styles.value1}>{selectedLanguage}</Text>
                <Svgs.ArrowDown
                  style={[
                    styles.arrowIcon,
                    isLanguageDropdownOpen && styles.arrowIconRotated,
                  ]}
                />
              </View>
            </TouchableOpacity>
          </LiquidGlassBackground>
          {isLanguageDropdownOpen && (
            <LiquidGlassBackground style={styles.dropdownContainer}>
              <View style={styles.descriptionContainer2}>
                {languageOptions.map((language, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItemContainer}
                    onPress={() => handleLanguageSelect(language)}
                  >
                    <Text
                      style={[
                        styles.dropdowItem,
                        selectedLanguage === language && styles.selectedItem,
                      ]}
                    >
                      {language}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </LiquidGlassBackground>
          )}
          <LiquidGlassBackground style={styles.liquidCotaier2}>
            <TouchableOpacity
              style={styles.descriptionContainer}
              onPress={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
            >
              <Text style={styles.title2}>Voice Style *</Text>
              <View style={styles.roww2}>
                <Text style={styles.value1}>{selectedVoice}</Text>
                <Svgs.ArrowDown
                  style={[
                    styles.arrowIcon,
                    isVoiceDropdownOpen && styles.arrowIconRotated,
                  ]}
                />
              </View>
            </TouchableOpacity>
          </LiquidGlassBackground>
          {isVoiceDropdownOpen && (
            <LiquidGlassBackground style={styles.dropdownContainer}>
              <View style={styles.descriptionContainer2}>
                {voiceOptions.map((voice, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItemContainer}
                    onPress={() => handleVoiceSelect(voice)}
                  >
                    <Text
                      style={[
                        styles.dropdowItem,
                        selectedVoice === voice && styles.selectedItem,
                      ]}
                    >
                      {voice}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </LiquidGlassBackground>
          )}
        </ScrollView>
        <PrimaryButton
          title="Generate Dub"
          onPress={handleGenerateDub}
        />
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
    marginBottom: metrics.width(40),
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  liquidCotaier: {
    borderRadius: 12,
    marginTop: metrics.width(20),
    marginBottom: metrics.width(18),
  },
  title: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(15),
    color: colors.white,
  },
  subtitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
  },
  imageContainer: {
    paddingVertical: metrics.width(20),
    paddingHorizontal: metrics.width(16),
    flexDirection: 'row',
    gap: metrics.width(15),
    alignItems: 'center',
  },
  title2: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(13),
    color: colors.white,
  },
  roww: {
    flexDirection: 'row',
    gap: metrics.width(10),
    alignItems: 'center',
  },
  textContainer: {
    gap: metrics.width(5),
  },
  vedioIcon: {
    height: metrics.width(50),
    width: metrics.width(50),
  },
  dot: {
    height: metrics.width(5),
    width: metrics.width(5),
    borderRadius: 100,
    backgroundColor: colors.subtitle,
  },
  liquidCotaier2: {
    borderRadius: 12,
    marginTop: metrics.width(15),
  },

  dropdownContainer: {
    borderRadius: 12,
    marginTop: metrics.width(5),
  },

  descriptionContainer: {
    padding: metrics.width(12),
  },
  descriptionContainer2: {
    padding: metrics.width(12),
    gap: metrics.width(8),
  },
  value1: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.subtitle,
    marginTop: metrics.width(5),
  },
  roww2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdowItem: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(14),
    color: colors.subtitle,
  },
  arrowIcon: {
    transform: [{ rotate: '0deg' }],
  },
  arrowIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownItemContainer: {},
  selectedItem: {
    color: colors.white,
    fontFamily: FontFamily.spaceGrotesk.bold,
  },
});
