import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { Svgs } from '../../assets/icons';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, LiquidGlassBackground } from '../../components/ui';

type LanguageNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function Language() {
  const navigation = useNavigation<LanguageNavigationProp>();
  
  // Language data
  const languageData = [
    { id: '1', name: 'English', code: 'en', isSelected: true },
    { id: '2', name: 'Spanish', code: 'es', isSelected: false },
    { id: '3', name: 'Japanese', code: 'ja', isSelected: false },
    { id: '4', name: 'French', code: 'fr', isSelected: false },
    { id: '5', name: 'Chinese', code: 'zh', isSelected: false },
  ];

  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const handleLanguageSelect = (languageName: string) => {
    setSelectedLanguage(languageName);
    // Here you would typically save the language preference
    console.log('Selected language:', languageName);
  };

  const renderLanguageItem = (item: typeof languageData[0]) => (
    <LiquidGlassBackground key={item.id} style={styles.languageCard}>
      <TouchableOpacity 
        style={styles.languageRow}
        onPress={() => handleLanguageSelect(item.name)}
      >
        <Text style={styles.languageName}>{item.name}</Text>
        <View style={styles.radioContainer}>
          <View style={[
            styles.radioButton,
            selectedLanguage === item.name && styles.radioButtonSelected
          ]}>
            {selectedLanguage === item.name && (
              <View style={styles.radioCheckmark}>
                <Svgs.TickIcon 
                  height={metrics.width(12)} 
                  width={metrics.width(12)} 
                />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </LiquidGlassBackground>
  );

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Language" showBackButton />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.languageList}>
            {languageData.map(renderLanguageItem)}
          </View>
        </ScrollView>
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
    paddingTop: metrics.width(20),
  },
  languageList: {
    gap: metrics.width(15),
  },
  languageCard: {
    borderRadius: 12,
    paddingHorizontal: metrics.width(20),
    paddingVertical: metrics.width(18),
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageName: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(15),
    color: colors.white,
    flex: 1,
  },
  radioContainer: {
    marginLeft: metrics.width(15),
  },
  radioButton: {
    width: metrics.width(20),
    height: metrics.width(20),
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: colors.primary,
  },
  radioCheckmark: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
