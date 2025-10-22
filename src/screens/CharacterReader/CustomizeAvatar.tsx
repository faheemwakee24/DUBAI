import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
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
import { Header, LiquidGlassBackground, LanguageDropdown, CustomDropdown } from '../../components/ui';
import { Images } from '../../assets/images';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function CustomizeAvatar() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  
  // State for all dropdowns
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedHairStyle, setSelectedHairStyle] = useState('');
  const [selectedOutfit, setSelectedOutfit] = useState('');
  const [selectedAccessories, setSelectedAccessories] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [selectedBackground, setSelectedBackground] = useState('');
  
  // Options for all dropdowns
  const languageOptions = ['Spanish', 'Japanese', 'German', 'French'];
  const hairStyleOptions = ['Short', 'Long', 'Curly', 'Spiky', 'Bald'];
  const outfitOptions = ['Casual', 'Formal', 'Semi Formal', 'Sporty', 'Super Hero'];
  const accessoriesOptions = ['Cap', 'Glasses', 'Watch', 'Headphones', 'None'];
  const emotionOptions = ['Happy 😊', 'Excited 🤩', 'Neutral 😐', 'Thoughtful 🧐', 'Surprised 😲'];
  const backgroundOptions = ['Dub AI Red', 'Gradient Blue', 'Gradient Orange', 'Solid White', 'Pattern'];
  
  const handleCharacterSelect = (characterId: number) => {};
  
  // Handler functions for all dropdowns
  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
  };
  const handleHairStyleSelect = (hairStyle: string) => {
    setSelectedHairStyle(hairStyle);
  };
  const handleOutfitSelect = (outfit: string) => {
    setSelectedOutfit(outfit);
  };
  const handleAccessoriesSelect = (accessories: string) => {
    setSelectedAccessories(accessories);
  };
  const handleEmotionSelect = (emotion: string) => {
    setSelectedEmotion(emotion);
  };
  const handleBackgroundSelect = (background: string) => {
    setSelectedBackground(background);
  };
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

              
              <CustomDropdown
                title="Hair Style"
                options={hairStyleOptions}
                selectedValue={selectedHairStyle}
                onSelect={handleHairStyleSelect}
                placeholder="Select Style"
              />
              
              <CustomDropdown
                title="Outfit"
                options={outfitOptions}
                selectedValue={selectedOutfit}
                onSelect={handleOutfitSelect}
                placeholder="Select Outfit"
              />
              
              <CustomDropdown
                title="Accessories"
                options={accessoriesOptions}
                selectedValue={selectedAccessories}
                onSelect={handleAccessoriesSelect}
                placeholder="Select Accessories"
              />
              
              <CustomDropdown
                title="Emotion"
                options={emotionOptions}
                selectedValue={selectedEmotion}
                onSelect={handleEmotionSelect}
                placeholder="Select Emotion"
              />
              
              <CustomDropdown
                title="Background"
                options={backgroundOptions}
                selectedValue={selectedBackground}
                onSelect={handleBackgroundSelect}
                placeholder="Select Background"
              />
            </View>
          </View>
        </ScrollView>
        <PrimaryButton
          title="Customize Avatar"
          onPress={() => navigation.navigate('CharacherReader')}
          variant="secondary"
          style={{
            marginBottom: metrics.width(15),
          }}
        />
        <PrimaryButton
          title="Next"
          onPress={() => {}}
          variant="primary"
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
  tempCharacherContainer: {
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
