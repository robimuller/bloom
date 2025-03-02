// src/utils/recommendProfiles.js

/**
 * Compute the number of common interests between two comma-separated interests strings.
 * @param {string} userInterests - The interests string from the current user.
 * @param {string} profileInterests - The interests string from the profile.
 * @returns {number} - Count of common interests.
 */
export const computeMutualInterests = (userInterests = '', profileInterests = '') => {
    // Helper function to convert input into an array of trimmed, lowercased strings.
    const processInterests = (interests) => {
        if (Array.isArray(interests)) {
            return interests.map(i => i.trim().toLowerCase());
        } else if (typeof interests === 'string') {
            return interests.split(',').map(i => i.trim().toLowerCase());
        }
        return [];
    };

    const userArray = processInterests(userInterests);
    const profileArray = processInterests(profileInterests);

    const userSet = new Set(userArray);
    const profileSet = new Set(profileArray);
    let mutualCount = 0;

    userSet.forEach(interest => {
        if (interest && profileSet.has(interest)) {
            mutualCount++;
        }
    });

    return mutualCount;
};

/**
 * Given an array of profiles and the current user's profile,
 * compute a recommendation score for each profile based solely on mutual interests.
 * Returns a sorted list with the highest score first.
 * 
 * @param {Array} profiles - Array of woman profiles.
 * @param {Object} currentUser - The current user's profile.
 * @returns {Array} - Sorted profiles based on recommendation score.
 */
export const getRecommendedProfiles = (profiles, currentUser) => {
    // For each profile, compute a recommendation score based on mutual interests.
    const recommendedProfiles = profiles.map(profile => {
        const mutualInterests = computeMutualInterests(currentUser.interests, profile.interests);
        return { ...profile, recommendationScore: mutualInterests };
    });

    // Sort profiles by the recommendation score in descending order.
    recommendedProfiles.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return recommendedProfiles;
};