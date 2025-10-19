import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { ScreenBackground } from '../../components/ui';

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
    const navigation = useNavigation<WelcomeScreenNavigationProp>();

    const handleCreateAccount = () => {
        // Navigate to create account screen (to be implemented)
        console.log('Create Account pressed');
    };

    const handleSignIn = () => {
        navigation.navigate('Login');
    };

    return (
        <ScreenBackground style={styles.container}>

            {/* Logo Section */}
            <View style={styles.logoContainer}>
                {/* Concentric rings for sound wave effect */}
                <View style={[styles.ring, styles.ring1]} />
                <View style={[styles.ring, styles.ring2]} />
                <View style={[styles.ring, styles.ring3]} />

                {/* Main logo circle */}
                <View style={styles.logoCircle}>
                    {/* Microphone/speech icon */}
                    <View style={styles.micIcon}>
                        <View style={styles.micBody} />
                        <View style={styles.soundWave1} />
                        <View style={styles.soundWave2} />
                        <View style={styles.soundWave3} />
                    </View>
                </View>
            </View>

            {/* Welcome Card */}
            <View style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>Welcome to Dub AI</Text>
                <Text style={styles.welcomeSubtitle}>
                    Transform videos with AI dubbing and bring characters to life
                </Text>

                {/* Buttons */}
                <TouchableOpacity style={styles.createAccountButton} onPress={handleCreateAccount}>
                    <Text style={styles.createAccountText}>Create an Account</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
                    <Text style={styles.signInText}>Sign In</Text>
                </TouchableOpacity>
            </View>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    ring: {
        position: 'absolute',
        borderRadius: 200,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    ring1: {
        width: 200,
        height: 200,
    },
    ring2: {
        width: 250,
        height: 250,
    },
    ring3: {
        width: 300,
        height: 300,
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#ff6b35',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#ff6b35',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    micIcon: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    micBody: {
        width: 20,
        height: 30,
        backgroundColor: '#fff',
        borderRadius: 10,
        position: 'absolute',
    },
    soundWave1: {
        position: 'absolute',
        right: -8,
        width: 8,
        height: 4,
        backgroundColor: '#fff',
        borderRadius: 2,
    },
    soundWave2: {
        position: 'absolute',
        right: -12,
        width: 12,
        height: 6,
        backgroundColor: '#fff',
        borderRadius: 3,
    },
    soundWave3: {
        position: 'absolute',
        right: -16,
        width: 16,
        height: 8,
        backgroundColor: '#fff',
        borderRadius: 4,
    },
    welcomeCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        margin: 20,
        padding: 30,
        borderRadius: 20,
        backdropFilter: 'blur(10px)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    createAccountButton: {
        backgroundColor: '#333',
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    createAccountText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    signInButton: {
        backgroundColor: '#ff6b35',
        paddingVertical: 16,
        borderRadius: 12,
    },
    signInText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});
