import React, { useState, useContext } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Switch, IconButton, useTheme } from 'react-native-paper';
import * as Location from 'expo-location';

import { ThemeContext } from '../../../contexts/ThemeContext';
import { SignUpContext } from '../../../contexts/SignUpContext';
import { WizardContext } from '../../../contexts/WizardContext';  // <-- IMPORT THE WIZARD
import SignUpLayout from '../../../components/SignUpLayout';

export default function EmailStep4({ navigation }) {
    const { theme } = useContext(ThemeContext);
    const { updatePermissions } = useContext(SignUpContext);

    // Wizard subStep / progress
    const { subStep, progress, goNextSubStep, goPrevSubStep } = useContext(WizardContext);

    const [localError, setLocalError] = useState(null);
    const [locationGranted, setLocationGranted] = useState(false);
    const [coords, setCoords] = useState(null);
    const [allowNotifications, setAllowNotifications] = useState(false);

    // Because step #4 has only 1 sub-step, you might not even need subStep logic,
    // but let's keep the pattern consistent.

    const handleGetLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Location permission not granted.');
                return;
            }
            setLocationGranted(true);

            const { coords } = await Location.getCurrentPositionAsync({});
            setCoords(coords);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleNext = () => {
        // Save in SignUpContext
        updatePermissions({
            notifications: allowNotifications,
            location: locationGranted,
            locationCoords: coords
                ? {
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                }
                : null,
        });

        // 1) increment wizard subStep => go from Step4 -> Step5
        goNextSubStep();

        // 2) actual navigation
        navigation.navigate('EmailStep5');
    };

    const handleBack = () => {
        setLocalError(null);

        // If there's only 1 sub-step, subStep is always 1. So if we call goPrevSubStep(),
        // wizard will go from (step4, subStep1) => (step3, subStep=whatever).
        goPrevSubStep();

        // Optionally, navigate back to Step3 
        // (since subStep=1 means we have nowhere else inside step4 to go back to):
        navigation.navigate('EmailStep3');
    };

    const errorMessages = localError && (
        <Text style={[styles.errorText, { color: theme.primary }]}>{localError}</Text>
    );

    return (
        <SignUpLayout
            title="Location & Permissions"
            subtitle="Allow location or notifications if you'd like."
            // Remove currentStep={4}, use the global wizard progress
            progress={progress}
            errorComponent={errorMessages}
            canGoBack
            onBack={handleBack}
            onNext={handleNext}
            // If you'd like, rename "Next" to "Continue" or something.
            nextLabel="Next"
            theme={theme}
        >
            <View style={styles.formContainer}>
                <View style={[styles.stepPanel, { backgroundColor: theme.cardBackground }]}>
                    <View style={styles.panelHeader}>
                        <IconButton icon="map-marker" iconColor={theme.primary} />
                        <Text style={[styles.panelTitle, { color: theme.text }]}>
                            Location Permissions
                        </Text>
                    </View>
                    <Button
                        mode="outlined"
                        onPress={handleGetLocation}
                        style={styles.outlinedButton(theme.primary)}
                        textColor={theme.primary}
                    >
                        {locationGranted
                            ? 'Location Permission Granted'
                            : 'Request Location Permission'}
                    </Button>
                    {coords && (
                        <Text style={[styles.info, { color: theme.text }]}>
                            Current location: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
                        </Text>
                    )}
                </View>

                <View style={[styles.stepPanel, { backgroundColor: theme.cardBackground }]}>
                    <View style={styles.panelHeader}>
                        <IconButton icon="bell-outline" iconColor={theme.primary} />
                        <Text style={[styles.panelTitle, { color: theme.text }]}>
                            Notifications
                        </Text>
                    </View>
                    <View style={styles.switchRow}>
                        <Text style={[styles.switchLabel, { color: theme.text }]}>
                            Allow Notifications
                        </Text>
                        <Switch
                            value={allowNotifications}
                            onValueChange={setAllowNotifications}
                            color={theme.primary}
                        />
                    </View>
                </View>
            </View>
        </SignUpLayout>
    );
}

const styles = StyleSheet.create({
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

        // Subtle shadow & border
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
    outlinedButton: (color) => ({
        borderColor: color,
        borderRadius: 8,
        marginTop: 16,
    }),
    info: {
        marginTop: 8,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        justifyContent: 'space-between',
    },
    switchLabel: {
        fontSize: 16,
    },
    errorText: {
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 10,
    },
});
