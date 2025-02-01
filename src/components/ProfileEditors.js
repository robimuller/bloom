// src/components/ProfileEditors.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Text, useTheme } from 'react-native-paper';
import HeightRuler from './HeightRuler'; // adjust the path as needed

/** InterestsEditor: Editor for interests with chips and search */
export function InterestsEditor({ initialInterests = [], onChange }) {
    const theme = useTheme();
    const [searchText, setSearchText] = useState('');
    const [selectedInterests, setSelectedInterests] = useState(initialInterests);

    // Extended suggestions list for a dating app profile.
    const suggestedInterests = [
        "Hiking",
        "Cooking",
        "Travel",
        "Photography",
        "Music",
        "Sports",
        "Reading",
        "Gaming",
        "Art",
        "Dancing",
        "Yoga",
        "Fitness",
        "Outdoors",
        "Movies",
        "Writing",
        "Fashion",
        "Food",
        "Drinks",
        "Parties",
        "Volunteering",
        "Technology",
        "Nature",
        "Meditation",
        "Cycling",
        "Running",
    ];

    useEffect(() => {
        onChange(selectedInterests);
    }, [selectedInterests]);

    // Filter suggestions based on search text and remove already selected interests.
    const filteredSuggestions = suggestedInterests.filter(
        (interest) =>
            interest.toLowerCase().includes(searchText.toLowerCase()) &&
            !selectedInterests.includes(interest)
    );

    // When no search text, show all suggestions not yet selected.
    const suggestionsToShow =
        searchText.trim() === ''
            ? suggestedInterests.filter((interest) => !selectedInterests.includes(interest))
            : filteredSuggestions;

    const addInterest = (interest) => {
        setSelectedInterests([...selectedInterests, interest]);
        setSearchText('');
    };

    const removeInterest = (interest) => {
        setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    };

    return (
        <View>
            <TextInput
                label="Search interests"
                value={searchText}
                onChangeText={setSearchText}
                mode="outlined"
                style={[styles.input, { backgroundColor: theme.colors.cardBackground }]}
                theme={{ colors: { primary: theme.colors.primary } }}
            />
            {/* Always-visible selected interests */}
            <View style={styles.chipsContainer}>
                {selectedInterests.map((interest, index) => (
                    <Chip
                        key={index}
                        onClose={() => removeInterest(interest)}
                        style={[
                            styles.chip,
                            { backgroundColor: theme.colors.cardBackground, borderWidth: 1, borderColor: theme.colors.primary, borderRadius: 99 },
                        ]}
                        textStyle={{ color: theme.colors.onSurface }}
                    >
                        {interest}
                    </Chip>
                ))}
            </View>
            {/* Dynamically filtered suggestion chips */}
            <View style={styles.suggestionsContainer}>
                {suggestionsToShow.map((interest, index) => (
                    <TouchableOpacity key={index} onPress={() => addInterest(interest)}>
                        <Chip
                            style={[styles.suggestionChip, { backgroundColor: theme.colors.cardBackground }]}
                            textStyle={{ color: theme.colors.onSurface, fontSize: 10 }}
                        >
                            {interest}
                        </Chip>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

/** BioEditor: A larger multiline editor for the bio with a 300-character limit and counter */
export function BioEditor({ initialBio = '', onChange }) {
    const theme = useTheme();
    const maxChars = 300;
    const [bio, setBio] = useState(initialBio);

    // Notify parent when bio changes.
    useEffect(() => {
        onChange(bio);
    }, [bio]);

    // Limit the text to maxChars.
    const handleChangeText = (text) => {
        if (text.length <= maxChars) {
            setBio(text);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                label="Bio"
                value={bio}
                onChangeText={handleChangeText}
                mode="outlined"
                multiline
                numberOfLines={6} // Increase the visible height of the text field.
                style={[styles.bioInput, { backgroundColor: theme.colors.cardBackground }]}
                theme={{ colors: { primary: theme.colors.primary } }}
            />
            <Text style={[styles.charCounter, { color: theme.colors.text }]}>
                {bio.length} / {maxChars}
            </Text>
        </View>
    );
}

/** HeightEditor: Numeric input for height */
export function HeightEditor({ initialHeight = '', onChange }) {
    // Convert the initial height (if provided) to a number; default to 170 cm.
    const initValue = parseInt(initialHeight, 10) || 170;

    return (
        <HeightRuler
            initialValue={initValue}
            onChange={onChange}
        />
    );
}

/** OrientationEditor: Chip selector for orientation */
export function OrientationEditor({ initialOrientation = '', onChange }) {
    const theme = useTheme();
    const [selectedOrientation, setSelectedOrientation] = useState(initialOrientation);
    const options = ['Straight', 'Gay', 'Bisexual', 'Other'];

    useEffect(() => {
        onChange(selectedOrientation);
    }, [selectedOrientation]);

    return (
        <View style={styles.chipsContainer}>
            {options.map((option, index) => (
                <TouchableOpacity key={index} onPress={() => setSelectedOrientation(option)}>
                    <Chip
                        mode="outlined"
                        selected={selectedOrientation === option}
                        style={[
                            styles.chip,
                            selectedOrientation === option && { backgroundColor: theme.colors.primary },
                        ]}
                        textStyle={
                            selectedOrientation === option
                                ? { color: theme.colors.onPrimary }
                                : { color: theme.colors.text }
                        }
                    >
                        {option}
                    </Chip>
                </TouchableOpacity>
            ))}
        </View>
    );
}

/** AgeRangeEditor: Two numeric inputs for min and max age */
export function AgeRangeEditor({ initialAgeRange = { min: '', max: '' }, onChange }) {
    const theme = useTheme();
    const [minAge, setMinAge] = useState(String(initialAgeRange.min));
    const [maxAge, setMaxAge] = useState(String(initialAgeRange.max));

    useEffect(() => {
        onChange({ min: minAge, max: maxAge });
    }, [minAge, maxAge]);

    return (
        <View style={styles.ageRangeContainer}>
            <TextInput
                label="Min Age"
                value={minAge}
                onChangeText={setMinAge}
                mode="outlined"
                keyboardType="numeric"
                style={[
                    styles.input,
                    { flex: 1, marginRight: 5, backgroundColor: theme.colors.cardBackground },
                ]}
                theme={{ colors: { primary: theme.colors.primary } }}
            />
            <TextInput
                label="Max Age"
                value={maxAge}
                onChangeText={setMaxAge}
                mode="outlined"
                keyboardType="numeric"
                style={[
                    styles.input,
                    { flex: 1, marginLeft: 5, backgroundColor: theme.colors.cardBackground },
                ]}
                theme={{ colors: { primary: theme.colors.primary } }}
            />
        </View>
    );
}

/** EducationEditor: Multiline editor for education details */
export function EducationEditor({ initialEducation = '', onChange }) {
    const theme = useTheme();
    const [education, setEducation] = useState(initialEducation);

    useEffect(() => {
        onChange(education);
    }, [education]);

    return (
        <View>
            <TextInput
                label="Education"
                value={education}
                onChangeText={setEducation}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={[styles.input, { backgroundColor: theme.colors.cardBackground }]}
                theme={{ colors: { primary: theme.colors.primary } }}
            />
        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        marginBottom: 10,
    },
    bioInput: {
        // Increase font size and padding for a larger text field
        fontSize: 16,
        padding: 10,
    },
    charCounter: {
        textAlign: 'right',
        marginTop: 4,
        fontSize: 12,
    },
    input: {
        marginBottom: 10,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        marginVertical: 5,
    },
    chip: {
        marginHorizontal: 4,
        marginVertical: 4,
    },
    suggestionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        gap: 5
    },
});