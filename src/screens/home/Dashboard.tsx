import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import PrimaryButton from '../../components/ui/PrimaryButton';
import Input from '../../components/ui/Input';

import { FontFamily, Typography } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { Svgs } from '../../assets/icons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, LiquidGlassBackground } from '../../components/ui';
import { Images } from '../../assets/images';
import { tokenStorage } from '../../utils/tokenStorage';
import { useGetProfileQuery } from '../../store/api/authApi';
import { User } from '../../store/api/authApi';
import { useGetProjectsQuery } from '../../store/api/projectsApi';
import { useUpdateFcmTokenMutation } from '../../store/api/usersApi';
import { showToast } from '../../utils/toast';
import { pushNotificationService } from '../../services/pushNotificationService';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function Dashboard() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [user, setUser] = useState<User | null>(null);
  const { data: profileData, isLoading: profileLoading } = useGetProfileQuery();
  const { data: projects = [], isLoading: isLoadingProjects } = useGetProjectsQuery();
  const [updateFcmToken] = useUpdateFcmTokenMutation();

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

  // Send FCM token to backend when dashboard is visited
  useEffect(() => {
    const sendFcmToken = async () => {
      try {
        // Get FCM token from push notification service
        const fcmToken = await pushNotificationService.getToken();
        
        if (fcmToken) {
          console.log('[Dashboard] Sending FCM token to backend:', fcmToken);
          
          // Send FCM token to backend
          await updateFcmToken({
            fcmToken: fcmToken,
          }).unwrap();
          
          console.log('[Dashboard] FCM token sent successfully');
        } else {
          console.warn('[Dashboard] FCM token not available');
        }
      } catch (error) {
        console.error('[Dashboard] Error sending FCM token:', error);
        // Don't show error toast as this is a background operation
      }
    };

    // Send FCM token when component mounts
    sendFcmToken();
  }, [updateFcmToken]);

  // Update user when profile data is fetched
  useEffect(() => {
    if (profileData) {
      setUser(profileData as any);
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

  // Get user avatar
  const getUserAvatar = () => {
    // if (user?.avatar) {
    //   return { uri: user.avatar };
    // }
    return Images.DefaultProfile;
  };

  // Handle Video Dubbing create
  const handleVideoDubbingCreate = () => {
    if (isLoadingProjects) {
      return; // Wait for projects to load
    }
    if (!projects || projects.length === 0) {
      showToast.error(
        'No Projects',
        'Please create a project first before creating video dubbing.',
      );
      navigation.navigate('NewProject');
      return;
    }
    navigation.navigate('UploadVedio');
  };

  // Handle Character Reader create
  const handleCharacterReaderCreate = () => {
    if (isLoadingProjects) {
      return; // Wait for projects to load
    }
    if (!projects || projects.length === 0) {
      showToast.error(
        'No Projects',
        'Please create a project first before creating character reader.',
      );
      navigation.navigate('NewProject');
      return;
    }
    navigation.navigate('ChoseCharacter');
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <View style={styles.headerLeftContainer}>
            <LiquidGlassBackground style={styles.profileImageBackground}>
              <Image
                source={getUserAvatar()}
                style={styles.profileImage}
              />
            </LiquidGlassBackground>
            <View style={styles.headerLeftContainerText}>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subTitle}>
                {profileLoading ? 'Loading...' : getUserDisplayName()}
              </Text>
            </View>
          </View>
          <View style={styles.headerRightContainer}>
            <LiquidGlassBackground style={styles.headerRightIconBackground} onPress={()=>{navigation.navigate('Notifications')}} disabled={false}>
              <Svgs.Notification />
            </LiquidGlassBackground>
            <LiquidGlassBackground style={styles.headerRightIconBackground} onPress={()=>{navigation.navigate('Settings')}} disabled={false}>
              <Svgs.Settings />
            </LiquidGlassBackground>
            <LiquidGlassBackground style={styles.headerRightIconBackground} onPress={()=>{navigation.navigate('RecentProjects')}} disabled={false}>
              <Svgs.MenuIcon />
            </LiquidGlassBackground>
          </View>
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dashboardContainer}>
            <LiquidGlassBackground style={styles.dashboardCard}>
              <View style={styles.ProPlanIconContainer}>
                <View style={styles.propPlanIconTextContainer}>
                  <Image
                    source={Images.ProPlanIcon}
                    style={styles.ProPlanIconImage}
                  />
                  <View>
                    <Text style={styles.ProPlanTitle}>Pro Plan</Text>
                    <Text style={styles.ProPlanSubTitle}>3 of 5 Dubs used</Text>
                  </View>
                </View>
                <PrimaryButton
                  title="Upgrade"
                  onPress={() => navigation.navigate('Subscription')}
                  variant="primary"
                  size="extraSmall"
                  extraContainerStyle={styles.button}
                />
              </View>
            </LiquidGlassBackground>
            <LiquidGlassBackground style={styles.debugCotainer}>
              <View>
                <Text style={styles.debugTitle}>Video {'\n'}Dubbing</Text>
                <Text style={styles.debuggingSubtitle}>
                  Translate & Dub Video
                </Text>
              </View>
              <View style={styles.row}>
                <TouchableOpacity onPress={handleVideoDubbingCreate} style={styles.createButtonContainer}>
                  <Text style={styles.createButton}>Create</Text>
                </TouchableOpacity>
              </View>
              <Image source={Images.VedioIcon2} style={styles.vedioIcon2} />
            </LiquidGlassBackground>
            <LiquidGlassBackground style={styles.CharacterCreationContainer}>
              <View>
                <Text style={styles.debugTitle}>Character {'\n'}Reader</Text>
                <Text style={styles.debuggingSubtitle}>
                  Create talking avatars
                </Text>
              </View>
              <View style={styles.row}>
                <TouchableOpacity onPress={handleCharacterReaderCreate} style={styles.createButtonContainer}>
                  <Text style={styles.createButton}>Create</Text>
                </TouchableOpacity>
              </View>
              <Image
                source={Images.CharacterIcon}
                style={styles.characherIcon}
              />
            </LiquidGlassBackground>
          </View>
        </ScrollView>
        <PrimaryButton
          title="Create Project"
          onPress={() => navigation.navigate('NewProject')}
          variant="primary"
          style={{
            marginHorizontal: metrics.width(25),
            marginBottom: metrics.width(25),
          }}
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
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: metrics.width(17),
    marginHorizontal: metrics.width(25),
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.width(10),
  },
  title: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(17),
    color: colors.white,
  },
  subTitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.subtitle,
  },
  profileImage: {
    width: metrics.width(48),
    height: metrics.width(48),
    borderRadius: 100,
    overflow: 'hidden',
  },
  profileImageBackground: {},
  headerLeftContainerText: {
    gap: metrics.width(4),
  },
  headerRightContainer: {
    gap: metrics.width(8),
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRightIconBackground: {
    padding: metrics.width(10),
  },
  dashboardContainer: {
    flex: 1,
    marginTop: metrics.width(40),
  },
  dashboardCard: {
    paddingHorizontal: metrics.width(16),
    paddingVertical: metrics.width(22),
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.38)',
  },
  ProPlanIconImage: {
    width: metrics.width(50),
    height: metrics.width(50),
    resizeMode: 'contain',
  },
  ProPlanIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: metrics.width(10),
  },
  ProPlanTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(15),
    color: colors.white,
  },
  propPlanIconTextContainer: {
    gap: metrics.width(15),
    color: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ProPlanSubTitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(11),
    color: colors.subtitle,
    marginTop: metrics.width(4),
  },
  upgradeButton: {},
  button: {
    borderRadius: 8,
    paddingHorizontal: metrics.width(15),
  },
  debugCotainer: {
    paddingHorizontal: metrics.width(17),
    paddingVertical: metrics.width(20),
    marginTop: metrics.width(40),
  },
  debugTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(20),
    color: colors.white,
    lineHeight: metrics.width(27),
  },
  debuggingSubtitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
    marginTop: metrics.width(4),
  },
  row: {
    flexDirection: 'row',
    marginTop: metrics.width(11),
    marginBottom: metrics.width(70),
  },
  createButton: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(12),
    color: colors.white,
  },
  vedioIcon2: {
    height: metrics.width(150),
    width: metrics.width(150),
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: 0,
  },
  characherIcon: {
    height: metrics.width(200),
    width: metrics.width(200),
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: -25,
    right: -15,
  },
  createButtonContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: metrics.width(13),
    paddingVertical: metrics.width(6),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  CharacterCreationContainer: {
    paddingHorizontal: metrics.width(17),
    paddingVertical: metrics.width(20),
    marginTop: metrics.width(9),
    borderWidth: 0.8,
    borderLeftWidth:0.8,
    borderRightWidth:0.8,
    borderBottomWidth:0.8,
    borderColor: colors.primary40,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: -12,
    },
    shadowOpacity: 0.1,
    shadowRadius: 0.1,

    elevation: 7,
    backgroundColor: colors.primary3,
  },
});
