// seedInterestedWomen.js
const { db } = require('../config/firebaseAdmin');
const { faker } = require('@faker-js/faker');

async function seedInterestedWomen() {
    try {
        // Query all female users from the "users" collection.
        const femaleUsersSnapshot = await db.collection('users')
            .where('gender', '==', 'female')
            .get();

        const femaleUsers = [];
        femaleUsersSnapshot.forEach(doc => {
            femaleUsers.push({ userId: doc.id, ...doc.data() });
        });

        if (femaleUsers.length === 0) {
            console.log('No female users found to seed interestedWomen.');
            return;
        }

        // Query all promotions
        const promotionsSnapshot = await db.collection('promotions').get();
        const batch = db.batch();

        promotionsSnapshot.forEach(promoDoc => {
            // Randomly choose 1 or 2 interested women for each promotion.
            const numberInterested = faker.number.int({ min: 1, max: Math.min(26, femaleUsers.length) });
            // Use faker.helpers.arrayElements to randomly pick from femaleUsers.
            const selected = faker.helpers.arrayElements(femaleUsers, numberInterested);

            // Map each selected user to an object with userId and markedAt timestamp.
            const interestedWomen = selected.map(user => ({
                userId: user.userId,
                markedAt: new Date().toISOString()
            }));

            // Update the promotion document to include these interested women.
            batch.update(promoDoc.ref, { interestedWomen });
        });

        await batch.commit();
        console.log('Successfully seeded interestedWomen for promotions');
    } catch (error) {
        console.error('Error seeding interestedWomen:', error);
    }
}

seedInterestedWomen();