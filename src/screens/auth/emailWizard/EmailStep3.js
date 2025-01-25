// src/screens/auth/emailWizard/EmailStep3.js
import React, { useState, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, IconButton, useTheme } from 'react-native-paper';

import { ThemeContext } from '../../../contexts/ThemeContext';
import { SignUpContext } from '../../../contexts/SignUpContext';
// <-- Import WizardContext:
import { WizardContext } from '../../../contexts/WizardContext';

import SignUpLayout from '../../../components/SignUpLayout';

export default function EmailStep3({ navigation }) {
    const paperTheme = useTheme();
    const { theme } = useContext(ThemeContext);
    const { preferences, updatePreferences } = useContext(SignUpContext);

    // ***** Grab wizard state & actions *****
    const { subStep, progress, goNextSubStep, goPrevSubStep } = useContext(WizardContext);

    const [localError, setLocalError] = useState(null);

    // Fields
    const [ageRange, setAgeRange] = useState(preferences.ageRange || [18, 35]);
    const [interests, setInterests] = useState(preferences.interests || []);
    const [geoRadius, setGeoRadius] = useState(preferences.geoRadius || 50);

    // Simple validation
    const validateCurrentSubStep = () => {
        switch (subStep) {
            case 1:
                if (!ageRange || ageRange.length < 2) {
                    return 'Please enter a valid age range, e.g. "18,35".';
                }
                break;
            case 3:
                if (!geoRadius || geoRadius <= 0) {
                    return 'Please enter a valid radius.';
                }
                break;
            // subStep=2 => interests are optional
            default:
                break;
        }
        return null;
    };

    const handleNext = () => {
        setLocalError(null);
        const error = validateCurrentSubStep();
        if (error) {
            setLocalError(error);
            return;
        }

        // If we're not on the last sub-step, just goNextSubStep()
        // Step3 has 3 sub-steps: 1..3 (per stepsConfig[2] = 3)
        if (subStep < 3) {
            goNextSubStep();
        } else {
            // subStep=3 => final sub-step of Step3
            // 1) Save data
            updatePreferences({
                ageRange,
                interests,
                geoRadius,
            });

            // 2) Move wizard step from #3 => #4
            goNextSubStep();

            // 3) Actually navigate to Step 4
            navigation.navigate('EmailStep4');
        }
    };

    const handleBack = () => {
        setLocalError(null);
        goPrevSubStep();
        // Optionally if subStep=1 => we might want to do navigation.navigate('EmailStep2') etc.
    };

    const errorMessages = localError && (
        <Text style={[styles.errorText, { color: theme.primary }]}>{localError}</Text>
    );

    /************************************
     * SUB-STEP PANELS (like Step1 & 2) *
     ************************************/
    const renderSubStep1 = () => (
        <View style={[styles.stepPanel, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.panelHeader}>
                <IconButton icon="account-multiple" iconColor={theme.primary} />
                <Text style={[styles.panelTitle, { color: theme.text }]}>Desired Age Range</Text>
            </View>
            <Text style={[styles.panelSubtitle, { color: theme.text }]}>
                Pick the minimum and maximum ages you’d like to meet.
            </Text>

            <TextInput
                mode="outlined"
                label="Age Range (comma-separated)"
                placeholder="18,35"
                style={styles.input}
                theme={{
                    ...paperTheme,
                    colors: { ...paperTheme.colors, text: theme.text },
                }}
                value={ageRange.join(',')}
                onChangeText={(val) => {
                    const parts = val.split(',').map((v) => parseInt(v.trim()) || 0);
                    setAgeRange(parts);
                }}
            />
        </View>
    );

    const renderSubStep2 = () => (
        <View style={[styles.stepPanel, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.panelHeader}>
                <IconButton icon="star-outline" iconColor={theme.primary} />
                <Text style={[styles.panelTitle, { color: theme.text }]}>Your Interests</Text>
            </View>
            <Text style={[styles.panelSubtitle, { color: theme.text }]}>
                (Optional) Let us know what you love. e.g. hiking, dining, dancing...
            </Text>

            <TextInput
                mode="outlined"
                label="Interests (comma-separated)"
                placeholder="e.g. hiking, dining"
                style={styles.input}
                theme={{
                    ...paperTheme,
                    colors: { ...paperTheme.colors, text: theme.text },
                }}
                value={interests.join(', ')}
                onChangeText={(val) => {
                    const arr = val.split(',').map((v) => v.trim());
                    setInterests(arr);
                }}
            />
        </View>
    );

    const renderSubStep3 = () => (
        <View style={[styles.stepPanel, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.panelHeader}>
                <IconButton icon="map-marker" iconColor={theme.primary} />
                <Text style={[styles.panelTitle, { color: theme.text }]}>Search Radius</Text>
            </View>
            <Text style={[styles.panelSubtitle, { color: theme.text }]}>
                How far (in km) are you willing to meet or travel?
            </Text>

            <TextInput
                mode="outlined"
                label="Search Radius (km)"
                keyboardType="numeric"
                style={styles.input}
                theme={{
                    ...paperTheme,
                    colors: { ...paperTheme.colors, text: theme.text },
                }}
                value={geoRadius.toString()}
                onChangeText={(val) => setGeoRadius(parseInt(val) || 0)}
            />
        </View>
    );

    const renderWizardSubStep = () => {
        switch (subStep) {
            case 1:
                return renderSubStep1();
            case 2:
                return renderSubStep2();
            case 3:
                return renderSubStep3();
            default:
                return null;
        }
    };

    return (
        <SignUpLayout
            title="Preferences"
            subtitle="Let’s personalize your search."
            progress={progress} // Use the *global* wizard progress
            errorComponent={errorMessages}
            canGoBack
            onBack={handleBack}
            onNext={handleNext}
            // Step 3 has 3 sub-steps => only truly "done" if subStep=3
            // but there's still Step4 + Step5 after this, so we might label it "Next" 
            // or "Continue" even if subStep=3. 
            // If you REALLY want "Finish" only on the final wizard step (#5), do:
            nextLabel={subStep < 3 ? 'Next' : 'Next'}
            theme={theme}
        >
            <View style={styles.formContainer}>
                {renderWizardSubStep()}
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
        justifyContent: 'flex-start',
        // subtle shadow & border
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
