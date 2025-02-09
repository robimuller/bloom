// seedDates.js
const { db } = require('../config/firebaseAdmin'); // Firebase Admin config
const { faker } = require('@faker-js/faker');

// Main seeding function for date documents
async function seedDates() {
    try {
        // Query male users from the "users" collection.
        const maleUsersSnapshot = await db.collection('users').where('gender', '==', 'male').get();
        const maleUserIds = [];
        maleUsersSnapshot.forEach((doc) => {
            maleUserIds.push(doc.id);
        });

        if (maleUserIds.length === 0) {
            console.log('No male users found. Please seed male users first.');
            return;
        }

        // Set to generate 20 date documents.
        const numberOfDates = 20;
        const dateDocs = [];

        for (let i = 0; i < numberOfDates; i++) {
            // Randomly select a male user as the host.
            const hostId = maleUserIds[Math.floor(Math.random() * maleUserIds.length)];

            const category = "Uncategorized";

            // Generate a random future date and format it for createdAt.
            const createdDate = faker.date.future({ years: 1 });
            const createdAt = formatCreatedAt(createdDate);

            // Generate a random event date in the format "YYYY-MM-DD".
            const eventDate = faker.date.future({ years: 1 });
            const dateStr = eventDate.toISOString().split('T')[0];

            const details = "";
            // Create a fake location (e.g., "Barcelona, Sutton").
            const location = `${faker.location.city()}, ${faker.location.street()}`;

            // Generate an array of placeholder photo URLs.
            const photos = [
                `https://picsum.photos/seed/date${i}a/300/200`,
                `https://picsum.photos/seed/date${i}b/300/200`,
                `https://picsum.photos/seed/date${i}c/300/200`
            ];

            // Generate a random request count between 0 and 10.
            const requestCount = faker.number.int({ min: 0, max: 10 });

            const status = "open";

            // Generate a random time string in 12-hour format.
            const randomHour = faker.number.int({ min: 0, max: 23 });
            const randomMinute = faker.number.int({ min: 0, max: 59 });
            const tempDate = new Date();
            tempDate.setHours(randomHour, randomMinute);
            const time = tempDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            });

            // Generate a random title by selecting from a predefined list.
            const possibleTitles = [
                "Gyere velem táncolni kérlek",
                "Találkozzunk egy kávéra",
                "Vágjunk bele egy közös kalandba",
                "Csináljunk valami különlegeset együtt",
                "Egy randira a parkba",
                "Moziba megyünk",
                "Vacsorázzunk egy romantikus étteremben",
                "Séta a városban",
                "Fedezzük fel a város rejtett kincseit",
                "Kiránduljunk a természetbe",
                "Főzzünk együtt egy finom vacsorát",
                "Közös bor- vagy sörkóstoló",
                "Látogassunk meg egy kiállítást",
                "Esti séta a folyóparton",
                "Játsszunk társasjátékot egy kávézóban",
                "Közös séta az állatkertben",
                "Csillagászat az éjszakai ég alatt",
                "Kávé és könyvek egy hangulatos könyvesboltban",
                "Kerékpártúra a városban",
                "Közös piknik a parkban",
                "Kávézás egy hangulatos kávézóban",
                "Látogatás egy múzeumban",
                "Közös moziélmény",
                "Jóga vagy meditáció együtt",
                "Közös kirándulás egy közeli városba",
                "Főzőtanfolyam egy közös tanulási élményként",
                "Táncóra egyetemi stílusban",
                "Látogassuk meg a helyi piacot",
                "Közös festés vagy kreatív workshop",
                "Kávézás és séta egy romantikus parkban",
                "Esti koncert vagy zenei előadás",
                "Vacsora egy hangulatos étteremben",
                "Közös sörözés egy helyi sörfőzdében",
                "Közös wellness élmény egy spa-ban",
                "Közös kirándulás a hegyekbe",
                "Városi túra és fotóséta",
                "Látogatás egy történelmi helyszínen",
                "Főzőverseny barátok között",
                "Közös táncóra",
                "Kávé és sütemény egy kis cukrászdában",
                "Közös kertészkedés vagy parkolás",
                "Esti sétálás a belvárosban",
                "Látogatás egy könyvtárban",
                "Közös művészeti workshop",
                "Színházi előadás megnézése",
                "Közös sétahajózás a városon",
                "Éjszakai városi túra",
                "Közös sportesemény megtekintése",
                "Közös kreatív fotózás",
                "Közös reggeli egy hangulatos bisztróban"
            ];
            const title = possibleTitles[Math.floor(Math.random() * possibleTitles.length)];

            // Build the date document data.
            const dateData = {
                category,
                createdAt,
                date: dateStr,
                details,
                hostId,
                location,
                photos,
                requestCount,
                status,
                time,
                title,
            };

            dateDocs.push(dateData);
        }

        // Batch write the generated date documents to the "dates" collection.
        const batch = db.batch();
        dateDocs.forEach((dateData) => {
            const docRef = db.collection('dates').doc(); // Auto-generated document ID.
            batch.set(docRef, dateData);
        });

        await batch.commit();
        console.log(`Successfully seeded ${numberOfDates} date documents`);
    } catch (error) {
        console.error('Error seeding dates:', error);
    }
}

// Helper function to format a Date object as
// "3 February 2025 at 00:01:35 UTC+1"
function formatCreatedAt(date) {
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    // Format time as 24-hour time, e.g., "00:01:35"
    const timeStr = date.toLocaleTimeString('en-GB', { hour12: false });
    // Calculate the timezone offset in hours.
    const timezoneOffset = -date.getTimezoneOffset() / 60;
    const timezoneStr = `UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}`;
    return `${day} ${month} ${year} at ${timeStr} ${timezoneStr}`;
}

// Execute the seeding function.
seedDates();