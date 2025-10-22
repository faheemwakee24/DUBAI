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

export default function RecentProjects() {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  // Sample data for FlatList
  const projectData = [
    { id: '1', title: 'Project Title 1', platform: 'Facebook', videoCount: '5 Videos' },
    { id: '2', title: 'Project Title 2', platform: 'Instagram', videoCount: '3 Videos' },
    { id: '3', title: 'Project Title 3', platform: 'YouTube', videoCount: '8 Videos' },
    { id: '4', title: 'Project Title 4', platform: 'TikTok', videoCount: '12 Videos' },
  ];

  // Render item function for FlatList
  const renderProjectItem = ({ item }: { item: typeof projectData[0] }) => (
    <LiquidGlassBackground style={styles.ProjectOuterContainer} onPress={()=>navigation.navigate('ProjectVedios')} disabled={false}>
      <View style={styles.projectInnerContainer}>
        <Image source={Images.ProjectIcon} style={styles.projectIcon} />
        <View style={styles.projectDataContainer}>
          <Text style={styles.projectTitle}>{item.title}</Text>
          <View style={styles.projectSubTitleContainer}>
            <Text style={styles.projectSubTitle}>{item.platform}</Text>
            <View style={styles.dot}/>
            <Text style={styles.vediocCout}>{item.videoCount}</Text>
          </View>
        </View>
      </View>
    </LiquidGlassBackground>
  );

  // Handler functions for all dropdowns

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Recent Projects" showBackButton />
        <FlatList
          data={projectData}
          renderItem={renderProjectItem}
          keyExtractor={(item) => item.id}
          style={styles.flatList}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        <PrimaryButton
          title="Create Project"
          onPress={() => navigation.navigate('NewProject')}
          variant="primary"
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
  flatList: {
    flex: 1,
    marginTop: metrics.width(30),
  },
  contentContainer: {
    paddingBottom: 40,
  },
  separator: {
    height: 20,
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
    height: metrics.width(47),
    width: metrics.width(47),
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
    alignItems:'center'
  },
  projectSubTitle:{
    fontFamily:FontFamily.spaceGrotesk.regular,
    fontSize:metrics.width(13),
    color:colors.primary
  },
  dot:{
    height:metrics.width(4),
    width:metrics.width(4),
    borderRadius:100,
    backgroundColor:colors.subtitle
  },
  vediocCout:{
    fontFamily:FontFamily.spaceGrotesk.regular,
    fontSize:metrics.width(13),
    color:colors.subtitle
  }
});
