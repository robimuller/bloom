// src/screens/men/MenHomeScreen.js
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

import { RequestsContext } from '../../contexts/RequestsContext';

export default function MenHomeScreen() {
    const navigation = useNavigation();
    const paperTheme = useTheme();
    const { requests } = useContext(RequestsContext);

    // men see pending requests count
    const pendingCount = requests.filter((r) => r.status === 'pending').length;

    const gradientColors = paperTheme.colors.mainBackground || ['#fff', '#ccc'];

    return (
        <LinearGradient
            colors={gradientColors}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]} edges={['top']}>
                {/* Top Bar */}
                <View style={styles.topBar}>
                    {/* Left: Settings */}
                    <TouchableOpacity
                        style={[styles.iconCircle, { marginRight: 16, backgroundColor: paperTheme.colors.overlay }]}
                        onPress={() => navigation.navigate('MenSettings')}
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
                                name="location"
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

                    {/* Right: Requests */}
                    <TouchableOpacity
                        style={[styles.iconCircle, { backgroundColor: paperTheme.colors.overlay }]}
                        onPress={() => navigation.navigate('MenRequests')}
                    >
                        <View style={{ position: 'relative' }}>
                            <Ionicons
                                name="notifications-outline"
                                size={24}
                                color={paperTheme.colors.text}
                            />
                            {pendingCount > 0 && (
                                <View style={styles.badgeContainer}>
                                    <Text style={styles.badgeText}>
                                        {acceptedCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Main feed content */}
                <View style={styles.mainContent}>
                    <Text style={{ color: paperTheme.colors.text }}>
                        Men's Feed - Main Home Content
                    </Text>
                </View>

                {/* Floating Button to Create Date */}
                <FAB
                    style={{
                        position: 'absolute',
                        right: 16,
                        bottom: 16,
                        backgroundColor: paperTheme.colors.background,
                    }}
                    icon="plus"
                    color={paperTheme.colors.primary}
                    onPress={() => navigation.navigate('CreateDate')}
                />
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
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
        justifyContent: 'center',
        alignItems: 'center',
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