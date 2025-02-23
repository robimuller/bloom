import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PreviewStep = ({ basicInfo, profileInfo, preferences, colors }) => (
    <View style={styles.panel}>
        <Text style={[styles.title, { color: colors.text }]}>Preview & Submit</Text>
        <Text style={styles.bodyText}>Here is a summary of your information:</Text>
        <Text style={styles.bodyText}>Name: {basicInfo.firstName || ''}</Text>
        <Text style={styles.bodyText}>Email: {basicInfo.email || ''}</Text>
        {/* Additional details as desired */}
        <Text style={[styles.bodyText, { marginTop: 10 }]}>
            Tap Finish to create your account and finalize sign-up!
        </Text>
    </View>
);

const styles = StyleSheet.create({
    panel: { marginVertical: 8 },
    title: { fontSize: 25, fontWeight: '500' },
    bodyText: { fontSize: 16, marginTop: 8 },
});

export default PreviewStep;