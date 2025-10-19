import React, { PropsWithChildren, useMemo } from 'react';
import { StyleProp, ViewStyle, StyleSheet, View } from 'react-native';
import { Canvas, BlurMask, Group, Image as SkiaImage, Rect, useImage, Paint } from '@shopify/react-native-skia';

type SkiaGlassBackgroundProps = PropsWithChildren<{
    style?: StyleProp<ViewStyle>;
    blur?: number;
    opacity?: number;
    backgroundColor?: string;
    imageUri?: string;
}>;

export default function SkiaGlassBackground({
    children,
    style,
    blur = 16,
    opacity = 0.5,
    backgroundColor = 'rgba(255,255,255,0.2)',
    imageUri,
}: SkiaGlassBackgroundProps) {
    // Optional: if you want an image backdrop under the blur
    const image = useImage(imageUri ?? '');

    const borderRadius = 24;

    return (
        <View style={[styles.container, { borderRadius }, style]}>
            <Canvas style={StyleSheet.absoluteFill}>
                <Group opacity={opacity}>
                    {image ? (
                        <SkiaImage image={image} x={0} y={0} width={1} height={1} fit="cover" />
                    ) : (
                        <Rect x={0} y={0} width={1} height={1} color={backgroundColor} />
                    )}
                    <BlurMask blur={blur} style="normal" />
                </Group>
            </Canvas>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
});


