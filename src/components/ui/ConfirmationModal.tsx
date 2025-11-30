import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { FontFamily } from '../../constants/fonts';
import colors from '../../constants/colors';
import { metrics } from '../../constants/metrics';
import LiquidGlassBackground from './LiquidGlassBackground';
import PrimaryButton from './PrimaryButton';

type ConfirmationModalProps = {
  visible: boolean;
  text: string;
  acceptButtonText: string;
  cancelButtonText: string;
  onAccept: () => void;
  onCancel: () => void;
  creditsRequired?: number;
  currentCredits?: number;
};

export default function ConfirmationModal({
  visible,
  text,
  acceptButtonText,
  cancelButtonText,
  onAccept,
  onCancel,
  creditsRequired,
  currentCredits,
}: ConfirmationModalProps) {
  const hasEnoughCredits = creditsRequired !== undefined && currentCredits !== undefined
    ? currentCredits >= creditsRequired
    : true;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <LiquidGlassBackground style={styles.contentContainer}>
                <Text style={styles.text}>{text}</Text>
                {creditsRequired !== undefined && (
                  <View style={styles.creditsContainer}>
                    <View style={styles.creditsRow}>
                      <Text style={styles.creditsLabel}>Credits Required:</Text>
                      <Text style={styles.creditsValue}>
                        {typeof creditsRequired === 'number' 
                          ? creditsRequired.toFixed(1) 
                          : creditsRequired}
                      </Text>
                    </View>
                    {currentCredits !== undefined && (
                      <View style={styles.creditsRow}>
                        <Text style={styles.creditsLabel}>Your Credits:</Text>
                        <Text style={[
                          styles.creditsValue,
                          !hasEnoughCredits && styles.creditsValueInsufficient
                        ]}>
                          {typeof currentCredits === 'number' 
                            ? currentCredits.toFixed(1) 
                            : currentCredits}
                        </Text>
                      </View>
                    )}
                    {!hasEnoughCredits && (
                      <Text style={styles.insufficientCreditsText}>
                        You don't have enough credits to proceed.
                      </Text>
                    )}
                  </View>
                )}
                <View style={styles.buttonContainer}>
                  <PrimaryButton
                    title={cancelButtonText}
                    onPress={onCancel}
                    textStyle={styles.cancelButtonText}
                    variant="secondary"
                    style={styles.cancelButton}
                    
                  />
                  <PrimaryButton
                    title={acceptButtonText}
                    onPress={onAccept}
                    variant="primary"
                    style={styles.acceptButton}
                    textStyle={styles.acceptButtonText}
                    
                    disabled={!hasEnoughCredits}
                  />
                </View>
              </LiquidGlassBackground>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: metrics.width(20),
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  contentContainer: {
    padding: metrics.width(24),
    gap: metrics.width(20),
  },
  text: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(16),
    color: colors.white,
    textAlign: 'center',
    lineHeight: metrics.width(24),
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: metrics.width(7),
    marginTop: metrics.width(12),
  },
  cancelButton: {
    flex: 1,
    paddingHorizontal:metrics.width(2),
    borderRadius:13,
    paddingVertical:metrics.width(5),
  },
  acceptButton: {
    flex: 1,
    paddingHorizontal:metrics.width(2),
    borderRadius:13,
    paddingVertical:metrics.width(5),
  },
  creditsContainer: {
    marginTop: metrics.width(12),
    padding: metrics.width(12),
    backgroundColor: colors.white5,
    borderRadius: 8,
    gap: metrics.width(8),
  },
  creditsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creditsLabel: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.subtitle,
  },
  creditsValue: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(16),
    color: colors.primary,
  },
  creditsValueInsufficient: {
    color: '#FF6B6B',
  },
  insufficientCreditsText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(12),
    color: '#FF6B6B',
    marginTop: metrics.width(4),
    textAlign: 'center',
  },
  acceptButtonText: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(14),
   // color: colors.white,
  },
  cancelButtonText: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(14),
   // color: colors.black,
  },
});

