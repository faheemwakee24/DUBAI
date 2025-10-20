import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { FontFamily } from '../../constants/fonts';
import { Svgs } from '../../assets/icons';
import LiquidGlassBackground from './LiquidGlassBackground';

type HeaderVariant = 'default' | 'withBack' | 'withActions' | 'centered';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  variant?: HeaderVariant;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
  centerAction?: React.ReactNode;
  backgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  safeAreaStyle?: ViewStyle;
  onRightIconPress?: () => void;
  RigthIcon?: React.ReactNode;
}

export default function Header({
  title,
  subtitle,
  variant = 'default',
  showBackButton = false,
  onBackPress,
  rightAction,
  leftAction,
  centerAction,
  backgroundColor = colors.transparent,
  titleColor = colors.white,
  subtitleColor = colors.subtitle,
  style,
  titleStyle,
  subtitleStyle,
  safeAreaStyle,
  onRightIconPress,
  RigthIcon,
}: HeaderProps) {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const renderBackButton = () => {
    if (!showBackButton && variant !== 'withBack') return null;

    return (
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackPress}
        activeOpacity={0.7}
      >
        <LiquidGlassBackground style={styles.leftIconBackground}>
          <Svgs.ArrowLeft
            height={metrics.width(20)}
            width={metrics.width(20)}
          />
        </LiquidGlassBackground>
      </TouchableOpacity>
    );
  };

  const rederRightIcon = () => {
    return (
      <TouchableOpacity
        style={styles.backButton}
        onPress={hadlrRightIconPress}
        activeOpacity={0.7}
      >
        {RigthIcon}
      </TouchableOpacity>
    );
  };
  const hadlrRightIconPress = () => {
    if (onRightIconPress) {
      onRightIconPress();
    }
  };

  const renderTitle = () => {
    if (!title) return null;

    return (
      <View style={styles.titleContainer}>
        <Text
          style={[styles.title, { color: titleColor }, titleStyle]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.subtitle, { color: subtitleColor }, subtitleStyle]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
    );
  };

  const renderCenterContent = () => {
    if (centerAction) {
      return centerAction;
    }
    return renderTitle();
  };

  const getContainerStyle = () => {
    const baseStyle = [styles.container, { backgroundColor }];

    switch (variant) {
      case 'centered':
        return [...baseStyle, styles.centeredContainer];
      case 'withActions':
        return [...baseStyle, styles.actionsContainer];
      default:
        return baseStyle;
    }
  };

  return (
    <View style={[styles.safeArea, safeAreaStyle]}>
      <View style={[...getContainerStyle(), style]}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          <LiquidGlassBackground style={styles.leftIconBackground}>
            {leftAction || renderBackButton()}
          </LiquidGlassBackground>
        </View>

        {/* Center Section */}
        <View style={styles.centerSection}>{renderCenterContent()}</View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          {RigthIcon && (
            <LiquidGlassBackground style={styles.leftIconBackground}>
              {rightAction || rederRightIcon()}
            </LiquidGlassBackground>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.transparent,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: metrics.width(16),
    minHeight: metrics.width(56),
  },
  centeredContainer: {
    justifyContent: 'center',
  },
  actionsContainer: {
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  backButton: {
    padding: metrics.width(8),
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(18),
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    textAlign: 'center',
    marginTop: metrics.width(2),
  },
  leftIconBackground: {
    height: metrics.width(35),
    width: metrics.width(35),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
