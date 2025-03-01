import {
    createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth, db } from '../../../../config/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import React, { useState, useContext, useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
    View,
    Text,
} from 'react-native';
import SignUpLayout from '../../../components/SignUpLayout';
import { SignUpContext } from '../../../contexts/SignUpContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { ThemeContext } from '../../../contexts/ThemeContext';

// Import your step components (using the new setter prop names)
import BasicInfoStep from '../../../components/auth/BasicInfoStep';
import BirthdayStep from '../../../components/auth/BirthdayStep';
import GenderStep from '../../../components/auth/GenderStep';
import HeightBodyTypeStep from '../../../components/auth/HeightBodyTypeStep';
import LocationStep from '../../../components/auth/LocationStep';
import SpokenLanguagesStep from '../../../components/auth/SpokenLanguagesStep';
import EthnicityStep from '../../../components/auth/EthnicityStep';
import ReligionStep from '../../../components/auth/ReligionStep';
import EducationProfessionStep from '../../../components/auth/EducationProfessionStep';
import PhotosStep from '../../../components/auth/PhotoStep';
import BioStep from '../../../components/auth/BioStep';
import InterestsStep from '../../../components/auth/InterestsStep';
import PersonalityLifestyleStep from '../../../components/auth/PersonalityLifestyleStep';
import DatingPreferencesStep from '../../../components/auth/DatingPreferencesStep';
import AdditionalDetailsStep from '../../../components/auth/AdditionalDetailsStep';
import FinalizingScreen from '../../../components/FinalizingScreen';
import uploadImageAsync from '../../../utils/uploadImage';

