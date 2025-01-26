// src/navigation/women/WomenMainNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import WomenHomeScreen from '../../screens/women/WomenHomeScreen';
import WomenRequestsScreen from '../../screens/women/WomenRequestsScreen';
import WomenSettingsScreen from '../../screens/shared/SettingsScreen';
import ChatScreen from '../../screens/shared/ChatScreen';
// Possibly more screens if needed

const Stack = createNativeStackNavigator();

export default function WomenMainNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="WomenHome" component={WomenHomeScreen} />
            <Stack.Screen name="WomenRequests" component={WomenRequestsScreen} />
            <Stack.Screen name="WomenSettings" component={WomenSettingsScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            {/* Add more if needed */}
        </Stack.Navigator>
    );
}
