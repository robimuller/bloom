import React, { useState, useContext, useEffect, useCallback, memo, useRef } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import {
    Text,
    TextInput,
    Button,
    HelperText,
    useTheme,
} from 'react-native-paper';
import CreateDateLayout from '../../components/CreateDateLayout';
import { AuthContext } from '../../contexts/AuthContext';
import { DatesContext } from '../../contexts/DatesContext';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';


/* ============================= */
/*  STEP COMPONENTS (MEMOIZED)  */
/* ============================= */

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
                Need some inspiration? Try some of our date ideas and save
                the headache of being creative.{' '}
                <Text style={styles.clickableLink}>
                    Click here
                </Text>
            </Text>
        </View>
    );
});

const StepTwo = memo(function StepTwo({ location, setLocation }) {
    const theme = useTheme(); // Access the current theme
    const [apiKey, setApiKey] = useState('');
    const autocompleteRef = useRef(null);

    useEffect(() => {
        if (autocompleteRef.current && location) {
            autocompleteRef.current.setAddressText(location);
        }
    }, [location]);


    // Load API key
    useEffect(() => {
        setApiKey(process.env.GOOGLE_PLACES_API_KEY || ''); // Replace with your logic
    }, []);

    return (
        <View style={{ flex: 1, zIndex: 10 }}>
            <Text style={styles.stepTitle}>Where would you like to go?</Text>

            <GooglePlacesAutocomplete
                ref={autocompleteRef}

                placeholder="Search location"
                minLength={2} // Start showing results after 2 characters
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
                    value: location, // Ensure the input value is synced with the parent state
                    onChangeText: (text) => setLocation(text), // Update parent state as the user types
                }}
                styles={{
                    textInputContainer: {
                        borderColor: "#252525",
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
                        backgroundColor: "transparent",
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



const StepThree = memo(function StepThree({ time, setTime, category, setCategory }) {
    return (
        <View>
            <Text style={styles.stepTitle}>When is the date?</Text>
            <TextInput
                label="Time"
                mode="outlined"
                value={time}
                onChangeText={setTime}
                style={styles.input}
                outlineColor="#252525"
                theme={{ roundness: 25 }}
            />
            <TextInput
                label="Category"
                mode="outlined"
                value={category}
                onChangeText={setCategory}
                style={styles.input}
                outlineColor="#252525"
                theme={{ roundness: 25 }}
            />
        </View>
    );
});

const StepFour = memo(function StepFour({ photos }) {
    return (
        <View>
            <Text style={styles.stepTitle}>Upload / Edit Photos</Text>
            {photos && photos.length > 0 ? (
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
            <Button mode="outlined" onPress={() => {
                // pickPhoto() logic 
            }}>
                Add Photo
            </Button>
        </View>
    );
});

const StepFive = memo(function StepFive({ title, details, location, time, category, photos }) {
    return (
        <View>
            <Text style={styles.stepTitle}>Preview & Publish</Text>
            <View style={styles.previewBox}>
                <Text>Title: {title}</Text>
                <Text>Details: {details}</Text>
                <Text>Location: {location}</Text>
                <Text>Time: {time}</Text>
                <Text>Category: {category}</Text>
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

    const [currentStep, setCurrentStep] = useState(1);

    // Form fields
    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [location, setLocation] = useState('');
    const [time, setTime] = useState('');
    const [category, setCategory] = useState('');
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

    /* ============= HANDLERS ============= */

    const handleNext = useCallback(() => {
        // Validate fields for the current step before moving on
        if (currentStep === 1 && !title) {
            setError('Please enter a title.');
            return;
        }
        if (currentStep === 2 && !location) {
            setError('Please enter a location.');
            return;
        }
        if (currentStep === 3 && !time) {
            setError('Please enter a time.');
            return;
        }
        // Clear error if validated
        setError(null);

        if (currentStep === 5) {
            // Final publish
            handleCreateDate();
        } else {
            setCurrentStep((prev) => prev + 1);
        }
    }, [currentStep, title, location, time]);

    const handleBack = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    }, [currentStep]);

    const handleCreateDate = async () => {
        if (!title || !location || !time) {
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
                time,
                category,
                photos,
                status: 'open',
            });

            // Reset fields AFTER navigating away
            setTitle('');
            setDetails('');
            setLocation(''); // Clear location only when done
            setTime('');
            setCategory('');
            setPhotos([]);

            navigation.navigate('MenHome');
        } catch (err) {
            setError(err.message);
        }
    };


    /* ============= RENDER STEP CONTENT ============= */

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
                        time={time}
                        setTime={setTime}
                        category={category}
                        setCategory={setCategory}
                    />
                );
            case 4:
                return (
                    <StepFour
                        photos={photos}
                    // setPhotos={setPhotos} // If you need to modify in Step4, pass setter as well
                    />
                );
            case 5:
                return (
                    <StepFive
                        title={title}
                        details={details}
                        location={location}
                        time={time}
                        category={category}
                        photos={photos}
                    />
                );
            default:
                return null;
        }
    }

    /* ============= MAIN RENDER ============= */

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
});
