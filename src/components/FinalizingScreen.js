import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';

export default function FinalizingScreen({ colors }) {
    // Create an animated opacity for the text
    const opacityAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        // Loop a fade in/out animation for the message
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0.5,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [opacityAnim]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Animated.Text style={[styles.message, { color: colors.text, opacity: opacityAnim }]}>
                Hold on, we are setting up your account...
            </Animated.Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    message: {
        fontSize: 18,
        marginTop: 20,
        textAlign: 'center',
    },
});