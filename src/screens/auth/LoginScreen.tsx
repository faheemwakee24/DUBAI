import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
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
import authService from '../../services/authService';
import { useLoginMutation, useSocialAuthMutation } from '../../store/api/authApi';
import { tokenStorage } from '../../utils/tokenStorage';
import { showToast } from '../../utils/toast';
import { useTranslation } from 'react-i18next';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

export default function AuthLoginScreen() {
    const [email, setEmail] = useState('');
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const [password, setPassword] = useState('');
    const [login, { isLoading: loginLoading }] = useLoginMutation();
    const [socialAuth, { isLoading: socialLoading }] = useSocialAuthMutation();
    const [googleLoading, setGoogleLoading] = useState(false);
    const [appleLoading, setAppleLoading] = useState(false);
    const { t } = useTranslation();

    const handleSignIn = async () => {
        if (!email || !password) {
            showToast.error(
                t('login.toast.errorTitle'),
                t('login.toast.missingFields')
            );
            return;
        }

        try {
            const result = await login({
                email: email.trim(),
                password,
            }).unwrap();

            // Store tokens and user data
            await tokenStorage.setAccessToken(result.accessToken);
            await tokenStorage.setRefreshToken(result.refreshToken);
            await tokenStorage.setUser(result.user);

            showToast.success(
                t('login.toast.successTitle'),
                t('login.toast.successBody')
            );
            navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            });
        } catch (error: any) {
            console.error('Login error:', error);
            showToast.error(
                t('login.toast.failureTitle'),
                error?.data?.message || error?.message || t('login.toast.failureBody')
            );
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setGoogleLoading(true);
            // First, authenticate with Firebase/Google
            const firebaseUser = await authService.signInWithGoogle();
            
            // Extract name parts
            const nameParts = firebaseUser.displayName?.split(' ') || [];
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            // Then authenticate with your backend API
            const result = await socialAuth({
                email: firebaseUser.email || '',
                firstName,
                lastName,
                authProvider: 'google',
                providerId: firebaseUser.uid || '',
                avatar: firebaseUser.photoURL || undefined,
            }).unwrap();

            // Store tokens and user data
            await tokenStorage.setAccessToken(result.accessToken);
            await tokenStorage.setRefreshToken(result.refreshToken);
            await tokenStorage.setUser(result.user);

            showToast.success(
                t('login.toast.googleSuccessTitle'),
                t('login.toast.successBody')
            );
            navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            });
        } catch (error: any) {
            console.error('Google Sign-In Error:', error);
            showToast.error(
                t('login.toast.socialErrorTitle'),
                error?.data?.message || error?.message || t('login.toast.socialErrorBody')
            );
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleAppleSignIn = async () => {
        try {
            if (Platform.OS !== 'ios') {
                showToast.error(
                    t('login.toast.appleUnavailableTitle'),
                    t('login.toast.appleUnavailableBody')
                );
                return;
            }
            setAppleLoading(true);
            // First, authenticate with Firebase/Apple
            const firebaseUser = await authService.signInWithApple();
            
            // Extract name parts
            const nameParts = firebaseUser.displayName?.split(' ') || [];
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            // Then authenticate with your backend API
            const result = await socialAuth({
                email: firebaseUser.email || '',
                firstName,
                lastName,
                authProvider: 'apple',
                providerId: firebaseUser.uid || '',
                avatar: firebaseUser.photoURL || undefined,
            }).unwrap();

            // Store tokens and user data
            await tokenStorage.setAccessToken(result.accessToken);
            await tokenStorage.setRefreshToken(result.refreshToken);
            await tokenStorage.setUser(result.user);

            showToast.success(
                t('login.toast.appleSuccessTitle'),
                t('login.toast.successBody')
            );
            navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            });
        } catch (error: any) {
            console.error('Apple Sign-In Error:', error);
            showToast.error(
                t('login.toast.socialErrorTitle'),
                error?.data?.message || error?.message || t('login.toast.socialErrorBody')
            );
        } finally {
            setAppleLoading(false);
        }
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
                        <Text style={styles.welcomeTitle}>{t('login.title')}</Text>
                        <Text style={styles.welcomeSubtitle}>{t('login.subtitle')}</Text>
                    </View>

                    {/* Input Fields */}
                    <View style={styles.inputSection}>
                        {/* Email Input */}
                        <Input
                            label={t('login.emailLabel')}
                            placeholder={t('login.emailPlaceholder')}
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
                            label={t('login.passwordLabel')}
                            placeholder={t('login.passwordPlaceholder')}
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
                            <Text style={styles.forgotPasswordText}>{t('login.forgotPassword')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign In Button */}
                    <View style={styles.buttonSection}>
                        <PrimaryButton
                            title={loginLoading ? t('login.signingInButton') : t('login.signInButton')}
                            onPress={handleSignIn}
                            variant="primary"
                            size="medium"
                            fullWidth={true}
                            disabled={loginLoading || googleLoading || appleLoading}
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
                        <Text style={styles.dividerText}>{t('login.dividerText')}</Text>
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
                            title={t('login.googleButton')}
                            onPress={handleGoogleSignIn}
                            variant="secondary"
                            size="medium"
                            icon={googleLoading ? <ActivityIndicator size="small" color={colors.white} /> : <Svgs.GooglePLay />}
                            fullWidth={true}
                            disabled={googleLoading || appleLoading}
                        />
                        {Platform.OS === 'ios' && (
                            <PrimaryButton
                                title={t('login.appleButton')}
                                onPress={handleAppleSignIn}
                                variant="secondary"
                                size="medium"
                                iconPosition="left"
                                icon={appleLoading ? <ActivityIndicator size="small" color={colors.white} /> : <Svgs.AppleIcon />}
                                fullWidth={true}
                                disabled={googleLoading || appleLoading}
                            />
                        )}
                    </View>

                    {/* Sign Up Link */}

                </ScrollView>
                <View style={styles.signUpSection}>
                    <Text style={styles.signUpText}>{t('login.signUpPrompt')}</Text>
                    <TouchableOpacity onPress={handleSignUp}>
                        <Text style={styles.signUpLink}>{t('login.signUpLink')}</Text>
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


