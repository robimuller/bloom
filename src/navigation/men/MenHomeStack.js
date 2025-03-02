import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MenHomeScreen from '../../screens/men/MenHomeScreen';
import MenFeedScreen from '../../screens/men/MenFeedScreen';
import MenFeedLayout from '../../components/MenFeedLayout';

const Stack = createNativeStackNavigator();

export default function MenHomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MenHome" component={MenHomeScreen} />
            <Stack.Screen name="MenFeed" component={MenFeedScreen} />
            <Stack.Screen name="MenFeedLayout" component={MenFeedLayout} />
        </Stack.Navigator>
    );
}