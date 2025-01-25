// src/navigation/MenTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import AnimatedTabBarIcon from '../../components/AnimatedTabBarIcon'; // Adjust the path as needed

import MenFeedStack from './MenFeedStack';
import MenRequestsStack from './MenRequestsStack';
import MenSettingsStack from './MenSettingsStack';

const Tab = createBottomTabNavigator();

export default function MenTabNavigator() {
    const paperTheme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'MenFeedTab') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'MenRequestsTab') {
                        iconName = focused ? 'notifications' : 'notifications-outline';
                    } else if (route.name === 'MenSettingsTab') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }
                    return (
                        <AnimatedTabBarIcon
                            name={iconName}
                            color={color}
                            size={size}
                            focused={focused}
                        />
                    );
                },
                tabBarActiveTintColor: paperTheme.colors.primary,
                tabBarInactiveTintColor: paperTheme.colors.placeholder,
                tabBarStyle: {
                    backgroundColor: paperTheme.colors.surface,
                    borderTopWidth: 0,
                    elevation: 5, // Adds shadow for Android
                    shadowOpacity: 0.1, // Adds shadow for iOS
                    shadowRadius: 3,
                    shadowColor: paperTheme.colors.text,
                    height: 60, // Increased height for better touch targets
                    paddingBottom: 5, // Adjust padding as needed
                    position: 'absolute', // For floating effect
                    left: 20,
                    right: 20,
                    bottom: 10,
                    borderRadius: 15, // Rounded corners
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    marginBottom: 5,
                },
                tabBarShowLabel: true,
                tabBarHideOnKeyboard: true,
            })}
        >
            <Tab.Screen
                name="MenFeedTab"
                component={MenFeedStack}
                options={{ title: 'Feed' }}
            />
            <Tab.Screen
                name="MenRequestsTab"
                component={MenRequestsStack}
                options={{ title: 'Requests' }}
            />
            <Tab.Screen
                name="MenSettingsTab"
                component={MenSettingsStack}
                options={{ title: 'Settings' }}
            />
        </Tab.Navigator>
    );
}
