// src/components/GradientProgressBar.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const GradientProgressBar = ({ progress, barHeight = 8 }) => {
    const theme = useTheme();

    return (
        <View
            style={{
                height: barHeight,
                borderRadius: barHeight / 2,
                backgroundColor: theme.colors.cardBackground,
                overflow: 'hidden',
            }}
        >
            <View style={{ width: `${progress * 100}%`, height: '100%' }}>
                <LinearGradient
                    colors={[theme.colors.primary, '#94bbe9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: '100%', height: '100%' }}
                />
            </View>
        </View>
    );
};

export default GradientProgressBar;