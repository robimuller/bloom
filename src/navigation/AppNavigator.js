import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

// Stacks
import AuthStack from './AuthStack';
import WomenMainNavigator from './women/WomenMainNavigator';
import MenTabNavigator from './men/MenTabNavigator';

// Wizard Stacks
import EmailSignUpStack from './EmailSignUpStack';
import PhoneSignUpStack from './PhoneSignUpStack';

import { AuthContext } from '../contexts/AuthContext';

export default function AppNavigator() {
    const { user, userDoc, loadingAuth } = useContext(AuthContext);
    const paperTheme = useTheme();

    if (loadingAuth) {
        return (
            <View style={[styles.center, { backgroundColor: paperTheme.colors.background }]}>
                <ActivityIndicator size="large" color={paperTheme.colors.primary} />
            </View>
        );
    }

    // If not logged in:
    if (!user) {
        return <AuthStack />;
    }

    // If user is logged in, but hasn't finished onboarding:
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
        return <WomenMainNavigator />;
    } else {
        return (
            <View style={[styles.center, { backgroundColor: paperTheme.colors.background }]}>
                <ActivityIndicator size="large" color={paperTheme.colors.primary} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});