import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MenHomeScreen from '../../screens/men/MenHomeScreen';
import MenFeedScreen from '../../screens/men/MenFeedScreen';
import MenFeedLayout from '../../components/MenFeedLayout';
import { useThemeContext } from '../../contexts/ThemeContext';
import MenPromotionDetailScreen from '../../screens/men/MenPromotionDetailScreen';
import MenPromotionsListScreen from '../../screens/men/MenPromotionsListScreen';
import PromotionInterestedWomenScreen from '../../screens/men/PromotionInterestedWomenScreen';
import CreateDateScreen from '../../screens/men/CreateDateScreen';

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
            <Stack.Screen name="MenHome" component={MenHomeScreen} />
            <Stack.Screen name="MenFeed" component={MenFeedScreen} />
            <Stack.Screen name="MenFeedLayout" component={MenFeedLayout} />
            <Stack.Screen name="MenPromotionDetail" component={MenPromotionDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MenPromotionsList" component={MenPromotionsListScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PromotionInterestedWomen" component={PromotionInterestedWomenScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CreateDate" component={CreateDateScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}