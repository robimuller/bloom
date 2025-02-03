import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import { useTheme } from 'react-native-paper';

const RippleCircle = ({ delay, color, size }) => {
    // Shared values for scale and opacity
    const scale = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        // Start the ripple animation with a delay.
        // The animation repeats indefinitely.
        scale.value = withDelay(
            delay,
            withRepeat(
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                -1,
                false
            )
        );
        opacity.value = withDelay(
            delay,
            withRepeat(
                withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                -1,
                false
            )
        );
    }, [delay, scale, opacity]);

    // Animated style that applies the scale and opacity changes
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.circle,
                {
                    borderColor: color,
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                },
                animatedStyle,
            ]}
        />
    );
};

const LoadingDates = () => {
    const { colors } = useTheme();
    const circleSize = 200; // Adjust the size of the ripple
    // Create three ripple circles with staggered start delays
    const delays = [0, 300, 600];

    return (
        <View style={styles.container}>
            {delays.map((delay, index) => (
                <RippleCircle
                    key={index}
                    delay={delay}
                    color={colors.primary}
                    size={circleSize}
                />
            ))}
            {/* <Text style={[styles.text, { color: colors.text }]}>
                Fetching Dates
            </Text> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // Full flex to fill available space; adjust if you need a fixed area
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {
        position: 'absolute',
        borderWidth: 2,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default LoadingDates;