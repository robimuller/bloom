import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolateColor
} from 'react-native-reanimated';

const ReanimatedTag = ({ type, isSelected, onPress, colors }) => {
    // Create a shared value for the animation state
    const animationValue = useSharedValue(isSelected ? 1 : 0);

    useEffect(() => {
        // When isSelected changes, animate the shared value
        animationValue.value = withTiming(isSelected ? 1 : 0, { duration: 300 });
    }, [isSelected, animationValue]);

    // Create an animated style that interpolates colors based on the shared value
    const animatedStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                animationValue.value,
                [0, 1],
                [colors.cardBackground, colors.primary]
            ),
            borderColor: interpolateColor(
                animationValue.value,
                [0, 1],
                ['transparent', colors.primary]
            ),
        };
    });

    return (
        <Animated.View style={[styles.tag, animatedStyle]}>
            <TouchableOpacity onPress={onPress}>
                <Text
                    style={[
                        styles.tagText,
                        { color: isSelected ? colors.backgroundColor : colors.text, fontWeight: '600' },
                    ]}
                >
                    {type}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    tag: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
        marginBottom: 8,
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tagText: {
        fontSize: 16,
    },
});

export default ReanimatedTag;