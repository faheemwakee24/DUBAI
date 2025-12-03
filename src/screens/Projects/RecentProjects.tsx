import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
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
  ConfirmationModal,
} from '../../components/ui';
import { Images } from '../../assets/images';
import { Svgs } from '../../assets/icons';
import { useGetProjectsQuery, useDeleteProjectMutation, Project } from '../../store/api/projectsApi';
import { showToast } from '../../utils';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function RecentProjects() {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  // Fetch projects from API
  const { data: projects, isLoading, refetch, isFetching } = useGetProjectsQuery();
  
  // Filter to show only active projects
  const activeProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter(project => project.isActive === true);
  }, [projects]);
  
  // Delete project mutation
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();
  
  // State for delete confirmation
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  
  // State for tracking loaded images
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
     const response =  await deleteProject(projectToDelete.id).unwrap();
     console.log('response', response);
      showToast.success('Success', 'Project deleted successfully');
      setProjectToDelete(null);
      // Refetch projects list
      refetch();
    } catch (error: any) {
      console.error('[RecentProjects] Delete error:', error);
      const errorMessage =
        error?.data?.message || error?.message || 'Failed to delete project';
      showToast.error('Error', errorMessage);
      setProjectToDelete(null);
    }
  };

  // Handle delete button press
  const handleDeletePress = (item: Project, e: any) => {
    e.stopPropagation();
    setProjectToDelete(item);
  };

  // Handle image load
  const handleImageLoad = (imageUrl: string) => {
    setLoadedImages(prev => new Set(prev).add(imageUrl));
  };

  // Render item function for FlatList
  const renderProjectItem = ({ item }: { item: Project }) => {
    const imageUrl = item?.imageUrl;
    const imageSource = imageUrl ? { uri: imageUrl } : Images.ProjectIcon;
    const isImageLoaded = imageUrl ? loadedImages.has(imageUrl) : true;
    
    return (
      <LiquidGlassBackground
        style={styles.ProjectOuterContainer}
        onPress={() => navigation.navigate('ProjectVedios', { projectId: item.id })}
        disabled={false}
      >
        <View style={styles.projectInnerContainer}>
          <View style={styles.projectIconContainer}>
            {!isImageLoaded && imageUrl && (
              <View style={styles.imageShimmerContainer}>
                <Shimmer
                  width={metrics.width(47)}
                  height={metrics.width(47)}
                  borderRadius={100}
                />
              </View>
            )}
            <Image
              source={imageSource}
              style={[
                styles.projectIcon,
                !isImageLoaded && styles.hiddenImage,
              ]}
              onLoad={() => imageUrl && handleImageLoad(imageUrl)}
            />
          </View>
        <View style={styles.projectDataContainer}>
          <Text style={styles.projectTitle} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
          <View style={styles.projectSubTitleContainer}>
            <Text style={styles.projectSubTitle} numberOfLines={1} ellipsizeMode="tail">
              {item.description}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={(e) => handleDeletePress(item, e)}
          style={styles.deleteButton}
          activeOpacity={0.7}
          disabled={isDeleting}
        >
          <Svgs.Delete
            width={metrics.width(20)}
            height={metrics.width(20)}
          
          />
        </TouchableOpacity>
      </View>
    </LiquidGlassBackground>
    );
  };

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

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Recent Projects" showBackButton />
        <FlatList<any>
          data={isLoading ? [1, 2, 3, 4] : activeProjects}
          renderItem={({ item, index }) =>
            isLoading ? renderShimmerItem() : renderProjectItem({ item: item as Project })
          }
          keyExtractor={(item, index) =>
            isLoading ? `shimmer-${index}` : (item as Project).id
          }
          style={styles.flatList}
          contentContainerStyle={[
            styles.contentContainer,
            (!activeProjects || activeProjects.length === 0) && !isLoading && styles.emptyContentContainer,
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

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          visible={!!projectToDelete}
          text={`Are you sure you want to delete "${projectToDelete?.name}"? This action cannot be undone.`}
          acceptButtonText="Delete"
          cancelButtonText="Cancel"
          onAccept={handleDeleteConfirm}
          onCancel={() => setProjectToDelete(null)}
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
    alignItems: 'center',
  },
  ProjectOuterContainer: {
    borderRadius: 12,
  },
  projectIconContainer: {
    height: metrics.width(47),
    width: metrics.width(47),
    borderRadius: 100,
    overflow: 'hidden',
    position: 'relative',
  },
  projectIcon: {
    height: metrics.width(47),
    width: metrics.width(47),
    borderRadius: 100,
  },
  imageShimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 100,
    overflow: 'hidden',
  },
  hiddenImage: {
    opacity: 0,
  },
  projectDataContainer: {
    gap: metrics.width(7),
    flex: 1,
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
  deleteButton: {
    padding: metrics.width(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
