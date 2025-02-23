// src/utils/locationServices.js
import * as Location from 'expo-location';

export async function getCurrentLocation() {
    try {
        // Request permission
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Permission to access location was denied');
        }

        // Get current position
        const location = await Location.getCurrentPositionAsync({});

        // Reverse geocode the coordinates
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