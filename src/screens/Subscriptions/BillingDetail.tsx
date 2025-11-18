import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
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
import { useGetMySubscriptionQuery } from '../../store/api/subscriptionsApi';
import { useCancelSubscriptionMutation } from '../../store/api/subscriptionsApi';
import { showToast } from '../../utils/toast';
import { useTranslation } from 'react-i18next';

type BillingDetailNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function BillingDetail() {
  const navigation = useNavigation<BillingDetailNavigationProp>();
  const [isCanceling, setIsCanceling] = useState(false);
  
  // API hooks
  const { data: mySubscription, isLoading: isLoadingSubscription, refetch: refetchSubscription } =
    useGetMySubscriptionQuery();
  const [cancelSubscription] = useCancelSubscriptionMutation();
  const { t } = useTranslation();

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Current billing information from API
  const currentBillingInfo = {
    paymentMethod: 'VISA', // TODO: Get from payment methods
    nextBillingDate: mySubscription?.currentPeriodEnd ? formatDate(mySubscription.currentPeriodEnd) : 'N/A',
    payment: mySubscription?.amount ? `$${(mySubscription.amount / 100).toFixed(2)}` : '$0',
  };

  // Handle cancel/resume subscription
  const handleCancelSubscription = () => {
    if (!mySubscription) {
      showToast.error('Error', t('billingDetail.subscription.errorNoSubscription'));
      return;
    }

    // If subscription is already set to cancel, show resume option
    if (mySubscription.cancelAtPeriodEnd) {
      Alert.alert(
        t('billingDetail.subscription.resumeTitle'),
        t('billingDetail.subscription.resumeBody'),
        [
          {
            text: t('billingDetail.subscription.keepCanceling'),
            style: 'cancel',
          },
          {
            text: t('billingDetail.subscription.resumeButton'),
            onPress: () => cancelSubscriptionFlow(false), // Setting immediate: false to resume
            style: 'default',
          },
        ],
        { cancelable: true },
      );
      return;
    }

    // Cancel subscription flow
    Alert.alert(
      t('billingDetail.subscription.cancelTitle'),
      t('billingDetail.subscription.cancelBody'),
      [
        {
          text: t('billingDetail.subscription.cancelKeep'),
          style: 'cancel',
        },
        {
          text: t('billingDetail.subscription.cancelPeriodEnd'),
          onPress: () => cancelSubscriptionFlow(false),
          style: 'default',
        },
        {
          text: t('billingDetail.subscription.cancelImmediate'),
          onPress: () => cancelSubscriptionFlow(true),
          style: 'destructive',
        },
      ],
      { cancelable: true },
    );
  };

  const cancelSubscriptionFlow = async (immediate: boolean) => {
    setIsCanceling(true);
    try {
      await cancelSubscription({
        immediate,
      }).unwrap();
      
      showToast.success(
        'Success',
        immediate
          ? t('billingDetail.subscription.successImmediate')
          : t('billingDetail.subscription.successPeriodEnd'),
      );
      
      // Refetch subscription data
      refetchSubscription();
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || t('billingDetail.subscription.errorGeneric');
      showToast.error('Error', errorMessage);
    } finally {
      setIsCanceling(false);
    }
  };

  // Billing history data
  const billingHistoryData = useMemo(
    () => [
      {
        id: '1',
        number: '1',
        date: '9/10/25',
        subscription: 'Pro Plan',
        amount: '$9.99',
      },
      {
        id: '2',
        number: '2',
        date: '9/10/25',
        subscription: 'Pro Plan',
        amount: '$9.99',
      },
      {
        id: '3',
        number: '3',
        date: '9/10/25',
        subscription: 'Pro Plan',
        amount: '$9.99',
      },
      {
        id: '4',
        number: '4',
        date: '9/10/25',
        subscription: 'Pro Plan',
        amount: '$9.99',
      },
      {
        id: '5',
        number: '5',
        date: '9/10/25',
        subscription: 'Pro Plan',
        amount: '$9.99',
      },
    ],
    [],
  );


  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title={t('billingDetail.headerTitle')} showBackButton />
        
        <ScrollView style={styles.contentContainer}>
          {/* Current Billing Information */}
          <LiquidGlassBackground style={styles.billingInfoCard}>
            <View style={styles.billingInfoContent}>
              <View style={styles.billingInfoRow}>
                <Text style={styles.billingInfoLabel}>
                  {t('billingDetail.billingInfo.paymentMethod')}
                </Text>
                <Text style={styles.billingInfoValue}>{currentBillingInfo.paymentMethod}</Text>
              </View>
              <View style={styles.billingInfoRow}>
                <Text style={styles.billingInfoLabel}>
                  {t('billingDetail.billingInfo.nextBillingDate')}
                </Text>
                <Text style={styles.billingInfoValue}>{currentBillingInfo.nextBillingDate}</Text>
              </View>
              <View style={styles.billingInfoRow}>
                <Text style={styles.billingInfoLabel}>
                  {t('billingDetail.billingInfo.payment')}
                </Text>
                <Text style={styles.billingInfoValue}>{currentBillingInfo.payment}</Text>
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <PrimaryButton
                title={t('billingDetail.billingInfo.updateButton')}
                onPress={() => navigation.navigate('PaymentMethodScreen')}
                variant="primary"
                style={styles.updateButton}
                fullWidth
              />
              {mySubscription && mySubscription.status === 'active' && (
                <PrimaryButton
                  title={
                    mySubscription.cancelAtPeriodEnd
                      ? t('billingDetail.subscription.resumeButton')
                      : t('billingDetail.subscription.cancelButton')
                  }
                  onPress={handleCancelSubscription}
                  variant="secondary"
                  style={styles.cancelButton}
                  fullWidth
                  loading={isCanceling}
                  disabled={isCanceling}
                />
              )}
            </View>
          </LiquidGlassBackground>

          {/* Billing History */}
          <View style={styles.tableContainer}>
            {/* Table Header with separate background */}
            <LiquidGlassBackground style={styles.tableHeaderCard}>
              <View style={styles.tableHeader}>
                <Text style={styles.headerTextFirst}>{t('billingDetail.table.number')}</Text>
                <Text style={styles.headerTextOther}>{t('billingDetail.table.date')}</Text>
                <Text style={[styles.headerTextOther]}>
                  {t('billingDetail.table.subscription')}
                </Text>
                <Text style={styles.headerTextOther}>{t('billingDetail.table.amount')}</Text>
              </View>
            </LiquidGlassBackground>
            
            {/* Table Body with separate background */}
            <LiquidGlassBackground style={styles.tableBodyCard}>
              <View style={styles.tableBody}>
                {billingHistoryData.map((item, index) => (
                  <View key={item.id}>
                    <View style={styles.tableRow}>
                      <Text style={styles.cellTextFirst}>{item.number}</Text>
                      <Text style={styles.cellTextOther}>{item.date}</Text>
                      <Text style={styles.cellTextOther}>{item.subscription}</Text>
                      <Text style={styles.cellTextAmount}>{item.amount}</Text>
                    </View>
                    {index < billingHistoryData.length - 1 && (
                      <View style={styles.rowSeparator} />
                    )}
                  </View>
                ))}
              </View>
            </LiquidGlassBackground>
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
    marginHorizontal: metrics.width(25),
  },
  contentContainer: {
    flex: 1,
    marginTop: metrics.width(20),
    gap: metrics.width(20),
  },
  billingInfoCard: {
    borderRadius: 12,
    paddingHorizontal: metrics.width(20),
    paddingVertical: metrics.width(20),
  },
  billingInfoContent: {
    gap: metrics.width(15),
    marginBottom: metrics.width(20),
  },
  billingInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billingInfoLabel: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(15),
    color: colors.subtitle,
  },
  billingInfoValue: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(15),
    color: colors.white,
  },
  buttonContainer: {
    gap: metrics.width(15),
  },
  updateButton: {
    alignSelf: 'center',
    paddingHorizontal: metrics.width(20),
    paddingVertical: metrics.width(12),
  },
  cancelButton: {
    alignSelf: 'center',
    paddingHorizontal: metrics.width(20),
    paddingVertical: metrics.width(12),
  },
  tableContainer: {
    flex: 1,
    gap: metrics.width(10),
    marginTop:metrics.width(30)
  },
  tableHeaderCard: {
    borderRadius: 12,
    paddingHorizontal: metrics.width(20),
    paddingVertical: metrics.width(15),
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableBodyCard: {
    borderRadius: 12,
    paddingVertical: metrics.width(15),
    flex: 1,
  },
  headerText: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(14),
    color: colors.white,
    textAlign: 'left',
  },
  headerTextFirst: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(14),
    color: colors.white,
    textAlign: 'left',
    width: '10%',
  },
  headerTextOther: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(14),
    color: colors.white,
    textAlign: 'left',
    width: '30.67%',
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: metrics.width(20),

    paddingVertical: metrics.width(12),
    alignItems: 'center',
  },
  cellText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.white,
    textAlign: 'left',
  },
  cellTextFirst: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.subtitle,
    textAlign: 'left',
    width: '10%',
  },
  cellTextOther: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.subtitle,
    textAlign: 'left',
    width: '30.67%',
  },
  cellTextAmount: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.subtitle,
 
    width: '30.67%',
  },
  rowSeparator: {
    height: 1,
    backgroundColor: colors.white10,
  },
});
