import React, { useState, useEffect, useRef, useContext } from 'react';
import { Animated, TextInput as RNTextInput, StyleSheet, Easing, View } from 'react-native';
import { ThemeContext } from '../contexts/ThemeContext';

const CustomTextInput = ({ shake, rightIcon, style, ...props }) => {
    const { colors } = useContext(ThemeContext);
    const [isFocused, setIsFocused] = useState(false);
    const shakeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (shake) {
            Animated.sequence([
                Animated.timing(shakeAnim, {
                    toValue: -10,
                    duration: 50,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: 10,
                    duration: 50,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: -10,
                    duration: 50,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: 10,
                    duration: 50,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: 0,
                    duration: 50,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [shake, shakeAnim]);

    return (
        <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
            <RNTextInput
                {...props}
                onFocus={(e) => {
                    setIsFocused(true);
                    if (props.onFocus) props.onFocus(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    if (props.onBlur) props.onBlur(e);
                }}
                style={[
                    styles.input,
                    {
                        backgroundColor: colors.cardBackground,
                        color: colors.text,
                        borderWidth: 1,
                        borderColor: isFocused ? colors.primary : 'transparent',
                    },
                    style,
                ]}
                placeholderTextColor={colors.secondary}
            />
            {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        position: 'relative',
    },
    input: {
        marginTop: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        height: 50,
        fontSize: 16,
    },
    iconContainer: {
        position: 'absolute',
        right: 20,
        top: 10,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CustomTextInput;