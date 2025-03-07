// src/contexts/ProfilesContext.js
import React, { createContext, useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const ProfilesContext = createContext();

export const ProfilesProvider = ({ children }) => {
    const [womenProfiles, setWomenProfiles] = useState([]);
    const [loadingWomen, setLoadingWomen] = useState(true);
    const [menProfiles, setMenProfiles] = useState([]);
    const [loadingMen, setLoadingMen] = useState(true);

    useEffect(() => {
        const usersRef = collection(db, 'users');

        // Query for women profiles
        const qWomen = query(usersRef, where('gender', '==', 'female'));
        const unsubscribeWomen = onSnapshot(qWomen, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setWomenProfiles(data);
            setLoadingWomen(false);
        });

        // Query for men profiles
        const qMen = query(usersRef, where('gender', '==', 'male'));
        const unsubscribeMen = onSnapshot(qMen, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setMenProfiles(data);
            setLoadingMen(false);
        });

        // Cleanup both subscriptions on unmount
        return () => {
            unsubscribeWomen();
            unsubscribeMen();
        };
    }, []);

    return (
        <ProfilesContext.Provider
            value={{ womenProfiles, loadingWomen, menProfiles, loadingMen }}
        >
            {children}
        </ProfilesContext.Provider>
    );
};