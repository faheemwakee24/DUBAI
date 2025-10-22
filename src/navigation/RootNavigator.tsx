import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import AuthLoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/home/Dashboard';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import SignUp from '../screens/auth/Signup';
import ForgotPasword from '../screens/auth/ForgotPasword';
import ResetPin from '../screens/auth/ResetPin';
import Onboarding from '../screens/auth/Onboarding';
import UploadVedio from '../screens/vedioDub/UploadVedio';
import {
  GeneratingVedio,
  PreViewVedio,
  SelectVedioDescription,
} from '../screens/vedioDub';
import Dashboard from '../screens/home/Dashboard';
import { CharacherReader, ChoseCharacter, CustomizeAvatar } from '../screens/CharacterReader';
import PreviewCharacherVedio from '../screens/CharacterReader/PreviewCharacherVedio';
import { NewProject, ProjectVedios, RecentProjects } from '../screens/Projects';
import { Subscription, SubsCriptionDetail, BillingDetail } from '../screens/Subscriptions';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Signup: undefined;
  ForgotPasword: undefined;
  ResetPin: undefined;
  Onboarding: undefined;
  UploadVedio: undefined;
  SelectVedioDescription: undefined;
  GeneratingVedio: undefined;
  PreViewVedio: undefined;
  Dashboard: undefined;
  ChoseCharacter: undefined;
  CustomizeAvatar: undefined;
  CharacherReader:undefined;
  PreviewCharacherVedio:undefined;
  RecentProjects:undefined;
  ProjectVedios:undefined;
  NewProject:undefined;
  Subscription:undefined;
  SubsCriptionDetail:undefined;
  BillingDetail:undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
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
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
