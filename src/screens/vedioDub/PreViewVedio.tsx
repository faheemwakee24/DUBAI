import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Header,
  LiquidGlassBackground,
  PrimaryButton,
  ProgressBar,
} from '../../components/ui';
import { Images } from '../../assets/images';
import { Svgs } from '../../assets/icons';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function PreViewVedio() {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  // Progress state

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          <Header title="Video Dubbing" showBackButton />
          <ImageBackground
            source={Images.VedioPreviewIcon}
            style={styles.vedioPreviewIcon}
          >
            <TouchableOpacity>
              <LiquidGlassBackground style={styles.playIconContainer}>
                <Svgs.PlayIcon />
              </LiquidGlassBackground>
            </TouchableOpacity>
            <Text style={styles.title2}>
            Preview Dubbed Video
            </Text>

          </ImageBackground>
        </View>
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Create New Dub"
            variant="secondary"
            onPress={() => {}}
          />
          <PrimaryButton
            title="Download Video"
            onPress={() => {}}
            icon={<Svgs.Downloard />}
          />
        </View>
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
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  title2: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(15),
    color: colors.white,
  },
  valueText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
    textAlign: 'center',
    marginTop: metrics.width(5),
  },
  bodyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  generatingVedioImage: {
    height: metrics.width(120),
    width: metrics.width(120),
    marginBottom: metrics.width(11),
  },
  progressContainer: {
    width: '90%',
    marginTop: metrics.width(20),
  },
  progressBarContainer: {},
  buttonContainer: {
    marginHorizontal: 24,
    gap: metrics.width(10),
    marginBottom: metrics.width(40),
  },
  vedioPreviewIcon: {
    height: metrics.screenWidth * 0.8,
    width: '100%',
    justifyContent:'center',
    alignItems:'center'
  },
  playIconContainer: {
    borderRadius: 100,
    padding: 10,
  },
});
