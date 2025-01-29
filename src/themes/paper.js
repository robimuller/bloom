// src/themes/paper.js
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export function createPaperTheme(baseTheme, mode = 'light') {
    const paperBase = mode === 'light' ? MD3LightTheme : MD3DarkTheme;

    return {
        ...paperBase,
        colors: {
            ...paperBase.colors,
            primary: baseTheme.primary,
            onPrimary: '#fff',
            background: baseTheme.background,
            onBackground: baseTheme.text,
            text: baseTheme.text,
            onSurface: baseTheme.text,
            cardBackground: baseTheme.cardBackground,
            overlay: baseTheme.overlay,
            secondary: baseTheme.secondary,
            onSecondary: '#000',
            outline: baseTheme.outline,
            accent: baseTheme.accent,

            // NEW: carry over the gradient array
            mainBackground: baseTheme.mainBackground,
        },
        roundness: 5,
    };
}