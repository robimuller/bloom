// src/contexts/DatesContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import {
    collection,
    doc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    addDoc,
    getDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthContext } from './AuthContext';

export const DatesContext = createContext();

export const DatesProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [dates, setDates] = useState([]);
    const [loadingDates, setLoadingDates] = useState(false);

    /**
     * Fetch "Discover" dates – i.e., all open dates.
     */
    const fetchDiscoverDates = () => {
        setLoadingDates(true);
        const datesRef = collection(db, 'dates');
        // "Discover": show all dates where status is "open"
        const q = query(datesRef, where('status', '==', 'open'));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const datePromises = snapshot.docs.map(async (docSnap) => {
                const dateData = { id: docSnap.id, ...docSnap.data() };
                if (dateData.hostId) {
                    const hostRef = doc(db, 'users', dateData.hostId);
                    const hostSnap = await getDoc(hostRef);
                    if (hostSnap.exists()) {
                        const hostData = hostSnap.data();
                        dateData.host = {
                            displayName: hostData.displayName,
                            photos: hostData.photos || [],
                            birthday: hostData.birthday,
                            email: hostData.email,
                        };
                    }
                }
                return dateData;
            });
            const enrichedDates = await Promise.all(datePromises);
            setDates(enrichedDates);
            setLoadingDates(false);
        });

        return unsubscribe;
    };

    /**
     * Fetch "Trending" dates – for example, dates that have a requestCount
     * of 50 or above. (Ensure that you have added and maintained a field
     * like `requestCount` on each date document.)
     */
    const fetchTrendingDates = () => {
        setLoadingDates(true);
        const datesRef = collection(db, 'dates');
        // Trending: open dates with requestCount >= 50, ordered by requestCount descending.
        const q = query(
            datesRef,
            where('status', '==', 'open'),
            where('requestCount', '>=', 1),
            orderBy('requestCount', 'desc'),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const datePromises = snapshot.docs.map(async (docSnap) => {
                const dateData = { id: docSnap.id, ...docSnap.data() };
                if (dateData.hostId) {
                    const hostRef = doc(db, 'users', dateData.hostId);
                    const hostSnap = await getDoc(hostRef);
                    if (hostSnap.exists()) {
                        const hostData = hostSnap.data();
                        dateData.host = {
                            displayName: hostData.displayName,
                            photos: hostData.photos || [],
                            birthday: hostData.birthday,
                            email: hostData.email,
                        };
                    }
                }
                return dateData;
            });
            const enrichedDates = await Promise.all(datePromises);
            setDates(enrichedDates);
            setLoadingDates(false);
        });

        return unsubscribe;
    };

    // Helper to file a report
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

    // Initially, subscribe to "Discover" dates
    useEffect(() => {
        const unsub = fetchDiscoverDates();
        return () => unsub();
    }, [user]);

    return (
        <DatesContext.Provider
            value={{
                dates,
                loadingDates,
                reportDate,
                fetchDiscoverDates,   // For the default "discover" filter
                fetchTrendingDates,   // For the "trending" filter
                // You can add additional functions for filters like latest, nearby, etc.
            }}
        >
            {children}
        </DatesContext.Provider>
    );
};