// CreateDateScreen.js
import React, {
    useState,
    useContext,
    useEffect,
    useCallback,
    memo,
    useRef,
} from 'react';
import {
    View,
    StyleSheet,
    Image,
    ScrollView,
    Dimensions,
    Pressable,
} from 'react-native';
import {
    Text,
    TextInput,
    Button,
    HelperText,
    useTheme,
    ActivityIndicator,
} from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { db } from '../../../config/firebase';

import CreateDateLayout from '../../components/CreateDateLayout';
import { AuthContext } from '../../contexts/AuthContext';
import { DatesContext } from '../../contexts/DatesContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { classifyDateCategory } from '../../utils/classifyDateCategory';


// We'll need these to measure screen for the carousel
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

// STEP 3
const StepThree = memo(function StepThree({ date, setDate, time, setTime }) {
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
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
        ];
        const idx = parseInt(monthStr, 10) - 1;
        return months[idx] || '';
    };

    const formatTime = (dateObj) => {
        let hours = dateObj.getHours();
        let minutes = dateObj.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        minutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${hours}:${minutes} ${ampm}`;
    };

    const handleDayPress = (day) => {
        setDate(day.dateString);
        setCalendarOpen(false);
    };

    const handleTimeConfirm = (selectedDate) => {
        setTime(formatTime(selectedDate));
        setTimePickerOpen(false);
    };

    return (
        <View>
            <Text style={styles.stepTitle}>Date &amp; Time</Text>
            <View style={styles.dateTimeRow}>
                <Button
                    mode="outlined"
                    onPress={() => setCalendarOpen(!isCalendarOpen)}
                    labelStyle={{ color: theme.colors.text }}
                    style={styles.buttonStyle}
                >
                    {date ? formatDate(date) : 'Select Date'}
                </Button>
                <Button
                    mode="outlined"
                    onPress={() => setTimePickerOpen(true)}
                    labelStyle={{ color: theme.colors.text }}
                    style={styles.buttonStyle}
                >
                    {time || 'Select Time'}
                </Button>
            </View>
            {isCalendarOpen && (
                <View style={styles.calendarRow}>
                    <Calendar
                        markedDates={{
                            [date]: { selected: true, selectedColor: theme.colors.primary },
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
const StepFour = memo(function StepFour({ photos, setPhotos }) {
    const handlePickPhoto = async () => {
        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: false,
        });
        if (!pickerResult.canceled && pickerResult.assets?.[0]) {
            if (photos.length >= 6) {
                alert('You can only add up to 6 photos.');
                return;
            }
            const newPhotoUri = pickerResult.assets[0].uri;
            setPhotos((prev) => [...prev, newPhotoUri]);
        }
    };

    const handleRemovePhoto = (index) => {
        const newPhotos = [...photos];
        newPhotos.splice(index, 1);
        setPhotos(newPhotos);
    };

    return (
        <View>
            <Text style={styles.stepTitle}>Upload / Edit Photos</Text>
            {photos.length > 0 ? (
                <View style={styles.photoContainer}>
                    {photos.map((uri, i) => (
                        <Pressable
                            key={i}
                            onLongPress={() => handleRemovePhoto(i)}
                            style={{ marginRight: 8, marginBottom: 8 }}
                        >
                            <Image source={{ uri }} style={styles.photo} contentFit="cover" />
                        </Pressable>
                    ))}
                </View>
            ) : (
                <Text>No photos yet.</Text>
            )}
            <Button mode="outlined" onPress={handlePickPhoto}>
                Add Photo
            </Button>
            <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                Long-press a photo to remove it. (Max 6)
            </Text>
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
    // We'll show a hero carousel on top (50% of screen), details below it.
    const IMAGE_HEIGHT = Math.round(SCREEN_HEIGHT * 0.3);

    return (
        <ScrollView style={{ flex: 1, borderRadius: 15 }}>
            {/* === TOP CAROUSEL (50% screen) === */}
            <View style={[styles.carouselContainer, { height: IMAGE_HEIGHT }]}>
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={{ flex: 1, borderRadius: 15 }}
                >
                    {photos.length > 0 ? (
                        photos.map((uri, index) => (
                            <Image
                                key={index}
                                source={{ uri }}
                                style={{ width: SCREEN_WIDTH, height: IMAGE_HEIGHT, resizeMode: 'cover' }}
                            />
                        ))
                    ) : (
                        <Image
                            // fallback image if no photos
                            source={require('../../../assets/placeholder.png')}
                            style={{ width: SCREEN_WIDTH, height: IMAGE_HEIGHT, resizeMode: 'cover' }}
                        />
                    )}
                </ScrollView>
            </View>

            {/* === BOTTOM CONTENT === */}
            <View style={[styles.bottomContent]}>
                {/* You can style a "card" effect or just plain background */}
                <View style={styles.bottomCard}>
                    <Text style={styles.bigTitle}>{title}</Text>
                    <View style={styles.infoContainer}>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Location</Text>
                            <Text style={styles.infoValue}>{location || 'N/A'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Date</Text>
                            <Text style={styles.infoValue}>{date || 'N/A'}</Text>
                        </View>

                        {/* <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Time:</Text>
                            <Text style={styles.infoValue}>{time || 'N/A'}</Text>
                        </View> */}
                    </View>
                    <Text style={styles.sectionHeading}>About this date</Text>
                    <Text style={styles.detailsText}>
                        {details || 'No description provided.'}
                    </Text>

                </View>
            </View>
        </ScrollView>
    );
});

/* ============================= */
/*        MAIN SCREEN           */
/* ============================= */
export default function CreateDateScreen({ navigation }) {
    const paperTheme = useTheme();
    const { user, userDoc } = useContext(AuthContext);
    const { createDate } = useContext(DatesContext);
    const theme = useTheme();


    const [currentStep, setCurrentStep] = useState(1);

    // Form fields
    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [photos, setPhotos] = useState([]);
    const [error, setError] = useState(null);
    const [isPublishing, setIsPublishing] = useState(false);

    // On mount, optionally load userDoc photos as defaults
    useEffect(() => {
        if (userDoc?.photos) {
            setPhotos(userDoc.photos);
        }
    }, [userDoc]);

    const hostPhoto = userDoc?.photos?.[0] || null;
    const hostName = userDoc?.firstName || '';
    const hostAge = userDoc?.age || '';

    const handleNext = useCallback(() => {
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

    // Upload photos to Storage
    const uploadAllPhotos = async (docId) => {
        const storage = getStorage();
        const photoURLs = [];
        for (let i = 0; i < photos.length; i++) {
            const uri = photos[i];
            try {
                const resp = await fetch(uri);
                const blob = await resp.blob();
                const fileRef = ref(storage, `date_photos/${docId}/photo_${i}.jpg`);
                await uploadBytes(fileRef, blob);
                const downloadURL = await getDownloadURL(fileRef);
                photoURLs.push(downloadURL);
            } catch (err) {
                console.error('Error uploading photo:', err);
            }
        }
        return photoURLs;
    };

    const handleCreateDate = async () => {
        if (!user) {
            setError('You must be logged in to create a date.');
            return;
        }
        if (!title || !location || !date || !time) {
            setError('Please fill out all required fields before publishing.');
            return;
        }
        setIsPublishing(true);
        setError(null);

        try {
            // Step 1) Create doc in Firestore "dates" to get the docId
            const docRef = await addDoc(collection(db, 'dates'), {
                hostId: user.uid,
                title,
                details,
                location,
                date,
                time,
                status: 'open',
                createdAt: serverTimestamp(),
                photos: [],
            });

            // Step 2) Classify the date into one of the 7 categories
            const category = await classifyDateCategory({ title, location });

            // Step 3) Upload each photo
            const photoURLs = await uploadAllPhotos(docRef.id);

            // Step 4) Update the date doc with photo URLs and the category
            await updateDoc(doc(db, 'dates', docRef.id), {
                photos: photoURLs,
                category: category, // <-- new field
            });

            // Reset local state
            setTitle('');
            setDetails('');
            setLocation('');
            setDate('');
            setTime('');
            setPhotos([]);

            navigation.navigate('MenHome');
        } catch (err) {
            console.error('Error creating date:', err);
            setError(err.message);
        } finally {
            setIsPublishing(false);
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
                return (
                    <StepFour photos={photos} setPhotos={setPhotos} />
                );
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
        <SafeAreaView style={[styles.safeArea, { backgroundColor: paperTheme.colors.background }]} edges={['top']}>
            <CreateDateLayout
                step={currentStep}
                totalSteps={5}
                hostPhoto={hostPhoto}
                hostName={hostName}
                hostAge={hostAge}
                title="Create your date"
                subtitle={`Step ${currentStep} of 5`}
                canGoBack={currentStep > 1 && !isPublishing}
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
                {isPublishing ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" />
                        <Text style={{ marginTop: 16 }}>Publishing your date...</Text>
                    </View>
                ) : (
                    renderStepContent()
                )}
            </CreateDateLayout>
        </SafeAreaView>
    );
}

/* ============= STYLES ============= */
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        marginTop: 10,
    },
    photo: {
        width: 60,
        height: 60,
        borderRadius: 4,
    },
    previewBox: {
        padding: 12,
        backgroundColor: '#f2f2f2',
        borderRadius: 8,
        marginBottom: 16,
    },

    // StepThree
    dateTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
        marginTop: 8,
    },
    calendar: {
        borderRadius: 8,
    },

    // Step Five styles
    carouselContainer: {
        // Absolutely position the top carousel if you want it behind the layout’s header
        // For example: position:'absolute', top:0, left:0, right:0
        // but here we keep it simple: we just fix the height at 50% in that component
        borderRadius: 15,
    },
    bottomContent: {
        flex: 1,
        paddingTop: 5
    },
    bottomCard: {
    },
    bigTitle: {
        fontSize: 25,
        fontWeight: '700',
        marginBottom: 15,
    },
    infoContainer: {
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "row"
    },

    infoRow: {
        flexDirection: 'column',
        justifyContent: "center",
        marginBottom: 5,
    },
    infoLabel: {
        fontWeight: '700',
        marginRight: 8,
        textAlign: "center"
    },
    infoValue: {
        fontWeight: '400',
    },
    sectionHeading: {
        marginTop: 12,
        marginBottom: 4,
        fontSize: 16,
        fontWeight: '700',
    },
    detailsText: {
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.5,
    },
});
