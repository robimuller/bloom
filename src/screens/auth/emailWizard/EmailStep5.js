// src/screens/auth/emailWizard/EmailStep5.js
import React, { useContext, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { AuthContext } from '../../../contexts/AuthContext';

export default function EmailStep5({ navigation }) {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const handleFinish = async () => {
        if (!user) return;

        try {
            setLoading(true);
            await updateDoc(doc(db, 'users', user.uid), {
                onboardingComplete: true,
            });
            setLoading(false);

            Alert.alert('Sign Up Complete', 'Welcome to the app!', [
                {
                    text: 'OK',
                    onPress: () => {
                        // Optionally navigate to main app screen
                        // For example:
                        navigation.popToTop();
                    },
                },
            ]);
        } catch (error) {
            setLoading(false);
            Alert.alert('Error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Step 5: Confirmation</Text>
            <Text>All done! Press "Finish" to complete your signup.</Text>

            <Button title={loading ? 'Finishing...' : 'Finish'} onPress={handleFinish} disabled={loading} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 20, marginBottom: 20 },
});
