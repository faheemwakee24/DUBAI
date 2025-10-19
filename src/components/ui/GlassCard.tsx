import React, { PropsWithChildren } from 'react';
import { StyleProp, ViewStyle, StyleSheet, View } from 'react-native';
import { colors } from '../../constants/colors';

type GlassCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  padding?: number;
  margin?: number;
}>;

export default function GlassCard({
  children,
  style,
  backgroundColor = colors.white5,
  borderRadius = 20,
  borderWidth = 0,
  borderColor,
  padding = 16,
  margin = 0,
}: GlassCardProps) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderRadius,
          borderWidth,
          borderColor,
          padding,
          margin,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Glass morphism base styles
    shadowColor: colors.black,
  },
});

// Preset glass card variants
export const GlassCardVariants = {
  subtle: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 0.5,
  },
  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
  },
  strong: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1.5,
  },
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
};

