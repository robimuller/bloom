// seedPromotions.js
const { db } = require('../config/firebaseAdmin'); // Firebase Admin config
const { faker } = require('@faker-js/faker');

// Main seeding function for promotion documents
async function seedPromotions() {
    try {
        const numberOfPromotions = 15;
        const promotionDocs = [];

        for (let i = 0; i < numberOfPromotions; i++) {
            // Choose a random title from a list of promotional options.
            const titleOptions = [
                "15% off at Joe's Coffee",
                "Win tickets to the big game",
                "Dinner discount at Bella's Restaurant",
                "Romantic dinner offer",
                "20% off your meal",
                "Buy one get one free dessert",
                "Special weekend brunch offer",
                "Exclusive cocktail discount",
                "50% off your first drink",
                "Free appetizer with entree purchase"
            ];
            const title = titleOptions[Math.floor(Math.random() * titleOptions.length)];

            // Generate additional fields using faker
            const description = faker.lorem.sentence();
            const discountPercentage = faker.number.int({ min: 5, max: 50 });

            // Use faker.random.uuid() instead of faker.datatype.uuid()
            const businessId = faker.string.uuid();

            const businessName = faker.company.name();

            // Generate an array of placeholder photo URLs.
            const photos = [
                `https://picsum.photos/seed/promotion${i}a/300/200`,
                `https://picsum.photos/seed/promotion${i}b/300/200`,
                `https://picsum.photos/seed/promotion${i}c/300/200`
            ];

            // Generate a start date and an end date (ensuring endDate is after startDate)
            const startDateObj = faker.date.recent(); // Use a recent date as start date
            const endDateObj = faker.date.future({ years: 1, refDate: startDateObj });

            // Format the dates as "YYYY-MM-DD"
            const startDate = startDateObj.toISOString().split('T')[0];
            const endDate = endDateObj.toISOString().split('T')[0];

            // Generate a formatted creation date.
            const createdAt = formatCreatedAt(new Date());

            // For seeding purposes, mark the promotion as active.
            const active = true;

            // Terms and conditions for the promotion.
            const terms = "Terms and conditions apply. See details at the business location.";

            // Build the promotion document data with extra interaction fields.
            const promotionData = {
                title,
                description,
                discountPercentage,
                businessName,
                businessId,
                photos,
                startDate,
                endDate,
                createdAt,
                active,
                terms,
                // Extra fields to track interactions:
                interestedWomen: [],  // Will later store objects like { userId, markedAt }
                attachedInvites: []     // Will later store objects like { inviteId, manId, womanId, status, attachedAt }
            };

            promotionDocs.push(promotionData);
        }

        // Batch write the generated promotion documents to the "promotions" collection.
        const batch = db.batch();
        promotionDocs.forEach((promotionData) => {
            const docRef = db.collection('promotions').doc(); // Auto-generated document ID.
            batch.set(docRef, promotionData);
        });

        await batch.commit();
        console.log(`Successfully seeded ${numberOfPromotions} promotion documents`);
    } catch (error) {
        console.error('Error seeding promotions:', error);
    }
}

// Helper function to format a Date object as "3 February 2025 at 00:01:35 UTC+1"
function formatCreatedAt(date) {
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const timeStr = date.toLocaleTimeString('en-GB', { hour12: false });
    const timezoneOffset = -date.getTimezoneOffset() / 60;
    const timezoneStr = `UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}`;
    return `${day} ${month} ${year} at ${timeStr} ${timezoneStr}`;
}

// Execute the seeding function.
seedPromotions();