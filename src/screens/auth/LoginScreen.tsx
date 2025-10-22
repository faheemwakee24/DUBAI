import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import PrimaryButton from '../../components/ui/PrimaryButton';
import Input from '../../components/ui/Input';

import { FontFamily, Typography } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { Svgs } from '../../assets/icons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

export default function AuthLoginScreen() {
    const [email, setEmail] = useState('');
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const [password, setPassword] = useState('');

    const handleSignIn = () => {
        // Handle sign in logic
        console.log('Sign in pressed');
        navigation.navigate('Onboarding')
    };


    const handleForgotPassword = () => {
        // Handle forgot password
        console.log('Forgot password pressed');
        navigation.navigate('ForgotPasword');
    };

    const handleSignUp = () => {
        // Handle sign up navigation
        navigation.navigate('Signup');
        console.log('Sign up pressed');
    };

    return (
        <ScreenBackground style={styles.container}>

            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Welcome Section */}
                    <View style={styles.welcomeSection}>
                        <Text style={styles.welcomeTitle}>Welcome Back!</Text>
                        <Text style={styles.welcomeSubtitle}>Sign in to continue your journey.</Text>
                    </View>

                    {/* Input Fields */}
                    <View style={styles.inputSection}>
                        {/* Email Input */}
                        <Input
                            label="Email"
                            placeholder="Enter your Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            fullWidth
                            required
                        />

                        {/* Password Input */}
                        <Input
                            label="Password"
                            placeholder="Enter your Password"
                            value={password}
                            onChangeText={setPassword}
                            showPasswordToggle
                            autoCapitalize="none"
                            autoCorrect={false}
                            fullWidth
                            required
                        />

                        {/* Forgot Password */}
                        <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handleForgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign In Button */}
                    <View style={styles.buttonSection}>
                        <PrimaryButton
                            title="Sign In"
                            onPress={handleSignIn}
                            variant="primary"
                            size="medium"
                            fullWidth={true}
                        />
                    </View>

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <LinearGradient
                            colors={[colors.gradient1, colors.gradient2, colors.gradient3]} // example colors
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.dividerLine}
                        />
                        <Text style={styles.dividerText}>Or continue with</Text>
                        <LinearGradient
                            colors={[colors.gradient3, colors.gradient2, colors.gradient1]} // example colors
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.dividerLine}
                        />
                    </View>

                    {/* Social Login Buttons */}
                    <View style={styles.socialSection}>
                        <PrimaryButton
                            title="Sign In with Google"
                            onPress={handleSignIn}
                            variant="secondary"
                            size="medium"
                            icon={<Svgs.GooglePLay />}
                            fullWidth={true}
                        />
                        <PrimaryButton
                            title="Sign In with Apple"
                            onPress={handleSignIn}
                            variant="secondary"
                            size="medium"
                            iconPosition="left"
                            icon={<Svgs.AppleIcon />}
                            fullWidth={true}
                        />
                    </View>

                    {/* Sign Up Link */}

                </ScrollView>
                <View style={styles.signUpSection}>
                    <Text style={styles.signUpText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={handleSignUp}>
                        <Text style={styles.signUpLink}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },

    // Welcome Section
    welcomeSection: {
        marginBottom: metrics.width(30),
    },
    welcomeTitle: {
        fontSize: metrics.width(30),
        fontFamily: FontFamily.spaceGrotesk.bold,
        color: colors.white,
        marginBottom: Platform.OS === 'ios' ? 8 : 5,
    },
    welcomeSubtitle: {
        fontSize: metrics.width(15),
        color: colors.subtitle,
        fontFamily: FontFamily.spaceGrotesk.regular,
    },

    // Input Section
    inputSection: {
        gap: metrics.width(16),
        marginBottom: metrics.width(30),

    },
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
    },
    forgotPasswordText: {
        fontFamily: FontFamily.spaceGrotesk.medium,
        fontSize: metrics.width(15),
        color: colors.white,
    },

    // Button Section
    buttonSection: {
        marginBottom: metrics.width(30),
    },

    // Divider
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: metrics.width(30),
    },
    dividerLine: { height: 2, borderRadius: 16, width: '30%' },
    dividerText: {
        fontFamily: FontFamily.spaceGrotesk.medium,
        fontSize: metrics.width(15),
        color: colors.subtitle,
        marginHorizontal: 12,

    },

    // Social Section
    socialSection: {
        marginBottom: metrics.width(30),
        gap: metrics.width(15),
    },

    // Sign Up Section
    signUpSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: metrics.width(20),
    },
    signUpText: {
        fontFamily: FontFamily.spaceGrotesk.regular,
        fontSize: metrics.width(15),
        color: colors.subtitle,
    },
    signUpLink: {
        fontFamily: FontFamily.spaceGrotesk.medium,
        fontSize: metrics.width(15),
        color: colors.white,
    },
});


