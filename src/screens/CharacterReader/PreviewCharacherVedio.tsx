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

export default function PreviewCharacherVedio() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [isPlaying, setIsPlaying] = useState(false);

  // Mock customization data - in real app, this would come from props or context
  const currentCustomizations = [
    { label: 'Long Hairs', type: 'hair' },
    { label: 'Happy Emotion', type: 'emotion' },
    { label: 'Pattern BG', type: 'background' },
    { label: 'Casual Outfit', type: 'outfit' },
    { label: 'No Accessories', type: 'accessories' },
  ];

  // Progress state

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          <Header title="Character Reader" showBackButton />
          {!isPlaying&&<><Text style={styles.title}>Preview your Avatar</Text>
          <Text style={styles.subTitle}>Alexa is ready to speak</Text></>}
          
        
          <ImageBackground
            source={Images.TempCharacher}
            style={[styles.vedioPreviewIcon,isPlaying&&{marginTop:metrics.width(30)}]}
            blurRadius={isPlaying?1:0}
          >
            {isPlaying&&(
            <TouchableOpacity>
              <LiquidGlassBackground style={styles.playIconContainer}>
                <Svgs.PlayIcon />
              </LiquidGlassBackground>
            </TouchableOpacity>
            )}
          </ImageBackground>
          {!isPlaying&&<>
            {/* Current Customization Section */}
            <View style={styles.customizationSection}>
            <Text style={styles.customizationTitle}>Current Customization</Text>
            <View style={styles.chipsContainer}>
              {currentCustomizations.map((customization, index) => (
                <LiquidGlassBackground key={index} style={styles.chip}>
                  <Text style={styles.chipText}>{customization.label}</Text>
                </LiquidGlassBackground>
              ))}
            </View>
            
          </View>
          </>}
        </View>
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={isPlaying?"Create Again":'Play'}
            variant="secondary"
            icon={!isPlaying&&<Svgs.PlayIcon height={metrics.width(20)} width={metrics.width(20)} />}
            onPress={() => setIsPlaying(true)}
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
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  playIconContainer: {
    borderRadius: 100,
    padding: 10,
  },
  title: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(20),
    color: colors.white,
    marginTop: metrics.width(30),
  },
  subTitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(15),
    color: colors.subtitle,
    marginBottom: metrics.width(30),
    marginTop:metrics.width(5)
  },
  customizationSection: {
    marginTop: metrics.width(20),
    marginBottom: metrics.width(20),
  },
  customizationTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(18),
    color: colors.white,
    marginBottom: metrics.width(15),
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: metrics.width(8),
  },
  chip: {
    borderRadius: 8,
    paddingHorizontal: metrics.width(12),
    paddingVertical: metrics.width(8),
  },
  chipText: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(15),
    color: colors.white,
  },
});
