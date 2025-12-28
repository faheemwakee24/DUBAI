import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { Header } from '../../components/ui';

export default function TermsAndConditions() {
  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Terms & Conditions" showBackButton />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentCard}>
            <Text style={styles.title}>Terms and Conditions</Text>
            <Text style={styles.lastUpdated}>
              Last Updated: {new Date().toLocaleDateString()}
            </Text>

            {/* 1. Acceptance */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
              <Text style={styles.sectionText}>
                By accessing and using the Dub NXT mobile application
                (&quot;App&quot;), you agree to be bound by these Terms and
                Conditions. If you do not agree, please do not use the App.
              </Text>
            </View>

            {/* 2. Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Description of Service</Text>
              <Text style={styles.sectionText}>
                Dub NXT provides an AI-powered platform for character creation,
                video dubbing, voice generation, and video translation. The App
                allows users to:
              </Text>

              <Text style={styles.bulletPoint}>
                • Create AI-generated characters and avatars
              </Text>
              <Text style={styles.bulletPoint}>
                • Upload images or videos for dubbing and translation
              </Text>
              <Text style={styles.bulletPoint}>
                • Generate AI voices and dubbed videos
              </Text>
              <Text style={styles.bulletPoint}>
                • Access subscription-based features and credits
              </Text>
            </View>

            {/* 3. Accounts */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                3. User Accounts and Registration
              </Text>
              <Text style={styles.sectionText}>
                You are responsible for maintaining the confidentiality of your
                account and for all activities that occur under your account.
              </Text>
            </View>

            {/* 4. User Conduct */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                4. User Conduct and Responsibilities
              </Text>
              <Text style={styles.sectionText}>
                You agree not to use the App to:
              </Text>

              <Text style={styles.bulletPoint}>
                • Upload content you do not own or have permission to use
              </Text>
              <Text style={styles.bulletPoint}>
                • Impersonate real people, celebrities, or public figures
              </Text>
              <Text style={styles.bulletPoint}>
                • Upload illegal, harmful, or abusive content
              </Text>
              <Text style={styles.bulletPoint}>
                • Attempt unauthorized access or disrupt the service
              </Text>
            </View>

            {/* 5. AI Disclaimer */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                5. AI-Generated Content Disclaimer
              </Text>
              <Text style={styles.sectionText}>
                Dub NXT uses artificial intelligence to generate characters,
                voices, dubbed videos, and translations. AI-generated content
                may be fictional or inaccurate and does not represent real
                individuals. AI voices are not intended to imitate or
                impersonate real people.
              </Text>
            </View>

            {/* 6. Intellectual Property */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                6. Intellectual Property Rights
              </Text>
              <Text style={styles.sectionText}>
                You retain ownership of your uploaded content. By using the App,
                you grant Dub NXT a limited license to process your content only
                to provide the requested services.
              </Text>
            </View>

            {/* 7. Subscriptions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                7. Subscriptions and Payments
              </Text>
              <Text style={styles.sectionText}>
                Dub NXT offers auto-renewable subscriptions through the Apple App Store. 
                All payments are processed by Apple and subject to Apple's payment policies.
              </Text>

              <Text style={styles.subsectionTitle}>7.1 Subscription Plans</Text>
              <Text style={styles.sectionText}>
                We offer the following monthly subscription plans:
              </Text>
              <Text style={styles.bulletPoint}>
                • Basic Plan - Monthly subscription
              </Text>
              <Text style={styles.bulletPoint}>
                • Creator Plan - Monthly subscription
              </Text>
              <Text style={styles.bulletPoint}>
                • Business Pro Plan - Monthly subscription
              </Text>
              <Text style={styles.sectionText}>
                Subscription prices are displayed in the app and may vary by region. 
                Prices are shown in your local currency at the time of purchase.
              </Text>

              <Text style={styles.subsectionTitle}>7.2 Auto-Renewal</Text>
              <Text style={styles.sectionText}>
                Your subscription will automatically renew at the end of each billing 
                period unless you cancel at least 24 hours before the end of the current 
                period. Payment will be charged to your Apple ID account at the 
                confirmation of purchase.
              </Text>
              <Text style={styles.sectionText}>
                Your account will be charged for renewal within 24 hours prior to the 
                end of the current period. You can manage or cancel your subscription 
                in your Apple ID account settings.
              </Text>

              <Text style={styles.subsectionTitle}>7.3 Cancellation</Text>
              <Text style={styles.sectionText}>
                You can cancel your subscription at any time through your Apple ID 
                account settings. To cancel:
              </Text>
              <Text style={styles.bulletPoint}>
                • Open Settings on your iOS device
              </Text>
              <Text style={styles.bulletPoint}>
                • Tap your name, then tap Subscriptions
              </Text>
              <Text style={styles.bulletPoint}>
                • Select Dub NXT and tap Cancel Subscription
              </Text>
              <Text style={styles.sectionText}>
                Cancellation will take effect at the end of the current billing period. 
                You will continue to have access to subscription features until the end 
                of the current period. No refunds will be provided for the unused 
                portion of the current billing period.
              </Text>

              <Text style={styles.subsectionTitle}>7.4 Refunds</Text>
              <Text style={styles.sectionText}>
                Refunds are handled by Apple according to Apple's refund policy. 
                To request a refund, contact Apple Support or visit:
              </Text>
              <Text style={styles.contactInfo}>
                https://support.apple.com/en-us/HT204084
              </Text>
              <Text style={styles.sectionText}>
                We do not process refunds directly. All refund requests must be 
                submitted through Apple.
              </Text>

              <Text style={styles.subsectionTitle}>7.5 Price Changes</Text>
              <Text style={styles.sectionText}>
                We reserve the right to change subscription prices at any time. 
                You will be notified of any price changes at least 30 days in advance. 
                If you do not wish to accept the new price, you may cancel your 
                subscription before the new price takes effect. If you continue your 
                subscription after the price change, you agree to pay the new price.
              </Text>

              <Text style={styles.subsectionTitle}>7.6 Subscription Features</Text>
              <Text style={styles.sectionText}>
                Each subscription plan includes specific features such as:
              </Text>
              <Text style={styles.bulletPoint}>
                • Number of videos per week
              </Text>
              <Text style={styles.bulletPoint}>
                • Video resolution and quality
              </Text>
              <Text style={styles.bulletPoint}>
                • Watermark options
              </Text>
              <Text style={styles.bulletPoint}>
                • Access to premium AI features
              </Text>
              <Text style={styles.sectionText}>
                Feature availability may vary by subscription plan. Please refer to 
                the subscription details in the app for specific plan features.
              </Text>
            </View>

            {/* 8. Credits */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Credits</Text>
              <Text style={styles.sectionText}>
                Credits are non-transferable and non-refundable and may expire
                based on your subscription plan.
              </Text>
            </View>

            {/* 9. Availability */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                9. Service Availability
              </Text>
              <Text style={styles.sectionText}>
                We do not guarantee uninterrupted or error-free service.
              </Text>
            </View>

            {/* 10. Liability */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                10. Limitation of Liability
              </Text>
              <Text style={styles.sectionText}>
                To the maximum extent permitted by law, Dub NXT shall not be
                liable for indirect or consequential damages.
              </Text>
            </View>

            {/* 11. Termination */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>11. Termination</Text>
              <Text style={styles.sectionText}>
                We may suspend or terminate access for violations of these
                Terms.
              </Text>
            </View>

            {/* 12. Governing Law */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>12. Governing Law</Text>
              <Text style={styles.sectionText}>
                These Terms are governed by applicable local laws.
              </Text>
            </View>

            {/* 13. Contact */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>13. Contact Information</Text>
              <Text style={styles.sectionText}>
                For questions, contact us at:
              </Text>
              <Text style={styles.contactInfo}>
                Email: support@dubnxt.ai
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, marginHorizontal: metrics.width(25) },
  scrollView: { flex: 1 },
  contentContainer: {
    flexGrow: 1,
    paddingTop: metrics.width(20),
    paddingBottom: metrics.width(30),
  },
  contentCard: {
    borderRadius: 12,
    paddingVertical: metrics.width(24),
  },
  title: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(24),
    color: colors.white,
    marginBottom: metrics.width(8),
  },
  lastUpdated: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(12),
    color: colors.subtitle,
    marginBottom: metrics.width(24),
  },
  section: { marginBottom: metrics.width(24) },
  sectionTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(18),
    color: colors.white,
    marginBottom: metrics.width(12),
  },
  sectionText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.subtitle,
    lineHeight: metrics.width(22),
    marginBottom: metrics.width(8),
  },
  bulletPoint: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.subtitle,
    lineHeight: metrics.width(22),
    marginLeft: metrics.width(8),
    marginBottom: metrics.width(4),
  },
  subsectionTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(16),
    color: colors.white,
    marginTop: metrics.width(12),
    marginBottom: metrics.width(8),
  },
  contactInfo: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.primary,
    marginTop: metrics.width(8),
  },
});
