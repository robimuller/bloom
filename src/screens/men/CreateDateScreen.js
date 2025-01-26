// CreateDateScreen.js
import React, {
    useState,
    useContext,
    useEffect,
    useCallback,
    memo,
    useRef,
} from 'react';
import { View, StyleSheet, Image } from 'react-native';
import {
    Text,
    TextInput,
    Button,
    HelperText,
    useTheme,
} from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import CreateDateLayout from '../../components/CreateDateLayout';
import { AuthContext } from '../../contexts/AuthContext';
import { DatesContext } from '../../contexts/DatesContext';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

/* ============================= */
/*  STEP COMPONENTS (MEMOIZED)  */
/* ============================= */

// STEP 1
const StepOne = memo(function StepOne({ title, setTitle, details, setDetails }) {
    return (
        <View>
            <Text style={styles.stepTitle}>What is the title of your date?</Text>
            <TextInput
                label="Title"
                mode="outlined"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                outlineColor="#252525"
                theme={{ roundness: 25 }}
            />

            <Text style={styles.stepTitle}>Tell us more?</Text>
            <TextInput
                label="Details"
                placeholder="Let’s go to a movie"
                mode="outlined"
                value={details}
                onChangeText={setDetails}
                style={styles.input}
                outlineColor="#252525"
                theme={{ roundness: 25 }}
            />

            <Text style={styles.inspirationText}>
                Need some inspiration? Try some of our date ideas and save the headache
                of being creative.{' '}
                <Text style={styles.clickableLink}>Click here</Text>
            </Text>
        </View>
    );
});

// STEP 2
const StepTwo = memo(function StepTwo({ location, setLocation }) {
    const theme = useTheme();
    const [apiKey, setApiKey] = useState('');
    const autocompleteRef = useRef(null);

    useEffect(() => {
        if (autocompleteRef.current && location) {
            autocompleteRef.current.setAddressText(location);
        }
    }, [location]);

    useEffect(() => {
        setApiKey(process.env.GOOGLE_PLACES_API_KEY || '');
    }, []);

    return (
        <View style={{ flex: 1, zIndex: 10 }}>
            <Text style={styles.stepTitle}>Where would you like to go?</Text>

            <GooglePlacesAutocomplete
                ref={autocompleteRef}
                placeholder="Search location"
                minLength={2}
                fetchDetails={true}
                query={{
                    key: apiKey,
                    language: 'en',
                }}
                onFail={(error) => console.log('Autocomplete Error:', error)}
                onNotFound={() => console.log('No results found')}
                onPress={(data, details = null) => {
                    setLocation(data.description);
                }}
                textInputProps={{
                    placeholderTextColor: theme.colors.onBackground,
                    value: location,
                    onChangeText: (text) => setLocation(text),
                }}
                styles={{
                    textInputContainer: {
                        borderColor: '#252525',
                        borderWidth: 1,
                        borderRadius: 25,
                        paddingHorizontal: 8,
                        height: 50,
                        marginTop: 6,
                        backgroundColor: theme.colors.background,
                    },
                    textInput: {
                        height: 50,
                        color: theme.colors.text,
                        backgroundColor: 'transparent',
                    },
                    listView: {
                        backgroundColor: theme.colors.cardBackground,
                        zIndex: 1000,
                        elevation: 10,
                        maxHeight: 150,
                        marginTop: 5,
                        borderRadius: 15,
                    },
                    row: {
                        backgroundColor: theme.colors.background,
                        height: 50,
                    },
                    separator: {
                        height: 0,
                    },
                    description: {
                        color: theme.colors.text,
                        fontSize: 14,
                    },
                }}
                enablePoweredByContainer={false}
            />
        </View>
    );
});

