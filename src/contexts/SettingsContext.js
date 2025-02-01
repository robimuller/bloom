// src/contexts/SettingsContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthContext } from './AuthContext';

export const SettingsContext = createContext();

export function SettingsProvider({ children }) {
    const { user } = useContext(AuthContext);
    const [settingsState, setSettingsState] = useState({
        bio: '',
        height: '',
        orientation: '',
        interests: [],
        education: '',
        ageRange: [18, 35],    // default
        photos: Array(6).fill(null), // 6 slots
    });

    useEffect(() => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    const newPhotos = data.photos || Array(6).fill(null);
                    setSettingsState((prev) => {
                        // Compare using JSON.stringify (or a deep equality check) to avoid updates when nothing changed
                        if (
                            JSON.stringify(prev.photos) !== JSON.stringify(newPhotos) ||
                            prev.bio !== (data.bio || '')
                        ) {
                            return {
                                ...prev,
                                bio: data.bio || '',
                                height: data.height || '',
                                orientation: data.orientation || '',
                                interests: data.interests || [],
                                education: data.education || '',
                                ageRange: data.ageRange || [18, 35],
                                photos: newPhotos,
                            };
                        }
                        return prev;
                    });
                }
            });
            return () => unsubscribe();
        }
    }, [user]);

    // Update a single field in the Firestore doc
    async function updateProfileField(fieldName, newValue) {
        if (!user) return;
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                [fieldName]: newValue,
            });
        } catch (error) {
            console.error('Error updating profile field:', error);
            throw error;
        }
    }

    // Update the entire "photos" array or just one slot
    async function updatePhotoAtIndex(index, newPhotoUrl) {
        if (!user) return;

        // Create a shallow copy of the current photos
        const updatedPhotos = [...settingsState.photos];
        updatedPhotos[index] = newPhotoUrl;

        // Then write to Firestore
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                photos: updatedPhotos
            });
        } catch (error) {
            console.error('Error updating photo:', error);
            throw error;
        }
    }

    return (
        <SettingsContext.Provider
            value={{
                settingsState,
                updateProfileField,
                updatePhotoAtIndex,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}