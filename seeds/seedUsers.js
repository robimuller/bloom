// seedUsers.js
const { db } = require('../config/firebaseAdmin'); // Use the admin config instead of client config
const { faker } = require('@faker-js/faker');
const fetch = require('node-fetch'); // For Node versions < 18; Node 18+ may have global fetch

async function generateUser(gender) {
    try {
        // Request a single user with the specified gender from RandomUser API
        const response = await fetch(`https://randomuser.me/api/?gender=${gender}`);
        const data = await response.json();
        const user = data.results[0];

        // Extract values from RandomUser
        const firstName = user.name.first;
        const lastName = user.name.last;
        const displayName = `${firstName} ${lastName}`;
        const birthday = user.dob.date.split('T')[0]; // YYYY-MM-DD
        const email = user.email;
        const photoUrl = user.picture.large; // use the large version for the profile photo

        // Additional fields matching your Firebase schema
        const createdAt = new Date().toISOString();
        const updatedAt = new Date().toISOString();
        const bio = faker.lorem.sentence();
        const ageRange = "undefined - undefined";
        const geoRadius = 50;
        // Use the updated faker API:
        const height = faker.number.int({ min: 150, max: 200 });
        const interests = "Cooking, Gaming, Outdoors, Travel, Photography, Reading, Cycling, Movies, Fitness";
        const location = user.location.city;
        const notifications = false;
        const onboardingComplete = true;
        const orientation = "Bisexual";
        const signUpMethod = "email";

        const userData = {
            ageRange,
            bio,
            birthday,
            createdAt,
            displayName,
            email,
            firstName,
            gender: user.gender,
            geoRadius,
            height,
            interests,
            lastName,
            location,
            notifications,
            onboardingComplete,
            orientation,
            photos: [photoUrl],
            signUpMethod,
            updatedAt,
        };

        // Use randomuser's login.uuid as document ID
        const userId = user.login.uuid;
        return { userData, userId };
    } catch (error) {
        console.error(`Error generating ${gender} user:`, error);
        throw error;
    }
}

async function seedUsers() {
    const usersToSeed = [];

    // Generate 5 male and 5 female users.
    for (let i = 0; i < 5; i++) {
        const maleUser = await generateUser('male');
        const femaleUser = await generateUser('female');
        usersToSeed.push(maleUser, femaleUser);
    }

    // Use a batch write for efficiency.
    const batch = db.batch();
    usersToSeed.forEach(({ userData, userId }) => {
        const userDocRef = db.collection('users').doc(userId);
        batch.set(userDocRef, userData);
    });

    await batch.commit();
    console.log('Successfully seeded 10 users (5 male, 5 female)');
}

seedUsers()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Seeding failed:', error);
        process.exit(1);
    });