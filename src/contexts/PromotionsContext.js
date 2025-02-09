// src/contexts/PromotionsContext.js
import React, { createContext, useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore'; // Import needed Firestore functions
import { db } from '../../config/firebase'; // Make sure this is the same Firebase config you use in DatesContext

export const PromotionsContext = createContext();

export const PromotionsProvider = ({ children }) => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch promotions from Firestore using the modular API.
    const fetchPromotions = async () => {
        try {
            const promotionsRef = collection(db, 'promotions'); // Use modular syntax
            const promotionsSnapshot = await getDocs(promotionsRef);
            const promotionsList = [];
            promotionsSnapshot.forEach((doc) => {
                promotionsList.push({ id: doc.id, ...doc.data() });
            });
            setPromotions(promotionsList);
        } catch (error) {
            console.error('Error fetching promotions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    return (
        <PromotionsContext.Provider value={{ promotions, loading, refreshPromotions: fetchPromotions }}>
            {children}
        </PromotionsContext.Provider>
    );
};