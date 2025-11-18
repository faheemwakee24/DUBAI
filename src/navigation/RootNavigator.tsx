import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import AuthLoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/home/Dashboard';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import SignUp from '../screens/auth/Signup';
import VerifyOtp from '../screens/auth/VerifyOtp';
import ForgotPasword from '../screens/auth/ForgotPasword';
import ResetPin from '../screens/auth/ResetPin';
import Onboarding from '../screens/auth/Onboarding';
import UploadVedio from '../screens/vedioDub/UploadVedio';
import {
  GeneratingVedio,
  PreViewVedio,
  SelectVedioDescription,
  GeneratingClone,
} from '../screens/vedioDub';
import Dashboard from '../screens/home/Dashboard';
import { CharacherReader, ChoseCharacter, CustomizeAvatar } from '../screens/CharacterReader';
import PreviewCharacherVedio from '../screens/CharacterReader/PreviewCharacherVedio';
import { NewProject, ProjectVedios, RecentProjects } from '../screens/Projects';
import { Subscription, SubsCriptionDetail, BillingDetail, PaymentMethodScreen } from '../screens/Subscriptions';
import { Settings, EditAccount, Language } from '../screens/settings';
import { Notifications } from '../screens/notifications';
import { VideoHistory } from '../screens/history';
import { AvatarCustomization } from '../screens/AvatarCustomization';
import { tokenStorage } from '../utils/tokenStorage';
import SplashScreen from '../screens/auth/SplashScreen';
import { StyleSheet } from 'react-native';
import { SubscriptionPlan } from '../store/api/subscriptionsApi';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  EditAccount: undefined;
  Language: undefined;
  Notifications: undefined;
  VideoHistory: undefined;
  Signup: undefined;
  VerifyOtp: { email: string };
  ForgotPasword: undefined;
  ResetPin: { email?: string };
  Onboarding: undefined;
  UploadVedio: undefined;
  SelectVedioDescription: { 
    video: {
      uri: string;
      type: string;
      name: string;
      fileSize?: number;
      duration?: number;
    };
  };
  GeneratingVedio: { talkId: string };
  GeneratingClone: {
    video: {
      uri: string;
      type: string;
      name: string;
      fileSize?: number;
      duration?: number;
    };
    language: string;
    voiceStyle: string;
  };
  PreViewVedio: { video_url: string };
  Dashboard: undefined;
  ChoseCharacter: undefined;
  CustomizeAvatar: { character: number };
  CharacherReader: { character: number, body: string, hair: string, accessories: string, background: string, emotion: string };
  PreviewCharacherVedio: { character: number, body: string, hair: string, accessories: string, background: string, emotion: string, message: string, speed: string, voiceTone: string };
  RecentProjects:undefined;
  ProjectVedios:undefined;
  NewProject:undefined;
  Subscription:undefined;
  SubsCriptionDetail:{ plan: SubscriptionPlan };
  BillingDetail:undefined;
  PaymentMethodScreen:undefined;
  AvatarCustomization:undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuthStatus = async () => {
      try {
        const token = await tokenStorage.getAccessToken();
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Show loading indicator while checking auth status
  if (isLoggedIn === null) {
    return (
      <SplashScreen />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? 'Dashboard' : 'Welcome'}
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={AuthLoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signup"
          component={SignUp}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VerifyOtp"
          component={VerifyOtp}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPasword"
          component={ForgotPasword}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ResetPin"
          component={ResetPin}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Onboarding"
          component={Onboarding}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UploadVedio"
          component={UploadVedio}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SelectVedioDescription"
          component={SelectVedioDescription}
        />
        <Stack.Screen name="GeneratingVedio" component={GeneratingVedio} />
        <Stack.Screen name="GeneratingClone" component={GeneratingClone} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
       
        <Stack.Screen name="PreViewVedio" component={PreViewVedio} />
        <Stack.Screen name="ChoseCharacter" component={ChoseCharacter} />
        <Stack.Screen name="CustomizeAvatar" component={CustomizeAvatar} />
        <Stack.Screen name="CharacherReader" component={CharacherReader} />
        <Stack.Screen name="PreviewCharacherVedio" component={PreviewCharacherVedio} />
        <Stack.Screen name="RecentProjects" component={RecentProjects} />
        <Stack.Screen name="ProjectVedios" component={ProjectVedios} />
        <Stack.Screen name="NewProject" component={NewProject} />
        <Stack.Screen name="Subscription" component={Subscription} />
        <Stack.Screen name="SubsCriptionDetail" component={SubsCriptionDetail} />
        <Stack.Screen name="BillingDetail" component={BillingDetail} />
        <Stack.Screen name="PaymentMethodScreen" component={PaymentMethodScreen} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="EditAccount" component={EditAccount} />
        <Stack.Screen name="Language" component={Language} />
        <Stack.Screen name="Notifications" component={Notifications} />
        <Stack.Screen name="VideoHistory" component={VideoHistory} />
        <Stack.Screen name="AvatarCustomization" component={AvatarCustomization} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});
