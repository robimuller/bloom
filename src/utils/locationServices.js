// src/utils/locationServices.js
import * as Location from 'expo-location';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

/**
 * Fetches the current location and reverse geocodes it for a human-readable address.
 *
 * @returns {Promise<Object>} An object containing city, state, country, and coordinates.
 */
export async function getCurrentLocation() {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Permission to access location was denied');
        }
        const location = await Location.getCurrentPositionAsync({});
        const [address] = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        });
        const city = address.city || address.region || 'Unknown';
        const state = address.region || '';
        const country = address.country || '';
        return { city, state, country, coordinates: location.coords };
    } catch (error) {
        console.error('Error getting current location:', error);
        throw error;
    }
}

/**
 * Updates the user's Firestore document with the full location data.
 *
 * @param {string} uid - The user's unique ID.
 * @param {Object} locationData - The full location object containing city, state, country, and coordinates.
 * @returns {Promise<void>}
 */
export async function updateUserLocation(uid, locationData) {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            city: locationData.city,
            state: locationData.state,
            country: locationData.country,
            coordinates: locationData.coordinates,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error updating user location:', error);
        throw error;
    }
}

/**
 * Fetches the current location and then updates the user's Firestore document.
 *
 * @param {string} uid - The user's unique ID.
 * @returns {Promise<Object>} The latest location data.
 */
export async function updateLocationForUser(uid) {
    try {
        const locationData = await getCurrentLocation();
        await updateUserLocation(uid, locationData);
        return locationData;
    } catch (error) {
        console.error('Error updating location for user:', error);
        throw error;
    }
}