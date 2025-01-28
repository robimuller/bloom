// src/screens/women/WomenHomeScreen.js
import React from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, Title } from 'react-native-paper';

import WomenFeedScreen from './WomenFeedScreen';  // <--- import your feed component

export default function WomenHomeScreen() {
    const navigation = useNavigation();
    const paperTheme = useTheme();

    return (
        <SafeAreaView
            style={[styles.safeArea, { backgroundColor: paperTheme.colors.background }]}
            edges={['top']}
        >
            {/* Top Bar */}
            <View style={styles.topBar}>
                {/* Left: Settings */}
                <TouchableOpacity onPress={() => navigation.navigate('WomenSettings')}>
                    <Ionicons name="settings-outline" size={24} color={paperTheme.colors.text} />
                </TouchableOpacity>

                {/* Right: Requests */}
                <TouchableOpacity onPress={() => navigation.navigate('WomenRequests')}>
                    <Ionicons name="notifications-outline" size={24} color={paperTheme.colors.text} />
                </TouchableOpacity>
            </View>

            {/* Main content: show the feed */}
            <View style={styles.mainContent}>
                {/* If you want a header above the feed */}
                <Title style={[styles.header, { color: paperTheme.colors.text }]}>
                    Discover
                </Title>

                {/* Embed the feed screen */}
                <WomenFeedScreen />
            </View>
        </SafeAreaView>
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
        paddingHorizontal: 5,
        paddingTop: 8,
    },
    header: {
        fontSize: 24,
        marginBottom: 10,
    },
});