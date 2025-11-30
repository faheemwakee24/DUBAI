import React, { useState } from 'react';
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
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Header,
  LiquidGlassBackground,
  PrimaryButton,
} from '../../components/ui';
import { Images } from '../../assets/images';
import { GroupedAvatar, GroupedAvatarVariant } from '../../store/api/heygenApi';

type AvatarVariantsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AvatarVariants'
>;

export default function AvatarVariants() {
  const navigation = useNavigation<AvatarVariantsNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'AvatarVariants'>>();
  const { groupedAvatar } = route.params;

  const [selectedVariant, setSelectedVariant] =
    useState<GroupedAvatarVariant | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageError = (avatarId: string) => {
    setFailedImages(prev => new Set(prev).add(avatarId));
  };

  const handleVariantSelect = (variant: GroupedAvatarVariant) => {
    setSelectedVariant(variant);
  };

  const handleNext = () => {
    if (!selectedVariant) {
      return;
    }

    navigation.navigate('VoiceSelection', {
      avatarId: selectedVariant.avatar_id,
      avatar_photo_url: selectedVariant.preview_image_url,
      isCustomImageSelected: false,
    });
  };

  const renderVariantItem = ({ item }: { item: GroupedAvatarVariant }) => {
    const isSelected = selectedVariant?.avatar_id === item.avatar_id;
    const hasImageUrl =
      item.preview_image_url &&
      item.preview_image_url.trim() !== '' &&
      item.preview_image_url !== 'null' &&
      item.preview_image_url !== 'undefined';
    const imageFailed = failedImages.has(item.avatar_id);
    const shouldUseFallback = !hasImageUrl || imageFailed;
    const imageSource = shouldUseFallback
      ? Images.TempCharacher
      : { uri: item.preview_image_url };

    return (
      <TouchableOpacity
        onPress={() => handleVariantSelect(item)}
        style={[styles.variantCard, isSelected && styles.selectedVariant]}
        activeOpacity={0.8}
      >
        <ImageBackground
          source={imageSource}
          style={styles.variantImage}
          onError={() => handleImageError(item.avatar_id)}
          resizeMode="cover"
        >
          <View style={styles.variantOverlay}>
            <Text style={styles.variantName} numberOfLines={2}>
              {item.avatar_name}
            </Text>
            {item.premium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            )}
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title={groupedAvatar.base_name} showBackButton />

        <View style={styles.contentContainer}>
          <Text style={styles.subtitle}>
            Select a variant of {groupedAvatar.base_name}
          </Text>

          <FlatList
            data={groupedAvatar.variants}
            renderItem={renderVariantItem}
            keyExtractor={item => item.avatar_id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.row}
            ItemSeparatorComponent={() => (
              <View style={{ height: metrics.width(15) }} />
            )}
          />
        </View>
        <PrimaryButton
          title="Next"
          onPress={handleNext}
          variant="primary"
          disabled={!selectedVariant}
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
    flex: 1,
    marginTop: metrics.width(20),
  },
  subtitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.subtitle,
    marginBottom: metrics.width(20),
  },
  listContent: {
    paddingBottom: metrics.width(100),
  },
  row: {
    justifyContent: 'space-between',
  },
  variantCard: {
    width: '48%',
    height: metrics.screenWidth * 0.41,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedVariant: {
    borderColor: colors.primary,
  },
  variantImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  variantOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: metrics.width(12),
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  variantName: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(14),
    color: colors.white,
  },
  premiumBadge: {
    marginTop: metrics.width(4),
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: metrics.width(6),
    paddingVertical: metrics.width(2),
    borderRadius: 4,
  },
  premiumText: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(10),
    color: colors.white,
  },
  nextButton: {
    position: 'absolute',
    bottom: metrics.width(25),
    left: metrics.width(25),
    right: metrics.width(25),
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonBackground: {
    paddingVertical: metrics.width(16),
    paddingHorizontal: metrics.width(24),
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(16),
    color: colors.white,
  },
  nextButtonTextDisabled: {
    color: colors.subtitle,
  },
});
