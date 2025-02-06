// WoMenNotificationsStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WomenNotificationsScreen from '../../screens/women/WomenNotificationsScreen';
import ChatScreen from '../../screens/shared/ChatScreen';

const Stack = createNativeStackNavigator();

export default function WoMenNotificationsStack() {
    return (
        <Stack.Navigator >
            <Stack.Screen
                name="WomenNotifications"
                component={WomenNotificationsScreen}
                options={{ title: 'Requests' }}
            />
            <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
    );
}
