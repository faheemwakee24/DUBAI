import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  Text,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { FontFamily } from '../../constants/fonts';
import { Header, LiquidGlassBackground, Checkbox } from '../../components/ui';
import { Images } from '../../assets/images';

export default function AvatarCustomization() {
  const [beard, setBeard] = useState(false);
  const [lips, setLips] = useState(false);
  const [eyes, setEyes] = useState(false);
  const [cap, setCap] = useState(false);
  const [glasses, setGlasses] = useState(false);

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Customize Avatar" showBackButton />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Display Section */}
          <View style={styles.avatarContainer}>
            <LiquidGlassBackground style={styles.avatarBackground}>
              <View style={styles.avatarWrapper}>
                {/* Body Image */}
                <Image
                  source={Images.CharacterBody}
                  style={styles.bodyImage}
                  resizeMode="contain"
                />
                
                {/* Overlay Images - Only show if checked */}
                {eyes && (
                  <Image
                    source={Images.CharacterEye}
                    style={[styles.overlayImage, styles.eyesOverlay]}
                    resizeMode="contain"
                  />
                )}
                {lips && (
                  <Image
                    source={Images.CharacterLips}
                    style={[styles.overlayImage, styles.lipsOverlay]}
                    resizeMode="contain"
                  />
                )}
                {beard && (
                  <Image
                    source={Images.CharacterBeard}
                    style={[styles.overlayImage, styles.beardOverlay]}
                    resizeMode="contain"
                  />
                )}
                {glasses && (
                  <Image
                    source={Images.CharacterGlasses}
                    style={[styles.overlayImage, styles.glassesOverlay]}
                    resizeMode="contain"
                  />
                )}
                {cap && (
                  <Image
                    source={Images.CharacterCap}
                    style={[styles.overlayImage, styles.capOverlay]}
                    resizeMode="contain"
                  />
                )}
              </View>
            </LiquidGlassBackground>
          </View>

          {/* Checkboxes Section */}
          <View style={styles.checkboxesContainer}>
            <LiquidGlassBackground style={styles.checkboxesBackground}>
              <View style={styles.checkboxesContent}>
                <Text style={styles.sectionTitle}>Customize Features</Text>
                
                <View style={styles.checkboxesList}>
                  <Checkbox
                    label="Beard"
                    value={beard}
                    onValueChange={setBeard}
                  />
                  <Checkbox
                    label="Lips"
                    value={lips}
                    onValueChange={setLips}
                  />
                  <Checkbox
                    label="Eyes"
                    value={eyes}
                    onValueChange={setEyes}
                  />
                  <Checkbox
                    label="Cap"
                    value={cap}
                    onValueChange={setCap}
                  />
                  <Checkbox
                    label="Glasses"
                    value={glasses}
                    onValueChange={setGlasses}
                  />
                </View>
              </View>
            </LiquidGlassBackground>
          </View>
        </ScrollView>
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
    paddingTop: metrics.width(20),
    paddingBottom: metrics.width(40),
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: metrics.width(30),
  },
  avatarBackground: {
    width: '100%',
    borderRadius: 16,
    padding: metrics.width(20),
  },
  avatarWrapper: {
    width: '100%',
    height: metrics.width(400),
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyImage: {
    width: 300,
    height: 300,
    position: 'absolute',
    marginTop:50
  },
  overlayImage: {
    position: 'absolute',
    width: 300,
    height: 300,
    
  },
  eyesOverlay: {
    zIndex: 3,
  },
  lipsOverlay: {
    zIndex: 2,
  },
  beardOverlay: {
    zIndex: 1,
  },
  glassesOverlay: {
    zIndex: 5,
  },
  capOverlay: {
    zIndex: 6,
  },
  checkboxesContainer: {
    marginTop: metrics.width(20),
  },
  checkboxesBackground: {
    borderRadius: 16,
    padding: metrics.width(20),
  },
  checkboxesContent: {
    gap: metrics.width(20),
  },
  sectionTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(20),
    color: colors.white,
  },
  checkboxesList: {
    gap: metrics.width(20),
  },
});

