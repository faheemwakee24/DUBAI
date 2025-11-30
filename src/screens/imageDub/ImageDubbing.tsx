import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, LiquidGlassBackground } from '../../components/ui';
import { Images } from '../../assets/images';
import { showToast, selectImage, type SelectedImage } from '../../utils';

type ImageDubbingNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ImageDubbing'
>;

export default function ImageDubbing() {
  const navigation = useNavigation<ImageDubbingNavigationProp>();

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

  const handleSelectImage = async () => {
    const imageData = await selectImage({
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
      mediaType: 'photo',
    });

    if (imageData) {
      setSelectedImage(imageData);
    }
  };

  const handleEditImage = () => {
    handleSelectImage();
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

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Image Dubbing" showBackButton />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dashboardContainer}>
            <Text style={styles.title}>Image Dubbing</Text>
            <Text style={styles.subTitle}>
              Upload an image to create a dubbed version.
            </Text>

            {/* Image Upload Section */}
            <View style={styles.imageUploadContainer}>
              {selectedImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: selectedImage.uri }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.editImageButton}
                    onPress={handleEditImage}
                    activeOpacity={0.8}
                  >
                    <PrimaryButton
                      title="Change"
                      variant="primary"
                      onPress={handleEditImage}
                      size="extraSmall"
                      extraContainerStyle={{ borderRadius: 12 }}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <LiquidGlassBackground style={styles.imageSelectorContainer}>
                  <TouchableOpacity
                    onPress={handleSelectImage}
                    style={styles.imageSelectorContent}
                  >
                    <Image style={styles.image} source={Images.UploadVedio} />
                    <Text style={styles.imageSelectorText}>Select Image</Text>
                  </TouchableOpacity>
                </LiquidGlassBackground>
              )}
            </View>
          </View>
        </ScrollView>

        <PrimaryButton
          title="Dub Image"
          onPress={handleDub}
          variant="primary"
          disabled={!selectedImage}
          style={{ marginBottom: metrics.width(25) }}
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  dashboardContainer: {
    flex: 1,
    marginTop: metrics.width(20),
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
    marginBottom: metrics.width(20),
    marginTop: metrics.width(7),
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
