import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, LiquidGlassBackground } from '../../components/ui';
import { useTranslation } from 'react-i18next';

type VideoHistoryNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

interface VideoEntry {
  id: string;
  title: string;
  duration: string;
  fileSize: string;
  status: 'processing' | 'completed' | 'failed';
  time: string;
}

interface VideoSection {
  title: string;
  videos: VideoEntry[];
}

export default function VideoHistory() {
  const navigation = useNavigation<VideoHistoryNavigationProp>();
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const { t } = useTranslation();

  // Video data organized by sections
  const videoSections: VideoSection[] = useMemo(
    () => [
      {
        title: t('videoHistory.sections.today'),
        videos: [
          {
            id: '1',
            title: t('videoHistory.sampleTitle'),
            duration: '2:34 min',
            fileSize: '8.5 MB',
            status: 'processing',
            time: '10:00 pm',
          },
          {
            id: '2',
            title: t('videoHistory.sampleTitle'),
            duration: '2:34 min',
            fileSize: '8.5 MB',
            status: 'completed',
            time: '10:00 am',
          },
        ],
      },
      {
        title: t('videoHistory.sections.thisWeek'),
        videos: [
          {
            id: '3',
            title: t('videoHistory.sampleTitle'),
            duration: '2:34 min',
            fileSize: '8.5 MB',
            status: 'failed',
            time: '09:45 am',
          },
          {
            id: '4',
            title: t('videoHistory.sampleTitle'),
            duration: '2:34 min',
            fileSize: '8.5 MB',
            status: 'completed',
            time: '08:10 am',
          },
        ],
      },
      {
        title: t('videoHistory.sections.earlier'),
        videos: [
          {
            id: '5',
            title: t('videoHistory.sampleTitle'),
            duration: '2:34 min',
            fileSize: '8.5 MB',
            status: 'processing',
            time: 'Yesterday',
          },
        ],
      },
    ],
    [t],
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.sucessGreen;
      case 'processing':
        return '#FFA500'; // Yellow/Orange
      case 'failed':
        return '#FF6B6B'; // Red
      default:
        return colors.subtitle;
    }
  };

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const renderVideoEntry = (video: VideoEntry) => (
    <LiquidGlassBackground 
      key={video.id} 
      style={[
        styles.videoCard,
        selectedVideos.includes(video.id) && styles.selectedCard
      ]}
    >
      <TouchableOpacity
        style={styles.videoRow}
        onPress={() => {}}
      >
        <View style={styles.videoContent}>
          <Text style={styles.videoTitle}>{video.title}</Text>
          <View style={styles.videoDetails}>
            <Text style={styles.videoDetail}>{video.duration}</Text>
            <View style={styles.dot} />
            <Text style={styles.videoDetail}>{video.fileSize}</Text>
          </View>
        </View>
        <View style={styles.videoRight}>
          <Text style={[styles.videoStatus, { color: getStatusColor(video.status) }]}>
            {t(`videoHistory.statusLabels.${video.status}`)}
          </Text>
          <Text style={styles.videoTime}>{video.time}</Text>
        </View>
      </TouchableOpacity>
    </LiquidGlassBackground>
  );

  const renderSection = (section: VideoSection) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.videoList}>
        {section.videos.map(renderVideoEntry)}
      </View>
    </View>
  );

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title={t('videoHistory.headerTitle')} showBackButton />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {videoSections.map(renderSection)}
        </ScrollView>
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
    paddingTop: metrics.width(20),
  },
  section: {
    marginBottom: metrics.width(29),
  },
  sectionTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(15),
    color: colors.white,
    marginBottom: metrics.width(12),
  },
  videoList: {
    gap: metrics.width(10),
  },
  videoCard: {
    borderRadius: 12,
    paddingHorizontal: metrics.width(15),
    paddingVertical: metrics.width(12),
  },
  selectedCard: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  videoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  videoContent: {
    flex: 1,
    gap: metrics.width(8),
  },
  videoTitle: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(15),
    color: colors.white,
  },
  videoDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.width(8),
  },
  videoDetail: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
  },
  dot: {
    width: metrics.width(4),
    height: metrics.width(4),
    borderRadius: 2,
    backgroundColor: colors.white,
  },
  videoRight: {
    alignItems: 'flex-end',
    gap: metrics.width(4),
  },
  videoStatus: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(13),
  },
  videoTime: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(11),
    color: colors.subtitle,
  },
});
