import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity
} from 'react-native';
import Slider from '@react-native-community/slider';

const dateStylesOptions = [
    "Casual",
    "Formal",
    "Adventurous",
    "Romantic",
    "Fun",
    "Intellectual",
];

export default function DatingPreferencesStep({ profileInfo, setProfileInfo, colors }) {
    const { matchAgeRange, distance, preferredDateStyles } = profileInfo;

    const updateAgeRange = (min, max) => {
        setProfileInfo(prev => ({
            ...prev,
            matchAgeRange: [min, max],
        }));
    };

    const updateDistance = (value) => {
        setProfileInfo(prev => ({
            ...prev,
            distance: value,
        }));
    };

    const toggleDateStyle = (style) => {
        let current = preferredDateStyles || [];
        if (current.includes(style)) {
            current = current.filter(s => s !== style);
        } else {
            current = [...current, style];
        }
        setProfileInfo(prev => ({
            ...prev,
            preferredDateStyles: current,
        }));
    };

    return (
        <View style={styles.container}>

            {/* Match Age Range Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Preferred Age Range
                </Text>
                <View style={styles.ageRangeContainer}>
                    <TextInput
                        style={[styles.ageInput, { borderColor: colors.primary, color: colors.text }]}
                        keyboardType="numeric"
                        value={matchAgeRange[0].toString()}
                        onChangeText={(val) => {
                            const min = parseInt(val) || 0;
                            updateAgeRange(min, matchAgeRange[1]);
                        }}
                    />
                    <Text style={[styles.toText, { color: colors.text }]}>to</Text>
                    <TextInput
                        style={[styles.ageInput, { borderColor: colors.primary, color: colors.text }]}
                        keyboardType="numeric"
                        value={matchAgeRange[1].toString()}
                        onChangeText={(val) => {
                            const max = parseInt(val) || 100;
                            updateAgeRange(matchAgeRange[0], max);
                        }}
                    />
                </View>
            </View>

            {/* Maximum Distance Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Maximum Distance (km)
                </Text>
                <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={100}
                    step={1}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor="#ccc"
                    thumbTintColor={colors.primary}
                    value={distance || 50}
                    onValueChange={updateDistance}
                />
                <Text style={[styles.sliderValue, { color: colors.text }]}>
                    {distance || 50} km
                </Text>
            </View>

            {/* Preferred Date Styles Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Preferred Date Styles
                </Text>
                <View style={styles.optionsContainer}>
                    {dateStylesOptions.map((styleOption) => {
                        const selected = preferredDateStyles && preferredDateStyles.includes(styleOption);
                        return (
                            <TouchableOpacity
                                key={styleOption}
                                style={[
                                    styles.optionButton,
                                    {
                                        backgroundColor: selected ? colors.primary : colors.background,
                                        borderColor: selected ? colors.primary : colors.secondary,
                                    },
                                ]}
                                onPress={() => toggleDateStyle(styleOption)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        { color: selected ? colors.background : colors.secondary },
                                    ]}
                                >
                                    {styleOption}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

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
        marginBottom: 20,
    },
    ageRangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ageInput: {
        width: 60,
        borderWidth: 1,
        borderRadius: 4,
        padding: 8,
        marginHorizontal: 8,
        textAlign: 'center',
    },
    toText: {
        fontSize: 16,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderValue: {
        textAlign: 'center',
        marginTop: 4,
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
});