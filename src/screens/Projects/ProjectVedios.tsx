import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Image,
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
} from '../../components/ui';
import { Images } from '../../assets/images';
import { useGetProjectVideosQuery } from '../../store/api/projectsApi';
import type { ProjectVideo } from '../../store/api/projectsApi';
import { downloadVideo, DownloadProgress } from '../../utils/videoDownloader';
import { showToast } from '../../utils/toast';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function ProjectVedios() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProjectVedios'>>();
  const { projectId } = route.params || {};

  // State for tracking downloads
  const [downloadingVideoId, setDownloadingVideoId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});

  // Fetch project videos from API
  const { data: videos, isLoading, error } = useGetProjectVideosQuery(projectId || '', {
    skip: !projectId,
  });

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
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
  const handleDownloadVideo = async (video: ProjectVideo) => {
    const videoUrl = video.video_url || video.gcs_signed_url;
    
    if (!videoUrl) {
      showToast.error('Error', 'No video URL available');
      return;
    }

    if (downloadingVideoId === video.id) {
      return; // Prevent multiple simultaneous downloads
    }

    setDownloadingVideoId(video.id);
    setDownloadProgress(prev => ({ ...prev, [video.id]: 0 }));

    try {
      const result = await downloadVideo(
        videoUrl,
        `project_video_${video.video_id}_${Date.now()}.mp4`,
        (progress: DownloadProgress) => {
          const percent = Math.round(progress.progress * 100);
          setDownloadProgress(prev => ({ ...prev, [video.id]: percent }));
        }
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
        delete newProgress[video.id];
        return newProgress;
      });
    }
  };

  // Render video item function for FlatList
  const renderVideoItem = ({ item }: { item: ProjectVideo }) => {
    const statusDisplay = getStatusDisplay(item.status);
    const isCompleted = item.status.toLowerCase() === 'completed';
    
    return (
      <LiquidGlassBackground style={styles.projectCard}>
        <ImageBackground 
          source={{ uri: item.avatar_photo_url }} 
          style={styles.projectIcon}
          imageStyle={{ borderRadius: 12 }}
        >
          {isCompleted && (
            <TouchableOpacity
              onPress={() => handleDownloadVideo(item)}
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
            {item.input_text.substring(0, 50)}...
          </Text>
          <Text style={styles.subtitle}>{item.emotion} • {item.speed}x</Text>
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
            <Text style={styles.statusTime}>{formatTimeAgo(item.updatedAt)}</Text>
          </View>
          <PrimaryButton
            title="Play"
            onPress={() => {
              if (isCompleted && item.video_url) {
                navigation.navigate('PreViewVedio', {
                  video_url: item.video_url,
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
      <Shimmer
        width="100%"
        height={metrics.width(140)}
        borderRadius={12}
      />
      <View style={styles.projectBodyCotainer}>
        <Shimmer width="100%" height={metrics.width(18)} borderRadius={4} />
        <Shimmer width="60%" height={metrics.width(14)} borderRadius={4} style={{ marginTop: metrics.width(5) }} />
        <View style={[styles.rowSpaceBetween, { marginTop: metrics.width(5) }]}>
          <Shimmer width={metrics.width(60)} height={metrics.width(12)} borderRadius={4} />
          <Shimmer width={metrics.width(80)} height={metrics.width(12)} borderRadius={4} />
        </View>
        <Shimmer width="100%" height={metrics.width(35)} borderRadius={8} style={{ marginTop: metrics.width(10) }} />
      </View>
    </LiquidGlassBackground>
  );

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Project Videos" showBackButton />

        {isLoading ? (
          <FlatList
            data={[1, 2, 3, 4]}
            renderItem={renderShimmerItem}
            keyExtractor={(item) => `shimmer-${item}`}
            numColumns={2}
            columnWrapperStyle={styles.row}
            style={styles.flatList}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load videos</Text>
          </View>
        ) : videos && videos.length > 0 ? (
          <FlatList
            data={videos}
            renderItem={renderVideoItem}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            style={styles.flatList}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No videos found</Text>
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
    justifyContent: 'space-between',
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
    flex: 1,
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
    top:10,
    borderRadius: 8,
    justifyContent:'center',
    alignItems:'center',
    position:'absolute',
  },
  downloadIconTouchable: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  downloadIconContainer:{
    height: 28,
    width: 28,
    justifyContent:'center',
    alignItems:'center'
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
});
