// src/screens/men/MenHomeScreen.js
import React, { useContext, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, FAB } from 'react-native-paper';

import { RequestsContext } from '../../contexts/RequestsContext';
import MenFeedScreen from './MenFeedScreen';
import CategoryFilter from '../../components/CategoryFilter';
import LocationSelector from '../../components/LocationSelector';
import CreateDateModal from '../../components/CreateDateModal';
import CreateDateScreen from './CreateDateScreen';

export default function MenHomeScreen() {
    const navigation = useNavigation();
    const theme = useTheme();
    const { requests } = useContext(RequestsContext);
    const { colors } = useTheme();

    // Count pending requests for the badge.
    const pendingCount = requests.filter((r) => r.status === 'pending').length;

    // Manage the selected category.
    const [selectedCategory, setSelectedCategory] = useState('all');

    // State to control the Create Date modal visibility.
    const [isCreateDateModalVisible, setIsCreateDateModalVisible] = useState(false);

    // Handler for when a category is selected.
    const handleCategorySelect = (categoryId) => {
        console.log('Selected category:', categoryId);
        setSelectedCategory(categoryId);
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.topRow}>
                    {/* Settings Button */}
                    <TouchableOpacity
                        style={[styles.iconCircle, { marginRight: 16, backgroundColor: colors.cardBackground }]}
                        onPress={() => navigation.navigate('MenSettings')}
                    >
                        <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
                    </TouchableOpacity>

                    {/* Location Selector */}
                    <LocationSelector />

                    {/* Notifications Button */}
                    <TouchableOpacity
                        style={[styles.iconCircle, { backgroundColor: colors.cardBackground }]}
                        onPress={() => navigation.navigate('MenRequests')}
                    >
                        <View style={{ position: 'relative' }}>
                            <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
                            {pendingCount > 0 && (
                                <View style={styles.badgeContainer}>
                                    <Text style={styles.badgeText}>{pendingCount}</Text>
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

            {/* Main Content: Men’s Feed */}
            <View style={styles.mainContent}>
                <MenFeedScreen selectedCategory={selectedCategory} />
            </View>

            {/* Floating Action Button for Creating Dates */}
            <FAB
                style={[styles.fab, { backgroundColor: colors.primary }]}
                icon="plus"
                color={theme.colors.background}
                onPress={() => setIsCreateDateModalVisible(true)}
            />

            {/* Create Date Modal */}
            <CreateDateModal
                isVisible={isCreateDateModalVisible}
                onClose={() => setIsCreateDateModalVisible(false)}
            >
                <CreateDateScreen onClose={() => setIsCreateDateModalVisible(false)} />
            </CreateDateModal>
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
    fab: {
        position: 'absolute',
        bottom: 16,
        alignSelf: 'center',
        width: 56,
        height: 56,
        borderRadius: 28,
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