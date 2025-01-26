// src/themes/paper.js
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

/**
 * Returns a Paper theme object that merges your custom color tokens
 * with the standard MD3 Light/Dark themes.
 */
export function createPaperTheme(baseTheme, mode = 'light') {
    const paperBase = mode === 'light' ? MD3LightTheme : MD3DarkTheme;

    return {
        ...paperBase,
        colors: {
            ...paperBase.colors,
            primary: baseTheme.primary,
            onPrimary: '#fff',
            // Keep background from baseTheme
            background: baseTheme.background,
            onBackground: baseTheme.text,
            // Add this line:
            text: baseTheme.text,

            // Let surface be something else. Often surface is the "card" color in Paper.
            onSurface: baseTheme.text,

            // Keep a separate variable if you still want to call it cardBackground:
            cardBackground: baseTheme.cardBackground,

            // You can include these if you like:
            secondary: baseTheme.secondary,
            onSecondary: '#fff',

            // If you want to use your accent color for something:
            // tertiary: baseTheme.accent,
            // etc.
        },
        roundness: 5, // or any shape you prefer
    };
}
