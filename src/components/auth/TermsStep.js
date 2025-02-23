
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TermsStep = ({ colors }) => (
    <View style={styles.panel}>
        <Text style={[styles.title, { color: colors.text }]}>Terms & Conditions</Text>
        <Text style={styles.bodyText}>
            Lorem ipsum... By continuing, you agree to our Terms and Privacy.
        </Text>
    </View>
);

const styles = StyleSheet.create({
    panel: { marginVertical: 8 },
    title: { fontSize: 25, fontWeight: '500' },
    bodyText: { fontSize: 16, marginTop: 8 },
});

export default TermsStep;