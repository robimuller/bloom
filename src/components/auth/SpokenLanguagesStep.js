import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CustomTextInput from '../CustomTextInput';
import * as Haptics from 'expo-haptics';

// A large list of languages (most major languages)
const allLanguages = [
    "Abkhaz", "Afar", "Afrikaans", "Akan", "Albanian", "Amharic", "Arabic", "Aragonese", "Armenian", "Assamese", "Avaric", "Avestan", "Aymara", "Azerbaijani",
    "Bambara", "Bashkir", "Basque", "Belarusian", "Bengali", "Bihari languages", "Bislama", "Bosnian", "Breton", "Bulgarian", "Burmese",
    "Catalan", "Chamorro", "Chechen", "Chichewa", "Chinese", "Chuvash", "Cornish", "Corsican", "Cree", "Croatian", "Czech",
    "Danish", "Divehi", "Dutch", "Dzongkha",
    "English", "Esperanto", "Estonian", "Ewe",
    "Faroese", "Fijian", "Finnish", "French", "Fulah",
    "Galician", "Georgian", "German", "Gikuyu", "Greek", "Guarani", "Gujarati",
    "Haitian Creole", "Hausa", "Hebrew", "Herero", "Hindi", "Hiri Motu", "Hungarian",
    "Icelandic", "Ido", "Igbo", "Indonesian", "Interlingua", "Interlingue", "Inuktitut", "Inupiaq", "Irish", "Italian",
    "Japanese", "Javanese",
    "Kalaallisut", "Kannada", "Kanuri", "Kashmiri", "Kazakh", "Khmer", "Kikuyu", "Kinyarwanda", "Komi", "Kongo", "Korean", "Kurdish", "Kwanyama", "Kyrgyz",
    "Lao", "Latin", "Latvian", "Limburgish", "Lingala", "Lithuanian", "Luga-Katanga", "Luxembourgish",
    "Macedonian", "Malagasy", "Malay", "Malayalam", "Maltese", "Manx", "Maori", "Marathi", "Marshallese", "Moldovan", "Mongolian",
    "Nauru", "Navajo", "Ndonga", "Nepali", "North Ndebele", "Northern Sami", "Norwegian", "Norwegian Bokmål", "Norwegian Nynorsk", "Nuosu",
    "Occitan", "Ojibwe", "Old Church Slavonic", "Oriya", "Oromo", "Ossetian",
    "Pali", "Pashto", "Persian", "Polish", "Portuguese", "Punjabi",
    "Quechua",
    "Romanian", "Romansh", "Russian",
    "Samoan", "Sango", "Sanskrit", "Sardinian", "Scottish Gaelic", "Serbian", "Shona", "Sichuan Yi", "Sindhi", "Sinhala", "Slovak", "Slovenian", "Somali", "Southern Ndebele", "Northern Sami", "Spanish", "Sundanese", "Swahili", "Swati", "Swedish",
    "Tagalog", "Tahitian", "Tajik", "Tamil", "Tatar", "Telugu", "Thai", "Tibetan", "Tigrinya", "Tonga (Tonga Islands)", "Tsonga", "Tswana", "Turkish", "Turkmen", "Twi",
    "Uighur", "Ukrainian", "Urdu", "Uzbek",
    "Venda", "Vietnamese", "Volapük",
    "Walloon", "Welsh", "Western Frisian", "Wolof",
    "Xhosa",
    "Yiddish", "Yoruba",
    "Zhuang", "Zulu"
];

export default function SpokenLanguagesStep({ profileInfo, setProfileInfo, colors }) {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter based on the search query.
    const filteredLanguages = allLanguages.filter((lang) =>
        lang.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Reorder so that selected languages always appear first.
    const selectedLanguages = filteredLanguages.filter(
        (lang) => profileInfo.spokenLanguages && profileInfo.spokenLanguages.includes(lang)
    );
    const unselectedLanguages = filteredLanguages.filter(
        (lang) => !profileInfo.spokenLanguages || !profileInfo.spokenLanguages.includes(lang)
    );
    const displayedLanguages = [...selectedLanguages, ...unselectedLanguages];

    const toggleLanguage = (lang) => {
        const current = profileInfo.spokenLanguages || [];
        // Trigger haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (current.includes(lang)) {
            setProfileInfo({
                ...profileInfo,
                spokenLanguages: current.filter((item) => item !== lang),
            });
        } else {
            setProfileInfo({
                ...profileInfo,
                spokenLanguages: [...current, lang],
            });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>
                Select the languages you speak
            </Text>
            <CustomTextInput
                placeholder="Search languages..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
            />
            <View style={styles.optionsContainer}>
                {displayedLanguages.map((lang, index) => {
                    const selected =
                        profileInfo.spokenLanguages && profileInfo.spokenLanguages.includes(lang);
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => toggleLanguage(lang)}
                            style={[
                                styles.option,
                                {
                                    borderColor: selected ? colors.primary : colors.border,
                                    backgroundColor: selected ? `${colors.primary}20` : 'transparent',
                                },
                            ]}
                        >
                            <Text style={[styles.optionText, { color: selected ? colors.primary : colors.text }]}>
                                {lang}
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
    searchInput: {
        height: 60,
        marginTop: 10,
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
        marginBottom: 10,
        marginRight: 10,
    },
    optionText: {
        fontSize: 16,
    },
});