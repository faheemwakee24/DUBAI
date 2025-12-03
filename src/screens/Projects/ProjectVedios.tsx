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
import {
  Header,
  LiquidGlassBackground,
  Shimmer,
  ConfirmationModal,
} from '../../components/ui';
import { Images } from '../../assets/images';
import {
  useGetProjectVideosQuery,
  useGetPhotoAvatarGenerationsQuery,
  useGetVideoTranslationsQuery,
} from '../../store/api/projectsApi';
import {
  useDeleteGenerateAvatarVideoMutation,
  useDeletePhotoAvatarGenerationMutation,
  useDeleteVideoTranslationMutation,
  useDeleteImageUploadMutation,
  useGetAssetUploadsQuery,
} from '../../store/api/heygenApi';
import type { AssetUpload } from '../../store/api/heygenApi';
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

type TabType = 'videos' | 'avatars' | 'translations' | 'uploads';

export default function ProjectVedios() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProjectVedios'>>();
  const { projectId } = route.params || {};
  console.log('projectId', projectId);

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
  
  // State for tracking loaded images
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Delete mutations
  const [deleteVideo] = useDeleteGenerateAvatarVideoMutation();
  const [deleteAvatar] = useDeletePhotoAvatarGenerationMutation();
  const [deleteTranslation] = useDeleteVideoTranslationMutation();
  const [deleteUpload] = useDeleteImageUploadMutation();

  // State for delete confirmation
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'video' | 'avatar' | 'translation' | 'upload';
    id: string;
    name: string;
    videoId?: string; // For videos, we need video_id
  } | null>(null);

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
  console.log('videos',videos);
  
