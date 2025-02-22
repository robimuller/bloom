// src/contexts/ThemeContext.js
import React, { createContext, useState, useMemo, useContext } from 'react';
import { lightTheme, darkTheme } from '../themes/theme';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Temporarily default to dark mode.
  const [themeMode, setThemeMode] = useState('dark');

  // Memoize the theme colors based on the current theme mode.
  const theme = useMemo(() => {
    return themeMode === 'light' ? lightTheme : darkTheme;
  }, [themeMode]);

  // Toggle function remains available.
  function toggleTheme() {
    setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
  }

  // Here we provide a "colors" property (equal to our theme) for consistency.
  return (
    <ThemeContext.Provider value={{ themeMode, theme, colors: theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Create and export a custom hook to access the theme context.
export function useThemeContext() {
  return useContext(ThemeContext);
}