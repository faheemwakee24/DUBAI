import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
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
import { Header, LiquidGlassBackground } from '../../components/ui';
import { Images } from '../../assets/images';
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
  type Notification,
} from '../../store/api/notificationsApi';
import { showToast } from '../../utils/toast';

type NotificationsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function Notifications() {
  const navigation = useNavigation<NotificationsNavigationProp>();
  const [activeTab, setActiveTab] = useState<'notifications' | 'history'>(
    'notifications',
  );
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch notifications from API
  const {
    data: notificationsResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetNotificationsQuery({ page, limit });

  const [markAllAsRead, { isLoading: isMarkingAllAsRead }] =
    useMarkAllNotificationsAsReadMutation();

  // Get notifications array from response
  const notifications = useMemo(() => {
    return notificationsResponse?.notifications || [];
  }, [notificationsResponse]);

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Get notification icon based on type/status
  const getNotificationIcon = (notification: Notification) => {
    if (notification.image) {
      return { uri: notification.image };
    }

    const status = notification.status?.toLowerCase();
    const type = notification.type?.toLowerCase();

    if (status === 'completed' || type?.includes('completed')) {
      return Images.TickIcon;
    }
    if (status === 'failed' || type?.includes('failed')) {
      return Images.CrossImage;
    }
    if (
      status === 'processing' ||
      type?.includes('started') ||
      type?.includes('processing')
    ) {
      return Images.ProcessingImage;
    }
    return Images.TickIcon; // Default
  };

  // Get notification type for styling
  const getNotificationType = (
    notification: Notification,
  ): 'success' | 'error' | 'processing' => {
    const status = notification.status?.toLowerCase();
    const type = notification.type?.toLowerCase();

    if (status === 'completed' || type?.includes('completed')) {
      return 'success';
    }
    if (status === 'failed' || type?.includes('failed')) {
      return 'error';
    }
    return 'processing';
  };

  // History data
  const historyData = [
    {
      id: '1',
      type: 'translation',
      icon: Images.LanguageImage,
      title: 'Marketing Promo',
      description: 'English → Spanish',
      details: '2:34 min • 8.5 MB',
      timestamp: '2 min ago',
      status: 'processing',
    },
    {
      id: '2',
      type: 'translation',
      icon: Images.LanguageImage,
      title: 'Marketing Promo',
      description: 'English → Spanish',
      details: '2:34 min • 8.5 MB',
      timestamp: '2 min ago',
      status: 'completed',
    },
    {
      id: '3',
      type: 'translation',
      icon: Images.LanguageImage,
      title: 'Marketing Promo',
      description: 'English → Spanish',
      details: '2:34 min • 8.5 MB',
      timestamp: '2 min ago',
      status: 'failed',
    },
    {
      id: '4',
      type: 'character',
      icon: Images.DefaultProfile,
      title: 'Character Clone',
      description: 'Sarah Johnson',
      details: 'Customize • 8.5 MB',
      timestamp: '2 min ago',
      status: 'processing',
    },
    {
      id: '5',
      type: 'character',
      icon: Images.DefaultProfile,
      title: 'Character Clone',
      description: 'Sarah Johnson',
      details: 'Customize • 8.5 MB',
      timestamp: '2 min ago',
      status: 'completed',
    },
    {
      id: '6',
      type: 'character',
      icon: Images.DefaultProfile,
      title: 'Character Clone',
      description: 'Sarah Johnson',
      details: 'Customize • 8.5 MB',
      timestamp: '2 min ago',
      status: 'failed',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.sucessGreen;
      case 'processing':
        return '#FFA500'; // Orange
      case 'failed':
        return '#FF6B6B'; // Red
      default:
        return colors.subtitle;
    }
  };

  const renderNotificationItem = (item: Notification) => {
    const icon = getNotificationIcon(item);
    const isImageUri = typeof icon === 'object' && 'uri' in icon;

    return (
      <LiquidGlassBackground key={item._id} style={styles.notificationCard}>
        <View style={styles.notificationRow}>
          {isImageUri ? (
            <Image source={icon} style={styles.notificationIconImage} />
          ) : (
            <Image source={icon} style={styles.notificationIcon} />
          )}

          <View style={styles.notificationContent}>
            <View style={
              {flexDirection:'row', justifyContent:'space-between',width:'100%'}
            }>
              <Text
                style={styles.notificationTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.title}
              </Text>
              <Text style={styles.notificationTimestamp}>
                {formatTimeAgo(item.createdAt)}
              </Text>
            </View>
            <Text
              style={styles.notificationDescription}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.body}
            </Text>
          </View>
        </View>
      </LiquidGlassBackground>
    );
  };

  const renderHistoryItem = (item: (typeof historyData)[0]) => (
    <LiquidGlassBackground key={item.id} style={styles.historyCard}>
      <View style={styles.historyRow}>
        <Image source={item.icon} style={styles.historyIcon} />
        <View style={styles.historyContent}>
          <Text style={styles.historyTitle}>{item.title}</Text>
          <Text style={styles.historyDescription}>{item.description}</Text>
          <Text style={styles.historyDetails}>{item.details}</Text>
        </View>
        <View style={styles.historyRight}>
          <Text style={styles.historyTimestamp}>{item.timestamp}</Text>
          <Text
            style={[
              styles.historyStatus,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
    </LiquidGlassBackground>
  );

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllAsRead().unwrap();
      showToast.success(
        'Success',
        `Marked ${result.count || 'all'} notifications as read`,
      );
      // Refetch notifications to update the UI
      await refetch();
    } catch (error: any) {
      console.error('Error marking all as read:', error);
      const errorMessage =
        error?.data?.message || error?.message || 'Failed to mark all as read';
      showToast.error('Error', errorMessage);
    }
  };

  const onRefresh = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Activity Center" showBackButton />

        {/* Tab Bar */}
        

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && notifications.length > 0}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {activeTab === 'notifications' ? (
            <View style={styles.notificationsList}>
              {isLoading ? (
                <Text style={styles.loadingText}>Loading notifications...</Text>
              ) : error ? (
                <Text style={styles.errorText}>
                  Failed to load notifications
                </Text>
              ) : notifications.length > 0 ? (
                notifications.map(renderNotificationItem)
              ) : (
                <Text style={styles.emptyText}>No notifications found</Text>
              )}
            </View>
          ) : (
            <View style={styles.historyList}>
              {historyData.map(renderHistoryItem)}
            </View>
          )}
        </ScrollView>

        {/* Mark All as Read Button */}
        {activeTab === 'notifications' && notifications.length > 0 && (
          <View style={styles.markAllButtonContainer}>
            <PrimaryButton
              title={isMarkingAllAsRead ? 'Marking...' : 'Mark All as read'}
              onPress={handleMarkAllAsRead}
              variant="primary"
              extraContainerStyle={styles.markAllButton}
              disabled={isMarkingAllAsRead}
            />
          </View>
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
  tabContainer: {
    flexDirection: 'row',
    marginTop: metrics.width(20),
    marginBottom: metrics.width(20),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tab: {
    borderRadius: 8,
    width: '49%',
  },
  tabContent: {
    paddingVertical: metrics.width(12),
    paddingHorizontal: metrics.width(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary,
    paddingVertical: metrics.width(12),
    paddingHorizontal: metrics.width(20),
    borderRadius: 8,
    alignItems: 'center',
    width: '49%',
  },
  tabText: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(14),
    color: colors.white,
  },
  activeTabText: {
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 100, // Space for the fixed button
  },
  notificationsList: {
    gap: metrics.width(15),
  },
  notificationCard: {
    borderRadius: 12,
    paddingHorizontal: metrics.width(16),
    paddingVertical: metrics.width(20),
  },
  notificationRow: {
    flexDirection: 'row',

    gap: metrics.width(15),
  },
  iconContainer: {
    width: metrics.width(40),
    height: metrics.width(40),
    borderRadius: 20,
    backgroundColor: colors.white10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    width: metrics.width(42),
    height: metrics.width(42),
    resizeMode: 'contain',
  },
  notificationIconImage: {
    width: metrics.width(42),
    height: metrics.width(42),
    borderRadius: metrics.width(21),
    resizeMode: 'cover',
  },
  notificationContent: {
    flex: 1,
    gap: metrics.width(4),
  },
  notificationTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(15),
    color: colors.white,
    width: '60%',
  },
  notificationDescription: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
  },
  notificationTimestamp: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(12),
    color: colors.subtitle,
  },
  historyList: {
    gap: metrics.width(15),
  },
  historyCard: {
    borderRadius: 12,
    paddingHorizontal: metrics.width(20),
    paddingVertical: metrics.width(15),
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.width(15),
  },
  historyIconContainer: {
    width: metrics.width(42),
    height: metrics.width(42),
    borderRadius: 20,
    backgroundColor: colors.white10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyIcon: {
    width: metrics.width(40),
    height: metrics.width(40),
    resizeMode: 'contain',
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(15),
    color: colors.white,
    marginBottom: metrics.width(4),
  },
  historyDescription: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
    marginBottom: metrics.width(11),
  },
  historyDetails: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.white,
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: metrics.width(4),
    justifyContent: 'space-between',
    height: '100%',
    maxHeight: metrics.width(70),
  },
  historyTimestamp: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(11),
    color: colors.subtitle,
  },
  historyStatus: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(13),
  },
  markAllButton: {
    marginBottom: metrics.width(25),
    paddingVertical: metrics.width(9),
    paddingHorizontal: metrics.width(20),
    borderRadius: 8,
  },
  markAllButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  loadingText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.subtitle,
    textAlign: 'center',
    marginTop: metrics.width(20),
  },
  errorText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: metrics.width(20),
  },
  emptyText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.subtitle,
    textAlign: 'center',
    marginTop: metrics.width(20),
  },
});
