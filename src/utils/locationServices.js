// src/utils/locationServices.js
import * as Location from 'expo-location';

/**
 * getCurrentLocation
 *
 * Requests foreground location permissions, gets the current coordinates,
 * and reverse geocodes them to return a human-readable address string.
 *
 * @returns {Promise<string>} A string like "City, Country"
 * @throws {Error} If permission is denied or any error occurs.
 */
export async function getCurrentLocation() {
    try {
        // Request permission to access the device's location.
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Permission to access location was denied');
        }

        // Get the current position.
        const location = await Location.getCurrentPositionAsync({});

        // Reverse geocode the coordinates to an address.
        const [address] = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        });

        // Construct a simple location string.
        const city = address.city || address.region || 'Unknown';
        const country = address.country || '';
        return `${city}, ${country}`;

    } catch (error) {
        console.error('Error getting current location:', error);
        throw error;
    }
}