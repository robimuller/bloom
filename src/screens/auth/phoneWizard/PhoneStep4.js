// src/screens/auth/phoneWizard/PhoneStep4.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { AuthContext } from '../../../contexts/AuthContext';

export default function PhoneStep4({ navigation }) {
    const { user } = useContext(AuthContext);
    const [ageRange, setAgeRange] = useState([18, 35]);

    const handleNext = async () => {
        if (user) {
            await updateDoc(doc(db, 'users', user.uid), {
                ageRange,
                updatedAt: new Date().toISOString(),
            });
        }
        navigation.navigate('PhoneStep5');
    };

    return (
        <View>
            <Text>Step 4: Preferences</Text>
            <TextInput
                placeholder="18,35"
                onChangeText={(val) => {
                    const parts = val.split(',');
                    setAgeRange(parts.map((p) => parseInt(p.trim())));
                }}
            />
            <Button title="Next" onPress={handleNext} />
        </View>
    );
}
