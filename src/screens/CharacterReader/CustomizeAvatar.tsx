import React, { useMemo, useState } from 'react';
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
import { useTranslation } from 'react-i18next';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function CustomizeAvatar() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'CustomizeAvatar'>>();
  const { character } = route.params;
  const { t } = useTranslation();
  
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
  const hairStyleOptions = useMemo<string[]>(() => {
    const defaultLabels: Record<string, string> = {
      short: 'Short',
      long: 'Long',
      curly: 'Curly',
      spiky: 'Spiky',
    };
    const translated = t('customizeAvatar.dropdowns.hairStyle.options', {
      returnObjects: true,
    });
    const hairLabels =
      translated && typeof translated === 'object'
        ? (translated as Record<string, string>)
        : defaultLabels;

    if (characterData) {
      return Object.keys(characterData.hair).map(key => hairLabels[key] || key);
    }
    return Object.values(hairLabels);
  }, [characterData, t]);
    
  const outfitOptions = useMemo<string[]>(() => {
    const defaultLabels: Record<string, string> = {
      casual: 'Casual',
      formal: 'Formal',
      semiFormal: 'Semi Formal',
      sporty: 'Sporty',
      superHero: 'Super Hero',
    };
    const translated = t('customizeAvatar.dropdowns.outfit.options', {
      returnObjects: true,
    });
    const outfitLabels =
      translated && typeof translated === 'object'
        ? (translated as Record<string, string>)
        : defaultLabels;

    if (characterData) {
      return Object.keys(characterData.body).map(key => outfitLabels[key] || key);
    }
    return Object.values(outfitLabels);
  }, [characterData, t]);
    
  const accessoriesOptions = useMemo<string[]>(() => {
    const fallback = ['Cap', 'Glasses', 'Watch', 'None'];
    const translated = t('customizeAvatar.dropdowns.accessories.options', {
      returnObjects: true,
    });
    if (Array.isArray(translated)) {
      return translated.length ? translated : fallback;
    }
    if (translated && typeof translated === 'object') {
      const values = Object.values(translated as Record<string, string>);
      return values.length ? values : fallback;
    }
    return fallback;
  }, [t]);

  const emotionOptions = useMemo<string[]>(() => {
    const fallback = ['Happy 😊', 'Excited 🤩', 'Neutral 😐', 'Thoughtful 🧐', 'Surprised 😲'];
    const translated = t('customizeAvatar.dropdowns.emotion.options', {
      returnObjects: true,
    });
    if (Array.isArray(translated)) {
      return translated.length ? translated : fallback;
    }
    if (translated && typeof translated === 'object') {
      const values = Object.values(translated as Record<string, string>);
      return values.length ? values : fallback;
    }
    return fallback;
  }, [t]);
  
  const backgroundOptions = useMemo<string[]>(() => {
    const fallback = ['Dub AI Red', 'Gradient Blue', 'Gradient Orange', 'Pattern'];
    const translated = t('customizeAvatar.dropdowns.background.options', {
      returnObjects: true,
    });
    const backgroundLabels =
      translated && typeof translated === 'object'
        ? (translated as Record<string, string>)
        : undefined;

    if (characterData) {
      if (backgroundLabels) {
        return Object.keys(characterData.background).map(key => backgroundLabels[key] || key);
      }
      return Object.keys(characterData.background);
    }

    if (Array.isArray(translated)) {
      return translated.length ? translated : fallback;
    }

    if (backgroundLabels) {
      const values = Object.values(backgroundLabels);
      return values.length ? values : fallback;
    }

    return fallback;
  }, [characterData, t]);
  
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
          title={t('customizeAvatar.headerTitle')}
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
            <Text style={styles.title}>{t('customizeAvatar.title')}</Text>
            <Text style={styles.subTitle}>
              {t('customizeAvatar.subtitle')}
            </Text>
            <View style={styles.tempCharacherContainer}>
              <CustomDropdown
                title={t('customizeAvatar.dropdowns.hairStyle.title')}
                options={hairStyleOptions}
                selectedValue={selectedHairStyle}
                onSelect={handleHairStyleSelect}
                placeholder={t('customizeAvatar.dropdowns.hairStyle.placeholder')}
              />
              
              <CustomDropdown
                title={t('customizeAvatar.dropdowns.outfit.title')}
                options={outfitOptions}
                selectedValue={selectedOutfit}
                onSelect={handleOutfitSelect}
                placeholder={t('customizeAvatar.dropdowns.outfit.placeholder')}
              />
              
              <CustomDropdown
                title={t('customizeAvatar.dropdowns.accessories.title')}
                options={accessoriesOptions}
                selectedValue={selectedAccessories}
                onSelect={handleAccessoriesSelect}
                placeholder={t('customizeAvatar.dropdowns.accessories.placeholder')}
              />
              
              <CustomDropdown
                title={t('customizeAvatar.dropdowns.emotion.title')}
                options={emotionOptions}
                selectedValue={selectedEmotion}
                onSelect={handleEmotionSelect}
                placeholder={t('customizeAvatar.dropdowns.emotion.placeholder')}
              />
              
              <CustomDropdown
                title={t('customizeAvatar.dropdowns.background.title')}
                options={backgroundOptions}
                selectedValue={selectedBackground}
                onSelect={handleBackgroundSelect}
                placeholder={t('customizeAvatar.dropdowns.background.placeholder')}
              />
            </View>
          </View>
        </ScrollView>
        <PrimaryButton
          title={t('customizeAvatar.buttonCustomize')}
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
          title={t('customizeAvatar.buttonNext')}
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
