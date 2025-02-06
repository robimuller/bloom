// src/contexts/ThemeContext.js
import React, { createContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../themes/theme';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [themeMode, setThemeMode] = useState('light');

    // Load the theme from persistent storage when the component mounts.
    useEffect(() => {
        async function loadTheme() {
            try {
                const storedTheme = await AsyncStorage.getItem('themeMode');
                if (storedTheme) {
                    setThemeMode(storedTheme);
                }
            } catch (error) {
                console.error('Error loading theme from storage:', error);
            }
        }
        loadTheme();
    }, []);

    // Memoize the theme colors based on the current theme mode.
    const theme = useMemo(() => {
        return themeMode === 'light' ? lightTheme : darkTheme;
    }, [themeMode]);

    // Toggle the theme and store the new value persistently.
    async function toggleTheme() {
        const newTheme = themeMode === 'light' ? 'dark' : 'light';
        setThemeMode(newTheme);
        try {
            await AsyncStorage.setItem('themeMode', newTheme);
        } catch (error) {
            console.error('Error saving theme to storage:', error);
        }
    }

    return (
        <ThemeContext.Provider value={{ themeMode, theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}