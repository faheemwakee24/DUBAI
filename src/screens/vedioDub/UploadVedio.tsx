import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import PrimaryButton from '../../components/ui/PrimaryButton';
import Input from '../../components/ui/Input';

import { FontFamily, Typography } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { Svgs } from '../../assets/icons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, LiquidGlassBackground } from '../../components/ui';
import { Images } from '../../assets/images';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function UploadVedio() {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Header
            title="Video Dubbing"
            showBackButton
            RigthIcon={
              <Svgs.HistoryIcon
                height={metrics.width(20)}
                width={metrics.width(20)}
              />
            }
          />
          <LiquidGlassBackground style={styles.liquidCotaier}>
            <View style={styles.imageContainer}>
              <Image source={Images.UploadVedio} />
              <Text style={styles.title}>Upload your Video</Text>
              <Text style={styles.subtitle}>
                Drag and drop or click to browse
              </Text>
              <PrimaryButton
                title="Select File"
                onPress={() => navigation.navigate('SelectVedioDescription')}
                variant="primary"
                size="small"
                extraContainerStyle={styles.button}
              />
            </View>
         
          </LiquidGlassBackground>

          <Text style={styles.title2}>How it Works</Text>
          <View style={styles.howItWorksContainer}>
            <View style={styles.stepContainer}>
              <LinearGradient
                colors={colors.gradientLine}
                style={styles.gradientLine}
              />

              <View style={styles.roww}>
                <Image source={Images.Elipse} style={styles.elipse} />
                <Text style={styles.stepText}>
                  Upload your video in any language
                </Text>
              </View>
              <View style={styles.roww}>
                <Image source={Images.Elipse} style={styles.elipse} />
                <Text style={styles.stepText}>
                  AI detects the original language{' '}
                </Text>
              </View>
              <View style={styles.roww}>
                <Image source={Images.Elipse} style={styles.elipse} />
                <Text style={styles.stepText}>
                  Select target language and voice{' '}
                </Text>
              </View>
              <View style={styles.roww}>
                <Image source={Images.Elipse} style={styles.elipse} />
                <Text style={styles.stepText}>
                  Generate dubbed video with lip-sync{' '}
                </Text>
              </View>
            </View>
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
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  liquidCotaier: {},
  title: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(17),
    color: colors.white,
    marginTop: metrics.width(10),
  },
  subtitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
    marginTop: metrics.width(5),
  },
  imageContainer: {
    paddingVertical: metrics.width(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    borderRadius: 8,
    paddingHorizontal: metrics.width(20),
    marginTop: metrics.width(25),
    paddingVertical: metrics.width(5),
  },
  title2: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(17),
    color: colors.white,
    marginTop: metrics.width(40),
  },
  howItWorksContainer: {
    flexDirection: 'row',
    marginTop: metrics.width(20),
  },
  roww: {
    flexDirection: 'row',
    gap: metrics.width(10),
  },
  stepText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(17),
    color: colors.subtitle,
  },
  stepContainer: {
    gap: metrics.width(20),
  },
  elipse: {
    width: metrics.width(20),
    height: metrics.width(20),
  },
  gradientLine: {
    height: '100%',
    width: 1,
    zIndex: -1,
    left: 9.5,
    marginTop: 8,
    position: 'absolute',
  },
  vedioIcon2:{
    height:metrics.width(100),
    width:metrics.width(100),
    resizeMode:'contain'
  }
});
