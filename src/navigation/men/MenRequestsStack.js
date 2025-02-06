import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MenNotificationsScreen from '../../screens/men/MenNotificationsScreen';
import ChatScreen from '../../screens/shared/ChatScreen';

const Stack = createNativeStackNavigator();

export default function MenNotificationsStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="MenNotifications"
                component={MenNotificationsScreen}
                options={{ title: 'Requests', headerShown: false }}
            />
            <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}
