import React, { useCallback, useMemo, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import { Svgs } from '../../assets/icons';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Header,
  LiquidGlassBackground,
  PrimaryButton,
  Shimmer,
} from '../../components/ui';
import { Images } from '../../assets/images';
import { FontFamily } from '../../constants/fonts';
import colors from '../../constants/colors';
import { showToast } from '../../utils/toast';
import {
  useGetSubscriptionPlansQuery,
  useGetMySubscriptionQuery,
  useConfirmIOSSubscriptionMutation,
} from '../../store/api/subscriptionsApi';
import { useIOSPurchases } from '../../hooks/useIOSPurchases';

// Map plan keys to iOS product IDs
const PLAN_TO_IOS_PRODUCT_ID: Record<string, string> = {
  basic: 'com.dubnnxt.basic.monthly',
  creator: 'com.dubnnxt.creator.monthly',
  business_pro: 'com.dubnnxt.business.monthly',
  // Add more mappings as needed
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function Subscription() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [isRestoring, setIsRestoring] = useState(false);

  // Fetch subscription plans and current user subscription
  const { data: plans, isLoading: isLoadingPlans } =
    useGetSubscriptionPlansQuery();
  const { data: mySubscription, isLoading: isLoadingSubscription } =
    useGetMySubscriptionQuery();
  const [confirmIOSSubscription] = useConfirmIOSSubscriptionMutation();
  console.log('plans', JSON.stringify(plans, null, 8));

  // iOS IAP hooks
  const {
    products: iosProducts,
    isLoading: isLoadingIOSProducts,
    fetchProducts: fetchIOSProducts,
    getProductPrice: getIOSProductPrice,
    restorePurchases: restoreIOSPurchases,
  } = useIOSPurchases();

  // Get all iOS product IDs from plans
  const iosProductIds = useMemo(() => {
    if (!plans || Platform.OS !== 'ios') return [];
    return plans
      .map(plan => plan.iosProductId || PLAN_TO_IOS_PRODUCT_ID[plan.key])
      .filter((id): id is string => Boolean(id));
  }, [plans]);

  // Fetch iOS products when plans are loaded (iOS only)
  useEffect(() => {
    if (Platform.OS === 'ios' && iosProductIds.length > 0 && !isLoadingPlans) {
      fetchIOSProducts(iosProductIds);
    }
  }, [iosProductIds, fetchIOSProducts, isLoadingPlans]);

  // Transform API data to match UI structure
  const subscriptionData = useMemo(() => {
    if (!plans) return [];

    // Get current plan key from user's subscription
    // Handle both new structure (with plan object) and old structure (with planId)
    const currentPlanKey =
      mySubscription?.plan?.key ||
      (mySubscription?.planId
        ? plans.find(p => p._id === mySubscription.planId)?.key
        : 'free');

    return plans.map((plan, index) => {
      const isCurrentPlan = plan.key === currentPlanKey;
      const isPopular = plan.key === 'plus' || plan.key === 'premium';

      // Build features array from plan data
      const features = [
        `Resolution: ${plan.resolution}`,
        plan.watermark ? 'Watermark on exports' : 'No watermarks',
        plan.notes,
      ];

      // Get iOS product ID for this plan
      const iosProductId =
        plan.iosProductId || PLAN_TO_IOS_PRODUCT_ID[plan.key];

      // Get price - prefer iOS price if available, otherwise use backend price
      let price: string;
      if (Platform.OS === 'ios' && iosProductId) {
        const iosPrice = getIOSProductPrice(iosProductId);
        if (iosPrice) {
          // iOS price already includes currency symbol (e.g., "$38.99")
          price = iosPrice;
        } else {
          // Fallback to backend price while loading
          price =
            plan.amount === 0 ? '$0' : `$${(plan.amount / 100).toFixed(2)}`;
        }
      } else {
        // Android/Web: Use backend price
        price = plan.amount === 0 ? '$0' : `$${(plan.amount / 100).toFixed(2)}`;
      }

      const period = plan.interval ? `/${plan.interval}` : '';

      // Check if price is still loading (iOS only)
      const isPriceLoading =
        Platform.OS === 'ios' &&
        iosProductId &&
        isLoadingIOSProducts &&
        !getIOSProductPrice(iosProductId);

      const buttonVariant: 'primary' | 'secondary' = isCurrentPlan
        ? 'secondary'
        : isPopular
        ? 'primary'
        : 'secondary';

      return {
        id: plan._id,
        name: plan.name,
        price,
        period,
        icon: Images.FreePlanIcon,
        buttonTitle: isCurrentPlan ? 'Current Plan' : 'Upgrade Now',
        buttonVariant,
        isPopular: isPopular && !isCurrentPlan,
        features,
        isPriceLoading,
        iosProductId,
      };
    });
  }, [plans, mySubscription, getIOSProductPrice, isLoadingIOSProducts]);

  // Handle Restore Purchases (iOS only)
  const handleRestorePurchases = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      showToast.info('Info', 'Restore purchases is only available on iOS');
      return;
    }

    setIsRestoring(true);
    try {
      const purchases = await restoreIOSPurchases();

      if (purchases.length === 0) {
        showToast.info('Info', 'No previous purchases found');
        setIsRestoring(false);
        return;
      }

      // Sync each purchase with backend
      let restoredCount = 0;
      for (const purchase of purchases) {
        try {
          // Find the plan for this product ID
          const productId = purchase.productId;
          const plan = plans?.find(
            p =>
              p.iosProductId === productId ||
              PLAN_TO_IOS_PRODUCT_ID[p.key] === productId,
          );

          if (plan) {
            const receiptData = purchase.purchaseToken || purchase.id || '';
            let transactionId = purchase.id;
            if (
              purchase.platform === 'ios' &&
              'originalTransactionIdentifierIOS' in purchase
            ) {
              transactionId =
                (purchase as any).originalTransactionIdentifierIOS ||
                purchase.id;
            }

            await confirmIOSSubscription({
              planKey: plan.key,
              transactionReceipt: receiptData,
              transactionId: transactionId || '',
              productId: purchase.productId,
            }).unwrap();

            restoredCount++;
          }
        } catch (error: any) {
          console.error('Error restoring purchase:', error);
          // Continue with other purchases even if one fails
        }
      }

      if (restoredCount > 0) {
        showToast.success('Success', `Restored ${restoredCount} purchase(s)`);
      } else {
        showToast.info('Info', 'No valid subscriptions found to restore');
      }
    } catch (error: any) {
      console.error('Error restoring purchases:', error);
      showToast.error('Error', error?.message || 'Failed to restore purchases');
    } finally {
      setIsRestoring(false);
    }
  }, [restoreIOSPurchases, plans, confirmIOSSubscription]);

  // Handle opening subscription management
  const handleManageSubscription = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/account/subscriptions').catch(
        err => {
          console.error('Error opening subscription management:', err);
          showToast.error('Error', 'Unable to open subscription management');
        },
      );
    } else {
      showToast.info(
        'Info',
        'Subscription management is available in your device settings',
      );
    }
  }, []);

  // Render subscription item function for FlatList
  const renderSubscriptionItem = ({
    item,
  }: {
    item: (typeof subscriptionData)[0];
  }) => (
    <LiquidGlassBackground style={styles.debugCotainer}>
      <View style={styles.planContainer}>
        <View style={styles.row1}>
          <Image source={item.icon} style={styles.freePlanIcon} />
          <Text style={styles.freePlanTitle}>{item.name}</Text>
          {item.isPopular && (
            <LiquidGlassBackground style={styles.popularContainer}>
              <Text style={styles.freePlanTitle2}>Popular</Text>
            </LiquidGlassBackground>
          )}
        </View>
        {item.isPriceLoading ? (
          <View style={styles.priceContainer}>
            <Shimmer
              width={metrics.width(100)}
              height={metrics.width(30)}
              borderRadius={4}
            />
          </View>
        ) : (
          <Text style={styles.freePlanSubTitle}>
            {item.price}
            {item.period && (
              <Text style={styles.freePlanSubTitle2}>{item.period}</Text>
            )}
          </Text>
        )}
        <PrimaryButton
          title={item.buttonTitle}
          onPress={() => {
            // Find the original plan data from the plans array
            const selectedPlan = plans?.find(p => p._id === item.id);
            if (selectedPlan) {
              navigation.navigate('SubsCriptionDetail', { plan: selectedPlan });
            }
          }}
          extraContainerStyle={
            item.buttonVariant === 'primary'
              ? styles.buttonContainer2
              : styles.buttonContainer
          }
          variant={item.buttonVariant}
        />
        <View style={styles.includesCotainer}>
          {item.features.map((feature, index) => (
            <View key={index} style={styles.includeItem}>
              <Svgs.TickIcon
                height={metrics.width(16)}
                width={metrics.width(16)}
              />
              <Text style={styles.includeItemTitle}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>
    </LiquidGlassBackground>
  );

  // Render shimmer placeholder for subscription item
  const renderShimmerItem = () => (
    <LiquidGlassBackground style={styles.debugCotainer}>
      <View style={styles.planContainer}>
        <View style={styles.row1}>
          <Shimmer
            width={metrics.width(24)}
            height={metrics.width(24)}
            borderRadius={4}
          />
          <Shimmer
            width={metrics.width(120)}
            height={metrics.width(18)}
            borderRadius={4}
          />
          <Shimmer
            width={metrics.width(60)}
            height={metrics.width(16)}
            borderRadius={8}
            style={styles.popularContainer}
          />
        </View>
        <Shimmer
          width={metrics.width(100)}
          height={metrics.width(30)}
          borderRadius={4}
          style={{ marginTop: metrics.width(15) }}
        />
        <Shimmer
          width="100%"
          height={metrics.width(48)}
          borderRadius={12}
          style={{ marginTop: metrics.width(20) }}
        />
        <View style={styles.includesCotainer}>
          {[1, 2, 3, 4].map((_, index) => (
            <View key={index} style={styles.includeItem}>
              <Shimmer
                width={metrics.width(16)}
                height={metrics.width(16)}
                borderRadius={8}
              />
              <Shimmer
                width={metrics.width(200)}
                height={metrics.width(14)}
                borderRadius={4}
              />
            </View>
          ))}
        </View>
      </View>
    </LiquidGlassBackground>
  );

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Subscription" showBackButton />
        <FlatList<any>
          data={
            isLoadingPlans || isLoadingSubscription
              ? [1, 2, 3]
              : subscriptionData
          }
          renderItem={({ item, index }) =>
            isLoadingPlans || isLoadingSubscription
              ? renderShimmerItem()
              : renderSubscriptionItem({
                  item: item as (typeof subscriptionData)[0],
                })
          }
          keyExtractor={(item, index) =>
            isLoadingPlans || isLoadingSubscription
              ? `shimmer-${index}`
              : (item as (typeof subscriptionData)[0]).id
          }
          style={styles.flatList}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
        {Platform.OS === 'ios' && (
          <>
            <PrimaryButton
              onPress={handleRestorePurchases}
              disabled={isRestoring}
              title={isRestoring ? 'Restoring...' : 'Restore Purchases'}
              variant="primary"
              style={{
                marginTop: metrics.width(10),
              }}
              />
            <TouchableOpacity onPress={handleManageSubscription}>
              <Text style={styles.manageSubscriptionText}>Manage Subscription</Text>
            </TouchableOpacity>
          </>
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
  flatList: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
    paddingTop: metrics.width(20),
  },
  separator: {
    height: metrics.width(20),
  },
  debugCotainer: {},
  planContainer: {
    paddingHorizontal: metrics.width(20),
    paddingVertical: metrics.width(30),
  },
  row1: {
    flexDirection: 'row',
    gap: metrics.width(8),
    alignItems: 'center',
  },
  freePlanIcon: {
    width: metrics.width(24),
    height: metrics.width(24),
    resizeMode: 'contain',
  },
  freePlanTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(18),
    color: colors.white,
  },
  freePlanTitle2: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(12),
    color: colors.white,
  },
  freePlanSubTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(30),
    color: colors.white,
    marginTop: metrics.width(15),
  },
  freePlanSubTitle2: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
  },
  priceContainer: {
    marginTop: metrics.width(15),
  },
  buttonContainer: {
    marginTop: metrics.width(20),
    backgroundColor: colors.white5,
  },
  buttonContainer2: {
    marginTop: metrics.width(20),
  },
  includesCotainer: {
    marginTop: metrics.width(20),
    gap: metrics.width(8),
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.width(10),
  },
  includeItemTitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.subtitle,
  },
  popularContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: 'absolute',
    right: 20,
    borderRadius: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: metrics.width(10),
    marginBottom: metrics.width(5),
  },
  restoreButton: {
    flex: 1,
    paddingVertical: metrics.width(8),
    paddingHorizontal: metrics.width(16),
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreButtonText: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(14),
    color: colors.white,
  },
  manageButton: {
    flex: 1,
    paddingVertical: metrics.width(8),
    paddingHorizontal: metrics.width(16),
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageButtonText: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(14),
    color: colors.white,
  },
  manageSubscriptionText:{
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(14),
    color: colors.primary,
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginTop: metrics.width(10),
  }
});
