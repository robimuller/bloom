// src/screens/auth/emailWizard/EmailStep2.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { AuthContext } from '../../../contexts/AuthContext';
import { db } from '../../../../config/firebase';

export default function EmailStep2({ navigation }) {
    const { user } = useContext(AuthContext);
    const [birthday, setBirthday] = useState('');
    const [gender, setGender] = useState('');
    const [bio, setBio] = useState('');

    const handleNext = async () => {
        if (user) {
            await updateDoc(doc(db, 'users', user.uid), {
                birthday,
                bio,
                role: gender,
                updatedAt: new Date().toISOString(),
            });
        }
        navigation.navigate('EmailStep3');
    };

    return (
        <View>
            <Text>Step 2: Profile Setup</Text>
            <TextInput placeholder="Birthday" value={birthday} onChangeText={setBirthday} />
            <TextInput placeholder="Gender" value={gender} onChangeText={setGender} />
            <TextInput placeholder="Bio" value={bio} onChangeText={setBio} multiline />

            <Button title="Next" onPress={handleNext} />
        </View>
    );
}
