// MenSettingsStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../../screens/shared/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function MenSettingsStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="MenSettings" component={SettingsScreen} options={{ headerShown: false }} />
            {/* Add more men-specific settings screens if needed */}
        </Stack.Navigator>
    );
}
