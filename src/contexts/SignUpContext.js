import React, { createContext, useState, useMemo, useCallback } from 'react';

export const SignUpContext = createContext();

export const SignUpProvider = ({ children }) => {
    const [basicInfo, setBasicInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        birthday: '',
    });

    const [profileInfo, setProfileInfo] = useState({
        gender: '',
        sexualOrientation: 'heterosexual',
        height: '',
        weight: '',
        languages: [],
        ethnicity: '',
        religion: '',
        city: '',
        state: '',
        country: '',
        coordinates: null,
        education: '',
        fieldOfStudy: '',
        occupation: '',
        income: '',
        photos: [],
        bio: '',
        interests: [],
        personalityTraits: [],
        lifestyle: {
            smoking: '',
            drinking: '',
            exercise: '',
            dietaryPreferences: '',
        },
        relationshipGoals: '',
        idealDateCategories: [],
        matchAgeRange: [25, 35],
        distance: '',
        preferredDateStyles: '',
        socialMediaLinks: { instagram: '', facebook: '' },
    });

    const [permissionsInfo, setPermissionsInfo] = useState({
        notifications: false,
        location: false,
        marketing: false,
        agreedToTerms: false,
    });

    // Memoize updater functions with useCallback
    const updateBasicInfo = useCallback((updates) => {
        setBasicInfo(prev => ({ ...prev, ...updates }));
    }, []);

    const updateProfileInfo = useCallback((updates) => {
        setProfileInfo(prev => ({ ...prev, ...updates }));
    }, []);

    const updatePermissionsInfo = useCallback((updates) => {
        setPermissionsInfo(prev => ({ ...prev, ...updates }));
    }, []);

    // Memoize the context value so it only changes when the actual state changes.
    const contextValue = useMemo(
        () => ({
            basicInfo,
            updateBasicInfo,
            profileInfo,
            updateProfileInfo,
            permissionsInfo,
            updatePermissionsInfo,
        }),
        [basicInfo, profileInfo, permissionsInfo, updateBasicInfo, updateProfileInfo, updatePermissionsInfo]
    );

    return (
        <SignUpContext.Provider value={contextValue}>
            {children}
        </SignUpContext.Provider>
    );
};