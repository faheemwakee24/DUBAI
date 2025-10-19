import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';

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
}: PrimaryButtonProps) {
    const getButtonStyle = (): ViewStyle => {
        const baseStyle = [styles.base, styles[size]];

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
        const baseTextStyle = [styles.text, styles[`${size}Text`]];

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
                        color={variant === 'primary' ? '#fff' : '#ff6b35'}
                        style={styles.loader}
                    />
                    <Text style={getTextStyle()}>{title}</Text>
                </>
            );
        }

        if (icon) {
            return (
                <>
                    {iconPosition === 'left' && icon}
                    <Text style={getTextStyle()}>{title}</Text>
                    {iconPosition === 'right' && icon}
                </>
            );
        }

        return <Text style={getTextStyle()}>{title}</Text>;
    };

    return (
        <TouchableOpacity
            style={getButtonStyle()}
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
        borderRadius: 12,
        borderWidth: 1,
    },

    // Sizes
    small: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        minHeight: 36,
    },
    medium: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        minHeight: 48,
    },
    large: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        minHeight: 56,
    },

    // Variants
    primary: {
        backgroundColor: '#ff6b35',
        borderColor: '#ff6b35',
        shadowColor: '#ff6b35',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    secondary: {
        backgroundColor: '#333',
        borderColor: 'rgba(255, 255, 255, 0.2)',
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
        fontWeight: '600',
        textAlign: 'center',
    },
    smallText: {
        fontSize: 14,
    },
    mediumText: {
        fontSize: 16,
    },
    largeText: {
        fontSize: 18,
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
});
