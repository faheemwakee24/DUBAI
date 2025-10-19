import React, { PropsWithChildren } from 'react';
import { StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';

type LiquidGlassBackgroundProps = PropsWithChildren<{
    style?: StyleProp<ViewStyle>;
    interactive?: boolean;
    effect?: 'clear' | 'light' | 'dark' | 'ultraThin' | 'thin' | 'regular' | 'thick';
}>;

export default function LiquidGlassBackground({
    children,
    style,
    interactive = true,
    effect = 'clear',
}: LiquidGlassBackgroundProps) {
    return (
        <LiquidGlassView
            style={[styles.base, style, !isLiquidGlassSupported && styles.fallback]}
            interactive={interactive}
            // Ensure only supported effect values are passed
            effect={
                effect === 'clear' || effect === 'regular' || effect === 'none'
                    ? effect
                    : 'regular'
            }
        >
            {children}
        </LiquidGlassView>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: 24,
    },
    fallback: {
        backgroundColor: 'rgba(255,255,255,0.35)',
    },
});


