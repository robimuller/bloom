// src/contexts/UserProfileContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { AuthContext } from './AuthContext';
import { db } from '../../config/firebase';

export const UserProfileContext = createContext();

export const UserProfileProvider = ({ children }) => {
    const { user } = useContext(AuthContext); // current logged-in user
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    useEffect(() => {
        if (user) {
            fetchUserProfile();
        } else {
            setProfile(null);
        }
    }, [user]);

    const fetchUserProfile = async () => {
        setLoadingProfile(true);
        try {
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setProfile(docSnap.data());
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
        setLoadingProfile(false);
    };

    const updateProfile = async (updates) => {
        if (!user) return;
        try {
            const docRef = doc(db, 'users', user.uid);
            await updateDoc(docRef, updates);
            setProfile((prev) => ({ ...prev, ...updates }));
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <UserProfileContext.Provider
            value={{ profile, loadingProfile, fetchUserProfile, updateProfile }}
        >
            {children}
        </UserProfileContext.Provider>
    );
};
