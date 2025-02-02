// src/utils/deduceAge.js

/**
 * Calculates age based on the birthday string in 'yyyy-mm-dd' format.
 * @param {string} birthday - The birthday string in 'yyyy-mm-dd' format.
 * @returns {number} - The calculated age.
 */
export function calculateAge(birthday) {
    if (!birthday) return null;

    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    // Adjust age if birthday hasn't occurred yet this year
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}