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
                    <TouchableOpacity onPress={() => navigation.navigate('MenSettings')}>
                        <Ionicons name="list-circle-outline" size={30} color={paperTheme.colors.text} />
                    </TouchableOpacity>

                    {/* Right: Requests */}
                    <TouchableOpacity onPress={() => navigation.navigate('MenRequests')}>
                        <View style={{ position: 'relative' }}>
                            <Ionicons
                                name="notifications-outline"
                                size={30}
                                color={paperTheme.colors.text}
                            />
                            {pendingCount > 0 && (
                                <View style={styles.badgeContainer}>
                                    <Text style={styles.badgeText}>
                                        {pendingCount}
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
                        backgroundColor: paperTheme.colors.primary,
                    }}
                    icon="plus"
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
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