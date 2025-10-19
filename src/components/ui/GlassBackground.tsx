import React, { PropsWithChildren, useMemo } from 'react';
import { StyleProp, ViewStyle, StyleSheet, View, Dimensions } from 'react-native';
import { Canvas, BlurMask, Group, Rect, LinearGradient, vec } from '@shopify/react-native-skia';
import { colors } from '../../constants/colors';
import { metrics } from '../../constants/metrics';

type GlassBackgroundProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  blur?: number;
  opacity?: number;
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  gradient?: boolean;
  gradientColors?: string[];
  shadow?: boolean;
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}>;

export default function GlassBackground({
  children,
  style,
  blur = 20,
  opacity = 0.15,
  backgroundColor = colors.white,
  borderRadius = 24,
  borderWidth = 1,
  borderColor = colors.border,
  gradient = true,
  gradientColors = [
    'rgba(255, 255, 255, 0.25)',
    'rgba(255, 255, 255, 0.1)',
    'rgba(255, 255, 255, 0.05)',
  ],
  shadow = true,
  shadowColor = colors.black,
  shadowOffset = { width: 0, height: 8 },
  shadowOpacity = 0.1,
  shadowRadius = 24,
  elevation = 8,
}: GlassBackgroundProps) {
  const { width, height } = Dimensions.get('window');

  const shadowStyle = useMemo(() => {
    if (!shadow) return {};
    
    return {
      shadowColor,
      shadowOffset,
      shadowOpacity,
      shadowRadius,
      elevation,
    };
  }, [shadow, shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation]);

  return (
    <View style={[styles.container, { borderRadius }, shadowStyle, style]}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Group opacity={opacity}>
          {/* Background blur effect */}
          <BlurMask blur={blur} style="normal" />
          
          {/* Base background */}
          <Rect 
            x={0} 
            y={0} 
            width={width} 
            height={height} 
            color={backgroundColor}
          />
          
          {/* Gradient overlay for glass effect */}
          {gradient && (
            <LinearGradient
              start={vec(0, 0)}
              end={vec(width, height)}
              colors={gradientColors}
            />
          )}
        </Group>
      </Canvas>
      
      {/* Border */}
      {borderWidth > 0 && (
        <View
          style={[
            styles.border,
            {
              borderWidth,
              borderColor,
              borderRadius,
            },
          ]}
        />
      )}
      
      {/* Content */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },
});

// Preset glass effects
export const GlassEffects = {
  subtle: {
    blur: 10,
    opacity: 0.1,
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
  },
  medium: {
    blur: 20,
    opacity: 0.15,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  strong: {
    blur: 30,
    opacity: 0.25,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
  },
  dark: {
    blur: 20,
    opacity: 0.2,
    backgroundColor: colors.gray[900],
    borderWidth: 1,
    borderColor: colors.gray[700],
    gradientColors: [
      'rgba(255, 255, 255, 0.1)',
      'rgba(255, 255, 255, 0.05)',
      'rgba(255, 255, 255, 0.02)',
    ],
  },
};

// Usage examples:
// <GlassBackground {...GlassEffects.subtle}>
//   <Text>Subtle glass effect</Text>
// </GlassBackground>
//
// <GlassBackground {...GlassEffects.strong} style={{ margin: 16 }}>
//   <Text>Strong glass effect</Text>
// </GlassBackground>
