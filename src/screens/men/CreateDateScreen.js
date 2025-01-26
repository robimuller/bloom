import React, { useState, useContext, useEffect } from 'react';
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

export default function CreateDateScreen({ navigation }) {
    // This comes from <PaperProvider /> as described above
    const paperTheme = useTheme();

    const { user, userDoc } = useContext(AuthContext);
    const { createDate } = useContext(DatesContext);

    const [currentStep, setCurrentStep] = useState(1);
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [time, setTime] = useState('');
    const [category, setCategory] = useState('');
    const [photos, setPhotos] = useState([]);
    const [error, setError] = useState(null);

    // Grab first photo from userDoc if available
    useEffect(() => {
        if (userDoc?.photos) {
            setPhotos(userDoc.photos);
        }
    }, [userDoc]);

    const hostPhoto = userDoc?.photos?.[0] || null;
    const hostName = userDoc?.firstName || '';
    const hostAge = userDoc?.age || '';

    // Step navigation
    const handleNext = () => {
        // Validate fields for each step...
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
        // ...
        setError(null);

        if (currentStep === 5) {
            handleCreateDate();
        } else {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

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
                location,
                time,
                category,
                photos,
                status: 'open',
            });

            // Reset fields
            setTitle('');
            setLocation('');
            setTime('');
            setCategory('');
            setPhotos([]);

            navigation.navigate('MenHome');
        } catch (err) {
            setError(err.message);
        }
    };

    // Step content
    function renderStepContent() {
        switch (currentStep) {
            case 1:
                return (
                    <View>
                        <Text style={styles.stepTitle}>What is the title of your date?</Text>
                        <TextInput
                            label="Title"
                            mode="outlined"
                            value={title}
                            onChangeText={setTitle}
                            style={styles.input}
                        />
                    </View>
                );
            case 2:
                return (
                    <View>
                        <Text style={styles.stepTitle}>Where would you like to go?</Text>
                        <TextInput
                            label="Location"
                            mode="outlined"
                            value={location}
                            onChangeText={setLocation}
                            style={styles.input}
                        />
                    </View>
                );
            case 3:
                return (
                    <View>
                        <Text style={styles.stepTitle}>When is the date?</Text>
                        <TextInput
                            label="Time"
                            mode="outlined"
                            value={time}
                            onChangeText={setTime}
                            style={styles.input}
                        />
                        <TextInput
                            label="Category"
                            mode="outlined"
                            value={category}
                            onChangeText={setCategory}
                            style={styles.input}
                        />
                    </View>
                );
            case 4:
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
                        <Button mode="outlined" onPress={() => { /* pickPhoto() logic */ }}>
                            Add Photo
                        </Button>
                    </View>
                );
            case 5:
                return (
                    <View>
                        <Text style={styles.stepTitle}>Preview & Publish</Text>
                        {/* Preview of data */}
                        <View style={styles.previewBox}>
                            <Text>Title: {title}</Text>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // You can remove this if you want Paper's background color
        // backgroundColor: 'red',
    },
    stepTitle: {
        fontSize: 18,
        marginBottom: 10,
        fontWeight: 'bold',
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
