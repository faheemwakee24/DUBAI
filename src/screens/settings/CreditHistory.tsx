import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, LiquidGlassBackground, Shimmer } from '../../components/ui';
import {
  useGetCreditHistoryQuery,
  CreditHistoryItem,
} from '../../store/api/usersApi';

type CreditHistoryNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

const ITEMS_PER_PAGE = 10;

export default function CreditHistory() {
  const navigation = useNavigation<CreditHistoryNavigationProp>();
  const [currentPage, setCurrentPage] = useState(1);
  const [allHistoryItems, setAllHistoryItems] = useState<CreditHistoryItem[]>([]);

  const {
    data: creditHistoryData,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
    isFetching: isFetchingHistory,
  } = useGetCreditHistoryQuery({ page: currentPage, limit: ITEMS_PER_PAGE });

  // Accumulate data from pages
  useEffect(() => {
    if (creditHistoryData?.history) {
      if (currentPage === 1) {
        // First page - replace all data
        setAllHistoryItems(creditHistoryData.history);
      } else {
        // Subsequent pages - append data
        setAllHistoryItems(prev => {
          // Avoid duplicates by checking IDs
          const existingIds = new Set(prev.map(item => item.id));
          const newItems = creditHistoryData.history.filter(
            item => !existingIds.has(item.id),
          );
          return [...prev, ...newItems];
        });
      }
    }
  }, [creditHistoryData, currentPage]);

  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    setAllHistoryItems([]);
    refetchHistory();
  }, [refetchHistory]);

  const handleLoadMore = useCallback(() => {
    // Check if there are more items to load
    const hasMore = creditHistoryData && allHistoryItems.length < creditHistoryData.total;
    if (hasMore && !isFetchingHistory && !isLoadingHistory) {
      setCurrentPage(prev => prev + 1);
    }
  }, [
    creditHistoryData?.total,
    allHistoryItems.length,
    isFetchingHistory,
    isLoadingHistory,
  ]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours}h ago`;
    } else if (diffInDays < 7) {
      const days = Math.floor(diffInDays);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const getTypeLabel = (transactionType: string) => {
    switch (transactionType) {
      case 'video_generation':
        return 'Video Generation';
      case 'photo_avatar_generation':
        return 'Photo Avatar';
      case 'image_upload':
        return 'Image Upload';
      case 'video_translation':
        return 'Video Translation';
      default:
        return transactionType;
    }
  };

  const getTypeIcon = (transactionType: string) => {
    switch (transactionType) {
      case 'video_generation':
        return '🎥';
      case 'photo_avatar_generation':
        return '📸';
      case 'image_upload':
        return '🖼️';
      case 'video_translation':
        return '🌐';
      default:
        return '📄';
    }
  };

  // Format credits for display (1 decimal place)
  const formatCredits = (credits: number): string => {
    return credits.toFixed(1);
  };

  // Render shimmer placeholder for credit history item
  const renderShimmerItem = () => (
    <LiquidGlassBackground style={styles.creationCard}>
      <View style={styles.creationRow}>
        <View style={styles.creationLeft}>
          <Shimmer
            width={metrics.width(60)}
            height={metrics.width(60)}
            borderRadius={8}
          />
          <View style={styles.creationInfo}>
            <View style={styles.creationHeader}>
              <Shimmer
                width={metrics.width(150)}
                height={metrics.width(18)}
                borderRadius={4}
              />
              <Shimmer
                width={metrics.width(24)}
                height={metrics.width(24)}
                borderRadius={4}
              />
            </View>
            <Shimmer
              width={metrics.width(200)}
              height={metrics.width(14)}
              borderRadius={4}
              style={{ marginTop: metrics.width(6) }}
            />
            <View style={[styles.creationMeta, { marginTop: metrics.width(6) }]}>
              <View style={styles.creditsInfo}>
                <Shimmer
                  width={metrics.width(50)}
                  height={metrics.width(14)}
                  borderRadius={4}
                />
                <Shimmer
                  width={metrics.width(80)}
                  height={metrics.width(12)}
                  borderRadius={4}
                />
              </View>
              <View style={styles.dot} />
              <Shimmer
                width={metrics.width(60)}
                height={metrics.width(12)}
                borderRadius={4}
              />
            </View>
          </View>
        </View>
      </View>
    </LiquidGlassBackground>
  );

  const renderHistoryItem = ({ item }: { item: CreditHistoryItem }) => {
    // Extract title and subtitle from description or metadata
    let title = item.description || getTypeLabel(item.transactionType);
    let subtitle = '';
    let thumbnailUrl = '';

    // Extract information from metadata based on transaction type
    if (item.transactionType === 'video_translation') {
      title = item.metadata?.title || 'Video Translation';
      subtitle = item.metadata?.output_language || `Duration: ${item.metadata?.video_duration_seconds || 0}s`;
      thumbnailUrl = item.metadata?.video_url || '';
    } else if (item.transactionType === 'photo_avatar_generation') {
      title = item.metadata?.name || 'Photo Avatar Generation';
      subtitle = `${item.metadata?.gender || ''} ${item.metadata?.age || ''}`.trim() || 'Character generation';
    } else if (item.transactionType === 'video_generation') {
      title = item.metadata?.avatar_id || 'Video Generation';
      subtitle = item.metadata?.script_length 
        ? `${item.metadata.script_length} characters`
        : `Duration: ${item.metadata?.estimated_duration_seconds || 0}s`;
    } else if (item.transactionType === 'image_upload') {
      title = 'Image Upload';
      subtitle = 'Custom image';
    }

    return (
      <LiquidGlassBackground style={styles.creationCard}>
        <TouchableOpacity
          style={styles.creationRow}
          onPress={() => {
            // Handle item press if needed
          }}
        >
          <View style={styles.creationLeft}>
            
            <View style={styles.creationInfo}>
              <View style={styles.creationHeader}>
                <Text style={styles.creationTitle} numberOfLines={1}>
                  {title}
                </Text>
                
              </View>
              <Text style={styles.creationSubtitle} numberOfLines={2}>
                {subtitle || item.description}
              </Text>
              <View style={styles.creationMeta}>
                <View style={styles.creditsInfo}>
                  <Text style={styles.creditsSpent}>
                    -{formatCredits(item.creditsSpent)}
                  </Text>
                  <Text style={styles.creditsAfter}>
                    Balance: {formatCredits(item.creditsAfter)}
                  </Text>
                </View>
                <View style={styles.dot} />
                <Text style={styles.timeText}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </LiquidGlassBackground>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyText}>No credit history found</Text>
      <Text style={styles.emptySubText}>
        Your credit transactions will appear here
      </Text>
    </View>
  );

  const renderFooter = () => {
    const hasMore = creditHistoryData && allHistoryItems.length < creditHistoryData.total;
    if (hasMore && isFetchingHistory) {
      return (
        <View style={styles.loadingFooter}>
          <Text style={styles.loadingText}>Loading more...</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Credit History" showBackButton />
        <FlatList<any>
          data={isLoadingHistory && allHistoryItems.length === 0 ? [1, 2, 3, 4, 5] : allHistoryItems}
          renderItem={({ item, index }) =>
            isLoadingHistory && allHistoryItems.length === 0
              ? renderShimmerItem()
              : renderHistoryItem({ item: item as CreditHistoryItem })
          }
          keyExtractor={(item, index) =>
            isLoadingHistory && allHistoryItems.length === 0
              ? `shimmer-${index}`
              : (item as CreditHistoryItem).id
          }
          style={styles.flatList}
          contentContainerStyle={[
            styles.contentContainer,
            allHistoryItems.length === 0 && !isLoadingHistory && styles.emptyContentContainer,
          ]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            !isLoadingHistory ? renderEmptyState : null
          }
          ListFooterComponent={renderFooter}
         
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
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
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: metrics.width(20),
    paddingBottom: metrics.width(20),
  },
  emptyContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  separator: {
    height: metrics.width(10),
  },
  creationCard: {
    borderRadius: 12,
    paddingHorizontal: metrics.width(15),
    paddingVertical: metrics.width(12),
  },
  creationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: metrics.width(12),
  },
  thumbnail: {
    width: metrics.width(60),
    height: metrics.width(60),
    borderRadius: 8,
    backgroundColor: colors.white15,
  },
  thumbnailPlaceholder: {
    width: metrics.width(60),
    height: metrics.width(60),
    borderRadius: 8,
    backgroundColor: colors.white15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: metrics.width(24),
  },
  creationInfo: {
    flex: 1,
    gap: metrics.width(6),
  },
  creationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: metrics.width(8),
  },
  creationTitle: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(15),
    color: colors.white,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: metrics.width(6),
    paddingVertical: metrics.width(2),
    borderRadius: 4,
    backgroundColor: colors.white10,
  },
  typeBadgeText: {
    fontSize: metrics.width(12),
  },
  creationSubtitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
  },
  creationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.width(8),
  },
  statusText: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(12),
  },
  dot: {
    width: metrics.width(4),
    height: metrics.width(4),
    borderRadius: 2,
    backgroundColor: colors.subtitle,
  },
  timeText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(12),
    color: colors.subtitle,
  },
  creditsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.width(8),
  },
  creditsSpent: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(14),
    color: '#FF6B6B',
  },
  creditsAfter: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(12),
    color: colors.subtitle,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: metrics.width(60),
  },
  emptyIcon: {
    fontSize: metrics.width(64),
    marginBottom: metrics.width(16),
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
  loadingFooter: {
    paddingVertical: metrics.width(20),
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.subtitle,
  },
});

