import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing
} from 'react-native-reanimated';

export const AnimatedGradient = () => {
    // Shared values for horizontal and vertical translations.
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    // Recursive function that randomly animates the gradient.
    const animate = () => {
        // For a card with fixed width (e.g., 300), we set horizontal bounds.
        // Here, targetX ranges between -420 (fully shifted left) and 0.
        const targetX = -420 + Math.random() * 420;
        // For vertical movement, allow a subtle shift (e.g., between -30 and 30).
        const targetY = -30 + Math.random() * 60;
        // Random duration between 10 and 25 seconds.
        const duration = 10000 + Math.random() * 15000;

        translateX.value = withTiming(targetX, { duration, easing: Easing.inOut(Easing.ease) });
        translateY.value = withTiming(targetY, { duration, easing: Easing.inOut(Easing.ease) }, () => {
            // Once this animation completes, kick off the next random animation.
            animate();
        });
    };

    useEffect(() => {
        animate();
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value }
            ],
        };
    });

    return (
        <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
            <LinearGradient
                colors={['darkviolet', '#fcabff', '#9e00ff', '#ff0093']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0.2 }}
                // The width here is set to 240% of the container to allow room for movement.
                style={{ flex: 1, width: '240%' }}
            />
        </Animated.View>
    );
};