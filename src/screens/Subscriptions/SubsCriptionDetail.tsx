import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Linking,
  Alert,
  AppState,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { Svgs } from '../../assets/icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, LiquidGlassBackground } from '../../components/ui';
import { Images } from '../../assets/images';
import { useStripe } from '@stripe/stripe-react-native';
import { showToast } from '../../utils/toast';
import {
  useCreatePaymentIntentMutation,
  useConfirmPaymentMutation,
  useGetPaymentMethodsQuery,
} from '../../store/api/paymentsApi';
import {
  useGetMySubscriptionQuery,
  useGetSubscriptionPlansQuery,
  useCheckoutSubscriptionMutation,
  useCancelSubscriptionMutation,
  useConfirmSubscriptionMutation,
} from '../../store/api/subscriptionsApi';

type SubsCriptionDetailRouteProp = RouteProp<
  RootStackParamList,
  'SubsCriptionDetail'
>;
type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SubsCriptionDetail'
>;

export default function SubsCriptionDetail() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route = useRoute<SubsCriptionDetailRouteProp>();
  const { createPaymentMethod, confirmPayment } = useStripe();
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const appState = useRef(AppState.currentState);

  // Get plan from route params
  const selectedPlan = route.params?.plan;
  console.log('selectedPlan', JSON.stringify(selectedPlan));

  // API hooks
  const { data: paymentMethods, isLoading: isLoadingPaymentMethods } =
    useGetPaymentMethodsQuery();
  const { data: mySubscription, isLoading: isLoadingSubscription } =
    useGetMySubscriptionQuery();
  const { data: plans, isLoading: isLoadingPlans } =
    useGetSubscriptionPlansQuery();
  const [checkoutSubscription] = useCheckoutSubscriptionMutation();
  const [cancelSubscription] = useCancelSubscriptionMutation();
  const [confirmSubscription] = useConfirmSubscriptionMutation();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  const [confirmPaymentIntent] = useConfirmPaymentMutation();
  console.log('mySubscription', JSON.stringify(mySubscription));

  // Confirm subscription after returning from URL
  const handleConfirmSubscriptionAfterReturn = useCallback(async () => {
    if (!pendingSessionId) {
      return;
    }

    setIsProcessing(true);
    try {
      const result = await confirmSubscription({
        sessionId: pendingSessionId,
      }).unwrap();
      
      console.log('Confirm subscription result:', JSON.stringify(result));

      // Show success message with subscription details
      const planName = result.plan?.name || 'Subscription';
      showToast.success('Success', `${planName} activated successfully!`);
      
      // Clear pending session ID
      setPendingSessionId(null);
      
      // Navigate back after success
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        'Failed to confirm subscription. Please try again.';
      showToast.error('Error', errorMessage);
      // Clear pending session ID on error so user can try again
      setPendingSessionId(null);
    } finally {
      setIsProcessing(false);
    }
  }, [pendingSessionId, confirmSubscription, navigation]);

  // Handle app state changes to detect when returning from URL
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        pendingSessionId
      ) {
        // App has come to the foreground, call confirm API
        handleConfirmSubscriptionAfterReturn();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [pendingSessionId, handleConfirmSubscriptionAfterReturn]);
  // Get current plan data
  const currentPlan = useMemo(() => {
    if (mySubscription?.plan) {
      return mySubscription.plan.key;
    }
    if (mySubscription?.planId) {
      return plans?.find(p => p._id === mySubscription.planId)?.key || 'free';
    }
    return 'free';
  }, [mySubscription, plans]);

  // Check if selected plan is the current plan
  const isCurrentPlan = useMemo(() => {
    if (!selectedPlan || !currentPlan) return false;
    return selectedPlan._id === currentPlan || selectedPlan.key === currentPlan;
  }, [selectedPlan, currentPlan]);

  // Calculate subscription info
  const subscriptionInfo = useMemo(() => {
    if (!selectedPlan) return null;

    const currentPlanName = currentPlan || 'Free';
    const newPlanName = selectedPlan.name;
    const monthlyCost =
      selectedPlan.amount === 0
        ? '$0'
        : `$${(selectedPlan.amount / 100).toFixed(2)}`;

    return {
      currentPlanName,
      newPlanName,
      monthlyCost,
      isUpgrade:
        (typeof selectedPlan.amount === 'number' ? selectedPlan.amount : 0) >
        (typeof currentPlan === 'number' ? currentPlan : 0),
    };
  }, [selectedPlan, currentPlan]);

  // Handle cancel subscription for current paid plan
  const handleCancelSubscription = () => {
    if (!selectedPlan || selectedPlan.amount === 0) {
      return;
    }

    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will have access until the end of your current billing period.',
      [
        {
          text: 'No, Keep Subscription',
          style: 'cancel',
        },
        {
          text: 'Cancel at Period End',
          onPress: () => cancelSubscriptionFlow(false),
          style: 'default',
        },
        {
          text: 'Cancel Immediately',
          onPress: () => cancelSubscriptionFlow(true),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const cancelSubscriptionFlow = async (immediate: boolean) => {
    setIsProcessing(true);
    try {
      await cancelSubscription({
        immediate,
      }).unwrap();

      showToast.success(
        'Success',
        immediate
          ? 'Subscription canceled immediately'
          : 'Subscription will be canceled at the end of the billing period'
      );

      // Navigate back after success
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        'Failed to cancel subscription. Please try again.';
      showToast.error('Error', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmSubscription = async () => {
    if (!selectedPlan) {
      showToast.error('Error', 'No plan selected');
      return;
    }

    setIsProcessing(true);
    try {
      // Step 1: Checkout subscription using planKey
      const checkoutResult = await checkoutSubscription({
        planKey: selectedPlan.key,
      }).unwrap();
      console.log('checkoutResult', JSON.stringify(checkoutResult));
      console.log('id', checkoutResult.id);

      // Store sessionId for confirmation after returning from URL
      setPendingSessionId(checkoutResult.id);

      // Open the checkout URL
      const canOpen = await Linking.canOpenURL(checkoutResult.url);
      if (canOpen) {
        await Linking.openURL(checkoutResult.url);
        // Don't set processing to false here - wait for app to return
        // The confirm API will be called when app returns to foreground
        // Processing state will be managed by handleConfirmSubscriptionAfterReturn
      } else {
        showToast.error('Error', 'Unable to open checkout URL');
        setPendingSessionId(null);
        setIsProcessing(false);
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        'Failed to process subscription. Please try again.';
      showToast.error('Error', errorMessage);
      setPendingSessionId(null);
      setIsProcessing(false);
    }
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Subscription" showBackButton />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {subscriptionInfo && selectedPlan ? (
            <View style={styles.dashboardContainer}>
              <Text style={styles.title}>
                {subscriptionInfo.isUpgrade
                  ? 'Upgrade your Plan'
                  : 'Change your Plan'}
              </Text>
              <Text style={styles.subTitle}>
                {subscriptionInfo.isUpgrade
                  ? `You're upgrading from ${subscriptionInfo.currentPlanName} to ${subscriptionInfo.newPlanName}. You'll be charged ${subscriptionInfo.monthlyCost} per ${selectedPlan.interval}.`
                  : `You're changing from ${subscriptionInfo.currentPlanName} to ${subscriptionInfo.newPlanName}.`}
              </Text>
              <LiquidGlassBackground style={styles.liquidBackgroundContainer}>
                <View style={styles.liquidBackgroundContentContainer}>
                  <View style={styles.roww}>
                    <Text style={styles.currentPlanTitle}>Current Plan:</Text>
                    <Text style={styles.currentPlanValue}>
                      {subscriptionInfo.currentPlanName}
                    </Text>
                  </View>
                  <View style={styles.roww}>
                    <Text style={styles.currentPlanTitle}>New Plan:</Text>
                    <Text style={styles.currentPlanValue}>
                      {subscriptionInfo.newPlanName}
                    </Text>
                  </View>
                  <View style={styles.roww}>
                    <Text style={styles.currentPlanTitle}>Monthly Cost:</Text>
                    <Text style={styles.currentPlanValue}>
                      {subscriptionInfo.monthlyCost}
                    </Text>
                  </View>
                  {selectedPlan.notes && (
                    <View style={styles.notesContainer}>
                      <Text style={styles.notesText}>{selectedPlan.notes}</Text>
                    </View>
                  )}
                </View>
              </LiquidGlassBackground>
            </View>
          ) : (
            <View style={styles.dashboardContainer}>
              <Text style={styles.title}>Loading...</Text>
            </View>
          )}
        </ScrollView>

        {!isCurrentPlan ? (
          // Only show button if plan is not free
          selectedPlan?.amount !== 0 && (
            <PrimaryButton
              title="Confirm & Pay"
              onPress={handleConfirmSubscription}
              variant="primary"
              style={{
                marginBottom: metrics.width(25),
              }}
              loading={isProcessing}
              disabled={!selectedPlan || isProcessing}
            />
          )
        ) : (
          <>
            {selectedPlan && selectedPlan.amount > 0 && (
              <PrimaryButton
                title="Cancel Subscription"
                onPress={handleCancelSubscription}
                variant="secondary"
                style={{
                  marginBottom: metrics.width(15),
                }}
                loading={isProcessing}
                disabled={isProcessing}
              />
            )}
            <PrimaryButton
              title="Back"
              onPress={() => navigation.goBack()}
              variant="secondary"
              style={{
                marginBottom: metrics.width(25),
              }}
            />
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: metrics.width(17),
    marginHorizontal: metrics.width(25),
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.width(10),
  },
  title: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(20),
    color: colors.white,
  },
  subTitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(15),
    color: colors.subtitle,
    marginBottom: metrics.width(30),
  },
  profileImage: {
    width: metrics.width(48),
    height: metrics.width(48),
    borderRadius: 100,
    overflow: 'hidden',
  },
  profileImageBackground: {},
  headerLeftContainerText: {
    gap: metrics.width(4),
  },
  headerRightContainer: {
    gap: metrics.width(8),
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRightIconBackground: {
    padding: metrics.width(10),
  },
  dashboardContainer: {
    flex: 1,
    marginTop: metrics.width(30),
  },
  dashboardCard: {
    paddingHorizontal: metrics.width(16),
    paddingVertical: metrics.width(22),
    borderRadius: 12,
    backgroundColor: colors.white15,
  },
  ProPlanIconImage: {
    width: metrics.width(50),
    height: metrics.width(50),
    resizeMode: 'contain',
  },
  ProPlanIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: metrics.width(10),
  },
  ProPlanTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(15),
    color: colors.white,
  },
  propPlanIconTextContainer: {
    gap: metrics.width(15),
    color: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ProPlanSubTitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(11),
    color: colors.subtitle,
    marginTop: metrics.width(4),
  },
  upgradeButton: {},
  button: {
    borderRadius: 8,
    paddingHorizontal: metrics.width(15),
  },
  debugCotainer: {
    paddingHorizontal: metrics.width(17),
    paddingVertical: metrics.width(20),
    marginTop: metrics.width(40),
  },
  debugTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(20),
    color: colors.white,
    lineHeight: metrics.width(27),
  },
  debuggingSubtitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
    marginTop: metrics.width(4),
  },
  row: {
    flexDirection: 'row',
    marginTop: metrics.width(11),
    marginBottom: metrics.width(70),
  },
  createButton: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(12),
    color: colors.white,
  },
  vedioIcon2: {
    height: metrics.width(150),
    width: metrics.width(150),
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: 0,
  },
  characherIcon: {
    height: metrics.width(200),
    width: metrics.width(200),
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: -25,
    right: -15,
  },
  createButtonContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: metrics.width(13),
    paddingVertical: metrics.width(6),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  CharacterCreationContainer: {
    paddingHorizontal: metrics.width(17),
    paddingVertical: metrics.width(20),
    marginTop: metrics.width(9),
    borderWidth: 0.8,
    borderColor: colors.primary40,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: -12,
    },
    shadowOpacity: 0.1,
    shadowRadius: 0.1,

    elevation: 7,
    backgroundColor: colors.primary3,
  },
  columnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: metrics.width(15),
  },
  tempCharacherTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(16),
    color: colors.white,
    marginTop: metrics.width(10),
    margin: metrics.width(10),
  },
  tempCharacher: {
    height: metrics.screenWidth * 0.41,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    flex: 1,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  tempCharacherImage: {
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
  },
  selectedCharacter: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tempCharacherContainer: {
    gap: metrics.width(15),
  },
  liquidBackgroundContainer: {
    borderRadius: 12,
  },
  liquidBackgroundContentContainer: {
    marginHorizontal: metrics.width(12),
    marginVertical: metrics.width(16),
    gap: metrics.width(12),
  },
  roww: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentPlanTitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(15),
    color: colors.subtitle,
  },
  currentPlanValue: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(15),
    color: colors.white,
  },
  notesContainer: {
    marginTop: metrics.width(12),
    paddingTop: metrics.width(12),
    borderTopWidth: 1,
    borderTopColor: colors.white15,
  },
  notesText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
    lineHeight: metrics.width(18),
  },
});
