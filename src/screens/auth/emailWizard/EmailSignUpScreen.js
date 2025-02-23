import React, { useState, useContext, useEffect, useRef } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Alert, ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
import SignUpLayout from '../../../components/SignUpLayout';
import { SignUpContext } from '../../../contexts/SignUpContext';
import { AuthContext } from '../../../contexts/AuthContext';
import { ThemeContext } from '../../../contexts/ThemeContext';
import BasicInfoStep from '../../../components/auth/BasicInfoStep';
import BirthdayStep from '../../../components/auth/BirthdayStep';
import GenderStep from '../../../components/auth/GenderStep';
import HeightBodyTypeStep from '../../../components/auth/HeightBodyTypeStep';
import PhotosStep from '../../../components/auth/PhotoStep';
import AgeRangeStep from '../../../components/auth/AgeRangeStep';
import InterestsStep from '../../../components/auth/InterestsStep';
import BioStep from '../../../components/auth/BioStep';
import GeoRadiusStep from '../../../components/auth/GeoRadiusStep';
import LocationStep from '../../../components/auth/LocationStep';
import NotificationsStep from '../../../components/auth/NotificationsStep';
import TermsStep from '../../../components/auth/TermsStep';
import PreviewStep from '../../../components/auth/PreviewStep';

const stepTitles = {
    1: 'Basic Info',
    2: 'Birthday',
    3: 'Gender',
    4: 'Height & Body Type',
    5: 'Photos',
    6: 'Age Range',
    7: 'Interests',
    8: 'Bio',
    9: 'Geo Radius',
    10: 'Location',
    11: 'Notifications',
    12: 'Terms & Conditions',
    13: 'Preview & Submit',
};

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export default function EmailSignUpScreen({ navigation }) {
    const [subStep, setSubStep] = useState(1);
    const [localError, setLocalError] = useState(null);
    const { finishing, setFinishing } = useContext(SignUpContext);
    const [isUpdating, setIsUpdating] = useState(false);
    const { colors } = useContext(ThemeContext);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const screenWidth = Dimensions.get('window').width;
    const dynamicTitle = stepTitles[subStep] || 'Create Your Account';
    const TOTAL_STEPS = 13;

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

    const handleFinish = async () => {
        setLocalError(null);
        setFinishing(true);
        setIsUpdating(true);
        try {
            const newUser = await emailSignup(basicInfo.email, basicInfo.password, basicInfo.firstName);
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
                lastName: basicInfo.lastName || null,
                email: basicInfo.email,
                birthday: profileInfo.birthday || null,
                gender: profileInfo.gender || null,
                bio: profileInfo.bio || null,
                height: profileInfo.height || null,
                bodyType: profileInfo.bodyType || null,
                showHeight: profileInfo.showHeight || false,
                showBodyType: profileInfo.showBodyType || false,
                ageRange: preferences.ageRange || [18, 35],
                interests: preferences.interests || [],
                geoRadius: preferences.geoRadius || 50,
                notifications: permissions.notifications || false,
                location: locationInfo.coordinates || null,
                photos: finalPhotoURLs,
                onboardingComplete: true,
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

    const renderCurrentSubStep = () => {
        switch (subStep) {
            case 1:
                return <BasicInfoStep basicInfo={basicInfo} updateBasicInfo={updateBasicInfo} shouldShakeField={shouldShakeField} colors={colors} />;
            case 2:
                return <BirthdayStep profileInfo={profileInfo} updateProfileInfo={updateProfileInfo} />;
            case 3:
                return <GenderStep profileInfo={profileInfo} updateProfileInfo={updateProfileInfo} colors={colors} basicInfo={basicInfo} />;
            case 4:
                return <HeightBodyTypeStep profileInfo={profileInfo} updateProfileInfo={updateProfileInfo} colors={colors} />;
            case 5:
                return <PhotosStep profileInfo={profileInfo} updateProfileInfo={updateProfileInfo} colors={colors} />;
            case 6:
                return <AgeRangeStep preferences={preferences} updatePreferences={updatePreferences} />;
            case 7:
                return <InterestsStep preferences={preferences} updatePreferences={updatePreferences} />;
            case 8:
                return <BioStep profileInfo={profileInfo} updateProfileInfo={updateProfileInfo} colors={colors} />;
            case 9:
                return <GeoRadiusStep preferences={preferences} updatePreferences={updatePreferences} />;
            case 10:
                return <LocationStep locationInfo={locationInfo} permissions={permissions} updatePermissions={updatePermissions} colors={colors} />;
            case 11:
                return <NotificationsStep permissions={permissions} updatePermissions={updatePermissions} colors={colors} />;
            case 12:
                return <TermsStep colors={colors} />;
            case 13:
                return <PreviewStep basicInfo={basicInfo} profileInfo={profileInfo} preferences={preferences} colors={colors} />;
            default:
                return <Text style={styles.errorText}>Error: Unknown step {subStep}</Text>;
        }
    };
    console.log(basicInfo)
    console.log(profileInfo)

    const validateCurrentStep = () => {
        switch (subStep) {
            case 1:
                if (!basicInfo.firstName.trim()) return 'Please enter your first name.';
                if (!basicInfo.email.includes('@')) return 'Please enter a valid email.';
                if (!basicInfo.password || !passwordRegex.test(basicInfo.password))
                    return 'Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character.';
                break;
            case 2:
                if (!profileInfo.birthday) return 'Please enter your birthday.';
                break;
            case 3:
                if (!profileInfo.gender) return 'Please select your gender.';
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
        Animated.timing(slideAnim, {
            toValue: -screenWidth,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setSubStep(prev => prev + 1);
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
            setSubStep(prev => prev - 1);
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
            onNext={handleNext}
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
