import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
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
  tooltip?: string;
}

export default function CustomDropdown({
  title,
  options,
  selectedValue,
  onSelect,
  placeholder = 'Select Option',
  required = false,
  style,
  tooltip,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const renderTooltipIcon = () => {
    if (!tooltip) return null;

    const tooltipIcon = (
      <View style={styles.tooltipIcon}>
        <Svgs.Info height={metrics.width(17)} width={metrics.width(17)} />
      </View>
    );

    return (
      <Tooltip
        isVisible={showTooltip}
        content={
          <View style={styles.tooltipContent}>
            <Text style={styles.tooltipText}>{tooltip}</Text>
          </View>
        }
        placement="bottom"
        onClose={() => setShowTooltip(false)}
        showChildInTooltip={false}
        backgroundColor="transparent"
        contentStyle={styles.tooltipBubble}
        tooltipStyle={styles.tooltipWrapper}
        closeOnContentInteraction={false}
        closeOnChildInteraction={false}
      >
        <TouchableOpacity
          style={styles.tooltipIconContainer}
          onPress={() => setShowTooltip(!showTooltip)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {tooltipIcon}
        </TouchableOpacity>
      </Tooltip>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <LiquidGlassBackground style={styles.liquidContainer}>
        <TouchableOpacity
          style={styles.descriptionContainer}
          onPress={toggleDropdown}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {title}
              {required && ' *'}
            </Text>
            {renderTooltipIcon()}
          </View>
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.width(8),
  },
  tooltipIconContainer: {
    marginLeft: metrics.width(4),
  },
  tooltipIcon: {
    marginTop: metrics.width(2),
  },
  tooltipContent: {
    padding: 0,
  },
  tooltipBubble: {
    backgroundColor: colors.black,
    borderRadius: 8,
    padding: metrics.width(12),
    minWidth: metrics.width(200),
    maxWidth: metrics.width(280),
    borderWidth: 1,
    borderColor: colors.primary40,
  },
  tooltipWrapper: {
    borderRadius: 8,
  },
  tooltipText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(12),
    color: colors.white,
    lineHeight: metrics.width(18),
  },
});
