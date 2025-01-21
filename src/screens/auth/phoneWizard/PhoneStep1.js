// src/screens/auth/phoneWizard/PhoneStep1.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../../../config/firebase';

// You usually need a captcha verifier in React Native, especially with Expo.
// For simplicity, assume we have a reCaptcha appVerifier or using @react-native-firebase
// This pseudo-code might require adapting for your environment.

export default function PhoneStep1({ navigation }) {
    const [phone, setPhone] = useState('');

    const handleSendCode = async () => {
        if (!phone) {
            Alert.alert('Error', 'Please enter a phone number.');
            return;
        }
        try {
            // Example: signInWithPhoneNumber in RN can require a reCAPTCHA
            // const appVerifier = ...
            const confirmationResult = await signInWithPhoneNumber(auth, phone /*, appVerifier */);
            // Pass confirmationResult to next screen
            navigation.navigate('PhoneStep2', { confirmationResult });
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <View>
            <Text>Step 1: Enter Phone Number</Text>
            <TextInput
                placeholder="+1 555-555-5555"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
            />
            <Button title="Send Code" onPress={handleSendCode} />
        </View>
    );
}
