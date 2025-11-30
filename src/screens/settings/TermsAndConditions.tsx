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
            <Text style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</Text>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
              <Text style={styles.sectionText}>
                By accessing and using the DebNxt mobile application ("App"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Description of Service</Text>
              <Text style={styles.sectionText}>
                DebNxt provides an AI-powered platform for video dubbing, character creation, voice generation, and related multimedia services. The service allows users to:
              </Text>
              <Text style={styles.bulletPoint}>
                • Create and customize AI avatars and characters
              </Text>
              <Text style={styles.bulletPoint}>
                • Generate videos with AI-generated voices and translations
              </Text>
              <Text style={styles.bulletPoint}>
                • Upload and process images and videos for dubbing
              </Text>
              <Text style={styles.bulletPoint}>
                • Manage projects and access subscription-based features
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. User Accounts and Registration</Text>
              <Text style={styles.sectionText}>
                To access certain features of the App, you must register for an account. You agree to:
              </Text>
              <Text style={styles.bulletPoint}>
                • Provide accurate, current, and complete information during registration
              </Text>
              <Text style={styles.bulletPoint}>
                • Maintain and promptly update your account information
              </Text>
              <Text style={styles.bulletPoint}>
                • Maintain the security of your password and identification
              </Text>
              <Text style={styles.bulletPoint}>
                • Accept all responsibility for activities that occur under your account
              </Text>
              <Text style={styles.bulletPoint}>
                • Notify us immediately of any unauthorized use of your account
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. User Conduct and Responsibilities</Text>
              <Text style={styles.sectionText}>
                You agree not to use the App to:
              </Text>
              <Text style={styles.bulletPoint}>
                • Upload, post, or transmit any content that is illegal, harmful, threatening, abusive, or violates any rights
              </Text>
              <Text style={styles.bulletPoint}>
                • Impersonate any person or entity or falsely state your affiliation
              </Text>
              <Text style={styles.bulletPoint}>
                • Interfere with or disrupt the service or servers connected to the service
              </Text>
              <Text style={styles.bulletPoint}>
                • Attempt to gain unauthorized access to any portion of the App
              </Text>
              <Text style={styles.bulletPoint}>
                • Use the service for any commercial purpose without our express written consent
              </Text>
              <Text style={styles.bulletPoint}>
                • Violate any applicable local, state, national, or international law
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Intellectual Property Rights</Text>
              <Text style={styles.sectionText}>
                The App and its original content, features, and functionality are owned by DebNxt and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not:
              </Text>
              <Text style={styles.bulletPoint}>
                • Copy, modify, or create derivative works of the App
              </Text>
              <Text style={styles.bulletPoint}>
                • Reverse engineer, decompile, or disassemble the App
              </Text>
              <Text style={styles.bulletPoint}>
                • Remove any copyright or other proprietary notations from the App
              </Text>
              <Text style={styles.sectionText}>
                Content you create using our services remains your property, subject to our right to use it as necessary to provide the service.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Subscription and Payment Terms</Text>
              <Text style={styles.sectionText}>
                Certain features of the App may require a paid subscription. By subscribing, you agree to:
              </Text>
              <Text style={styles.bulletPoint}>
                • Pay all fees associated with your subscription
              </Text>
              <Text style={styles.bulletPoint}>
                • Automatic renewal of your subscription unless cancelled
              </Text>
              <Text style={styles.bulletPoint}>
                • That subscription fees are non-refundable except as required by law
              </Text>
              <Text style={styles.bulletPoint}>
                • That we may change subscription prices with reasonable notice
              </Text>
              <Text style={styles.sectionText}>
                You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end of your current billing period.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Credits and Usage</Text>
              <Text style={styles.sectionText}>
                The App uses a credit system for certain features. Credits:
              </Text>
              <Text style={styles.bulletPoint}>
                • Are consumed when you use premium features
              </Text>
              <Text style={styles.bulletPoint}>
                • May be purchased or earned through subscriptions
              </Text>
              <Text style={styles.bulletPoint}>
                • Cannot be transferred, refunded, or exchanged for cash
              </Text>
              <Text style={styles.bulletPoint}>
                • May expire according to the terms of your subscription plan
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Content and Data</Text>
              <Text style={styles.sectionText}>
                You retain ownership of content you upload or create. However, by using the App, you grant us:
              </Text>
              <Text style={styles.bulletPoint}>
                • A worldwide, non-exclusive license to use, store, and process your content to provide the service
              </Text>
              <Text style={styles.bulletPoint}>
                • The right to use anonymized data for service improvement
              </Text>
              <Text style={styles.sectionText}>
                You are solely responsible for backing up your content. We are not liable for any loss of your content.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. Service Availability and Modifications</Text>
              <Text style={styles.sectionText}>
                We reserve the right to:
              </Text>
              <Text style={styles.bulletPoint}>
                • Modify or discontinue the service at any time
              </Text>
              <Text style={styles.bulletPoint}>
                • Update the App with new features or remove existing features
              </Text>
              <Text style={styles.bulletPoint}>
                • Suspend or terminate your access for violation of these terms
              </Text>
              <Text style={styles.sectionText}>
                We do not guarantee that the service will be available at all times or free from errors or interruptions.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>10. Limitation of Liability</Text>
              <Text style={styles.sectionText}>
                To the maximum extent permitted by law, DebNxt shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
              </Text>
              <Text style={styles.bulletPoint}>
                • Your use or inability to use the service
              </Text>
              <Text style={styles.bulletPoint}>
                • Any unauthorized access to or use of our servers
              </Text>
              <Text style={styles.bulletPoint}>
                • Any interruption or cessation of transmission to or from the service
              </Text>
              <Text style={styles.bulletPoint}>
                • Any bugs, viruses, or other harmful code transmitted through the service
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>11. Indemnification</Text>
              <Text style={styles.sectionText}>
                You agree to defend, indemnify, and hold harmless DebNxt and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including legal fees, arising out of or in any way connected with your access to or use of the App, your violation of these Terms, or your violation of any rights of another.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>12. Termination</Text>
              <Text style={styles.sectionText}>
                We may terminate or suspend your account and access to the service immediately, without prior notice, for any reason, including if you breach these Terms. Upon termination:
              </Text>
              <Text style={styles.bulletPoint}>
                • Your right to use the service will immediately cease
              </Text>
              <Text style={styles.bulletPoint}>
                • All data associated with your account may be deleted
              </Text>
              <Text style={styles.bulletPoint}>
                • You remain liable for all amounts due up to the date of termination
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>13. Governing Law</Text>
              <Text style={styles.sectionText}>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which DebNxt operates, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the App shall be resolved in the appropriate courts of that jurisdiction.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>14. Changes to Terms</Text>
              <Text style={styles.sectionText}>
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by updating the "Last Updated" date. Your continued use of the App after such modifications constitutes acceptance of the updated Terms.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>15. Severability</Text>
              <Text style={styles.sectionText}>
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>16. Contact Information</Text>
              <Text style={styles.sectionText}>
                If you have any questions about these Terms and Conditions, please contact us at:
              </Text>
              <Text style={styles.contactInfo}>
                Email: support@debnxt.com{'\n'}
              </Text>
            </View>
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
  scrollView: {
    flex: 1,
  },
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
  section: {
    marginBottom: metrics.width(24),
  },
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

