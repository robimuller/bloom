// EthnicityStep.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ethnicityOptions = ['Asian', 'Black', 'Caucasian', 'Hispanic', 'Middle Eastern', 'Native American', 'Other'];

export default function EthnicityStep({ profileInfo, updateProfileInfo, colors }) {
    const selectEthnicity = (ethnicity) => {
        updateProfileInfo({ ethnicity });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Select your ethnicity</Text>
            {ethnicityOptions.map((option, index) => {
                const selected = profileInfo.ethnicity === option;
                return (
                    <TouchableOpacity
                        key={index}
                        onPress={() => selectEthnicity(option)}
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