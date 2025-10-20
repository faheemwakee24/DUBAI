import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import AuthLoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/home/HomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import SignUp from '../screens/auth/Signup';
import ForgotPasword from '../screens/auth/ForgotPasword';
import ResetPin from '../screens/auth/ResetPin';
import Onboarding from '../screens/auth/Onboarding';

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
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    return (
        <NavigationContainer


        >
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Login" component={AuthLoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Signup" component={SignUp} options={{ headerShown: false }} />
                <Stack.Screen name="ForgotPasword" component={ForgotPasword} options={{ headerShown: false }} />
                <Stack.Screen name="ResetPin" component={ResetPin} options={{ headerShown: false }} />
                <Stack.Screen name="Onboarding" component={Onboarding} options={{ headerShown: false }} />

                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}


