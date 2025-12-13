import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header, Input } from '../../components/ui';
import { showToast } from '../../utils/toast';
import { useGetProfileQuery, User } from '../../store/api/authApi';
import { tokenStorage } from '../../utils/tokenStorage';
import { useSubmitSupportRequestMutation } from '../../store/api/supportApi';

type SupportNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function Support() {
  const navigation = useNavigation<SupportNavigationProp>();
  const { data: profileData } = useGetProfileQuery();
  const [user, setUser] = useState<User | null>(null);
  const [submitSupportRequest, { isLoading: isSubmitting }] =
    useSubmitSupportRequestMutation();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Validation errors
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    message: '',
  });

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await tokenStorage.getUser();
        if (storedUser) {
          setUser(storedUser);
          // Set name from profile (firstName + lastName)
          const fullName =
            storedUser.firstName && storedUser.lastName
              ? `${storedUser.firstName} ${storedUser.lastName}`
              : storedUser.firstName || '';
          setName(fullName);
          setEmail(storedUser.email || '');
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };

    loadUser();
  }, []);

  // Update form when profile data is fetched
  useEffect(() => {
    if (profileData) {
      setUser(profileData as any);
      // Set name from profile (firstName + lastName)
      const fullName =
        (profileData as any).firstName && (profileData as any).lastName
          ? `${(profileData as any).firstName} ${(profileData as any).lastName}`
          : (profileData as any).firstName || '';
      setName(fullName);
      setEmail((profileData as any).email || '');
      // Update stored user data
      tokenStorage.setUser(profileData as any);
    }
  }, [profileData]);

  // Check if name and email exist in profile
  const hasNameInProfile = user?.firstName || user?.lastName;
  const hasEmailInProfile = !!user?.email;

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      message: '',
    };

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!message.trim()) {
      newErrors.message = 'Message is required';
    } else if (message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.message;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Get userId from local storage (same way as LoginScreen stores it)
    let userId: string | null = null;
    try {
      const storedUser = await tokenStorage.getUser();
      console.log('storedUser', JSON.stringify(storedUser, null, 8));

      if (storedUser?._id) {
        userId = storedUser._id;
      }
    } catch (error) {
      console.error('Error getting user from storage:', error);
    }

    if (!userId) {
      showToast.error(
        'Error',
        'User information not available. Please try again.',
      );
      return;
    }

    try {
      const response = await submitSupportRequest({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        userId: userId,
      }).unwrap();

      // Show success message
      showToast.success(
        'Support Request Submitted',
        'Thank you for contacting us. We will get back to you soon!',
      );

      // Clear form (only clear message, keep name and email if they came from profile)
      setMessage('');
      setErrors({ name: '', email: '', message: '' });
    } catch (error: any) {
      console.error('Error submitting support request:', error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        'Failed to submit support request. Please try again.';
      showToast.error('Submission Failed', errorMessage);
    }
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Support" showBackButton />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Message Section */}
          <View style={styles.messageSection}>
            <Text style={styles.messageTitle}>We're here to help!</Text>
            <Text style={styles.messageText}>
              Have a question or need assistance? Fill out the form below and
              our support team will get back to you as soon as possible. We
              typically respond within 24 hours.
            </Text>
          </View>

          {/* Form Fields Section */}
          <View style={styles.formSection}>
            {/* Name Field */}
            <Input
              label="Name"
              value={name}
              onChangeText={text => {
                setName(text);
                if (errors.name) {
                  setErrors({ ...errors, name: '' });
                }
              }}
              placeholder="Enter your name"
              autoCapitalize="words"
              fullWidth
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}

            {/* Email Field */}
            <Input
              label="Email"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (errors.email) {
                  setErrors({ ...errors, email: '' });
                }
              }}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              fullWidth
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
            {/* Message Field */}
            <Input
              label="Message"
              value={message}
              onChangeText={text => {
                setMessage(text);
                if (errors.message) {
                  setErrors({ ...errors, message: '' });
                }
              }}
              placeholder="Enter your message"
              multiline
              numberOfLines={6}
              fullWidth
              inputStyle={styles.messageInput}
            />
            <Text style={styles.errorText}>{errors.message}</Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <PrimaryButton
          title={isSubmitting ? 'Submitting...' : 'Submit'}
          onPress={handleSubmit}
          variant="primary"
          style={styles.submitButton}
          fullWidth
          disabled={isSubmitting}
        />
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
    marginHorizontal: metrics.width(25),
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 100, // Space for the fixed button
  },
  messageSection: {
    marginTop: metrics.width(20),
    marginBottom: metrics.width(10),
    gap: metrics.width(8),
  },
  messageTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(18),
    color: colors.white,
    marginBottom: metrics.width(4),
  },
  messageText: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
    color: colors.subtitle,
    lineHeight: metrics.width(20),
  },
  formSection: {
    marginTop: metrics.width(20),
    gap: metrics.width(10),
  },
  messageInput: {
    minHeight: metrics.width(120),
  },
  submitButton: {
    marginBottom: metrics.width(25),
  },
  errorText: {
    color: colors.primary,
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(14),
  },
});
