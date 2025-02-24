import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

const ethnicityOptions = [
    "Asian",
    "Black",
    "Hispanic",
    "White",
    "Middle Eastern",
    "Native American",
    "Pacific Islander",
    "Mixed",
    "Other"
];

export default function EthnicityStep({ profileInfo, setProfileInfo, colors }) {
    const handleSelect = (ethnicity) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setProfileInfo({ ...profileInfo, ethnicity });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>
                Select your ethnicity
            </Text>
            <View style={styles.optionsContainer}>
                {ethnicityOptions.map((option, index) => {
                    const selected = profileInfo.ethnicity === option;
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleSelect(option)}
                            style={[
                                styles.option,
                                {
                                    borderColor: selected ? colors.primary : colors.border,
                                    backgroundColor: selected ? `${colors.primary}20` : 'transparent',
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    { color: selected ? colors.primary : colors.text },
                                ]}
                            >
                                {option}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
    },
    title: {
        fontSize: 18,
        marginBottom: 15,
        fontWeight: 'bold'
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    option: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderRadius: 25,
        margin: 5,
    },
    optionText: {
        fontSize: 16,
    },
});