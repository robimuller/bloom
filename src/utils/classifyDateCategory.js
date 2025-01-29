// src/utils/classifyDateCategory.js
import { openaiClient } from '../../config/openai';

export async function classifyDateCategory({ title, location }) {
    try {
        const completion = await openaiClient.chat.completions.create({
            model: 'gpt-4o-mini', // your chosen model
            messages: [
                {
                    role: 'system',
                    content: `
                    You are a helpful assistant that classifies an event into exactly ONE of the following categories:

                    1) Art & Culture
                    2) Fitness & Lifestyle
                    3) Food & Drinks
                    4) Entertainment
                    5) Outdoor
                    6) Party & Concerts
                    7) Travel & Wellness
                    8) Other

                    Output only the exact category name, with no extra text.
          `,
                },
                {
                    role: 'user',
                    content: `Title: ${title}\nLocation: ${location}\n\nWhich category fits best?`,
                },
            ],
            max_tokens: 10,
            temperature: 0.0,
        });

        // The model’s reply (as text):
        const category = completion.choices?.[0]?.message?.content?.trim();

        // Safety check in case the model returns something unexpected:
        const validCategories = [
            'Art & Culture',
            'Fitness & Lifestyle',
            'Food & Drinks',
            'Entertainment',
            'Outdoor',
            'Party & Concerts',
            'Travel & Wellness',
        ];

        if (validCategories.includes(category)) {
            return category;
        }

        // If model gave us an unexpected answer, default to something or set "Uncategorized"
        return 'Uncategorized';

    } catch (err) {
        console.error('Error classifying date:', err);
        return 'Uncategorized';
    }
}