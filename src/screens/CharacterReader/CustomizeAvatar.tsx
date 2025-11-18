import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
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
import { Header, CustomDropdown } from '../../components/ui';
import { characters_data } from '../../utils/characters';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function CustomizeAvatar() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'CustomizeAvatar'>>();
  const { character } = route.params;
  
  // Map character ID to character key
  const getCharacterKey = (id: number): keyof typeof characters_data | null => {
    const idToKeyMap: Record<number, keyof typeof characters_data> = {
      1: 'alex',
    };
    return idToKeyMap[id] || null;
  };
  
  // Get character data
  const characterKey = getCharacterKey(character);
  const characterData = characterKey ? characters_data[characterKey] : null;
  
  // State for all dropdowns
  const [selectedHairStyle, setSelectedHairStyle] = useState('');
  const [selectedOutfit, setSelectedOutfit] = useState('');
  const [selectedAccessories, setSelectedAccessories] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [selectedBackground, setSelectedBackground] = useState('');
  
  // Options for all dropdowns based on character data
  const hairStyleOptions = characterData 
    ? Object.keys(characterData.hair).map(key => {
        const labels: Record<string, string> = {
          short: 'Short',
          long: 'Long',
          curly: 'Curly',
          spiky: 'Spiky',
        };
        return labels[key] || key;
      })
    : ['Short', 'Long', 'Curly', 'Spiky'];
    
  const outfitOptions = characterData
    ? Object.keys(characterData.body).map(key => {
        const labels: Record<string, string> = {
          casual: 'Casual',
          formal: 'Formal',
          semiFormal: 'Semi Formal',
          sporty: 'Sporty',
          superHero: 'Super Hero',
        };
        return labels[key] || key;
      })
    : ['Casual', 'Formal', 'Semi Formal', 'Sporty', 'Super Hero'];
    
  const accessoriesOptions = ['Cap', 'Glasses', 'Watch', 'None'];
  const emotionOptions = ['Happy 😊', 'Excited 🤩', 'Neutral 😐', 'Thoughtful 🧐', 'Surprised 😲'];
  
  const backgroundOptions = characterData
    ? Object.keys(characterData.background).map(key => {
        const labels: Record<string, string> = {
          dubai_red: 'Dub AI Red',
          gradient_blue: 'Gradient Blue',
          gradient_orange: 'Gradient Orange',
          pattern: 'Pattern',
        };
        return labels[key] || key;
      })
    : ['Dub AI Red', 'Gradient Blue', 'Gradient Orange', 'Pattern'];
  
  // Handler functions for all dropdowns
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
              Personal your Character's Appearance{' '}
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
          onPress={() => navigation.navigate('CharacherReader', {
            character: character,
            body: selectedOutfit,
            hair: selectedHairStyle,
            accessories: selectedAccessories,
            background: selectedBackground,
            emotion: selectedEmotion
          })}
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
  dashboardContainer: {
    flex: 1,
    marginTop: metrics.width(30),
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
  tempCharacherContainer: {
  },
});
