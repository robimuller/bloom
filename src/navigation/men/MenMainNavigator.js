// src/navigation/MenMainNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import navigators & screens
import MenTabNavigator from './MenTabNavigator';
import ChatScreen from '../../screens/shared/ChatScreen';
import MenFeedScreen from '../../screens/men/MenFeedScreen';
import MenPromotionDetailScreen from '../../screens/men/MenPromotionDetailScreen';
import MenPromotionsListScreen from '../../screens/men/MenPromotionsListScreen';
import PromotionInterestedWomenScreen from '../../screens/men/PromotionInterestedWomenScreen';
import CreateDateScreen from '../../screens/men/CreateDateScreen'

const Stack = createNativeStackNavigator();

export default function MenMainNavigator() {
    return (
        <Stack.Navigator>
            {/* Main Tabs (with Home, My Deals, Notifications & Settings) */}
            <Stack.Screen
                name="MainTabs"
                component={MenTabNavigator}
                options={{ headerShown: false }}
            />
            {/* Other screens that will be pushed on top */}
            <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CreateDate" component={CreateDateScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MenFeed" component={MenFeedScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MenPromotionDetail" component={MenPromotionDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MenPromotionsList" component={MenPromotionsListScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PromotionInterestedWomen" component={PromotionInterestedWomenScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}