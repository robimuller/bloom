// src/screens/men/MenHomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';



export default function MenHomeScreen() {
    const navigation = useNavigation();
    const paperTheme = useTheme();


    return (

        <SafeAreaView style={[styles.safeArea, { backgroundColor: paperTheme.colors.background }]} edges={['top']}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                {/* Left: Settings */}
                <TouchableOpacity onPress={() => navigation.navigate('MenSettings')}>
                    <Ionicons name="list-circle-outline" size={30} color={paperTheme.colors.secon} />
                </TouchableOpacity>

                {/* Right: Requests */}
                <TouchableOpacity onPress={() => navigation.navigate('MenRequests')}>
                    <Ionicons name="notifications-outline" size={30} color="black" />
                </TouchableOpacity>
            </View>

            {/* Main feed content */}
            <View style={styles.mainContent}>
                <Text>Men's Feed - Main Home Content</Text>
            </View>

            {/* Floating Button to Create Date */}
            <FAB
                style={{
                    position: 'absolute',
                    right: 16,
                    bottom: 16, backgroundColor: paperTheme.colors.primary
                }}
                icon="plus"
                onPress={() => navigation.navigate('CreateDate')}
            />
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
