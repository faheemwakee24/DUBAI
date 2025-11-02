import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
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
import { showToast } from '../../utils/toast';

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
  // State for all dropdowns
  const [selectedHairStyle, setSelectedHairStyle] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('enå');
  const [selectedProjectType, setSelectedProjectType] = useState<
    'video-dubbing' | 'character-reader'
  >('video-dubbing');

  // API hook
  const [createProject, { isLoading }] = useCreateProjectMutation();

  // Options for all dropdowns
  const hairStyleOptions = ['Facebook', 'Tiktok', 'Instagram', 'Youtube'];

  const handleHairStyleSelect = (hairStyle: string) => {
    setSelectedHairStyle(hairStyle);
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
  };

  const handleProjectTypeSelect = (
    type: 'video-dubbing' | 'character-reader'
  ) => {
    setSelectedProjectType(
      selectedProjectType === type ? 'video-dubbing' : type
    );
  };

  const handleCreateProject = async () => {
    // Validation
    if (!projectName.trim()) {
      showToast.error('Error', 'Please enter a project name');
      return;
    }

    if (!selectedHairStyle) {
      showToast.error('Error', 'Please select a project description');
      return;
    }

    if (!selectedLanguage) {
      showToast.error('Error', 'Please select a language');
      return;
    }

    // Map category from project type
    const category = selectedProjectType === 'video-dubbing' ? 'video' : 'character';
    
    // Get language code
    const languageCode = languageMap[selectedLanguage] || selectedLanguage.toLowerCase();

    try {
      const result = await createProject({
        name: projectName.trim(),
        description: selectedHairStyle,
        metadata: {
          category,
          language: languageCode,
        },
      }).unwrap();

      showToast.success('Success', 'Project created successfully!');
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
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
            <Text style={styles.title}>Create Project</Text>
            <Text style={styles.subTitle}>
              Start your new project for dubbing and character reading.
            </Text>
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
            <View style={styles.tempCharacherContainer}>
              <CustomDropdown
                title="Project"
                options={hairStyleOptions}
                selectedValue={selectedHairStyle}
                onSelect={handleHairStyleSelect}
                placeholder="Select Project"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleProjectTypeSelect('video-dubbing')}
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
          title={isLoading ? 'Creating...' : 'Create Project'}
          onPress={handleCreateProject}
          variant="primary"
          disabled={isLoading}
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
});
