// src/components/ShootingLightButton.js
import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, View, StyleSheet, Animated, Easing } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

function ShootingLightButton({ label, icon = 'arrow-right', onPress, style }) {
    const lightAnim = useRef(new Animated.Value(-1)).current;
    const theme = useTheme();

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(lightAnim, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }),
                Animated.timing(lightAnim, {
                    toValue: -1,
                    duration: 0,
                    useNativeDriver: false,
                }),
                Animated.delay(5000),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [lightAnim]);

    const baseColors = [theme.colors.primary, '#94bbe9'];
    const highlightColors = [
        'rgba(255,255,255,0)',
        'rgba(255, 255, 255, 0.4)',
        'rgba(255,255,255,0)',
    ];
    const startX = lightAnim;
    const endX = Animated.add(lightAnim, 0.4);

    return (
        <TouchableOpacity onPress={onPress} style={[styles.shootButtonContainer, style]} activeOpacity={0.8}>
            <LinearGradient
                colors={baseColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[StyleSheet.absoluteFill, { borderRadius: 25 }]}
            />
            <AnimatedLinearGradient
                colors={highlightColors}
                start={{ x: startX, y: -0.1 }}
                end={{ x: endX, y: 0 }}
                style={[StyleSheet.absoluteFill, { borderRadius: 25 }]}
            />
            <View style={styles.shootButtonContent}>
                <IconButton icon={icon} size={20} iconColor={theme.colors.background} style={{ margin: 0, marginRight: 4 }} />
                <Text style={[styles.shootButtonText, { color: theme.colors.background }]}>{label}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    shootButtonContainer: {
        minWidth: 120,
        height: 48,
        borderRadius: 25,
        overflow: 'hidden',
    },
    shootButtonContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shootButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
    },
});

export default ShootingLightButton;