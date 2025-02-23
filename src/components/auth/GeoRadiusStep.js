import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomTextInput from '../CustomTextInput';

const GeoRadiusStep = ({ preferences, updatePreferences }) => (
    <View style={styles.panel}>
        <Text style={styles.title}>Search Radius (km)</Text>
        <CustomTextInput
            placeholder="Geo Radius"
            keyboardType="numeric"
            value={String(preferences.geoRadius)}
            onChangeText={(val) => updatePreferences({ geoRadius: Number(val) })}
        />
    </View>
);

const styles = StyleSheet.create({
    panel: { marginVertical: 8 },
    title: { fontSize: 25, fontWeight: '500' },
});

export default GeoRadiusStep;