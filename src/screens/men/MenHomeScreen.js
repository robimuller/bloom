// src/screens/men/MenHomeScreen.js
import React, { useContext, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

import { RequestsContext } from '../../contexts/RequestsContext';
import { PromotionsContext } from '../../contexts/PromotionsContext';
import CategoryFilter from '../../components/CategoryFilter';
import LocationSelector from '../../components/LocationSelector';
import CreateDateModal from '../../components/CreateDateModal';
import CreateDateScreen from './CreateDateScreen';
import PromotionsCard from '../../components/PromotionsCard';

export default function MenHomeScreen() {
    const navigation = useNavigation();
    const theme = useTheme();
    const { requests } = useContext(RequestsContext);
    const { promotions, loading } = useContext(PromotionsContext);
    const { colors } = useTheme();

    // Count pending requests for the badge.
    const pendingCount = requests.filter((r) => r.status === 'pending').length;

    // State to control the Create Date modal visibility.
    const [isCreateDateModalVisible, setIsCreateDateModalVisible] = useState(false);

    const handleCategorySelect = (categoryId) => {
        navigation.navigate('MenFeed', { selectedCategory: categoryId });
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.topRow}>
                    <TouchableOpacity
                        style={[styles.iconCircle, { marginRight: 16, backgroundColor: colors.cardBackground }]}
                        onPress={() => navigation.navigate('MenSettings')}
                    >
                        <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <LocationSelector />
                    <TouchableOpacity
                        style={[styles.iconCircle, { backgroundColor: colors.cardBackground }]}
                        onPress={() => navigation.navigate('MenNotifications')}
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
                <View style={styles.filterContainer}>
                    <CategoryFilter onSelect={handleCategorySelect} />
                </View>
            </View>

            {/* Promotions Section */}
            <View style={styles.mainContent}>
                <View style={styles.promotionsHeader}>
                    <Text style={[styles.sectionHeader, { color: colors.text }]}>Promotions</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('PromotionsList')}>
                        <Text style={[styles.viewMoreText, { color: theme.colors.secondary }]}>View More</Text>
                    </TouchableOpacity>
                </View>
                {loading ? (
                    <Text style={{ color: colors.text }}>Loading promotions...</Text>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                        {promotions.slice(0, 3).map((promo) => (
                            <PromotionsCard
                                key={promo.id}
                                promotion={promo}
                                onPress={(promo) => navigation.navigate('MenPromotionDetail', { promo })}
                                onAttach={(promo) => console.log('Attach promotion:', promo)}
                                onMarkInterest={(promo) => console.log("I'm interested in:", promo)}
                            />
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Floating Action Button for Creating Dates */}
            <TouchableOpacity
                style={styles.fabContainer}
                onPress={() => navigation.navigate('CreateDate')}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={[colors.primary, colors.primary]}
                    start={{ x: 1.5, y: 0.3 }}
                    end={{ x: 0.1, y: 0.3 }}
                    style={styles.fabGradient}
                >
                    <Ionicons name="add" size={24} color={theme.colors.background} />
                </LinearGradient>
            </TouchableOpacity>

            {/* Create Date Modal */}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingHorizontal: 16,
    },
    header: {
        width: '100%',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        height: 90,
    },
    filterContainer: {
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
        paddingVertical: 20,
    },
    promotionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: '600',
    },
    viewMoreText: {
        fontSize: 12,
        fontWeight: '500',
    },
    horizontalScroll: {
        flexGrow: 0,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 16,
        alignSelf: 'center',
    },
    fabGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
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