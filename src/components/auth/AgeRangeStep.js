import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomTextInput from '../CustomTextInput';

const AgeRangeStep = ({ preferences, updatePreferences }) => {
    const [minAge, maxAge] = preferences.ageRange;
    return (
        <View style={styles.panel}>
            <Text style={styles.title}>Desired Age Range</Text>
            <CustomTextInput
                placeholder="Min Age"
                keyboardType="numeric"
                value={String(minAge)}
                onChangeText={(val) => updatePreferences({ ageRange: [Number(val), maxAge] })}
            />
            <CustomTextInput
                placeholder="Max Age"
                keyboardType="numeric"
                value={String(maxAge)}
                onChangeText={(val) => updatePreferences({ ageRange: [minAge, Number(val)] })}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    panel: { marginVertical: 8 },
    title: { fontSize: 25, fontWeight: '500' },
});

export default AgeRangeStep;