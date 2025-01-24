// src/screens/auth/emailWizard/EmailStep1.js
import React, { useState, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

import { AuthContext } from '../../../contexts/AuthContext';
import { ThemeContext } from '../../../contexts/ThemeContext';
import { SignUpContext } from '../../../contexts/SignUpContext';
import SignUpLayout from '../../../components/SignUpLayout';

export default function EmailStep1({ navigation }) {
    const { emailSignup, authError } = useContext(AuthContext);
    const { updateBasicInfo } = useContext(SignUpContext);
    const { theme } = useContext(ThemeContext);

    // local fields
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState(null);

    const validateAllFields = () => {
        if (!displayName.trim()) return 'Please enter your display name.';
        if (!email.trim()) return 'Please enter your email.';
        if (!password.trim()) return 'Please enter your password.';
        return null;
    };

    const handleNext = async () => {
        setLocalError(null);
        const error = validateAllFields();
        if (error) {
            setLocalError(error);
            return;
        }

        // Save to context
        updateBasicInfo({ displayName, email, password });
        // Sign up in Firebase
        await emailSignup(email, password, displayName);
        if (!authError) {
            navigation.navigate('EmailStep2');
        }
    };

    // Simple Paper theme for TextInput (overrides)
    const paperTextInputTheme = {
        roundness: 999,
        colors: {
            primary: theme.primary,
            text: theme.text,
            placeholder: theme.text,
            background: theme.background,
            outline: theme.primary,
        },
    };

    const errorMessages = (
        <>
            {authError ? (
                <Text variant="bodySmall" style={[styles.errorText, { color: theme.primary }]}>
                    {authError}
                </Text>
            ) : null}
            {localError ? (
                <Text variant="bodySmall" style={[styles.errorText, { color: theme.primary }]}>
                    {localError}
                </Text>
            ) : null}
        </>
    );

    return (
        <SignUpLayout
            title="Basic Information"
            subtitle="Let's get to know you better."
            currentStep={1}        // Step 1 of 5
            errorComponent={errorMessages}
            canGoBack={false}
            onBack={() => { }}
            onNext={handleNext}
            nextLabel="Next"
            theme={theme}
        >
            <View style={{ marginBottom: 24 }}>
                <Text variant="titleMedium" style={{ color: theme.text, marginBottom: 10 }}>
                    What is your display name?
                </Text>
                <TextInput
                    mode="outlined"
                    label="Display Name"
                    value={displayName}
                    onChangeText={setDisplayName}
                    style={styles.input}
                    theme={paperTextInputTheme}
                    textColor={theme.text}
                />

                <Text variant="titleMedium" style={{ color: theme.text, marginTop: 16, marginBottom: 10 }}>
                    What is your email address?
                </Text>
                <TextInput
                    mode="outlined"
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    theme={paperTextInputTheme}
                    textColor={theme.text}
                />

                <Text variant="titleMedium" style={{ color: theme.text, marginTop: 16, marginBottom: 10 }}>
                    Set a password
                </Text>
                <TextInput
                    mode="outlined"
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                    theme={paperTextInputTheme}
                    textColor={theme.text}
                />
            </View>
        </SignUpLayout>
    );
}

const styles = StyleSheet.create({
    input: {
        marginBottom: 12,
    },
    errorText: {
        marginTop: 8,
        textAlign: 'center',
    },
});
