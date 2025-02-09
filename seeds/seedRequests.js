// seedRequests.js
const { db } = require('../config/firebaseAdmin'); // Firebase Admin config
const { faker } = require('@faker-js/faker');

async function seedRequests() {
    try {
        // Get all dates from the "dates" collection.
        const datesSnapshot = await db.collection('dates').get();
        const dates = [];
        datesSnapshot.forEach((doc) => {
            dates.push({ id: doc.id, ...doc.data() });
        });
        if (dates.length === 0) {
            console.log('No dates found. Please seed dates first.');
            return;
        }

        // Query female users from the "users" collection.
        const femaleUsersSnapshot = await db.collection('users').where('gender', '==', 'female').get();
        const femaleUsers = [];
        femaleUsersSnapshot.forEach((doc) => {
            femaleUsers.push({ id: doc.id, ...doc.data() });
        });
        if (femaleUsers.length === 0) {
            console.log('No female users found. Please seed female users first.');
            return;
        }

        // Set the number of requests to generate.
        const numberOfRequests = 20;
        const requestDocs = [];

        for (let i = 0; i < numberOfRequests; i++) {
            // Randomly select a date.
            const randomDate = dates[Math.floor(Math.random() * dates.length)];

            // Randomly select a female user as the requester (making sure she isn’t the host).
            let requester = femaleUsers[Math.floor(Math.random() * femaleUsers.length)];
            while (requester.id === randomDate.hostId && femaleUsers.length > 1) {
                requester = femaleUsers[Math.floor(Math.random() * femaleUsers.length)];
            }

            // Generate a random chat ID using the new API.
            const chatId = faker.string.uuid();
            const createdAt = new Date().toISOString();

            // If the date has a promotion attached, carry over the promotion reference.
            const promoAttached = randomDate.promoAttached || false;
            const promotionId = promoAttached ? randomDate.promotionId : null;

            // Randomly choose a status (most will be pending).
            const randomValue = Math.random();
            let status = 'pending';
            if (randomValue > 0.7 && randomValue <= 0.9) status = 'accepted';
            else if (randomValue > 0.9) status = 'rejected';

            // Build the request document.
            const requestData = {
                chatId,
                createdAt,
                dateId: randomDate.id,
                hostId: randomDate.hostId,
                requesterId: requester.id,
                status,
                // Promotion-related fields.
                promoAttached,
                ...(promoAttached && { promotionId })
            };

            requestDocs.push(requestData);
        }

        // Batch write the generated request documents to the "requests" collection.
        const batch = db.batch();
        requestDocs.forEach((requestData) => {
            const docRef = db.collection('requests').doc(); // Auto-generated document ID.
            batch.set(docRef, requestData);
        });

        await batch.commit();
        console.log(`Successfully seeded ${numberOfRequests} request documents`);
    } catch (error) {
        console.error('Error seeding requests:', error);
    }
}

seedRequests();