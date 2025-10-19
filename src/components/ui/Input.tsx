import React, { useState, forwardRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    TextInputProps,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { Typography } from '../../constants/fonts';

type InputVariant = 'default' | 'outlined' | 'filled';
type InputSize = 'small' | 'medium' | 'large';

export interface InputProps extends Omit<TextInputProps, 'style'> {
    label?: string;
    error?: string;
    variant?: InputVariant;
    size?: InputSize;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    labelStyle?: TextStyle;
    errorStyle?: TextStyle;
    showPasswordToggle?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    disabled?: boolean;
    required?: boolean;
}

const Input = forwardRef<TextInput, InputProps>(
    (
        {
            label,
            error,
            variant = 'default',
            size = 'medium',
            containerStyle,
            inputStyle,
            labelStyle,
            errorStyle,
            showPasswordToggle = false,
            leftIcon,
            rightIcon,
            fullWidth = false,
            disabled = false,
            required = false,
            secureTextEntry,
            ...props
        },
        ref
    ) => {
        const [isPasswordVisible, setIsPasswordVisible] = useState(false);
        const [isFocused, setIsFocused] = useState(false);

        const handlePasswordToggle = () => {
            setIsPasswordVisible(!isPasswordVisible);
        };

        const getContainerStyle = (): ViewStyle => {
            const baseStyle: ViewStyle[] = [styles.container];
            
            if (fullWidth) {
                baseStyle.push(styles.fullWidth);
            }

            if (disabled) {
                baseStyle.push(styles.disabled);
            }

            if (error) {
                baseStyle.push(styles.errorContainer);
            }

            if (isFocused) {
                baseStyle.push(styles.focusedContainer);
            }

            return StyleSheet.flatten([...baseStyle, containerStyle || {}]);
        };

        const getInputStyle = (): TextStyle => {
            const baseStyle: TextStyle[] = [styles.input, styles[`${size}Input` as keyof typeof styles]];

            if (disabled) {
                baseStyle.push(styles.disabledInput);
            }

            if (error) {
                baseStyle.push(styles.errorInput);
            }

            return StyleSheet.flatten([...baseStyle, inputStyle || {}]);
        };

        const getLabelStyle = (): TextStyle => {
            const baseStyle: TextStyle[] = [styles.label, styles[`${size}Label` as keyof typeof styles]];

            if (error) {
                baseStyle.push(styles.errorLabel);
            }

            if (disabled) {
                baseStyle.push(styles.disabledLabel);
            }

            return StyleSheet.flatten([...baseStyle, labelStyle || {}]);
        };

        const getErrorStyle = (): TextStyle => {
            return StyleSheet.flatten([styles.error, errorStyle || {}]);
        };

        const renderPasswordToggle = () => {
            if (!showPasswordToggle) return null;

            return (
                <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={handlePasswordToggle}
                    disabled={disabled}
                >
                    <Text style={styles.passwordToggleText}>
                        {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
                    </Text>
                </TouchableOpacity>
            );
        };

        const renderLeftIcon = () => {
            if (!leftIcon) return null;

            return (
                <View style={styles.leftIcon}>
                    {leftIcon}
                </View>
            );
        };

        const renderRightIcon = () => {
            if (!rightIcon && !showPasswordToggle) return null;

            return (
                <View style={styles.rightIcon}>
                    {rightIcon}
                    {renderPasswordToggle()}
                </View>
            );
        };

        return (
            <View style={getContainerStyle()}>
                {label && (
                    <Text style={getLabelStyle()}>
                        {label}
                        {required && <Text style={styles.required}> *</Text>}
                    </Text>
                )}
                
                <View style={styles.inputContainer}>
                    {renderLeftIcon()}
                    
                    <TextInput
                        ref={ref}
                        style={getInputStyle()}
                        secureTextEntry={showPasswordToggle ? !isPasswordVisible : secureTextEntry}
                        editable={!disabled}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholderTextColor="#A0A0A0"
                        {...props}
                    />
                    
                    {renderRightIcon()}
                </View>
                
                {error && (
                    <Text style={getErrorStyle()}>{error}</Text>
                )}
            </View>
        );
    }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.6,
    },
    errorContainer: {
        // Add error container styles if needed
    },
    focusedContainer: {
        // Add focused container styles if needed
    },

    // Label styles
    label: {
        ...Typography.label,
        color: '#FFFFFF',
        marginBottom: 8,
        fontWeight: '700',
        fontSize: 14,
    },
    smallLabel: {
        fontSize: 12,
    },
    mediumLabel: {
        fontSize: 14,
    },
    largeLabel: {
        fontSize: 16,
    },
    errorLabel: {
        color: '#EF4444',
    },
    disabledLabel: {
        color: '#9CA3AF',
    },
    required: {
        color: '#EF4444',
    },

    // Input container
    inputContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2D2D2D',
        borderRadius: 8,
        minHeight: 56,
    },

    // Input styles
    input: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingHorizontal: 16,
        paddingVertical: 16,
        color: '#FFFFFF',
        borderWidth: 0,
        fontSize: 16,
        minHeight: 56,
    },
    smallInput: {
        paddingVertical: 12,
        fontSize: 14,
    },
    mediumInput: {
        paddingVertical: 16,
        fontSize: 16,
    },
    largeInput: {
        paddingVertical: 20,
        fontSize: 18,
    },
    disabledInput: {
        backgroundColor: 'transparent',
        color: '#9CA3AF',
    },
    errorInput: {
        borderColor: '#EF4444',
    },

    // Icon styles
    leftIcon: {
        position: 'absolute',
        left: 16,
        zIndex: 1,
    },
    rightIcon: {
        position: 'absolute',
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
    },
    passwordToggle: {
        padding: 4,
    },
    passwordToggleText: {
        fontSize: 20,
        color: '#9CA3AF',
    },

    // Error styles
    error: {
        ...Typography.caption,
        color: '#EF4444',
        marginTop: 4,
        fontSize: 12,
    },
});

export default Input;
