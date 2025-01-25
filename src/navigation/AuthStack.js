// src/navigation/AuthStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUpChoiceScreen from '../screens/auth/SignUpChoiceScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import EmailSignUpStack from './EmailSignUpStack';
import PhoneSignUpStack from './PhoneSignUpStack';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
    return (
        <Stack.Navigator>
            {/* The user picks: "sign up w/ phone" or "sign up w/ email" */}
            <Stack.Screen
                name="SignUpChoice"
                component={SignUpChoiceScreen}
                options={{ title: 'Sign Up', headerShown: false }}
            />

            {/* Wizard flows */}
            <Stack.Screen
                name="EmailSignUpStack"
                component={EmailSignUpStack}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="PhoneSignUpStack"
                component={PhoneSignUpStack}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ title: 'Login' }}
            />
        </Stack.Navigator>
    );
}
