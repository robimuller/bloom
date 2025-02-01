// src/screens/auth/LoginScreen.js
import React, { useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Title, HelperText, useTheme } from 'react-native-paper';
import { AuthContext } from '../../contexts/AuthContext';

export default function LoginScreen({ navigation }) {
    const { login, authError } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState(null);
    const theme = useTheme();

    const handleLogin = async () => {
        setLocalError(null);
        if (!email || !password) {
            setLocalError('Please enter both email and password.');
            return;
        }
        await login(email, password);
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={[styles.innerContainer, { backgroundColor: theme.colors.surface }]}>
                <Title style={[styles.title, { color: theme.colors.primary }]}>
                    Welcome Back
                </Title>
                <TextInput
                    label="Email"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    mode="outlined"
                    style={styles.input}
                    theme={{ colors: { primary: theme.colors.primary } }}
                />
                <TextInput
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    mode="outlined"
                    style={styles.input}
                    theme={{ colors: { primary: theme.colors.primary } }}
                />

                {(localError || authError) && (
                    <HelperText type="error" visible style={styles.error}>
                        {localError || authError}
                    </HelperText>
                )}

                <Button mode="contained" onPress={handleLogin} style={styles.button}>
                    Login
                </Button>

                <View style={styles.footer}>
                    <Text style={styles.switchText}>Don’t have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={[styles.link, { color: theme.colors.primary }]}> Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    innerContainer: {
        borderRadius: 10,
        padding: 20,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        // Elevation for Android
        elevation: 4,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'transparent',
    },
    error: {
        marginBottom: 10,
    },
    button: {
        marginTop: 10,
        padding: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    switchText: {
        fontSize: 14,
    },
    link: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});