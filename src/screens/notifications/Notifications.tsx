import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
import { Header, LiquidGlassBackground } from '../../components/ui';
import { Images } from '../../assets/images';

type NotificationsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function Notifications() {
  const navigation = useNavigation<NotificationsNavigationProp>();
  const [activeTab, setActiveTab] = useState<'notifications' | 'history'>(
    'notifications',
  );

  // Notification data
  const notificationData = [
    {
      id: '1',
      type: 'success',
      icon: Images.TickIcon,
      title: 'Video Ready',
      description: 'Video dubbed successfully',
      timestamp: '2 min ago',
    },
    {
      id: '2',
      type: 'error',
      icon: Images.CrossImage,
      title: 'Upload Failed',
      description: 'Video dubbed successfully',
      timestamp: '10:00 am',
    },
    {
      id: '3',
      type: 'processing',
      icon: Images.ProcessingImage,
      title: 'Character Processing',
      description: 'Avatar SARAH is being generated...',
      timestamp: '5 Oct',
    },
  ];

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

  const renderNotificationItem = (item: (typeof notificationData)[0]) => (
    <LiquidGlassBackground key={item.id} style={styles.notificationCard}>
      <View style={styles.notificationRow}>
        <Image source={item.icon} style={styles.notificationIcon} />

        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationDescription}>{item.description}</Text>
        </View>
        <Text style={styles.notificationTimestamp}>{item.timestamp}</Text>
      </View>
    </LiquidGlassBackground>
  );

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

  const handleMarkAllAsRead = () => {
    console.log('Mark all as read pressed');
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Activity Center" showBackButton />

        {/* Tab Bar */}
        <View style={styles.tabContainer}>
          {activeTab === 'notifications' ? (
            <TouchableOpacity
              style={[styles.tab, styles.activeTab]}
              onPress={() => setActiveTab('notifications')}
            >
              <Text style={[styles.tabText, styles.activeTabText]}>
                Notifications
              </Text>
            </TouchableOpacity>
          ) : (
            <LiquidGlassBackground style={styles.tab}>
              <TouchableOpacity
                style={styles.tabContent}
                onPress={() => setActiveTab('notifications')}
              >
                <Text style={styles.tabText}>
                  Notifications
                </Text>
              </TouchableOpacity>
            </LiquidGlassBackground>
          )}
          
          {activeTab === 'history' ? (
            <TouchableOpacity
              style={[styles.tab, styles.activeTab]}
              onPress={() => setActiveTab('history')}
            >
              <Text style={[styles.tabText, styles.activeTabText]}>
                History
              </Text>
            </TouchableOpacity>
          ) : (
            <LiquidGlassBackground style={styles.tab}>
              <TouchableOpacity
                style={styles.tabContent}
                onPress={() => setActiveTab('history')}
              >
                <Text style={styles.tabText}>
                  History
                </Text>
              </TouchableOpacity>
            </LiquidGlassBackground>
          )}
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'notifications' ? (
            <View style={styles.notificationsList}>
              {notificationData.map(renderNotificationItem)}
            </View>
          ) : (
            <View style={styles.historyList}>
              {historyData.map(renderHistoryItem)}
            </View>
          )}
        </ScrollView>

        {/* Mark All as Read Button */}
        {activeTab === 'notifications' && (
          <View style={styles.markAllButtonContainer}>
            <PrimaryButton
              title="Mark All as read"
              onPress={handleMarkAllAsRead}
              variant="primary"
              extraContainerStyle={styles.markAllButton}
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
    alignItems:'center',
    justifyContent:'space-between'
  },
  tab: {
    borderRadius: 8,
    width:'49%'
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
    width:'49%'
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
  notificationContent: {
    flex: 1,
    gap: metrics.width(4),
  },
  notificationTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(15),
    color: colors.white,
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
});
