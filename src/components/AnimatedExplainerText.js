import React, { useRef, useEffect } from 'react';
import { Animated, Text, Easing } from 'react-native';

export function AnimatedExplainerText({ text, style, initialColor, finalColor }) {
    // Split the text into words
    const words = text.split(' ');
    // Create an animated value for each word
    const animatedValues = useRef(words.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        // Reset each word's animation value to 0
        animatedValues.forEach(animVal => animVal.setValue(0));
        // Create an animation for each word
        const animations = animatedValues.map(animVal =>
            Animated.timing(animVal, {
                toValue: 1,
                duration: 500,
                easing: Easing.out(Easing.ease),
                useNativeDriver: false, // must be false for color interpolation
            })
        );
        // Run the animations in a staggered sequence
        Animated.stagger(80, animations).start();
    }, [text, animatedValues]);

    return (
        <Text style={[style, { flexWrap: 'wrap', flexDirection: 'row' }]}>
            {words.map((word, index) => {
                const animatedColor = animatedValues[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [initialColor, finalColor],
                });
                return (
                    <Animated.Text key={index} style={{ color: animatedColor, marginRight: 4 }}>
                        {word + ' '}
                    </Animated.Text>
                );
            })}
        </Text>
    );
}