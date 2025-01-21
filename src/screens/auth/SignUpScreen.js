// SignUpScreen.js
// This screen handles user registration with role selection (Men or Women).

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';

export default function SignUpScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [role, setRole] = useState(''); // "male" or "female"
    const [error, setError] = useState(null);

    const handleSignUp = async () => {
        if (!role) {
            setError('Please select a role: Man or Woman');
            return;
        }

        try {
            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const { uid } = userCredential.user;

            // 2. Save extra info (role, displayName, etc.) in Firestore
            await setDoc(doc(db, 'users', uid), {
                displayName,
                email,
                role, // "male" or "female"
                createdAt: new Date().toISOString(),
            });

            // 3. The user is now logged in automatically
            // The onAuthStateChanged listener will redirect to the correct stack based on role
            // So we don't manually navigate here (or we can show a success message if needed).
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>

            <TextInput
                placeholder="Display Name"
                value={displayName}
                onChangeText={setDisplayName}
                style={styles.input}
            />

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

            <Text>Select Your Role:</Text>
            <View style={styles.roleContainer}>
                <TouchableOpacity
                    onPress={() => setRole('male')}
                    style={[
                        styles.roleButton,
                        role === 'male' && styles.roleButtonActive
                    ]}
                >
                    <Text style={styles.roleText}>Man</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setRole('female')}
                    style={[
                        styles.roleButton,
                        role === 'female' && styles.roleButtonActive
                    ]}
                >
                    <Text style={styles.roleText}>Woman</Text>
                </TouchableOpacity>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <Button title="Create Account" onPress={handleSignUp} />

            <Text style={styles.switchText}>
                Already have an account?{' '}
                <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
                    Login
                </Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: {
        borderWidth: 1,
        marginBottom: 10,
        padding: 10,
        borderRadius: 5,
    },
    roleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    roleButton: {
        borderWidth: 1,
        borderRadius: 5,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    roleButtonActive: {
        backgroundColor: '#ddd',
    },
    roleText: {
        fontSize: 16,
    },
    error: { color: 'red', marginVertical: 10 },
    switchText: { marginTop: 15, textAlign: 'center' },
    link: { color: 'blue', textDecorationLine: 'underline' },
});
