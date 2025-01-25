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

            // Overwrite Paper's defaults with your tokens
            primary: baseTheme.primary,
            onPrimary: '#fff',          // text color on a primary background
            background: baseTheme.background,
            onBackground: baseTheme.text,
            surface: baseTheme.background,
            onSurface: baseTheme.text,

            // You can include these if you like:
            secondary: baseTheme.secondary,
            onSecondary: '#fff',

            // If you want to use your accent color for something:
            // tertiary: baseTheme.accent,
            // etc.
        },
        roundness: 10, // or any shape you prefer
    };
}
