// EmailStep1.js
import React, { useState, useContext, useRef, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, IconButton, useTheme } from 'react-native-paper';

import { AuthContext } from '../../../contexts/AuthContext';
import { ThemeContext } from '../../../contexts/ThemeContext';
import { SignUpContext } from '../../../contexts/SignUpContext';
import { WizardContext } from '../../../contexts/WizardContext'; // <-- import
import SignUpLayout from '../../../components/SignUpLayout';

export default function EmailStep1({ navigation }) {
    const { authError } = useContext(AuthContext);
    const { updateBasicInfo } = useContext(SignUpContext);
    const { theme } = useContext(ThemeContext);
    const paperTheme = useTheme();

    // Grab subStep + progress + goNextSubStep + goPrevSubStep from WizardContext
    const { subStep, progress, goNextSubStep, goPrevSubStep } = useContext(WizardContext);

    // Local Fields
    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [localError, setLocalError] = useState(null);

    // Refs for TextInputs to manage focus
    const inputRef = useRef(null);

    useEffect(() => {
        // Automatically focus the TextInput of the current sub-step
        inputRef.current?.focus();
    }, [subStep]);

    // Validate fields for each sub-step
    const validateCurrentSubStep = () => {
        switch (subStep) {
            case 1:
                if (!firstName.trim()) return 'Please enter your first name.';
                break;
            case 2:
                if (!email.trim()) return 'Please enter your email.';
                const emailRegex = /\S+@\S+\.\S+/;
                if (!emailRegex.test(email)) return 'Please enter a valid email address.';
                break;
            case 3:
                if (!password.trim()) return 'Please enter a valid password.';
                if (password.length < 6) return 'Password must be at least 6 characters.';
                break;
            default:
                break;
        }
        return null;
    };

    // "Next" logic
    const handleNext = () => {
        setLocalError(null);
        const error = validateCurrentSubStep();
        if (error) {
            setLocalError(error);
            return;
        }

        if (subStep < 3) {
            // We still have more sub-steps to do inside Step 1
            goNextSubStep(); // just increments subStep in WizardContext
        } else {
            // subStep=3 => user finished Step 1
            updateBasicInfo({ firstName, email, password });

            // 1) Update wizard's step from #1 => #2 
            goNextSubStep(); // increments 'step' in WizardContext from 1 -> 2,
            // and resets subStep to 1

            // 2) Actually navigate to Step 2 in the child stack:
            navigation.navigate('EmailStep2');
        }
    };

    // "Back" logic
    const handleBack = () => {
        setLocalError(null);
        goPrevSubStep();
    };

    const errorMessages = (
        <>
            {authError ? (
                <Text style={[styles.errorText, { color: theme.primary }]}>
                    {authError}
                </Text>
            ) : null}
            {localError ? (
                <Text style={[styles.errorText, { color: theme.primary }]}>
                    {localError}
                </Text>
            ) : null}
        </>
    );

    // Which sub-step content?
    const getSubStepContent = () => {
        switch (subStep) {
            case 1:
                return {
                    icon: 'account',
                    title: 'What’s Your First Name?',
                    subtitle: 'This is how you’ll appear to others in the app.',
                    label: 'First Name',
                    value: firstName,
                    onChangeText: setFirstName,
                    keyboardType: 'default',
                    autoCapitalize: 'words',
                    returnKeyType: 'next',
                    onSubmitEditing: handleNext,
                };
            case 2:
                return {
                    icon: 'email',
                    title: 'What’s Your Email Address?',
                    subtitle: 'We’ll send a confirmation link and updates to this email.',
                    label: 'Email',
                    value: email,
                    onChangeText: setEmail,
                    keyboardType: 'email-address',
                    autoCapitalize: 'none',
                    returnKeyType: 'next',
                    onSubmitEditing: handleNext,
                };
            case 3:
                return {
                    icon: 'lock',
                    title: 'Create a Strong Password',
                    subtitle: 'Make sure your password is at least 6 characters long.',
                    label: 'Password',
                    value: password,
                    onChangeText: setPassword,
                    secureTextEntry: true,
                    keyboardType: 'default',
                    autoCapitalize: 'none',
                    returnKeyType: 'done',
                    onSubmitEditing: handleNext,
                };
            default:
                return {};
        }
    };

    const { icon, title, subtitle, label, value, onChangeText, ...inputProps } = getSubStepContent();

    // Paper TextInput theme
    const paperTextInputTheme = {
        roundness: 8,
        colors: {
            primary: theme.primary,
            text: theme.text,
            placeholder: theme.text,
            background: theme.background,
            outline: theme.primary,
        },
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <SignUpLayout
                // We’ll simply pass the global `progress` to the layout
                // so the layout can show a single progress bar.
                progress={progress}
                title="Basic Information"
                subtitle="Let’s get to know you better."
                errorComponent={errorMessages}
                canGoBack
                onBack={handleBack}
                onNext={handleNext}
                nextLabel={subStep < 3 ? 'Next' : 'Next'}
                theme={theme}
            >
                <View style={styles.formContainer}>
                    <View style={[styles.stepPanel, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.panelHeader}>
                            <IconButton icon={icon} iconColor={theme.primary} />
                            <Text style={[styles.panelTitle, { color: theme.text }]}>
                                {title}
                            </Text>
                        </View>
                        <Text style={[styles.panelSubtitle, { color: theme.text }]}>
                            {subtitle}
                        </Text>

                        <TextInput
                            ref={inputRef}
                            mode="outlined"
                            label={label}
                            value={value}
                            onChangeText={onChangeText}
                            style={styles.input}
                            theme={paperTextInputTheme}
                            textColor={theme.text}
                            {...inputProps}
                        />
                    </View>
                </View>
            </SignUpLayout>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    errorText: {
        marginTop: 8,
        textAlign: 'center',
    },
    formContainer: {
        flex: 1,
        marginTop: 10,
        marginBottom: 10,
    },
    stepPanel: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        elevation: 3,
        justifyContent: 'flex-start',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
    },
    panelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    panelTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    panelSubtitle: {
        fontSize: 14,
        marginTop: 4,
        flexWrap: 'wrap',
    },
    input: {
        marginTop: 16,
    },
});