console.log('videos', videos);

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

  const {
    data: assetUploads,
    isLoading: isLoadingUploads,
    error: uploadsError,
    refetch: refetchUploads,
    isFetching: isFetchingUploads,
  } = useGetAssetUploadsQuery(
    { projectId: projectId || undefined },
    {
      skip: !projectId || activeTab !== 'uploads',
    },
  );

  // Get current data and loading state based on active tab
  const isLoading = useMemo(() => {
    if (activeTab === 'videos') return isLoadingVideos;
    if (activeTab === 'avatars') return isLoadingAvatars;
    if (activeTab === 'translations') return isLoadingTranslations;
    return isLoadingUploads;
  }, [activeTab, isLoadingVideos, isLoadingAvatars, isLoadingTranslations, isLoadingUploads]);

  const error = useMemo(() => {
    if (activeTab === 'videos') return videosError;
    if (activeTab === 'avatars') return avatarsError;
    if (activeTab === 'translations') return translationsError;
    return uploadsError;
  }, [activeTab, videosError, avatarsError, translationsError, uploadsError]);

  // Get current refetch function and fetching state based on active tab
  const refetch = useMemo(() => {
    if (activeTab === 'videos') return refetchVideos;
    if (activeTab === 'avatars') return refetchAvatars;
    if (activeTab === 'translations') return refetchTranslations;
    return refetchUploads;
  }, [activeTab, refetchVideos, refetchAvatars, refetchTranslations, refetchUploads]);

  const isRefreshing = useMemo(() => {
    if (activeTab === 'videos') return isFetchingVideos;
    if (activeTab === 'avatars') return isFetchingAvatars;
    if (activeTab === 'translations') return isFetchingTranslations;
    return isFetchingUploads;
  }, [activeTab, isFetchingVideos, isFetchingAvatars, isFetchingTranslations, isFetchingUploads]);

  // Handle pull to refresh
  const onRefresh = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      console.log('itemToDelete', itemToDelete);


      
      if (itemToDelete.type === 'video' && itemToDelete.videoId) {
        await deleteVideo(itemToDelete.videoId).unwrap();
      } else if (itemToDelete.type === 'avatar') {
        await deleteAvatar(itemToDelete.id).unwrap();
      } else if (itemToDelete.type === 'translation') {
        await deleteTranslation(itemToDelete.id).unwrap();
      } else if (itemToDelete.type === 'upload') {
        await deleteUpload(itemToDelete.id).unwrap();
      }

      showToast.success('Success', 'Item deleted successfully');
      setItemToDelete(null);
      // Refetch data
      await refetch();
    } catch (error: any) {
      console.error('[ProjectVedios] Delete error:', error);
      const errorMessage =
        error?.data?.message || error?.message || 'Failed to delete item';
      showToast.error('Error', errorMessage);
      setItemToDelete(null);
    }
  };

  // Handle delete button press
  const handleDeletePress = (
    type: 'video' | 'avatar' | 'translation' | 'upload',
    item: ProjectVideo | PhotoAvatarGeneration | VideoTranslation | AssetUpload,
    e: any,
  ) => {
    e.stopPropagation();

    if (type === 'video') {
      const videoItem = item as ProjectVideo;
      setItemToDelete({
        type: 'video',
        id: videoItem.id,
        name: videoItem.input_text.substring(0, 50) || 'Video',
        videoId: videoItem.video_id,
      });
    } else if (type === 'avatar') {
      const avatarItem = item as PhotoAvatarGeneration;
      setItemToDelete({
        type: 'avatar',
        id: avatarItem.id,
        name: avatarItem.name || 'Avatar',
      });
    } else if (type === 'translation') {
      const translationItem = item as VideoTranslation;
      setItemToDelete({
        type: 'translation',
        id: translationItem.id,
        name: translationItem.title || 'Translation',
      });
    } else if (type === 'upload') {
      const uploadItem = item as AssetUpload;
      setItemToDelete({
        type: 'upload',
        id: uploadItem.id,
        name: uploadItem.asset_id || 'Upload',
      });
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

  // Handle image load
  const handleImageLoad = (imageUrl: string) => {
    setLoadedImages(prev => new Set(prev).add(imageUrl));
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

    const isGifLoaded = hasGif ? loadedImages.has(gifUrl) : true;
    const isImageLoaded = !hasGif && item.avatar_photo_url ? loadedImages.has(item.avatar_photo_url) : true;

    return (
      <LiquidGlassBackground style={styles.projectCard}>
        {hasGif ? (
          // Show GIF if available - use View with Image for proper GIF animation
          <View style={styles.projectIconContainer}>
            {!isGifLoaded && (
              <View style={styles.imageShimmerContainer}>
                <Shimmer
                  width="100%"
                  height="100%"
                  borderRadius={12}
                />
              </View>
            )}
            <Image
              source={{ uri: gifUrl }}
              style={[
                styles.projectIconImage,
                !isGifLoaded && styles.hiddenImage,
              ]}
              resizeMode="cover"
              onLoad={() => handleImageLoad(gifUrl)}
            />
            {isCompleted && videoUrl && (
              <TouchableOpacity
                onPress={e => handleDeletePress('video', item, e)}
                style={styles.downloadIconTouchable}
                disabled={downloadingVideoId === item.id}
                activeOpacity={0.7}
              >
                <LiquidGlassBackground style={styles.downloadIcon}>
                  <View style={styles.downloadIconContainer}>
                    <Svgs.WhiteDelete
                      width={metrics.width(18)}
                      height={metrics.width(18)}
                    />
                  </View>
                </LiquidGlassBackground>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          // Show static image if no GIF
          <View style={styles.projectIcon}>
            {!isImageLoaded && item.avatar_photo_url && (
              <View style={styles.imageShimmerContainer}>
                <Shimmer
                  width="100%"
                  height="100%"
                  borderRadius={12}
                />
              </View>
            )}
            <ImageBackground
              source={{ uri: item.avatar_photo_url }}
              style={[
                styles.projectIconBackground,
                !isImageLoaded && styles.hiddenImage,
              ]}
              imageStyle={{ borderRadius: 12 }}
              onLoad={() => item.avatar_photo_url && handleImageLoad(item.avatar_photo_url)}
            >
            {isCompleted && videoUrl && (
              <TouchableOpacity
                onPress={e => handleDeletePress('video', item, e)}
                style={styles.downloadIconTouchable}
                disabled={downloadingVideoId === item.id}
                activeOpacity={0.7}
              >
                <LiquidGlassBackground style={styles.downloadIcon}>
                  <View style={styles.downloadIconContainer}>
                    <Svgs.WhiteDelete
                      width={metrics.width(18)}
                      height={metrics.width(18)}
                    />
                  </View>
                </LiquidGlassBackground>
              </TouchableOpacity>
            )}
            </ImageBackground>
          </View>
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
    const isImageLoaded = firstImage ? loadedImages.has(firstImage) : true;

    return (
      <LiquidGlassBackground style={styles.projectCard}>
        <View style={styles.projectIcon}>
          {!isImageLoaded && firstImage && (
            <View style={styles.imageShimmerContainer}>
              <Shimmer
                width="100%"
                height="100%"
                borderRadius={12}
              />
            </View>
          )}
          <ImageBackground
            source={{ uri: firstImage }}
            style={[
              styles.projectIconBackground,
              !isImageLoaded && styles.hiddenImage,
            ]}
            imageStyle={{ borderRadius: 12 }}
            onLoad={() => firstImage && handleImageLoad(firstImage)}
          >
          {isCompleted && firstImage && (
            <TouchableOpacity
              onPress={e => handleDeletePress('avatar', item, e)}
              style={styles.downloadIconTouchable}
              disabled={downloadingImageId === `${item.id}-0`}
              activeOpacity={0.7}
            >
              <LiquidGlassBackground style={styles.downloadIcon}>
                <TouchableOpacity
                  onPress={e => handleDeletePress('avatar', item, e)}
                  style={styles.deleteButton}
                  activeOpacity={0.7}
                >
                  <Svgs.WhiteDelete
                    width={metrics.width(20)}
                    height={metrics.width(20)}
                  />
                </TouchableOpacity>
              </LiquidGlassBackground>
            </TouchableOpacity>
          )}
          </ImageBackground>
        </View>
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
            <View style={styles.buttonRow}>
              <PrimaryButton
                title={hasMultipleImages ? 'Preview All' : 'Preview'}
                onPress={() => handleAvatarPreview(item)}
                extraContainerStyle={StyleSheet.flatten([
                  styles.buttonContainer,
                  styles.previewButton,
                ])}
                textStyle={styles.text}
              />
            </View>
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
              onPress={e => handleDeletePress('translation', item, e)}
              style={styles.downloadIconTouchable}
              disabled={downloadingVideoId === item.id}
              activeOpacity={0.7}
            >
              <LiquidGlassBackground style={styles.downloadIcon}>
                <View style={styles.downloadIconContainer}>
                  <Svgs.WhiteDelete
                    width={metrics.width(18)}
                    height={metrics.width(18)}
                  />
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

  // Render upload item function for FlatList
  const renderUploadItem = ({ item }: { item: AssetUpload }) => {
    const isImage = item.asset_type === 'image';
    const imageUrl = item.asset_url;
    const isImageLoaded = imageUrl ? loadedImages.has(imageUrl) : true;

    return (
      <LiquidGlassBackground style={styles.projectCard}>
        <View style={styles.projectIconContainer}>
          {!isImageLoaded && imageUrl && (
            <View style={styles.imageShimmerContainer}>
              <Shimmer
                width="100%"
                height="100%"
                borderRadius={12}
              />
            </View>
          )}
          {isImage && imageUrl ? (
            <ImageBackground
              source={{ uri: imageUrl }}
              style={[
                styles.projectIconBackground,
                !isImageLoaded && styles.hiddenImage,
              ]}
              imageStyle={{ borderRadius: 12 }}
              onLoad={() => imageUrl && handleImageLoad(imageUrl)}
            >
              <TouchableOpacity
                onPress={e => handleDeletePress('upload', item, e)}
                style={styles.downloadIconTouchable}
                activeOpacity={0.7}
              >
                <LiquidGlassBackground style={styles.downloadIcon}>
                  <TouchableOpacity
                    onPress={e => handleDeletePress('upload', item, e)}
                    style={styles.deleteButton}
                    activeOpacity={0.7}
                  >
                    <Svgs.WhiteDelete
                      width={metrics.width(20)}
                      height={metrics.width(20)}
                    />
                  </TouchableOpacity>
                </LiquidGlassBackground>
              </TouchableOpacity>
            </ImageBackground>
          ) : (
            <ImageBackground
              source={Images.VedioIcon2}
              style={styles.projectIcon}
              imageStyle={{ borderRadius: 12 }}
            >
              <TouchableOpacity
                onPress={e => handleDeletePress('upload', item, e)}
                style={styles.downloadIconTouchable}
                activeOpacity={0.7}
              >
                <LiquidGlassBackground style={styles.downloadIcon}>
                  <TouchableOpacity
                    onPress={e => handleDeletePress('upload', item, e)}
                    style={styles.deleteButton}
                    activeOpacity={0.7}
                  >
                    <Svgs.WhiteDelete
                      width={metrics.width(20)}
                      height={metrics.width(20)}
                    />
                  </TouchableOpacity>
                </LiquidGlassBackground>
              </TouchableOpacity>
            </ImageBackground>
          )}
        </View>
        <View style={styles.projectBodyCotainer}>
          <Text
            style={styles.projectTitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.asset_id || 'Asset'}
          </Text>
          <Text
            style={styles.subtitle}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {item.asset_type} • {item.content_type}
          </Text>
          <View style={styles.rowSpaceBetween}>
            <Text style={styles.status}>
              Uploaded
            </Text>
            <Text style={styles.statusTime}>
              {formatTimeAgo(item.createdAt)}
            </Text>
          </View>
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
    if (activeTab === 'translations') return translations || [];
    return assetUploads?.data || [];
  };

  const currentData = getCurrentData();

  // Render item based on active tab
  const renderItem = ({ item }: { item: any }) => {
    if (activeTab === 'videos')
      return renderVideoItem({ item: item as ProjectVideo });
    if (activeTab === 'avatars')
      return renderAvatarItem({ item: item as PhotoAvatarGeneration });
    if (activeTab === 'translations')
      return renderTranslationItem({ item: item as VideoTranslation });
    return renderUploadItem({ item: item as AssetUpload });
  };

  // Tabs list
  const tabs: TabType[] = ['videos', 'avatars', 'translations', 'uploads'];
  
  // Tab labels mapping
  const tabLabels: Record<TabType, string> = {
    videos: 'Videos',
    avatars: 'Avatars',
    translations: 'Translations',
    uploads: 'Uploads',
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <Header title="Project Videos" showBackButton />
</View>
        {/* Tab Bar with Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContainer}
          style={styles.tabScrollView}
        >
          {tabs.map(tab => (
            activeTab === tab ? (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, styles.activeTabText]}>
                  {tabLabels[tab]}
                </Text>
              </TouchableOpacity>
            ) : (
              <LiquidGlassBackground key={tab} style={styles.tab}>
                <TouchableOpacity
                  style={styles.tabContent}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={styles.tabText}>{tabLabels[tab]}</Text>
                </TouchableOpacity>
              </LiquidGlassBackground>
            )
          ))}
        </ScrollView>

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
                refreshing={isRefreshing && currentData.length > 0}
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
                refreshing={isRefreshing && currentData.length > 0}
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

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          visible={!!itemToDelete}
          text={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
          acceptButtonText="Delete"
          cancelButtonText="Cancel"
          onAccept={handleDeleteConfirm}
          onCancel={() => setItemToDelete(null)}
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
  headerContainer: {
    marginHorizontal: metrics.width(20),
  },
  flatList: {
    flex: 1,
    marginTop: metrics.width(20),
    marginHorizontal: metrics.width(20),
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
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  projectIconBackground: {
    height: '100%',
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
  tabScrollView: {
    maxHeight: metrics.width(50),
    marginTop: metrics.width(20),
    marginBottom: metrics.width(20),
  },
  tabScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: metrics.width(25),
    gap: metrics.width(10),
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
    borderRadius: 8,
    minWidth: metrics.width(80), // Fixed min width for horizontal scroll
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
    paddingHorizontal: metrics.width(15),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,

    minWidth: metrics.width(80),
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
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.width(8),
    marginTop: metrics.width(10),
  },
  playButton: {
    flex: 1,
  },
  previewButton: {
    flex: 1,
  },
  deleteButton: {
    padding: metrics.width(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
