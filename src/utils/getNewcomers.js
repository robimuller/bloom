// src/utils/getNewcomers.js

/**
 * Filters profiles to only those created within the last X days.
 * @param {Array} profiles - The list of profiles from your database.
 * @param {number} days - Number of days to consider someone a "newcomer."
 * @returns {Array} - Filtered list of newcomer profiles.
 */
export function getNewcomers(profiles, days = 7) {
    const now = new Date();
    const cutoffDate = new Date(now);
    cutoffDate.setDate(now.getDate() - days); // e.g., 7 days ago

    return profiles.filter(profile => {
        if (!profile.createdAt) return false;
        const createdAtDate = new Date(profile.createdAt);
        return createdAtDate >= cutoffDate;
    });
}