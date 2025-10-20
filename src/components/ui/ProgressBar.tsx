import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontFamily } from '../../constants/fonts';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { LiquidGlassBackground } from './index';

interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
  textColor?: string;
  containerStyle?: any;
}

export default function ProgressBar({
  progress,
  showPercentage = true,
  height = 8,
  backgroundColor = colors.white10,
  fillColor = colors.primary,
  textColor = colors.white,
  containerStyle,
}: ProgressBarProps) {
  const progressWidth = Math.min(Math.max(progress, 0), 100);

  return (

      <View 
        style={[
          styles.progressBarBackground,
          { 
            height: metrics.width(height),
            backgroundColor,
            width: '100%',
          },
          containerStyle
        ]}
      >
        <View 
          style={[
            styles.progressBarFill,
            { 
              width: `${progressWidth}%`,
              backgroundColor: fillColor,
            }
          ]}
        />
      </View>
     
  );
}

const styles = StyleSheet.create({
  container: {
    padding: metrics.width(20),
    borderRadius: 12,
    width: '100%',
  },
  progressBarBackground: {
    borderRadius: metrics.width(4),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: metrics.width(4),
  },
  progressText: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(16),
    textAlign: 'center',
  },
});
