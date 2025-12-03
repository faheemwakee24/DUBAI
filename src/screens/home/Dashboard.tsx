import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  FlatList,
  ImageBackground,
  RefreshControl,
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, LiquidGlassBackground, Shimmer } from '../../components/ui';
import { Images } from '../../assets/images';
import { tokenStorage } from '../../utils/tokenStorage';
import { useGetProfileQuery } from '../../store/api/authApi';
import { User } from '../../store/api/authApi';
import { useGetProjectsQuery } from '../../store/api/projectsApi';
import { useUpdateFcmTokenMutation, useGetCreditsQuery } from '../../store/api/usersApi';
import { showToast } from '../../utils/toast';
import { pushNotificationService } from '../../services/pushNotificationService';
import {
  useGetRecentCreationsQuery,
  RecentCreation,
  PhotoAvatarCreation,
  ImageUploadCreation,
  AvatarVideoCreation,
  VideoTranslationCreation,
} from '../../store/api/heygenApi';
import { downloadVideo, DownloadProgress } from '../../utils/videoDownloader';
import { downloadImage } from '../../utils/imageDownloader';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function Dashboard() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [user, setUser] = useState<User | null>(null);
  const { data: profileData, isLoading: profileLoading } = useGetProfileQuery();
  const { data: projects = [], isLoading: isLoadingProjects } = useGetProjectsQuery();
  const { data: creditsData, isLoading: isLoadingCredits } = useGetCreditsQuery();
  const [updateFcmToken] = useUpdateFcmTokenMutation();
  const [currentPage, setCurrentPage] = useState(1);
  const [allCreations, setAllCreations] = useState<RecentCreation[]>([]);
  const limit = 10;
  
  const {
    data: recentCreationsData,
    isLoading: isLoadingCreations,
    refetch: refetchCreations,
    isFetching: isFetchingCreations,
  } = useGetRecentCreationsQuery({ page: currentPage, limit });
  
  const [downloadingVideoId, setDownloadingVideoId] = useState<string | null>(null);
  const [downloadingImageId, setDownloadingImageId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

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

  // Refetch creations when screen is focused
  // useFocusEffect(
  //   useCallback(() => {
  //     // Reset to page 1 and refetch when screen is focused
  //     setCurrentPage(1);
  //     setAllCreations([]);
  //     refetchCreations();
  //   }, [refetchCreations])
  // );

  // Accumulate data from pages
  useEffect(() => {
    if (recentCreationsData?.data) {
      if (currentPage === 1) {
        // First page - replace all data
        setAllCreations(recentCreationsData.data);
      } else {
        // Subsequent pages - append data
        setAllCreations(prev => {
          // Avoid duplicates by checking IDs
          const existingIds = new Set(prev.map(item => item.id));
          const newItems = recentCreationsData.data.filter(item => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
      }
    }
  }, [recentCreationsData, currentPage]);

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
    if (profileData?.avatar) {
      return { uri: profileData.avatar };
    }
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

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Map status to display format
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      completed: 'Completed',
      processing: 'Processing',
      failed: 'Failed',
      pending: 'Processing',
    };
    return statusMap[status.toLowerCase()] || status;
  };

  // Handle video download
  const handleDownloadVideo = async (
    videoUrl: string,
    fileName: string,
    itemId: string,
  ) => {
    if (!videoUrl) {
      showToast.error('Error', 'No video URL available');
      return;
    }

    if (downloadingVideoId === itemId) {
      return;
    }

    setDownloadingVideoId(itemId);
    setDownloadProgress(prev => ({ ...prev, [itemId]: 0 }));

    try {
      const result = await downloadVideo(
        videoUrl,
        fileName,
        (progress: DownloadProgress) => {
          const percent = Math.round(progress.progress * 100);
          setDownloadProgress(prev => ({ ...prev, [itemId]: percent }));
        },
      );

      if (result.success && result.filePath) {
        showToast.success('Success', 'Video downloaded successfully!');
      } else {
        showToast.error('Error', result.error || 'Failed to download video');
      }
    } catch (error: any) {
      console.error('[Dashboard] Download error:', error);
      showToast.error('Error', error?.message || 'Failed to download video');
    } finally {
      setDownloadingVideoId(null);
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[itemId];
        return newProgress;
      });
    }
  };

  // Handle image download
  const handleDownloadImage = async (imageUrl: string, itemId: string) => {
    if (!imageUrl) {
      showToast.error('Error', 'No image URL available');
      return;
    }

    if (downloadingImageId === itemId) {
      return;
    }

    setDownloadingImageId(itemId);

    try {
      const fileName = `creation_${itemId}_${Date.now()}.jpg`;
      const result = await downloadImage(imageUrl, fileName, () => {});

      if (result.success && result.filePath) {
        showToast.success('Success', 'Image downloaded successfully!');
      } else {
        showToast.error('Error', result.error || 'Failed to download image');
      }
    } catch (error: any) {
      console.error('[Dashboard] Image download error:', error);
      showToast.error('Error', error?.message || 'Failed to download image');
    } finally {
      setDownloadingImageId(null);
    }
  };

  // Get image URL for creation
  const getCreationImageUrl = (item: RecentCreation): string | null => {
    if (item.type === 'photo_avatar') {
      return (item as PhotoAvatarCreation).photo_url;
    }
    if (item.type === 'image_upload') {
      return (item as ImageUploadCreation).asset_url;
    }
    if (item.type === 'avatar_video') {
      return (item as AvatarVideoCreation).avatar_photo_url;
    }
    return null;
  };

  // Get title for creation
  const getCreationTitle = (item: RecentCreation): string => {
    if (item.type === 'photo_avatar') {
      return (item as PhotoAvatarCreation).name || 'Photo Avatar';
    }
    if (item.type === 'image_upload') {
      return (item as ImageUploadCreation).file_name || 'Uploaded Image';
    }
    if (item.type === 'avatar_video') {
      const video = item as AvatarVideoCreation;
      return video.input_text?.substring(0, 50) || video.video_title || 'Avatar Video';
    }
    if (item.type === 'video_translation') {
      return (item as VideoTranslationCreation).title || 'Video Translation';
    }
    return 'Creation';
  };

  // Get subtitle for creation
  const getCreationSubtitle = (item: RecentCreation): string => {
    if (item.type === 'avatar_video') {
      return `Avatar: ${(item as AvatarVideoCreation).avatar_id}`;
    }
    if (item.type === 'video_translation') {
      return (item as VideoTranslationCreation).output_language;
    }
    return item.type.replace('_', ' ').toUpperCase();
  };

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (recentCreationsData?.pagination?.hasNextPage && !isFetchingCreations) {
      setCurrentPage(prev => prev + 1);
    }
  }, [recentCreationsData?.pagination?.hasNextPage, isFetchingCreations]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    setAllCreations([]);
    refetchCreations();
  }, [refetchCreations]);

  // Handle creation press
  const handleCreationPress = (item: RecentCreation) => {
    if (item.type === 'image_upload') {
      const image = item as ImageUploadCreation;
      navigation.navigate('GeneratedCharacters', {
        imageUrls: [image.asset_url],
        imageKeys: [image?.metadata?.response?.data?.image_key],
        projectId: image.projectId,
      });
    }
    if (item.type === 'photo_avatar') {
      const photo = item as PhotoAvatarCreation;
      navigation.navigate('GeneratedCharacters', {
        imageUrls: [photo.photo_url],
        imageKeys: [photo.photo_url],
        projectId: photo.projectId,
      });
    }
    if (item.type === 'avatar_video') {
      const video = item as AvatarVideoCreation;
      if (video.status.toLowerCase() === 'completed' && video.video_url) {
        navigation.navigate('PreViewVedio', {
          video_url: video.video_url,
        });
      }
    } else if (item.type === 'video_translation') {
      const translation = item as VideoTranslationCreation;
      if (translation.status.toLowerCase() === 'completed' && translation.translated_video_url) {
        navigation.navigate('PreViewVedio', {
          video_url: translation.translated_video_url,
        });
      }
    } else if (item.type === 'photo_avatar' && item.status.toLowerCase() === 'completed') {
      const photo = item as PhotoAvatarCreation;
      const imageUrls = photo.metadata?.api_response?.data?.image_url_list || [photo.photo_url];
      const imageKeys = photo.metadata?.api_response?.data?.image_key_list || [];
      navigation.navigate('GeneratedCharacters', {
        imageUrls: imageUrls,
        imageKeys: imageKeys,
        projectId: photo.projectId,
      });
    }
  };

  // Handle image load
  const handleImageLoad = (imageUrl: string) => {
    setLoadedImages(prev => new Set(prev).add(imageUrl));
  };

  // Render creation item
  const renderCreationItem = ({ item }: { item: RecentCreation }) => {
    const statusDisplay = getStatusDisplay(item.status);
    const isCompleted = item.status.toLowerCase() === 'completed';
    const imageUrl = getCreationImageUrl(item);
    const title = getCreationTitle(item);
    const subtitle = getCreationSubtitle(item);
    const hasVideo = (item.type === 'avatar_video' || item.type === 'video_translation') && isCompleted;
    const hasImage = item.type === 'photo_avatar' || item.type === 'image_upload';
    const videoUrl = item.type === 'avatar_video' 
      ? (item as AvatarVideoCreation).video_url
      : item.type === 'video_translation'
      ? (item as VideoTranslationCreation).translated_video_url
      : null;
    
    const isImageLoaded = imageUrl ? loadedImages.has(imageUrl) : true;
    const imageSource = imageUrl ? { uri: imageUrl } : Images.VedioIcon2;

    return (
      <LiquidGlassBackground style={styles.creationCard}>
        <View style={styles.creationIcon}>
          {!isImageLoaded && imageUrl && (
            <View style={styles.imageShimmerContainer}>
              <Shimmer
                width="100%"
                height="100%"
                borderRadius={12}
              />
            </View>
          )}
          <ImageBackground
            source={imageSource}
            style={[
              styles.creationIconBackground,
              !isImageLoaded && styles.hiddenImage,
            ]}
            imageStyle={{ borderRadius: 12 }}
            onLoad={() => imageUrl && handleImageLoad(imageUrl)}
          >
          {isCompleted && (
            <TouchableOpacity
              onPress={() => {
                if (hasVideo && videoUrl) {
                  handleDownloadVideo(
                    videoUrl,
                    `creation_${item.id}_${Date.now()}.mp4`,
                    item.id,
                  );
                } else if (imageUrl) {
                  handleDownloadImage(imageUrl, item.id);
                }
              }}
              style={styles.downloadIconTouchable}
              disabled={downloadingVideoId === item.id || downloadingImageId === item.id}
              activeOpacity={0.7}
            >
              <LiquidGlassBackground style={styles.downloadIcon}>
                <View style={styles.downloadIconContainer}>
                  {downloadingVideoId === item.id || downloadingImageId === item.id ? (
                    <Text style={styles.downloadProgressText}>
                      {downloadProgress[item.id] || 0}%
                    </Text>
                  ) : (
                    <Svgs.Downloard />
                  )}
                </View>
              </LiquidGlassBackground>
            </TouchableOpacity>
          )}
          </ImageBackground>
        </View>
        <View style={styles.creationBodyContainer}>
          <Text
            style={styles.creationTitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          <Text style={styles.creationSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
          <View style={styles.rowSpaceBetween}>
            <Text
              style={[
                styles.creationStatus,
                statusDisplay === 'Completed' && { color: colors.sucessGreen },
                statusDisplay === 'Processing' && { color: colors.primary },
                statusDisplay === 'Failed' && { color: '#FF6B6B' },
              ]}
            >
              {statusDisplay}
            </Text>
            <Text style={styles.creationTime}>
              {formatTimeAgo(item.updatedAt)}
            </Text>
          </View>
          {hasImage && (
            <PrimaryButton
              title="Preview"
              onPress={() => handleCreationPress(item)}
              extraContainerStyle={styles.buttonContainer}
              textStyle={styles.buttonText}
              disabled={!isCompleted}
            />
          )}
          {hasVideo && (
            <PrimaryButton
              title="Play"
              onPress={() => handleCreationPress(item)}
              extraContainerStyle={styles.buttonContainer}
              textStyle={styles.buttonText}
              disabled={!isCompleted}
            />
          )}
        </View>
      </LiquidGlassBackground>
    );
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
          refreshControl={
            <RefreshControl
              refreshing={isFetchingCreations && currentPage === 1}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          <View style={styles.dashboardContainer}>
 
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
            
            {/* Recent Creations Section */}
            {allCreations.length > 0 && (
              <View style={styles.recentCreationsContainer}>
                <Text style={styles.sectionTitle}>Recent Creations</Text>
                <FlatList
                  data={allCreations}
                  renderItem={renderCreationItem}
                  keyExtractor={item => item.id}
                  numColumns={2}
                  columnWrapperStyle={styles.creationRow}
                  scrollEnabled={true}
                  contentContainerStyle={styles.creationsContentContainer}
                  ItemSeparatorComponent={() => <View style={styles.creationSeparator} />}
                  refreshControl={
                    <RefreshControl
                      refreshing={isFetchingCreations && currentPage === 1}
                      onRefresh={handleRefresh}
                      tintColor={colors.primary}
                      colors={[colors.primary]}
                    />
                  }
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={
                    recentCreationsData?.pagination?.hasNextPage && isFetchingCreations ? (
                      <View style={styles.loadingFooter}>
                        <Text style={styles.loadingText}>Loading more...</Text>
                      </View>
                    ) : null
                  }
                />
              </View>
            )}
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
    borderRadius:17
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
  recentCreationsContainer: {
    marginTop: metrics.width(30),
  },
  sectionTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(18),
    color: colors.white,
    marginBottom: metrics.width(15),
  },
  creationCard: {
    gap: metrics.width(11),
    width: (metrics.screenWidth - metrics.width(48) - metrics.width(10)) / 2,
    borderRadius: 12,
  },
  creationIcon: {
    height: metrics.width(140),
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  creationIconBackground: {
    height: '100%',
    width: '100%',
  },
  imageShimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  hiddenImage: {
    opacity: 0,
  },
  creationBodyContainer: {
    margin: metrics.width(10),
    gap: metrics.width(5),
  },
  creationTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(13),
    color: colors.white,
  },
  creationSubtitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(11),
    color: colors.subtitle,
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creationStatus: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(10),
    color: colors.sucessGreen,
  },
  creationTime: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(10),
    color: colors.subtitle,
  },
  creationRow: {
    justifyContent: 'flex-start',
    gap: metrics.width(10),
  },
  creationsContentContainer: {
    paddingBottom: 20,
  },
  creationSeparator: {
    height: 15,
  },
  downloadIconTouchable: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  downloadIcon: {
    right: 10,
    height: 28,
    width: 28,
    top: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  downloadIconContainer: {
    height: 28,
    width: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadProgressText: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(10),
    color: colors.white,
  },
  buttonContainer: {
    paddingVertical: metrics.width(6),
    minHeight: 15,
    borderRadius: 8,
    marginTop: metrics.width(10),
  },
  buttonText: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(12),
    color: colors.white,
  },
  loadingFooter: {
    paddingVertical: metrics.width(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.subtitle,
  },
});
