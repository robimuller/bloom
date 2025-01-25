// src/screens/auth/emailWizard/EmailStep5.js

import React, { useContext, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { doc, updateDoc } from 'firebase/firestore';

import { db } from '../../../../config/firebase';
import { AuthContext } from '../../../contexts/AuthContext';
import { SignUpContext } from '../../../contexts/SignUpContext';
import { ThemeContext } from '../../../contexts/ThemeContext';
// IMPORTANT: import your WizardContext
import { WizardContext } from '../../../contexts/WizardContext';

import SignUpLayout from '../../../components/SignUpLayout';

export default function EmailStep5({ navigation }) {
    const { emailSignup, authError } = useContext(AuthContext);
    const { theme } = useContext(ThemeContext);
    const {
        basicInfo,
        profileInfo,
        preferences,
        permissions,
    } = useContext(SignUpContext);

    // Bring in wizard state
    const { subStep, progress, goPrevSubStep, goNextSubStep } = useContext(WizardContext);

    const [localError, setLocalError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFinish = async () => {
        setLocalError(null);
        setLoading(true);

        try {
            // 1) Create user with email & password
            const newUser = await emailSignup(
                basicInfo.email,
                basicInfo.password,
                basicInfo.firstName
            );

            // 2) If authError is set, stop
            if (authError) {
                setLocalError(authError);
                setLoading(false);
                return;
            }

            // 3) Now we have newUser.uid => update Firestore
            await updateDoc(doc(db, 'users', newUser.uid), {
                birthday: profileInfo?.birthday || null,
                gender: profileInfo?.gender || null,
                orientation: profileInfo?.orientation || null,
                orientationPublic: profileInfo?.orientationPublic || false,
                height: profileInfo?.height || null,

                ageRange: preferences?.ageRange || [18, 35],
                interests: preferences?.interests || [],
                geoRadius: preferences?.geoRadius || 50,

                notifications: permissions?.notifications || false,
                location: permissions?.locationCoords || null,

                onboardingComplete: true,
                updatedAt: new Date().toISOString(),
            });

            // 4) Optionally bump the wizard to step 6 (though you only have 5 steps total).
            goNextSubStep();

            setLoading(false);
            Alert.alert('Success!', 'Your account has been created.', [
                {
                    text: 'OK',
                    onPress: () => {
                        // Let your AppNavigator handle the rest
                        navigation.popToTop();
                    },
                },
            ]);
        } catch (error) {
            setLoading(false);
            setLocalError(error.message);
            console.error('Error finalizing onboarding:', error);
        }
    };

    const handleBack = () => {
        setLocalError(null);
        goPrevSubStep();
        // Step5, subStep=1 => wizard goes back to Step4 subStep=1
        navigation.navigate('EmailStep4');
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

    return (
        <SignUpLayout
            title="Confirmation"
            subtitle="Just one more click!"
            // Instead of currentStep={5}, pass the global wizard progress:
            progress={progress}
            errorComponent={errorMessages}
            canGoBack
            onBack={handleBack}
            onNext={handleFinish}
            nextLabel={loading ? 'Finishing...' : 'Finish'}
            theme={theme}
        >
            <View style={styles.formContainer}>
                <View style={[styles.stepPanel, { backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.finalText, { color: theme.text }]}>
                        Review your details and tap "Finish" to create your account.
                    </Text>
                </View>
            </View>
        </SignUpLayout>
    );
}

const styles = StyleSheet.create({
    errorText: {
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 10,
    },
    formContainer: {
        flex: 1,
        marginTop: 10,
        marginBottom: 10,
    },
    stepPanel: {
        flex: 1,
        padding: 16,
        marginHorizontal: 8,
        borderRadius: 12,
        elevation: 3,
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
    },
    finalText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
