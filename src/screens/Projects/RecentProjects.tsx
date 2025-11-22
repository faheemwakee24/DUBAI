import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
import {
  Header,
  LiquidGlassBackground,
  Shimmer,
} from '../../components/ui';
import { Images } from '../../assets/images';
import { useGetProjectsQuery, Project } from '../../store/api/projectsApi';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function RecentProjects() {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  // Fetch projects from API
  const { data: projects, isLoading, refetch, isFetching } = useGetProjectsQuery();

  // Render item function for FlatList
  const renderProjectItem = ({ item }: { item: Project }) => (
    <LiquidGlassBackground
      style={styles.ProjectOuterContainer}
      onPress={() => navigation.navigate('ProjectVedios', { projectId: item.id })}
      disabled={false}
    >
      <View style={styles.projectInnerContainer}>
        <Image source={Images.ProjectIcon} style={styles.projectIcon} />
        <View style={styles.projectDataContainer}>
          <Text style={styles.projectTitle} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
          <View style={styles.projectSubTitleContainer}>
            <Text style={styles.projectSubTitle} numberOfLines={1} ellipsizeMode="tail">
              {item.description}
            </Text>
          </View>
        </View>
      </View>
    </LiquidGlassBackground>
  );

  // Render shimmer placeholder for project item
  const renderShimmerItem = () => (
    <LiquidGlassBackground style={styles.ProjectOuterContainer}>
      <View style={styles.projectInnerContainer}>
        <Shimmer
          width={metrics.width(47)}
          height={metrics.width(47)}
          borderRadius={12}
        />
        <View style={styles.projectDataContainer}>
          <Shimmer width={metrics.width(150)} height={metrics.width(18)} borderRadius={4} />
          <View style={styles.projectSubTitleContainer}>
            <Shimmer width={metrics.width(80)} height={metrics.width(14)} borderRadius={4} />
           
          </View>
        </View>
      </View>
    </LiquidGlassBackground>
  );

  // Render error or empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No projects found</Text>
      <Text style={styles.emptySubText}>
        Create your first project to get started
      </Text>
    </View>
  );

  // Handler functions for all dropdowns
console.log('projects', projects);

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Recent Projects" showBackButton />
        <FlatList<any>
          data={isLoading ? [1, 2, 3, 4] : (projects || [])}
          renderItem={({ item, index }) =>
            isLoading ? renderShimmerItem() : renderProjectItem({ item: item as Project })
          }
          keyExtractor={(item, index) =>
            isLoading ? `shimmer-${index}` : (item as Project).id
          }
          style={styles.flatList}
          contentContainerStyle={[
            styles.contentContainer,
            (!projects || projects.length === 0) && !isLoading && styles.emptyContentContainer,
          ]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={!isLoading ? renderEmptyState : null}
          refreshing={isFetching}
          onRefresh={refetch}
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
    maxWidth:'85%'
  },
  projectSubTitleContainer: {
    flexDirection: 'row',
    gap: metrics.width(5),
    alignItems:'center'
  },
  projectSubTitle:{
    fontFamily:FontFamily.spaceGrotesk.regular,
    fontSize:metrics.width(13),
    color:colors.primary,
    maxWidth:metrics.screenWidth*0.6
  },
  dot:{
    height:metrics.width(4),
    width:metrics.width(4),
    borderRadius:100,
    backgroundColor:colors.subtitle
  },
  vediocCout: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: metrics.width(40),
  },
  emptyText: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(18),
    color: colors.white,
    marginBottom: metrics.width(8),
  },
  emptySubText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.subtitle,
    textAlign: 'center',
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
});
