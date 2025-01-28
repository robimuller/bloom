// src/navigation/men/MenMainNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import MenHomeScreen from '../../screens/men/MenHomeScreen';
import MenRequestsScreen from '../../screens/men/MenRequestsScreen';
import MenSettingsScreen from '../../screens/shared/SettingsScreen';
// or you could keep a separate men-specific settings
import CreateDateScreen from '../../screens/men/CreateDateScreen';
import ChatScreen from '../../screens/shared/ChatScreen';

const Stack = createNativeStackNavigator();

export default function MenMainNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="MenHome" component={MenHomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MenRequests" component={MenRequestsScreen} />
            <Stack.Screen name="MenSettings" component={MenSettingsScreen} />
            <Stack.Screen name="CreateDate" component={CreateDateScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
    );
}
