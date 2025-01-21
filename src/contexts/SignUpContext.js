// src/contexts/SignUpContext.js
import React, { createContext, useState } from 'react';

// We'll store partial sign-up data across multiple steps
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
        // pictures, etc.
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

    // Step 5: If you want, store some "verification" status or code
    const [verificationStatus, setVerificationStatus] = useState(null);

    // Update Basic Info
    const updateBasicInfo = (updates) => {
        setBasicInfo((prev) => ({ ...prev, ...updates }));
    };

    // Update Profile Info
    const updateProfileInfo = (updates) => {
        setProfileInfo((prev) => ({ ...prev, ...updates }));
    };

    // Update Preferences
    const updatePreferences = (updates) => {
        setPreferences((prev) => ({ ...prev, ...updates }));
    };

    // Update Permissions
    const updatePermissions = (updates) => {
        setPermissions((prev) => ({ ...prev, ...updates }));
    };

    const resetSignUpData = () => {
        // If the user cancels or completes the flow
        setBasicInfo({ firstName: '', lastName: '', email: '', password: '', phone: '' });
        setProfileInfo({ birthday: '', gender: '', orientation: '', bio: '' });
        setPreferences({ ageRange: [18, 35], interests: [], eventTypes: [], geoRadius: 50 });
        setPermissions({ notifications: false, location: false, marketing: false, agreedToTerms: false });
        setVerificationStatus(null);
    };

    return (
        <SignUpContext.Provider
            value={{
                basicInfo,
                profileInfo,
                preferences,
                permissions,
                verificationStatus,
                updateBasicInfo,
                updateProfileInfo,
                updatePreferences,
                updatePermissions,
                setVerificationStatus,
                resetSignUpData,
            }}
        >
            {children}
        </SignUpContext.Provider>
    );
};
