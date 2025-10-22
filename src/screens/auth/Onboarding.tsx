import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ScreenBackground from '../../components/ui/ScreenBackground';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Images } from '../../assets/images';
import { metrics } from '../../constants/metrics';
import {
  LiquidGlassBackground,
  PrimaryButton,
  Text,
} from '../../components/ui';
import { FontFamily } from '../../constants/fonts';
import colors from '../../constants/colors';
import { Svgs } from '../../assets/icons';
import { useNavigation } from '@react-navigation/native';

export default function Onboarding() {
    const [currentStep, setCurrentStep] = useState(0);
    const navigation = useNavigation();
    const steps = [
        {
            image: Images.Info1,
            title: 'Upload Your Video',
            description:'Simply upload any video and let our AI detect the language automatically'
        },
        {
            image:Images.Info2,
            title:'Translate Instantly',
            description:'Choose from 50+ languages and watch AI translate your content in seconds'
        },
        {
            image:Images.Info3,
            title:'Export & Share',
            description:'Get your dubbed video with perfect lip-sync, ready to share with the world'
        }
    ]

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleSkip = () => {
        // Handle skip logic - navigate to main app
        console.log('Skip onboarding');
        navigation.navigate('Dashboard')
    };

    const isLastStep = currentStep === steps.length - 1;
    const currentStepData = steps[currentStep];
  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.imageWrapper}>
          <Image source={currentStepData.image} style={currentStep==2?styles.image2: styles.info1Image} />
          {/* Gradient overlay */}
        
          <LiquidGlassBackground style={styles.liquidCotaier}>
            <View style={styles.info1Content}>
              <Text style={styles.info1Title}>{currentStepData.title}</Text>
              <Text style={styles.info1Description}>
                {currentStepData.description}
              </Text>
              <View style={styles.row}>
                {steps.map((_, index) => (
                  <View 
                    key={index}
                    style={index === currentStep ? styles.activeTab : styles.inActiveTab} 
                  />
                ))}
              </View>
              <View style={styles.buttonRow}>
                {currentStep<2&&(<PrimaryButton
                  title="Skip"
                  onPress={handleSkip}
                  variant="secondary"
                  extraContainerStyle={{flex:1}}
                />)}
                <PrimaryButton
                  title={isLastStep ? "Get Started" : "Next"}
                  onPress={isLastStep ? handleSkip : handleNext} 
                  extraContainerStyle={{flex:1}}
                  icon={currentStep==2&&<Svgs.Arrows/>}
                  iconPosition='right'
                />
              </View>
            </View>
          </LiquidGlassBackground>
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
  imageWrapper: {
    flex: 1,
  },
  info1Image: {
    width: metrics.screenWidth,
    height: metrics.screenHeight * 0.9,
    resizeMode: 'contain',
    top: -10,
    position: 'absolute',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    height: '100%',
    width: '100%',
  },
  info1Content: {
    marginHorizontal: metrics.width(20),
    marginVertical: metrics.width(40),
  },
  info1Title: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(25),
    color: colors.white,
    marginBottom: metrics.width(15),
  },
  info1Description: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(15),
    color: colors.subtitle,
  },
  liquidCotaier: {
    position: 'absolute',
    bottom: metrics.width(40),
    left: metrics.width(15),
    right: metrics.width(15),
  },
  row: {
    flexDirection: 'row',
    gap: metrics.width(10),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: metrics.width(30),
  },
  activeTab: {
    width: metrics.width(30),
    height: metrics.width(10),
    borderRadius: 100,
    backgroundColor: colors.primary,
  },
  inActiveTab: {
    width: metrics.width(10),
    height: metrics.width(10),
    borderRadius: 100,
    borderWidth: metrics.width(2),
    borderColor: colors.subtitle,
    backgroundColor: colors.transparent,
  },
  buttonRow: {
    width: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    gap: metrics.width(15),
    flexDirection:'row'
  },
  image2:{
    width: metrics.screenWidth,
    height: metrics.screenWidth,
    resizeMode: 'contain',
    top: metrics.width(40),
    position: 'absolute',
  }
});
