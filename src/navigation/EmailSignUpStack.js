// navigation/EmailSignUpStack.js
import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../contexts/AuthContext';

import EmailStep1 from '../screens/auth/emailWizard/EmailStep1'; // Basic Info
import EmailStep2 from '../screens/auth/emailWizard/EmailStep2'; // Personal Details
import EmailStep3 from '../screens/auth/emailWizard/EmailStep3'; // Preferences
import EmailStep4 from '../screens/auth/emailWizard/EmailStep4'; // Permissions & Location
import EmailStep5 from '../screens/auth/emailWizard/EmailStep5'; // Confirmation

const Stack = createNativeStackNavigator();

export default function EmailSignUpStack() {
    const { userDoc } = useContext(AuthContext);

    function getInitialRoute() {
        // Simple example of skipping ahead if userDoc has certain fields.
        if (!userDoc) {
            return 'EmailStep1';
        }
        if (!userDoc?.birthday) {
            return 'EmailStep2';
        }
        if (!userDoc?.ageRange) {
            return 'EmailStep3';
        }
        if (!userDoc?.location) {
            return 'EmailStep4';
        }
        if (!userDoc?.onboardingComplete) {
            return 'EmailStep5';
        }
        // If fully complete, but user is still somehow on this stack,
        // default to Step 1 or redirect them. We'll do Step1:
        return 'EmailStep1';
    }

    return (
        <Stack.Navigator initialRouteName={getInitialRoute()}>
            <Stack.Screen
                name="EmailStep1"
                component={EmailStep1}
                options={{ title: 'Step 1: Basic Info', headerShown: false }}
            />
            <Stack.Screen
                name="EmailStep2"
                component={EmailStep2}
                options={{ title: 'Step 2: Personal Details', headerShown: false }}
            />
            <Stack.Screen
                name="EmailStep3"
                component={EmailStep3}
                options={{ title: 'Step 3: Preferences' }}
            />
            <Stack.Screen
                name="EmailStep4"
                component={EmailStep4}
                options={{ title: 'Step 4: Location & Permissions' }}
            />
            <Stack.Screen
                name="EmailStep5"
                component={EmailStep5}
                options={{ title: 'Step 5: Confirmation' }}
            />
        </Stack.Navigator>
    );
}
