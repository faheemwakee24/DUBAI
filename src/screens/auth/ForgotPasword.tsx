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
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../../components/ui';
import { useForgotPasswordMutation } from '../../store/api/authApi';
import { showToast } from '../../utils/toast';
import { useTranslation } from 'react-i18next';

type LoginScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'ResetPin'
>;

export default function ForgotPasword() {
    const [email, setEmail] = useState('');
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
    const { t } = useTranslation();

    const handleResetPassword = async () => {
        if (!email || !email.trim()) {
            showToast.error(
                t('forgotPassword.toastErrorTitle'),
                t('forgotPassword.toastMissingEmail')
            );
            return;
        }

        try {
            const result = await forgotPassword({
                email: email.trim(),
            }).unwrap();

            if (result.otpSent) {
                showToast.success(
                    t('forgotPassword.toastSuccessTitle'),
                    result.message || t('forgotPassword.toastSuccessBody')
                );
                // Navigate to ResetPin screen with email
                navigation.navigate('ResetPin', { email: email.trim() });
            }
        } catch (error: any) {
            console.error('Forgot password error:', error);
            showToast.error(
                t('forgotPassword.toastErrorTitle'),
                error?.data?.message || error?.message || t('forgotPassword.toastFailureBody')
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
                        <Text style={styles.welcomeTitle}>{t('forgotPassword.title')}</Text>
                        <Text style={styles.welcomeSubtitle}>{t('forgotPassword.subtitle')}</Text>
                    </View>

                    {/* Input Fields */}
                    <View style={styles.inputSection}>
                        {/* Email Input */}
                        <Input
                            label={t('forgotPassword.emailLabel')}
                            placeholder={t('forgotPassword.emailPlaceholder')}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            fullWidth
                            required
                        />



                    </View>





                    {/* Sign Up Link */}

                </ScrollView>
                <View style={styles.signUpSection}>
                    <PrimaryButton
                        title={
                            isLoading
                                ? t('forgotPassword.sendingButton')
                                : t('forgotPassword.sendButton')
                        }
                        onPress={handleResetPassword}
                        variant="primary"
                        size="medium"
                        fullWidth={true}
                        disabled={isLoading}
                    />
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

    // Button Section
    buttonSection: {
        marginBottom: metrics.width(30),
    },
    signInButton: {
        backgroundColor: '#ff6b35',
        borderRadius: 12,
        paddingVertical: 16,
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
    socialButton: {
        backgroundColor: '#374151',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    socialButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleIcon: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4285F4',
        marginRight: 12,
    },
    appleIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    socialButtonText: {
        ...Typography.button,
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
    },

    // Sign Up Section
    signUpSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: metrics.width(20),
        marginHorizontal: metrics.width(20),
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


