// navigation/EmailSignUpStack.js
import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import EmailStep1 from '../screens/auth/emailWizard/EmailStep1'; // Basic Info
import EmailStep2 from '../screens/auth/emailWizard/EmailStep2'; // Personal Details
import EmailStep3 from '../screens/auth/emailWizard/EmailStep3'; // Preferences
import EmailStep4 from '../screens/auth/emailWizard/EmailStep4'; // Permissions & Location
import EmailStep5 from '../screens/auth/emailWizard/EmailStep5'; // Confirmation
import { WizardProvider } from '../contexts/WizardContext';


const Stack = createNativeStackNavigator();

export default function EmailSignUpStack({ navigation }) {

    return (
        <WizardProvider navigation={navigation}>

            <Stack.Navigator>
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
                    options={{ title: 'Step 3: Preferences', headerShown: false }}
                />
                <Stack.Screen
                    name="EmailStep4"
                    component={EmailStep4}
                    options={{ title: 'Step 4: Location & Permissions', headerShown: false }}
                />
                <Stack.Screen
                    name="EmailStep5"
                    component={EmailStep5}
                    options={{ title: 'Step 5: Confirmation', headerShown: false }}
                />
            </Stack.Navigator>
        </WizardProvider>
    );
}