import React from 'react';
import { View, StyleSheet, Dimensions, Image, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import {
  ScreenBackground,
  PrimaryButton,
  Icon,
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
  };

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          {/* Concentric rings for sound wave effect */}
          <Image source={Images.WelcomeImage} style={styles.welcomeImage} />
        </View>

        {/* Welcome Card */}
        <GlassCard style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome to Dub Nxt </Text>
          <Text

            style={styles.welcomeSubtitle}
          >
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
            icon={<Icon name="ArrowRight" size={20} color="#fff" />}
            iconPosition="right"
          />
        </GlassCard>
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 20,
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(25),
    color: colors.white
  },
  welcomeSubtitle: {
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonSpacing: {
    marginBottom: 12,
  },
  welcomeImage: {
    width: metrics.screenWidth,
    height: metrics.screenHeight * 0.6,
    marginTop: metrics.width(50),
  },
});
