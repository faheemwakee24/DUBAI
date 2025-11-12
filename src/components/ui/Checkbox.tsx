import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { FontFamily } from '../../constants/fonts';
import { Svgs } from '../../assets/icons';

interface CheckboxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
}

export default function Checkbox({
  value,
  onValueChange,
  label,
  disabled = false,
}: CheckboxProps) {
  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, value && styles.checkboxChecked]}>
        {value && (
          <Svgs.TickIcon
            height={metrics.width(16)}
            width={metrics.width(16)}
          />
        )}
      </View>
      <Text style={[styles.label, disabled && styles.labelDisabled]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.width(12),
  },
  checkbox: {
    width: metrics.width(24),
    height: metrics.width(24),
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.white15,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(16),
    color: colors.white,
  },
  disabled: {
    opacity: 0.5,
  },
  labelDisabled: {
    color: colors.subtitle,
  },
});

