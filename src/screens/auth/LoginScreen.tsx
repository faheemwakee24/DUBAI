import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TextInput, 
    TouchableOpacity, 
    StatusBar,
    SafeAreaView,
    Dimensions
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import PrimaryButton from '../../components/ui/PrimaryButton';
import Input from '../../components/ui/Input';
import { colors } from '../../constants/colors';
import { Typography } from '../../constants/fonts';

const { width, height } = Dimensions.get('window');

export default function AuthLoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignIn = () => {
        // Handle sign in logic
        console.log('Sign in pressed');
    };

    const handleGoogleSignIn = () => {
        // Handle Google sign in
        console.log('Google sign in pressed');
    };

    const handleAppleSignIn = () => {
        // Handle Apple sign in
        console.log('Apple sign in pressed');
    };

    const handleForgotPassword = () => {
        // Handle forgot password
        console.log('Forgot password pressed');
    };

    const handleSignUp = () => {
        // Handle sign up navigation
        console.log('Sign up pressed');
    };

    return (
        <ScreenBackground style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />
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
                            size="large"
                            fullWidth={true}
                            style={styles.signInButton}
                        />
                    </View>

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>Or continue with</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Social Login Buttons */}
                    <View style={styles.socialSection}>
                        {/* Google Sign In */}
                        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
                            <View style={styles.socialButtonContent}>
                                <Text style={styles.googleIcon}>G</Text>
                                <Text style={styles.socialButtonText}>Sign In with Google</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Apple Sign In */}
                        <TouchableOpacity style={styles.socialButton} onPress={handleAppleSignIn}>
                            <View style={styles.socialButtonContent}>
                                <Text style={styles.appleIcon}>🍎</Text>
                                <Text style={styles.socialButtonText}>Sign In with Apple</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Sign Up Link */}
                    <View style={styles.signUpSection}>
                        <Text style={styles.signUpText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={handleSignUp}>
                            <Text style={styles.signUpLink}>Sign Up</Text>
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
        paddingTop: 60,
        paddingBottom: 40,
    },
    
    // Welcome Section
    welcomeSection: {
        marginBottom: 40,
    },
    welcomeTitle: {
        ...Typography.h1,
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        ...Typography.body,
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.8,
    },
    
    // Input Section
    inputSection: {
        marginBottom: 32,
    },
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    forgotPasswordText: {
        ...Typography.body,
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    
    // Button Section
    buttonSection: {
        marginBottom: 32,
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
        marginBottom: 32,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    dividerText: {
        ...Typography.body,
        fontSize: 14,
        color: '#FFFFFF',
        marginHorizontal: 16,
        opacity: 0.7,
    },
    
    // Social Section
    socialSection: {
        marginBottom: 40,
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
    },
    signUpText: {
        ...Typography.body,
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.8,
    },
    signUpLink: {
        ...Typography.body,
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '600',
    },
});


