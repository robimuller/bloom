// WomenFeedStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WomenFeedScreen from '../../screens/women/WomenFeedScreen';

const Stack = createNativeStackNavigator();

export default function WomenFeedStack() {
    return (
        <Stack.Navigator >
            <Stack.Screen name="WomenFeed" component={WomenFeedScreen} />
            {/* Add more if needed, e.g. a DateDetailsScreen */}
        </Stack.Navigator>
    );
}
