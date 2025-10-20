import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, View } from 'react-native';
import { Typography } from '../../constants/fonts';
import colors from '../../constants/colors';
import { metrics } from '../../constants/metrics';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

type PrimaryButtonProps = {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    extraContainerStyle?:ViewStyle;
    extraTextStyle?:TextStyle;
};

export default function PrimaryButton({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
    textStyle,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    extraContainerStyle,
    extraTextStyle
}: PrimaryButtonProps) {
    const getButtonStyle = (): ViewStyle => {
        const baseStyle: ViewStyle[] = [styles.base, styles[size]];

        if (fullWidth) {
            baseStyle.push(styles.fullWidth);
        }

        switch (variant) {
            case 'primary':
                baseStyle.push(styles.primary);
                break;
            case 'secondary':
                baseStyle.push(styles.secondary);
                break;
            case 'outline':
                baseStyle.push(styles.outline);
                break;
            case 'ghost':
                baseStyle.push(styles.ghost);
                break;
        }

        if (disabled) {
            baseStyle.push(styles.disabled);
        }

        if (style) {
            baseStyle.push(style);
        }

        return StyleSheet.flatten(baseStyle);
    };

    const getTextStyle = (): TextStyle => {
        const baseTextStyle: TextStyle[] = [styles.text, styles[`${size}Text` as keyof typeof styles],extraTextStyle?extraTextStyle:{}];

        switch (variant) {
            case 'primary':
                baseTextStyle.push(styles.primaryText);
                break;
            case 'secondary':
                baseTextStyle.push(styles.secondaryText);
                break;
            case 'outline':
                baseTextStyle.push(styles.outlineText);
                break;
            case 'ghost':
                baseTextStyle.push(styles.ghostText);
                break;
        }

        if (disabled) {
            baseTextStyle.push(styles.disabledText);
        }

        if (textStyle) {
            baseTextStyle.push(textStyle);
        }

        return StyleSheet.flatten(baseTextStyle);
    };

    const renderContent = () => {
        if (loading) {
            return (
                <>
                    <ActivityIndicator
                        size="small"
                        color={variant === 'primary' ? colors.white : colors.primary}
                        style={styles.loader}
                    />
                    <Text style={getTextStyle()}>{title}</Text>
                </>
            );
        }

        if (icon) {
            return (
                <>
                    {iconPosition === 'left' && <View style={styles.iconContainer}>{icon}</View>}
                    <Text style={getTextStyle()}>{title}</Text>
                    {iconPosition === 'right' && <View style={styles.iconContainer}>{icon}</View>}
                </>
            );
        }

        return <Text style={getTextStyle()}>{title}</Text>;
    };

    return (
        <TouchableOpacity
            style={[getButtonStyle(),extraContainerStyle]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {renderContent()}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },

    // Sizes
    small: {
        paddingVertical: metrics.width(10),
        paddingHorizontal: 16,
        minHeight: 36,
    },
    medium: {
        paddingVertical: metrics.width(16),
        paddingHorizontal: 24,
        minHeight: 48,
    },
    large: {
        paddingVertical: metrics.width(20),
        paddingHorizontal: 32,
        minHeight: 56,
    },

    // Variants
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.inactiveButton,
    },
    outline: {
        backgroundColor: 'transparent',
        borderColor: '#ff6b35',
    },
    ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
    },

    // States
    disabled: {
        opacity: 0.5,
        shadowOpacity: 0,
        elevation: 0,
    },
    fullWidth: {
        width: '100%',
    },

    // Text styles
    text: {
        ...Typography.button,
        textAlign: 'center',
    },
    smallText: {
        ...Typography.buttonSmall,
    },
    mediumText: {
        ...Typography.button,
    },
    largeText: {
        ...Typography.buttonLarge,
    },

    // Text variants
    primaryText: {
        color: '#fff',
    },
    secondaryText: {
        color: '#fff',
    },
    outlineText: {
        color: '#ff6b35',
    },
    ghostText: {
        color: '#ff6b35',
    },
    disabledText: {
        opacity: 0.7,
    },

    // Loading
    loader: {
        marginRight: 8,
    },
    iconContainer: {
        marginHorizontal: metrics.width(11),
    }
});
