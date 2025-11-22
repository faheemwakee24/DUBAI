/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { useEffect, useState } from 'react';
import { StatusBar, View, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';
import { StripeProvider } from '@stripe/stripe-react-native';
import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import { toastConfig } from './src/components/ui/ToastConfig';
import SplashScreen from './src/screens/auth/SplashScreen';
import { STRIPE_CONFIG } from './src/constants/stripe';
import { pushNotificationService } from './src/services/pushNotificationService';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Initialize push notifications
    pushNotificationService.initialize().catch((error) => {
      console.error('Failed to initialize push notifications:', error);
    });

    // Show splash screen for minimum duration, then hide it
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // 2 seconds minimum splash screen time

    return () => clearTimeout(timer);
  }, []);

  return (
    <Provider store={store}>
      <StripeProvider publishableKey={STRIPE_CONFIG.publishableKey}>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" />
          <View style={styles.container}>
            {showSplash ? (
              <SplashScreen />
            ) : (
              <>
                <AppContent />
                <ToastWrapper />
              </>
            )}
          </View>
        </SafeAreaProvider>
      </StripeProvider>
    </Provider>
  );
}

function ToastWrapper() {
  const insets = useSafeAreaInsets();
  // iOS needs safe area inset + padding, Android needs status bar height + padding
  const topOffset = Platform.OS === 'ios' 
    ? Math.max(insets.top + 10, 50) 
    : Math.max(insets.top + 10, 40);
  
  return <Toast config={toastConfig} topOffset={topOffset} />;
}

function AppContent() {
  return <RootNavigator />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
