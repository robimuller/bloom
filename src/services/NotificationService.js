// src/services/NotificationService.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getFirestore, doc, updateDoc } from 'firebase/firestore'; // Adjust import if needed

const db = getFirestore();

export async function registerForPushNotificationsAsync(userId) {
    let token;
    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }

        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('Expo Push Token:', token);

        // Optionally store token in Firestore (attached to user profile):
        if (userId) {
            await updateDoc(doc(db, 'users', userId), {
                expoPushToken: token,
            });
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
        });
    }

    return token;
}
