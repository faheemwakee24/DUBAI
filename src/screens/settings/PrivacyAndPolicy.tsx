import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { Header } from '../../components/ui';

export default function PrivacyAndPolicy() {
  // IMPORTANT: fixed date for Play Store reviewers
  const LAST_UPDATED = 'December 2025';

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Privacy & Policy" showBackButton />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentCard}>
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.lastUpdated}>Last Updated: {LAST_UPDATED}</Text>

            {/* 1. Overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Overview</Text>
              <Text style={styles.sectionText}>
                Dub NXT (“we”, “our”, or “us”) respects your privacy. This Privacy
                Policy explains how we collect, use, and protect your information
                when you use the Dub NXT mobile application and its AI-powered
                features.
              </Text>
            </View>

            {/* 2. Information We Collect */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Information We Collect</Text>

              <Text style={styles.bulletPoint}>
                • Account information (name, email address, login method)
              </Text>
              <Text style={styles.bulletPoint}>
                • User IDs (internal identifiers used to manage accounts)
              </Text>
              <Text style={styles.bulletPoint}>
                • User-generated content such as images, videos, and text prompts
                submitted for processing
              </Text>

              <Text style={styles.sectionText}>
                We may also collect limited device information (such as device or
                installation identifiers and push notification tokens) required
                for app functionality, security, and notifications.
              </Text>

              <Text style={styles.sectionText}>
                Dub NXT does not require users to upload audio files. Audio
                available in the app may be provided from our services and
                selected by the user.
              </Text>
            </View>

            {/* 3. How We Use Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>

              <Text style={styles.bulletPoint}>
                • Provide core app functionality (image-based speech and video
                translation)
              </Text>
              <Text style={styles.bulletPoint}>
                • Authenticate users via Google, Apple, or Email
              </Text>
              <Text style={styles.bulletPoint}>
                • Manage subscriptions and account status
              </Text>
              <Text style={styles.bulletPoint}>
                • Send service-related notifications (if enabled)
              </Text>
              <Text style={styles.bulletPoint}>
                • Maintain security and prevent fraud
              </Text>

              <Text style={styles.sectionText}>
                We do not sell personal data or use it for advertising.
              </Text>
            </View>

            {/* 4. AI & Media Processing */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. AI & Media Processing</Text>
              <Text style={styles.sectionText}>
                When you upload images or videos or provide text prompts, your
                content may be transmitted securely to our backend and processed
                using third-party AI services solely to deliver the requested
                functionality.
              </Text>
              <Text style={styles.sectionText}>
                Uploaded content is processed temporarily and is not used for
                advertising or profiling.
              </Text>
            </View>

            {/* 5. Payments */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Payments & Subscriptions</Text>
              <Text style={styles.sectionText}>
                Payments and subscriptions are processed by Stripe. Checkout is
                opened in the user’s external browser. Dub NXT does not collect
                or store payment card details within the app.
              </Text>
              <Text style={styles.sectionText}>
                Your email address may be shared with Stripe solely to initiate
                checkout and manage subscriptions.
              </Text>
            </View>

            {/* 6. Data Sharing */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Data Sharing</Text>
              <Text style={styles.sectionText}>
                We may share limited information with trusted service providers
                such as authentication providers, AI processing services, push
                notification providers, and our payment processor, only as
                necessary to provide the app’s functionality and comply with
                legal obligations.
              </Text>
              <Text style={styles.sectionText}>
                We do not sell or rent personal information.
              </Text>
            </View>

            {/* 7. Security */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Data Security</Text>
              <Text style={styles.sectionText}>
                We use reasonable administrative, technical, and organizational
                safeguards to protect your information. All data is encrypted in
                transit using HTTPS/TLS.
              </Text>
            </View>

            {/* 8. Data Retention */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Data Retention</Text>
              <Text style={styles.sectionText}>
                Account data is retained while your account is active. Uploaded
                images, videos, and prompts are processed temporarily and removed
                when no longer required for the requested feature, unless
                retention is required by law.
              </Text>
            </View>

            {/* 9. User Rights & Account Deletion */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. Your Rights and Choices</Text>

              <Text style={styles.bulletPoint}>
                • Access or update your account information
              </Text>
              <Text style={styles.bulletPoint}>
                • Delete your account and associated data directly from within
                the app using the “Delete Account” option
              </Text>
              <Text style={styles.bulletPoint}>
                • Request account deletion via our website if you no longer have
                access to the app
              </Text>
              <Text style={styles.bulletPoint}>
                • Disable push notifications through your device settings
              </Text>
            </View>

            {/* 10. Children */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>10. Children’s Privacy</Text>
              <Text style={styles.sectionText}>
                Dub NXT is intended for users aged 13 and older. We do not
                knowingly collect personal information from children under 13.
              </Text>
            </View>

            {/* 11. Policy Updates */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>11. Changes to This Policy</Text>
              <Text style={styles.sectionText}>
                We may update this Privacy Policy from time to time. Changes will
                be reflected by updating the “Last Updated” date above.
              </Text>
            </View>

            {/* 12. Contact */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>12. Contact Us</Text>
              <Text style={styles.sectionText}>
                If you have questions about this Privacy Policy or your data,
                contact us:
              </Text>
              <Text style={styles.contactInfo}>support@dubnxt.ai</Text>
              <Text style={[styles.sectionText, { marginTop: metrics.width(8) }]}>
                Account deletion (web): https://dubnxt.ai/deleteaccount
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
  contactInfo: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.primary,
    lineHeight: metrics.width(22),
    marginTop: metrics.width(8),
  },
});
