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
  const [isLoading, setIsLoading] = useState(false);

  // Image URLs list
  const imageUrls = [
    'https://storage.googleapis.com/tradebucket1213/newthings/ChatGPT%20Image%20Nov%2029%2C%202025%2C%2001_18_49%20PM_1764404598741_mae9jr.png?GoogleAccessId=bucket%40legion-super-app.iam.gserviceaccount.com&Expires=1795940601&Signature=2BjDEzs5%2F1q%2BSYs6VqAyYM51Brocse7Lqz4TtxZp8UoHXp%2FGh9jQeCmBRs4neXg8nQhOHkmykko4mDN2Io7Bx8HeNbsZxZYuXak%2BhMvjb73Kp9a%2F%2FXHQ2QiNSIyV8SrGnPigOi0G8I32vJ5QHJt6W7VEOEmiJZW6xyFMN0oJpEAt%2FtghYyImB%2FSMLMkGzIyBkf58cTEctHDzVArXRkiLjpeqKpaSkIptxejcxq9OydaPX3RLfnWkUDCSshp1w4XWVfMF%2BlECYLjtJyeXTm%2B0rW1%2By7DIZpImQXPyvv%2B2bafmIdqM0TVTuwhXDeaPGc1kN1y%2F0N2pEEfmwGyS3thRvA%3D%3D',
    'https://storage.googleapis.com/tradebucket1213/newthings/ChatGPT%20Image%20Nov%2029%2C%202025%2C%2001_18_46%20PM_1764404566532_ddwtij.png?GoogleAccessId=bucket%40legion-super-app.iam.gserviceaccount.com&Expires=1795940569&Signature=zN1ByADYV7XYpM7Fkcj%2F18lZ6vKuLwBnltfy7dvVR1crUW5VC4ouu2K4TVvVh%2FcgfaOXs%2Bf8GefntZi95irflS4jKJN6f19xE%2B%2B5j3Sqh3ipXAm9vKpUsACLNtkMAjunP811g9xZ80cEPKI%2BNtWJz93V4Fh7oicI1eoFoNGijC8nayvZK5to%2B%2F0SL%2Bp6bN3SnVDUUvtbVDQA6k8y0W7%2F4R3BrIp9jah12P5SmfLL7wCWjbx7FvZ0504UutU7YzkLKSrOtzE67I4QQJzutYaj0I03DT4NIYdlULUud%2FZ55O7Ai5MuYI4PEq7GnoGIP6T766p9M2tjny%2FxwViq3hDuEQ%3D%3D',
    'https://storage.googleapis.com/tradebucket1213/newthings/ChatGPT%20Image%20Nov%2029%2C%202025%2C%2001_13_36%20PM_1764404529744_hgwelm.png?GoogleAccessId=bucket%40legion-super-app.iam.gserviceaccount.com&Expires=1795940534&Signature=v7vzWJMPZA1e3biNyjMXc%2BBCNZ6uInAlrpgNkGzS7k1CEL7gENOETLtzi6Ichus2A9oz%2F22NAAtWlfSsC5I2TTvtkbeVXKGjHz145mZ6n9Ec%2Bp2YrXEZ2ADB89ChRXgYxbYRiiRyEA%2FX1YAULeU3b6i8kHYq1tH6rv5ql4TFOCRk5guutU12cgtleP3ryh%2FBGKZK2HWwZl%2B3lg43%2BEcox4A%2FQlxptSlPwmy3paIyp5KEhGlq9LHQ3rwArLtTRV3%2FGSq%2BK2l8JLW3dA%2F%2FeNhz8GIV1HzB2KY519ratfTFvEGnPSBf%2FgWT69wcpuNW5gsKaeN0bwAk6FcDyA75qs5bWQ%3D%3D',
    'https://storage.googleapis.com/tradebucket1213/newthings/ChatGPT%20Image%20Nov%2029%2C%202025%2C%2001_17_03%20PM_1764404454197_1q9sry.png?GoogleAccessId=bucket%40legion-super-app.iam.gserviceaccount.com&Expires=1795940458&Signature=044zQ34Aw0ItbEnIejm1gsIIcZdmC0mIs8op78Tglwj4sGbex69OPaVNVAs%2BLSSSfuZoKyuij0z9I3RT1E7QHy6cQ341aeK3%2B%2FSOvQc7FOr1bWI6%2Bq%2FqvqbNUEgJotm7%2BgnpH9fFp3TO9kdnlizwTy7yn6g882PF%2F5L9%2F3eQqv3EAaP%2Fr%2Fkex41X%2B85HV4xv3bx3zDuzMwi0DHfWFEE9NBAIpWBf8GPiBxmRt43jvToRV1DRx4d1M%2BOCW7%2Bj%2BbLhssZT6bbsFL%2FYkxGWen9367WQ0gdTECRAaEzV0XPUwBjBMp3gesLe7bMQtmK2AMQFdW86ouKvF90z93z1y7v6Qg%3D%3D',
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

  const renderImageItem = ({ item }: { item: ProfileImage }) => {
    const isSelected = selectedImageUrl === item.url;
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
          <Image
            source={{ uri: item.url }}
            style={styles.image}
            resizeMode="cover"
          />
          {isSelected && (
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
});
