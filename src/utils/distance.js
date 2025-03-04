// src/utils/distance.js

/**
 * Calculates the distance between two coordinates using the Haversine formula.
 * Both coordinate objects must contain `latitude` and `longitude` properties.
 *
 * @param {Object} origin - Coordinates of the starting point.
 * @param {Object} destination - Coordinates of the destination point.
 * @returns {number} Distance in kilometers.
 */
export const calculateDistance = (origin, destination) => {
  if (!origin || !destination) return 0;
  const toRad = (value) => (value * Math.PI) / 180;
  const lat1 = origin.latitude;
  const lon1 = origin.longitude;
  const lat2 = destination.latitude;
  const lon2 = destination.longitude;
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};