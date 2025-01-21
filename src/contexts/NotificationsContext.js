// src/contexts/NotificationsContext.js
import React, { createContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../services/NotificationService';

export const NotificationsContext = createContext();

export const NotificationsProvider = ({ children, userId }) => {
    const [expoPushToken, setExpoPushToken] = useState(null);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (userId) {
            // Register device for push notifications and save the token in Firestore
            registerForPushNotificationsAsync(userId).then(token => {
                setExpoPushToken(token);
            });
        }

        // Handle incoming notifications
        const subscription = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        // Cleanup
        return () => {
            subscription.remove();
        };
    }, [userId]);

    return (
        <NotificationsContext.Provider value={{ expoPushToken, notification }}>
            {children}
        </NotificationsContext.Provider>
    );
};
