// src/screens/auth/phoneWizard/PhoneStep2.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';

export default function PhoneStep2({ route, navigation }) {
    const { confirmationResult } = route.params || {};
    const [code, setCode] = useState('');

    const handleConfirmCode = async () => {
        try {
            // This logs the user in if the code is correct
            const result = await confirmationResult.confirm(code);
            const { uid, phoneNumber } = result.user;

            // Create a doc in Firestore for this phone user
            await setDoc(doc(db, 'users', uid), {
                phoneNumber,
                createdAt: new Date().toISOString(),
            });

            // Navigate to profile setup
            navigation.navigate('PhoneStep3');
        } catch (error) {
            Alert.alert('Invalid Code', error.message);
        }
    };

    return (
        <View>
            <Text>Step 2: Enter Verification Code</Text>
            <TextInput
                placeholder="123456"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
            />
            <Button title="Confirm Code" onPress={handleConfirmCode} />
        </View>
    );
}
