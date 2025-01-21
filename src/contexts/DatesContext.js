// src/contexts/DatesContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthContext } from './AuthContext';

// src/contexts/DatesContext.js
export const DatesContext = createContext();

export const DatesProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [dates, setDates] = useState([]);
    const [loadingDates, setLoadingDates] = useState(false);

    // Example subscription fetching all dates
    const fetchAllDates = () => {
        setLoadingDates(true);
        const datesRef = collection(db, 'dates');
        const q = query(datesRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedDates = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setDates(fetchedDates);
            setLoadingDates(false);
        });

        return unsubscribe;
    };

    // Called from CreateDateScreen (or anywhere)
    const createDate = async (dateData) => {
        if (!user) return;
        try {
            const datesRef = collection(db, 'dates');
            await addDoc(datesRef, {
                ...dateData,
                hostId: user.uid,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error creating date:', error);
            throw error; // so screen can handle
        }
    };

    useEffect(() => {
        // Potentially auto-fetch, or fetch only in screens
        // fetchAllDates();
    }, [user]);

    return (
        <DatesContext.Provider value={{ dates, loadingDates, createDate, fetchAllDates }}>
            {children}
        </DatesContext.Provider>
    );
};
