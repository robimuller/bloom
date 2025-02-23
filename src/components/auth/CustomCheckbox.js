import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// A custom checkbox that uses your theme colors
const CustomCheckbox = ({ value, onValueChange, label, colors }) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={() => onValueChange(!value)}>
        <View style={[styles.checkbox, { borderColor: colors.primary, backgroundColor: value ? colors.primary : 'transparent' }]}>
            {value && <Ionicons name="checkmark" size={16} color={colors.backgroundColor} />}
        </View>
        <Text style={[styles.checkboxLabel, { color: colors.secondary }]}>{label}</Text>
    </TouchableOpacity>
);

export default CustomCheckbox;

const styles = StyleSheet.create({
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxLabel: {
        fontSize: 14,
        marginLeft: 8,
    },
})