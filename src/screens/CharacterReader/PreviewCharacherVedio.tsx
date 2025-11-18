import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Header,
  LiquidGlassBackground,
  PrimaryButton,
} from '../../components/ui';
import { Svgs } from '../../assets/icons';
import { characters_data } from '../../utils/characters';
import ViewShot from 'react-native-view-shot';
import { showToast } from '../../utils/toast';
import { useUploadImageMutation, useCreateVideoMutation } from '../../store/api/characterApi';
import { useTranslation } from 'react-i18next';

const HAIR_LABEL_DEFAULTS: Record<string, string> = {
  short: 'Short',
  long: 'Long',
  curly: 'Curly',
  spiky: 'Spiky',
};

const OUTFIT_LABEL_DEFAULTS: Record<string, string> = {
  casual: 'Casual',
  formal: 'Formal',
  semiFormal: 'Semi Formal',
  sporty: 'Sporty',
  superHero: 'Super Hero',
};

const BACKGROUND_LABEL_DEFAULTS: Record<string, string> = {
  dubai_red: 'Dub AI Red',
  gradient_blue: 'Gradient Blue',
  gradient_orange: 'Gradient Orange',
  pattern: 'Pattern',
};

const ACCESSORY_LABEL_DEFAULTS: Record<string, string> = {
  cap: 'Cap',
  glasses: 'Glasses',
  watch: 'Watch',
  none: 'None',
};

