// ReligionStep.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const religionOptions = ['Christianity', 'Islam', 'Hinduism', 'Buddhism', 'Judaism', 'Atheism', 'Other'];

export default function ReligionStep({ profileInfo, updateProfileInfo, colors }) {
    const selectReligion = (religion) => {
        updateProfileInfo({ religion });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Select your religion</Text>
            {religionOptions.map((option, index) => {
                const selected = profileInfo.religion === option;
                return (
                    <TouchableOpacity
                        key={index}
                        onPress={() => selectReligion(option)}
                        style={[styles.option, selected && styles.selected]}
                    >
                        <Text style={{ color: selected ? colors.primary : colors.text }}>{option}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { fontSize: 18, marginBottom: 20 },
    option: {
        padding: 15,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 10,
    },
    selected: { backgroundColor: '#ddd' },
});