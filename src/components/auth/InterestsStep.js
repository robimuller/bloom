import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomTextInput from '../CustomTextInput';

const InterestsStep = ({ preferences, updatePreferences }) => (
    <View style={styles.panel}>
        <Text style={styles.title}>Your Interests</Text>
        <CustomTextInput
            placeholder="Comma-separated interests"
            value={(preferences.interests || []).join(', ')}
            onChangeText={(val) => updatePreferences({ interests: val.split(',').map(x => x.trim()) })}
        />
    </View>
);

const styles = StyleSheet.create({
    panel: { marginVertical: 8 },
    title: { fontSize: 25, fontWeight: '500' },
});

export default InterestsStep;