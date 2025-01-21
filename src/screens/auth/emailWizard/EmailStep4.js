// src/screens/auth/emailWizard/EmailStep4.js
import React, { useState, useContext } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { AuthContext } from '../../../contexts/AuthContext';

export default function EmailStep4({ navigation }) {
    const { user } = useContext(AuthContext);
    const [allowNotifications, setAllowNotifications] = useState(false);

    const handleFinish = async () => {
        if (user) {
            await updateDoc(doc(db, 'users', user.uid), {
                allowNotifications,
                onboardingComplete: true, // <-- Mark them complete
            });
        }
        Alert.alert('Sign Up Complete', 'Welcome to the app!', [
            {
                text: 'OK',
                onPress: () => {
                    // You could do nothing, or maybe `navigation.popToTop()`
                    // The top-level navigator will automatically move them to the main tabs
                    // once it re-checks userDoc.
                },
            },
        ]);
    };

    return (
        <View>
            <Text>Step 4: Permissions & Confirmation</Text>
            <Button
                title={allowNotifications ? 'Disable Notifications' : 'Enable Notifications'}
                onPress={() => setAllowNotifications(!allowNotifications)}
            />
            <Button title="Finish" onPress={handleFinish} />
        </View>
    );
}
