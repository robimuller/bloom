import React, { useEffect } from 'react';
import Animated, {
    useSharedValue,
    withTiming,
    withDelay,
    useAnimatedStyle,
    Easing,
} from 'react-native-reanimated';

const RevealAnimation = ({ children, index = 0 }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    useEffect(() => {
        // Optionally add a delay based on the index so each card animates sequentially.
        opacity.value = withDelay(
            index * 100,
            withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) })
        );
        translateY.value = withDelay(
            index * 100,
            withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) })
        );
    }, [index, opacity, translateY]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

export default RevealAnimation;