// src/themes/paper.js
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const extendedFonts = {
    regular: {
        fontFamily: 'System',
        fontWeight: 'normal',
    },
    medium: {
        fontFamily: 'System',
        fontWeight: 'normal',
    },
    light: {
        fontFamily: 'System',
        fontWeight: 'normal',
    },
    thin: {
        fontFamily: 'System',
        fontWeight: 'normal',
    },
    headlineMedium: {
        fontFamily: 'System',
        fontWeight: 'normal',
        fontSize: 28, // Example value; adjust as needed
        letterSpacing: 0,
    },
    bodySmall: {
        fontFamily: 'System',
        fontWeight: 'normal',
        fontSize: 12, // Example value; adjust as needed
        letterSpacing: 0,
    },
    // Add additional variants if needed.
};

export function createPaperTheme(baseTheme, mode = 'light') {
    const paperBase = mode === 'light' ? MD3LightTheme : MD3DarkTheme;

    return {
        ...paperBase,
        colors: {
            ...paperBase.colors,
            primary: baseTheme.primary,
            onPrimary: '#fff',
            white: baseTheme.white,
            black: baseTheme.black,
            background: baseTheme.background,
            onBackground: baseTheme.text,
            text: baseTheme.text,
            onSurface: baseTheme.text,
            cardBackground: baseTheme.cardBackground,
            overlay: baseTheme.overlay,
            overlay2: baseTheme.overlay2,
            secondary: baseTheme.secondary,
            onSecondary: '#000',
            outline: baseTheme.outline,
            accent: baseTheme.accent,
            tertiary: baseTheme.tertiary,
            mainBackground: baseTheme.mainBackground,
        },
        roundness: 5,
        fonts: extendedFonts,
    };
}