// STEP 3 (Date & Time, with calendar below the row)
const StepThree = memo(function StepThree({
    date,
    setDate,
    time,
    setTime,
}) {
    const theme = useTheme();

    const [isCalendarOpen, setCalendarOpen] = useState(false);
    const [isTimePickerOpen, setTimePickerOpen] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return 'Select Date';
        const [year, month, day] = dateString.split('-');
        return `${day} ${getMonthName(month)} ${year}`;
    };

    const getMonthName = (monthStr) => {
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        const idx = parseInt(monthStr, 10) - 1;
        return months[idx] || '';
    };

    const formatTime = (dateObj) => {
        let hours = dateObj.getHours();
        let minutes = dateObj.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // convert 0 → 12
        minutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${hours}:${minutes} ${ampm}`;
    };

    // Handle a day press from <Calendar>
    const handleDayPress = (day) => {
        setDate(day.dateString);
        setCalendarOpen(false);
    };

    // Handle time confirm from <DateTimePickerModal>
    const handleTimeConfirm = (selectedDate) => {
        setTime(formatTime(selectedDate));
        setTimePickerOpen(false);
    };

    return (
        <View>
            <Text style={styles.stepTitle}>Date &amp; Time</Text>

            {/* ROW 1: Two columns for date/time buttons */}
            <View style={styles.dateTimeRow}>
                {/* Left: Date Button */}
                <Button
                    mode="outlined"
                    onPress={() => setCalendarOpen(!isCalendarOpen)}
                    labelStyle={{ color: theme.colors.text }}
                    style={styles.buttonStyle}
                >
                    {date ? formatDate(date) : 'Select Date'}
                </Button>

                {/* Right: Time Button */}
                <Button
                    mode="outlined"
                    onPress={() => setTimePickerOpen(true)}
                    labelStyle={{ color: theme.colors.text }}
                    style={styles.buttonStyle}
                >
                    {time || 'Select Time'}
                </Button>
            </View>

            {/* ROW 2: Expand the calendar if date is pressed */}
            {isCalendarOpen && (
                <View style={styles.calendarRow}>
                    <Calendar
                        markedDates={{
                            [date]: {
                                selected: true,
                                selectedColor: theme.colors.primary,
                            },
                        }}
                        onDayPress={handleDayPress}
                        theme={{
                            backgroundColor: theme.colors.background,
                            calendarBackground: theme.colors.background,
                            dayTextColor: theme.colors.text,
                            monthTextColor: theme.colors.text,
                            arrowColor: theme.colors.primary,
                        }}
                        style={styles.calendar}
                    />
                </View>
            )}

            {/* Time picker modal */}
            <DateTimePickerModal
                isVisible={isTimePickerOpen}
                mode="time"
                onConfirm={handleTimeConfirm}
                onCancel={() => setTimePickerOpen(false)}
            />
        </View>
    );
});

// STEP 4
const StepFour = memo(function StepFour({ photos }) {
    return (
        <View>
            <Text style={styles.stepTitle}>Upload / Edit Photos</Text>
            {photos?.length > 0 ? (
                <View style={styles.photoContainer}>
                    {photos.map((photoUri, index) => (
                        <Image
                            key={index}
                            source={{ uri: photoUri }}
                            style={styles.photo}
                            resizeMode="cover"
                        />
                    ))}
                </View>
            ) : (
                <Text style={{ marginBottom: 8 }}>No photos yet.</Text>
            )}
            <Button
                mode="outlined"
                onPress={() => {
                    // pickPhoto() logic
                }}
            >
                Add Photo
            </Button>
        </View>
    );
});

// STEP 5
const StepFive = memo(function StepFive({
    title,
    details,
    location,
    date,
    time,
    photos,
}) {
    return (
        <View>
            <Text style={styles.stepTitle}>Preview &amp; Publish</Text>
            <View style={styles.previewBox}>
                <Text>Title: {title}</Text>
                <Text>Details: {details}</Text>
                <Text>Location: {location}</Text>
                <Text>Date: {date}</Text>
                <Text>Time: {time}</Text>
            </View>
            <Text style={{ marginBottom: 8 }}>Photos:</Text>
            <View style={styles.photoContainer}>
                {photos.map((photoUri, index) => (
                    <Image
                        key={index}
                        source={{ uri: photoUri }}
                        style={styles.photo}
                        resizeMode="cover"
                    />
                ))}
            </View>
            <Text style={{ marginBottom: 8 }}>
                If everything looks good, tap "Next" to publish.
            </Text>
        </View>
    );
});

/* ============================= */
/*        MAIN SCREEN           */
/* ============================= */
export default function CreateDateScreen({ navigation }) {
    const paperTheme = useTheme();
    const { user, userDoc } = useContext(AuthContext);
    const { createDate } = useContext(DatesContext);

    // Which step we’re on
    const [currentStep, setCurrentStep] = useState(1);

    // Form fields
    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [photos, setPhotos] = useState([]);
    const [error, setError] = useState(null);

    // Grab user info (photo, name, age) for the layout
    useEffect(() => {
        if (userDoc?.photos) {
            setPhotos(userDoc.photos);
        }
    }, [userDoc]);

    const hostPhoto = userDoc?.photos?.[0] || null;
    const hostName = userDoc?.firstName || '';
    const hostAge = userDoc?.age || '';

    const handleNext = useCallback(() => {
        // Validate fields for the current step
        if (currentStep === 1 && !title) {
            setError('Please enter a title.');
            return;
        }
        if (currentStep === 2 && !location) {
            setError('Please enter a location.');
            return;
        }
        if (currentStep === 3) {
            if (!date) {
                setError('Please pick a date.');
                return;
            }
            if (!time) {
                setError('Please pick a time.');
                return;
            }
        }
        setError(null);

        if (currentStep === 5) {
            // Final publish
            handleCreateDate();
        } else {
            setCurrentStep((prev) => prev + 1);
        }
    }, [currentStep, title, location, date, time]);

    const handleBack = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    }, [currentStep]);

    const handleCreateDate = async () => {
        if (!title || !location || !date || !time) {
            setError('Please fill out all required fields before publishing.');
            return;
        }
        if (!user) {
            setError('You must be logged in to create a date.');
            return;
        }

        try {
            await createDate({
                title,
                details,
                location,
                date,
                time,
                photos,
                status: 'open',
            });
            // Reset
            setTitle('');
            setDetails('');
            setLocation('');
            setDate('');
            setTime('');
            setPhotos([]);

            navigation.navigate('MenHome');
        } catch (err) {
            setError(err.message);
        }
    };

    function renderStepContent() {
        switch (currentStep) {
            case 1:
                return (
                    <StepOne
                        title={title}
                        setTitle={setTitle}
                        details={details}
                        setDetails={setDetails}
                    />
                );
            case 2:
                return (
                    <StepTwo
                        location={location}
                        setLocation={setLocation}
                    />
                );
            case 3:
                return (
                    <StepThree
                        date={date}
                        setDate={setDate}
                        time={time}
                        setTime={setTime}
                    />
                );
            case 4:
                return <StepFour photos={photos} />;
            case 5:
                return (
                    <StepFive
                        title={title}
                        details={details}
                        location={location}
                        date={date}
                        time={time}
                        photos={photos}
                    />
                );
            default:
                return null;
        }
    }

    return (
        <View style={styles.container}>
            <CreateDateLayout
                step={currentStep}
                totalSteps={5}
                hostPhoto={hostPhoto}
                hostName={hostName}
                hostAge={hostAge}
                title="Create an event"
                subtitle={`Step ${currentStep} of 5`}
                canGoBack={currentStep > 1}
                onBack={handleBack}
                onNext={handleNext}
                nextLabel={currentStep === 5 ? 'Publish' : 'Next'}
                backLabel="Back"
                errorComponent={
                    error && (
                        <HelperText type="error" visible style={{ marginTop: 8 }}>
                            {error}
                        </HelperText>
                    )
                }
                theme={{
                    colors: {
                        text: paperTheme.colors.text,
                        background: paperTheme.colors.background,
                        primary: paperTheme.colors.primary,
                        cardBackground: paperTheme.colors.cardBackground,
                    },
                }}
            >
                {renderStepContent()}
            </CreateDateLayout>
        </View>
    );
}

/* ============= STYLES ============= */
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 18,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    inspirationText: {
        fontSize: 14,
        color: '#888',
        marginBottom: 16,
    },
    clickableLink: {
        color: '#339af0',
        textDecorationLine: 'underline',
    },
    input: {
        marginBottom: 10,
    },
    error: {
        marginTop: 8,
    },
    photoContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    photo: {
        width: 60,
        height: 60,
        borderRadius: 4,
        marginRight: 8,
        marginBottom: 8,
    },
    previewBox: {
        padding: 12,
        backgroundColor: '#f2f2f2',
        borderRadius: 8,
        marginBottom: 16,
    },

    /* ============ StepThree Layout ============ */
    dateTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // Each button is half the row
        marginBottom: 8,
    },
    buttonStyle: {
        flex: 1,
        marginHorizontal: 4,
        height: 50,
        justifyContent: 'center',
        borderRadius: 25,
        borderColor: '#252525',
    },
    calendarRow: {
        // Calendar appears below the row, spanning full width
        marginTop: 8,
    },
    calendar: {
        borderRadius: 8,
    },
});
