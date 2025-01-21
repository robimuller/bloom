// navigation/EmailSignUpStack.js
import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../contexts/AuthContext';

import EmailStep1 from '../screens/auth/emailWizard/EmailStep1';
import EmailStep2 from '../screens/auth/emailWizard/EmailStep2';
import EmailStep3 from '../screens/auth/emailWizard/EmailStep3';
import EmailStep4 from '../screens/auth/emailWizard/EmailStep4';

const Stack = createNativeStackNavigator();

export default function EmailSignUpStack() {
    const { userDoc } = useContext(AuthContext);

    // A simple helper: if certain fields in Firestore are filled,
    // skip the earlier steps automatically.
    function getInitialRoute() {
        if (!userDoc) {
            return 'EmailStep1';
        }
        // For example, if we haven't set 'role' yet, that means
        // we only completed Step 1, so start at Step 2.
        if (!userDoc.role) {
            return 'EmailStep2';
        }
        // If we have role but not some "preferences" field or something,
        // you might start at Step 3, etc. 
        // If you only have 4 steps, just do a basic check:
        // else if(...) ...
        // Finally, if we can't decide, go Step 1.
        return 'EmailStep1';
    }

    return (
        <Stack.Navigator initialRouteName={getInitialRoute()}>
            <Stack.Screen name="EmailStep1" component={EmailStep1} options={{ title: 'Step 1' }} />
            <Stack.Screen name="EmailStep2" component={EmailStep2} options={{ title: 'Step 2' }} />
            <Stack.Screen name="EmailStep3" component={EmailStep3} options={{ title: 'Step 3' }} />
            <Stack.Screen name="EmailStep4" component={EmailStep4} options={{ title: 'Step 4' }} />
        </Stack.Navigator>
    );
}
