import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { Svgs } from '../../assets/icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, Shimmer, LiquidGlassBackground } from '../../components/ui';
import { API_BASE_URL, API_VERSION_PREFIX, API_ENDPOINTS } from '../../constants/api';
import { tokenStorage } from '../../utils/tokenStorage';
import { downloadImage, ImageDownloadProgress } from '../../utils/imageDownloader';
import { showToast } from '../../utils/toast';

type GeneratedCharactersNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GeneratedCharacters'
>;

export default function GeneratedCharacters() {
  const navigation = useNavigation<GeneratedCharactersNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'GeneratedCharacters'>>();
  const generationId = route.params?.generationId;
  const initialImageUrls = route.params?.imageUrls;
  const initialImageKeys = route.params?.imageKeys;
  const projectId = route.params?.projectId;
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>(initialImageUrls || []);
  const [imageKeys, setImageKeys] = useState<string[]>(initialImageKeys || []);
  const [isProcessing, setIsProcessing] = useState(!initialImageUrls || initialImageUrls.length === 0);
  const [downloadingImageId, setDownloadingImageId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll photo generation status using direct fetch (no RTK Query, no caching)
  const pollPhotoGeneration = async (genId: string) => {
    try {
      // Get auth token
      const token = await tokenStorage.getAccessToken();
      
      // Build URL with cache-busting timestamp to ensure fresh data
      const timestamp = Date.now();
      const url = `${API_BASE_URL}${API_VERSION_PREFIX}${API_ENDPOINTS.HEYGEN.PHOTO_GENERATION(genId)}?_t=${timestamp}`;
      
      console.log('=== Polling photo generation status ===');
      console.log('URL:', url);
      
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      };
      
      if (token) {
        headers['authorization'] = `Bearer ${token}`;
      }
      
      // Make direct fetch call (no caching - using timestamp and headers)
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        return;
      }
      
      const apiResponse = await response.json();
      console.log('API Response:', apiResponse);
      
      if (apiResponse?.data) {
        const responseData = apiResponse.data;
        const status = responseData.status;
        const imageList = responseData.image_url_list;
        const imageKeyList = responseData.image_key_list;
        
        console.log('Status from API:', status);
        console.log('Image list:', imageList);
        console.log('Image key list:', imageKeyList);

        if (status === 'success' && imageList && imageList.length > 0) {
          // Generation completed
          setIsProcessing(false);
          setImageUrls(imageList);
          if (imageKeyList && imageKeyList.length > 0) {
            setImageKeys(imageKeyList);
          }
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        } else if (status === 'failed') {
          // Generation failed
          setIsProcessing(false);
          Alert.alert('Error', 'Character generation failed. Please try again.');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
        // If status is 'in_progress', continue polling
      }
    } catch (error: any) {
      console.error('Error polling photo generation:', error);
    }
  };

  // Start polling when component mounts
  useEffect(() => {
    if (generationId && isProcessing) {
      // Start polling immediately
      pollPhotoGeneration(generationId);
      
      // Set up polling every 4 seconds
      intervalRef.current = setInterval(() => {
        pollPhotoGeneration(generationId);
      }, 4000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [generationId, isProcessing]);

  // Group images into rows of 2
  const imageRows = React.useMemo(() => {
    const rows: string[][] = [];
    for (let i = 0; i < imageUrls.length; i += 2) {
      rows.push(imageUrls.slice(i, i + 2));
    }
    return rows;
  }, [imageUrls]);

  // Create shimmer rows for loading state
  const shimmerRows = React.useMemo(() => {
    return Array.from({ length: 2 }, () => null); // 2 rows = 4 shimmer items
  }, []);

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  // Handle image download
  const handleDownloadImage = async (imageUrl: string, imageIndex: number) => {
    if (!imageUrl) {
      showToast.error('Error', 'No image URL available');
      return;
    }

    if (downloadingImageId === `image-${imageIndex}`) {
      return; // Prevent multiple simultaneous downloads
    }

    setDownloadingImageId(`image-${imageIndex}`);

    try {
      const fileName = `character_${imageIndex}_${Date.now()}.jpg`;
      const result = await downloadImage(
        imageUrl,
        fileName,
        (progress: ImageDownloadProgress) => {
          // Optional: Track progress if needed
          const percent = Math.round(progress.progress * 100);
          console.log(`Download progress: ${percent}%`);
        }
      );

      if (result.success && result.filePath) {
        showToast.success('Success', 'Image downloaded successfully!');
      } else {
        showToast.error('Error', result.error || 'Failed to download image');
      }
    } catch (error: any) {
      console.error('[GeneratedCharacters] Image download error:', error);
      showToast.error('Error', error?.message || 'Failed to download image');
    } finally {
      setDownloadingImageId(null);
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

  const renderRow = ({ item: row }: { item: string[] | null }) => {
    // If row is null, it's a shimmer placeholder
    if (row === null) {
      return renderShimmerRow();
    }

    return (
      <View style={styles.columnRow}>
        {row.map((imageUrl, rowIndex) => {
          const globalIndex = imageRows.indexOf(row) * 2 + rowIndex;
          const isSelected = selectedImageIndex === globalIndex;

          return (
            <TouchableOpacity
              key={`image-${globalIndex}`}
              onPress={() => handleImageSelect(globalIndex)}
              style={[
                styles.imageCard,
                isSelected && styles.selectedImage,
              ]}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: imageUrl }}
                style={styles.generatedImage}
                resizeMode="cover"
              />
              {!isProcessing && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDownloadImage(imageUrl, globalIndex);
                  }}
                  style={styles.downloadIconTouchable}
                  disabled={downloadingImageId === `image-${globalIndex}`}
                  activeOpacity={0.7}
                >
                  <LiquidGlassBackground style={styles.downloadIcon}>
                    <View style={styles.downloadIconContainer}>
                      {downloadingImageId === `image-${globalIndex}` ? (
                        <Text style={styles.downloadProgressText}>...</Text>
                      ) : (
                        <Svgs.Downloard />
                      )}
                    </View>
                  </LiquidGlassBackground>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
        {row.length === 1 ? (
          <View
            pointerEvents="none"
            style={[styles.imageCard, styles.placeholderCard]}
          />
        ) : null}
      </View>
    );
  };

  const renderListHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Your Generated Characters</Text>
        <Text style={styles.subTitle}>
          {isProcessing
            ? 'Generating your characters...'
            : 'Select a character to continue'}
        </Text>
      </View>
    );
  };

  const handleNext = () => {
    if (selectedImageIndex === null) {
      return;
    }
    const selectedImageKey = imageKeys[selectedImageIndex];
    // Navigate to next screen with selected image key
    if (selectedImageKey) {
      navigation.navigate('VoiceSelection', { 
        avatarId: selectedImageKey, 
        screenFrom: 'GeneratedCharacters',
        projectId: projectId,
      });
    } else {
      Alert.alert('Error', 'Image key not available. Please try again.');
    }
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Generated Characters"
          showBackButton
          
        />
        <FlatList
          data={isProcessing ? shimmerRows : imageRows}
          renderItem={renderRow}
          keyExtractor={(item, index) => `row-${index}`}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          ListHeaderComponent={renderListHeader}
          ItemSeparatorComponent={() => <View style={{ height: metrics.width(15) }} />}
        />
        <PrimaryButton
          title="Next"
          onPress={handleNext}
          variant="primary"
          disabled={selectedImageIndex === null || isProcessing}
          style={{
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
  },
  subTitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(15),
    color: colors.subtitle,
    marginTop: metrics.width(5),
  },
  columnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: metrics.width(15),
  },
  imageCard: {
    height: metrics.screenWidth * 0.41,
    borderRadius: 16,
    overflow: 'hidden',
    flex: 1,
    borderWidth: 1,
    borderColor: colors.white15,
    position: 'relative',
  },
  generatedImage: {
    width: '100%',
    height: '100%',
  },
  selectedImage: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIconContainer: {
    backgroundColor: colors.white,
    borderRadius: metrics.width(20),
    width: metrics.width(40),
    height: metrics.width(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    fontSize: metrics.width(24),
    color: colors.primary,
    fontWeight: 'bold',
  },
  placeholderCard: {
    backgroundColor: colors.white5,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.white15,
  },
  downloadIconTouchable: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 10,
  },
  downloadIcon: {
    height: 28,
    width: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
});

