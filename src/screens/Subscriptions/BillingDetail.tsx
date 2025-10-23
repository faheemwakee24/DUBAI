import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
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

type BillingDetailNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function BillingDetail() {
  const navigation = useNavigation<BillingDetailNavigationProp>();

  // Current billing information
  const currentBillingInfo = {
    paymentMethod: 'VISA',
    nextBillingDate: 'Nov 15, 2025',
    payment: '$9.99',
  };

  // Billing history data
  const billingHistoryData = [
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
      number: '4',
      date: '9/10/25',
      subscription: 'Pro Plan',
      amount: '$9.99',
    },
  ];


  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Billing History" showBackButton />
        
        <ScrollView style={styles.contentContainer}>
          {/* Current Billing Information */}
          <LiquidGlassBackground style={styles.billingInfoCard}>
            <View style={styles.billingInfoContent}>
              <View style={styles.billingInfoRow}>
                <Text style={styles.billingInfoLabel}>Payment Method</Text>
                <Text style={styles.billingInfoValue}>{currentBillingInfo.paymentMethod}</Text>
              </View>
              <View style={styles.billingInfoRow}>
                <Text style={styles.billingInfoLabel}>Next Billing Date</Text>
                <Text style={styles.billingInfoValue}>{currentBillingInfo.nextBillingDate}</Text>
              </View>
              <View style={styles.billingInfoRow}>
                <Text style={styles.billingInfoLabel}>Payment</Text>
                <Text style={styles.billingInfoValue}>{currentBillingInfo.payment}</Text>
              </View>
            </View>
            <PrimaryButton
              title="Update Payment Method"
              onPress={() => {}}
              variant="primary"
              style={styles.updateButton}
              fullWidth
            />
          </LiquidGlassBackground>

          {/* Billing History */}
          <View style={styles.tableContainer}>
            {/* Table Header with separate background */}
            <LiquidGlassBackground style={styles.tableHeaderCard}>
              <View style={styles.tableHeader}>
                <Text style={styles.headerTextFirst}>#</Text>
                <Text style={styles.headerTextOther}>Date</Text>
                <Text style={[styles.headerTextOther]}>Subscription</Text>
                <Text style={styles.headerTextOther}>Amount</Text>
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
  updateButton: {
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
