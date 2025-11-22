import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import {Platform} from 'react-native';

// Configure Google Sign-In
// Use Web Client ID (client_type: 3) which works for both iOS and Android
GoogleSignin.configure({
  webClientId:
    '5903335579-gvuclhdvjhi9j8kq9rkqc89jjufj96rn.apps.googleusercontent.com', // ✅ from client_type 3
  // androidClientId (optional)
  // androidClientId: '5903335579-qarbihgknij8evc8sh16oo0jaiurlr2k.apps.googleusercontent.com',
  offlineAccess: true,
});

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

class AuthService {
  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<AuthUser> {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

      // Sign in with Google
      await GoogleSignin.signIn();

      // Get the user's ID token after sign in
      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens.idToken;
      
      if (!idToken) {
        throw new Error('Google Sign-In failed - no ID token returned');
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      const userCredential = await auth().signInWithCredential(googleCredential);

      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
      };
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      throw new Error(error?.message || 'Google sign-in failed');
    }
  }

  /**
   * Sign in with Apple
   */
  async signInWithApple(): Promise<AuthUser> {
    try {
      // Only available on iOS
      if (Platform.OS !== 'ios') {
        throw new Error('Apple Sign-In is only available on iOS');
      }

      // Check if Apple Sign-In is available
      // isSupported is a property, not a method for @invertase/react-native-apple-authentication
      if (!appleAuth.isSupported) {
        throw new Error('Apple Sign-In is not available on this device');
      }

      // Perform the sign-in request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // Handle cancellation or errors from Apple
      if (appleAuthRequestResponse.error) {
        throw new Error(
          `Apple Sign-In error: ${appleAuthRequestResponse.error.localizedDescription || appleAuthRequestResponse.error.code}`
        );
      }

      // Ensure the request was successful
      if (!appleAuthRequestResponse.identityToken) {
        throw new Error('Apple Sign-In failed - no identity token returned');
      }

      // Create a Firebase credential from the response
      const {identityToken} = appleAuthRequestResponse;

      // Create Apple credential for Firebase
      // Note: Firebase can work with just identityToken, but if nonce was provided, use it
      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        appleAuthRequestResponse.nonce || undefined,
      );

      // Sign the user in with the credential
      const userCredential = await auth().signInWithCredential(appleCredential);

      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
      };
    } catch (error: any) {
      console.error('Apple Sign-In Error:', error);
      
      // Provide more helpful error messages
      if (error?.code === 1000 || error?.message?.includes('1000')) {
        const isSimulator = Platform.OS === 'ios' && !appleAuth.isSupported;
        throw new Error(
          `Apple Sign-In Error 1000:\n` +
          `1. Ensure "Sign in with Apple" capability is enabled in Xcode\n` +
          (isSimulator 
            ? `2. Simulator Setup: Go to Settings → iCloud and sign in with Apple ID\n` +
              `3. Accept Terms & Conditions at iCloud.com\n` +
              `4. For best results, test on a real device`
            : `2. Test on a real device for best results`)
        );
      }
      
      if (error?.code === 1001) {
        throw new Error('Apple Sign-In was cancelled by the user.');
      }
      
      throw new Error(error?.message || 'Apple sign-in failed. Please try again.');
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      await auth().signOut();
      if (Platform.OS === 'android') {
        await GoogleSignin.signOut();
      }
    } catch (error: any) {
      console.error('Sign Out Error:', error);
      throw new Error(error?.message || 'Sign out failed');
    }
  }

  /**
   * Get the current authenticated user
   */
  getCurrentUser(): AuthUser | null {
    const user = auth().currentUser;
    if (!user) {
      return null;
    }
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  }

  /**
   * Listen to authentication state changes
   */
  onAuthStateChanged(callback: (user: AuthUser | null) => void) {
    return auth().onAuthStateChanged(user => {
      if (user) {
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      } else {
        callback(null);
      }
    });
  }
}

export default new AuthService();

