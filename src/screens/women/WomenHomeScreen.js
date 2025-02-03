// src/screens/WomenHomeScreen.js
import React, { useContext, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';

import { RequestsContext } from '../../contexts/RequestsContext';
import WomenFeedScreen from './WomenFeedScreen';
import CategoryFilter from '../../components/CategoryFilter';
import LocationSelector from '../../components/LocationSelector';

export default function WomenHomeScreen() {
    const navigation = useNavigation();
    const theme = useTheme();
    const { requests } = useContext(RequestsContext);
    const { colors } = useTheme();

    // Count accepted requests.
    const acceptedCount = requests.filter((r) => r.status === 'accepted').length;

    // Store the currently selected category.
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Handler for when a category is selected.
    const handleCategorySelect = (categoryId) => {
        console.log('Selected category:', categoryId);
        setSelectedCategory(categoryId);
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                {/* Top row */}
                <View style={styles.topRow}>
                    {/* Settings */}
                    <TouchableOpacity
                        style={[styles.iconCircle, { marginRight: 16, backgroundColor: colors.cardBackground }]}
                        onPress={() => navigation.navigate('WomenSettings')}
                    >
                        <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
                    </TouchableOpacity>

                    {/* Location (uses the new LocationSelector component) */}
                    <LocationSelector />

                    {/* Notifications */}
                    <TouchableOpacity
                        style={[styles.iconCircle, { backgroundColor: colors.cardBackground }]}
                        onPress={() => navigation.navigate('WomenRequests')}
                    >
                        <View style={{ position: 'relative' }}>
                            <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
                            {acceptedCount > 0 && (
                                <View style={styles.badgeContainer}>
                                    <Text style={styles.badgeText}>{acceptedCount}</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Category Filter */}
                <View style={styles.filterContainer}>
                    <CategoryFilter onSelect={handleCategorySelect} />
                </View>
            </View>

            {/* Main content */}
            <View style={styles.mainContent}>
                {/* Pass selectedCategory down to WomenFeedScreen */}
                <WomenFeedScreen selectedCategory={selectedCategory} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        width: '100%',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
        height: 90,
    },
    filterContainer: {
        paddingHorizontal: 10,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainContent: {
        flex: 1,
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