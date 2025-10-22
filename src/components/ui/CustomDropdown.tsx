import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import LiquidGlassBackground from './LiquidGlassBackground';
import { Svgs } from '../../assets/icons';
import { FontFamily } from '../../constants/fonts';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';

interface CustomDropdownProps {
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  style?: any;
}

export default function CustomDropdown({
  title,
  options,
  selectedValue,
  onSelect,
  placeholder = 'Select Option',
  required = false,
  style,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <View style={[styles.container, style]}>
      <LiquidGlassBackground style={styles.liquidContainer}>
        <TouchableOpacity
          style={styles.descriptionContainer}
          onPress={toggleDropdown}
        >
          <Text style={styles.title}>
            {title}
            {required && ' *'}
          </Text>
          <View style={styles.row}>
            <Text style={styles.value}>
              {selectedValue || placeholder}
            </Text>
            <Svgs.ArrowDown
              style={[
                styles.arrowIcon,
                isOpen && styles.arrowIconRotated,
              ]}
            />
          </View>
        </TouchableOpacity>
      </LiquidGlassBackground>
      
      {isOpen && (
        <LiquidGlassBackground style={styles.dropdownContainer}>
          <View style={styles.dropdownContent}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownItemContainer}
                onPress={() => handleSelect(option)}
              >
                <Text
                  style={[
                    styles.dropdownItem,
                    selectedValue === option && styles.selectedItem,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LiquidGlassBackground>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: metrics.width(15),
  },
  liquidContainer: {
    borderRadius: 12,
  },
  dropdownContainer: {
    borderRadius: 12,
    marginTop: metrics.width(5),
  },
  descriptionContainer: {
    padding: metrics.width(12),
  },
  dropdownContent: {
    padding: metrics.width(12),
    gap: metrics.width(8),
  },
  title: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(13),
    color: colors.white,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.subtitle,
    marginTop: metrics.width(5),
  },
  arrowIcon: {
    transform: [{ rotate: '0deg' }],
  },
  arrowIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownItemContainer: {},
  dropdownItem: {
    fontFamily: FontFamily.spaceGrotesk.medium,
    fontSize: metrics.width(14),
    color: colors.subtitle,
  },
  selectedItem: {
    color: colors.white,
    fontFamily: FontFamily.spaceGrotesk.bold,
  },
});
