import React, { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

function AnimatedHeaderTitle({ title, style }) {
    const translateY = useRef(new Animated.Value(-10)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Reset the animated values when the title changes.
        translateY.setValue(-10);
        opacity.setValue(0);
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 200, // Reduced duration for a snappier effect.
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 200,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        ]).start();
    }, [title, translateY, opacity]);

    return (
        <Animated.Text style={[style, { transform: [{ translateY }], opacity }]}>
            {title}
        </Animated.Text>
    );
}

export default AnimatedHeaderTitle;