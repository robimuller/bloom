// src/components/B2BPromotions.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function B2BPromotions() {
    const { colors } = useTheme();
    return (
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.cardText, { color: colors.text }]}>
                B2B Promotions Placeholder
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    cardText: {
        fontSize: 16,
    },
});