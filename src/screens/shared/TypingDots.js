// TypingDots.js
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';

export default function TypingDots({ dotColor = 'gray', style }) {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // A helper function that creates a bounce animation
        const bounce = (animatedValue, delay) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(animatedValue, {
                        toValue: -6, // move up by 6
                        duration: 250,
                        easing: Easing.inOut(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(animatedValue, {
                        toValue: 0, // move back to original position
                        duration: 250,
                        easing: Easing.inOut(Easing.quad),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        bounce(dot1, 0);
        bounce(dot2, 200);
        bounce(dot3, 400);
    }, [dot1, dot2, dot3]);

    return (
        <View style={[styles.container, style]}>
            <Animated.View
                style={[
                    styles.dot,
                    { backgroundColor: dotColor },
                    { transform: [{ translateY: dot1 }] },
                ]}
            />
            <Animated.View
                style={[
                    styles.dot,
                    { backgroundColor: dotColor },
                    { transform: [{ translateY: dot2 }] },
                ]}
            />
            <Animated.View
                style={[
                    styles.dot,
                    { backgroundColor: dotColor },
                    { transform: [{ translateY: dot3 }] },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 2,
    },
});
