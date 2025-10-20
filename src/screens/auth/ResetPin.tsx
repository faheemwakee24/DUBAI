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
import OTPInput from '../../components/ui/OTPInput';

import { FontFamily, Typography } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
type LoginScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Signup'
>;


export default function ResetPin() {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const [otp, setOtp] = useState('');

    const handleOTPChange = (text: string) => {
        setOtp(text);
    };

    const handleOTPComplete = (otpCode: string) => {
        console.log('OTP completed:', otpCode);
        // Handle OTP completion logic
    };

    const handleSignIn = () => {
        // Handle sign in logic
        console.log('Sign in pressed');
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
                        <Text style={styles.welcomeTitle}>Reset Password</Text>
                        <Text style={styles.welcomeSubtitle}>4-Digit verification code has been sent on your email</Text>
                    </View>

                    {/* Input Fields */}
                    <View style={styles.inputSection}>
                        {/* OTP Input */}
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
                        <Text style={styles.signUpText}>Didn’t receive the code? </Text>
                        <TouchableOpacity onPress={() => { }}>
                            <Text style={styles.signUpLink}> Request again</Text>
                        </TouchableOpacity>
                    </View>




                    {/* Sign Up Link */}

                </ScrollView>
                <View style={[styles.signUpSection, { marginHorizontal: metrics.width(20) }]}>
                    <PrimaryButton
                        title="Reset Password"
                        onPress={handleSignIn}
                        variant="primary"
                        size="medium"
                        fullWidth={true}
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


