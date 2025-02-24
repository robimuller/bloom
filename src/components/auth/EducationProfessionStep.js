import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import CustomTextInput from '../CustomTextInput';
import * as Haptics from 'expo-haptics';

// Predefined options
const educationOptions = [
    "High School",
    "Associate Degree",
    "Bachelor's",
    "Master's",
    "Doctorate",
    "Other"
];

const fieldOfStudyOptions = [
    "Computer Science",
    "Business",
    "Engineering",
    "Arts",
    "Social Sciences",
    "Natural Sciences",
    "Medicine",
    "Law",
    "Education",
    "Other"
];

const occupationOptions = [
    "Software Engineer",
    "Teacher",
    "Nurse",
    "Doctor",
    "Sales Manager",
    "Designer",
    "Accountant",
    "Manager",
    "Entrepreneur",
    "Freelancer",
    "Other"
];

const incomeOptions = [
    "Under $50k",
    "$50k-$100k",
    "Above $100k",
    "Prefer not to say"
];

export default function EducationProfessionStep({ profileInfo, setProfileInfo, colors }) {
    // Local search queries for each section
    const [educationSearch, setEducationSearch] = useState('');
    const [fieldSearch, setFieldSearch] = useState('');
    const [occupationSearch, setOccupationSearch] = useState('');
    const [incomeSearch, setIncomeSearch] = useState('');

    const filterOptions = (options, query) =>
        options.filter((opt) =>
            opt.toLowerCase().includes(query.toLowerCase())
        );

    const filteredEducation = filterOptions(educationOptions, educationSearch);
    const filteredField = filterOptions(fieldOfStudyOptions, fieldSearch);
    const filteredOccupation = filterOptions(occupationOptions, occupationSearch);
    const filteredIncome = filterOptions(incomeOptions, incomeSearch);

    const handleSelect = (key, value) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setProfileInfo({ ...profileInfo, [key]: value });
    };

    // Renders a set of pill-style options.
    const renderOptions = (options, selectedValue, key) => {
        return (
            <View style={styles.optionsContainer}>
                {options.map((option, index) => {
                    const selected = selectedValue === option;
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleSelect(key, option)}
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
        );
    };

    return (
        <View contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Education
            </Text>
            {renderOptions(filteredEducation, profileInfo.education, 'education')}

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Field of Study
            </Text>
            <CustomTextInput
                placeholder="Search field of study..."
                value={fieldSearch}
                onChangeText={setFieldSearch}
                style={styles.searchInput}
            />
            {renderOptions(filteredField, profileInfo.fieldOfStudy, 'fieldOfStudy')}

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Occupation
            </Text>
            <CustomTextInput
                placeholder="Search occupation..."
                value={occupationSearch}
                onChangeText={setOccupationSearch}
                style={styles.searchInput}
            />
            {renderOptions(filteredOccupation, profileInfo.occupation, 'occupation')}

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Income (Optional)
            </Text>
            {renderOptions(filteredIncome, profileInfo.income, 'income')}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    searchInput: {
        height: 60,
        marginBottom: 15,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        // Reserve space for at least two rows
        minHeight: 100,
        maxHeight: 100,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    option: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderRadius: 25,
        marginRight: 10,
        marginBottom: 10,
    },
    optionText: {
        fontSize: 16,
    },
});