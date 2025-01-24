// src/screens/auth/emailWizard/EmailStep2.js

import React, { useState, useContext, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import {
    Text,
    Button,
    IconButton,
    SegmentedButtons,
    Menu,
    Switch,
    useTheme,
} from 'react-native-paper';
import { doc, updateDoc } from 'firebase/firestore';
import { DatePickerModal } from 'react-native-paper-dates';
import Slider from '@react-native-community/slider';
import { debounce } from 'lodash';

import { db } from '../../../../config/firebase';
import { AuthContext } from '../../../contexts/AuthContext';
import { ThemeContext } from '../../../contexts/ThemeContext';
import { SignUpContext } from '../../../contexts/SignUpContext';
import SignUpLayout from '../../../components/SignUpLayout';

// Helper to calculate age
function getAge(birthdate) {
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const m = today.getMonth() - birthdate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
        age--;
    }
    return age;
}

export default function EmailStep2({ navigation }) {
    const paperTheme = useTheme();
    const { theme } = useContext(ThemeContext);
    const { user } = useContext(AuthContext);
    const { updateProfileInfo } = useContext(SignUpContext);

    const [localError, setLocalError] = useState(null);

    // subStep indicates which piece of this step is currently active
    // 1 = Birthday, 2 = Gender, 3 = Orientation, 4 = Height
    const [subStep, setSubStep] = useState(1);

    // Birthday
    const [birthday, setBirthday] = useState(null);
    const [datePickerOpen, setDatePickerOpen] = useState(false);

    // Gender
    const [gender, setGender] = useState('');

    // Orientation
    const orientationOptions = [
        'Straight',
        'Gay',
        'Bisexual',
        'Pansexual',
        'Asexual',
        'Questioning',
        'Prefer not to say',
    ];
    const [orientation, setOrientation] = useState('');
    const [orientationMenuVisible, setOrientationMenuVisible] = useState(false);
    const [orientationPublic, setOrientationPublic] = useState(false);

    // Height
    const [height, setHeight] = useState(170);
    const [heightUnit, setHeightUnit] = useState('cm');

    // Debounced slider update
    const sliderRef = useRef(height);
    const debouncedSetHeight = debounce((val) => {
        setHeight(val);
    }, 80);

    // Toggle height units (cm <-> ft)
    const toggleHeightUnit = (value) => {
        if (value === 'cm' && heightUnit !== 'cm') {
            const cmValue = (height * 30.48).toFixed(0);
            setHeight(parseFloat(cmValue));
            setHeightUnit('cm');
        } else if (value === 'ft' && heightUnit !== 'ft') {
            const ftValue = (height / 30.48).toFixed(1);
            setHeight(parseFloat(ftValue));
            setHeightUnit('ft');
        }
    };

    // Validation & Next logic for each subStep
    const handleSubStepNext = async () => {
        setLocalError(null);

        switch (subStep) {
            case 1:
                if (!birthday) {
                    setLocalError('Please select your birthdate.');
                    return;
                }
                const age = getAge(birthday);
                if (age < 18) {
                    setLocalError('You must be at least 18 years old to join.');
                    return;
                }
                setSubStep(subStep + 1);
                break;

            case 2:
                if (!gender) {
                    setLocalError('Please choose the option that best describes you.');
                    return;
                }
                setSubStep(subStep + 1);
                break;

            case 3:
                // Orientation is optional
                setSubStep(subStep + 1);
                break;

            case 4:
                // Final sub-step: update Firestore and proceed
                const birthdayString = birthday.toISOString().split('T')[0];

                updateProfileInfo({
                    birthday: birthdayString,
                    gender,
                    orientation,
                    orientationPublic,
                    height: `${height}${heightUnit}`,
                });

                try {
                    if (user) {
                        await updateDoc(doc(db, 'users', user.uid), {
                            birthday: birthdayString,
                            gender,
                            orientation,
                            orientationPublic,
                            height: `${height}${heightUnit}`,
                            updatedAt: new Date().toISOString(),
                        });
                    }
                } catch (err) {
                    console.error('Error updating doc:', err);
                }

                navigation.navigate('EmailStep3');
                break;

            default:
                break;
        }
    };

    // Handle the "Back" button
    const handleSubStepBack = () => {
        setLocalError(null);
        if (subStep > 1) {
            setSubStep(subStep - 1);
        } else {
            navigation.goBack();
        }
    };

    // Build an error component for SignUpLayout
    const errorMessages = localError && (
        <Text style={[styles.errorText, { color: theme.primary }]}>{localError}</Text>
    );

    const renderStep1 = () => (
        <View style={styles.stepPanel}>
            <View style={styles.panelHeader}>
                <IconButton icon="calendar" iconColor={theme.primary} />
                <Text style={[styles.panelTitle, { color: theme.text }]}>
                    When’s Your Birthday?
                </Text>
            </View>
            <Text style={[styles.panelSubtitle, { color: theme.text }]}>
                We’ll never show this publicly. We only need it to verify your age.
            </Text>

            <Button
                mode="outlined"
                onPress={() => setDatePickerOpen(true)}
                style={styles.outlinedButton(theme.primary)}
                textColor={theme.primary}
                labelStyle={{ fontSize: 16 }}
                icon="calendar"
            >
                {birthday ? birthday.toDateString() : 'Select Your Birthdate'}
            </Button>

            <DatePickerModal
                locale="en"
                mode="single"
                theme={paperTheme}
                visible={datePickerOpen}
                date={birthday || new Date(1990, 0, 1)}
                onDismiss={() => setDatePickerOpen(false)}
                onConfirm={(params) => {
                    setDatePickerOpen(false);
                    if (params.date) setBirthday(params.date);
                }}
                saveLabel="Save"
            />
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepPanel}>
            <View style={styles.panelHeader}>
                <IconButton icon="account" iconColor={theme.primary} />
                <Text style={[styles.panelTitle, { color: theme.text }]}>
                    Which Best Describes You?
                </Text>
            </View>
            <Text style={[styles.panelSubtitle, { color: theme.text }]}>
                We tailor your experience to whether you're hosting or exploring.
            </Text>

            <SegmentedButtons
                value={gender}
                onValueChange={setGender}
                style={styles.segmentedControl}
                density="medium"
                showSelectedCheck={false}
                buttons={[
                    { value: 'male', label: "I'm a Man (Host)" },
                    { value: 'female', label: "I'm a Woman (Explorer)" },
                    { value: 'other', label: "Other / Prefer Not to Say" },
                ]}
                theme={{
                    colors: {
                        secondaryContainer: theme.primary,
                        onSecondaryContainer: '#fff',
                        surfaceVariant: theme.background,
                        onSurfaceVariant: theme.text,
                        outlineColor: theme.primary,
                    },
                }}
            />
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepPanel}>
            <View style={styles.panelHeader}>
                <IconButton icon="heart-outline" iconColor={theme.primary} />
                <Text style={[styles.panelTitle, { color: theme.text }]}>
                    What's Your Orientation?
                </Text>
            </View>
            <Text style={[styles.panelSubtitle, { color: theme.text }]}>
                (Optional) This helps us suggest matches, but you can keep it hidden.
            </Text>

            <Menu
                visible={orientationMenuVisible}
                onDismiss={() => setOrientationMenuVisible(false)}
                anchor={
                    <Button
                        mode="outlined"
                        onPress={() => setOrientationMenuVisible(true)}
                        style={styles.outlinedButton(theme.primary)}
                        textColor={theme.primary}
                        labelStyle={{ fontSize: 16 }}
                        icon="chevron-down"
                    >
                        {orientation || 'Select Orientation'}
                    </Button>
                }
            >
                {orientationOptions.map((opt) => (
                    <Menu.Item
                        key={opt}
                        onPress={() => {
                            setOrientation(opt);
                            setOrientationMenuVisible(false);
                        }}
                        title={opt}
                    />
                ))}
            </Menu>

            <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: theme.text }]}>
                    Show orientation on my profile
                </Text>
                <Switch
                    value={orientationPublic}
                    onValueChange={setOrientationPublic}
                    color={theme.primary}
                />
            </View>
        </View>
    );

    const renderStep4 = () => (
        <View style={styles.stepPanel}>
            <View style={styles.panelHeader}>
                <IconButton icon="human-male-height" iconColor={theme.primary} />
                <Text style={[styles.panelTitle, { color: theme.text }]}>How Tall Are You?</Text>
            </View>
            <Text style={[styles.panelSubtitle, { color: theme.text }]}>
                Some people are curious about height—but it's up to you if you want to share it.
            </Text>

            <View style={styles.sliderRow}>
                <Slider
                    style={{ flex: 1 }}
                    minimumValue={heightUnit === 'cm' ? 100 : 3}
                    maximumValue={heightUnit === 'cm' ? 220 : 7.5}
                    step={heightUnit === 'cm' ? 1 : 0.1}
                    value={height}
                    onValueChange={(val) => {
                        sliderRef.current = val;
                        debouncedSetHeight(val);
                    }}
                    minimumTrackTintColor={theme.primary}
                    maximumTrackTintColor="#ccc"
                    thumbTintColor={theme.primary}
                />
                <Text style={[styles.heightText, { color: theme.text }]}>
                    {height.toFixed(heightUnit === 'cm' ? 0 : 1)} {heightUnit}
                </Text>
            </View>

            <SegmentedButtons
                value={heightUnit}
                onValueChange={toggleHeightUnit}
                style={[styles.segmentedControl, { marginTop: 16 }]}
                density="medium"
                showSelectedCheck={false}
                buttons={[
                    { value: 'cm', label: 'CM' },
                    { value: 'ft', label: 'FT' },
                ]}
                theme={{
                    colors: {
                        secondaryContainer: theme.primary,
                        onSecondaryContainer: '#fff',
                        surfaceVariant: theme.background,
                        onSurfaceVariant: theme.text,
                        outlineColor: theme.primary,
                    },
                }}
            />
        </View>
    );

    // Render the appropriate sub-step panel
    const renderSubStep = () => {
        switch (subStep) {
            case 1:
                return renderStep1();
            case 2:
                return renderStep2();
            case 3:
                return renderStep3();
            case 4:
                return renderStep4();
            default:
                return null;
        }
    };

    return (
        <SignUpLayout
            title="Personal Details"
            subtitle="We just need a few more details to set you up."
            currentStep={2}
            errorComponent={errorMessages}
            canGoBack
            onBack={handleSubStepBack}
            onNext={handleSubStepNext}
            nextLabel={subStep < 4 ? 'Next' : 'Finish'}
            theme={theme}
        >
            <View style={styles.formContainer}>{renderSubStep()}</View>
        </SignUpLayout>
    );
}

// Styles
const styles = StyleSheet.create({
    formContainer: {
        flex: 1,
        marginTop: 10,
        marginBottom: 10,
    },
    errorText: {
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 10,
    },

    // A single "panel" for each sub-step (instead of a Card in a Card)
    stepPanel: {
        flex: 1,
        padding: 16,
        marginHorizontal: 8,
        borderRadius: 12,
        backgroundColor: '#fff', // or theme.colors.elevation.level2, etc.
        elevation: 3,
        // Remove margin-bottom if you want it flush above navigation
        marginBottom: 10,
        justifyContent: 'flex-start',
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
        // Ensure it doesn't truncate
        flexWrap: 'wrap',
    },
    outlinedButton: (color) => ({
        borderColor: color,
        borderRadius: 8,
        marginTop: 16,
    }),
    segmentedControl: {
        marginTop: 16,
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
    sliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    heightText: {
        marginLeft: 12,
        fontSize: 16,
    },
});
