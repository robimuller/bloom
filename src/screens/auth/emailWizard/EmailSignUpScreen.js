import React, { useState, useContext } from 'react';
import {
    View,
    StyleSheet,
    Pressable,
    Image,
    ScrollView,
    Alert,
} from 'react-native';
import { Text, TextInput, Button, IconButton, Switch } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import SignUpLayout from '../../../components/SignUpLayout';
import { SignUpContext } from '../../../contexts/SignUpContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { db } from '../../../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function EmailSignUpScreen({ navigation }) {
    // Instead of one "loading" state, let's keep:
    // - subStep: controls our wizard steps
    // - finishing: true once we do the final updateDoc, 
    //   so we show a "finishing" screen
    const [subStep, setSubStep] = useState(1);
    const [localError, setLocalError] = useState(null);
    const { finishing, setFinishing } = useContext(SignUpContext);

    // Wizard total
    const TOTAL_STEPS = 16;

    // Bring in contexts
    const { user, userDoc, loadingAuth, emailSignup, authError } = useContext(AuthContext);
    const {
        basicInfo,
        profileInfo,
        preferences,
        permissions,
        updateBasicInfo,
        updateProfileInfo,
        updatePreferences,
        updatePermissions,
    } = useContext(SignUpContext);

    // 1) SHORT-CIRCUIT if doc already says `onboardingComplete`
    //    so we don’t render Step 1 again while Firestore is still updating.
    if (loadingAuth) {
        // Show a spinner while checking auth
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (userDoc?.onboardingComplete) {
        // If the doc says we’re done, the top-level `AppNavigator` 
        // will soon (or already did) route to the main flow. 
        // So just show a blank or a small loading screen:
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Finalizing...</Text>
                {localError ? <Text style={styles.errorText}>{localError}</Text> : null}
            </View>
        );
    }

    // ====== Final step (subStep == 16 => handleFinish) ======
    const handleFinish = async () => {

        setLocalError(null);
        setFinishing(true);

        try {
            // 1) Create user
            const newUser = await emailSignup(
                basicInfo.email,
                basicInfo.password,
                basicInfo.firstName
            );

            if (authError) {
                setLocalError(authError);
                setFinishing(false);
                return;
            }

            // 2) Upload photos
            let finalPhotoURLs = [];
            if (profileInfo.photos && profileInfo.photos.length > 0) {
                finalPhotoURLs = await uploadAllPhotos(profileInfo.photos, newUser.uid);
            }

            // 3) Update Firestore
            await updateDoc(doc(db, 'users', newUser.uid), {
                firstName: basicInfo.firstName,
                lastName: basicInfo.lastName ?? null,
                email: basicInfo.email,
                birthday: profileInfo?.birthday || null,
                gender: profileInfo?.gender || null,
                orientation: profileInfo?.orientation || null,
                bio: profileInfo?.bio || null,
                height: profileInfo?.height || null,

                ageRange: preferences?.ageRange || [18, 35],
                interests: preferences?.interests || [],
                geoRadius: preferences?.geoRadius || 50,

                notifications: permissions?.notifications || false,
                location: permissions?.locationCoords || null,
                photos: finalPhotoURLs,

                onboardingComplete: true,
                updatedAt: new Date().toISOString(),
            });

            Alert.alert('Success!', 'Your account has been created!', [
                {
                    text: 'OK',
                    onPress: () => {
                        // Do nothing. The top-level will see 
                        // onboardingComplete and unmount this wizard.
                    },
                },
            ]);
        } catch (err) {
            setLocalError(err.message);
            setFinishing(false);
            console.error('Error finalizing sign up:', err);
        }
    };

    console.log('Finished updating doc. Check Firestore manually or logs to confirm.');


    // Helper: Upload all photos
    const uploadAllPhotos = async (photosArray, uid) => {
        const storage = getStorage();
        const photoURLs = [];
        for (let i = 0; i < photosArray.length; i++) {
            const uri = photosArray[i];
            if (!uri) continue;
            const resp = await fetch(uri);
            const blob = await resp.blob();
            const fileRef = ref(storage, `user_photos/${uid}/photo_${i}.jpg`);
            await uploadBytes(fileRef, blob);
            const downloadURL = await getDownloadURL(fileRef);
            photoURLs.push(downloadURL);
        }
        return photoURLs;
    };

    // ====== If finishing => show final spinner screen ======
    if (finishing) {
        return (
            <SignUpLayout
                title="Creating Account..."
                subtitle="Please wait a moment"
                progress={1}
                onBack={() => { }}
                onNext={() => { }}
                nextLabel="..."
                canGoBack={false}
                theme={{ background: '#fff', text: '#222', primary: '#3f51b5' }}
            >
                <View style={styles.center}>
                    <Text>Finalizing your account...</Text>
                    {localError && <Text style={styles.errorText}>{localError}</Text>}
                </View>
            </SignUpLayout>
        );
    }

    // ====== If not finishing, show wizard steps ======
    const progress = (subStep - 1) / TOTAL_STEPS;

    const handleNext = () => {
        setLocalError(null);
        const err = validateCurrentStep();
        if (err) {
            setLocalError(err);
            return;
        }
        if (subStep < TOTAL_STEPS) {
            setSubStep((prev) => prev + 1);
        } else {
            // subStep == 16 => finish
            handleFinish();
        }
    };

    const handleBack = () => {
        setLocalError(null);
        if (subStep > 1) {
            setSubStep((prev) => prev - 1);
        } else {
            navigation.goBack();
        }
    };

    const validateCurrentStep = () => {
        switch (subStep) {
            case 1:
                if (!basicInfo.firstName.trim()) {
                    return 'Please enter your first name.';
                }
                break;
            case 2:
                if (!basicInfo.email.includes('@')) {
                    return 'Please enter a valid email.';
                }
                break;
            case 3:
                if (!basicInfo.password || basicInfo.password.length < 6) {
                    return 'Password must be at least 6 characters.';
                }
                break;
            // etc.
            default:
                break;
        }
        return null;
    };

    // ============ Render Sub-Steps =============
    const renderStep1FirstName = () => (
        <View style={styles.panel}>
            <Text variant="titleMedium">What's your first name?</Text>
            <TextInput
                label="First Name"
                value={basicInfo.firstName}
                onChangeText={(val) => updateBasicInfo({ firstName: val })}
                style={styles.input}
            />
        </View>
    );

    const renderStep2Email = () => (
        <View style={styles.panel}>
            <Text variant="titleMedium">What's your email?</Text>
            <TextInput
                label="Email"
                keyboardType="email-address"
                value={basicInfo.email}
                onChangeText={(val) => updateBasicInfo({ email: val })}
                style={styles.input}
            />
        </View>
    );

    const renderStep3Password = () => (
        <View style={styles.panel}>
            <Text variant="titleMedium">Create a password</Text>
            <TextInput
                label="Password"
                secureTextEntry
                value={basicInfo.password}
                onChangeText={(val) => updateBasicInfo({ password: val })}
                style={styles.input}
            />
        </View>
    );

    const renderStep4Birthday = () => (
        <View style={styles.panel}>
            <Text variant="titleMedium">When's your birthday?</Text>
            <TextInput
                label="YYYY-MM-DD"
                value={profileInfo.birthday || ''}
                onChangeText={(val) => updateProfileInfo({ birthday: val })}
                style={styles.input}
            />
        </View>
    );

    const renderStep5Gender = () => (
        <View style={styles.panel}>
            <Text variant="titleMedium">Gender</Text>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <Button
                    mode={profileInfo.gender === 'male' ? 'contained' : 'outlined'}
                    onPress={() => updateProfileInfo({ gender: 'male' })}
                    style={styles.genderButton}
                >
                    Male
                </Button>
                <Button
                    mode={profileInfo.gender === 'female' ? 'contained' : 'outlined'}
                    onPress={() => updateProfileInfo({ gender: 'female' })}
                    style={styles.genderButton}
                >
                    Female
                </Button>
                <Button
                    mode={profileInfo.gender === 'other' ? 'contained' : 'outlined'}
                    onPress={() => updateProfileInfo({ gender: 'other' })}
                    style={styles.genderButton}
                >
                    Other
                </Button>
            </View>
        </View>
    );

    const renderStep6Orientation = () => (
        <View style={styles.panel}>
            <Text variant="titleMedium">Sexual Orientation</Text>
            <TextInput
                label="Orientation"
                value={profileInfo.orientation || ''}
                onChangeText={(val) => updateProfileInfo({ orientation: val })}
                style={styles.input}
            />
        </View>
    );

    const renderStep7Photos = () => {
        const handlePickPhoto = async () => {
            const pickerResult = await ImagePicker.launchImageLibraryAsync();
            if (!pickerResult.canceled && pickerResult.assets?.[0]) {
                const newPhotos = [...(profileInfo.photos || [])];
                newPhotos.push(pickerResult.assets[0].uri);
                updateProfileInfo({ photos: newPhotos });
            }
        };

        return (
            <View style={styles.panel}>
                <Text variant="titleMedium">Upload Photos</Text>
                <Button onPress={handlePickPhoto} mode="contained" style={{ marginTop: 10 }}>
                    Add Photo
                </Button>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
                    {(profileInfo.photos || []).map((uri, idx) => (
                        <Pressable
                            key={idx}
                            onLongPress={() => removePhoto(idx)}
                            style={styles.photoContainer}
                        >
                            <Image source={{ uri }} style={styles.photo} />
                        </Pressable>
                    ))}
                </View>
            </View>
        );
    };

    const removePhoto = (idx) => {
        const newPhotos = [...(profileInfo.photos || [])];
        newPhotos.splice(idx, 1);
        updateProfileInfo({ photos: newPhotos });
    };

    const renderStep8Height = () => (
        <View style={styles.panel}>
            <Text variant="titleMedium">Height</Text>
            <TextInput
                label="Height (cm)"
                keyboardType="numeric"
                value={profileInfo.height || ''}
                onChangeText={(val) => updateProfileInfo({ height: val })}
                style={styles.input}
            />
        </View>
    );

    const renderStep9AgeRange = () => {
        const [minAge, maxAge] = preferences.ageRange;
        return (
            <View style={styles.panel}>
                <Text variant="titleMedium">Desired Age Range</Text>
                <TextInput
                    label="Min Age"
                    keyboardType="numeric"
                    value={String(minAge)}
                    onChangeText={(val) => updatePreferences({ ageRange: [Number(val), maxAge] })}
                    style={styles.input}
                />
                <TextInput
                    label="Max Age"
                    keyboardType="numeric"
                    value={String(maxAge)}
                    onChangeText={(val) => updatePreferences({ ageRange: [minAge, Number(val)] })}
                    style={styles.input}
                />
            </View>
        );
    };

    const renderStep10Interests = () => (
        <View style={styles.panel}>
            <Text variant="titleMedium">Your Interests</Text>
            <TextInput
                label="Comma-separated interests"
                value={(preferences.interests || []).join(', ')}
                onChangeText={(val) =>
                    updatePreferences({ interests: val.split(',').map((x) => x.trim()) })
                }
                style={styles.input}
            />
        </View>
    );

    const renderStep11Bio = () => (
        <View style={styles.panel}>
            <Text variant="titleMedium">Basic Information - Bio</Text>
            <TextInput
                label="Bio"
                multiline
                numberOfLines={4}
                value={profileInfo.bio || ''}
                onChangeText={(val) => updateProfileInfo({ bio: val })}
                style={styles.input}
            />
        </View>
    );

    const renderStep12GeoRadius = () => (
        <View style={styles.panel}>
            <Text variant="titleMedium">Search Radius (km)</Text>
            <TextInput
                label="Geo Radius"
                keyboardType="numeric"
                value={String(preferences.geoRadius)}
                onChangeText={(val) => updatePreferences({ geoRadius: Number(val) })}
                style={styles.input}
            />
        </View>
    );

    const renderStep13Location = () => (
        <View style={styles.panel}>
            <Text variant="titleMedium">Location Permission</Text>
            <Text>
                (Optional) You can enable location to find matches near you. This example simply toggles a boolean:
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <Switch
                    value={permissions.location || false}
                    onValueChange={(val) => updatePermissions({ location: val })}
                />
                <Text style={{ marginLeft: 10 }}>
                    {permissions.location ? 'Enabled' : 'Disabled'}
                </Text>
            </View>
        </View>
    );

    const renderStep14Notifications = () => (
        <View style={styles.panel}>
            <Text variant="titleMedium">Notifications</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <Switch
                    value={permissions.notifications || false}
                    onValueChange={(val) => updatePermissions({ notifications: val })}
                />
                <Text style={{ marginLeft: 10 }}>
                    {permissions.notifications ? 'Notifications On' : 'Notifications Off'}
                </Text>
            </View>
        </View>
    );

    const renderStep15Terms = () => (
        <View style={styles.panel}>
            <Text variant="titleMedium">Terms & Conditions</Text>
            <Text style={{ marginTop: 10 }}>
                Lorem ipsum... By continuing, you agree to our Terms and Privacy.
            </Text>
        </View>
    );

    const renderStep16PreviewSubmit = () => (
        <View style={styles.panel}>
            <Text variant="titleMedium">Preview & Submit</Text>
            <Text>Here you can show a quick summary of everything the user entered.</Text>
            <Text>Name: {basicInfo.firstName || ''}</Text>
            <Text>Email: {basicInfo.email || ''}</Text>
            {/* etc. */}
            <Text style={{ marginTop: 10 }}>
                Tap Finish to create your account and finalize sign-up!
            </Text>
        </View>
    );

    const renderCurrentSubStep = () => {
        switch (subStep) {
            case 1:
                return renderStep1FirstName();
            case 2:
                return renderStep2Email();
            case 3:
                return renderStep3Password();
            case 4:
                return renderStep4Birthday();
            case 5:
                return renderStep5Gender();
            case 6:
                return renderStep6Orientation();
            case 7:
                return renderStep7Photos();
            case 8:
                return renderStep8Height();
            case 9:
                return renderStep9AgeRange();
            case 10:
                return renderStep10Interests();
            case 11:
                return renderStep11Bio();
            case 12:
                return renderStep12GeoRadius();
            case 13:
                return renderStep13Location();
            case 14:
                return renderStep14Notifications();
            case 15:
                return renderStep15Terms();
            case 16:
                return renderStep16PreviewSubmit();
            default:
                return <Text>Error: Unknown sub-step {subStep}</Text>;
        }
    };

    // Error messages
    const errorComponent = (
        <>
            {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
            {localError ? <Text style={styles.errorText}>{localError}</Text> : null}
        </>
    );

    // ============ The Final Return ==============
    return (
        <SignUpLayout
            title="Email Sign-Up"
            subtitle="Follow the steps to create your account."
            progress={progress}
            errorComponent={errorComponent}
            canGoBack={subStep > 1}
            onBack={handleBack}
            onNext={handleNext}
            nextLabel={subStep < TOTAL_STEPS ? 'Next' : 'Finish'}
            theme={{
                background: '#fff',
                text: '#222',
                primary: '#3f51b5',
            }}
        >
            <ScrollView style={{ flex: 1 }}>{renderCurrentSubStep()}</ScrollView>
        </SignUpLayout>
    );
}

const styles = StyleSheet.create({
    panel: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f9f9f9',
        marginVertical: 8,
    },
    input: {
        marginTop: 10,
    },
    photoContainer: {
        width: 80,
        height: 80,
        marginRight: 10,
        marginBottom: 10,
        borderRadius: 6,
        overflow: 'hidden',
    },
    photo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    genderButton: {
        marginRight: 10,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 8,
    },
});
