// src/utils/recommendDateConcepts.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { openaiClient } from '../../config/openai';

const STORAGE_KEY_IDEAS = "featuredDateConcepts";
const STORAGE_KEY_DATE = "featuredDateConceptsDate";

export async function getFeaturedDateConcepts(userLocation) {
    const fallbackIdeas = [
        { title: "Sunset Picnic", description: "Plan a romantic picnic at a local park during sunset." },
        { title: "Art Gallery Hop", description: "Visit nearby galleries and enjoy creative conversations." },
        { title: "Food Truck Tour", description: "Explore the best food trucks in town for a unique culinary adventure." },
    ];

    // Check if we've already generated recommendations today
    try {
        const storedDateStr = await AsyncStorage.getItem(STORAGE_KEY_DATE);
        const todayStr = new Date().toDateString();

        if (storedDateStr && new Date(storedDateStr).toDateString() === todayStr) {
            const storedIdeasStr = await AsyncStorage.getItem(STORAGE_KEY_IDEAS);
            if (storedIdeasStr) {
                const storedIdeas = JSON.parse(storedIdeasStr);
                console.log("Using cached ideas:", storedIdeas);
                return storedIdeas;
            }
        }
    } catch (storageError) {
        console.log("Error reading storage:", storageError);
    }

    // If not available or expired, call GPT
    try {
        const completion = await openaiClient.chat.completions.create({
            model: 'gpt-4o-mini', // or your chosen GPT-4o model
            messages: [
                {
                    role: 'system',
                    content: `
                    You are a creative assistant that suggests 2 unique, creative date concepts for men to host based on the user's location and trending date ideas.
                    For each concept, provide a title and a brief description (1-2 sentences).
                    Output the result in valid JSON format as an array of objects, each with "title" and "description".
                    `,
                },
                {
                    role: 'user',
                    content: `User's location: ${userLocation}`,
                },
            ],
            max_tokens: 150,
            temperature: 0.7,
        });

        let text = completion.choices?.[0]?.message?.content?.trim();
        console.log("Raw GPT Response:", text);

        if (!text || text.length === 0) {
            console.log("No text returned from GPT, using fallback ideas.");
            return fallbackIdeas;
        }

        // Remove markdown code fences if present
        if (text.startsWith('```')) {
            text = text.split('\n').slice(1).join('\n').replace(/```$/, '').trim();
        }
        console.log("Processed GPT Response:", text);

        // Ensure text starts with '[' for valid JSON
        if (!text.startsWith('[')) {
            console.log("GPT response does not appear to be valid JSON. Returning fallback ideas.");
            return fallbackIdeas;
        }

        // Patch incomplete JSON by ensuring the text ends with a closing bracket
        if (!text.endsWith(']')) {
            const lastClosingBrace = text.lastIndexOf('}');
            if (lastClosingBrace !== -1) {
                text = text.substring(0, lastClosingBrace + 1) + ']';
                console.log("Patched GPT Response:", text);
            }
        }

        let ideas;
        try {
            ideas = JSON.parse(text);
            console.log("Parsed Ideas:", ideas);
        } catch (parseError) {
            console.log("JSON parsing error after patching, using fallback ideas. Error:", parseError);
            ideas = fallbackIdeas;
        }

        // Cache the recommendations along with today's date
        try {
            await AsyncStorage.setItem(STORAGE_KEY_IDEAS, JSON.stringify(ideas));
            await AsyncStorage.setItem(STORAGE_KEY_DATE, new Date().toISOString());
        } catch (storageError) {
            console.log("Error saving to storage:", storageError);
        }

        return ideas;
    } catch (error) {
        console.log("Error during GPT call, using fallback ideas. Error:", error);
        return fallbackIdeas;
    }
}