// src/screens/auth/emailWizard/EmailStep3.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { AuthContext } from '../../../contexts/AuthContext';

export default function EmailStep3({ navigation }) {
    const { user } = useContext(AuthContext);

    const [ageRange, setAgeRange] = useState([18, 35]);
    const [interests, setInterests] = useState([]);
    const [geoRadius, setGeoRadius] = useState(50);

    const handleNext = async () => {
        if (user) {
            await updateDoc(doc(db, 'users', user.uid), {
                ageRange,
                interests,
                geoRadius,
                updatedAt: new Date().toISOString(),
            });
        }
        navigation.navigate('EmailStep4');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Step 3: Preferences</Text>

            <Text>Age Range (comma-separated)</Text>
            <TextInput
                style={styles.input}
                placeholder="18,35"
                onChangeText={(val) => {
                    const parts = val.split(',').map((v) => parseInt(v.trim()) || 0);
                    setAgeRange(parts);
                }}
            />

            <Text>Interests (comma-separated)</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. hiking,dining"
                onChangeText={(val) => {
                    const arr = val.split(',').map((v) => v.trim());
                    setInterests(arr);
                }}
            />

            <Text>Search Radius (km)</Text>
            <TextInput
                style={styles.input}
                placeholder="50"
                keyboardType="numeric"
                value={geoRadius.toString()}
                onChangeText={(val) => setGeoRadius(parseInt(val) || 0)}
            />

            <Button title="Next" onPress={handleNext} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 20, marginBottom: 10 },
    input: {
        borderWidth: 1,
        marginBottom: 10,
        padding: 8,
        borderRadius: 5,
    },
});
