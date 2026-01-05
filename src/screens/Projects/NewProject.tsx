import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  Alert,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { Svgs } from '../../assets/icons';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Header,
  LiquidGlassBackground,
  LanguageDropdown,
  CustomDropdown,
  Input,
} from '../../components/ui';
import { Images } from '../../assets/images';
import { useCreateProjectMutation } from '../../store/api/projectsApi';
import { useUploadImageMutation } from '../../store/api/characterApi';
import { showToast, selectImage, type SelectedImage } from '../../utils';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

// Language mapping: name to code
const languageMap: { [key: string]: string } = {
  English: 'en',
  Spanish: 'es',
  French: 'fr',
  German: 'de',
  Italian: 'it',
  Portuguese: 'pt',
  Chinese: 'zh',
  Japanese: 'ja',
  Korean: 'ko',
  Arabic: 'ar',
  Hindi: 'hi',
  Russian: 'ru',
};

const languageOptions = Object.keys(languageMap);

export default function NewProject() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  // State for all dropdowns
  const [selectedHairStyle, setSelectedHairStyle] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedCategory, setSelectedCategory] = useState('Mixed');
  const [selectedProjectType, setSelectedProjectType] = useState<
    'video-dubbing' | 'character-reader'
  >('video-dubbing');

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null,
  );
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // API hooks
  const [createProject, { isLoading }] = useCreateProjectMutation();
  const [uploadImage] = useUploadImageMutation();

  // Options for all dropdowns
  const hairStyleOptions = ['Facebook', 'Tiktok', 'Instagram', 'Youtube'];
  const categoryOptions = ['Video', 'Character', 'Mixed'];

  const handleHairStyleSelect = (hairStyle: string) => {
    setSelectedHairStyle(hairStyle);
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleProjectTypeSelect = (
    type: 'video-dubbing' | 'character-reader',
  ) => {
    setSelectedProjectType(
      selectedProjectType === type ? 'video-dubbing' : type,
    );
  };

  const handleSelectImage = async () => {
    const imageData = await selectImage({
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
      mediaType: 'photo',
    });

    if (imageData) {
      setSelectedImage(imageData);
      // Reset uploaded URL when new image is selected
      setUploadedImageUrl(null);
    }
  };

  const handleEditImage = () => {
    handleSelectImage();
  };

  const handleCreateProject = async () => {
    // Validation
    if (!projectName.trim()) {
      showToast.error('Error', 'Please enter a project name');
      return;
    }

    if (!description.trim()) {
      showToast.error('Error', 'Please enter a project description');
      return;
    }

    if (!selectedImage) {
      showToast.error('Error', 'Please select a project image');
      return;
    }

    // if (!selectedLanguage) {
    //   showToast.error('Error', 'Please select a language');
    //   return;
    // }

    let imageUrlToUse = uploadedImageUrl;

    // Step 1: Upload image if selected but not yet uploaded
    if (selectedImage && !uploadedImageUrl) {
      try {
        setIsUploadingImage(true);
        // showToast.info('Uploading', 'Uploading image...');

        const uploadResult = await uploadImage({
          file: selectedImage,
        }).unwrap();

        // Get image URL from response (checking multiple possible fields)
        imageUrlToUse =
          uploadResult?.url ||
          uploadResult?.signedUrl ||
          uploadResult?.data?.url ||
          uploadResult?.data?.signedUrl;

        if (!imageUrlToUse) {
          throw new Error('Image URL not found in upload response');
        }

        setUploadedImageUrl(imageUrlToUse);
        console.log(
          '[NewProject] Image uploaded successfully, URL:',
          imageUrlToUse,
        );
      } catch (error: any) {
        console.error('[NewProject] Image upload error:', error);
        const errorMessage =
          error?.data?.message || error?.message || 'Failed to upload image';
        showToast.error('Error', errorMessage);
        setIsUploadingImage(false);
        return; // Stop project creation if image upload fails
      } finally {
        setIsUploadingImage(false);
      }
    }

    // Step 2: Create project
    // Use selected category (convert to lowercase for API)
    const category = selectedCategory.toLowerCase();

    // Get language code
    const languageCode =
      languageMap[selectedLanguage] || selectedLanguage.toLowerCase();

    // Prepare metadata with image URL if available
    const metadata: {
      category: string;
      language: string;
    } = {
      category,
      language: languageCode,
    };

    // Add image URL to metadata if available

    try {
      console.log('metadata', metadata);

      //showToast.info('Creating', 'Creating project...');
      const result = await createProject({
        name: projectName.trim(),
        description: description.trim(),
        imageUrl: imageUrlToUse || '',
        metadata,
      }).unwrap();

      showToast.success('Success', 'Project created successfully!');
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      console.log('error-------', error);

      const errorMessage =
        error?.data?.message || error?.message || 'Failed to create project';
      showToast.error('Error', errorMessage);
    }
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Create Project" showBackButton />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dashboardContainer}>
            {/* <Text style={styles.title}>Create Project</Text>
            <Text style={styles.subTitle}>
              Start your new project for dubbing and character reading.
            </Text> */}
            {/* Image Upload Section */}
            <View style={styles.imageUploadContainer}>
              <Text style={styles.imageUploadLabel}>Project Image</Text>
              {selectedImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: selectedImage.uri }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  {isUploadingImage ? (
                    <View style={styles.imageOverlay}>
                      <Text style={styles.uploadingText}>Uploading...</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.editImageButton}
                      onPress={handleEditImage}
                      activeOpacity={0.8}
                    >
                      <Svgs.EditAccountIcon />
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <LiquidGlassBackground style={styles.imageSelectorContainer}>
                  <TouchableOpacity
                    onPress={handleSelectImage}
                    style={styles.imageSelectorContent}
                  >
                    <Image style={styles.image} source={Images.UploadVedio} />
                  </TouchableOpacity>
                </LiquidGlassBackground>
              )}
            </View>
            <Input
              label="Project Name"
              placeholder="Enter your Project Name"
              value={projectName}
              onChangeText={setProjectName}
              autoCapitalize="none"
              autoCorrect={false}
              fullWidth={true}
              required
            />
            <View style={styles.descriptionContainer}>
              <Input
                label="Description"
                placeholder="Enter project description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                fullWidth={true}
                required
                inputStyle={{
                  height: metrics.width(80),
                }}
                containerStyle={{ alignItems: 'flex-start' }}
              />
            </View>

            {/* Category Dropdown */}
            <View style={styles.dropdownContainer}>
              <CustomDropdown
                title="Category"
                options={categoryOptions}
                selectedValue={selectedCategory}
                onSelect={handleCategorySelect}
                placeholder="Select Category"
                required
              />
            </View>

            {/* Language Dropdown */}
            <View style={styles.dropdownContainer}>
              <LanguageDropdown
                title="Language"
                options={languageOptions}
                selectedValue={selectedLanguage}
                onSelect={handleLanguageSelect}
                placeholder="Select Language"
                required
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleProjectTypeSelect('video-dubbing')}
              disabled
            >
              <LiquidGlassBackground
                style={[
                  styles.CharacterCreationContainer,
                  selectedProjectType === 'video-dubbing' &&
                  styles.debugCotainer,
                ]}
              >
                <View>
                  <Text style={styles.debugTitle}>Video {'\n'}Dubbing</Text>
                  <Text style={styles.debuggingSubtitle}>
                    Translate & Dub Video
                  </Text>
                </View>
                <View style={styles.row}></View>
                <Image source={Images.VedioIcon2} style={styles.vedioIcon2} />
              </LiquidGlassBackground>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleProjectTypeSelect('character-reader')}
              disabled
            >
              <LiquidGlassBackground
                style={[
                  styles.CharacterCreationContainer,
                  selectedProjectType === 'character-reader' &&
                  styles.debugCotainer,
                ]}
              >
                <View>
                  <Text style={styles.debugTitle}>Character {'\n'}Reader</Text>
                  <Text style={styles.debuggingSubtitle}>
                    Create talking avatars
                  </Text>
                </View>
                <View style={styles.row}></View>
                <Image
                  source={Images.CharacterIcon}
                  style={styles.characherIcon}
                />
              </LiquidGlassBackground>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <PrimaryButton
          title={
            isLoading || isUploadingImage
              ? 'Creating Project...'
              : 'Create Project'
          }
          onPress={handleCreateProject}
          variant="primary"
          disabled={isLoading || isUploadingImage}
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
    marginBottom: metrics.width(20),
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
    marginTop: metrics.width(20),
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
    paddingVertical: metrics.width(5),
  },
  debugCotainer: {
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
    marginBottom: metrics.width(20),
  },
  createButton: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(12),
    color: colors.white,
  },
  vedioIcon2: {
    height: metrics.width(140),
    width: metrics.width(140),
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: -30,
  },
  characherIcon: {
    height: metrics.width(150),
    width: metrics.width(150),
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
    borderRadius: 16,
    marginTop: metrics.width(9),
    borderWidth: 0.8,
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
  descriptionContainer: {
    marginTop: metrics.width(15),
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
  selectedContainer: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primary40,
  },
  dropdownContainer: {
    marginBottom: metrics.width(15),
  },
  imageUploadContainer: {
    // marginTop: metrics.width(15),
    marginBottom: metrics.width(15),
  },
  imageUploadLabel: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(14),
    color: colors.white,
    marginBottom: metrics.width(10),
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: metrics.width(10),
    paddingVertical: metrics.width(15),
    paddingHorizontal: metrics.width(20),
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary40,
    borderStyle: 'dashed',
    backgroundColor: colors.white5,
    marginBottom: metrics.width(15),
  },
  imageUploadButtonText: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(14),
    color: colors.white,
  },
  imagePreviewContainer: {
    position: 'relative',
    width: metrics.width(150),
    height: metrics.width(150),
    borderRadius: metrics.width(75),
    overflow: 'visible',
    alignSelf: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: metrics.width(75),
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: metrics.width(10),
    borderRadius: metrics.width(75),
  },
  editImageButton: {
    position: 'absolute',
    bottom: metrics.width(2),
    right: metrics.width(2),
    backgroundColor: colors.primary,
    width: metrics.width(36),
    height: metrics.width(36),
    borderRadius: metrics.width(18),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'visible',
  },
  required: {
    color: colors.primary,
  },
  uploadingText: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(14),
    color: colors.white,
  },
  uploadedBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: metrics.width(12),
    paddingVertical: metrics.width(6),
    borderRadius: 8,
  },
  uploadedText: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(12),
    color: colors.white,
  },
  pendingBadge: {
    backgroundColor: colors.subtitle,
    paddingHorizontal: metrics.width(12),
    paddingVertical: metrics.width(6),
    borderRadius: 8,
  },
  pendingText: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(12),
    color: colors.white,
  },
  removeImageButton: {
    backgroundColor: '#FF4444',
    paddingHorizontal: metrics.width(15),
    paddingVertical: metrics.width(8),
    borderRadius: 8,
  },
  removeImageText: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(12),
    color: colors.white,
  },
  imageContainer: {
    paddingVertical: metrics.width(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    height: metrics.width(60),
    width: metrics.width(60),
  },
  imageSelectorContainer: {
    width: metrics.width(150),
    height: metrics.width(150),
    borderRadius: metrics.width(75),
    overflow: 'hidden',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSelectorContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: metrics.width(10),
    padding: metrics.width(15),
  },
});
