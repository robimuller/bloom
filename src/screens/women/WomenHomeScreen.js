// src/screens/women/WomenHomeScreen.js
import React, { useContext } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';

import { RequestsContext } from '../../contexts/RequestsContext';
import WomenFeedScreen from './WomenFeedScreen';

export default function WomenHomeScreen() {
    const navigation = useNavigation();
    const paperTheme = useTheme();
    const { requests } = useContext(RequestsContext);
    const { colors } = useTheme();

    // Women see 'accepted' requests count
    const acceptedCount = requests.filter((r) => r.status === 'accepted').length;

    // Grab the gradient array from your Paper theme
    const gradientColors = paperTheme.colors.mainBackground || ['#fff', '#ccc'];

    // Shared value for scroll position
    const scrollY = useSharedValue(0);

    // Animated style for the header
    const headerAnimatedStyle = useAnimatedStyle(() => {
        const headerHeight = interpolate(
            scrollY.value,
            [0, 100], // Adjust these values based on how much you want the header to shrink
            [100, 60], // Initial height and final height of the header
            Extrapolate.CLAMP
        );

        const headerOpacity = interpolate(
            scrollY.value,
            [0, 100], // Adjust these values based on when you want the opacity to change
            [1, 0.8], // Initial opacity and final opacity
            Extrapolate.CLAMP
        );

        return {
            height: headerHeight,
            opacity: headerOpacity,
        };
    });

    return (
        <LinearGradient
            colors={gradientColors}
            style={styles.gradientContainer}
        >
            <SafeAreaView
                style={[styles.safeArea, { backgroundColor: 'transparent' }]}
                edges={['top']}
            >
                {/* Animated Top Bar */}
                <Animated.View style={[styles.topBar, headerAnimatedStyle]}>
                    {/* Left: Settings (circle) */}
                    <TouchableOpacity
                        style={[styles.iconCircle, { marginRight: 16, backgroundColor: colors.overlay }]}
                        onPress={() => navigation.navigate('WomenSettings')}
                    >
                        <Ionicons
                            name="settings-outline"
                            size={24}
                            color={paperTheme.colors.text}
                        />
                    </TouchableOpacity>

                    {/* Middle: Location placeholder */}
                    <View style={styles.locationContainer}>
                        {/* A label above the location text (optional) */}
                        <Text style={styles.locationLabel}>Location</Text>
                        <View style={styles.locationRow}>
                            <Ionicons
                                name="location-outline"
                                size={16}
                                color={paperTheme.colors.primary}
                                style={{ marginRight: 4 }}
                            />
                            <Text style={[styles.locationValue, { color: paperTheme.colors.text }]}>
                                Naperville, Illinois
                            </Text>
                            <Ionicons
                                name="chevron-down"
                                size={16}
                                color={paperTheme.colors.text}
                                style={{ marginLeft: 4 }}
                            />
                        </View>
                    </View>

                    {/* Right: Notifications (circle) */}
                    <TouchableOpacity
                        style={[styles.iconCircle, { backgroundColor: colors.overlay }]}
                        onPress={() => navigation.navigate('WomenRequests')}
                    >
                        <View style={{ position: 'relative' }}>
                            <Ionicons
                                name="notifications-outline"
                                size={24}
                                color={paperTheme.colors.text}
                            />
                            {acceptedCount > 0 && (
                                <View style={styles.badgeContainer}>
                                    <Text style={styles.badgeText}>
                                        {acceptedCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                {/* Main content: show the feed (optional) */}
                <View style={styles.mainContent}>
                    <WomenFeedScreen onScroll={(e) => {
                        scrollY.value = e.nativeEvent.contentOffset.y;
                    }} />
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradientContainer: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    topBar: {
        // A horizontal layout with space between left & right icons
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    iconCircle: {
        // A circle using the "overlay" color from your theme
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationContainer: {
        // Center label and row
        alignItems: 'center',
        flex: 1,  // let this expand to center it
    },
    locationLabel: {
        fontSize: 12,
        opacity: 0.8,
        marginBottom: 2,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    mainContent: {
        flex: 1,
        paddingHorizontal: 10,
        paddingTop: 16,
    },
    badgeContainer: {
        position: 'absolute',
        right: -6,
        top: -4,
        backgroundColor: 'red',
        borderRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 1,
        minWidth: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});