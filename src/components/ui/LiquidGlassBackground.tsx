import React, { PropsWithChildren } from 'react';
import { StyleProp, ViewStyle, StyleSheet, View } from 'react-native';
import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';
import { BlurView } from '@sbaiahmed1/react-native-blur';

type LiquidGlassBackgroundProps = PropsWithChildren<{
    style?: StyleProp<ViewStyle>;
    interactive?: boolean;
    effect?: 'clear' | 'light' | 'dark' | 'ultraThin' | 'thin' | 'regular' | 'thick';
}>;

export default function LiquidGlassBackground({
    children,
    style,
    interactive = false,
    effect = 'clear',
}: LiquidGlassBackgroundProps) {
    return (
        <View style={[styles.container, style]}>
            {/* Background blur only */}
            <LiquidGlassView
                style={StyleSheet.absoluteFill}
                interactive={interactive}
                effect={
                    effect === 'clear' || effect === 'regular' || effect === 'none'
                        ? effect
                        : 'regular'
                }
            >
                <BlurView
                    style={StyleSheet.absoluteFill}
                    blurType="systemUltraThinMaterial"
                    blurAmount={20}
                    reducedTransparencyFallbackColor="#000000"
                    type="liquidGlass"
                    glassType="clear"

                    glassTintColor="#000000"
                    glassOpacity={0.6}
                />
            </LiquidGlassView>

            {/* Foreground content */}
            <View style={styles.childrenContainer}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    childrenContainer: {
        // flex: 1,
        zIndex: 1, // Make sure it sits above the blur
    },
});
