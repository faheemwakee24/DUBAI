import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStripe, usePaymentSheet } from '@stripe/stripe-react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import { Header, PrimaryButton, LiquidGlassBackground } from '../../components/ui';
import { metrics } from '../../constants/metrics';
import { FontFamily } from '../../constants/fonts';
import colors from '../../constants/colors';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { showToast } from '../../utils/toast';
import { useCreatePaymentMethodMutation, useCreateSetupIntentMutation } from '../../store/api/paymentsApi';
import { useTranslation } from 'react-i18next';

type PaymentMethodNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function PaymentMethodScreen() {
  const navigation = useNavigation<PaymentMethodNavigationProp>();
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentSheetReady, setIsPaymentSheetReady] = useState(false);
  
  const [savePaymentMethodToBackend] = useCreatePaymentMethodMutation();
  const [createSetupIntent] = useCreateSetupIntentMutation();
  const { t } = useTranslation();

  // Initialize PaymentSheet when component mounts
  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const initializePaymentSheet = async () => {
    try {
      setIsLoading(true);
      
      // Step 1: Create setup intent on backend for saving payment method
      const setupIntentResult = await createSetupIntent({
        paymentMethodId: '', // Will be collected by PaymentSheet
      }).unwrap();

      if (!setupIntentResult.setupIntent.clientSecret) {
        showToast.error('Error', t('paymentMethod.errors.generic'));
        setIsLoading(false);
        return;
      }

      // Step 2: Initialize Stripe PaymentSheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'DubAI',
        setupIntentClientSecret: setupIntentResult.setupIntent.clientSecret,
        allowsDelayedPaymentMethods: false,
        returnURL: 'dubai://stripe-redirect',
      });

      if (initError) {
        showToast.error('Error', initError.message);
        setIsLoading(false);
        return;
      }

      setIsPaymentSheetReady(true);
      setIsLoading(false);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || t('paymentMethod.errors.generic');
      showToast.error('Error', errorMessage);
      setIsLoading(false);
    }
  };

  const handleSavePaymentMethod = async () => {
    if (!isPaymentSheetReady) {
      showToast.error('Error', t('paymentMethod.errors.sheetNotReady'));
      return;
    }

    setIsLoading(true);
    try {
      // Present Stripe's built-in PaymentSheet modal
      const { error: presentError, paymentOption } = await presentPaymentSheet();

      if (presentError) {
        // User cancelled or there was an error
        if (presentError.code !== 'Canceled') {
          showToast.error('Error', presentError.message);
        }
        setIsLoading(false);
        return;
      }

      if (paymentOption) {
        // Payment method was successfully saved
        // Get the payment method ID from the setup intent
        try {
          // The setup intent will have the payment method attached
          // We need to get it from the backend or PaymentSheet
          showToast.success(t('paymentMethod.success.title'), t('paymentMethod.success.message'));
          setTimeout(() => {
            navigation.goBack();
          }, 1500);
        } catch (saveError: any) {
          const errorMessage =
            saveError?.data?.message || saveError?.message || t('paymentMethod.errors.saveFailed');
          showToast.error('Error', errorMessage);
        }
      }
    } catch (error: any) {
      showToast.error('Error', error?.message || t('paymentMethod.errors.saveFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title={t('paymentMethod.headerTitle')} showBackButton />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <LiquidGlassBackground style={styles.cardContainer}>
              <Text style={styles.sectionTitle}>{t('paymentMethod.sectionTitle')}</Text>
              <Text style={styles.description}>
                {t('paymentMethod.description')}
              </Text>

              <View style={styles.testCardContainer}>
                <Text style={styles.hintTitle}>{t('paymentMethod.testCards')}</Text>
                {(
                  t('paymentMethod.testCardList', {
                    returnObjects: true,
                  }) as string[]
                ).map(line => (
                  <Text key={line} style={styles.hintText}>
                    {line}
                  </Text>
                ))}
              </View>
            </LiquidGlassBackground>

            <PrimaryButton
              title={
                isPaymentSheetReady
                  ? t('paymentMethod.buttons.addCard')
                  : t('paymentMethod.buttons.loading')
              }
              onPress={handleSavePaymentMethod}
              variant="primary"
              style={styles.saveButton}
              fullWidth
             // loading={isLoading}
              //disabled={!isPaymentSheetReady || isLoading}
            />
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: metrics.width(20),
    paddingBottom: metrics.width(20),
  },
  cardContainer: {
    borderRadius: 12,
    paddingHorizontal: metrics.width(20),
    paddingVertical: metrics.width(25),
    marginBottom: metrics.width(20),
    gap: metrics.width(15),
  },
  sectionTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(18),
    color: colors.white,
    marginBottom: metrics.width(15),
  },
  description: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.subtitle,
    marginBottom: metrics.width(20),
    lineHeight: metrics.width(20),
  },
  hintTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(14),
    color: colors.white,
    marginTop: metrics.width(10),
    marginBottom: metrics.width(5),
  },
  hintText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(12),
    color: colors.subtitle,
    marginTop: metrics.width(3),
  },
  testCardContainer: {
    marginTop: metrics.width(10),
  },
  saveButton: {
    marginTop: metrics.width(10),
  },
});

