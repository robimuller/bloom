import React from 'react';
import { View, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// Import your custom theme hook
import { useThemeContext } from '../../contexts/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// Import your screens and navigators
import MenHomeStack from './MenHomeStack';
import MenNotificationsScreen from '../../screens/men/MenNotificationsScreen';
import MenSettingsScreen from '../../screens/shared/SettingsScreen';
import MyPerksScreen from '../../screens/shared/MyPerksScreen';
import CreateDateScreen from '../../screens/men/CreateDateScreen';

const Tab = createBottomTabNavigator();
const SCREEN_WIDTH = Dimensions.get('window').width;

// Generic custom tab bar button with haptics
const CustomTabBarButton = ({ onPress, children, ...props }) => {
    return (
        <TouchableOpacity
            {...props}
            onPress={() => {
                Haptics.selectionAsync();
                if (onPress) onPress();
            }}
        >
            {children}
        </TouchableOpacity>
    );
};

// Special Create Date button component
const CreateDateButton = ({ size, focused }) => {
    const { colors } = useThemeContext();
    return (
        <View style={styles.createDateButtonContainer}>
            <LinearGradient
                colors={[colors.primary, "#7C49C6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.createDateButton, { width: size * 2, height: size * 2, borderRadius: size }]}
            >
                <Ionicons name="add" size={size} color={colors.background} />
            </LinearGradient>
        </View>
    );
};

const AnimatedTabIcon = ({ iconName, focused, size, color }) => {
    const { colors } = useThemeContext();
    const iconAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                scale: withTiming(focused ? 1.1 : 1, {
                    duration: 300,
                    easing: Easing.inOut(Easing.ease),
                }),
            },
        ],
    }));
    const indicatorStyle = useAnimatedStyle(() => ({
        height: withTiming(focused ? 4 : 0, {
            duration: 300,
            easing: Easing.inOut(Easing.ease),
        }),
        opacity: withTiming(focused ? 1 : 0, {
            duration: 300,
            easing: Easing.inOut(Easing.ease),
        }),
    }));
    return (
        <Animated.View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        top: -8,
                        width: '100%',
                        backgroundColor: colors.primary,
                        borderRadius: 2,
                    },
                    indicatorStyle,
                ]}
            />
            <Animated.View style={iconAnimatedStyle}>
                <Ionicons name={iconName} size={size} color={color} />
            </Animated.View>
        </Animated.View>
    );
};

export default function MenTabNavigator() {
    const { colors } = useThemeContext();

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: colors.cardBackground,
                        borderTopColor: colors.background,
                        borderTopWidth: 0,
                        elevation: 5,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 3,
                    },
                    tabBarButton: (props) => <CustomTabBarButton {...props} />,
                    tabBarIcon: ({ focused, color, size }) => {
                        if (route.name === 'Create Date') {
                            return <CreateDateButton size={size} focused={focused} />;
                        }
                        let iconName;
                        if (route.name === 'Home') {
                            iconName = focused ? 'home' : 'home-outline';
                        } else if (route.name === 'My Deals') {
                            iconName = focused ? 'ticket' : 'ticket-outline';
                        } else if (route.name === 'Notifications') {
                            iconName = focused ? 'heart' : 'heart-outline';
                        } else if (route.name === 'Settings') {
                            iconName = focused ? 'person' : 'person-outline';
                        }
                        return <AnimatedTabIcon iconName={iconName} focused={focused} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: 'gray',
                    tabBarShowLabel: false,
                    contentStyle: { backgroundColor: colors.background },
                })}
            >
                <Tab.Screen name="Home" component={MenHomeStack} />
                <Tab.Screen name="My Deals" component={MyPerksScreen} />
                <Tab.Screen name="Create Date" component={CreateDateScreen} />
                <Tab.Screen name="Notifications" component={MenNotificationsScreen} />
                <Tab.Screen name="Settings" component={MenSettingsScreen} />
            </Tab.Navigator>
        </View>
    );
}

const styles = StyleSheet.create({
    createDateButtonContainer: {
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    createDateButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});