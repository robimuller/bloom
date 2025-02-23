import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeightRuler from '../HeightRuler';
// A custom checkbox that uses your theme colors
const CustomCheckbox = ({ value, onValueChange, label, colors }) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={() => onValueChange(!value)}>
        <View style={[styles.checkbox, { borderColor: colors.primary, backgroundColor: value ? colors.primary : 'transparent' }]}>
            {value && <Ionicons name="checkmark" size={16} color={colors.backgroundColor} />}
        </View>
        <Text style={[styles.checkboxLabel, { color: colors.secondary }]}>{label}</Text>
    </TouchableOpacity>
);

// Predefined body type options
const bodyTypes = ["Athletic", "Slim", "Average", "Chubby"];

const HeightBodyTypeStep = ({ profileInfo, updateProfileInfo, colors }) => {
    const initialHeight = profileInfo.height ? parseInt(profileInfo.height, 10) : 170;
    return (
        <View style={styles.panel}>
            <View style={styles.section}>
                <Text style={[styles.subHeader, { color: colors.text }]}>How tall are you?</Text>
                <HeightRuler
                    onValueChange={(val) => updateProfileInfo({ height: val })}
                    initialValue={initialHeight}
                    colors={colors}
                />
                <CustomCheckbox
                    value={profileInfo.showHeight}
                    onValueChange={(val) => updateProfileInfo({ showHeight: val })}
                    label="Display my height on my profile"
                    colors={colors}
                />
            </View>
            <View style={styles.section}>
                <Text style={[styles.subHeader, { color: colors.text }]}>Can you tell us your body type?</Text>
                <View style={styles.tagsContainer}>
                    {bodyTypes.map((type) => {
                        const isSelected = type === profileInfo.bodyType;
                        return (
                            <TouchableOpacity
                                key={type}
                                style={[styles.tag, isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                                onPress={() => updateProfileInfo({ bodyType: type })}
                            >
                                <Text style={[styles.tagText, isSelected && { color: colors.backgroundColor, fontWeight: '600' }]}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <CustomCheckbox
                    value={profileInfo.showBodyType}
                    onValueChange={(val) => updateProfileInfo({ showBodyType: val })}
                    label="Display my body type on my profile"
                    colors={colors}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    panel: {
        marginVertical: 8,
    },
    title: {
        fontSize: 25,
        fontWeight: '500',
    },
    subHeader: {
        fontSize: 20,
        fontWeight: '500',
        marginBottom: 4,
    },
    section: {
        marginBottom: 16,
    },
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
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginVertical: 8,
    },
    tag: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 16,
        color: '#333',
    },
});

export default HeightBodyTypeStep;