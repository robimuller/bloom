// WomenRequestsStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WomenRequestsScreen from '../../screens/women/WomenRequestsScreen';
import ChatScreen from '../../screens/shared/ChatScreen';

const Stack = createNativeStackNavigator();

export default function WomenRequestsStack() {
    return (
        <Stack.Navigator >
            <Stack.Screen
                name="WomenRequests"
                component={WomenRequestsScreen}
                options={{ title: 'Requests' }}
            />
            <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
    );
}
