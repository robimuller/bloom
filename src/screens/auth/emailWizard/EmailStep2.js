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
import { DatePickerModal } from 'react-native-paper-dates';
import Slider from '@react-native-community/slider';
import { debounce } from 'lodash';

import { ThemeContext } from '../../../contexts/ThemeContext';
import { SignUpContext } from '../../../contexts/SignUpContext';
// Import WizardContext
import { WizardContext } from '../../../contexts/WizardContext';

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
    const { updateProfileInfo } = useContext(SignUpContext);

    // Pull in wizard state & actions
    const { subStep, progress, goNextSubStep, goPrevSubStep } = useContext(WizardContext);

    const [localError, setLocalError] = useState(null);

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

    // Validate each sub-step
    const validateCurrentSubStep = () => {
        switch (subStep) {
            case 1: {
                if (!birthday) return 'Please select your birthdate.';
                const age = getAge(birthday);
                if (age < 18) return 'You must be at least 18 years old to join.';
                break;
            }
            case 2: {
                if (!gender) return 'Please choose the option that best describes you.';
                break;
            }
            // step 3 => orientation is optional; no validation needed
            case 4:
            default:
                break;
        }
        return null;
    };

    // "Next" logic
    const handleNext = () => {
        setLocalError(null);

        // Validate the current sub-step
        const error = validateCurrentSubStep();
        if (error) {
            setLocalError(error);
            return;
        }

        if (subStep < 4) {
            // We're in sub-steps 1..3 => just increment the wizard subStep
            goNextSubStep();
        } else {
            // subStep=4 => this is the LAST sub-step of Step 2
            // 1) Save final data to context
            const birthdayString = birthday.toISOString().split('T')[0];
            updateProfileInfo({
                birthday: birthdayString,
                gender,
                orientation,
                orientationPublic,
                height: `${height}${heightUnit}`,
            });

            // 2) Increment the wizard (step 2 -> step 3, subStep=1)
            goNextSubStep();

            // 3) Actually navigate to the next screen (EmailStep3)
            navigation.navigate('EmailStep3');
        }
    };

    // "Back" logic
    const handleBack = () => {
        setLocalError(null);
        // If subStep=1, wizard context will do step 2->1 but you must also do 
        // navigation.navigate('EmailStep1'), etc. 
        // For now, let's just let wizard handle the sub-step and see if it calls step=1:
        goPrevSubStep();

        // If you want to handle the actual navigation back to Step 1 screen 
        // when subStep was 1, you'd do something like this:
        // if (subStep === 1) {
        //   navigation.navigate('EmailStep1');
        // } 
    };

    // Error component
    const errorMessages = localError && (
        <Text style={[styles.errorText, { color: theme.primary }]}>{localError}</Text>
    );

    // Sub-step panels
    const renderStep1 = () => (
        <View style={[styles.stepPanel, { backgroundColor: theme.cardBackground }]}>
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
        <View style={[styles.stepPanel, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.panelHeader}>
                <IconButton icon="account" iconColor={theme.primary} />
                <Text style={[styles.panelTitle, { color: theme.text }]}>
                    Which Best Describes You?
                </Text>
            </View>
            <Text style={[styles.panelSubtitle, { color: theme.text }]}>
                We tailor your experience based on your selection.
            </Text>

            <SegmentedButtons
                value={gender}
                onValueChange={setGender}
                style={styles.segmentedControl}
                density="medium"
                showSelectedCheck={false}
                buttons={[
                    { value: 'male', label: "I'm a Man" },
                    { value: 'female', label: "I'm a Woman" },
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
        <View style={[styles.stepPanel, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.panelHeader}>
                <IconButton icon="heart-outline" iconColor={theme.primary} />
                <Text style={[styles.panelTitle, { color: theme.text }]}>
                    What's Your Orientation?
                </Text>
            </View>
            <Text style={[styles.panelSubtitle, { color: theme.text }]}>
                (Optional) This helps with suggestions, but you can hide it.
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
        <View style={[styles.stepPanel, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.panelHeader}>
                <IconButton icon="human-male-height" iconColor={theme.primary} />
                <Text style={[styles.panelTitle, { color: theme.text }]}>How Tall Are You?</Text>
            </View>
            <Text style={[styles.panelSubtitle, { color: theme.text }]}>
                It's up to you if you want to share height.
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

    // Render the sub-step panel
    const renderSubStep = () => {
        switch (subStep) {
            case 1: return renderStep1();
            case 2: return renderStep2();
            case 3: return renderStep3();
            case 4: return renderStep4();
            default: return null;
        }
    };

    return (
        <SignUpLayout
            title="Personal Details"
            subtitle="We just need a few more details to set you up."
            progress={progress}  // the global 0..1 progress from WizardContext
            errorComponent={errorMessages}
            canGoBack
            onBack={handleBack}
            onNext={handleNext}
            nextLabel={subStep < 4 ? 'Next' : 'Next'}
            theme={theme}
        >
            <View style={styles.formContainer}>{renderSubStep()}</View>
        </SignUpLayout>
    );
}

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
    stepPanel: {
        flex: 1,
        padding: 16,
        marginHorizontal: 8,
        borderRadius: 12,
        elevation: 3,
        marginBottom: 10,
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