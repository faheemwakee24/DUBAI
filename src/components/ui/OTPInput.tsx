import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ViewStyle,
    TextStyle,
    Pressable,
    KeyboardTypeOptions,
} from 'react-native';
import { FontFamily } from '../../constants/fonts';
import colors from '../../constants/colors';
import LiquidGlassBackground from './LiquidGlassBackground';
import { metrics } from '../../constants/metrics';

export interface OTPInputProps {
    length?: number;
    value?: string;
    onChangeText?: (text: string) => void;
    onComplete?: (otp: string) => void;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    disabled?: boolean;
    autoFocus?: boolean;
    keyboardType?: KeyboardTypeOptions;
}

const OTPInput: React.FC<OTPInputProps> = ({
    length = 4,
    value = '',
    onChangeText,
    onComplete,
    containerStyle,
    inputStyle,
    disabled = false,
    autoFocus = true,
    keyboardType = 'number-pad',
}) => {
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    useEffect(() => {
        if (value.length === length && onComplete) {
            onComplete(value);
        }
    }, [value, length, onComplete]);

    const handleTextChange = (text: string) => {
        if (disabled) return;
        
        const cleanText = keyboardType === 'number-pad' 
            ? text.replace(/[^0-9]/g, '').slice(0, length)
            : text.slice(0, length);
            
        onChangeText?.(cleanText);
    };

    const handlePress = () => {
        if (inputRef.current && !disabled) {
            inputRef.current.focus();
        }
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {Array.from({ length }).map((_, i) => {
                const isActive = value.length === i; // Only the current position is active
                const isFilled = value.length > i;
                
                return (
                    <LiquidGlassBackground
                        key={i}
                        style={styles.glassContainer}
                        effect="clear"
                    >
                        <Pressable
                            style={[
                                styles.inputBox,
                                isActive
                                    ? styles.inputBoxActive
                                    : isFilled
                                    ? styles.inputBoxFilled
                                    : styles.inputBoxEmpty,
                            ]}
                            onPress={handlePress}
                        >
                            {isFilled && (
                                <Text style={[styles.pinText, inputStyle]}>{value[i]}</Text>
                            )}
                        </Pressable>
                    </LiquidGlassBackground>
                );
            })}
            <TextInput
                ref={inputRef}
                value={value}
                onChangeText={handleTextChange}
                keyboardType={keyboardType}
                maxLength={length}
                style={styles.hiddenInput}
                autoFocus={autoFocus}
                editable={!disabled}
                pointerEvents="none"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: metrics.width(16),
    },
    glassContainer: {
        height: metrics.width(70),
        width: metrics.width(70),
        borderRadius: 16,
    },
    inputBox: {
        height: '100%',
        width: '100%',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputBoxActive: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.white,

    },
    inputBoxFilled: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    inputBoxEmpty: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    pinText: {
        fontSize: metrics.width(24),
        fontFamily: FontFamily.spaceGrotesk.medium,
        color: colors.white,
        textAlign: 'center',
    },
    hiddenInput: {
        position: 'absolute',
        opacity: 0.01,
        width: '100%',
        height: 100,
        zIndex: 999,
    },
});

export default OTPInput;
