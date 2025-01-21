import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MenRequestsScreen from '../../screens/men/MenRequestsScreen';
import ChatScreen from '../../screens/shared/ChatScreen';

const Stack = createNativeStackNavigator();

export default function MenRequestsStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="MenRequests"
                component={MenRequestsScreen}
                options={{ title: 'Requests' }}
            />
            <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
    );
}
