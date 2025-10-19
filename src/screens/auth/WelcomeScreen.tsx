import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { ScreenBackground, PrimaryButton, Icon, Text } from '../../components/ui';

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
                    <Icon name="Microphone" size={60} color="#fff" />
                </View>
            </View>

            {/* Welcome Card */}
            <View style={styles.welcomeCard}>
                <Text variant="h1" color="#fff" style={styles.welcomeTitle}>
                    Welcome to Dub AI
                </Text>
                <Text variant="bodyLarge" color="rgba(255, 255, 255, 0.8)" style={styles.welcomeSubtitle}>
                    Transform videos with AI dubbing and bring characters to life
                </Text>

                {/* Buttons */}
                <PrimaryButton
                    title="Create an Account"
                    onPress={handleCreateAccount}
                    variant="secondary"
                    size="medium"
                    fullWidth
                    style={styles.buttonSpacing}
                />

                <PrimaryButton
                    title="Sign In"
                    onPress={handleSignIn}
                    variant="primary"
                    size="medium"
                    fullWidth
                    icon={<Icon name="ArrowRight" size={20} color="#fff" />}
                    iconPosition="right"
                />
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
    welcomeCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        margin: 20,
        padding: 30,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    welcomeTitle: {
        textAlign: 'center',
        marginBottom: 12,
    },
    welcomeSubtitle: {
        textAlign: 'center',
        marginBottom: 30,
    },
    buttonSpacing: {
        marginBottom: 12,
    },
});