const stepTitles = {
    1: 'Basic Account Information',
    2: 'Birthday',
    3: 'Gender & Orientation',
    4: 'Height & Body Type',
    5: 'Location',
    6: 'Demographic Details', // Languages, Ethnicity, Religion (single screen)
    7: 'Education & Profession',
    8: 'Photos',            // New: Photos
    9: 'Bio',               // New: Bio
    10: 'Interests',        // New: Interests
    11: 'Personality & Lifestyle',
    12: 'Dating Preferences & Ideal Date',
    13: 'Additional Details',
};

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export default function EmailSignUpScreen({ navigation }) {
    // Global context (read once for initialization)
    const { userDoc, loadingAuth } = useContext(AuthContext);
    const { finishing, setFinishing } = useContext(SignUpContext);
    const { colors } = useContext(ThemeContext);
    const {
        basicInfo,
        updateBasicInfo,
        profileInfo,
        updateProfileInfo,
        permissionsInfo,
        updatePermissionsInfo,
    } = useContext(SignUpContext);

    // Local copies of the data that each step will modify.
    const [localBasicInfo, setLocalBasicInfo] = useState(basicInfo);
    const [localProfileInfo, setLocalProfileInfo] = useState(profileInfo);
    const [localPermissionsInfo, setLocalPermissionsInfo] = useState(permissionsInfo);

    const [subStep, setSubStep] = useState(1);
    const [localError, setLocalError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const screenWidth = Dimensions.get('window').width;
    const dynamicTitle = stepTitles[subStep] || 'Create Your Account';
    const TOTAL_STEPS = 13; // updated total steps

    // Helper to check for errors in the current step.
    const shouldShakeField = (field) => {
        if (!localError) return false;
        const errLower = localError.toLowerCase();
        if (field === 'firstName' && errLower.includes('first name')) return true;
        if (field === 'email' && errLower.includes('valid email')) return true;
        if (field === 'password' && errLower.includes('8 characters')) return true;
        if (field === 'birthday' && errLower.includes('birthday')) return true;
        if (field === 'gender' && errLower.includes('gender')) return true;
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
                {localError && <Text style={styles.errorText}>{localError}</Text>}
            </View>
        );
    }

    // If finishing flag is true, display the loading screen.
    if (finishing) {
        return <FinalizingScreen colors={colors} />;
    }

    // Commit local state to global context
    const commitLocalStateToGlobal = () => {
        updateBasicInfo(localBasicInfo);
        updateProfileInfo(localProfileInfo);
        updatePermissionsInfo(localPermissionsInfo);
    };

    const uploadAllPhotos = async (photosArray, uid) => {
        const uploadedUrls = [];
        for (const photoUri of photosArray) {
            try {
                const downloadUrl = await uploadImageAsync(photoUri);
                uploadedUrls.push(downloadUrl);
            } catch (error) {
                console.error('Error uploading photo:', error);
                // Optionally, handle the error (e.g., show a message or retry)
            }
        }
        return uploadedUrls;
    };

    const handleFinish = async () => {
        console.log("Finish button pressed");
        setLocalError(null);
        commitLocalStateToGlobal();
        setFinishing(true);
        setIsUpdating(true);

        try {
            console.log("Creating user account...");
            console.log("Email:", localBasicInfo.email);
            console.log("Password length:", localBasicInfo.password?.length || 0);
            console.log("Name:", localBasicInfo.firstName);

            // Create the user directly with Firebase
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                localBasicInfo.email,
                localBasicInfo.password
            );

            const user = userCredential.user;
            console.log("User created successfully:", user.uid);

            // Upload photos if any
            let finalPhotoURLs = [];
            if (localProfileInfo.photos && localProfileInfo.photos.length > 0) {
                console.log("Uploading photos...");
                finalPhotoURLs = await uploadAllPhotos(localProfileInfo.photos, user.uid);
                console.log("Photos uploaded:", finalPhotoURLs.length);
            }

            // Create/update user document in Firestore
            console.log("Creating user document...");
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                // Basic Account Information:
                firstName: localBasicInfo.firstName,
                lastName: localBasicInfo.lastName || null,
                email: localBasicInfo.email,
                password: 'hashed', // Don't store actual password
                birthday: localBasicInfo.birthday,
                // Gender & Orientation:
                gender: localProfileInfo.gender,
                sexualOrientation: localProfileInfo.sexualOrientation || 'heterosexual',
                // Demographic Details:
                spokenLanguages: localProfileInfo.spokenLanguages,
                ethnicity: localProfileInfo.ethnicity || null,
                religion: localProfileInfo.religion || null,
                city: localProfileInfo.city,
                state: localProfileInfo.state || null,
                country: localProfileInfo.country,
                coordinates: localProfileInfo.coordinates,
                // Height & Body Type:
                height: localProfileInfo.height,
                weight: localProfileInfo.weight || null,
                // Education & Profession:
                education: localProfileInfo.education || null,
                fieldOfStudy: localProfileInfo.fieldOfStudy || null,
                occupation: localProfileInfo.occupation || null,
                income: localProfileInfo.income || null,
                // Profile Details & Media:
                photos: finalPhotoURLs,
                profilePhoto: localProfileInfo.profilePhoto,
                bio: localProfileInfo.bio || null,
                interests: localProfileInfo.interests,
                // Personality & Lifestyle:
                personalityTraits: localProfileInfo.personalityTraits,
                lifestyle: localProfileInfo.lifestyle,
                // Dating Preferences & Ideal Date:
                matchAgeRange: localProfileInfo.matchAgeRange || [18, 35],
                distance: localProfileInfo.distance || 50,
                preferredDateStyles: localProfileInfo.preferredDateStyles || null,
                // Additional Details:
                socialMediaLinks: localProfileInfo.socialMediaLinks,
                // Permissions:
                notifications: localPermissionsInfo.notifications || false,
                onboardingComplete: true,
                signUpMethod: 'email',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            console.log("User document created successfully");
            setIsUpdating(false);
            Alert.alert(
                'Success!',
                'Your account has been created!',
                [{ text: 'OK', onPress: () => navigation.navigate('Main') }]
            );

        } catch (error) {
            console.error("Error creating account:", error.code, error.message);
            let errorMessage = error.message;

            // Provide more user-friendly error messages
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered. Please use a different email or log in.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Please enter a valid email address.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak. Please use a stronger password.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your connection and try again.';
            }

            setLocalError(errorMessage);
            setFinishing(false);
            setIsUpdating(false);
        }
    };

    // Render current step: pass local state and its setter to each step.
    const renderCurrentSubStep = () => {
        switch (subStep) {
            case 1:
                return (
                    <BasicInfoStep
                        basicInfo={localBasicInfo}
                        setBasicInfo={setLocalBasicInfo}
                        shouldShakeField={shouldShakeField}
                        colors={colors}
                    />
                );
            case 2:
                return (
                    <BirthdayStep
                        basicInfo={localBasicInfo}
                        setBasicInfo={setLocalBasicInfo}
                    />
                );
            case 3:
                return (
                    <GenderStep
                        profileInfo={localProfileInfo}
                        setProfileInfo={setLocalProfileInfo}
                        colors={colors}
                        basicInfo={localBasicInfo}
                    />
                );
            case 4:
                return (
                    <HeightBodyTypeStep
                        profileInfo={localProfileInfo}
                        setProfileInfo={setLocalProfileInfo}
                        colors={colors}
                    />
                );
            case 5:
                return (
                    <LocationStep
                        profileInfo={localProfileInfo}
                        setProfileInfo={setLocalProfileInfo}
                        permissions={localPermissionsInfo}
                        setPermissions={setLocalPermissionsInfo}
                        colors={colors}
                    />
                );
            case 6:
                return (
                    <View>
                        <SpokenLanguagesStep
                            profileInfo={localProfileInfo}
                            setProfileInfo={setLocalProfileInfo}
                            colors={colors}
                        />
                        <EthnicityStep
                            profileInfo={localProfileInfo}
                            setProfileInfo={setLocalProfileInfo}
                            colors={colors}
                        />
                        <ReligionStep
                            profileInfo={localProfileInfo}
                            setProfileInfo={setLocalProfileInfo}
                            colors={colors}
                        />
                    </View>
                );
            case 7:
                return (
                    <EducationProfessionStep
                        profileInfo={localProfileInfo}
                        setProfileInfo={setLocalProfileInfo}
                        colors={colors}
                    />
                );
            case 8:
                return (
                    <PhotosStep
                        profileInfo={localProfileInfo}
                        setProfileInfo={setLocalProfileInfo}
                        colors={colors}
                    />
                );
            case 9:
                return (
                    <BioStep
                        profileInfo={localProfileInfo}
                        setProfileInfo={setLocalProfileInfo}
                        colors={colors}
                    />
                );
            case 10:
                return (
                    <InterestsStep
                        profileInfo={localProfileInfo}
                        setProfileInfo={setLocalProfileInfo}
                        colors={colors}
                    />
                );
            case 11:
                return (
                    <PersonalityLifestyleStep
                        profileInfo={localProfileInfo}
                        setProfileInfo={setLocalProfileInfo}
                        colors={colors}
                    />
                );
            case 12:
                return (
                    <DatingPreferencesStep
                        profileInfo={localProfileInfo}
                        setProfileInfo={setLocalProfileInfo}
                        colors={colors}
                    />
                );
            case 13:
                return (
                    <AdditionalDetailsStep
                        profileInfo={localProfileInfo}
                        setProfileInfo={setLocalProfileInfo}
                        colors={colors}
                    />
                );
            default:
                return <Text style={styles.errorText}>Error: Unknown step {subStep}</Text>;
        }
    };

    console.log("Global:", basicInfo, profileInfo, permissionsInfo);
    console.log("Local:", localBasicInfo, localProfileInfo, localPermissionsInfo);

    const validateCurrentStep = () => {
        switch (subStep) {
            case 1:
                if (!localBasicInfo.firstName.trim())
                    return 'Please enter your first name.';
                if (!localBasicInfo.email.includes('@'))
                    return 'Please enter a valid email.';
                if (!localBasicInfo.password || !passwordRegex.test(localBasicInfo.password))
                    return 'Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character.';
                break;
            case 2:
                if (!localBasicInfo.birthday) return 'Please enter your birthday.';
                break;
            case 3:
                if (!localProfileInfo.gender) return 'Please select your gender.';
                break;
            case 5:
                // Location step: Ensure location is enabled.
                if (!localPermissionsInfo.location) {
                    return 'Please enable your location to find matches nearby.';
                }
                break;
            case 6:
                if (!localProfileInfo.spokenLanguages || localProfileInfo.spokenLanguages.length === 0)
                    return 'Please select at least one spoken language.';
                if (!localProfileInfo.ethnicity)
                    return 'Please select your ethnicity.';
                if (!localProfileInfo.religion)
                    return 'Please select your religion.';
                break;
            default:
                break;
        }
        return null;
    };

    // When "Next" is pressed, validate, commit local state, and move to the next step.
    const handleNext = () => {
        setLocalError(null);
        const err = validateCurrentStep();
        if (err) {
            setLocalError(`${err} ${Date.now()}`);
            return;
        }
        commitLocalStateToGlobal();
        Animated.timing(slideAnim, {
            toValue: -screenWidth,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setSubStep((prev) => prev + 1);
            slideAnim.setValue(screenWidth);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        });
    };

    const handleBack = () => {
        setLocalError(null);
        Animated.timing(slideAnim, {
            toValue: screenWidth,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setSubStep((prev) => prev - 1);
            slideAnim.setValue(-screenWidth);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        });
    };

    const headerBackAction = subStep === 1 ? () => navigation.goBack() : handleBack;
    const progressValue = (subStep - 1) / TOTAL_STEPS;

    return (
        <SignUpLayout
            title={dynamicTitle}
            progress={progressValue}
            errorMessage={localError}
            canGoBack
            onBack={headerBackAction}
            onNext={subStep < TOTAL_STEPS ? handleNext : handleFinish}
            nextLabel={subStep < TOTAL_STEPS ? 'Next' : 'Finish'}
        >
            <ScrollView style={{ flex: 1 }} scrollEnabled={false}>
                <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
                    {renderCurrentSubStep()}
                </Animated.View>
            </ScrollView>
        </SignUpLayout>
    );
}

const styles = StyleSheet.create({
    errorText: { color: 'red', textAlign: 'center', marginTop: 8 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});