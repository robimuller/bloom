// src/components/AnimatedTabBarIcon.js
import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

/**
 * AnimatedTabBarIcon Component
 * 
 * Props:
 * - name: string (Ionicon name)
 * - color: string (icon color)
 * - size: number (icon size)
 * - focused: boolean (is the tab focused)
 */
export default function AnimatedTabBarIcon({ name, color, size, focused }) {
    const scaleValue = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.spring(scaleValue, {
            toValue: focused ? 1.2 : 1, // Scale up when focused
            friction: 4,
            useNativeDriver: true,
        }).start();
    }, [focused, scaleValue]);

    return (
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <Ionicons name={name} size={size} color={color} />
        </Animated.View>
    );
}
