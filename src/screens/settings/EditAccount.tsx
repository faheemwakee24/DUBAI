import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
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
import { Header, LiquidGlassBackground, Input } from '../../components/ui';
import { Images } from '../../assets/images';

type EditAccountNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function EditAccount() {
  const navigation = useNavigation<EditAccountNavigationProp>();

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSaveChanges = () => {
    // Handle save changes logic
    console.log('Save changes pressed');
    console.log('Full Name:', fullName);
    console.log('Email:', email);
    console.log('Password:', password);
  };

  const handleEditProfilePicture = () => {
    // Handle profile picture edit
    console.log('Edit profile picture pressed');
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Edit Profile" showBackButton />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Picture Section */}
          <View style={styles.profilePictureSection}>
            <View style={styles.profilePictureContainer}>
                <LiquidGlassBackground style={styles.profilePictureContainer}>
              <Image
                source={Images.DefaultProfile}
                style={styles.profilePicture}
              />
              </LiquidGlassBackground>
              <TouchableOpacity
                style={styles.editIconContainer}
                onPress={handleEditProfilePicture}
              >
                <Svgs.EditAccountIcon />
              </TouchableOpacity>
            </View>
          </View>

          {/* Input Fields Section */}
          <View style={styles.inputFieldsSection}>
            {/* Full Name Field */}

            <Input
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
            />

            {/* Email Field */}

            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              label="Email"
            />

            {/* Password Field */}

            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              label="Password"
            />
          </View>
        </ScrollView>

        {/* Save Changes Button */}
        <PrimaryButton
          title="Save Changes"
          onPress={handleSaveChanges}
          variant="primary"
          style={styles.saveButton}
          fullWidth
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
    paddingBottom: 100, // Space for the fixed button
  },
  profilePictureSection: {
    alignItems: 'center',
    marginTop: metrics.width(30),
    marginBottom: metrics.width(40),
  },
  profilePictureContainer: {
    position: 'relative',
    borderRadius:100
  },
  profilePicture: {
    width: metrics.width(120),
    height: metrics.width(120),
    borderRadius: 60,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: metrics.width(32),
    height: metrics.width(32),
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
   
   
  },
  inputFieldsSection: {
    gap: metrics.width(20),
  },
  inputCard: {
    borderRadius: 12,
    paddingHorizontal: metrics.width(20),
    paddingVertical: metrics.width(20),
  },
  inputContainer: {
    gap: metrics.width(8),
  },
  inputLabel: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(16),
    color: colors.white,
  },
  inputField: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: metrics.width(12),
  },
  inputText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.subtitle,
  },
  saveButton: {
    marginBottom: metrics.width(25),
  },
});
