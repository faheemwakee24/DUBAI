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
    Platform,
} from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import { FontFamily, Typography } from '../../constants/fonts';
import colors from '../../constants/colors';
import LiquidGlassBackground from './LiquidGlassBackground';
import { metrics } from '../../constants/metrics';
import { Svgs } from '../../assets/icons';

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
    tooltip?: string;
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
            tooltip,
            secureTextEntry,
            ...props
        },
        ref
    ) => {
        const [isPasswordVisible, setIsPasswordVisible] = useState(false);
        const [isFocused, setIsFocused] = useState(false);
        const [showTooltip, setShowTooltip] = useState(false);

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
            const baseStyle: TextStyle[] = [styles.input];

            if (disabled) {
                baseStyle.push(styles.disabledInput);
            }

            if (error) {
                baseStyle.push(styles.errorInput);
            }

            // For multiline inputs, ensure text starts at top
            if (props.multiline) {
                baseStyle.push(styles.multilineInput);
            }

            return StyleSheet.flatten([...baseStyle, inputStyle || {}]);
        };

        const getInputContainerStyle = (): ViewStyle => {
            const baseStyle: ViewStyle[] = [styles.inputContainer];
            
            // For multiline inputs, align to flex-start instead of center
            if (props.multiline) {
                baseStyle.push(styles.multilineInputContainer);
            }
            
            return StyleSheet.flatten(baseStyle);
        };

        const getLabelStyle = (): TextStyle => {
            const baseStyle: TextStyle[] = [styles.label];

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
                    {isPasswordVisible ? <Svgs.OpenEye /> : <Svgs.ClosedEye />}
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

        const renderTooltipIcon = () => {
            if (!tooltip) return null;

            const tooltipIcon = (
                <View style={styles.tooltipIcon}>
                    <Svgs.Info height={metrics.width(17)} width={metrics.width(17)}/>
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
                    //arrowStyle={styles.tooltipArrow}
                    closeOnContentInteraction={false}
                    closeOnChildInteraction={false}
                >
                    <TouchableOpacity
                        style={styles.tooltipIconContainer}
                        onPress={() => setShowTooltip(!showTooltip)}
                        disabled={disabled}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        {tooltipIcon}
                    </TouchableOpacity>
                </Tooltip>
            );
        };

        return (
            <LiquidGlassBackground style={styles.backgroundContainer}>
                <View style={getContainerStyle()}>
                    <View style={styles.rowww}>
                        <View style={styles.containerr}>
                            {label && (
                                <View style={styles.labelContainer}>
                                    <Text style={getLabelStyle()}>
                                        {label}
                                    </Text>
                                    {renderTooltipIcon()}
                                </View>
                            )}

                            <View style={getInputContainerStyle()}>
                                {renderLeftIcon()}

                                <TextInput
                                    ref={ref}
                                    style={getInputStyle()}
                                    secureTextEntry={showPasswordToggle ? !isPasswordVisible : secureTextEntry}
                                    editable={!disabled}
                                    onFocus={() => setIsFocused(true)}

                                    onBlur={() => setIsFocused(false)}
                                    placeholderTextColor={colors.subtitle}
                                    {...props}
                                />


                            </View>

                            {error && (
                                <Text style={getErrorStyle()}>{error}</Text>
                            )}
                        </View>

                    </View>
                    {renderRightIcon()}
                </View>
            </LiquidGlassBackground>
        );
    }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        fontSize: 16,
        minHeight: metrics.width(40),
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'visible',
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
        fontFamily: FontFamily.spaceGrotesk.medium,
        fontSize: metrics.width(15),
        color: colors.white,
        marginTop: metrics.width(11)
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
        color: colors.white,

    },
    multilineInputContainer: {
        alignItems: 'flex-start',
    },

    // Input styles
    input: {
        flex: 1,
        backgroundColor: 'transparent',
        color: colors.white,
        fontFamily: FontFamily.spaceGrotesk.regular,
        fontSize: metrics.width(16),
        height: Platform.OS == 'android' ? metrics.width(40) : metrics.width(42),
        lineHeight: metrics.width(24),
        marginBottom:Platform.OS=='ios'?metrics.width(2):0,
    },
    multilineInput: {
        textAlignVertical: 'top',
        paddingTop: Platform.OS === 'android' ? metrics.width(12) : 0,
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
    rowww: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
        overflow: 'visible',
    },
    containerr: { 
        flex: 1,
        overflow: 'visible',
    },
    backgroundContainer: { 
        borderRadius: 12,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: metrics.width(8),
    },
    tooltipIconContainer: {
        marginLeft: metrics.width(4),
    },
        tooltipIcon: {
      marginTop: metrics.width(7),
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
    tooltipArrow: {
        borderBottomColor: colors.primary40,
    },
    tooltipText: {
        fontFamily: FontFamily.spaceGrotesk.regular,
        fontSize: metrics.width(12),
        color: colors.white,
        lineHeight: metrics.width(18),
    },
});

export default Input;
