// src/contexts/DatesContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import {
    collection,
    doc,
    query,
    where,
    onSnapshot,
    addDoc,
    getDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthContext } from './AuthContext';

export const DatesContext = createContext();

export const DatesProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [dates, setDates] = useState([]);
    const [loadingDates, setLoadingDates] = useState(false);

    // Fetch all open dates and merge host info
    const fetchOpenDates = () => {
        setLoadingDates(true);
        const datesRef = collection(db, 'dates');
        const q = query(datesRef, where('status', '==', 'open'));

        // Listen for changes in real time
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            // Map each doc to a promise that loads host user data
            const datePromises = snapshot.docs.map(async (docSnap) => {
                const dateData = { id: docSnap.id, ...docSnap.data() };

                // If you want host info, fetch from `users/{hostId}`
                if (dateData.hostId) {
                    const hostRef = doc(db, 'users', dateData.hostId);
                    const hostSnap = await getDoc(hostRef);
                    if (hostSnap.exists()) {
                        const hostData = hostSnap.data();
                        // Merge host info into the date object
                        dateData.host = {
                            displayName: hostData.displayName,
                            photos: hostData.photos || [],  // or any other fields you want
                            // etc...
                        };
                    }
                }

                return dateData;
            });

            // Wait for all host fetches to complete
            const enrichedDates = await Promise.all(datePromises);

            setDates(enrichedDates);
            setLoadingDates(false);
        });

        return unsubscribe;
    };

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
            throw error; // so the screen can handle it
        }
    };

    // NEW: a helper to file a report in Firestore
    const reportDate = async ({ dateId, hostId, reporterId, reasons }) => {
        try {
            const reportsRef = collection(db, 'reports');
            await addDoc(reportsRef, {
                dateId,
                hostId,
                reporterId,
                reasons, // array of strings
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error reporting date:', error);
            throw error;
        }
    };

    // You can choose whether you auto‐fetch in the provider or let screens call it
    useEffect(() => {
        // e.g. automatically subscribe to all open dates
        const unsub = fetchOpenDates();
        return () => unsub();
    }, [user]);

    return (
        <DatesContext.Provider value={{
            dates,
            loadingDates,
            reportDate,
            createDate,
            fetchOpenDates, // so any screen can call it again if needed
        }}>
            {children}
        </DatesContext.Provider>
    );
};