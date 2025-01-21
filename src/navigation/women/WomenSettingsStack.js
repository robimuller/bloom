// WomenSettingsStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../../screens/shared/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function WomenSettingsStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="WomenSettings" component={SettingsScreen} />
            {/* Add more women-specific settings screens if needed */}
        </Stack.Navigator>
    );
}
