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

// Import your step components (make sure they are updated to use the new setter prop)
import BasicInfoStep from '../../../components/auth/BasicInfoStep';
import BirthdayStep from '../../../components/auth/BirthdayStep';
import GenderStep from '../../../components/auth/GenderStep';
import PhotosStep from '../../../components/auth/PhotoStep';
import SpokenLanguagesStep from '../../../components/auth/SpokenLanguagesStep';
import EthnicityStep from '../../../components/auth/EthnicityStep';
import ReligionStep from '../../../components/auth/ReligionStep';
import HeightBodyTypeStep from '../../../components/auth/HeightBodyTypeStep';
import LocationStep from '../../../components/auth/LocationStep';
import EducationProfessionStep from '../../../components/auth/EducationProfessionStep';
import BioStep from '../../../components/auth/BioStep';
import InterestsStep from '../../../components/auth/InterestsStep';
import PersonalityLifestyleStep from '../../../components/auth/PersonalityLifestyleStep';
import DatingPreferencesStep from '../../../components/auth/DatingPreferencesStep';
import AdditionalDetailsStep from '../../../components/auth/AdditionalDetailsStep';

const stepTitles = {
    1: 'Basic Account Information',
    2: 'Birthday',
    3: 'Gender & Orientation',
    4: 'Height & Body Type',
    5: 'Demographic Details',
    6: 'Education & Profession',
    7: 'Profile Details & Media',
    8: 'Personality & Lifestyle',
    9: 'Dating Preferences & Ideal Date',
    10: 'Additional Details',
};

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export default function EmailSignUpScreen({ navigation }) {
    // Global context (read once for initialization)
    const { userDoc, loadingAuth, emailSignup, authError } = useContext(AuthContext);
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
    const TOTAL_STEPS = 10;

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

    // Commit local state to global context
    const commitLocalStateToGlobal = () => {
        updateBasicInfo(localBasicInfo);
        updateProfileInfo(localProfileInfo);
        updatePermissionsInfo(localPermissionsInfo);
    };

    const handleFinish = async () => {
        setLocalError(null);
        commitLocalStateToGlobal();
        setFinishing(true);
        setIsUpdating(true);
        try {
            const newUser = await emailSignup(
                localBasicInfo.email,
                localBasicInfo.password,
                localBasicInfo.firstName
            );
            if (authError) {
                setLocalError(`${authError} ${Date.now()}`);
                setFinishing(false);
                setIsUpdating(false);
                return;
            }
            let finalPhotoURLs = [];
            if (localProfileInfo.photos && localProfileInfo.photos.length > 0) {
                finalPhotoURLs = await uploadAllPhotos(localProfileInfo.photos, newUser.uid);
            }
            await updateDoc(doc(db, 'users', newUser.uid), {
                uid: newUser.uid,
                // Basic Account Information:
                firstName: localBasicInfo.firstName,
                lastName: localBasicInfo.lastName || null,
                email: localBasicInfo.email,
                password: 'hashed',
                birthday: localBasicInfo.birthday,
                age: calculateAge(localBasicInfo.birthday),
                // Gender & Orientation:
                gender: localProfileInfo.gender,
                sexualOrientation: localProfileInfo.sexualOrientation || 'heterosexual',
                // Demographic Details:
                languages: localProfileInfo.languages,
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
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            setIsUpdating(false);
            Alert.alert('Success!', 'Your account has been created!', [
                { text: 'OK', onPress: () => { } },
            ]);
        } catch (err) {
            setLocalError(`${err.message} ${Date.now()}`);
            setFinishing(false);
            setIsUpdating(false);
            console.error('Error finalizing sign up:', err);
        }
    };

    const uploadAllPhotos = async (photosArray, uid) => {
        // ... your upload logic here ...
    };

    // Render current step: pass local state and its setter to each step.
    const renderCurrentSubStep = () => {
        switch (subStep) {
            case 1:
                return (
                    <BasicInfoStep
                        basicInfo={localBasicInfo}
                        setBasicInfo={setLocalBasicInfo} // Notice: we're passing setBasicInfo now!
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
                    <EducationProfessionStep
                        profileInfo={localProfileInfo}
                        setProfileInfo={setLocalProfileInfo}
                        colors={colors}
                    />
                );
            case 7:
                return (
                    <View>
                        <PhotosStep
                            profileInfo={localProfileInfo}
                            setProfileInfo={setLocalProfileInfo}
                            colors={colors}
                        />
                        <BioStep
                            profileInfo={localProfileInfo}
                            setProfileInfo={setLocalProfileInfo}
                            colors={colors}
                        />
                        <InterestsStep
                            profileInfo={localProfileInfo}
                            setProfileInfo={setLocalProfileInfo}
                            colors={colors}
                        />
                    </View>
                );
            case 8:
                return (
                    <PersonalityLifestyleStep
                        profileInfo={localProfileInfo}
                        setProfileInfo={setLocalProfileInfo}
                        colors={colors}
                    />
                );
            case 9:
                return (
                    <DatingPreferencesStep
                        profileInfo={localProfileInfo}
                        setProfileInfo={setLocalProfileInfo}
                        colors={colors}
                    />
                );
            case 10:
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