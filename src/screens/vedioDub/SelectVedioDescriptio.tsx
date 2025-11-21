import React, { useState, useEffect, useMemo } from 'react';
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
import {
  Header,
  LiquidGlassBackground,
  SearchableDropdown,
  CustomDropdown,
} from '../../components/ui';
import { Images } from '../../assets/images';
import {
  useGetAllVoicesLocalesQuery,
  useTranslateVideoMutation,
} from '../../store/api/heygenApi';
import type { VoiceLocale } from '../../store/api/heygenApi';
import { useUploadVideoDubbingMutation } from '../../store/api';
import { useGetProjectsQuery } from '../../store/api/projectsApi';
import type { Project } from '../../store/api/projectsApi';
import { showToast } from '../../utils/toast';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;



const modeOptions = ['fast', 'quality'];


export default function SelectVedioDescription() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'SelectVedioDescription'>>();
  const { video } = route.params || {};

  // State for dropdowns
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedLanguageCode, setSelectedLanguageCode] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Select Style');
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');

  // API hooks
  const { data: localesData, isLoading: isLoadingLocales } =
    useGetAllVoicesLocalesQuery();
  const { data: projects = [], isLoading: isLoadingProjects } =
    useGetProjectsQuery();
  const [uploadVideo, { isLoading: isUploading }] =
    useUploadVideoDubbingMutation();
  const [translateVideo, { isLoading: isTranslating }] =
    useTranslateVideoMutation();

  // Transform locales to dropdown options
  const languageOptions = useMemo(() => {
    if (!localesData?.data?.languages) return [];
    return localesData.data.languages.map((language: string) => ({
      value: language,
      label: language,
    }));
  }, [localesData]);

  useEffect(() => {
    if (!video) {
      // If no video, go back
      navigation.goBack();
    }
  }, [video]);

  const handleLanguageSelect = (value: string, option?: any) => {
    setSelectedLanguage(option?.label || value);
    setSelectedLanguageCode(option?.language_code || option?.locale || value);
  };

  const handleVoiceSelect = (voice: string) => {
    setSelectedVoice(voice);
  };

  const handleModeSelect = (mode: string) => {
    setSelectedMode(mode);
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
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

  const handleGenerateDub = async () => {
    if (!selectedLanguage || !selectedMode || !selectedProject) {
      showToast.error('Validation Error', 'Please fill all required fields.');
      return;
    }

    if (!video) {
      showToast.error('Error', 'Video is missing.');
      return;
    }

    try {
      // Step 1: Upload video to get video_url
      const uploadResult = await uploadVideo({
        file: {
          uri: video.uri,
          type: video.type,
          name: video.name,
        },
        language: selectedLanguageCode,
      }).unwrap();

      console.log('[SelectVedioDescription] Upload result:', uploadResult);

      // Get video_url from upload response
      // The upload API might return a video_url, or we might need to construct it
      // For now, let's check if it's in the response, otherwise use video.uri if it's a URL
      const videoUrl =
        uploadResult.video_url ||
        uploadResult.videoUrl ||
        uploadResult.url ||
        uploadResult?.signedUrl ||
        (video.uri.startsWith('http') ? video.uri : null)
        ;
console.log('videoUrl', videoUrl);
      if (!videoUrl) {
        showToast.error('Error', 'Failed to get video URL. Please try again.');
        return;
      }

      // Step 2: Call translate API
      console.log('bodyyyy', {
        video_url: videoUrl,
        title: video.name || 'Translated Video',
        output_language: selectedLanguageCode,
        translate_audio_only: false,
        speaker_num: '1',
        keep_the_same_format: false,
        mode: selectedMode,
      });
      
      const translateResult = await translateVideo({
        video_url: videoUrl,
        title: video.name || 'Translated Video',
        output_language: selectedLanguageCode,
        translate_audio_only: false,
        speaker_num: '1',
        keep_the_same_format: false,
        mode: selectedMode,
        project_id: selectedProject,
      }).unwrap();

      console.log('[SelectVedioDescription] Translate result:', translateResult);

      // Extract video_translate_id from response
      const videoTranslateId =
        translateResult.data?.video_translate_id ||
        translateResult.video_translate_id;

      if (videoTranslateId) {
        // Navigate to GeneratingCharacterVideo with translate ID and screenFrom
        navigation.navigate('GeneratingCharacterVideo', {
          videoId: videoTranslateId,
          screenFrom: 'translating',
        });
      } else {
        showToast.error(
          'Error',
          translateResult.message ||
            translateResult.data?.message ||
            'Failed to start translation. Please try again.',
        );
      }
    } catch (error: any) {
      console.error('[SelectVedioDescription] Error:', error);
      showToast.error(
        'Error',
        error?.data?.message ||
          error?.message ||
          'Failed to process video. Please try again.',
      );
    }
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
                <Text style={styles.title} numberOfLines={1} ellipsizeMode='middle'>
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

          <CustomDropdown
            title="Project *"
            options={projects.map((project: Project) => project.name)}
            selectedValue={
              projects.find((p: Project) => p.id === selectedProject)?.name ||
              ''
            }
            onSelect={(projectName: string) => {
              const project = projects.find(
                (p: Project) => p.name === projectName,
              );
              if (project) {
                handleProjectSelect(project.id);
              }
            }}
            placeholder={
              isLoadingProjects ? 'Loading projects...' : 'Select Project'
            }
            required
          />
          <SearchableDropdown
            title="Target Language *"
            options={languageOptions}
            selectedValue={selectedLanguage}
            onSelect={handleLanguageSelect}
            placeholder="Select Language"
            required
            searchPlaceholder="Search language..."
          />
          <CustomDropdown
            title="Mode *"
            options={modeOptions}
            selectedValue={selectedMode}
            onSelect={handleModeSelect}
            placeholder="Select Mode"
            required
          />
        </ScrollView>
        <PrimaryButton
          title="Generate Dub"
          onPress={handleGenerateDub}
          loading={isUploading || isTranslating}
          disabled={isUploading || isTranslating}
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
    maxWidth:'80%'
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
