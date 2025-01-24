// src/screens/auth/emailWizard/EmailStep4.js
import React, { useState, useContext } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { AuthContext } from '../../../contexts/AuthContext';

export default function EmailStep4({ navigation }) {
    const { user } = useContext(AuthContext);
    const [locationGranted, setLocationGranted] = useState(false);
    const [coords, setCoords] = useState(null);
    const [allowNotifications, setAllowNotifications] = useState(false);

    const handleGetLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Location permission not granted.');
                return;
            }
            setLocationGranted(true);

            const { coords } = await Location.getCurrentPositionAsync({});
            setCoords(coords);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleNext = async () => {
        if (user) {
            await updateDoc(doc(db, 'users', user.uid), {
                location: coords
                    ? { lat: coords.latitude, lng: coords.longitude }
                    : null,
                allowNotifications,
                updatedAt: new Date().toISOString(),
            });
        }
        // Move to final confirmation
        navigation.navigate('EmailStep5');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Step 4: Location & Permissions</Text>

            <Button
                title={
                    locationGranted
                        ? 'Location Permission Granted'
                        : 'Request Location Permission'
                }
                onPress={handleGetLocation}
            />

            {coords && (
                <Text style={styles.info}>
                    Location: {coords.latitude}, {coords.longitude}
                </Text>
            )}

            <Button
                title={allowNotifications ? 'Disable Notifications' : 'Enable Notifications'}
                onPress={() => setAllowNotifications(!allowNotifications)}
            />

            <Button title="Next" onPress={handleNext} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 20, marginBottom: 16 },
    info: { marginVertical: 10 },
});
