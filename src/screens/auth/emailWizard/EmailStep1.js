// src/screens/auth/emailWizard/EmailStep1.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../../../contexts/AuthContext';

export default function EmailStep1({ navigation }) {
    const { emailSignup, authError } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [role, setRole] = useState('male'); // or 'female', etc.
    const [localError, setLocalError] = useState(null);

    const handleNext = async () => {
        setLocalError(null);

        if (!email || !password || !displayName) {
            setLocalError('Please fill out all required fields.');
            return;
        }

        // Create user in Firebase (using the correct function!)
        await emailSignup(email, password, displayName, role);

        // If there's no Auth error, proceed
        if (!authError) {
            navigation.navigate('EmailStep2');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Step 1: Basic Info (Email)</Text>
            {authError && <Text style={styles.error}>{authError}</Text>}
            {localError && <Text style={styles.error}>{localError}</Text>}

            <TextInput
                style={styles.input}
                placeholder="Display Name"
                value={displayName}
                onChangeText={setDisplayName}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Button title="Next" onPress={handleNext} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    title: { fontSize: 20, marginBottom: 20 },
    input: {
        borderWidth: 1,
        marginBottom: 10,
        padding: 10,
        borderRadius: 5,
    },
    error: { color: 'red', marginBottom: 10 },
});
