import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const personalityOptions = [
    'Adventurous',
    'Laid-back',
    'Ambitious',
    'Empathetic',
    'Optimistic',
    'Realistic',
];

const lifestyleOptions = {
    smoking: ['Non-smoker', 'Occasional', 'Regular'],
    drinking: ['Non-drinker', 'Social drinker', 'Regular drinker'],
    exercise: ['Sedentary', 'Active', 'Very active'],
    dietaryPreferences: ['No restrictions', 'Vegetarian', 'Vegan', 'Gluten-free'],
};

const PersonalityLifestyleStep = ({ profileInfo, setProfileInfo, colors }) => {
    // Toggle personality trait selection (multi-select)
    const togglePersonalityTrait = (trait) => {
        const currentTraits = profileInfo.personalityTraits || [];
        if (currentTraits.includes(trait)) {
            setProfileInfo((prev) => ({
                ...prev,
                personalityTraits: currentTraits.filter((t) => t !== trait),
            }));
        } else {
            setProfileInfo((prev) => ({
                ...prev,
                personalityTraits: [...currentTraits, trait],
            }));
        }
    };

    // Select a single option for each lifestyle category
    const selectLifestyleOption = (category, option) => {
        setProfileInfo((prev) => ({
            ...prev,
            lifestyle: {
                ...prev.lifestyle,
                [category]: option,
            },
        }));
    };

    return (
        <View style={styles.container}>

            {/* Personality Traits Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Select your personality traits:
                </Text>
                <View style={styles.optionsContainer}>
                    {personalityOptions.map((trait) => {
                        const selected = profileInfo.personalityTraits?.includes(trait);
                        return (
                            <TouchableOpacity
                                key={trait}
                                style={[
                                    styles.optionButton,
                                    {
                                        backgroundColor: selected ? colors.primary : colors.background,
                                        borderColor: selected ? colors.primary : colors.secondary,
                                    },
                                ]}
                                onPress={() => togglePersonalityTrait(trait)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        { color: selected ? colors.background : colors.secondary },
                                    ]}
                                >
                                    {trait}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Lifestyle Preferences Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Lifestyle Preferences:
                </Text>
                {Object.keys(lifestyleOptions).map((category) => (
                    <View key={category} style={styles.lifestyleRow}>
                        <Text style={[styles.lifestyleLabel, { color: colors.text }]}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}:
                        </Text>
                        <View style={styles.optionsContainer}>
                            {lifestyleOptions[category].map((option) => {
                                const selected = profileInfo.lifestyle?.[category] === option;
                                return (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.optionButton,
                                            {
                                                backgroundColor: selected ? colors.primary : colors.background,
                                                borderColor: selected ? colors.primary : colors.secondary,
                                            },
                                        ]}
                                        onPress={() => selectLifestyleOption(category, option)}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                { color: selected ? colors.background : colors.secondary },
                                            ]}
                                        >
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    section: {
        marginVertical: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    optionButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
    },
    optionText: {
        fontSize: 14,
        textAlign: 'center',
    },
    lifestyleRow: {
        marginBottom: 12,
    },
    lifestyleLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
});

export default PersonalityLifestyleStep;