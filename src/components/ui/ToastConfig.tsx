import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message';
import colors from '../../constants/colors';
import { FontFamily } from '../../constants/fonts';
import { metrics } from '../../constants/metrics';

/**
 * Custom toast configuration to match app design
 */
export const toastConfig = {
  /**
   * Success toast
   */
  success: (props: any) => (
    <BaseToast
      {...props}
      style={[styles.successToast, styles.baseToast]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      renderLeadingIcon={() => (
        <View style={[styles.iconContainer, styles.successIcon]}>
          <Text style={styles.iconText}>✓</Text>
        </View>
      )}
    />
  ),

  /**
   * Error toast
   */
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={[styles.errorToast, styles.baseToast]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      renderLeadingIcon={() => (
        <View style={[styles.iconContainer, styles.errorIcon]}>
          <Text style={styles.iconText}>✕</Text>
        </View>
      )}
    />
  ),

  /**
   * Info toast
   */
  info: (props: any) => (
    <InfoToast
      {...props}
      style={[styles.infoToast, styles.baseToast]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      renderLeadingIcon={() => (
        <View style={[styles.iconContainer, styles.infoIcon]}>
          <Text style={styles.iconText}>ℹ</Text>
        </View>
      )}
    />
  ),
};

const styles = StyleSheet.create({
  baseToast: {
    height: 'auto',
    minHeight: 60,
    borderLeftWidth: 4,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successToast: {
   // backgroundColor: '#1a9540', // Solid darker green for better contrast
    borderLeftColor: colors.sucessGreen,
  },
  errorToast: {
  //  backgroundColor: '#cc2306', // Solid darker red for better contrast
    borderLeftColor: colors.primary,
  },
  infoToast: {
  //  backgroundColor: '#6b6563', // Solid darker gray for better contrast
    borderLeftColor: colors.subtitle,
  },
  contentContainer: {
    paddingHorizontal: 8,
    flex: 1,
  },
  text1: {
    fontSize: metrics.width(16),
    fontFamily: FontFamily.spaceGrotesk.bold,
 //   color: colors.white,
    marginBottom: 4,
  },
  text2: {
    fontSize: metrics.width(14),
    fontFamily: FontFamily.spaceGrotesk.regular,
  //  color: 'rgba(255, 255, 255, 0.9)', // Lighter white for better visibility on solid backgrounds
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  successIcon: {
    backgroundColor: colors.sucessGreen,
  },
  errorIcon: {
    backgroundColor: colors.primary,
  },
  infoIcon: {
    backgroundColor: colors.subtitle,
  },
  iconText: {
    fontSize: metrics.width(18),
    color: colors.white,
    fontWeight: 'bold',
  },
});

