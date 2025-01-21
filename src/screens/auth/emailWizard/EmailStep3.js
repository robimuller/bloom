// src/screens/auth/emailWizard/EmailStep3.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { AuthContext } from '../../../contexts/AuthContext';

export default function EmailStep3({ navigation }) {
    const { user } = useContext(AuthContext);
    const [ageRange, setAgeRange] = useState([18, 35]);
    const [interests, setInterests] = useState([]);

    const handleNext = async () => {
        if (user) {
            await updateDoc(doc(db, 'users', user.uid), {
                ageRange,
                interests,
                updatedAt: new Date().toISOString(),
            });
        }
        navigation.navigate('EmailStep4');
    };

    return (
        <View>
            <Text>Step 3: Preferences</Text>
            <TextInput
                placeholder="Age Range, e.g. 18,35"
                onChangeText={(val) => {
                    const parts = val.split(',');
                    setAgeRange(parts.map((p) => parseInt(p.trim())));
                }}
            />
            <TextInput
                placeholder="Interests, e.g. hiking,dining"
                onChangeText={(val) => {
                    const arr = val.split(',').map((v) => v.trim());
                    setInterests(arr);
                }}
            />

            <Button title="Next" onPress={handleNext} />
        </View>
    );
}
