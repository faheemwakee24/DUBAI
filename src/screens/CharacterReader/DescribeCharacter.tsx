import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { Svgs } from '../../assets/icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, CustomDropdown, Input } from '../../components/ui';
import {
  useGenerateVideoMutation,
  useGenerateAv4VideoMutation,
  useUploadAssetMutation,
} from '../../store/api/heygenApi';
import { useGetProjectsQuery } from '../../store/api/projectsApi';
import type { Project } from '../../store/api/projectsApi';
import { showToast } from '../../utils/toast';

type DescribeCharacterNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DescribeCharacter'
>;

export default function DescribeCharacter() {
  const navigation = useNavigation<DescribeCharacterNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'DescribeCharacter'>>();
  const {
    avatarId,
    voiceId,
    screenFrom,
    projectId,
    avatar_photo_url,
    isCustomImageSelected,
    image,
  } = route.params;
  console.log('screenFrom', screenFrom);
  console.log('avatarId', avatarId);
  console.log('voiceId', voiceId);
  console.log('avatar_photo_url', avatar_photo_url);
  console.log('isCustomImageSelected', isCustomImageSelected);
  const [generateVideo, { isLoading: isGenerating }] =
    useGenerateVideoMutation();
  const [generateAv4Video, { isLoading: isGeneratingAv4 }] =
    useGenerateAv4VideoMutation();
  const [uploadAsset, { isLoading: isUploadingAsset }] =
    useUploadAssetMutation();

  // Fetch projects
  const { data: projects = [], isLoading: isLoadingProjects } =
    useGetProjectsQuery();

  // State for all dropdowns
  const [selectedVoiceTone, setSelectedVoiceTone] = useState('');
  const [speed, setSpeed] = useState('');
  const [message, setMessage] = useState('');
  const [selectedBackgroundType, setSelectedBackgroundType] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedVideoOrientation, setSelectedVideoOrientation] = useState('');
  const [selectedFit, setSelectedFit] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>(
    projectId || '',
  );

  // Options for all dropdowns
  const voiceToneOptions = [
    'Excited',
    'Friendly',
    'Serious',
    'Soothing',
    'Broadcaster',
  ];
  const speedOptions = ['0.5x', '1x', '1.5x'];
  const vedioOriettation = ['Portrait', 'Landscape'];
  const fit = ['cover', 'contain'];

  // Handler functions for all dropdowns
  const handleVoiceToneSelect = (voiceTone: string) => {
    setSelectedVoiceTone(voiceTone);
  };

  const handleSpeed = (speedValue: string) => {
    setSpeed(speedValue);
  };

  const handleBackgroundTypeSelect = (backgroundType: string) => {
    setSelectedBackgroundType(backgroundType);
    // Reset color selection when background type changes
    if (backgroundType !== 'color') {
      setSelectedColor('');
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleVideoOrientationSelect = (orientation: string) => {
    setSelectedVideoOrientation(orientation);
  };

  const handleFitSelect = (fitValue: string) => {
    setSelectedFit(fitValue);
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
  };

  // Calculate estimated video duration based on text length and speed
  const estimatedDuration = useMemo(() => {
    if (!message.trim()) {
      return 0;
    }

    // Average speaking rate: 150 words per minute (WPM)
    const wordsPerMinute = 200;

    // Count words in the message
    const wordCount = message
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;

    // Calculate base duration in seconds (words / WPM * 60)
    const baseDurationSeconds = (wordCount / wordsPerMinute) * 60;

    // Apply speed multiplier
    // 0.5x = slower (2x duration), 1x = normal, 1.5x = faster (0.67x duration)
    let speedMultiplier = 1;
    if (speed === '0.5x') {
      speedMultiplier = 2;
    } else if (speed === '1.5x') {
      speedMultiplier = 1 / 1.5;
    }

    // For GeneratedCharacters screen, assume normal speed (1x) if speed not selected
    const finalDuration =
      screenFrom === 'GeneratedCharacters'
        ? baseDurationSeconds
        : baseDurationSeconds * speedMultiplier;

    // Round to 1 decimal place
    return Math.max(0.5, Math.round(finalDuration * 10) / 10);
  }, [message, speed, screenFrom]);

  // Format duration for display
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    if (remainingSeconds === 0) {
      return `${minutes}m`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handlePreview = async () => {
    // Validate required fields
    if (!message.trim()) {
      showToast.error('Validation Error', 'Please enter a message.');
      return;
    }

    try {
      let response: any;
      let videoId: string | undefined;

      if (screenFrom === 'GeneratedCharacters' || isCustomImageSelected) {
        // Validate AV4 specific fields
        // if (!selectedProject) {
        //   showToast.error('Validation Error', 'Please select a project.');
        //   return;
        // }
        if (!selectedVideoOrientation) {
          showToast.error(
            'Validation Error',
            'Please select video orientation.',
          );
          return;
        }
        if (!selectedFit) {
          showToast.error('Validation Error', 'Please select fit.');
          return;
        }

        // Upload custom image if selected
        let finalImageKey = avatarId;
        let finalAvatarPhotoUrl = avatar_photo_url;

        if (isCustomImageSelected && image) {
          try {
            const uploadPayload: any = {
              file: {
                uri: image.uri,
                type: image.type || 'image/jpeg',
                name: image.name || 'image.jpg',
              },
            };

            // Only include project_id if a project is selected
            if (selectedProject || projectId) {
              uploadPayload.project_id = selectedProject || projectId;
            }

            const uploadResult = await uploadAsset(uploadPayload).unwrap();

            // Use asset_id as image_key
            finalImageKey = uploadResult.image_key;
            finalAvatarPhotoUrl = uploadResult.asset_url;
          } catch (error: any) {
            console.error('[DescribeCharacter] Asset upload error:', error);
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              'Failed to upload image';
            showToast.error('Error', errorMessage);
            return;
          }
        }

        // Call AV4 generate API
        const av4Payload: any = {
          image_key: finalImageKey,
          video_title: 'Generated Character Video', // Default title, can be made configurable
          script: message,
          voice_id: voiceId,
          video_orientation: selectedVideoOrientation.toLowerCase(),
          fit: selectedFit,
          custom_motion_prompt: 'just go with the text', // Default as per example
          enhance_custom_motion_prompt: false,
          avatar_photo_url: finalAvatarPhotoUrl,
        };

        // Only include project_id if a project is selected
        if (selectedProject || projectId) {
          av4Payload.project_id = selectedProject || projectId;
        }

        response = await generateAv4Video(av4Payload).unwrap();

        // Handle AV4 response structure
        videoId =
          response.data?.video_id ||
          response.video_id ||
          (response as any).data?.id;
      } else {
        // Validate original fields
        if (!selectedVoiceTone) {
          showToast.error('Validation Error', 'Please select an emotion.');
          return;
        }
        if (!speed) {
          showToast.error('Validation Error', 'Please select a speed.');
          return;
        }
        // Upload custom image if selected
        let finalAvatarId = avatarId;
        let finalAvatarPhotoUrl = avatar_photo_url;

        if (isCustomImageSelected && image) {
          try {
            showToast.info('Uploading', 'Uploading your image...');
            const uploadPayload: any = {
              file: {
                uri: image.uri,
                type: image.type || 'image/jpeg',
                name: image.name || 'image.jpg',
              },
            };

            // Only include project_id if a project is selected
            if (selectedProject || projectId) {
              uploadPayload.project_id = selectedProject || projectId;
            }

            const uploadResult = await uploadAsset(uploadPayload).unwrap();
            console.log('uploadResult-------', uploadResult);

            // const uploadResult ={
            //   "id": "692adc5c256e78fba16d1dc3",
            //   "userId": "691f33033d557e445fe96396",
            //   "asset_id": "0713705b8b844c248024c9e2a86a2121",
            //   asset_type: "image",
            //   content_type: "image/jpeg",
            //   asset_url: "https://resource2.heygen.ai/image/0713705b8b844c248024c9e2a86a2121/original",
            //   image_key: "image/0713705b8b844c248024c9e2a86a2121/original",
            //   "metadata": {
            //     "response": {
            //       "code": 100,
            //       "data": {
            //         "id": "0713705b8b844c248024c9e2a86a2121",
            //         "name": "0713705b8b844c248024c9e2a86a2121",
            //         "file_type": "image",
            //         "folder_id": "",
            //         "meta": null,
            //         "created_ts": 1764416604,
            //         "url": "https://resource2.heygen.ai/image/0713705b8b844c248024c9e2a86a2121/original",
            //         "image_key": "image/0713705b8b844c248024c9e2a86a2121/original"
            //       },
            //       "msg": null,
            //       "message": null
            //     },
            //     "image_key": "image/0713705b8b844c248024c9e2a86a2121/original",
            //     "original_request": {
            //       "file_name": "D1AAC7ED-97C8-4FCD-8307-3DBF71C61AD9.jpg",
            //       "content_type": "image/jpeg",
            //       "file_size": 299007
            //     }
            //   },
            //   createdAt: "2025-11-29T11:43:24.404Z",
            //   updatedAt: "2025-11-29T11:43:24.404Z"
            // }
            // Use asset_id as avatar_id
            finalAvatarId = uploadResult.image_key;
            finalAvatarPhotoUrl = uploadResult.asset_url;
          } catch (error: any) {
            console.error('[DescribeCharacter] Asset upload error:', error);
            const errorMessage =
              error?.data?.message ||
              error?.message ||
              'Failed to upload image';
            showToast.error('Error', errorMessage);
            return;
          }
        }
        // Call original generate API
        const videoPayload: any = {
          avatar_id: finalAvatarId,
          voice_id: voiceId,
          input_text: message,
          emotion: selectedVoiceTone,
          speed: speed.replace('x', ''), // Remove 'x' from speed (e.g., '1x' -> '1')
          avatar_photo_url: finalAvatarPhotoUrl,
        };

        // Only include project_id if a project is selected
        if (selectedProject) {
          videoPayload.project_id = selectedProject;
        }

        console.log('body', videoPayload);

        response = await generateVideo(videoPayload).unwrap();

        // Handle original response structure
        videoId =
          response.data?.video_id ||
          (response as any).video_id ||
          (response as any).data?.id;
      }

      console.log(videoId, 'response-------', response);
      console.log('videoId-------', videoId);

      if (videoId) {
        navigation.navigate('GeneratingCharacterVideo', {
          videoId: String(videoId),
        });
      } else {
        showToast.error(
          'Error',
          response.message || 'Failed to generate video. Please try again.',
        );
      }
    } catch (error: any) {
      console.error('[DescribeCharacter] Generate video error:', error);
      showToast.error(
        'Error',
        error?.data?.message ||
          error?.message ||
          'Failed to generate video. Please try again.',
      );
    }
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Character Reader" showBackButton />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dashboardContainer}>
            <Text style={styles.title}>Customize your Avatar</Text>
            <Text style={styles.subTitle}>
              Personal your Character's Appearance{' '}
            </Text>
            <View style={styles.tempCharacherContainer}>
              <Input
                label="Message"
                value={message}
                onChangeText={setMessage}
                placeholder="Your Message"
                inputStyle={{
                  height: metrics.width(100),
                }}
                containerStyle={{ alignItems: 'flex-start' }}
                multiline
                tooltip="Enter the message you want your character to read. This text will be converted to speech using the selected voice tone and speed."
              />
              {message.trim() && (
                <View style={styles.durationContainer}>
                  <Text style={styles.durationLabel}>
                    Estimated Video Duration:
                  </Text>
                  <Text style={styles.durationValue}>
                    {formatDuration(estimatedDuration)}
                  </Text>
                </View>
              )}
              {screenFrom == 'GeneratedCharacters' || isCustomImageSelected ? (
                <>
                  {isCustomImageSelected && (
                    <>
                      <CustomDropdown
                        title="Project"
                        options={projects.map(
                          (project: Project) => project.name,
                        )}
                        selectedValue={
                          projects.find(
                            (p: Project) => p.id === selectedProject,
                          )?.name || ''
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
                          isLoadingProjects
                            ? 'Loading projects...'
                            : 'Select Project'
                        }
                        tooltip="Select a project to organize your character video. This is optional."
                      />
                    </>
                  )}
                  <CustomDropdown
                    title="Video Orientation"
                    options={vedioOriettation}
                    selectedValue={selectedVideoOrientation}
                    onSelect={handleVideoOrientationSelect}
                    placeholder="Select Orientation"
                    tooltip="Select the video orientation: Portrait (vertical) or Landscape (horizontal). This determines the aspect ratio of your video."
                  />
                  <CustomDropdown
                    title="Fit"
                    options={fit}
                    selectedValue={selectedFit}
                    onSelect={handleFitSelect}
                    placeholder="Select Fit"
                    tooltip="Select how the image fits in the video: Cover (fills the frame, may crop) or Contain (shows entire image, may have borders)."
                  />
                </>
              ) : (
                <>
                  <CustomDropdown
                    title="Project"
                    options={projects.map((project: Project) => project.name)}
                    selectedValue={
                      projects.find((p: Project) => p.id === selectedProject)
                        ?.name || ''
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
                      isLoadingProjects
                        ? 'Loading projects...'
                        : 'Select Project'
                    }
                    tooltip="Select a project to organize your character video. This is optional."
                  />
                  <CustomDropdown
                    title="Emotios"
                    options={voiceToneOptions}
                    selectedValue={selectedVoiceTone}
                    onSelect={handleVoiceToneSelect}
                    placeholder="Select Tune"
                    tooltip="Select the emotion or tone for the voice: Excited, Friendly, Serious, Soothing, or Broadcaster. This affects how your character speaks."
                  />
                  <CustomDropdown
                    title="Voice Speed"
                    options={speedOptions}
                    selectedValue={speed}
                    onSelect={handleSpeed}
                    placeholder="Select Speed"
                    tooltip="Select the speaking speed: 0.5x (slower), 1x (normal), or 1.5x (faster). This affects how quickly your character speaks the message."
                  />
                </>
              )}
            </View>
          </View>
        </ScrollView>

        <PrimaryButton
          title={isUploadingAsset ? 'Generating Video...' : 'Create Video'}
          onPress={handlePreview}
          variant="primary"
          loading={isGenerating || isGeneratingAv4 || isUploadingAsset}
          disabled={isGenerating || isGeneratingAv4 || isUploadingAsset}
          style={{
            marginBottom: metrics.width(25),
          }}
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
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: metrics.width(17),
    marginHorizontal: metrics.width(25),
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.width(10),
  },
  title: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(20),
    color: colors.white,
  },
  subTitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(15),
    color: colors.subtitle,
    marginBottom: metrics.width(30),
  },
  profileImage: {
    width: metrics.width(48),
    height: metrics.width(48),
    borderRadius: 100,
    overflow: 'hidden',
  },
  profileImageBackground: {},
  headerLeftContainerText: {
    gap: metrics.width(4),
  },
  headerRightContainer: {
    gap: metrics.width(8),
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRightIconBackground: {
    padding: metrics.width(10),
  },
  dashboardContainer: {
    flex: 1,
    marginTop: metrics.width(30),
  },
  dashboardCard: {
    paddingHorizontal: metrics.width(16),
    paddingVertical: metrics.width(22),
    borderRadius: 12,
    backgroundColor: colors.white15,
  },
  ProPlanIconImage: {
    width: metrics.width(50),
    height: metrics.width(50),
    resizeMode: 'contain',
  },
  ProPlanIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: metrics.width(10),
  },
  ProPlanTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(15),
    color: colors.white,
  },
  propPlanIconTextContainer: {
    gap: metrics.width(15),
    color: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ProPlanSubTitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(11),
    color: colors.subtitle,
    marginTop: metrics.width(4),
  },
  upgradeButton: {},
  button: {
    borderRadius: 8,
    paddingHorizontal: metrics.width(15),
  },
  debugCotainer: {
    paddingHorizontal: metrics.width(17),
    paddingVertical: metrics.width(20),
    marginTop: metrics.width(40),
  },
  debugTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(20),
    color: colors.white,
    lineHeight: metrics.width(27),
  },
  debuggingSubtitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
    marginTop: metrics.width(4),
  },
  row: {
    flexDirection: 'row',
    marginTop: metrics.width(11),
    marginBottom: metrics.width(70),
  },
  createButton: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(12),
    color: colors.white,
  },
  vedioIcon2: {
    height: metrics.width(150),
    width: metrics.width(150),
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: 0,
  },
  characherIcon: {
    height: metrics.width(200),
    width: metrics.width(200),
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: -25,
    right: -15,
  },
  createButtonContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: metrics.width(13),
    paddingVertical: metrics.width(6),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  CharacterCreationContainer: {
    paddingHorizontal: metrics.width(17),
    paddingVertical: metrics.width(20),
    marginTop: metrics.width(9),
    borderWidth: 0.8,
    borderColor: colors.primary40,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: -12,
    },
    shadowOpacity: 0.1,
    shadowRadius: 0.1,

    elevation: 7,
    backgroundColor: colors.primary3,
  },
  columnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: metrics.width(15),
  },
  tempCharacherTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(16),
    color: colors.white,
    marginTop: metrics.width(10),
    margin: metrics.width(10),
  },
  tempCharacher: {
    height: metrics.screenWidth * 0.41,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    flex: 1,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  tempCharacherImage: {
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
  },
  selectedCharacter: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tempCharacherContainer: {},
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: metrics.width(10),
    paddingHorizontal: metrics.width(15),
    paddingVertical: metrics.width(12),
    backgroundColor: colors.white5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary40,
  },
  durationLabel: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(14),
    color: colors.subtitle,
  },
  durationValue: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(16),
    color: colors.primary,
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
});
