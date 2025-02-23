// SpokenLanguagesStep.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const languageOptions = ['English', 'Spanish', 'French', 'German', 'Chinese'];

export default function SpokenLanguagesStep({ profileInfo, updateProfileInfo, colors }) {
    const toggleLanguage = (lang) => {
        const current = profileInfo.spokenLanguages || [];
        if (current.includes(lang)) {
            updateProfileInfo({ spokenLanguages: current.filter((item) => item !== lang) });
        } else {
            updateProfileInfo({ spokenLanguages: [...current, lang] });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Select the languages you speak</Text>
            {languageOptions.map((lang, index) => {
                const selected = profileInfo.spokenLanguages && profileInfo.spokenLanguages.includes(lang);
                return (
                    <TouchableOpacity
                        key={index}
                        onPress={() => toggleLanguage(lang)}
                        style={[styles.option, selected && styles.selected]}
                    >
                        <Text style={{ color: selected ? colors.primary : colors.text }}>{lang}</Text>
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