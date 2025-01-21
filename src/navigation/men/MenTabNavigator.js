// MenTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

import MenFeedStack from './MenFeedStack';
import MenRequestsStack from './MenRequestsStack';
import MenSettingsStack from './MenSettingsStack';

const Tab = createBottomTabNavigator();

export default function MenTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'MenFeedTab') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'MenRequestsTab') {
                        iconName = focused ? 'notifications' : 'notifications-outline';
                    } else if (route.name === 'MenSettingsTab') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="MenFeedTab"
                component={MenFeedStack}
                options={{ title: 'Feed', headerShown: false }}
            />
            <Tab.Screen
                name="MenRequestsTab"
                component={MenRequestsStack}
                options={{ title: 'Men Requests', headerShown: false }}
            />
            <Tab.Screen
                name="MenSettingsTab"
                component={MenSettingsStack}
                options={{ title: 'Settings', headerShown: false }}
            />
        </Tab.Navigator>
    );
}
