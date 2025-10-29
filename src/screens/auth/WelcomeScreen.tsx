import React from 'react';
import { View, StyleSheet, Dimensions, Image, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import {
  ScreenBackground,
  PrimaryButton,
  Icon,
  LiquidGlassBackground,
} from '../../components/ui';
import GlassCard from '../../components/ui/GlassCard';
import { Images } from '../../assets/images';
import { metrics } from '../../constants/metrics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontFamily } from '../../constants/fonts';
import colors from '../../constants/colors';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Welcome'
>;

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const handleCreateAccount = () => {
    // Navigate to create account screen (to be implemented)
    console.log('Create Account pressed');
    navigation.navigate('Signup');
  };

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image source={Images.WelcomeImage} style={styles.welcomeImage} resizeMode='contain'/>
        </View>

        {/* Welcome Card */}
        <LiquidGlassBackground style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome to Dub Nxt </Text>
          <Text style={styles.welcomeSubtitle}>
            Transform videos with AI dubbing and bring characters to life
          </Text>

          {/* Buttons */}
          <PrimaryButton
            title="Create an Account"
            onPress={handleCreateAccount}
            variant="secondary"
            size="medium"
            fullWidth
            style={styles.buttonSpacing}
          />

          <PrimaryButton
            title="Sign In"
            onPress={handleSignIn}
            variant="primary"
            size="medium"
            fullWidth
            iconPosition="right"
          />
        </LiquidGlassBackground>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    borderRadius: 200,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  ring1: {
    width: 200,
    height: 200,
  },
  ring2: {
    width: 250,
    height: 250,
  },
  ring3: {
    width: 300,
    height: 300,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ff6b35',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeCard: {
    margin: 20,
    borderRadius: 20,
    padding: 20,
  },
  welcomeTitle: {
    marginBottom: 12,
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(25),
    color: colors.white,
  },
  welcomeSubtitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(15),
    color: colors.subtitle,
    marginBottom:metrics.width(30)
  },
  buttonSpacing: {
    marginBottom: metrics.width(15),
  },
  welcomeImage: {
    width: metrics.screenWidth,
    height: metrics.screenHeight * 0.75,
    position: 'absolute',
  },
});
