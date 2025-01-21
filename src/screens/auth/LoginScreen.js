// LoginScreen.js
// This screen handles user login with Firebase Auth (email/password).

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../config/firebase'; // Adjust path as needed

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // On successful login, the onAuthStateChanged observer in AppContext (or similar) will redirect the user
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Button title="Login" onPress={handleLogin} />
            <Text style={styles.switchText}>
                Don’t have an account?{' '}
                <Text style={styles.link} onPress={() => navigation.navigate('SignUp')}>
                    Sign Up
                </Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5 },
    error: { color: 'red', marginVertical: 10 },
    switchText: { marginTop: 15, textAlign: 'center' },
    link: { color: 'blue', textDecorationLine: 'underline' },
});
