import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Pressable,
    Image,
    ScrollView,
    Alert,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    Switch,
} from 'react-native';
import { TextInput } from 'react-native'; // using built-in TextInput
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import SignUpLayout from '../../../components/SignUpLayout';
import CustomTextInput from '../../../components/CustomTextInput';
import { SignUpContext } from '../../../contexts/SignUpContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { db } from '../../../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ThemeContext } from '../../../contexts/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';

// At the top of EmailSignUpScreen.js (after your imports)
const stepTitles = {
    1: 'Basic Info',
    2: 'Birthday',
    3: 'Gender',
    4: 'Orientation',
    5: 'Photos',
    6: 'Height',
    7: 'Age Range',
    8: 'Interests',
    9: 'Bio',
    10: 'Geo Radius',
    11: 'Location',
    12: 'Notifications',
    13: 'Terms & Conditions',
    14: 'Preview & Submit',
};


// Regular expression to enforce at least 8 characters, one uppercase, one lowercase, one digit, and one special character.
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export default function EmailSignUpScreen({ navigation }) {
    const [subStep, setSubStep] = useState(1);
    const [localError, setLocalError] = useState(null);
    const { finishing, setFinishing } = useContext(SignUpContext);
    const [isUpdating, setIsUpdating] = useState(false);
    const { colors } = useContext(ThemeContext);
    const [showPassword, setShowPassword] = useState(false);

    const dynamicTitle = stepTitles[subStep] || 'Create Your Account';


    // Updated total steps (we had 16 before, but now three steps become one)
    const TOTAL_STEPS = 14;

    const { user, userDoc, loadingAuth, emailSignup, authError } = useContext(AuthContext);
    const {
        basicInfo,
        profileInfo,
        preferences,
        permissions,
        locationInfo,
        updateBasicInfo,
        updateProfileInfo,
        updatePreferences,
        updatePermissions,
        updateLocationInfo,
    } = useContext(SignUpContext);

    useEffect(() => {
        if (permissions.location) {
            requestLocationPermission();
        }
    }, [permissions.location]);

    const requestLocationPermission = async () => {
        // ... (unchanged)
    };

    const deduceCityFromCoordinates = async (coords) => {
        // ... (unchanged)
    };

    // Helper: Determine if a given field should shake based on localError
    const shouldShakeField = (field) => {
        if (!localError) return false;
        const errLower = localError.toLowerCase();
        if (field === 'firstName' && errLower.includes('first name')) return true;
        if (field === 'email' && errLower.includes('valid email')) return true;
        if (field === 'password' && errLower.includes('6 characters')) return true;
        if (field === 'birthday' && errLower.includes('birthday')) return true;
        // Extend for additional fields as needed.
        return false;
    };


    if (loadingAuth) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (userDoc?.onboardingComplete) {
        return (
            <View style={styles.center}>
                <Text>Finalizing...</Text>
                {localError ? <Text style={styles.errorText}>{localError}</Text> : null}
            </View>
        );
    }

    const handleFinish = async () => {
        setLocalError(null);
        setFinishing(true);
        setIsUpdating(true);

        try {
            const newUser = await emailSignup(
                basicInfo.email,
                basicInfo.password,
                basicInfo.firstName
            );

            if (authError) {
                setLocalError(`${authError} ${Date.now()}`);
                setFinishing(false);
                setIsUpdating(false);
                return;
            }

            let finalPhotoURLs = [];
            if (profileInfo.photos && profileInfo.photos.length > 0) {
                finalPhotoURLs = await uploadAllPhotos(profileInfo.photos, newUser.uid);
            }

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
                location: locationInfo?.coordinates || null,
                photos: finalPhotoURLs,
                onboardingComplete: true,
                updatedAt: new Date().toISOString(),
            });

            setIsUpdating(false);
            Alert.alert('Success!', 'Your account has been created!', [
                {
                    text: 'OK',
                    onPress: () => { },
                },
            ]);
        } catch (err) {
            setLocalError(`${err.message} ${Date.now()}`);
            setFinishing(false);
            setIsUpdating(false);
            console.error('Error finalizing sign up:', err);
        }
    };

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

    // ----- Render Functions -----
    const renderStep1BasicInfo = () => {
        return (
            <View style={styles.panel}>
                <View style={{ gap: 10 }}>
                    <Text style={[styles.subHeader, { color: colors.secondary }]}>First Name</Text>
                    <CustomTextInput
                        shake={shouldShakeField('firstName')}
                        placeholder="e.g.: Alex"
                        value={basicInfo.firstName}
                        onChangeText={(val) => updateBasicInfo({ firstName: val })}
                    />
                    <Text style={[styles.subHeader, { color: colors.secondary }]}>Email</Text>
                    <CustomTextInput
                        shake={shouldShakeField('email')}
                        placeholder="e.g.: mycool@email.com"
                        keyboardType="email-address"
                        value={basicInfo.email}
                        onChangeText={(val) => updateBasicInfo({ email: val })}
                    />
                    <Text style={[styles.subHeader, { color: colors.secondary }]}>Password</Text>
                    <CustomTextInput
                        shake={shouldShakeField('password')}
                        placeholder="Your very secure password here"
                        secureTextEntry={!showPassword}
                        value={basicInfo.password}
                        onChangeText={(val) => updateBasicInfo({ password: val })}
                        style={{ paddingRight: 40 }}
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color={colors.primary} />
                            </TouchableOpacity>
                        }
                    />
                </View>
            </View>
        );
    };

    const renderStep4Birthday = () => (
        <View style={styles.panel}>
            <Text style={styles.title}>When's your birthday?</Text>
            <CustomTextInput
                placeholder="YYYY-MM-DD"
                value={profileInfo.birthday || ''}
                onChangeText={(val) => updateProfileInfo({ birthday: val })}
            />
        </View>
    );

    const renderStep5Gender = () => (
        <View style={styles.panel}>
            <Text style={styles.title}>Gender</Text>
            <View style={styles.row}>
                <TouchableOpacity
                    onPress={() => updateProfileInfo({ gender: 'male' })}
                    style={[
                        styles.genderButton,
                        profileInfo.gender === 'male' ? styles.buttonContained : styles.buttonOutlined,
                    ]}
                >
                    <Text style={styles.buttonText}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => updateProfileInfo({ gender: 'female' })}
                    style={[
                        styles.genderButton,
                        profileInfo.gender === 'female' ? styles.buttonContained : styles.buttonOutlined,
                    ]}
                >
                    <Text style={styles.buttonText}>Female</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => updateProfileInfo({ gender: 'other' })}
                    style={[
                        styles.genderButton,
                        profileInfo.gender === 'other' ? styles.buttonContained : styles.buttonOutlined,
                    ]}
                >
                    <Text style={styles.buttonText}>Other</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderStep6Orientation = () => (
        <View style={styles.panel}>
            <Text style={styles.title}>Sexual Orientation</Text>
            <CustomTextInput
                placeholder="Orientation"
                value={profileInfo.orientation || ''}
                onChangeText={(val) => updateProfileInfo({ orientation: val })}
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
                <Text style={styles.title}>Upload Photos</Text>
                <TouchableOpacity onPress={handlePickPhoto} style={styles.button}>
                    <Text style={styles.buttonText}>Add Photo</Text>
                </TouchableOpacity>
                <View style={styles.photoRow}>
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
            <Text style={styles.title}>Height</Text>
            <CustomTextInput
                placeholder="Height (cm)"
                keyboardType="numeric"
                value={profileInfo.height || ''}
                onChangeText={(val) => updateProfileInfo({ height: val })}
            />
        </View>
    );

    const renderStep9AgeRange = () => {
        const [minAge, maxAge] = preferences.ageRange;
        return (
            <View style={styles.panel}>
                <Text style={styles.title}>Desired Age Range</Text>
                <CustomTextInput
                    placeholder="Min Age"
                    keyboardType="numeric"
                    value={String(minAge)}
                    onChangeText={(val) => updatePreferences({ ageRange: [Number(val), maxAge] })}
                />
                <CustomTextInput
                    placeholder="Max Age"
                    keyboardType="numeric"
                    value={String(maxAge)}
                    onChangeText={(val) => updatePreferences({ ageRange: [minAge, Number(val)] })}
                />
            </View>
        );
    };

    const renderStep10Interests = () => (
        <View style={styles.panel}>
            <Text style={styles.title}>Your Interests</Text>
            <CustomTextInput
                placeholder="Comma-separated interests"
                value={(preferences.interests || []).join(', ')}
                onChangeText={(val) =>
                    updatePreferences({ interests: val.split(',').map((x) => x.trim()) })
                }
            />
        </View>
    );

    const renderStep11Bio = () => (
        <View style={styles.panel}>
            <Text style={styles.title}>Bio</Text>
            <CustomTextInput
                placeholder="Tell us about yourself..."
                multiline
                numberOfLines={4}
                value={profileInfo.bio || ''}
                onChangeText={(val) => updateProfileInfo({ bio: val })}
                style={styles.textArea}
            />
        </View>
    );

    const renderStep12GeoRadius = () => (
        <View style={styles.panel}>
            <Text style={styles.title}>Search Radius (km)</Text>
            <CustomTextInput
                placeholder="Geo Radius"
                keyboardType="numeric"
                value={String(preferences.geoRadius)}
                onChangeText={(val) => updatePreferences({ geoRadius: Number(val) })}
            />
        </View>
    );

    const renderStep13Location = () => (
        <View style={styles.panel}>
            <Text style={styles.title}>Location Permission</Text>
            <Text style={styles.bodyText}>
                (Optional) Enable location to find matches near you.
            </Text>
            <View style={styles.row}>
                <Switch
                    value={permissions.location || false}
                    onValueChange={(val) => updatePermissions({ location: val })}
                />
                <Text style={styles.bodyText}>
                    {permissions.location ? 'Enabled' : 'Disabled'}
                </Text>
            </View>
            {permissions.location && locationInfo.city && (
                <Text style={[styles.bodyText, { marginTop: 10 }]}>
                    Detected City: {locationInfo.city}
                </Text>
            )}
        </View>
    );

    const renderStep14Notifications = () => (
        <View style={styles.panel}>
            <Text style={styles.title}>Notifications</Text>
            <View style={styles.row}>
                <Switch
                    value={permissions.notifications || false}
                    onValueChange={(val) => updatePermissions({ notifications: val })}
                />
                <Text style={styles.bodyText}>
                    {permissions.notifications ? 'Notifications On' : 'Notifications Off'}
                </Text>
            </View>
        </View>
    );

    const renderStep15Terms = () => (
        <View style={styles.panel}>
            <Text style={styles.title}>Terms & Conditions</Text>
            <Text style={styles.bodyText}>
                Lorem ipsum... By continuing, you agree to our Terms and Privacy.
            </Text>
        </View>
    );

    const renderStep16PreviewSubmit = () => (
        <View style={styles.panel}>
            <Text style={styles.title}>Preview & Submit</Text>
            <Text style={styles.bodyText}>Here is a summary of your information:</Text>
            <Text style={styles.bodyText}>Name: {basicInfo.firstName || ''}</Text>
            <Text style={styles.bodyText}>Email: {basicInfo.email || ''}</Text>
            {/* Additional summary details */}
            <Text style={[styles.bodyText, { marginTop: 10 }]}>
                Tap Finish to create your account and finalize sign-up!
            </Text>
        </View>
    );

    const renderCurrentSubStep = () => {
        switch (subStep) {
            case 1:
                return renderStep1BasicInfo();
            case 2:
                return renderStep4Birthday();
            case 3:
                return renderStep5Gender();
            case 4:
                return renderStep6Orientation();
            case 5:
                return renderStep7Photos();
            case 6:
                return renderStep8Height();
            case 7:
                return renderStep9AgeRange();
            case 8:
                return renderStep10Interests();
            case 9:
                return renderStep11Bio();
            case 10:
                return renderStep12GeoRadius();
            case 11:
                return renderStep13Location();
            case 12:
                return renderStep14Notifications();
            case 13:
                return renderStep15Terms();
            case 14:
                return renderStep16PreviewSubmit();
            default:
                return <Text style={styles.errorText}>Error: Unknown sub-step {subStep}</Text>;
        }
    };

    const validateCurrentStep = () => {
        switch (subStep) {
            case 1:
                if (!basicInfo.firstName.trim()) {
                    return 'Please enter your first name.';
                }
                if (!basicInfo.email.includes('@')) {
                    return 'Please enter a valid email.';
                }
                if (!basicInfo.password || !passwordRegex.test(basicInfo.password)) {
                    return 'Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character.';
                }
                break;
            case 2:
                if (!profileInfo.birthday) {
                    return "Please enter your birthday.";
                }
                break;
            default:
                break;
        }
        return null;
    };

    const handleNext = () => {
        setLocalError(null);
        const err = validateCurrentStep();
        if (err) {
            setLocalError(`${err} ${Date.now()}`);
            return;
        }
        if (subStep < TOTAL_STEPS) {
            setSubStep((prev) => prev + 1);
        } else {
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

    // Decide the header back action dynamically:
    const headerBackAction = subStep === 1 ? () => navigation.goBack() : handleBack;

    const progressValue = (subStep - 1) / TOTAL_STEPS;

    return (
        <SignUpLayout
            title={dynamicTitle}
            progress={progressValue}
            errorMessage={localError}
            canGoBack={true} // Always show the header back button.
            onBack={headerBackAction}
            onNext={handleNext}
            nextLabel={subStep < TOTAL_STEPS ? 'Next' : 'Finish'}
        >
            <ScrollView style={{ flex: 1 }}>{renderCurrentSubStep()}</ScrollView>
        </SignUpLayout>
    );
}

const styles = StyleSheet.create({
    panel: {
        marginVertical: 8,
    },
    input: {
        marginTop: 10,
        padding: 20,
        borderRadius: 25,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    title: {
        fontSize: 1,
        fontWeight: '500',
    },
    subHeader: {
        fontSize: 16,
        fontWeight: '500',
    },
    bodyText: {
        fontSize: 16,
        marginTop: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    genderButton: {
        marginRight: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    buttonContained: {
        backgroundColor: '#FCABFF',
    },
    buttonOutlined: {
        borderWidth: 1,
        borderColor: '#FCABFF',
    },
    button: {
        backgroundColor: '#FCABFF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
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
    photoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 8,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});