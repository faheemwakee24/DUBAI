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
import { useTranslation } from 'react-i18next';

type LoginScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'ResetPin'
>;

export default function ResetPin() {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const route = useRoute();
    const email = (route.params as any)?.email || '';
    const { t } = useTranslation();
    
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
                showToast.success(
                    t('resetPin.toast.otpVerifiedTitle'),
                    t('resetPin.toast.otpVerifiedBody')
                );
            }
        } catch (error: any) {
            console.error('Verify OTP error:', error);
            showToast.error(
                t('resetPin.toast.verifyErrorTitle'),
                error?.data?.message || error?.message || t('resetPin.toast.verifyErrorBody')
            );
            setOtp('');
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            showToast.error(
                t('resetPin.toast.errorTitle'),
                t('resetPin.toast.missingFields')
            );
            return;
        }

        if (newPassword.length < 6) {
            showToast.error(
                t('resetPin.toast.errorTitle'),
                t('resetPin.toast.passwordLength')
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast.error(
                t('resetPin.toast.errorTitle'),
                t('resetPin.toast.mismatch')
            );
            return;
        }

        try {
            const result = await resetPassword({
                email,
                otpCode: otp,
                newPassword,
            }).unwrap();

            showToast.success(
                t('resetPin.toast.resetSuccessTitle'),
                result.message || t('resetPin.toast.resetSuccessBody')
            );
            setTimeout(() => {
                navigation.navigate('Login' as never);
            }, 1500);
        } catch (error: any) {
            console.error('Reset password error:', error);
            showToast.error(
                t('resetPin.toast.errorTitle'),
                error?.data?.message || error?.message || t('resetPin.toast.resetErrorBody')
            );
        }
    };

    const handleResendOtp = async () => {
        try {
            const result = await resendOtp({
                email,
            }).unwrap();

            showToast.success(
                t('resetPin.toast.resendSuccessTitle'),
                result.message || t('resetPin.toast.resendSuccessBody')
            );
            setOtp('');
        } catch (error: any) {
            console.error('Resend OTP error:', error);
            showToast.error(
                t('resetPin.toast.errorTitle'),
                error?.data?.message || error?.message || t('resetPin.toast.resendErrorBody')
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
                        <Text style={styles.welcomeTitle}>{t('resetPin.title')}</Text>
                        <Text style={styles.welcomeSubtitle}>
                            {otpVerified 
                                ? t('resetPin.subtitleVerified')
                                : t('resetPin.subtitlePending')
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
                                <Text style={styles.signUpText}>{t('resetPin.prompts.noCode')}</Text>
                                <TouchableOpacity onPress={handleResendOtp} disabled={resendLoading}>
                                    <Text style={styles.signUpLink}>
                                        {resendLoading
                                            ? t('resetPin.prompts.resending')
                                            : t('resetPin.prompts.resend')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <View style={styles.inputSection}>
                            <Input
                                label={t('resetPin.inputs.newPasswordLabel')}
                                placeholder={t('resetPin.inputs.newPasswordPlaceholder')}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                showPasswordToggle
                                autoCapitalize="none"
                                autoCorrect={false}
                                fullWidth
                                required
                            />
                            <Input
                                label={t('resetPin.inputs.confirmPasswordLabel')}
                                placeholder={t('resetPin.inputs.confirmPasswordPlaceholder')}
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
                            title={
                                resetLoading
                                    ? t('resetPin.buttons.resetting')
                                    : t('resetPin.buttons.reset')
                            }
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


