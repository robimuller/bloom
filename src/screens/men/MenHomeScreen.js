// src/screens/men/MenHomeScreen.js
import React, { useContext, useState } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, FAB } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';

import { RequestsContext } from '../../contexts/RequestsContext';
import MenFeedScreen from './MenFeedScreen';
import CreateDateModal from '../../components/CreateDateModal';
import CreateDateScreen from './CreateDateScreen';
import CategoryFilter from '../../components/CategoryFilter'; // <-- Import the filter

export default function MenHomeScreen() {
    const navigation = useNavigation();
    const paperTheme = useTheme();
    const { requests } = useContext(RequestsContext);
    const { colors } = useTheme();
    const [isCreateDateModalVisible, setIsCreateDateModalVisible] = useState(false);

    // Men see pending requests or invites count
    const pendingCount = requests.filter((r) => r.status === 'pending').length;

    // Grab the gradient array from your Paper theme
    const gradientColors = paperTheme.colors.mainBackground || ['#fff', '#ccc'];

    // Shared value for scroll position
    const scrollY = useSharedValue(0);

    // Animated style for the header (height + opacity)
    const headerAnimatedStyle = useAnimatedStyle(() => {
        const headerHeight = interpolate(
            scrollY.value,
            [0, 100],
            [100, 60],
            Extrapolate.CLAMP
        );
        const headerOpacity = interpolate(
            scrollY.value,
            [0, 100],
            [1, 0.8],
            Extrapolate.CLAMP
        );
        return {
            height: headerHeight,
            opacity: headerOpacity,
        };
    });

    // Optionally, handle filter changes
    const handleCategorySelect = (categoryId) => {
        // Implement your filtering logic here.
        // For example, update a state or trigger a refetch.
        console.log('Selected category:', categoryId);
    };

    return (
        <LinearGradient colors={gradientColors} style={styles.gradientContainer}>
            <SafeAreaView
                style={[styles.safeArea, { backgroundColor: 'transparent' }]}
                edges={['top']}
            >
                {/* Animated Top Bar */}
                <Animated.View style={[styles.topBar, headerAnimatedStyle]}>
                    {/* Left: Settings */}
                    <TouchableOpacity
                        style={[styles.iconCircle, { marginRight: 16, backgroundColor: colors.background }]}
                        onPress={() => navigation.navigate('MenSettings')}
                    >
                        <Ionicons name="settings-outline" size={24} color={paperTheme.colors.text} />
                    </TouchableOpacity>

                    {/* Middle: Location */}
                    <View style={styles.locationContainer}>
                        <Text style={styles.locationLabel}>Location</Text>
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={16} color={paperTheme.colors.primary} style={{ marginRight: 4 }} />
                            <Text style={[styles.locationValue, { color: paperTheme.colors.text }]}>
                                Naperville, Illinois
                            </Text>
                            <Ionicons name="chevron-down" size={16} color={paperTheme.colors.text} style={{ marginLeft: 4 }} />
                        </View>
                    </View>

                    {/* Right: Notifications */}
                    <TouchableOpacity
                        style={[styles.iconCircle, { backgroundColor: colors.background }]}
                        onPress={() => navigation.navigate('MenRequests')}
                    >
                        <View style={{ position: 'relative' }}>
                            <Ionicons name="notifications-outline" size={24} color={paperTheme.colors.text} />
                            {pendingCount > 0 && (
                                <View style={styles.badgeContainer}>
                                    <Text style={styles.badgeText}>{pendingCount}</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                {/* Category Filter above the feed */}
                <CategoryFilter onSelect={handleCategorySelect} />

                {/* Main Content: Men’s Feed */}
                <View style={styles.mainContent}>
                    <MenFeedScreen onScroll={(e) => { scrollY.value = e.nativeEvent.contentOffset.y; }} />
                </View>

                {/* Floating Button to open Create Date Modal */}
                <FAB
                    style={[styles.fab, { backgroundColor: colors.primary }]}
                    icon="plus"
                    color={paperTheme.colors.background}
                    onPress={() => setIsCreateDateModalVisible(true)}
                />
            </SafeAreaView>

            {/* Create Date Modal */}
            <CreateDateModal
                isVisible={isCreateDateModalVisible}
                onClose={() => setIsCreateDateModalVisible(false)}
            >
                <CreateDateScreen onClose={() => setIsCreateDateModalVisible(false)} />
            </CreateDateModal>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationContainer: {
        alignItems: 'center',
        flex: 1,
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
    mainContent: {
        flex: 1,
        paddingHorizontal: 10,
        paddingTop: 16,
    },
    fab: {
        position: 'absolute',
        bottom: 16,
        alignSelf: 'center',
        width: 56,
        height: 56,
        borderRadius: 28,
    },
});