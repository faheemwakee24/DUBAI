import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, LiquidGlassBackground, Input } from '../../components/ui';
import { Images } from '../../assets/images';
import { tokenStorage } from '../../utils/tokenStorage';
import { useGetProfileQuery } from '../../store/api/authApi';
import { User } from '../../store/api/authApi';
import { useUpdateProfileMutation } from '../../store/api/usersApi';
import { showToast } from '../../utils/toast';

type EditAccountNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function EditAccount() {
  const navigation = useNavigation<EditAccountNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'EditAccount'>>();
  const { data: profileData, isLoading: profileLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await tokenStorage.getUser();
        if (storedUser) {
          setUser(storedUser);
          setFirstName(storedUser.firstName || '');
          setLastName(storedUser.lastName || '');
          setEmail(storedUser.email || '');
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };

    loadUser();
  }, []);

  // Update form when profile data is fetched
  useEffect(() => {
    if (profileData) {
      setUser(profileData as any);
      setFirstName((profileData as any).firstName || '');
      setLastName((profileData as any).lastName || '');
      setEmail((profileData as any).email || '');
      // Update stored user data
      tokenStorage.setUser(profileData as any);
    }
  }, [profileData]);

  // Handle selected image from SelectProfileImage screen
  useEffect(() => {
    if (route.params?.selectedImageUrl) {
      setSelectedImageUrl(route.params.selectedImageUrl);
    }
  }, [route.params]);

  // Get user avatar
  const getUserAvatar = () => {
    if (selectedImageUrl) {
      return { uri: selectedImageUrl };
    }
    if (user?.avatar) {
      return { uri: user.avatar };
    }
    return Images.DefaultProfile;
  };

  const handleSaveChanges = async () => {
    // Validate input
    if (!firstName.trim() || !lastName.trim()) {
      showToast.error('Validation Error', 'First name and last name are required');
      return;
    }

    // Validate profile image is selected
    if (!selectedImageUrl && !user?.avatar) {
      showToast.error('Validation Error', 'Please select a profile image');
      return;
    }

    try {
      const updateData: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      };

      // Add avatar URL - use selected image or existing user avatar
      updateData.profilePic = selectedImageUrl || user?.avatar;

      const result = await updateProfile(updateData).unwrap();

      // Update local state with the response
      if (result) {
        setUser(result as any);
        tokenStorage.setUser(result as any);
        showToast.success('Profile updated!', 'Your profile has been updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to update profile';
      showToast.error('Update Failed', errorMessage);
    }
  };

  const handleEditProfilePicture = () => {
    navigation.navigate('SelectProfileImage', {
      images: [], // Images are now hardcoded in SelectProfileImage component
      selectedImageUrl: selectedImageUrl || undefined,
      setSelectedImageUrl: setSelectedImageUrl,
    });
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
                  source={getUserAvatar()}
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
            {/* First Name Field */}
            <Input
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              autoCapitalize="words"
              fullWidth
            />

            {/* Last Name Field */}
            <Input
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              autoCapitalize="words"
              fullWidth
            />

            {/* Email Field */}
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              label="Email"
              autoCapitalize="none"
              editable={false} // Email might not be editable
              fullWidth
            />

            {/* Password Field */}
            {/* <Input
              value={password}
              onChangeText={setPassword}
              placeholder="Enter new password"
              secureTextEntry
              showPasswordToggle
              label="Password"
              fullWidth
            /> */}
          </View>
        </ScrollView>

        {/* Save Changes Button */}
        <PrimaryButton
          title={isUpdating ? 'Saving...' : 'Save Changes'}
          onPress={handleSaveChanges}
          variant="primary"
          style={styles.saveButton}
          fullWidth
          disabled={isUpdating}
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
  profilePictureLabel: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(14),
    color: colors.white,
    marginBottom: metrics.width(15),
  },
  required: {
    color: colors.primary,
  },
  errorText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(12),
    color: colors.primary,
    marginTop: metrics.width(8),
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
