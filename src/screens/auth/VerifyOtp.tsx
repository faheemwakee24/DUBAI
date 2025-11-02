import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import Input from '../../components/ui/Input';
import OTPInput from '../../components/ui/OTPInput';

import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../../components/ui';
import { useVerifyOtpMutation, useResendOtpMutation } from '../../store/api/authApi';
import { tokenStorage } from '../../utils/tokenStorage';
import { showToast } from '../../utils/toast';

type VerifyOtpNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'VerifyOtp'
>;

export default function VerifyOtp() {
    const navigation = useNavigation<VerifyOtpNavigationProp>();
    const route = useRoute();
    const { email } = (route.params as any) || {};
    
    const [otp, setOtp] = useState('');
    const [verifyOtp, { isLoading: verifyLoading }] = useVerifyOtpMutation();
    const [resendOtp, { isLoading: resendLoading }] = useResendOtpMutation();
    const isVerifyingRef = useRef(false);

    const handleOTPChange = (text: string) => {
        setOtp(text);
        // Reset verifying flag when OTP changes
        if (isVerifyingRef.current && text.length < 4) {
            isVerifyingRef.current = false;
        }
    };

    const handleVerifyOtp = useCallback(async (otpCode: string) => {
        // Prevent multiple calls
        if (isVerifyingRef.current) {
            return;
        }

        if (!otpCode || otpCode.length !== 4) {
            showToast.error('Error', 'Please enter a valid 4-digit OTP');
            return;
        }

        if (!email) {
            showToast.error('Error', 'Email is required');
            navigation.goBack();
            return;
        }

        isVerifyingRef.current = true;

        try {
            const result = await verifyOtp({
                email: email.trim(),
                otpCode,
            }).unwrap();

            // Store tokens and user data
            await tokenStorage.setAccessToken(result.accessToken);
            await tokenStorage.setRefreshToken(result.refreshToken);
            await tokenStorage.setUser(result.user);

            showToast.success('Registration successful!', 'Welcome to the app');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            });
        } catch (error: any) {
            console.error('Verify OTP error:', error);
            showToast.error(
                'Verification Failed',
                error?.data?.message || error?.message || 'Invalid OTP. Please try again.'
            );
            // Reset on error so user can try again
            isVerifyingRef.current = false;
        }
    }, [email, verifyOtp, navigation]);

    const handleResendOtp = async () => {
        if (!email) {
            showToast.error('Error', 'Email is required');
            return;
        }

        try {
            const result = await resendOtp({
                email: email.trim(),
            }).unwrap();

            showToast.success('OTP resent!', result.message || 'A new verification code has been sent to your email');
            setOtp('');
        } catch (error: any) {
            console.error('Resend OTP error:', error);
            showToast.error(
                'Error',
                error?.data?.message || error?.message || 'Failed to resend OTP. Please try again.'
            );
        }
    };

    return (
        <ScreenBackground style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Header onBackPress={() => navigation.goBack()} showBackButton />
                    
                    {/* Welcome Section */}
                    <View style={styles.welcomeSection}>
                        <Text style={styles.welcomeTitle}>Enter Verification Code</Text>
                        <Text style={styles.welcomeSubtitle}>
                            A 4-digit code has been sent to {email || 'your email'}
                        </Text>
                    </View>

                    {/* OTP Input Section */}
                    <View style={styles.inputSection}>
                        <OTPInput
                            length={4}
                            value={otp}
                            onChangeText={handleOTPChange}
                            onComplete={handleVerifyOtp}
                            containerStyle={styles.otpContainer}
                            keyboardType="number-pad"
                        />
                    </View>

                    {/* Resend Section */}
                    <View style={styles.resendSection}>
                        <Text style={styles.resendText}>Didn't receive the code? </Text>
                        <TouchableOpacity onPress={handleResendOtp} disabled={resendLoading}>
                            <Text style={styles.resendLink}>
                                {resendLoading ? 'Sending...' : 'Resend'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
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
        paddingBottom: 40,
    },
    welcomeSection: {
        marginBottom: metrics.width(30),
        marginTop: metrics.width(20),
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
    inputSection: {
        gap: metrics.width(16),
        marginBottom: metrics.width(30),
    },
    otpContainer: {
        marginTop: metrics.width(20),
        marginBottom: metrics.width(10),
    },
    resendSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: metrics.width(20),
    },
    resendText: {
        fontFamily: FontFamily.spaceGrotesk.regular,
        fontSize: metrics.width(15),
        color: colors.subtitle,
    },
    resendLink: {
        fontFamily: FontFamily.spaceGrotesk.medium,
        fontSize: metrics.width(15),
        color: colors.white,
    },
});

