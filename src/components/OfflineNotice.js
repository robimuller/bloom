// OfflineNotice.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export default function OfflineNotice() {
    const [isConnected, setIsConnected] = useState(true);
    const [translateY] = useState(new Animated.Value(-50));

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            const connected = state.isConnected && state.isInternetReachable;
            setIsConnected(connected);

            // Animate the banner into view when offline
            Animated.timing(translateY, {
                toValue: connected ? -50 : 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        });

        return () => unsubscribe();
    }, [translateY]);

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
            <Text style={styles.text}>No Internet Connection</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 50,
        backgroundColor: '#D32F2F',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    text: {
        color: '#fff',
        fontWeight: 'bold',
    },
});