import React, { useEffect } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    interpolateColor,
    Easing
} from 'react-native-reanimated';

export default function FinalizingScreen({ colors }) {
    // Shared values for animations
    const bgProgress = useSharedValue(0);
    const spinnerScale = useSharedValue(1);
    const textOpacity = useSharedValue(0.5);

    useEffect(() => {
        // Animate background color progress from 0 to 1 and loop it
        bgProgress.value = withRepeat(
            withTiming(1, { duration: 4000, easing: Easing.linear }),
            -1,
            true
        );

        // Animate spinner scale (pulsing effect)
        spinnerScale.value = withRepeat(
            withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );

        // Animate text opacity for a fade in/out effect
        textOpacity.value = withRepeat(
            withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    // Animated background style that transitions between colors
    const animatedBackgroundStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            bgProgress.value,
            [0, 0.5, 1],
            [colors.background, colors.primary, colors.background]
        );
        return { backgroundColor };
    });

    // Animated style for the spinner to pulse
    const animatedSpinnerStyle = useAnimatedStyle(() => {
        return { transform: [{ scale: spinnerScale.value }] };
    });

    // Animated style for the text to fade in and out
    const animatedTextStyle = useAnimatedStyle(() => {
        return { opacity: textOpacity.value, color: colors.text };
    });

    return (
        <Animated.View style={[styles.container, animatedBackgroundStyle]}>
            <Animated.View style={animatedSpinnerStyle}>
                <ActivityIndicator size="large" color={colors.primary} />
            </Animated.View>
            <Animated.Text style={[styles.message, animatedTextStyle]}>
                Hold on, we are setting up your account...
            </Animated.Text>
        </Animated.View>
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
        fontSize: 20,
        marginTop: 20,
        textAlign: 'center',
    },
});