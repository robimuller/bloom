// LazyImageReanimated.js
import React, { useCallback } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Image } from 'expo-image';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const LazyImageReanimated = ({ source, style, ...props }) => {
    const opacity = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const onLoad = useCallback(() => {
        opacity.value = withTiming(1, { duration: 500 });
    }, [opacity]);

    return (
        <AnimatedImage
            source={source}
            style={[style, animatedStyle]}
            onLoad={onLoad}
            {...props}
        />
    );
};

export default LazyImageReanimated;