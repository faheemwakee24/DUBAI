import React, { PropsWithChildren } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';

type ScreenBackgroundProps = PropsWithChildren<{
    style?: any;
}>;

const { width, height } = Dimensions.get('window');

export default function ScreenBackground({ children, style }: ScreenBackgroundProps) {
    return (
        <View style={[styles.container, style]}>
            <LinearGradient
                colors={['#330904', '#040102', '#040102', '#330904']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            />
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});
