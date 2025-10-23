import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { Svgs } from '../../assets/icons';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Header,
  LiquidGlassBackground,
  CustomToggle,
} from '../../components/ui';
import { Images } from '../../assets/images';
import { LiquidGlassContainerView } from '@callstack/liquid-glass';

type SettingsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function Settings() {
  const navigation = useNavigation<SettingsNavigationProp>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleEditProfile = () => {
    navigation.navigate('EditAccount');
  };

  const handleManageSubscription = () => {
    navigation.navigate('Subscription');
  };

  const handleLanguage = () => {
    navigation.navigate('Language');
  };

  const handleLogout = () => {
    // Handle logout logic
    console.log('Logout pressed');
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Settings" showBackButton />

        <View style={styles.contentContainer}>
          {/* User Profile Section */}
          <LiquidGlassBackground style={styles.profileCard}>
            <View style={styles.profileContent}>
              <LiquidGlassBackground style={styles.avatarContainer}>
                <Image source={Images.DefaultProfile} style={styles.avatar} />
              </LiquidGlassBackground>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>John Doe</Text>
                <Text style={styles.userEmail}>john.doe@example.com</Text>
              </View>
            </View>
          </LiquidGlassBackground>

          {/* Account Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Account</Text>
            <LiquidGlassBackground style={styles.optionCard}>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={handleEditProfile}
              >
                <Text style={styles.optionText}>Edit Profile</Text>
                <Svgs.WhiteArrowRight
                  
                />
              </TouchableOpacity>
            </LiquidGlassBackground>
          </View>

          {/* Subscription Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Subscription</Text>
            <LiquidGlassBackground style={styles.optionCard}>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={handleManageSubscription}
              >
                <Text style={styles.optionText}>Manage Subscription</Text>
                <Svgs.WhiteArrowRight
                  
                />
              </TouchableOpacity>
            </LiquidGlassBackground>
          </View>

          {/* Preferences Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            {/* Language Option */}
            <LiquidGlassBackground style={styles.optionCard}>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={handleLanguage}
              >
                <Text style={styles.optionText}>Language</Text>
                <Svgs.WhiteArrowRight
                  
                />
              </TouchableOpacity>
            </LiquidGlassBackground>

            {/* Notifications Option */}
            <LiquidGlassBackground style={styles.optionCard}>
              <View style={styles.optionRow}>
                <Text style={styles.optionText}>Notifications</Text>
                <CustomToggle
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  size="medium"
                />
              </View>
            </LiquidGlassBackground>
          </View>

          {/* Logout Button */}
          <PrimaryButton
            title="Logout"
            onPress={handleLogout}
            variant="primary"
            style={styles.logoutButton}
            fullWidth
            icon={<Svgs.LogoutIcon/>}
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
    marginHorizontal: metrics.width(25),
  },
  contentContainer: {
    flex: 1,
    marginTop: metrics.width(20),
    gap: metrics.width(20),
  },
  profileCard: {
    borderRadius: 12,
    paddingHorizontal: metrics.width(16),
    paddingVertical: metrics.width(18),
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.width(15),
  },
  avatar: {
    width: metrics.width(60),
    height: metrics.width(60),
    borderRadius: 30,
  },
  avatarContainer: {
    borderRadius: 100,
    width: metrics.width(60),
    height: metrics.width(60),
    backgroundColor:colors.white15,
    overflow:'hidden'
  },
  profileInfo: {
    flex: 1,
    gap: metrics.width(5),
  },
  userName: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(18),
    color: colors.white,
  },
  userEmail: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.subtitle,
  },
  sectionContainer: {
    gap: metrics.width(8),
  },
  sectionTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(16),
    color: colors.white,
    marginBottom: metrics.width(3),
  },
  optionCard: {
    borderRadius: 12,
    paddingHorizontal: metrics.width(20),
    paddingVertical: metrics.width(15),
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(16),
    color: colors.white,
  },
  logoutButton: {
    marginTop: metrics.width(20),
    marginBottom: metrics.width(25),
    position:'absolute',
    bottom:0
  },
});
