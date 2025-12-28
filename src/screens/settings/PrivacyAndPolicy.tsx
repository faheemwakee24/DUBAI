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

export default function PrivacyAndPolicy() {
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
            <Text style={styles.lastUpdated}>
              Last Updated: {new Date().toLocaleDateString()}
            </Text>

            {/* 1. Introduction */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Introduction</Text>
              <Text style={styles.sectionText}>
                Welcome to Dub NXT. We are committed to protecting your privacy
                and ensuring you have a positive experience on our platform.
                This Privacy Policy explains how we collect, use, and safeguard
                your information when you use our mobile application, including
                AI-powered features.
              </Text>
            </View>

            {/* 2. Information We Collect */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Information We Collect</Text>
              <Text style={styles.sectionText}>
                We collect information that you provide directly to us,
                including:
              </Text>

              <Text style={styles.bulletPoint}>
                • Account information (name, email address, password)
              </Text>
              <Text style={styles.bulletPoint}>
                • Profile information and preferences
              </Text>
              <Text style={styles.bulletPoint}>
                • Images, videos, audio, and text prompts uploaded by users
              </Text>
              <Text style={styles.bulletPoint}>
                • Content you create, upload, or share through our services
              </Text>
              <Text style={styles.bulletPoint}>
                • Subscription information (plan type, status, renewal dates)
              </Text>
              <Text style={styles.bulletPoint}>
                • Transaction and purchase history
              </Text>

              <Text style={styles.sectionText}>
                <Text style={styles.boldText}>Payment Information:</Text> All payments 
                for subscriptions are processed by Apple through the App Store. We do 
                not collect, store, or have access to your credit card or payment 
                information. Apple handles all payment processing and we only receive 
                confirmation of successful transactions and subscription status.
              </Text>

              <Text style={styles.sectionText}>
                We also automatically collect certain information about your
                device and how you interact with our app, including device
                identifiers, usage data, and technical information.
              </Text>

              <Text style={styles.sectionText}>
                Uploaded content may be processed using AI technologies to
                generate characters, voices, dubbed videos, or translations.
                Content is used only to provide requested features.
              </Text>
            </View>

            {/* 3. How We Use Your Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
              <Text style={styles.sectionText}>
                We use the information we collect to:
              </Text>

              <Text style={styles.bulletPoint}>
                • Provide, maintain, and improve our services
              </Text>
              <Text style={styles.bulletPoint}>
                • Process transactions and send related information
              </Text>
              <Text style={styles.bulletPoint}>
                • Send technical notices, updates, and support messages
              </Text>
              <Text style={styles.bulletPoint}>
                • Respond to your comments, questions, and requests
              </Text>
              <Text style={styles.bulletPoint}>
                • Monitor and analyze usage and app performance
              </Text>
              <Text style={styles.bulletPoint}>
                • Personalize and improve your experience
              </Text>
            </View>

            {/* 4. Information Sharing */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                4. Information Sharing and Disclosure
              </Text>
              <Text style={styles.sectionText}>
                We do not sell, trade, or rent your personal information to
                third parties. We may share your information only in the
                following circumstances:
              </Text>

              <Text style={styles.bulletPoint}>
                • With service providers who help operate our app
              </Text>
              <Text style={styles.bulletPoint}>
                • With Apple for subscription management and verification
              </Text>
              <Text style={styles.bulletPoint}>
                • When required by law or to protect our rights
              </Text>
              <Text style={styles.bulletPoint}>
                • In connection with a business transfer or merger
              </Text>
              <Text style={styles.bulletPoint}>
                • With your consent or at your direction
              </Text>
              <Text style={styles.sectionText}>
                <Text style={styles.boldText}>Apple Services:</Text> When you purchase 
                a subscription, Apple processes the payment and shares subscription 
                status and transaction information with us so we can provide you with 
                access to subscription features. We do not receive your payment 
                details from Apple.
              </Text>
            </View>

            {/* 5. Subscription Data */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                5. Subscription Data and Management
              </Text>
              <Text style={styles.sectionText}>
                We store information about your subscription status, including:
              </Text>
              <Text style={styles.bulletPoint}>
                • Your current subscription plan and tier
              </Text>
              <Text style={styles.bulletPoint}>
                • Subscription start and end dates
              </Text>
              <Text style={styles.bulletPoint}>
                • Renewal status and billing cycle
              </Text>
              <Text style={styles.bulletPoint}>
                • Transaction identifiers from Apple
              </Text>
              <Text style={styles.sectionText}>
                This information is used to provide you with access to subscription 
                features and to manage your account. Subscription data is stored 
                securely on our servers and is retained for as long as your account 
                is active and for a reasonable period thereafter for legal and 
                accounting purposes.
              </Text>
              <Text style={styles.sectionText}>
                You can manage your subscription settings, including cancellation, 
                through your Apple ID account settings. We do not have the ability 
                to cancel subscriptions on your behalf - all subscription management 
                must be done through Apple.
              </Text>
            </View>

            {/* 6. AI Processing */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                6. AI Processing and Generated Content
              </Text>
              <Text style={styles.sectionText}>
                Dub NXT uses artificial intelligence to generate characters,
                voices, dubbed videos, and translations. AI-generated content
                may be fictional or inaccurate and does not represent real
                people. AI voices are not intended to imitate or impersonate
                real individuals.
              </Text>
            </View>

            {/* 7. Data Security */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Data Security</Text>
              <Text style={styles.sectionText}>
                We implement appropriate technical and organizational measures
                to protect your personal information. However, no method of
                transmission or storage is 100% secure.
              </Text>
              <Text style={styles.sectionText}>
                Payment information is handled exclusively by Apple through their 
                secure payment processing systems. We do not store or process 
                payment card information.
              </Text>
            </View>

            {/* 8. Your Rights */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Your Rights and Choices</Text>
              <Text style={styles.sectionText}>
                You have the right to:
              </Text>

              <Text style={styles.bulletPoint}>
                • Access and receive a copy of your personal data
              </Text>
              <Text style={styles.bulletPoint}>
                • Correct inaccurate or incomplete data
              </Text>
              <Text style={styles.bulletPoint}>
                • Request deletion of your personal data
              </Text>
              <Text style={styles.bulletPoint}>
                • Withdraw consent at any time
              </Text>
            </View>

            {/* 9. Children */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. Children&apos;s Privacy</Text>
              <Text style={styles.sectionText}>
                Our services are intended for users aged 13 and older. We do
                not knowingly collect personal information from children under
                13.
              </Text>
            </View>

            {/* 10. Changes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                10. Changes to This Privacy Policy
              </Text>
              <Text style={styles.sectionText}>
                We may update this Privacy Policy from time to time. Changes
                will be reflected by updating the &quot;Last Updated&quot; date.
              </Text>
            </View>

            {/* 11. Contact */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>11. Contact Us</Text>
              <Text style={styles.sectionText}>
                If you have any questions about this Privacy Policy, please
                contact us at:
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
  boldText: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    color: colors.white,
  },
});
