import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { Svgs } from '../../assets/icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, Shimmer } from '../../components/ui';
import { HeygenVoice, useLazyGetAllVoicesQuery } from '../../store/api/heygenApi';
import SoundPlayer from 'react-native-sound-player';

type VoiceSelectionNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'VoiceSelection'
>;

const ITEMS_PER_PAGE = 10;

export default function VoiceSelection() {
  const navigation = useNavigation<VoiceSelectionNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'VoiceSelection'>>();
  const { avatarId, screenFrom, projectId,avatar_photo_url } = route?.params as { avatarId: string; screenFrom?: string; projectId?: string,avatar_photo_url  ?: string };
  console.log('avatarId', avatarId);
  console.log('screenFrom', screenFrom);
  const [currentPage, setCurrentPage] = useState(1);
  const [allVoices, setAllVoices] = useState<HeygenVoice[]>([]);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const [getAllVoices, {
    data,
    isLoading,
    isFetching,
    isError,
  }] = useLazyGetAllVoicesQuery();

  // Initial load
  useEffect(() => {
    getAllVoices({ page: 1, limit: ITEMS_PER_PAGE });
  }, []);

  // Update voices when new data arrives
  useEffect(() => {
    if (data) {
      if (currentPage === 1) {
        // First page - replace all voices
        setAllVoices(data.data);
      } else {
        // Subsequent pages - append new voices
        setAllVoices(prev => [...prev, ...data.data]);
      }
      setHasMorePages(data.pagination.hasNextPage);
      setIsLoadingMore(false);
    }
  }, [data, currentPage]);

  const voices = allVoices;
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  // Create shimmer data for loading state
  const shimmerRows = useMemo(() => {
    return Array.from({ length: 6 }, () => null);
  }, []);

  // Handle audio finished playing
  useEffect(() => {
    const subscription = SoundPlayer.addEventListener('FinishedPlaying', () => {
      setPlayingIndex(null);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      try {
        SoundPlayer.stop();
      } catch (error) {
        // Ignore errors when stopping
      }
    };
  }, []);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMorePages && !isFetching && voices.length > 0) {
      const nextPage = currentPage + 1;
      setIsLoadingMore(true);
      setCurrentPage(nextPage);
      getAllVoices({ page: nextPage, limit: ITEMS_PER_PAGE });
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    setAllVoices([]);
    setHasMorePages(true);
    getAllVoices({ page: 1, limit: ITEMS_PER_PAGE });
  };

  const handlePlayPause = (voice: HeygenVoice, index: number) => {
    if (!voice.preview_audio) {
      Alert.alert('No Preview', 'This voice does not have a preview audio available.');
      return;
    }

    try {
      if (playingIndex === index) {
        // Pause current voice
        SoundPlayer.pause();
        setPlayingIndex(null);
      } else {
        // Stop any currently playing voice
        if (playingIndex !== null) {
          try {
            SoundPlayer.stop();
          } catch (error) {
            // Ignore stop errors
          }
        }
        // Play new voice
        SoundPlayer.playUrl(voice.preview_audio);
        setPlayingIndex(index);
      }
    } catch (error: any) {
      console.error('[VoiceSelection] Audio error:', error);
      Alert.alert('Playback Error', 'Failed to play audio preview. Please try again.');
      setPlayingIndex(null);
    }
  };

  const renderShimmerItem = () => {
    return (
      <View style={styles.voiceCard}>
        <View style={styles.voiceInfo}>
          <Shimmer
            width={metrics.width(150)}
            height={metrics.width(18)}
            borderRadius={4}
            style={{ marginBottom: metrics.width(8) }}
          />
          <View style={styles.voiceMeta}>
            <Shimmer
              width={metrics.width(80)}
              height={metrics.width(14)}
              borderRadius={4}
            />
            <Shimmer
              width={metrics.width(60)}
              height={metrics.width(14)}
              borderRadius={4}
              style={{ marginLeft: metrics.width(8) }}
            />
          </View>
        </View>
        <Shimmer
          width={metrics.width(48)}
          height={metrics.width(48)}
          borderRadius={metrics.width(24)}
        />
      </View>
    );
  };

  const renderVoiceItem = ({ item: voice, index }: { item: HeygenVoice | null; index: number }) => {
    // If item is null, it's a shimmer placeholder
    if (voice === null) {
      return renderShimmerItem();
    }

    const isPlaying = playingIndex === index;
    const hasPreview = !!voice.preview_audio;

    return (
      <TouchableOpacity
        style={styles.voiceCard}
        onPress={() => {
          navigation.navigate('DescribeCharacter', {
            avatarId,
            voiceId: voice.voice_id,
            screenFrom,
            projectId,
            avatar_photo_url,
          });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.voiceInfo}>
          <Text style={styles.voiceName}>{voice.name}</Text>
          <View style={styles.voiceMeta}>
            {voice.gender && (
              <Text style={styles.voiceMetaText}>{voice.gender}</Text>
            )}
            {voice.language && (
              <Text style={styles.voiceMetaText}> • {voice.language}</Text>
            )}
            {voice.language && (
              <Text style={styles.voiceMetaText}> ({voice.language})</Text>
            )}
          </View>
          
        </View>
        <TouchableOpacity
          style={[
            styles.playButton,
            !hasPreview && styles.playButtonDisabled,
            isPlaying && styles.playButtonActive,
          ]}
          onPress={(e) => {
            e.stopPropagation();
            handlePlayPause(voice, index);
          }}
          disabled={!hasPreview}
          activeOpacity={0.7}
        >
          {isPlaying ? (
            <View style={styles.pauseIcon}>
              <View style={styles.pauseBar} />
              <View style={styles.pauseBar} />
            </View>
          ) : (
            <Svgs.PlayIcon
              height={metrics.width(20)}
              width={metrics.width(20)}
              color={colors.white}
            />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderListHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Select Voice</Text>
        <Text style={styles.subTitle}>
          Preview and choose from our collection of voices
        </Text>
      </View>
    );
  };

  const renderListFooter = () => {
    if ((isLoadingMore || isFetching) && hasMorePages && voices.length > 0) {
      return (
        <View style={styles.loadMoreContainer}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.loadMoreText}>Loading more voices...</Text>
        </View>
      );
    }
    return null;
  };

  const handleEndReached = () => {
    if (!isLoadingMore && hasMorePages && !isFetching && voices.length > 0) {
      handleLoadMore();
    }
  };

  const renderListEmpty = () => {
    // Shimmer is now shown in the FlatList data, so we don't need it here
    if (isLoading && voices.length === 0) {
      return null;
    }

    if (isError && voices.length === 0) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>Unable to load voices</Text>
          <Text style={styles.stateSubtitle}>Check your connection or try again.</Text>
        </View>
      );
    }

    if (!voices.length) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>No voices available</Text>
          <Text style={styles.stateSubtitle}>Please try again later.</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Voice Selection"
          showBackButton
          
        />
        <FlatList
          data={isLoading && voices.length === 0 ? shimmerRows : voices}
          renderItem={renderVoiceItem}
          keyExtractor={(item, index) => `voice-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderListFooter}
          ListEmptyComponent={renderListEmpty}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && currentPage === 1}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
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
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerContainer: {
    marginTop: metrics.width(30),
    marginBottom: metrics.width(20),
  },
  title: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(20),
    color: colors.white,
    marginBottom: metrics.width(8),
  },
  subTitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(15),
    color: colors.subtitle,
  },
  voiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white10 ?? 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: metrics.width(16),
    marginBottom: metrics.width(12),
    borderWidth: 1,
    borderColor: colors.white15 ?? 'rgba(255,255,255,0.15)',
  },
  voiceInfo: {
    flex: 1,
    marginRight: metrics.width(12),
  },
  voiceName: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(16),
    color: colors.white,
    marginBottom: metrics.width(4),
  },
  voiceMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: metrics.width(8),
  },
  voiceMetaText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: metrics.width(6),
  },
  tag: {
    backgroundColor: colors.primary40 ?? 'rgba(254, 44, 11, 0.4)',
    paddingHorizontal: metrics.width(8),
    paddingVertical: metrics.width(4),
    borderRadius: 8,
  },
  tagText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(11),
    color: colors.white,
  },
  playButton: {
    width: metrics.width(48),
    height: metrics.width(48),
    borderRadius: metrics.width(24),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: {
    backgroundColor: colors.primary,
    opacity: 0.9,
  },
  playButtonDisabled: {
    backgroundColor: colors.inactiveButton,
    opacity: 0.5,
  },
  pauseIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: metrics.width(4),
  },
  pauseBar: {
    width: metrics.width(5),
    height: metrics.width(16),
    backgroundColor: colors.white,
    borderRadius: 1,
  },
  stateContainer: {
    borderRadius: 16,
    backgroundColor: colors.white10 ?? 'rgba(255,255,255,0.08)',
    paddingHorizontal: metrics.width(20),
    paddingVertical: metrics.width(30),
    alignItems: 'center',
    gap: metrics.width(10),
    marginTop: metrics.width(40),
  },
  stateTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(16),
    color: colors.white,
    textAlign: 'center',
  },
  stateSubtitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
    textAlign: 'center',
  },
  loadMoreContainer: {
    marginTop: metrics.width(20),
    marginBottom: metrics.width(10),
    alignItems: 'center',
    justifyContent: 'center',
    gap: metrics.width(8),
  },
  loadMoreText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
  },
});

