import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
  Alert,
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
import { Header, Shimmer } from '../../components/ui';
import { Images } from '../../assets/images';
import { HeygenAvatar, useLazyGetAllAvatarsQuery } from '../../store/api/heygenApi';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

const ITEMS_PER_PAGE = 10;

export default function ChoseCharacter() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [currentPage, setCurrentPage] = useState(1);
  const [allAvatars, setAllAvatars] = useState<HeygenAvatar[]>([]);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const [getAllAvatars, {
    data,
    isLoading,
    isFetching,
    isError,
  }] = useLazyGetAllAvatarsQuery();

  // Initial load
  useEffect(() => {
    getAllAvatars({ page: 1, limit: ITEMS_PER_PAGE });
  }, []);

  // Update avatars when new data arrives
  useEffect(() => {
    if (data) {
      if (currentPage === 1) {
        // First page - replace all avatars
        setAllAvatars(data.data);
      } else {
        // Subsequent pages - append new avatars
        setAllAvatars(prev => [...prev, ...data.data]);
      }
      setHasMorePages(data.pagination.hasNextPage);
      setIsLoadingMore(false);
    }
  }, [data, currentPage]);

  const avatars = allAvatars;
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  // Track which images failed to load
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const avatarRows = useMemo<HeygenAvatar[][]>(() => {
    const rows: HeygenAvatar[][] = [];
    for (let i = 0; i < avatars.length; i += 2) {
      rows.push(avatars.slice(i, i + 2));
    }
    return rows;
  }, [avatars]);

  // Create shimmer data for loading state
  const shimmerRows = useMemo(() => {
    return Array.from({ length: 6 }, () => null);
  }, []);

  const handleImageError = (avatarId: string) => {
    setFailedImages(prev => new Set(prev).add(avatarId));
  };

  const handleCharacterSelect = (characterId: string) => {
    setSelectedCharacter(characterId);
  };

  const handleNavigateToCustomize = () => {
    if (!selectedCharacter) {
      Alert.alert('Select a character', 'Please choose a character to continue.');
      return;
    }

    navigation.navigate('CustomizeAvatar', { avatarId: selectedCharacter });
  };
  const handleNavigateNext = () => {
    if (!selectedCharacter) {
      Alert.alert('Select a character', 'Please choose a character to continue.');
      return;
    }

    navigation.navigate('VoiceSelection', { avatarId: selectedCharacter });
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMorePages && !isFetching && avatars.length) {
      const nextPage = currentPage + 1;
      setIsLoadingMore(true);
      setCurrentPage(nextPage);
      getAllAvatars({ page: nextPage, limit: ITEMS_PER_PAGE });
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    setAllAvatars([]);
    setHasMorePages(true);
    setFailedImages(new Set()); // Reset failed images on refresh
    getAllAvatars({ page: 1, limit: ITEMS_PER_PAGE });
  };

  const handleEndReached = () => {
    if (!isLoadingMore && hasMorePages && !isFetching && avatars.length > 0) {
      handleLoadMore();
    }
  };

  const renderShimmerRow = () => {
    return (
      <View style={styles.columnRow}>
        <Shimmer
          width="48%"
          height={metrics.screenWidth * 0.41}
          borderRadius={16}
        />
        <Shimmer
          width="48%"
          height={metrics.screenWidth * 0.41}
          borderRadius={16}
        />
      </View>
    );
  };

  const renderRow = ({ item: row }: { item: HeygenAvatar[] | null }) => {
    // If row is null, it's a shimmer placeholder
    if (row === null) {
      return renderShimmerRow();
    }
    return (
      <View style={styles.columnRow}>
        {row.map(character => {
          const isSelected = selectedCharacter === character.avatar_id;
          const hasImageUrl = character.preview_image_url && 
                            character.preview_image_url.trim() !== '' &&
                            character.preview_image_url !== 'null' &&
                            character.preview_image_url !== 'undefined';
          const imageFailed = failedImages.has(character.avatar_id);
          const shouldUseFallback = !hasImageUrl || imageFailed;
          const imageSource = shouldUseFallback 
            ? Images.TempCharacher
            : { uri: character.preview_image_url };

          return (
            <TouchableOpacity
              key={character.avatar_id}
              onPress={() => handleCharacterSelect(character.avatar_id)}
              style={[
                styles.tempCharacher,
                isSelected && styles.selectedCharacter,
              ]}
              activeOpacity={0.8}
            >
              <ImageBackground
                source={imageSource}
                style={styles.tempCharacherImage}
                onError={() => handleImageError(character.avatar_id)}
                resizeMode="cover"
              >
                <View style={styles.tempCharacherOverlay}>
                  <Text style={styles.tempCharacherTitle}>{character.avatar_name}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          );
        })}
        {row.length === 1 ? (
          <View
            pointerEvents="none"
            style={[styles.tempCharacher, styles.placeholderCard]}
          />
        ) : null}
      </View>
    );
  };

  const renderListHeader = () => {
    return (
      <View style={styles.dashboardContainer}>
        <Text style={styles.title}>Choose your Character</Text>
        <Text style={styles.subTitle}>
          Select from our collection of unique characters
        </Text>
      </View>
    );
  };

  const renderListFooter = () => {
    if ((isLoadingMore || isFetching) && hasMorePages && avatars.length > 0) {
      return (
        <View style={styles.loadMoreContainer}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.loadMoreText}>Loading more avatars...</Text>
        </View>
      );
    }
    return null;
  };

  const renderListEmpty = () => {
    // Shimmer is now shown in the FlatList data, so we don't need it here
    if (isLoading && avatars.length === 0) {
      return null;
    }

    if (isError && avatars.length === 0) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>Unable to load avatars</Text>
          <Text style={styles.stateSubtitle}>Check your connection or try again.</Text>
          <PrimaryButton
            title="Retry"
            onPress={handleRefresh}
            variant="secondary"
            style={styles.retryButton}
          />
        </View>
      );
    }

    if (!avatars.length) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>No avatars available</Text>
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
          title="Chose Character"
          showBackButton
          RigthIcon={
            <Svgs.HistoryIcon
              height={metrics.width(20)}
              width={metrics.width(20)}
            />
          }
        />
        <FlatList
          data={isLoading && avatars.length === 0 ? shimmerRows : avatarRows}
          renderItem={renderRow}
          keyExtractor={(item, index) => `row-${index}`}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderListFooter}
          ListEmptyComponent={renderListEmpty}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ItemSeparatorComponent={() => <View style={{ height: metrics.width(15) }} />}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && currentPage === 1}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
        <PrimaryButton
          title="Customize Avatar"
          onPress={handleNavigateToCustomize}
          variant='secondary'
          style={{
            marginBottom: metrics.width(15),
          }}
          disabled={!selectedCharacter}
        />
        <PrimaryButton
          title="Next"
          onPress={handleNavigateNext}
          variant="primary"
          style={{
            marginBottom: metrics.width(25),
          }}
          disabled={!selectedCharacter}
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
    fontSize: metrics.width(20),
    color: colors.white,
  },
  subTitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(15),
    color: colors.subtitle,
    marginBottom: metrics.width(30),
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
    marginTop: metrics.width(30),
  },
  dashboardCard: {
    paddingHorizontal: metrics.width(16),
    paddingVertical: metrics.width(22),
    borderRadius: 12,
    backgroundColor: colors.white15,
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
  columnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap:metrics.width(15)
  },
  tempCharacherTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(16),
    color: colors.white,
  },
  tempCharacherSubtitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.white,
    marginTop: metrics.width(4),
  },
  tempCharacher: {
    height: metrics.screenWidth * 0.41,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    flex: 1,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  tempCharacherImage: {
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
  },
  tempCharacherOverlay: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: metrics.width(12),
    paddingVertical: metrics.width(10),
  },
  selectedCharacter: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tempCharacherContainer: {
    gap: metrics.width(15)
  },
  stateContainer: {
    borderRadius: 16,
    backgroundColor: colors.white10 ?? 'rgba(255,255,255,0.08)',
    paddingHorizontal: metrics.width(20),
    paddingVertical: metrics.width(30),
    alignItems: 'center',
    gap: metrics.width(10),
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
  retryButton: {
    width: '100%',
  },
  placeholderCard: {
    backgroundColor: colors.white5 ?? 'rgba(255,255,255,0.05)',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.white15 ?? 'rgba(255,255,255,0.15)',
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