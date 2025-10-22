import React from 'react';
import { View, StyleSheet, FlatList, Image, Text, TouchableOpacity } from 'react-native';
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
} from '../../components/ui';
import { Images } from '../../assets/images';
import { FontFamily } from '../../constants/fonts';
import colors from '../../constants/colors';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function Subscription() {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  // Subscription plans data
  const subscriptionData = [
    {
      id: '1',
      name: 'Free Plan',
      price: '$0',
      period: '/month',
      icon: Images.FreePlanIcon,
      buttonTitle: 'Current Plan',
      buttonVariant: 'secondary' as const,
      isPopular: false,
      features: [
        '5 video dubs per month',
        '3 character videos per month',
        'Up to 2 min video length',
        'Standard processing speed',
        'Watermark on exports',
      ],
    },
    {
      id: '2',
      name: 'Pro',
      price: '$9.99',
      period: '/month',
      icon: Images.FreePlanIcon,
      buttonTitle: 'Upgrade Now',
      buttonVariant: 'primary' as const,
      isPopular: true,
      features: [
        'Unlimited video dubbing',
        'Up to 30 min video length',
        'Priority processing (3x faster)',
        'No watermarks',
        '50+ languages & voices',
        'HD export quality',
      ],
    },
    {
      id: '3',
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      icon: Images.FreePlanIcon,
      buttonTitle: 'Upgrade Now',
      buttonVariant: 'secondary' as const,
      isPopular: false,
      features: [
        'Everything in Pro',
        'Unlimited video length',
        'Custom voice cloning',
        'API access',
        'Dedicated support',
        'Team collaboration',
        'Custom branding',
      ],
    },
  ];

  // Render subscription item function for FlatList
  const renderSubscriptionItem = ({ item }: { item: typeof subscriptionData[0] }) => (
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
        <Text style={styles.freePlanSubTitle}>
          {item.price}
          {item.period && <Text style={styles.freePlanSubTitle2}>{item.period}</Text>}
        </Text>
        <PrimaryButton
          title={item.buttonTitle}
          onPress={() => navigation.navigate('SubsCriptionDetail')}
          extraContainerStyle={
            item.buttonVariant === 'primary' ? styles.buttonContainer2 : styles.buttonContainer
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

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Subscription"
          showBackButton
          RigthIcon={
            <TouchableOpacity onPress={() => navigation.navigate('BillingDetail')}>
              <Svgs.HistoryIcon
                height={metrics.width(20)}
                width={metrics.width(20)}
              />
            </TouchableOpacity>
          }
        />
        <FlatList
          data={subscriptionData}
          renderItem={renderSubscriptionItem}
          keyExtractor={(item) => item.id}
          style={styles.flatList}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  popularContainer:{

    paddingHorizontal:10,
    paddingVertical:5,
    position:'absolute',
    right:20,
    borderRadius:8
  }
});
