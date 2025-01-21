// src/screens/auth/LoginScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';

export default function LoginScreen({ navigation }) {
    const { login, authError } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState(null);

    const handleLogin = async () => {
        // Clear local error
        setLocalError(null);

        if (!email || !password) {
            setLocalError('Please enter both email and password.');
            return;
        }

        // Call AuthContext login
        await login(email, password);
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

            {/* Display local or context auth errors */}
            {localError && <Text style={styles.error}>{localError}</Text>}
            {authError && <Text style={styles.error}>{authError}</Text>}

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
