import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenBackground from '../../components/ui/ScreenBackground';
import { Images } from '../../assets/images';
import { metrics } from '../../constants/metrics';
import { FontFamily } from '../../constants/fonts';
import colors from '../../constants/colors';
import { useTranslation } from 'react-i18next';

export default function SplashScreen() {
  const { t } = useTranslation();

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
            <View/>
          {/* Splash Icon */}
          <View style={styles.logoContainer}>
            <Image
              source={Images.SplashScreenIcon}
              style={styles.splashIcon}
              resizeMode="contain"
            />
          </View>

          {/* Brand Name */}
          <View style={styles.brandContainer}>
            <Text style={styles.brandText}>
              <Text style={styles.brandTextRed}>{t('splash.brandPrimary')}</Text>
              <Text style={styles.brandTextWhite}>{t('splash.brandSecondary')}</Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
justifyContent:'space-between',
    alignItems: 'center',
    paddingHorizontal: metrics.width(20),
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashIcon: {
    width: metrics.screenWidth,
    height: metrics.screenWidth,
  },
  brandContainer: {
    marginTop: metrics.width(20),
    marginBottom:metrics.width(20),
  },
  brandText: {
    fontSize: metrics.width(32),
    fontFamily: FontFamily.spaceGrotesk.bold,
    letterSpacing: 1,
  },
  brandTextRed: {
    color: colors.primary,
  },
  brandTextWhite: {
    color: colors.white,
  },
  loadingContainer: {
    marginTop: metrics.width(40),
  },
});

