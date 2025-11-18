import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { Svgs } from '../../assets/icons';
import { Header, LiquidGlassBackground } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import {
  supportedLanguages,
  setAppLanguage,
  LanguageCode,
  LanguageOption,
  normalizeLanguageCode,
  i18n,
} from '../../localization';

export default function Language() {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(
    normalizeLanguageCode(i18n.language),
  );

  useEffect(() => {
    const handleLanguageChange = (language: string) => {
      setSelectedLanguage(normalizeLanguageCode(language));
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  const handleLanguageSelect = useCallback(
    async (languageCode: LanguageCode) => {
      if (languageCode === selectedLanguage) {
        return;
      }

      await setAppLanguage(languageCode);
    },
    [selectedLanguage],
  );

  const renderLanguageItem = (item: LanguageOption) => {
    const isActive = selectedLanguage === item.code;

    return (
      <LiquidGlassBackground key={item.code} style={styles.languageCard}>
        <TouchableOpacity style={styles.languageRow} onPress={() => handleLanguageSelect(item.code)}>
          <View style={styles.languageTextContainer}>
            <Text style={styles.languageName}>{item.label}</Text>
            <Text style={styles.languageNativeLabel}>{item.nativeLabel}</Text>
          </View>

          <View style={styles.radioContainer}>
            <View style={[styles.radioButton, isActive && styles.radioButtonSelected]}>
              {isActive && (
                <View style={styles.radioCheckmark}>
                  <Svgs.TickIcon height={metrics.width(12)} width={metrics.width(12)} />
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </LiquidGlassBackground>
    );
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title={t('language.title')} showBackButton />
        <Text style={styles.pageDescription}>{t('language.description')}</Text>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.languageList}>
            {supportedLanguages.map(renderLanguageItem)}
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
  pageDescription: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(12),
    color: colors.subtitle,
    marginTop: metrics.width(10),
    marginBottom: metrics.width(20),
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
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(15),
    color: colors.white,
  },
  languageNativeLabel: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(12),
    color: colors.subtitle,
    marginTop: metrics.width(4),
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
