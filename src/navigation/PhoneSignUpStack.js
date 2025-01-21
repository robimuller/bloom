// navigation/PhoneSignUpStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PhoneStep1 from '../screens/auth/phoneWizard/PhoneStep1';
import PhoneStep2 from '../screens/auth/phoneWizard/PhoneStep2';
import PhoneStep3 from '../screens/auth/phoneWizard/PhoneStep3';
import PhoneStep4 from '../screens/auth/phoneWizard/PhoneStep4';
import PhoneStep5 from '../screens/auth/phoneWizard/PhoneStep5';

const Stack = createNativeStackNavigator();

export default function PhoneSignUpStack() {
    return (
        <Stack.Navigator screenOptions={{ headerTitle: 'Phone Sign Up' }}>
            <Stack.Screen name="PhoneStep1" component={PhoneStep1} />
            <Stack.Screen name="PhoneStep2" component={PhoneStep2} />
            <Stack.Screen name="PhoneStep3" component={PhoneStep3} />
            <Stack.Screen name="PhoneStep4" component={PhoneStep4} />
            <Stack.Screen name="PhoneStep5" component={PhoneStep5} />
        </Stack.Navigator>
    );
}
