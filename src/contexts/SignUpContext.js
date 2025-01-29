// src/contexts/SignUpContext.js
import React, { createContext, useState } from 'react';

export const SignUpContext = createContext();

export const SignUpProvider = ({ children }) => {
    const [basicInfo, setBasicInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
    });

    const [profileInfo, setProfileInfo] = useState({
        birthday: '',
        gender: '',
        orientation: '',
        bio: '',
        photos: [],
    });

    const [preferences, setPreferences] = useState({
        ageRange: [18, 35],
        interests: [],
        eventTypes: [],
        geoRadius: 50,
    });

    const [permissions, setPermissions] = useState({
        notifications: false,
        location: false,
        marketing: false,
        agreedToTerms: false,
    });

    const [locationInfo, setLocationInfo] = useState({
        coordinates: null,
        city: '',
    });

    const [verificationStatus, setVerificationStatus] = useState(null);
    const [finishing, setFinishing] = useState(false);

    const updateBasicInfo = (updates) => {
        setBasicInfo((prev) => ({ ...prev, ...updates }));
    };

    const updateProfileInfo = (updates) => {
        setProfileInfo((prev) => ({ ...prev, ...updates }));
    };

    const updatePreferences = (updates) => {
        setPreferences((prev) => ({ ...prev, ...updates }));
    };

    const updatePermissions = (updates) => {
        setPermissions((prev) => ({ ...prev, ...updates }));
    };

    const updateLocationInfo = (updates) => {
        setLocationInfo((prev) => ({ ...prev, ...updates }));
    };

    const resetSignUpData = () => {
        setBasicInfo({ firstName: '', lastName: '', email: '', password: '', phone: '' });
        setProfileInfo({ birthday: '', gender: '', orientation: '', bio: '' });
        setPreferences({ ageRange: [18, 35], interests: [], eventTypes: [], geoRadius: 50 });
        setPermissions({ notifications: false, location: false, marketing: false, agreedToTerms: false });
        setLocationInfo({ coordinates: null, city: '' });
        setVerificationStatus(null);
    };

    return (
        <SignUpContext.Provider
            value={{
                basicInfo,
                profileInfo,
                preferences,
                permissions,
                locationInfo,
                verificationStatus,
                finishing,
                setFinishing,
                updateBasicInfo,
                updateProfileInfo,
                updatePreferences,
                updatePermissions,
                updateLocationInfo,
                setVerificationStatus,
                resetSignUpData,
            }}
        >
            {children}
        </SignUpContext.Provider>
    );
};