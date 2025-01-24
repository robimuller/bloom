// src/navigation/AppNavigator.js
import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';

// Stacks
import AuthStack from './AuthStack';
import MenTabNavigator from './men/MenTabNavigator';
import WomenTabNavigator from './women/WomenTabNavigator';

// We might also directly import the wizard stacks here
import EmailSignUpStack from './EmailSignUpStack';
import PhoneSignUpStack from './PhoneSignUpStack';

import { AuthContext } from '../contexts/AuthContext';

export default function AppNavigator() {
    const { user, userDoc, loadingAuth } = useContext(AuthContext);

    if (loadingAuth) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // If not logged in at all:
    if (!user) {
        return <AuthStack />;
    }

    // If user is logged in, but we see they haven't finished onboarding:
    if (userDoc && userDoc.onboardingComplete === false) {
        if (userDoc.signUpMethod === 'phone') {
            return <PhoneSignUpStack />;
        } else {
            return <EmailSignUpStack />;
        }
    }

    // Otherwise, user has finished onboarding, so route by gender
    if (userDoc?.gender === 'male') {
        return <MenTabNavigator />;
    } else if (userDoc?.gender === 'female') {
        return <WomenTabNavigator />;
    } else {
        // fallback if we don't know their gender
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
}
