import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WomenHomeScreen from '../../screens/women/WomenHomeScreen';
import WomenFeedScreen from '../../screens/women/WomenFeedScreen';
import WomenFeedLayout from '../../components/WomenFeedLayout';
import { useThemeContext } from '../../contexts/ThemeContext';
import MenPromotionDetailScreen from '../../screens/men/MenPromotionDetailScreen';
import MenPromotionsListScreen from '../../screens/men/MenPromotionsListScreen';

const Stack = createNativeStackNavigator();

export default function MenHomeStack() {
    const { colors } = useThemeContext();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                detachInactiveScreens: false,
            }}
        >
            <Stack.Screen name="WomenHome" component={WomenHomeScreen} />
            <Stack.Screen name="WomenFeed" component={WomenFeedScreen} />
            <Stack.Screen name="WomenFeedLayout" component={WomenFeedLayout} />
        </Stack.Navigator>
    );
}