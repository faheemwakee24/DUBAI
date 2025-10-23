import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';

interface CustomToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  activeColor?: string;
  inactiveColor?: string;
  knobColor?: string;
}

export default function CustomToggle({
  value,
  onValueChange,
  disabled = false,
  size = 'medium',
  activeColor = colors.primary,
  inactiveColor = colors.white10,
  knobColor = colors.white,
}: CustomToggleProps) {
  const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, animatedValue]);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          width: metrics.width(40),
          height: metrics.width(20),
          knobSize: metrics.width(16),
          knobMargin: metrics.width(2),
        };
      case 'large':
        return {
          width: metrics.width(60),
          height: metrics.width(30),
          knobSize: metrics.width(24),
          knobMargin: metrics.width(3),
        };
      default: // medium
        return {
          width: metrics.width(50),
          height: metrics.width(25),
          knobSize: metrics.width(20),
          knobMargin: metrics.width(2.5),
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, sizeStyles.width - sizeStyles.knobSize - sizeStyles.knobMargin * 2],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          width: sizeStyles.width,
          height: sizeStyles.height,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.track,
          {
            width: sizeStyles.width,
            height: sizeStyles.height,
            backgroundColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.knob,
            {
              width: sizeStyles.knobSize,
              height: sizeStyles.knobSize,
              backgroundColor: knobColor,
              transform: [{ translateX }],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  track: {
    borderRadius: 50,
    justifyContent: 'center',
    position: 'relative',
  },
  knob: {
    position: 'absolute',
    borderRadius: 50,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});
