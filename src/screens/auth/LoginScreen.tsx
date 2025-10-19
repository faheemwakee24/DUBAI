import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LiquidGlassBackground, SkiaGlassBackground } from '../../components/ui';

export default function AuthLoginScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.mainTitle}>Dub AI</Text>

            {/* Liquid Glass Component */}
            <LiquidGlassBackground style={styles.glassCard}>
                <Text style={styles.cardTitle}>Liquid Glass Effect</Text>
                <Text style={styles.cardDescription}>
                    This uses @callstack/liquid-glass with native blur effects
                </Text>
            </LiquidGlassBackground>

            {/* Skia Glass Component */}
            <SkiaGlassBackground style={styles.glassCard} blur={20} opacity={0.6}>
                <Text style={styles.cardTitle}>Skia Glass Effect</Text>
                <Text style={styles.cardDescription}>
                    This uses @shopify/react-native-skia for cross-platform blur
                </Text>
            </SkiaGlassBackground>

            {/* Combined Demo */}
            <View style={styles.combinedDemo}>
                <LiquidGlassBackground style={styles.smallCard}>
                    <Text style={styles.smallCardText}>Liquid</Text>
                </LiquidGlassBackground>
                <SkiaGlassBackground style={styles.smallCard} blur={15} opacity={0.4}>
                    <Text style={styles.smallCardText}>Skia</Text>
                </SkiaGlassBackground>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    contentContainer: {
        padding: 20,
        alignItems: 'center',
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 40,
        marginTop: 60,
    },
    glassCard: {
        width: '100%',
        marginVertical: 10,
        padding: 20,
        minHeight: 120,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
        color: '#e0e0e0',
        lineHeight: 20,
    },
    combinedDemo: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    smallCard: {
        width: '48%',
        padding: 15,
        minHeight: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    smallCardText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});


