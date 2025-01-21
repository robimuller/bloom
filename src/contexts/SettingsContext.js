// src/contexts/SettingsContext.js
import React, { createContext, useState } from 'react';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [theme, setTheme] = useState('light'); // or 'dark'
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const toggleNotifications = () => {
        setNotificationsEnabled((prev) => !prev);
    };

    return (
        <SettingsContext.Provider
            value={{
                theme,
                notificationsEnabled,
                toggleTheme,
                toggleNotifications,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};
