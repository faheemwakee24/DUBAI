import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { Header, Shimmer, LiquidGlassBackground } from '../../components/ui';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { showToast } from '../../utils/toast';

type SelectProfileImageNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SelectProfileImage'
>;

export interface ProfileImage {
  id: string;
  url: string;
  key: string;
}

export default function SelectProfileImage() {
  const navigation = useNavigation<SelectProfileImageNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'SelectProfileImage'>>();
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Image URLs list
  const imageUrls = [
  'https://storage.googleapis.com/tradebucket1213/newthings/ChatGPT%20Image%20Nov%2029%2C%202025%2C%2001_13_36%20PM%201_1764517572780_hp2rs4.png?GoogleAccessId=bucket%40legion-super-app.iam.gserviceaccount.com&Expires=1796053574&Signature=VXTJWiflBaeEUTs%2FLiNKvOloYDZGoiodoRc%2FXi2z9J4dUv6HTd3rgXUUk%2BvtSH7anPe9HnIapybO8J19MAGj%2BayhT5rfbxZ24gU%2FDm0Szy3RAMT4f5H23zo%2FF%2B4fAnI%2F2ToRRoOiVywQoW3ZK1TBAzxA0BC1NUndcPrwvRtMPPhTXnVdqEDElUbymrXZbMyohthmT9%2B0J7duKQuEsWivRj55rWsE3pw2c%2FAXKV9LGcGiTrrN%2FHxV8zqrFM%2FfjqPVAK9%2Bjnzi3m6E1U5YwIL3E8Z0pgnp2MVzbqRTWex4ig3me6q2rTvaEhwpZYICoE6lSIXZkErMlG47CsPECt2yrw%3D%3D',
  'https://storage.googleapis.com/tradebucket1213/newthings/ChatGPT%20Image%20Nov%2029%2C%202025%2C%2001_17_03%20PM%201_1764517642633_afwkmh.png?GoogleAccessId=bucket%40legion-super-app.iam.gserviceaccount.com&Expires=1796053644&Signature=IdDR9wD7nMDKUsCqOQse6H33HKXCLhutDOBt0Se8YJGiktuzK5qKfkyCnbegdotAUe0Y1XE1QeXUT1nDwWCRXOnLPHmTsZyv%2BPokujTJO4ppjP%2BJ7WYlsiE6CHGV8Ks2xJbzVbB5VpLgIVh0AljGC7QoBEghCgAYqP2CJHPGw3har7r6A9xEYbXUMNwhHpZ2RJQu99UeeMiaOvxL5x341FClQcYzbUYMAvFFR4rT3ic7Vbyrryo9HHipNqJiGufiAZIVd9QJg4exV0PXVX43qbteMish46z9qiG7iUVGVai555wv27zKsoUEX6lNbEbM9zjOEciKbRzGkYpogN5k1A%3D%3D',
  'https://storage.googleapis.com/tradebucket1213/newthings/ChatGPT%20Image%20Nov%2029%2C%202025%2C%2001_18_46%20PM%201_1764517688241_7ksl7k.png?GoogleAccessId=bucket%40legion-super-app.iam.gserviceaccount.com&Expires=1796053689&Signature=k5i2L4tem1W%2FyDOwCu9onOL1kGQ5zm4mkq5YZ%2FHoKlMMPlXdsSVaFyRPvpbtxUTo5WeQBi2SUSab3%2B6GRIZ2%2FkKLLHnZ%2FlgVNFBPgl4%2ByJF0VBUb2iMmcSOq%2B0SD%2Fe%2FaserdJEujNQoQ9wH3%2BPsbg1KTdSmLwc97tYT42r53CSZ%2BFKRMibB6vp8gEh128YyUZAxt5UL%2FzszpXyIraSFZg1VPuVLBpshBdnCmkESwC1J93zC6Zki4jLGYtY0G68oGI%2Fx8GBStXfbB%2FU4oc7kaoyIzkxkFggC9dSvsqaj9xbh3E5LRS79vs4QsBT1bSlN2UwiFWuXYbToa%2FW9CaEQ2VQ%3D%3D',
  'https://storage.googleapis.com/tradebucket1213/newthings/ChatGPT%20Image%20Nov%2029%2C%202025%2C%2001_18_49%20PM%201_1764517740651_wjdsln.png?GoogleAccessId=bucket%40legion-super-app.iam.gserviceaccount.com&Expires=1796053742&Signature=NpfDb2xJS2kZkD0jN7r6KoogPWomhwuATq7ay5EMLI%2B0xbbFnVALRQY3R62tqvRBqmkuspSGPXcL5CTNSFVj01oTnSKBdl2vR2cAuTDdVbzmzIQcNnVtd4rawtiHjQxeSyjjTVKMm5G2mia80sLfYnrKMRvtYTQu%2F7DuDdblwg7OXBbd6xUtEub2trvk%2Fr6WXC9ftvxNiaMI95PLh1glOu%2Fx%2Bn8sLUK0Y1C1CJhn31p%2Fao8zPzNfFD7LpmLhKD2q7pTFKmd8qS8e9DllbDTCOjQW%2B3CR3Pvf2A5O%2BujAfaB4TwGnTH%2FLdnm0O6qTl%2BTg6%2FLh9ZsdAzfZMMobyluyqA%3D%3D'  
  ];

  // Transform URLs into ProfileImage format
  const images: ProfileImage[] = imageUrls.map((url, index) => ({
    id: `profile-image-${index + 1}`,
    url: url,
    key: url, // Use URL as key for identification
  }));

  // Set initial selection if provided
  useEffect(() => {
    if (route.params?.selectedImageUrl) {
      setSelectedImageUrl(route.params.selectedImageUrl);
    }
  }, [route.params]);

  // Track image loading
  useEffect(() => {
    // Reset loading state when component mounts
    setIsLoading(true);
    setLoadedImages(new Set());
  }, []);

  // Check if all images are loaded
  useEffect(() => {
    if (loadedImages.size === images.length && images.length > 0) {
      setIsLoading(false);
    }
  }, [loadedImages, images.length]);

  const handleImageSelect = (image: ProfileImage) => {
    setSelectedImageUrl(image.url);
  };

  const handleConfirm = () => {
    if (!selectedImageUrl) {
      showToast.error('Error', 'Please select an image');
      return;
    }
    route.params?.setSelectedImageUrl?.(selectedImageUrl);
    navigation.goBack();
    // Navigate back with selected image URL
    // navigation.navigate('EditAccount', {
    //   selectedImageUrl: selectedImageUrl,
    // });
  };

  const handleImageLoad = (imageUrl: string) => {
    setLoadedImages(prev => new Set(prev).add(imageUrl));
  };

  const renderImageItem = ({ item }: { item: ProfileImage }) => {
    const isSelected = selectedImageUrl === item.url;
    const isImageLoaded = loadedImages.has(item.url);
    
    return (
      <TouchableOpacity
        style={[
          styles.imageContainer,
          isSelected && styles.selectedImageContainer,
        ]}
        onPress={() => handleImageSelect(item)}
        activeOpacity={0.8}
      >
        <LiquidGlassBackground style={styles.imageWrapper}>
          {!isImageLoaded && (
            <View style={styles.imagePlaceholder}>
              <Shimmer
                width="100%"
                height="100%"
                borderRadius={metrics.width(75)}
              />
            </View>
          )}
          <Image
            source={{ uri: item.url }}
            style={[styles.image, !isImageLoaded && styles.hiddenImage]}
            resizeMode="cover"
            onLoad={() => handleImageLoad(item.url)}
          />
          {isSelected && isImageLoaded && (
            <View style={styles.selectedOverlay}>
              <View style={styles.checkmarkContainer}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            </View>
          )}
        </LiquidGlassBackground>
      </TouchableOpacity>
    );
  };

  const renderShimmer = () => (
    <View style={styles.shimmerContainer}>
      {[1, 2, 3, 4, 5, 6].map(index => (
        <Shimmer
          key={index}
          width="48%"
          height={metrics.width(150)}
          borderRadius={metrics.width(75)}
          style={styles.shimmerItem}
        />
      ))}
    </View>
  );

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Select Profile Image" showBackButton />
        {isLoading ? (
          renderShimmer()
        ) : images.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No images available</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={images}
              renderItem={renderImageItem}
              keyExtractor={item => item.id}
              numColumns={2}
              contentContainerStyle={styles.listContainer}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
            />
            <PrimaryButton
              title="Confirm Selection"
              onPress={handleConfirm}
              variant="primary"
              disabled={!selectedImageUrl || isLoading}
              style={styles.confirmButton}
              fullWidth
            />
          </>
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
  listContainer: {
    paddingVertical: metrics.width(20),
    gap: metrics.width(15),
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: metrics.width(15),
  },
  imageContainer: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 100,
    overflow: 'hidden',
  },
  selectedImageContainer: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(254, 44, 11, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: metrics.width(75),
  },
  checkmarkContainer: {
    width: metrics.width(40),
    height: metrics.width(40),
    borderRadius: 100,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: colors.white,
    fontSize: metrics.width(24),
    fontFamily: FontFamily.spaceGrotesk.bold,
  },
  confirmButton: {
    marginBottom: metrics.width(25),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(16),
    color: colors.subtitle,
  },
  shimmerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: metrics.width(20),
  },
  shimmerItem: {
    marginBottom: metrics.width(15),
  },
  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: metrics.width(75),
    overflow: 'hidden',
  },
  hiddenImage: {
    opacity: 0,
  },
});
