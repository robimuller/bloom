import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

// Relationship options for the user to choose from.
const relationshipOptions = [
    "Serious Relationship",
    "Casual Dating",
    "Friendship",
    "Networking",
    "Not Sure",
];

export default function AdditionalDetailsStep({ profileInfo, setProfileInfo, colors }) {
    // Animate the header text (fade in and slide up).
    const headerAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(headerAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, [headerAnim]);

    // A helper to update the relationship goal.
    const selectRelationshipGoal = (goal) => {
        setProfileInfo((prev) => ({
            ...prev,
            relationshipGoals: goal,
        }));
    };

    // Wrap TouchableOpacity in an Animated component for button press animations.
    const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

    return (
        <View style={styles.container}>
            <Animated.Text
                style={[
                    styles.header,
                    {
                        color: colors.text,
                        opacity: headerAnim,
                        transform: [
                            {
                                translateY: headerAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [20, 0],
                                }),
                            },
                        ],
                    },
                ]}
            >
                Almost there... but before we set you up...{"\n"}
                Can you tell us your relationship goal?
            </Animated.Text>
            <View style={styles.optionsContainer}>
                {relationshipOptions.map((option) => {
                    const selected = profileInfo.relationshipGoals === option;
                    // Create a separate animated value for scaling the option button.
                    const scaleAnim = useRef(new Animated.Value(1)).current;

                    const onPressIn = () => {
                        Animated.spring(scaleAnim, {
                            toValue: 0.95,
                            useNativeDriver: true,
                        }).start();
                    };

                    const onPressOut = () => {
                        Animated.spring(scaleAnim, {
                            toValue: 1,
                            friction: 3,
                            useNativeDriver: true,
                        }).start();
                    };

                    return (
                        <AnimatedTouchable
                            key={option}
                            activeOpacity={0.9}
                            onPress={() => selectRelationshipGoal(option)}
                            onPressIn={onPressIn}
                            onPressOut={onPressOut}
                            style={[
                                styles.optionButton,
                                {
                                    backgroundColor: selected ? colors.primary : colors.background,
                                    borderColor: selected ? colors.primary : colors.secondary,
                                    transform: [{ scale: scaleAnim }],
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    { color: selected ? colors.background : colors.secondary },
                                ]}
                            >
                                {option}
                            </Text>
                        </AnimatedTouchable>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
        flex: 1,
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    optionButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        margin: 6,
    },
    optionText: {
        fontSize: 14,
        textAlign: 'center',
    },
});