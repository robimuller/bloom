// src/contexts/LocationContext.js
import React, { createContext, useEffect, useState, useContext } from 'react';
import * as Location from 'expo-location';
import { AuthContext } from './AuthContext';
import { updateUserLocation } from '../utils/locationServices';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        let subscription;

        const startWatching = async () => {
            // Request permissions
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            // Start watching location changes
            subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 10000,    // Update at least every 10 seconds
                    distanceInterval: 50,     // Or when the user moves 50 meters
                },
                async (loc) => {
                    setLocation(loc);

                    try {
                        // Reverse geocode to obtain human-readable address data
                        const [address] = await Location.reverseGeocodeAsync({
                            latitude: loc.coords.latitude,
                            longitude: loc.coords.longitude,
                        });

                        const city = address.city || address.region || 'Unknown';
                        const state = address.region || '';
                        const country = address.country || '';

                        // Create a full location object
                        const locationData = {
                            city,
                            state,
                            country,
                            coordinates: loc.coords,
                        };

                        // Update Firestore with the full location data
                        if (user) {
                            await updateUserLocation(user.uid, locationData);
                        }
                    } catch (error) {
                        console.error('Error in reverse geocoding or updating Firestore:', error);
                    }
                }
            );
        };

        if (user) {
            startWatching();
        }

        // Cleanup on unmount
        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, [user]);

    return (
        <LocationContext.Provider value={{ location, errorMsg }}>
            {children}
        </LocationContext.Provider>
    );
};