const buildReverseMap = (
  defaults: Record<string, string>,
  translated: unknown,
): Record<string, string> => {
  const reverse: Record<string, string> = {};

  Object.entries(defaults).forEach(([key, value]) => {
    reverse[value] = key;
  });

  if (translated) {
    if (Array.isArray(translated)) {
      const defaultKeys = Object.keys(defaults);
      translated.forEach((value, index) => {
        const key = defaultKeys[index];
        if (key && value) {
          reverse[String(value)] = key;
        }
      });
    } else if (typeof translated === 'object') {
      Object.entries(translated as Record<string, string>).forEach(([key, value]) => {
        reverse[String(value)] = key;
      });
    }
  }

  return reverse;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function PreviewCharacherVedio() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const route = useRoute<RouteProp<RootStackParamList, 'PreviewCharacherVedio'>>();
  const { character, body, hair, accessories, background, emotion, message, speed, voiceTone } = route.params;
  const viewShotRef = useRef<ViewShot | null>(null);
  const [uploadImage] = useUploadImageMutation();
  const [createVideo, { isLoading: isCreatingVideo }] = useCreateVideoMutation();
  const { t } = useTranslation();

  const hairLabelReverse = useMemo(
    () =>
      buildReverseMap(
        HAIR_LABEL_DEFAULTS,
        t('customizeAvatar.dropdowns.hairStyle.options', { returnObjects: true }),
      ),
    [t],
  );

  const bodyLabelReverse = useMemo(
    () =>
      buildReverseMap(
        OUTFIT_LABEL_DEFAULTS,
        t('customizeAvatar.dropdowns.outfit.options', { returnObjects: true }),
      ),
    [t],
  );

  const backgroundLabelReverse = useMemo(
    () =>
      buildReverseMap(
        BACKGROUND_LABEL_DEFAULTS,
        t('customizeAvatar.dropdowns.background.options', { returnObjects: true }),
      ),
    [t],
  );

  const accessoriesLabelReverse = useMemo(
    () =>
      buildReverseMap(
        ACCESSORY_LABEL_DEFAULTS,
        t('customizeAvatar.dropdowns.accessories.options', { returnObjects: true }),
      ),
    [t],
  );

  // Map character ID to character key
  const getCharacterKey = (id: number): keyof typeof characters_data | null => {
    const idToKeyMap: Record<number, keyof typeof characters_data> = {
      1: 'alex',
    };
    return idToKeyMap[id] || null;
  };

  // Get character data
  const characterKey = getCharacterKey(character);
  const characterData = characterKey ? characters_data[characterKey] : null;

  // Map display labels back to keys
  const mapLabelToKey = useCallback(
    (label: string | undefined, type: 'body' | 'hair' | 'background'): string | null => {
      if (!label || !characterData) {
        return null;
      }

      if (type === 'body') {
        return bodyLabelReverse[label] || null;
      }

      if (type === 'hair') {
        return hairLabelReverse[label] || null;
      }

      if (type === 'background') {
        return backgroundLabelReverse[label] || null;
      }

      return null;
    },
    [backgroundLabelReverse, bodyLabelReverse, characterData, hairLabelReverse],
  );

  // Get images based on selections
  const characterImages = useMemo(() => {
    if (!characterData) return null;

    const bodyKey = body ? mapLabelToKey(body, 'body') : null;
    const hairKey = hair ? mapLabelToKey(hair, 'hair') : null;
    const backgroundKey = background ? mapLabelToKey(background, 'background') : null;

    return {
      body: bodyKey && characterData.body[bodyKey as keyof typeof characterData.body],
      hair: hairKey && characterData.hair[hairKey as keyof typeof characterData.hair],
      background: backgroundKey && characterData.background[backgroundKey as keyof typeof characterData.background],
      cap: accessories === 'Cap' ? characterData.accessories.cap : null,
      glasses: accessories === 'Glasses' ? characterData.accessories.glasses : null,
      ristwatch: accessories === 'Watch' ? characterData.accessories.ristwatch : null,
    };
  }, [accessories, background, body, characterData, hair, mapLabelToKey]);

  // Build customization chips
  const currentCustomizations = useMemo(() => {
    const chips: { label: string; type: string }[] = [];
    const hairSuffix = t('characterPreview.chips.hairSuffix');
    const outfitSuffix = t('characterPreview.chips.outfitSuffix');
    const noAccessoriesLabel = t('characterPreview.chips.noAccessories');

    if (hair) chips.push({ label: `${hair}${hairSuffix}`, type: 'hair' });
    if (emotion) chips.push({ label: emotion, type: 'emotion' });
    if (background) chips.push({ label: background, type: 'background' });
    if (body) chips.push({ label: `${body}${outfitSuffix}`, type: 'outfit' });

    const accessoryKey = accessories ? accessoriesLabelReverse[accessories] : null;
    if (accessoryKey && accessoryKey !== 'none') {
      chips.push({ label: accessories, type: 'accessories' });
    } else {
      chips.push({ label: noAccessoriesLabel, type: 'accessories' });
    }
    return chips;
  }, [accessories, accessoriesLabelReverse, background, body, emotion, hair, t]);

  // Generate video: capture snapshot, upload, create video, navigate to generating screen
  const handleGenerateVideo = async () => {
    console.log('[PreviewCharacherVedio] handleGenerateVideo called');
    console.log('[PreviewCharacherVedio] Route params:', { character, body, hair, accessories, background, emotion, message, speed, voiceTone });

    if (!viewShotRef.current) {
      console.error('[PreviewCharacherVedio] ViewShot ref is null');
      showToast.error(
        t('characterPreview.toast.errorTitle'),
        t('characterPreview.toast.captureFailure'),
      );
      return;
    }

    if (!message || !message.trim()) {
      console.warn('[PreviewCharacherVedio] Message is empty');
      showToast.error(
        t('characterPreview.toast.errorTitle'),
        t('characterPreview.toast.emptyMessage'),
      );
      return;
    }

    console.log('[PreviewCharacherVedio] Starting video generation process...');
    setIsCapturing(true);
    try {
      // Add a small delay to ensure the view is rendered
      console.log('[PreviewCharacherVedio] Waiting for view to render...');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 100));

      if (!viewShotRef.current?.capture) {
        throw new Error('ViewShot capture method not available');
      }

      console.log('[PreviewCharacherVedio] Capturing character preview snapshot...');
      const uri = await viewShotRef.current.capture();
      console.log('[PreviewCharacherVedio] ✅ Character preview captured at:', uri);

      // Extract file info from URI
      const fileName = uri.split('/').pop() || 'character-preview.jpg';
      const fileType = 'image/jpeg';
      console.log('[PreviewCharacherVedio] File info:', { fileName, fileType, uri });

      // Step 1: Upload image to server
      console.log('[PreviewCharacherVedio] Step 1: Uploading image to server...');
      showToast.info(
        t('characterPreview.toast.uploadingTitle'),
        t('characterPreview.toast.uploadingBody'),
      );
      const uploadResult = await uploadImage({
        file: {
          uri,
          type: fileType,
          name: fileName,
        },
      }).unwrap();

      console.log('[PreviewCharacherVedio] Upload response:', JSON.stringify(uploadResult, null, 2));

      // Get image URL from response (checking multiple possible fields)
      const imageUrl = uploadResult?.url || uploadResult?.signedUrl || uploadResult?.data?.url || uploadResult?.data?.signedUrl;
      
      if (!imageUrl) {
        console.error('[PreviewCharacherVedio] ❌ Image URL not found in upload response');
        console.error('[PreviewCharacherVedio] Upload result keys:', Object.keys(uploadResult || {}));
        throw new Error('Image URL not found in upload response');
      }

      console.log('[PreviewCharacherVedio] ✅ Image uploaded successfully, URL:', imageUrl);

      // Step 2: Create video with image URL and message
      console.log('[PreviewCharacherVedio] Step 2: Creating character video...');
      console.log('[PreviewCharacherVedio] Video creation params:', {
        source_url: imageUrl,
        text: message.trim(),
      });
      showToast.info(
        t('characterPreview.toast.creatingTitle'),
        t('characterPreview.toast.creatingBody'),
      );
      const videoResult = await createVideo({
        source_url: imageUrl,
        text: message.trim(),
      }).unwrap();

      console.log('[PreviewCharacherVedio] ✅ Video creation started successfully');
      console.log('[PreviewCharacherVedio] Video creation response:', JSON.stringify(videoResult, null, 2));
      console.log('[PreviewCharacherVedio] Talk ID:', videoResult.talk_id);

      // Step 3: Navigate to GeneratingVedio screen with talk_id
      console.log('[PreviewCharacherVedio] Step 3: Navigating to GeneratingVedio screen...');
      console.log('[PreviewCharacherVedio] Navigation params:', { talkId: videoResult.talk_id });
      navigation.navigate('GeneratingVedio', {
        talkId: videoResult.talk_id,
      });
      console.log('[PreviewCharacherVedio] ✅ Navigation completed');
    } catch (error: any) {
      console.error('[PreviewCharacherVedio] ❌ Error in handleGenerateVideo:', error);
      console.error('[PreviewCharacherVedio] Error details:', {
        message: error?.message,
        data: error?.data,
        status: error?.status,
        stack: error?.stack,
      });
      const errorMessage =
        error?.data?.message || error?.message || t('characterPreview.toast.genericFailure');
      showToast.error(t('characterPreview.toast.errorTitle'), errorMessage);
    } finally {
      setIsCapturing(false);
      console.log('[PreviewCharacherVedio] Video generation process completed');
    }
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          <Header title={t('characterPreview.headerTitle')} showBackButton />
          {!isPlaying && (
            <>
              <Text style={styles.title}>{t('characterPreview.title')}</Text>
              <Text style={styles.subTitle}>{t('characterPreview.subtitle')}</Text>
            </>
          )}
          <View>
        
          <ViewShot
            ref={viewShotRef}
            options={{ format: 'jpg', quality: 0.9 }}
            style={[styles.characterPreviewContainer, isPlaying && { marginTop: metrics.width(30) }]}
          >
            {characterImages && (
              <View style={styles.characterWrapper}>
                {/* Background Image */}
                {characterImages.background && (
                  <Image
                    source={characterImages.background}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                  />
                )}
                
                {/* Body Image */}
                {characterImages.body && (
                  <Image
                    source={characterImages.body}
                    style={styles.bodyImage}
                    resizeMode="contain"
                  />
                )}
                
                {/* Hair Image */}
                {characterImages.hair && (
                  <Image
                    source={characterImages.hair}
                    style={styles.hairImage}
                    resizeMode="contain"
                  />
                )}
                
                {/* Accessories */}
                {characterImages.cap && (
                  <Image
                    source={characterImages.cap}
                    style={styles.accessoryImage}
                    resizeMode="contain"
                  />
                )}
                {characterImages.glasses && (
                  <Image
                    source={characterImages.glasses}
                    style={styles.accessoryImage}
                    resizeMode="contain"
                  />
                )}
                {characterImages.ristwatch && (
                  <Image
                    source={characterImages.ristwatch}
                    style={styles.accessoryImage}
                    resizeMode="contain"
                  />
                )}
              </View>
            )}
            {isPlaying && (
              <TouchableOpacity style={styles.playButtonOverlay}>
                <LiquidGlassBackground style={styles.playIconContainer}>
                  <Svgs.PlayIcon />
                </LiquidGlassBackground>
              </TouchableOpacity>
            )}
          </ViewShot>
          </View>
          {!isPlaying&&<>
            {/* Current Customization Section */}
            <View style={styles.customizationSection}>
            <Text style={styles.customizationTitle}>
              {t('characterPreview.customizationTitle')}
            </Text>
            <View style={styles.chipsContainer}>
              {currentCustomizations.map((customization, index) => (
                <LiquidGlassBackground key={index} style={styles.chip}>
                  <Text style={styles.chipText}>{customization.label}</Text>
                </LiquidGlassBackground>
              ))}
            </View>
            
          </View>
          </>}
        </View>
        <View style={styles.buttonContainer}>
       {/*   <PrimaryButton
            title={isPlaying?"Create Again":'Play'}
            variant="secondary"
            icon={!isPlaying&&<Svgs.PlayIcon height={metrics.width(20)} width={metrics.width(20)} />}
            onPress={() => setIsPlaying(true)}
          />
          <PrimaryButton
            title="Capture Snapshot"
            onPress={handleCaptureSnapshot}
            icon={<Svgs.Downloard />}
            disabled={isCapturing}
          />*/}
          <PrimaryButton
            title={t('characterPreview.buttonGenerate')}
            onPress={handleGenerateVideo}
            disabled={isCapturing || isCreatingVideo}
          />
        </View>
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
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  title2: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(15),
    color: colors.white,
  },
  valueText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
    textAlign: 'center',
    marginTop: metrics.width(5),
  },
  bodyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  generatingVedioImage: {
    height: metrics.width(120),
    width: metrics.width(120),
    marginBottom: metrics.width(11),
  },
  progressContainer: {
    width: '90%',
    marginTop: metrics.width(20),
  },
  progressBarContainer: {},
  buttonContainer: {
    marginHorizontal: 24,
    gap: metrics.width(10),
    marginBottom: metrics.width(40),
  },
  characterPreviewContainer: {
  height:183,
  width:275,
    justifyContent: 'center',
    alignItems: 'center',

    overflow: 'hidden',
    position: 'relative',
  },
  characterWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    width: 275,
    height: 183,
    zIndex: 0,
  },
  bodyImage: {
    position: 'absolute',
    width: 275,
    height: 183,
    zIndex: 1,
  },
  hairImage: {
    position: 'absolute',
    width: 275,
    height: 183,
    zIndex: 2,
  },
  accessoryImage: {
    position: 'absolute',
    width: 275,
    height: 183,
    zIndex: 3,
  },
  playButtonOverlay: {
    position: 'absolute',
    zIndex: 10,
  },
  playIconContainer: {
    borderRadius: 100,
    padding: 10,
  },
  title: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(20),
    color: colors.white,
    marginTop: metrics.width(30),
  },
  subTitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(15),
    color: colors.subtitle,
    marginBottom: metrics.width(30),
    marginTop:metrics.width(5)
  },
  customizationSection: {
    marginTop: metrics.width(20),
    marginBottom: metrics.width(20),
  },
  customizationTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(18),
    color: colors.white,
    marginBottom: metrics.width(15),
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: metrics.width(8),
  },
  chip: {
    borderRadius: 8,
    paddingHorizontal: metrics.width(12),
    paddingVertical: metrics.width(8),
  },
  chipText: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(15),
    color: colors.white,
  },
});
