// src/screens/shared/MyPerksScreen.js
import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { PromotionsContext } from '../../contexts/PromotionsContext';

export default function MyPerksScreen() {
    const theme = useTheme();
    const { promotions, loading } = useContext(PromotionsContext);
    const [activeTab, setActiveTab] = useState('active'); // "active" or "inactive"

    // Filter perks based on the active tab.
    // Assumes each promotion object has an "active" boolean property.
    const filteredPerks = promotions.filter(perk =>
        activeTab === 'active' ? perk.active : !perk.active
    );

    const renderItem = ({ item }) => (
        <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[styles.perkTitle, { color: theme.colors.text }]}>{item.title}</Text>
            <QRCode
                value={item.qrData || 'default-data'} // Use item's QR data or fallback text.
                size={150}
            />
            <Text style={[styles.perkDescription, { color: theme.colors.secondary }]}>
                {item.description}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
                <Text style={{ color: theme.colors.text }}>Loading perks...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
            {/* Top Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[
                        styles.tabItem,
                        activeTab === 'active' && {
                            borderBottomColor: theme.colors.primary,
                            borderBottomWidth: 2,
                        },
                    ]}
                    onPress={() => setActiveTab('active')}
                >
                    <Text style={[styles.tabText, activeTab === 'active' && { color: theme.colors.primary }]}>
                        Active
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tabItem,
                        activeTab === 'inactive' && {
                            borderBottomColor: theme.colors.primary,
                            borderBottomWidth: 2,
                        },
                    ]}
                    onPress={() => setActiveTab('inactive')}
                >
                    <Text style={[styles.tabText, activeTab === 'inactive' && { color: theme.colors.primary }]}>
                        Inactive
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Perks List */}
            <FlatList
                data={filteredPerks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
    },
    tabItem: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    tabText: {
        fontSize: 16,
        color: 'gray',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    card: {
        marginBottom: 20,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    perkTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
    },
    perkDescription: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});