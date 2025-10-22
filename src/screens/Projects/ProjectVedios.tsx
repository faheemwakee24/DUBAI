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
  LanguageDropdown,
  CustomDropdown,
  Input,
} from '../../components/ui';
import { Images } from '../../assets/images';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function ProjectVedios() {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  // Video data for FlatList
  const videoData = [
    {
      id: '1',
      title: 'Marketing Campaign Video',
      subtitle: 'Facebook Ad Campaign',
      status: 'Completed',
      statusTime: '2 hours ago',
      thumbnail: Images.TempAnchorImage,
    },
    {
      id: '2',
      title: 'Product Demo Video',
      subtitle: 'Instagram Story',
      status: 'Processing',
      statusTime: '1 hour ago',
      thumbnail: Images.TempAnchorImage,
    },
    {
      id: '3',
      title: 'Tutorial Video',
      subtitle: 'YouTube Channel',
      status: 'Completed',
      statusTime: '3 hours ago',
      thumbnail: Images.TempAnchorImage,
    },
    {
      id: '4',
      title: 'Behind the Scenes',
      subtitle: 'TikTok Content',
      status: 'Failed',
      statusTime: '4 hours ago',
      thumbnail: Images.TempAnchorImage,
    },
    {
      id: '5',
      title: 'Customer Testimonial',
      subtitle: 'LinkedIn Post',
      status: 'Completed',
      statusTime: '5 hours ago',
      thumbnail: Images.TempAnchorImage,
    },
    {
      id: '6',
      title: 'Brand Story Video',
      subtitle: 'Twitter Thread',
      status: 'Processing',
      statusTime: '6 hours ago',
      thumbnail: Images.TempAnchorImage,
    },
  ];

  // Render video item function for FlatList
  const renderVideoItem = ({ item }: { item: (typeof videoData)[0] }) => (
    <LiquidGlassBackground style={styles.projectCard}>
      <ImageBackground source={item.thumbnail} style={styles.projectIcon}>
        <LiquidGlassBackground style={styles.downloadIcon}>
            <View style={styles.downloadIconContainer}>
          <Svgs.Downloard />
          </View>
        </LiquidGlassBackground>
      </ImageBackground>
      <View style={styles.projectBodyCotainer}>
        <Text
          style={styles.projectTitle}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.title}
        </Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <View style={styles.rowSpaceBetween}>
          <Text
            style={[
              styles.status,
              item.status === 'Completed' && { color: colors.sucessGreen },
              item.status === 'Processing' && { color: colors.primary },
              item.status === 'Failed' && { color: '#FF6B6B' },
            ]}
          >
            {item.status}
          </Text>
          <Text style={styles.statusTime}>{item.statusTime}</Text>
        </View>
        <PrimaryButton
          title="Play"
          onPress={() => {}}
          extraContainerStyle={styles.buttonContainer}
          textStyle={styles.text}
        />
      </View>
    </LiquidGlassBackground>
  );

  // Handler functions for all dropdowns

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Facebook Videos" showBackButton />

        <FlatList
          data={videoData}
          renderItem={renderVideoItem}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          style={styles.flatList}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  flatList: {
    flex: 1,
    marginTop: metrics.width(20),
  },
  contentContainer: {
    paddingBottom: 40,
  },
  separator: {
    height: 15,
  },
  row: {
    justifyContent: 'space-between',
    gap: metrics.width(10),
  },
  projectInnerContainer: {
    marginHorizontal: metrics.width(16),
    marginVertical: metrics.width(20),
    flexDirection: 'row',
    gap: metrics.width(16),
  },
  ProjectOuterContainer: {
    borderRadius: 12,
  },
  projectIcon: {
    height: metrics.width(140),
    width: '100%',
  },
  projectDataContainer: {
    gap: metrics.width(7),
  },
  projectTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(15),
    color: colors.white,
  },
  projectSubTitleContainer: {
    flexDirection: 'row',
    gap: metrics.width(5),
    alignItems: 'center',
  },
  projectSubTitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.primary,
  },
  dot: {
    height: metrics.width(4),
    width: metrics.width(4),
    borderRadius: 100,
    backgroundColor: colors.subtitle,
  },
  vediocCout: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
  },
  projectCard: {
    gap: metrics.width(11),
    flex: 1,
    borderRadius: 12,
  },
  projectBodyCotainer: {
    margin: metrics.width(10),
    gap: metrics.width(5),
  },
  subtitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  status: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(11),
    color: colors.sucessGreen,
  },
  statusTime: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(11),
    color: colors.subtitle,
  },
  buttonContainer: {
    paddingVertical: metrics.width(6),
    minHeight: 15,
    borderRadius: 8,
    marginTop: metrics.width(10),
  },
  text: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(13),
    color: colors.white,
  },
  downloadIcon: {
    right: 10,
    height: 28,
    width: 28,
    top:10,
    borderRadius: 8,
    justifyContent:'center',
    alignItems:'center',
    position:'absolute',
  },
  downloadIconContainer:{
    height: 28,
    width: 28,
    justifyContent:'center',
    alignItems:'center'
  }
});
