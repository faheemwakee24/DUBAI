import React, { PropsWithChildren } from 'react';
import {
  StyleProp,
  ViewStyle,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import colors from '../../constants/colors';
type LiquidGlassBackgroundProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  interactive?: boolean;
  effect?:
    | 'clear'
    | 'light'
    | 'dark'
    | 'ultraThin'
    | 'thin'
    | 'regular'
    | 'thick';
  onPress?: () => void;
  disabled?: boolean;
}>;
export default function LiquidGlassBackground({
  children,
  style,
  interactive = false,
  effect = 'light',
  onPress,
  disabled = true,
}: LiquidGlassBackgroundProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={interactive ? 0.8 : 1}
      style={[styles.container, style]}
    >
      <BlurView
        style={[StyleSheet.absoluteFill,]}
        blurType={Platform.OS === 'ios' ? 'ultraThinMaterialDark' : 'dark'}
        blurAmount={5}
      

      />
      <View style={styles.childrenContainer}>{children}</View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'transparent', // no base color
    borderWidth:0.5,
    borderColor:colors.white25,
    borderBottomWidth:0,
    borderRightWidth:0.1
  },
  childrenContainer: {
    zIndex: 3,
    overlayColor:'transparent',
    backgroundColor:'transparent',
  },
});
