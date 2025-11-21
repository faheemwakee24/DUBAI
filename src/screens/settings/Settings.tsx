import React, { useState, useEffect } from 'react';
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
import { tokenStorage } from '../../utils/tokenStorage';
import { useGetProfileQuery, useLogoutMutation, User } from '../../store/api/authApi';
import { showToast } from '../../utils/toast';

type SettingsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function Settings() {
  const navigation = useNavigation<SettingsNavigationProp>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { data: profileData, isLoading: profileLoading } = useGetProfileQuery();
  const [logout, { isLoading: logoutLoading }] = useLogoutMutation();

  useEffect(() => {
    // Load user from storage on mount
    const loadUser = async () => {
      try {
        const storedUser = await tokenStorage.getUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };

    loadUser();
  }, []);

  // Update user when profile data is fetched
  useEffect(() => {
    if (profileData) {
      setUser(profileData as any);
      // Update stored user data
      tokenStorage.setUser(profileData as any);
    }
  }, [profileData]);

  // Get user display name
  const getUserDisplayName = () => {
    if (user) {
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      if (user.firstName) {
        return user.firstName;
      }
      if (user.email) {
        return user.email.split('@')[0];
      }
    }
    return 'User'; // Fallback
  };

  // Get user email
  const getUserEmail = () => {
    if (user?.email) {
      return user.email;
    }
    return 'user@example.com'; // Fallback
  };

  // Get user avatar
  const getUserAvatar = () => {
    if (user?.avatar) {
      return { uri: user.avatar };
    }
    return Images.DefaultProfile;
  };

  const handleEditProfile = () => {
    navigation.navigate('EditAccount');
  };

  const handleManageSubscription = () => {
    navigation.navigate('Subscription');
  };

  const handleLanguage = () => {
    navigation.navigate('Language');
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      
      // Clear stored data
      await tokenStorage.clearAll();
      
      showToast.success('Logged out', 'You have been successfully logged out');
      
      // Navigate to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      // Clear local data even if API call fails
      await tokenStorage.clearAll();
      showToast.error('Logout', 'Failed to logout from server, but local session cleared');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    }
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
                <Image source={getUserAvatar()} style={styles.avatar} />
              </LiquidGlassBackground>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>
                  {profileLoading ? 'Loading...' : getUserDisplayName()}
                </Text>
                <Text style={styles.userEmail}>
                  {getUserEmail()}
                </Text>
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
            {/* <LiquidGlassBackground style={styles.optionCard}>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={()=>navigation.navigate('AvatarCustomization')}
              >
                <Text style={styles.optionText}>Avatar</Text>
                <Svgs.WhiteArrowRight
                  
                />
              </TouchableOpacity>
            </LiquidGlassBackground> */}
             <LiquidGlassBackground style={styles.optionCard}>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={()=>   {
                  
                  navigation.navigate('GeneratedCharacters',{generationId: 'd8a09a54e0ba4941b96ec29bc832a7a4'});
                  //navigation.navigate('GeneratingCharacterVideo', { videoId: '0c00afea448547eeb880a904f27e5361-hi',screenFrom:'translating' })
                  //navigation.navigate('GeneratingCharacterVideo', { videoId: '301cfd6e6e9741a79be12541c991f736' })
                  // navigation.navigate('PreViewVedio',
                  
                  // { video_url:
                    
                  //   'https://d-id-talks-prod.s3.us-west-2.amazonaws.com/google-oauth2%7C103671870125720999955/tlk_KLdmaIQo-2yV88fU1B-Bq/1763327418387.mp4?AWSAccessKeyId=AKIA5CUMPJBIK65W6FGA&Expires=1763413825&Signature=%2BlkCDvpdoCLqx92iRx0ZIpdzEMY%3D' 
                  // //'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
                  // })
                
                
                }}
              >
                <Text style={styles.optionText}>vedio preview </Text>
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
            title={logoutLoading ? 'Logging out...' : 'Logout'}
            onPress={handleLogout}
            variant="primary"
            style={styles.logoutButton}
            fullWidth
            icon={<Svgs.LogoutIcon/>}
            disabled={logoutLoading}
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
