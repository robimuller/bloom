// MenFeedStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MenFeedScreen from '../../screens/men/MenFeedScreen';
import CreateDateScreen from '../../screens/men/CreateDateScreen';

const Stack = createNativeStackNavigator();

export default function MenFeedStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="MenFeed" component={MenFeedScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CreateDate" component={CreateDateScreen} options={{ headerShown: false }} />
            {/* Add more screens if needed */}
        </Stack.Navigator>
    );
}
