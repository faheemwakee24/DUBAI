import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
  CustomDropdown,
  Input,
} from '../../components/ui';
import {
  useMakeYourOwnCharacterMutation,
  useLazyGetPhotoGenerationQuery,
} from '../../store/api/heygenApi';

type CustomizeAvatarNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CustomizeAvatar'
>;

export default function CustomizeAvatar() {
  const navigation = useNavigation<CustomizeAvatarNavigationProp>();
  // State for all dropdowns
  const [selectedAge, setSelectedAge] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedEthnicity, setSelectedEthnicity] = useState('');
  const [selectedOrientation, setSelectedOrientation] = useState('');
  const [selectedPersonality, setSelectedPersonality] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [description, setDescription] = useState('');
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [makeYourOwnCharacter, { isLoading: isCreatingCharacter }] =
    useMakeYourOwnCharacterMutation();
  const [getPhotoGeneration] = useLazyGetPhotoGenerationQuery();

  // Options for all dropdowns
  const ageOptions = [
    'Young Adult',
    'Early Middle Age',
    'Late Middle Age',
    'Senior',
    'Unspecified',
  ];
  const genderOptions = ['Woman', 'Man', 'Unspecified'];
  const ethnicityOptions = [
    'White',
    'Black',
    'Asian American',
    'East Asian',
    'South East Asian',
    'South Asian',
    'Middle Eastern',
    'Pacific',
    'Hispanic',
    'Unspecified',
  ];
  const orientationOptions = ['square', 'horizontal', 'vertical'];
  const personalityOptions = ['half_body', 'close_up', 'full_body'];
  const styleOptions = [
    'Realistic',
    'Pixar',
    'Cinematic',
    'Vintage',
    'Noir',
    'Cyberpunk',
    'Unspecified',
  ];
  const handleCharacterSelect = (characterId: number) => {};

  // Handler functions for all dropdowns
  const handleAgeSelect = (age: string) => {
    setSelectedAge(age);
  };
  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender);
  };
  const handleEthnicitySelect = (ethnicity: string) => {
    setSelectedEthnicity(ethnicity);
  };
  const handleOrientationSelect = (orientation: string) => {
    setSelectedOrientation(orientation);
  };
  const handlePersonalitySelect = (personality: string) => {
    setSelectedPersonality(personality);
  };
  const handleStyleSelect = (style: string) => {
    setSelectedStyle(style);
  };

  // Poll photo generation status
  const pollPhotoGeneration = async (genId: string) => {
    try {
      const result = await getPhotoGeneration(genId, true);
      console.log('Photo generation status:', result.data);

      if (result.data?.data) {
        const status = result.data.data.status;
        const imageList = result.data.data.image_url_list;

        if (status === 'success' && imageList && imageList.length > 0) {
          // Generation completed - navigation will be handled in GeneratedCharacters
          setIsGenerating(false);
          setImageUrls(imageList);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        } else if (status === 'failed') {
          // Generation failed
          setIsGenerating(false);
          Alert.alert('Error', 'Character generation failed. Please try again.');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
        // If status is 'in_progress', continue polling
      }
    } catch (error: any) {
      console.error('Error polling photo generation:', error);
    }
  };

  // Handle Next button press
  const handleNext = async () => {
    // Validation
    if (!description.trim()) {
      Alert.alert('Description Required', 'Please enter a description.');
      return;
    }
    if (!selectedAge || !selectedGender || !selectedEthnicity || !selectedOrientation || !selectedPersonality || !selectedStyle) {
      Alert.alert('All Fields Required', 'Please select all options.');
      return;
    }

    try {
      setIsGenerating(true);
      setImageUrls([]);

      // Call first API
      const response = await makeYourOwnCharacter({
        name: description.trim() || 'Character',
        age: selectedAge,
        gender: selectedGender,
        ethnicity: selectedEthnicity,
        orientation: selectedOrientation,
        pose: selectedPersonality,
        style: selectedStyle,
        appearance: description.trim(),
      }).unwrap();

      const genId = response.data?.generation_id;
      if (!genId) {
        Alert.alert('Error', 'Failed to start character generation.');
        setIsGenerating(false);
        return;
      }

      setGenerationId(genId);

      // Navigate to GeneratedCharacters screen immediately with generationId
      // The screen will handle polling
      navigation.navigate('GeneratedCharacters', {
        generationId: genId,
      });

      // Continue polling in background (will stop when success)
      pollPhotoGeneration(genId);
      intervalRef.current = setInterval(() => {
        pollPhotoGeneration(genId);
      }, 4000);
    } catch (error: any) {
      console.error('Error creating character:', error);
      Alert.alert(
        'Error',
        error?.data?.message || error?.message || 'Failed to create character. Please try again.'
      );
      setIsGenerating(false);
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Character Reader"
          showBackButton
          RigthIcon={
            <Svgs.HistoryIcon
              height={metrics.width(20)}
              width={metrics.width(20)}
            />
          }
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dashboardContainer}>
            <Text style={styles.title}>Customize your Avatar</Text>
            <Text style={styles.subTitle}>
              Personal your Character’s Appearance{' '}
            </Text>
            <View style={styles.tempCharacherContainer}>
              <Input
                label="Description"
                value={description}
                onChangeText={setDescription}
                placeholder="Enter description"
                multiline
                numberOfLines={4}
                containerStyle={{
                  height: metrics.width(120),
                  alignItems: 'flex-start',
                }}
              />

              <CustomDropdown
                title="Age"
                options={ageOptions}
                selectedValue={selectedAge}
                onSelect={handleAgeSelect}
                placeholder="Select Age"
              />

              <CustomDropdown
                title="Gender"
                options={genderOptions}
                selectedValue={selectedGender}
                onSelect={handleGenderSelect}
                placeholder="Select Gender"
              />

              <CustomDropdown
                title="Ethnicity"
                options={ethnicityOptions}
                selectedValue={selectedEthnicity}
                onSelect={handleEthnicitySelect}
                placeholder="Select Ethnicity"
              />

              <CustomDropdown
                title="Orientation"
                options={orientationOptions}
                selectedValue={selectedOrientation}
                onSelect={handleOrientationSelect}
                placeholder="Select Orientation"
              />

              <CustomDropdown
                title="Personality"
                options={personalityOptions}
                selectedValue={selectedPersonality}
                onSelect={handlePersonalitySelect}
                placeholder="Select Personality"
              />

              <CustomDropdown
                title="Style"
                options={styleOptions}
                selectedValue={selectedStyle}
                onSelect={handleStyleSelect}
                placeholder="Select Style"
              />
            </View>
          </View>
        </ScrollView>
        <PrimaryButton
          title="Next"
          onPress={handleNext}
          variant="primary"
          disabled={isCreatingCharacter || isGenerating}
          style={{
            marginBottom: metrics.width(15),
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
  avatarIdContainer: {
    borderWidth: 1,
    borderColor: colors.white10,
    borderRadius: 12,
    paddingHorizontal: metrics.width(16),
    paddingVertical: metrics.width(12),
    marginBottom: metrics.width(20),
    backgroundColor: colors.white5,
  },
  avatarIdLabel: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(12),
    color: colors.subtitle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  avatarIdValue: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(16),
    color: colors.white,
    marginTop: metrics.width(6),
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
