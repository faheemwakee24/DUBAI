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
import { Header, LiquidGlassBackground } from '../../components/ui';

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
            <Text style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</Text>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Introduction</Text>
              <Text style={styles.sectionText}>
                Welcome to DubAI. We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Information We Collect</Text>
              <Text style={styles.sectionText}>
                We collect information that you provide directly to us, including:
              </Text>
              <Text style={styles.bulletPoint}>
                • Account information (name, email address, password)
              </Text>
              <Text style={styles.bulletPoint}>
                • Profile information and preferences
              </Text>
              <Text style={styles.bulletPoint}>
                • Content you create, upload, or share through our services
              </Text>
              <Text style={styles.bulletPoint}>
                • Payment and billing information
              </Text>
              <Text style={styles.sectionText}>
                We also automatically collect certain information about your device and how you interact with our app, including device identifiers, usage data, and technical information.
              </Text>
            </View>

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
                • Send you technical notices, updates, and support messages
              </Text>
              <Text style={styles.bulletPoint}>
                • Respond to your comments, questions, and requests
              </Text>
              <Text style={styles.bulletPoint}>
                • Monitor and analyze trends, usage, and activities
              </Text>
              <Text style={styles.bulletPoint}>
                • Personalize and improve your experience
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Information Sharing and Disclosure</Text>
              <Text style={styles.sectionText}>
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </Text>
              <Text style={styles.bulletPoint}>
                • With service providers who assist us in operating our app
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
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Data Security</Text>
              <Text style={styles.sectionText}>
                We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Your Rights and Choices</Text>
              <Text style={styles.sectionText}>
                You have the right to:
              </Text>
              <Text style={styles.bulletPoint}>
                • Access and receive a copy of your personal data
              </Text>
              <Text style={styles.bulletPoint}>
                • Rectify inaccurate or incomplete data
              </Text>
              <Text style={styles.bulletPoint}>
                • Request deletion of your personal data
              </Text>
              <Text style={styles.bulletPoint}>
                • Object to or restrict processing of your data
              </Text>
              <Text style={styles.bulletPoint}>
                • Withdraw consent at any time
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
              <Text style={styles.sectionText}>
                Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>8. Changes to This Privacy Policy</Text>
              <Text style={styles.sectionText}>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>9. Contact Us</Text>
              <Text style={styles.sectionText}>
                If you have any questions about this Privacy Policy, please contact us at:
              </Text>
              <Text style={styles.contactInfo}>
                Email: support@dubai.com{'\n'}
               
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

