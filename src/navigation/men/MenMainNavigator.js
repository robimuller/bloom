// src/navigation/MenMainNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import MenHomeScreen from '../../screens/men/MenHomeScreen';
import MenNotificationsScreen from '../../screens/men/MenNotificationsScreen';
import MenSettingsScreen from '../../screens/shared/SettingsScreen';
import CreateDateScreen from '../../screens/men/CreateDateScreen';
import ChatScreen from '../../screens/shared/ChatScreen';
import MenFeedScreen from '../../screens/men/MenFeedScreen';
import MenPromotionDetailScreen from '../../screens/men/MenPromotionDetailScreen';
import MenPromotionsListScreen from '../../screens/men/MenPromotionsListScreen';
import PromotionInterestedWomenScreen from '../../screens/men/PromotionInterestedWomenScreen'

const Stack = createNativeStackNavigator();

export default function MenMainNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="MenHome" component={MenHomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MenNotifications" component={MenNotificationsScreen} options={{ headerShown: false }} />
            <Stack.Screen
                name="MenSettings"
                component={MenSettingsScreen}
                options={{
                    headerShown: false,
                    animation: 'slide_from_left',
                }}
            />
            <Stack.Screen name="CreateDate" component={CreateDateScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MenFeed" component={MenFeedScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MenPromotionDetail" component={MenPromotionDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MenPromotionsList" component={MenPromotionsListScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PromotionInterestedWomen" component={PromotionInterestedWomenScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}