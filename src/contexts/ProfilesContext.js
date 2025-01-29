// src/contexts/ProfilesContext.js
import React, { createContext, useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const ProfilesContext = createContext();

export const ProfilesProvider = ({ children }) => {
    const [womenProfiles, setWomenProfiles] = useState([]);
    const [loadingWomen, setLoadingWomen] = useState(true);

    useEffect(() => {
        // 1) Reference the 'users' collection
        const usersRef = collection(db, 'users');
        // 2) Filter where gender == 'female'
        const q = query(usersRef, where('gender', '==', 'female'));

        // 3) Subscribe in real-time
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setWomenProfiles(data);
            setLoadingWomen(false);
        });

        // 4) Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return (
        <ProfilesContext.Provider
            value={{ womenProfiles, loadingWomen }}
        >
            {children}
        </ProfilesContext.Provider>
    );
};