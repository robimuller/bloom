// src/screens/women/WomenHomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';



export default function WomenHomeScreen() {
    const navigation = useNavigation();
    const paperTheme = useTheme();


    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: paperTheme.colors.background }]} edges={['top']}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                {/* Left: Settings */}
                <TouchableOpacity onPress={() => navigation.navigate('WomenSettings')}>
                    <Ionicons name="settings-outline" size={24} color="black" />
                </TouchableOpacity>

                {/* Right: Requests */}
                <TouchableOpacity onPress={() => navigation.navigate('WomenRequests')}>
                    <Ionicons name="notifications-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {/* Main content */}
            <View style={styles.mainContent}>
                <Text>Women’s Feed - Main Home Content</Text>
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
        justifyContent: 'center',
        alignItems: 'center',
    },
});
