import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Image,
  RefreshControl,
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
import { Header, LiquidGlassBackground, Shimmer } from '../../components/ui';
import { Images } from '../../assets/images';
import {
  useGetProjectVideosQuery,
  useGetPhotoAvatarGenerationsQuery,
  useGetVideoTranslationsQuery,
} from '../../store/api/projectsApi';
import type {
  ProjectVideo,
  PhotoAvatarGeneration,
  VideoTranslation,
} from '../../store/api/projectsApi';
import { downloadVideo, DownloadProgress } from '../../utils/videoDownloader';
import {
  downloadImage,
  ImageDownloadProgress,
} from '../../utils/imageDownloader';
import { showToast } from '../../utils/toast';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

type TabType = 'videos' | 'avatars' | 'translations';

export default function ProjectVedios() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProjectVedios'>>();
  const { projectId } = route.params || {};

  // State for active tab
  const [activeTab, setActiveTab] = useState<TabType>('videos');

  // State for tracking downloads
  const [downloadingVideoId, setDownloadingVideoId] = useState<string | null>(
    null,
  );
  const [downloadingImageId, setDownloadingImageId] = useState<string | null>(
    null,
  );
  const [downloadProgress, setDownloadProgress] = useState<
    Record<string, number>
  >({});

  // Fetch data based on active tab
  const {
    data: videos,
    isLoading: isLoadingVideos,
    error: videosError,
    refetch: refetchVideos,
    isFetching: isFetchingVideos,
  } = useGetProjectVideosQuery(projectId || '', {
    skip: !projectId || activeTab !== 'videos',
  });

  const {
    data: avatars,
    isLoading: isLoadingAvatars,
    error: avatarsError,
    refetch: refetchAvatars,
    isFetching: isFetchingAvatars,
  } = useGetPhotoAvatarGenerationsQuery(projectId || '', {
    skip: !projectId || activeTab !== 'avatars',
  });

  const {
    data: translations,
    isLoading: isLoadingTranslations,
    error: translationsError,
    refetch: refetchTranslations,
    isFetching: isFetchingTranslations,
  } = useGetVideoTranslationsQuery(projectId || '', {
    skip: !projectId || activeTab !== 'translations',
  });

  // Get current data and loading state based on active tab
  const isLoading = useMemo(() => {
    if (activeTab === 'videos') return isLoadingVideos;
    if (activeTab === 'avatars') return isLoadingAvatars;
    return isLoadingTranslations;
  }, [activeTab, isLoadingVideos, isLoadingAvatars, isLoadingTranslations]);

  const error = useMemo(() => {
    if (activeTab === 'videos') return videosError;
    if (activeTab === 'avatars') return avatarsError;
    return translationsError;
  }, [activeTab, videosError, avatarsError, translationsError]);

  // Get current refetch function and fetching state based on active tab
  const refetch = useMemo(() => {
    if (activeTab === 'videos') return refetchVideos;
    if (activeTab === 'avatars') return refetchAvatars;
    return refetchTranslations;
  }, [activeTab, refetchVideos, refetchAvatars, refetchTranslations]);

  const isRefreshing = useMemo(() => {
    if (activeTab === 'videos') return isFetchingVideos;
    if (activeTab === 'avatars') return isFetchingAvatars;
    return isFetchingTranslations;
  }, [activeTab, isFetchingVideos, isFetchingAvatars, isFetchingTranslations]);

  // Handle pull to refresh
  const onRefresh = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
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

  // Handle video download (for videos and translations)
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
      return; // Prevent multiple simultaneous downloads
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
      console.error('[ProjectVedios] Download error:', error);
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

  // Render video item function for FlatList
  const renderVideoItem = ({ item }: { item: ProjectVideo }) => {
    const statusDisplay = getStatusDisplay(item.status);
    const isCompleted = item.status.toLowerCase() === 'completed';
    const videoUrl = item.video_url || item.gcs_signed_url;
    const gifUrl = item.gcs_gif_signed_url || item.gif_download_url;
    const hasGif = !!gifUrl;
    console.log('item', item);

    return (
      <LiquidGlassBackground style={styles.projectCard}>
        {hasGif ? (
          // Show GIF if available - use View with Image for proper GIF animation
          <View style={styles.projectIconContainer}>
            <Image
              source={{ uri: gifUrl }}
              style={styles.projectIconImage}
              resizeMode="cover"
            />
            {isCompleted && videoUrl && (
              <TouchableOpacity
                onPress={() =>
                  handleDownloadVideo(
                    videoUrl,
                    `project_video_${item.video_id}_${Date.now()}.mp4`,
                    item.id,
                  )
                }
                style={styles.downloadIconTouchable}
                disabled={downloadingVideoId === item.id}
                activeOpacity={0.7}
              >
                <LiquidGlassBackground style={styles.downloadIcon}>
                  <View style={styles.downloadIconContainer}>
                    {downloadingVideoId === item.id ? (
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
          </View>
        ) : (
          // Show static image if no GIF
          <ImageBackground
            source={{ uri: item.avatar_photo_url }}
            style={styles.projectIcon}
            imageStyle={{ borderRadius: 12 }}
          >
            {isCompleted && videoUrl && (
              <TouchableOpacity
                onPress={() =>
                  handleDownloadVideo(
                    videoUrl,
                    `project_video_${item.video_id}_${Date.now()}.mp4`,
                    item.id,
                  )
                }
                style={styles.downloadIconTouchable}
                disabled={downloadingVideoId === item.id}
                activeOpacity={0.7}
              >
                <LiquidGlassBackground style={styles.downloadIcon}>
                  <View style={styles.downloadIconContainer}>
                    {downloadingVideoId === item.id ? (
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
        )}
        <View style={styles.projectBodyCotainer}>
          <Text
            style={styles.projectTitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.input_text.substring(0, 50)}...
          </Text>
          <Text style={styles.subtitle}>
            {item.emotion} • {item.speed}x
          </Text>
          <View style={styles.rowSpaceBetween}>
            <Text
              style={[
                styles.status,
                statusDisplay === 'Completed' && { color: colors.sucessGreen },
                statusDisplay === 'Processing' && { color: colors.primary },
                statusDisplay === 'Failed' && { color: '#FF6B6B' },
              ]}
            >
              {statusDisplay}
            </Text>
            <Text style={styles.statusTime}>
              {formatTimeAgo(item.updatedAt)}
            </Text>
          </View>
          <PrimaryButton
            title="Play"
            onPress={() => {
              if (isCompleted && videoUrl) {
                navigation.navigate('PreViewVedio', {
                  video_url: videoUrl,
                });
              }
            }}
            extraContainerStyle={styles.buttonContainer}
            textStyle={styles.text}
            disabled={!isCompleted}
          />
        </View>
      </LiquidGlassBackground>
    );
  };

  // Handle image download
  const handleDownloadImage = async (
    imageUrl: string,
    itemId: string,
    imageIndex: number = 0,
  ) => {
    if (!imageUrl) {
      showToast.error('Error', 'No image URL available');
      return;
    }

    if (downloadingImageId === `${itemId}-${imageIndex}`) {
      return; // Prevent multiple simultaneous downloads
    }

    setDownloadingImageId(`${itemId}-${imageIndex}`);

    try {
      const fileName = `avatar_${itemId}_${imageIndex}_${Date.now()}.jpg`;
      const result = await downloadImage(
        imageUrl,
        fileName,
        (progress: ImageDownloadProgress) => {
          // Optional: Track progress if needed
          const percent = Math.round(progress.progress * 100);
          console.log(`Download progress: ${percent}%`);
        },
      );

      if (result.success && result.filePath) {
        showToast.success('Success', 'Image downloaded successfully!');
      } else {
        showToast.error('Error', result.error || 'Failed to download image');
      }
    } catch (error: any) {
      console.error('[ProjectVedios] Image download error:', error);
      showToast.error('Error', error?.message || 'Failed to download image');
    } finally {
      setDownloadingImageId(null);
    }
  };

  // Handle avatar preview
  const handleAvatarPreview = (item: PhotoAvatarGeneration) => {
    const imageUrls =
      item.image_url_list && item.image_url_list.length > 0
        ? item.image_url_list
        : item.photo_url
        ? [item.photo_url]
        : [];

    if (imageUrls.length === 0) {
      showToast.error('Error', 'No images available for preview');
      return;
    }

    // Navigate to GeneratedCharacters screen with the avatar images
    // Pass imageKeys if available so user can select and continue to video generation
    navigation.navigate('GeneratedCharacters', {
      imageUrls: imageUrls,
      imageKeys: item.image_key_list || [],
      projectId: projectId,
    });
  };

  // Render avatar item function for FlatList
  const renderAvatarItem = ({ item }: { item: PhotoAvatarGeneration }) => {
    const statusDisplay = getStatusDisplay(item.status);
    const isCompleted = item.status.toLowerCase() === 'completed';
    const firstImage = item.image_url_list?.[0] || item.photo_url;
    const hasMultipleImages =
      item.image_url_list && item.image_url_list.length > 1;

    return (
      <LiquidGlassBackground style={styles.projectCard}>
        <ImageBackground
          source={{ uri: firstImage }}
          style={styles.projectIcon}
          imageStyle={{ borderRadius: 12 }}
        >
          {isCompleted && firstImage && (
            <TouchableOpacity
              onPress={() => handleDownloadImage(firstImage, item.id, 0)}
              style={styles.downloadIconTouchable}
              disabled={downloadingImageId === `${item.id}-0`}
              activeOpacity={0.7}
            >
              <LiquidGlassBackground style={styles.downloadIcon}>
                <View style={styles.downloadIconContainer}>
                  {downloadingImageId === `${item.id}-0` ? (
                    <Text style={styles.downloadProgressText}>...</Text>
                  ) : (
                    <Svgs.Downloard />
                  )}
                </View>
              </LiquidGlassBackground>
            </TouchableOpacity>
          )}
        </ImageBackground>
        <View style={styles.projectBodyCotainer}>
          <Text
            style={styles.projectTitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.name || 'Avatar'}
          </Text>
          <Text
            style={styles.subtitle}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {item.age} • {item.gender}
          </Text>
          <View style={styles.rowSpaceBetween}>
            <Text
              style={[
                styles.status,
                statusDisplay === 'Completed' && { color: colors.sucessGreen },
                statusDisplay === 'Processing' && { color: colors.primary },
                statusDisplay === 'Failed' && { color: '#FF6B6B' },
              ]}
            >
              {statusDisplay}
            </Text>
            <Text style={styles.statusTime}>
              {formatTimeAgo(item.updatedAt)}
            </Text>
          </View>
          {isCompleted && (
            <PrimaryButton
              title={hasMultipleImages ? 'Preview All' : 'Preview'}
              onPress={() => handleAvatarPreview(item)}
              extraContainerStyle={styles.buttonContainer}
              textStyle={styles.text}
            />
          )}
        </View>
      </LiquidGlassBackground>
    );
  };

  // Render translation item function for FlatList
  const renderTranslationItem = ({ item }: { item: VideoTranslation }) => {
    const statusDisplay = getStatusDisplay(item.status);
    const isCompleted = item.status.toLowerCase() === 'completed';
    const videoUrl = item.translated_video_url || item.gcs_signed_url;

    return (
      <LiquidGlassBackground style={styles.projectCard}>
        <ImageBackground
          source={Images.VedioIcon2}
          style={styles.projectIcon}
          imageStyle={{ borderRadius: 12 }}
        >
          {isCompleted && videoUrl && (
            <TouchableOpacity
              onPress={() =>
                handleDownloadVideo(
                  videoUrl,
                  `translation_${item.video_translate_id}_${Date.now()}.mp4`,
                  item.id,
                )
              }
              style={styles.downloadIconTouchable}
              disabled={downloadingVideoId === item.id}
              activeOpacity={0.7}
            >
              <LiquidGlassBackground style={styles.downloadIcon}>
                <View style={styles.downloadIconContainer}>
                  {downloadingVideoId === item.id ? (
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
        <View style={styles.projectBodyCotainer}>
          <Text
            style={styles.projectTitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.title || 'Translation'}
          </Text>
          <Text style={styles.subtitle}>
            {item.output_language} • {item.mode}
          </Text>
          <View style={styles.rowSpaceBetween}>
            <Text
              style={[
                styles.status,
                statusDisplay === 'Completed' && { color: colors.sucessGreen },
                statusDisplay === 'Processing' && { color: colors.primary },
                statusDisplay === 'Failed' && { color: '#FF6B6B' },
              ]}
            >
              {statusDisplay}
            </Text>
            <Text style={styles.statusTime}>
              {formatTimeAgo(item.updatedAt)}
            </Text>
          </View>
          <PrimaryButton
            title="Play"
            onPress={() => {
              if (isCompleted && videoUrl) {
                navigation.navigate('PreViewVedio', {
                  video_url: videoUrl,
                });
              }
            }}
            extraContainerStyle={styles.buttonContainer}
            textStyle={styles.text}
            disabled={!isCompleted}
          />
        </View>
      </LiquidGlassBackground>
    );
  };

  // Render shimmer placeholder
  const renderShimmerItem = () => (
    <LiquidGlassBackground style={styles.projectCard}>
      <Shimmer width="100%" height={metrics.width(140)} borderRadius={12} />
      <View style={styles.projectBodyCotainer}>
        <Shimmer width="100%" height={metrics.width(18)} borderRadius={4} />
        <Shimmer
          width="60%"
          height={metrics.width(14)}
          borderRadius={4}
          style={{ marginTop: metrics.width(5) }}
        />
        <View style={[styles.rowSpaceBetween, { marginTop: metrics.width(5) }]}>
          <Shimmer
            width={metrics.width(60)}
            height={metrics.width(12)}
            borderRadius={4}
          />
          <Shimmer
            width={metrics.width(80)}
            height={metrics.width(12)}
            borderRadius={4}
          />
        </View>
        <Shimmer
          width="100%"
          height={metrics.width(35)}
          borderRadius={8}
          style={{ marginTop: metrics.width(10) }}
        />
      </View>
    </LiquidGlassBackground>
  );

  // Get current data based on active tab
  const getCurrentData = () => {
    if (activeTab === 'videos') return videos || [];
    if (activeTab === 'avatars') return avatars || [];
    return translations || [];
  };

  const currentData = getCurrentData();

  // Render item based on active tab
  const renderItem = ({ item }: { item: any }) => {
    if (activeTab === 'videos')
      return renderVideoItem({ item: item as ProjectVideo });
    if (activeTab === 'avatars')
      return renderAvatarItem({ item: item as PhotoAvatarGeneration });
    return renderTranslationItem({ item: item as VideoTranslation });
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Project Videos" showBackButton />

        {/* Tab Bar */}
        <View style={styles.tabContainer}>
          {activeTab === 'videos' ? (
            <TouchableOpacity
              style={[styles.tab, styles.activeTab]}
              onPress={() => setActiveTab('videos')}
            >
              <Text style={[styles.tabText, styles.activeTabText]}>Videos</Text>
            </TouchableOpacity>
          ) : (
            <LiquidGlassBackground style={styles.tab}>
              <TouchableOpacity
                style={styles.tabContent}
                onPress={() => setActiveTab('videos')}
              >
                <Text style={styles.tabText}>Videos</Text>
              </TouchableOpacity>
            </LiquidGlassBackground>
          )}

          {activeTab === 'avatars' ? (
            <TouchableOpacity
              style={[styles.tab, styles.activeTab]}
              onPress={() => setActiveTab('avatars')}
            >
              <Text style={[styles.tabText, styles.activeTabText]}>
                Avatars
              </Text>
            </TouchableOpacity>
          ) : (
            <LiquidGlassBackground style={styles.tab}>
              <TouchableOpacity
                style={styles.tabContent}
                onPress={() => setActiveTab('avatars')}
              >
                <Text style={styles.tabText}>Avatars</Text>
              </TouchableOpacity>
            </LiquidGlassBackground>
          )}

          {activeTab === 'translations' ? (
            <TouchableOpacity
              style={[styles.tab, styles.activeTab]}
              onPress={() => setActiveTab('translations')}
            >
              <Text style={[styles.tabText, styles.activeTabText]}>
                Translations
              </Text>
            </TouchableOpacity>
          ) : (
            <LiquidGlassBackground style={styles.tab}>
              <TouchableOpacity
                style={styles.tabContent}
                onPress={() => setActiveTab('translations')}
              >
                <Text style={styles.tabText}>Translations</Text>
              </TouchableOpacity>
            </LiquidGlassBackground>
          )}
        </View>

        {isLoading ? (
          <FlatList
            data={[1, 2, 3, 4]}
            renderItem={renderShimmerItem}
            keyExtractor={item => `shimmer-${item}`}
            numColumns={2}
            columnWrapperStyle={styles.row}
            style={styles.flatList}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing&&currentData.length>0}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load {activeTab}</Text>
          </View>
        ) : currentData.length > 0 ? (
          <FlatList
            data={currentData}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            style={styles.flatList}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing&&currentData.length>0}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeTab} found</Text>
          </View>
        )}
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
  flatList: {
    flex: 1,
    marginTop: metrics.width(20),
  },
  contentContainer: {
    paddingBottom: 40,
  },
  separator: {
    height: 15,
  },
  row: {
    justifyContent: 'flex-start',
    gap: metrics.width(10),
  },
  projectInnerContainer: {
    marginHorizontal: metrics.width(16),
    marginVertical: metrics.width(20),
    flexDirection: 'row',
    gap: metrics.width(16),
  },
  ProjectOuterContainer: {
    borderRadius: 12,
  },
  projectIcon: {
    height: metrics.width(140),
    width: '100%',
  },
  projectIconContainer: {
    height: metrics.width(140),
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  projectIconImage: {
    height: metrics.width(140),
    width: '100%',
    borderRadius: 12,
  },
  projectDataContainer: {
    gap: metrics.width(7),
  },
  projectTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(15),
    color: colors.white,
  },
  projectSubTitleContainer: {
    flexDirection: 'row',
    gap: metrics.width(5),
    alignItems: 'center',
  },
  projectSubTitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.primary,
  },
  dot: {
    height: metrics.width(4),
    width: metrics.width(4),
    borderRadius: 100,
    backgroundColor: colors.subtitle,
  },
  vediocCout: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
  },
  projectCard: {
    gap: metrics.width(11),
    width: (metrics.screenWidth - metrics.width(50) - metrics.width(10)) / 2, // Screen width minus margins and gap, divided by 2
    borderRadius: 12,
  },
  projectBodyCotainer: {
    margin: metrics.width(10),
    gap: metrics.width(5),
  },
  subtitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  status: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(11),
    color: colors.sucessGreen,
  },
  statusTime: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(11),
    color: colors.subtitle,
  },
  buttonContainer: {
    paddingVertical: metrics.width(6),
    minHeight: 15,
    borderRadius: 8,
    marginTop: metrics.width(10),
  },
  text: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(13),
    color: colors.white,
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
  downloadIconTouchable: {
    position: 'absolute',
    right: 10,
    top: 10,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: metrics.width(50),
  },
  errorText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(16),
    color: colors.subtitle,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: metrics.width(50),
  },
  emptyText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(16),
    color: colors.subtitle,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: metrics.width(20),
    marginBottom: metrics.width(20),
    gap: metrics.width(10),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tab: {
    flex: 1,
    borderRadius: 8,
    minWidth: 0, // Allow flex to shrink if needed
  },
  tabContent: {
    paddingVertical: metrics.width(12),
    paddingHorizontal: metrics.width(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary,
    paddingVertical: metrics.width(12),
    paddingHorizontal: metrics.width(10),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: 0, // Allow flex to shrink if needed
  },
  tabText: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(12),
    color: colors.white,
    textAlign: 'center',
  },
  activeTabText: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(12),
    color: colors.white,
    textAlign: 'center',
  },
});
