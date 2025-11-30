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
  Image,
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
import { Header, LiquidGlassBackground, Shimmer } from '../../components/ui';
import { Images } from '../../assets/images';
import {
  HeygenAvatar,
  useLazyGetAllAvatarsQuery,
} from '../../store/api/heygenApi';
import { SelectedImage, selectImage, showToast } from '../../utils';

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

  const [getAllAvatars, { data, isLoading, isFetching, isError }] =
    useLazyGetAllAvatarsQuery();

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
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    null,
  );
  const [selectedCharacterPhoto, setSelectedCharacterPhoto] = useState<
    string | undefined
  >(undefined);
  // Track which images failed to load
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null,
  );
  const [isCustomImageSelected, setIsCustomImageSelected] = useState(false);

  const handleSelectImage = async () => {
    const imageData = await selectImage({
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
      mediaType: 'photo',
    });

    if (imageData) {
      setSelectedImage(imageData);
      setIsCustomImageSelected(true);
      setSelectedCharacter('custom-image');
      setSelectedCharacterPhoto(imageData.uri);
    }
  };

  const handleEditImage = () => {
    handleSelectImage();
  };

  const handleCustomImageSelect = () => {
    if (selectedImage) {
      setIsCustomImageSelected(true);
      setSelectedCharacter('custom-image');
      setSelectedCharacterPhoto(selectedImage.uri);
    } else {
      handleSelectImage();
    }
  };

  const handleDub = async () => {
    // Validation
    if (!selectedImage) {
      showToast.error('Error', 'Please select an image');
      return;
    }

    // Step 1: Upload image if selected but not yet uploaded
    if (selectedImage) {
      try {
        navigation.navigate('VoiceSelection', {
          avatarId: '1',
          avatar_photo_url: '',
          screenFrom: 'imageDubbing',
          image: selectedImage,
        });
      } catch (error: any) {
        console.error('[ImageDubbing] Image upload error:', error);
        const errorMessage =
          error?.data?.message || error?.message || 'Failed to upload image';
        showToast.error('Error', errorMessage);
        return; // Stop dubbing if image upload fails
      } finally {
      }
    }
  };
  const avatarRows = useMemo<
    (HeygenAvatar[] | 'custom-upload-with-first')[]
  >(() => {
    const rows: (HeygenAvatar[] | 'custom-upload-with-first')[] = [];

    // First row: custom upload + first avatar (if available)
    if (avatars.length > 0) {
      rows.push('custom-upload-with-first');
      // Then add remaining avatars starting from index 1
      for (let i = 1; i < avatars.length; i += 2) {
        rows.push(avatars.slice(i, i + 2));
      }
    } else {
      // If no avatars, just show custom upload
      rows.push('custom-upload-with-first');
    }

    return rows;
  }, [avatars]);

  // Create shimmer data for loading state
  const shimmerRows = useMemo(() => {
    return Array.from({ length: 6 }, () => null);
  }, []);

  // Combine custom upload with shimmer rows for loading state
  const listData = useMemo<
    (HeygenAvatar[] | 'custom-upload-with-first' | null)[]
  >(() => {
    if (isLoading && avatars.length === 0) {
      return shimmerRows;
    }
    return avatarRows;
  }, [isLoading, avatars.length, avatarRows, shimmerRows]);

  const handleImageError = (avatarId: string) => {
    setFailedImages(prev => new Set(prev).add(avatarId));
  };

  const handleCharacterSelect = (characterId: string) => {
    setSelectedCharacter(characterId);
    setIsCustomImageSelected(false);
  };

  const handleNavigateToCustomize = () => {
    navigation.navigate('CustomizeAvatar');
  };
  const handleNavigateNext = () => {
    if (!selectedCharacter) {
      Alert.alert(
        'Select a character',
        'Please choose a character to continue.',
      );
      return;
    }

    // Handle custom image selection
    if (selectedCharacter === 'custom-image' && selectedImage) {
      navigation.navigate('VoiceSelection', {
        avatarId: 'custom-image',
        image: selectedImage,
        isCustomImageSelected: true,
      });
    } else {
      navigation.navigate('VoiceSelection', {
        avatarId: selectedCharacter,
        avatar_photo_url: selectedCharacterPhoto,
        isCustomImageSelected: false,
      });
    }
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

  const renderCustomUploadItem = (showPlaceholder: boolean = true) => {
    const isSelected =
      isCustomImageSelected && selectedCharacter === 'custom-image';

    return (
      <TouchableOpacity
        onPress={handleCustomImageSelect}
        style={[styles.tempCharacher, isSelected && styles.selectedCharacter]}
        activeOpacity={0.8}
      >
        {selectedImage ? (
          <ImageBackground
            source={{ uri: selectedImage.uri }}
            style={styles.tempCharacherImage}
            resizeMode="cover"
          >
            <View style={styles.tempCharacherOverlay}>
              <Text style={styles.tempCharacherTitle}>Custom Image</Text>
              <TouchableOpacity
                style={styles.editButtonOverlay}
                onPress={e => {
                  e.stopPropagation();
                  handleEditImage();
                }}
              >
                <Svgs.EditAccountIcon
                  width={metrics.width(30)}
                  height={metrics.width(30)}
                />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        ) : (
          <LiquidGlassBackground style={styles.tempCharacherImage}>
            <View style={styles.customUploadContent}>
              <Image style={styles.uploadIcon} source={Images.UploadVedio} />
            </View>
          </LiquidGlassBackground>
        )}
      </TouchableOpacity>
    );
  };

  const renderFirstRowWithAvatar = () => {
    if (avatars.length === 0) {
      // If no avatars, show custom upload with placeholder
      return (
        <View style={styles.columnRow}>
          {renderCustomUploadItem()}
          <View
            pointerEvents="none"
            style={[styles.tempCharacher, styles.placeholderCard]}
          />
        </View>
      );
    }

    const firstAvatar = avatars[0];
    const isSelected = selectedCharacter === firstAvatar.avatar_id;
    const hasImageUrl =
      firstAvatar.preview_image_url &&
      firstAvatar.preview_image_url.trim() !== '' &&
      firstAvatar.preview_image_url !== 'null' &&
      firstAvatar.preview_image_url !== 'undefined';
    const imageFailed = failedImages.has(firstAvatar.avatar_id);
    const shouldUseFallback = !hasImageUrl || imageFailed;
    const imageSource = shouldUseFallback
      ? Images.TempCharacher
      : { uri: firstAvatar.preview_image_url };

    return (
      <View style={styles.columnRow}>
        {renderCustomUploadItem(false)}
        <TouchableOpacity
          onPress={() => {
            handleCharacterSelect(firstAvatar.avatar_id);
            setSelectedCharacterPhoto(firstAvatar.preview_image_url);
          }}
          style={[styles.tempCharacher, isSelected && styles.selectedCharacter]}
          activeOpacity={0.8}
        >
          <ImageBackground
            source={imageSource}
            style={styles.tempCharacherImage}
            onError={() => handleImageError(firstAvatar.avatar_id)}
            resizeMode="cover"
          >
            <View style={styles.tempCharacherOverlay}>
              <Text style={styles.tempCharacherTitle}>
                {firstAvatar.avatar_name}
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRow = ({
    item: row,
  }: {
    item: HeygenAvatar[] | 'custom-upload-with-first' | null;
  }) => {
    // If row is null, it's a shimmer placeholder
    if (row === null) {
      return renderShimmerRow();
    }

    // If row is 'custom-upload-with-first', render custom upload + first avatar
    if (row === 'custom-upload-with-first') {
      return renderFirstRowWithAvatar();
    }

    return (
      <View style={styles.columnRow}>
        {row.map(character => {
          const isSelected = selectedCharacter === character.avatar_id;
          const hasImageUrl =
            character.preview_image_url &&
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
              onPress={() => {
                handleCharacterSelect(character.avatar_id);
                setSelectedCharacterPhoto(character.preview_image_url);
              }}
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
                  <Text style={styles.tempCharacherTitle}>
                    {character.avatar_name}
                  </Text>
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
          Select from our collection of unique characters or upload your own
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
    if ((isLoading && avatars.length === 0) || data?.data?.length === 0) {
      return null;
    }

    if (isError && avatars.length === 0) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>Unable to load avatars</Text>
          <Text style={styles.stateSubtitle}>
            Check your connection or try again.
          </Text>
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
        <Header title="Chose Character" showBackButton />

        <FlatList
          data={listData}
          renderItem={renderRow}
          keyExtractor={(item, index) => {
            if (item === 'custom-upload-with-first')
              return 'custom-upload-with-first';
            if (item === null) return `shimmer-${index}`;
            return `row-${index}`;
          }}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderListFooter}
          ListEmptyComponent={renderListEmpty}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ItemSeparatorComponent={() => (
            <View style={{ height: metrics.width(15) }} />
          )}
          // refreshControl={
          //   <RefreshControl
          //     refreshing={isFetching && currentPage === 1&&avatars.length>0}
          //     onRefresh={handleRefresh}
          //     tintColor={colors.primary}
          //   />
          // }
        />
        <PrimaryButton
          title="Customize Avatar"
          onPress={handleNavigateToCustomize}
          variant="secondary"
          style={{
            marginBottom: metrics.width(15),
          }}
          //  disabled={!selectedCharacter}
        />
        <PrimaryButton
          title="Next"
          onPress={handleNavigateNext}
          variant="primary"
          style={{
            marginBottom: metrics.width(25),
          }}
          disabled={
            !selectedCharacter ||
            (selectedCharacter === 'custom-image' && !selectedImage)
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
    gap: metrics.width(15),
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
    gap: metrics.width(15),
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
  customUploadContent: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: metrics.width(10),
    padding: metrics.width(20),
    height: '100%',
    width: '100%',
  },
  uploadIcon: {
    height: metrics.width(50),
    width: metrics.width(50),
    resizeMode: 'contain',
  },
  customUploadText: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(14),
    color: colors.white,
    textAlign: 'center',
  },
  editButtonOverlay: {
    position: 'absolute',
    top: metrics.width(7),
    right: metrics.width(8),
    backgroundColor: colors.primary,
    width: metrics.width(32),
    height: metrics.width(32),
    borderRadius: metrics.width(16),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  imageUploadContainer: {
    marginBottom: metrics.width(20),
  },
  imageUploadLabel: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(14),
    color: colors.white,
    marginBottom: metrics.width(10),
  },
  required: {
    color: colors.primary,
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: metrics.width(200),
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: metrics.width(100),
  },
  uploadingText: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(14),
    color: colors.white,
  },
  editImageButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    backgroundColor: colors.primary,
    width: metrics.width(36),
    height: metrics.width(36),
    borderRadius: metrics.width(18),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageSelectorContainer: {
    width: '100%',
    height: metrics.width(200),
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSelectorContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: metrics.width(10),
    padding: metrics.width(15),
  },
  image: {
    height: metrics.width(60),
    width: metrics.width(60),
  },
  imageSelectorText: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(14),
    color: colors.white,
    textAlign: 'center',
  },
  descriptionContainer: {
    marginTop: metrics.width(15),
  },
});
