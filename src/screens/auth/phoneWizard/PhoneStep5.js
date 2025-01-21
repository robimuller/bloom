// src/screens/auth/phoneWizard/PhoneStep5.js
import React, { useState, useContext } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { AuthContext } from '../../../contexts/AuthContext';

export default function PhoneStep5({ navigation }) {
    const { user } = useContext(AuthContext);
    const [allowNotifications, setAllowNotifications] = useState(false);

    const handleFinish = async () => {
        if (user) {
            await updateDoc(doc(db, 'users', user.uid), {
                allowNotifications,
                onboardingComplete: true,
            });
        }
        Alert.alert('Sign Up Complete', 'Welcome to the app!', [
            { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
    };

    return (
        <View>
            <Text>Step 5: Permissions & Confirmation</Text>
            <Button
                title={allowNotifications ? 'Disable Notifications' : 'Enable Notifications'}
                onPress={() => setAllowNotifications(!allowNotifications)}
            />
            <Button title="Finish" onPress={handleFinish} />
        </View>
    );
}
