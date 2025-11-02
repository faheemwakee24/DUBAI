import React, { useState, useEffect } from 'react';
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
import OTPInput from '../../components/ui/OTPInput';

import { FontFamily, Typography } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../../components/ui';
import { useVerifyResetOtpMutation, useResetPasswordMutation, useResendOtpMutation } from '../../store/api/authApi';
import { showToast } from '../../utils/toast';

type LoginScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'ResetPin'
>;

export default function ResetPin() {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const route = useRoute();
    const email = (route.params as any)?.email || '';
    
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    
    const [verifyOtp, { isLoading: verifyLoading }] = useVerifyResetOtpMutation();
    const [resetPassword, { isLoading: resetLoading }] = useResetPasswordMutation();
    const [resendOtp, { isLoading: resendLoading }] = useResendOtpMutation();

    useEffect(() => {
        if (!email) {
            // If no email, navigate back
            navigation.goBack();
        }
    }, [email, navigation]);

    const handleOTPChange = (text: string) => {
        setOtp(text);
    };

    const handleOTPComplete = async (otpCode: string) => {
        if (!otpCode || otpCode.length !== 4 || !email) {
            return;
        }

        try {
            const result = await verifyOtp({
                email,
                otpCode,
            }).unwrap();

            if (result.verified) {
                setOtpVerified(true);
                showToast.success('OTP verified!', 'Please enter your new password');
            }
        } catch (error: any) {
            console.error('Verify OTP error:', error);
            showToast.error(
                'Verification Failed',
                error?.data?.message || error?.message || 'Invalid OTP. Please try again.'
            );
            setOtp('');
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            showToast.error('Error', 'Please enter both password fields');
            return;
        }

        if (newPassword.length < 6) {
            showToast.error('Error', 'Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast.error('Error', 'Passwords do not match');
            return;
        }

        try {
            const result = await resetPassword({
                email,
                otpCode: otp,
                newPassword,
            }).unwrap();

            showToast.success('Password reset!', result.message || 'Your password has been reset successfully');
            setTimeout(() => {
                navigation.navigate('Login' as never);
            }, 1500);
        } catch (error: any) {
            console.error('Reset password error:', error);
            showToast.error(
                'Error',
                error?.data?.message || error?.message || 'Failed to reset password. Please try again.'
            );
        }
    };

    const handleResendOtp = async () => {
        try {
            const result = await resendOtp({
                email,
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
                    <Header onBackPress={()=>navigation.goBack()} showBackButton/>
                    {/* Welcome Section */}
                    <View style={styles.welcomeSection}>
                        <Text style={styles.welcomeTitle}>Reset Password</Text>
                        <Text style={styles.welcomeSubtitle}>
                            {otpVerified 
                                ? 'Enter your new password'
                                : '4-Digit verification code has been sent to your email'
                            }
                        </Text>
                    </View>

                    {/* Input Fields */}
                    {!otpVerified ? (
                        <>
                            <View style={styles.inputSection}>
                                <OTPInput
                                    length={4}
                                    value={otp}
                                    onChangeText={handleOTPChange}
                                    onComplete={handleOTPComplete}
                                    containerStyle={styles.otpContainer}
                                    keyboardType="number-pad"
                                />
                            </View>
                            <View style={styles.signUpSection}>
                                <Text style={styles.signUpText}>Didn't receive the code? </Text>
                                <TouchableOpacity onPress={handleResendOtp} disabled={resendLoading}>
                                    <Text style={styles.signUpLink}>
                                        {resendLoading ? 'Sending...' : 'Request again'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <View style={styles.inputSection}>
                            <Input
                                label="New Password"
                                placeholder="Enter your new password"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                showPasswordToggle
                                autoCapitalize="none"
                                autoCorrect={false}
                                fullWidth
                                required
                            />
                            <Input
                                label="Confirm Password"
                                placeholder="Confirm your new password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                showPasswordToggle
                                autoCapitalize="none"
                                autoCorrect={false}
                                fullWidth
                                required
                            />
                        </View>
                    )}




                    {/* Sign Up Link */}

                </ScrollView>
                {otpVerified && (
                    <View style={[styles.signUpSection, { marginHorizontal: metrics.width(20) }]}>
                        <PrimaryButton
                            title={resetLoading ? 'Resetting...' : 'Reset Password'}
                            onPress={handleResetPassword}
                            variant="primary"
                            size="medium"
                            fullWidth={true}
                            disabled={resetLoading}
                        />
                    </View>
                )}
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

    // Welcome Section
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


    // Sign Up Section
    signUpSection: {
        flexDirection: 'row',

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
    otpContainer: {
        marginBottom: metrics.width(20),
    },
});


