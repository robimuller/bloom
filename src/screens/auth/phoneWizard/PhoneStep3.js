// src/screens/auth/phoneWizard/PhoneStep3.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { AuthContext } from '../../../contexts/AuthContext';

export default function PhoneStep3({ navigation }) {
    const { user } = useContext(AuthContext);
    const [displayName, setDisplayName] = useState('');
    const [gender, setGender] = useState('');
    const [bio, setBio] = useState('');

    const handleNext = async () => {
        if (user) {
            await updateDoc(doc(db, 'users', user.uid), {
                displayName,
                gender,
                bio,
            });
        }
        navigation.navigate('PhoneStep4');
    };

    return (
        <View>
            <Text>Step 3: Profile Setup</Text>
            <TextInput placeholder="Display Name" value={displayName} onChangeText={setDisplayName} />
            <TextInput placeholder="Gender" value={gender} onChangeText={setGender} />
            <TextInput placeholder="Bio" value={bio} onChangeText={setBio} multiline />

            <Button title="Next" onPress={handleNext} />
        </View>
    );
}
