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
import {
  Header,
  LiquidGlassBackground,
  Shimmer,
  Input,
  CustomDropdown,
} from '../../components/ui';
import { Images } from '../../assets/images';
import {
  HeygenAvatar,
  useLazyGetAllAvatarsQuery,
  GroupedAvatar,
  GetGroupedAvatarsResponse,
  GetGroupedAvatarsRequest,
} from '../../store/api/heygenApi';
import {
  API_BASE_URL,
  API_VERSION_PREFIX,
  API_ENDPOINTS,
} from '../../constants/api';
import { tokenStorage } from '../../utils/tokenStorage';
import { SelectedImage, selectImage, showToast } from '../../utils';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

const ITEMS_PER_PAGE = 10;

export default function ChoseCharacter() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [currentPage, setCurrentPage] = useState(1);
  const [allGroupedAvatars, setAllGroupedAvatars] = useState<GroupedAvatar[]>(
    [],
  );
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedGender, setSelectedGender] = useState<
    'male' | 'female' | 'all'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState<GetGroupedAvatarsResponse | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      setAllGroupedAvatars([]);
      fetchGroupedAvatars(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedGender]);

  // Initial load
  useEffect(() => {
    fetchGroupedAvatars(1);
  }, []);

  const fetchGroupedAvatars = async (page: number) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsFetching(true);
      }
      setIsError(false);

      // Get auth token
      const token = await tokenStorage.getAccessToken();

      // Build query parameters
      const params: GetGroupedAvatarsRequest = {
        page,
        limit: ITEMS_PER_PAGE,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedGender !== 'all' && { gender: selectedGender }),
      };

      // Build URL with query parameters
      const queryString = new URLSearchParams();
      if (params.page) queryString.append('page', params.page.toString());
      if (params.limit) queryString.append('limit', params.limit.toString());
      if (params.gender) queryString.append('gender', params.gender);
      if (params.search) queryString.append('search', params.search);

      const url = `${API_BASE_URL}${API_VERSION_PREFIX}${
        API_ENDPOINTS.HEYGEN.GET_GROUPED_AVATARS
      }?${queryString.toString()}`;

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      if (token) {
        headers['authorization'] = `Bearer ${token}`;
      }

      // Make the API call
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const responseData: GetGroupedAvatarsResponse = await response.json();
      setData(responseData);
    } catch (error) {
      console.error('[ChoseCharacter] Error fetching grouped avatars:', error);
      setIsError(true);
      setData(null);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  // Update avatars when new data arrives
  useEffect(() => {
    if (data) {
      if (currentPage === 1) {
        // First page - replace all avatars
        setAllGroupedAvatars(data.data);
      } else {
        // Subsequent pages - append new avatars
        setAllGroupedAvatars(prev => [...prev, ...data.data]);
      }
      setHasMorePages(data.pagination.hasNextPage);
      setIsLoadingMore(false);
    }
  }, [data, currentPage]);

  const [selectedGroupedAvatar, setSelectedGroupedAvatar] =
    useState<GroupedAvatar | null>(null);
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
  // Track which images have loaded
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleSelectImage = async () => {
    const imageData = await selectImage({
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
      mediaType: 'photo',
    });

    if (imageData) {
      setSelectedImage(imageData);
      // setIsCustomImageSelected(true);
      //  setSelectedCharacter('custom-image');
      //  setSelectedCharacterPhoto(imageData.uri);
      // navigation.navigate('VoiceSelection', {
      //   avatarId: 'custom-image',
      //   image: {
      //     uri: imageData.uri,
      //     type: imageData.type || 'image/jpeg',
      //     name: imageData.name || 'image.jpg',
      //   },
      //   isCustomImageSelected: true,
      // });
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
      navigation.navigate('VoiceSelection', {
        avatarId: 'custom-image',
        image: selectedImage,
        isCustomImageSelected: true,
      });
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
  // Create rows for grouped avatars (2 per row)
  const groupedAvatarRows = useMemo(() => {
    const rows: (GroupedAvatar[] | 'custom-upload-with-first')[] = [];

    // First row: custom upload + first grouped avatar (if available)
    if (allGroupedAvatars.length > 0) {
      rows.push('custom-upload-with-first');
      // Then add remaining grouped avatars starting from index 1
      for (let i = 1; i < allGroupedAvatars.length; i += 2) {
        rows.push(allGroupedAvatars.slice(i, i + 2));
      }
    } else {
      // If no avatars, just show custom upload
      rows.push('custom-upload-with-first');
    }

    return rows;
  }, [allGroupedAvatars]);

  // Create shimmer data for loading state
  const shimmerRows = useMemo(() => {
    return Array.from({ length: 6 }, () => null);
  }, []);

  // Combine custom upload with shimmer rows for loading state
  const listData = useMemo<
    (GroupedAvatar[] | 'custom-upload-with-first' | null)[]
  >(() => {
    // Show shimmer when loading or fetching and no data yet
    if ((isLoading || isFetching) && allGroupedAvatars.length === 0) {
      return shimmerRows;
    }
    return groupedAvatarRows;
  }, [
    isLoading,
    isFetching,
    allGroupedAvatars.length,
    groupedAvatarRows,
    shimmerRows,
  ]);

  const handleImageError = (avatarId: string) => {
    setFailedImages(prev => new Set(prev).add(avatarId));
  };

  // Handle image load
  const handleImageLoad = (imageUrl: string) => {
    setLoadedImages(prev => new Set(prev).add(imageUrl));
  };

  const handleGroupedAvatarSelect = (groupedAvatar: GroupedAvatar) => {
    setSelectedGroupedAvatar(groupedAvatar);
    // Navigate to variant selection screen
    navigation.navigate('AvatarVariants', {
      groupedAvatar,
    });
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
    if (
      !isLoadingMore &&
      hasMorePages &&
      !isFetching &&
      allGroupedAvatars.length
    ) {
      const nextPage = currentPage + 1;
      setIsLoadingMore(true);
      setCurrentPage(nextPage);
      fetchGroupedAvatars(nextPage);
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    setAllGroupedAvatars([]);
    setHasMorePages(true);
    setFailedImages(new Set()); // Reset failed images on refresh
    fetchGroupedAvatars(1);
  };

  const handleGenderChange = (gender: string) => {
    setSelectedGender(gender as 'male' | 'female' | 'all');
    setCurrentPage(1);
    setAllGroupedAvatars([]);
  };

  const handleEndReached = () => {
    if (
      !isLoadingMore &&
      hasMorePages &&
      !isFetching &&
      allGroupedAvatars.length > 0
    ) {
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
          <View style={styles.tempCharacherImage}>
            {!loadedImages.has(selectedImage.uri) && (
              <View style={styles.imageShimmerContainer}>
                <Shimmer
                  width="100%"
                  height="100%"
                  borderRadius={16}
                />
              </View>
            )}
            <ImageBackground
              source={{ uri: selectedImage.uri }}
              style={[
                styles.tempCharacherImageBackground,
                !loadedImages.has(selectedImage.uri) && styles.hiddenImage,
              ]}
              resizeMode="cover"
              onLoad={() => handleImageLoad(selectedImage.uri)}
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
          </View>
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
    if (allGroupedAvatars.length === 0) {
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

    const firstGroupedAvatar = allGroupedAvatars[0];
    const hasImageUrl =
      firstGroupedAvatar.preview_image_url &&
      firstGroupedAvatar.preview_image_url.trim() !== '' &&
      firstGroupedAvatar.preview_image_url !== 'null' &&
      firstGroupedAvatar.preview_image_url !== 'undefined';
    const imageFailed = failedImages.has(firstGroupedAvatar.base_name);
    const shouldUseFallback = !hasImageUrl || imageFailed;
    const imageSource = shouldUseFallback
      ? Images.TempCharacher
      : { uri: firstGroupedAvatar.preview_image_url };
    const isImageLoaded = shouldUseFallback || (firstGroupedAvatar.preview_image_url ? loadedImages.has(firstGroupedAvatar.preview_image_url) : false);

    return (
      <View style={styles.columnRow}>
        {renderCustomUploadItem(false)}
        <TouchableOpacity
          onPress={() => handleGroupedAvatarSelect(firstGroupedAvatar)}
          style={styles.tempCharacher}
          activeOpacity={0.8}
        >
          <View style={styles.tempCharacherImage}>
            {!isImageLoaded && !shouldUseFallback && firstGroupedAvatar.preview_image_url && (
              <View style={styles.imageShimmerContainer}>
                <Shimmer
                  width="100%"
                  height="100%"
                  borderRadius={16}
                />
              </View>
            )}
            <ImageBackground
              source={imageSource}
              style={[
                styles.tempCharacherImageBackground,
                !isImageLoaded && !shouldUseFallback && styles.hiddenImage,
              ]}
              onError={() => handleImageError(firstGroupedAvatar.base_name)}
              onLoad={() => firstGroupedAvatar.preview_image_url && !shouldUseFallback && handleImageLoad(firstGroupedAvatar.preview_image_url)}
              resizeMode="cover"
            >
            <View style={styles.tempCharacherOverlay}>
              <Text style={styles.tempCharacherTitle}>
                {firstGroupedAvatar.base_name}
              </Text>
              <Text style={styles.variantCount}>
                {firstGroupedAvatar.variant_count} variants
              </Text>
            </View>
            </ImageBackground>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRow = ({
    item: row,
  }: {
    item: GroupedAvatar[] | 'custom-upload-with-first' | null;
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
        {row.map(groupedAvatar => {
          const hasImageUrl =
            groupedAvatar.preview_image_url &&
            groupedAvatar.preview_image_url.trim() !== '' &&
            groupedAvatar.preview_image_url !== 'null' &&
            groupedAvatar.preview_image_url !== 'undefined';
          const imageFailed = failedImages.has(groupedAvatar.base_name);
          const shouldUseFallback = !hasImageUrl || imageFailed;
          const imageSource = shouldUseFallback
            ? Images.TempCharacher
            : { uri: groupedAvatar.preview_image_url };
          const isImageLoaded = shouldUseFallback || (groupedAvatar.preview_image_url ? loadedImages.has(groupedAvatar.preview_image_url) : false);

          return (
            <TouchableOpacity
              key={groupedAvatar.base_name}
              onPress={() => handleGroupedAvatarSelect(groupedAvatar)}
              style={styles.tempCharacher}
              activeOpacity={0.8}
            >
              <View style={styles.tempCharacherImage}>
                {!isImageLoaded && !shouldUseFallback && groupedAvatar.preview_image_url && (
                  <View style={styles.imageShimmerContainer}>
                    <Shimmer
                      width="100%"
                      height="100%"
                      borderRadius={16}
                    />
                  </View>
                )}
                <ImageBackground
                  source={imageSource}
                  style={[
                    styles.tempCharacherImageBackground,
                    !isImageLoaded && !shouldUseFallback && styles.hiddenImage,
                  ]}
                  onError={() => handleImageError(groupedAvatar.base_name)}
                  onLoad={() => groupedAvatar.preview_image_url && !shouldUseFallback && handleImageLoad(groupedAvatar.preview_image_url)}
                  resizeMode="cover"
                >
                <View style={styles.tempCharacherOverlay}>
                  <Text style={styles.tempCharacherTitle}>
                    {groupedAvatar.base_name}
                  </Text>
                  <Text style={styles.variantCount}>
                    {groupedAvatar.variant_count} variants
                  </Text>
                </View>
                </ImageBackground>
              </View>
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

        {/* Search Bar and Gender Dropdown in one row */}
        <View style={styles.searchRowContainer}>
          <View style={styles.searchInputContainer}>
            <Input
              placeholder="Search characters..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              containerStyle={styles.searchInput}
              inputStyle={styles.searchInputText}
            />
          </View>
          <View style={styles.dropdownContainer}>
            <CustomDropdown
              title=""
              dropdownContainerStyle={styles.dropdownContainerStyle}
              options={['All', 'Male', 'Female']}
              selectedValue={
                selectedGender === 'all'
                  ? 'All'
                  : selectedGender === 'male'
                  ? 'Male'
                  : 'Female'
              }
              onSelect={(value: string) => {
                const genderMap: Record<string, 'male' | 'female' | 'all'> = {
                  All: 'all',
                  Male: 'male',
                  Female: 'female',
                };
                handleGenderChange(genderMap[value] || 'all');
              }}
              placeholder="Gender"
              style={styles.dropdownStyle}
              rowStyle={styles.dropdownRowStyle}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderListFooter = () => {
    if (
      (isLoadingMore || isFetching) &&
      hasMorePages &&
      allGroupedAvatars.length > 0
    ) {
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
    if ((isLoading || isFetching) && allGroupedAvatars.length === 0) {
      return null;
    }

    if (data?.data?.length === 0 && !isLoading && !isFetching) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>No avatars found</Text>
          <Text style={styles.stateSubtitle}>
            Try adjusting your search or filter.
          </Text>
        </View>
      );
    }

    if (isError && allGroupedAvatars.length === 0) {
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

    if (!allGroupedAvatars.length) {
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
        {renderListHeader()}
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
          //  variant="secondary"
          style={{
            marginBottom: metrics.width(15),
          }}
          //  disabled={!selectedCharacter}
        />

        {/* {isCustomImageSelected&&  <PrimaryButton
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
        /> } */}
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
    // flexGrow: 1,
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
    //flex: 1,
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
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  tempCharacherImageBackground: {
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
  },
  imageShimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  hiddenImage: {
    opacity: 0,
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
  searchRowContainer: {
    flexDirection: 'row',
    marginBottom: metrics.width(20),
    gap: metrics.width(5),
    alignItems: 'flex-start',
  },
  searchInputContainer: {
    flex: 1,
  },
  searchInput: {
    marginBottom: 0,
    marginTop: 0,
  },
  searchInputText: {
    fontSize: metrics.width(14),
  },
  dropdownContainer: {
    width: metrics.width(120),
  },
  dropdownStyle: {
    marginTop: 0,
  },
  variantCount: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(11),
    color: colors.subtitle,
    marginTop: metrics.width(4),
  },
  dropdownContainerStyle: {
    position: 'absolute',
    zIndex:999,
        flexGrow: 1,
        marginTop:metrics.width(50),
        width:'100%',
  },
  dropdownRowStyle: {
    minHeight:metrics.width(20),
  },
});
