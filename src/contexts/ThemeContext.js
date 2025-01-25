// src/contexts/ThemeContext.js
import React, { createContext, useState, useMemo } from 'react';
import { lightTheme, darkTheme } from '../themes/theme';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // Start with 'light' or detect system preference
    const [themeMode, setThemeMode] = useState('light');

    // We’ll store a combined object containing the colors + mode
    const theme = useMemo(() => {
        return themeMode === 'light' ? lightTheme : darkTheme;
    }, [themeMode]);

    function toggleTheme() {
        setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    }

    return (
        <ThemeContext.Provider value={{ themeMode, theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
