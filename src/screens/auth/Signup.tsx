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
import { useRegisterMutation, useSocialAuthMutation } from '../../store/api/authApi';
import { tokenStorage } from '../../utils/tokenStorage';
import authService from '../../services/authService';
import { showToast } from '../../utils/toast';

type SignUpNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation<SignUpNavigationProp>();
    
    const [register, { isLoading: registerLoading }] = useRegisterMutation();
    const [socialAuth, { isLoading: socialLoading }] = useSocialAuthMutation();
    const [googleLoading, setGoogleLoading] = useState(false);
    const [appleLoading, setAppleLoading] = useState(false);

    const handleRegister = async () => {
        if (!email || !firstName || !lastName || !password) {
            showToast.error('Error', 'Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            showToast.error('Error', 'Password must be at least 6 characters');
            return;
        }

        try {
            const result = await register({
                email: email.trim(),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                password,
            }).unwrap();

            if (result.otpSent) {
                showToast.success('OTP sent!', 'A verification code has been sent to your email');
                navigation.navigate('VerifyOtp', { email: email.trim() });
            }
        } catch (error: any) {
            console.error('Register error:', error);
            showToast.error(
                'Registration Failed',
                error?.data?.message || error?.message || 'Failed to register. Please try again.'
            );
        }
    };


    const handleGoogleSignIn = async () => {
        try {
            setGoogleLoading(true);
            const firebaseUser = await authService.signInWithGoogle();
            
            const nameParts = firebaseUser.displayName?.split(' ') || [];
            const fName = nameParts[0] || '';
            const lName = nameParts.slice(1).join(' ') || '';

            const result = await socialAuth({
                email: firebaseUser.email || '',
                firstName: fName,
                lastName: lName,
                authProvider: 'google',
                providerId: firebaseUser.uid || '',
                avatar: firebaseUser.photoURL || undefined,
            }).unwrap();

            await tokenStorage.setAccessToken(result.accessToken);
            await tokenStorage.setRefreshToken(result.refreshToken);
            await tokenStorage.setUser(result.user);

            showToast.success('Google Sign-Up successful!', 'Welcome to the app');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            });
        } catch (error: any) {
            console.error('Google Sign-In Error:', error);
            showToast.error(
                'Sign Up Error',
                error?.data?.message || error?.message || 'Failed to sign up with Google.'
            );
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleAppleSignIn = async () => {
        try {
            if (Platform.OS !== 'ios') {
                showToast.error('Not Available', 'Apple Sign-In is only available on iOS devices.');
                return;
            }
            setAppleLoading(true);
            const firebaseUser = await authService.signInWithApple();
            
            const nameParts = firebaseUser.displayName?.split(' ') || [];
            const fName = nameParts[0] || '';
            const lName = nameParts.slice(1).join(' ') || '';

            const result = await socialAuth({
                email: firebaseUser.email || '',
                firstName: fName,
                lastName: lName,
                authProvider: 'apple',
                providerId: firebaseUser.uid || '',
                avatar: firebaseUser.photoURL || undefined,
            }).unwrap();

            await tokenStorage.setAccessToken(result.accessToken);
            await tokenStorage.setRefreshToken(result.refreshToken);
            await tokenStorage.setUser(result.user);

            showToast.success('Apple Sign-Up successful!', 'Welcome to the app');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            });
        } catch (error: any) {
            console.error('Apple Sign-In Error:', error);
            showToast.error(
                'Sign Up Error',
                error?.data?.message || error?.message || 'Failed to sign up with Apple.'
            );
        } finally {
            setAppleLoading(false);
        }
    };

    const handleSignUp = () => {
        navigation.goBack();
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
                        <Text style={styles.welcomeTitle}>Get Started</Text>
                        <Text style={styles.welcomeSubtitle}>Sign up to begin your journey.</Text>
                    </View>

                    {/* Input Fields */}
                    <View style={styles.inputSection}>
                        <Input
                            label="First Name"
                            placeholder="Enter your First Name"
                            value={firstName}
                            onChangeText={setFirstName}
                            autoCapitalize="words"
                            autoCorrect={false}
                            fullWidth
                            required
                        />
                        <Input
                            label="Last Name"
                            placeholder="Enter your Last Name"
                            value={lastName}
                            onChangeText={setLastName}
                            autoCapitalize="words"
                            autoCorrect={false}
                            fullWidth
                            required
                        />
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
                    </View>

                    {/* Sign In Button */}
                    <View style={styles.buttonSection}>
                        <PrimaryButton
                            title={registerLoading ? 'Creating...' : 'Create'}
                            onPress={handleRegister}
                            variant="primary"
                            size="medium"
                            fullWidth={true}
                            disabled={registerLoading || googleLoading || appleLoading}
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
                            title="Sign Up with Google"
                            onPress={handleGoogleSignIn}
                            variant="secondary"
                            size="medium"
                            icon={<Svgs.GooglePLay />}
                            fullWidth={true}
                            disabled={registerLoading || googleLoading || appleLoading}
                        />
                        {Platform.OS === 'ios' && (
                            <PrimaryButton
                                title="Sign Up with Apple"
                                onPress={handleAppleSignIn}
                                variant="secondary"
                                size="medium"
                                iconPosition="left"
                                icon={<Svgs.AppleIcon />}
                                fullWidth={true}
                                disabled={registerLoading || googleLoading || appleLoading}
                            />
                        )}
                    </View>

                    {/* Sign Up Link */}

                </ScrollView>
                <View style={styles.signUpSection}>
                    <Text style={styles.signUpText}>Already have an account? </Text>
                    <TouchableOpacity onPress={handleSignUp}>
                        <Text style={styles.signUpLink}>Sign In</Text>
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


