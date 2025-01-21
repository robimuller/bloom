// WomenFeedScreen.js
// This screen displays all "open" dates created by men. Women can tap "Request" to join a date.
// The request is stored in the "requests" collection in Firestore with status = "pending".
// We now use React Native Paper components (Card, Button, etc.) and Ionicons for an enhanced UI.

import React, { useEffect, useState, useContext } from 'react';
import { View, FlatList, Alert, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    setDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { AppContext } from '../../context/AppContext';

export default function WomenFeedScreen() {
    const { user } = useContext(AppContext); // current logged-in user (female)
    const [dates, setDates] = useState([]);
    const [unsubscribeDates, setUnsubscribeDates] = useState(null);

    useEffect(() => {
        // Listen to all "open" dates from the Firestore "dates" collection.
        const datesRef = collection(db, 'dates');
        const q = query(datesRef, where('status', '==', 'open'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = [];
            snapshot.forEach((docSnap) => {
                fetched.push({ id: docSnap.id, ...docSnap.data() });
            });
            setDates(fetched);
        });

        // Store the unsubscribe function in state, so we can clean up on unmount
        setUnsubscribeDates(() => unsubscribe);

        return () => {
            // Prevent memory leaks by unsubscribing the snapshot listener
            if (unsubscribeDates) unsubscribeDates();
        };
    }, []);

    // Handle when a woman requests to join a date
    const handleRequest = async (dateId, hostId) => {
        try {
            // doc(collection(db, 'requests')) will auto-generate a new doc ID
            const requestDocRef = doc(collection(db, 'requests'));

            await setDoc(requestDocRef, {
                dateId: dateId,
                hostId: hostId,
                requesterId: user.uid,  // current logged-in user (female)
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            Alert.alert('Request Sent', 'Your request to join this date has been sent!');
        } catch (error) {
            console.log('Error requesting date:', error);
            Alert.alert('Error', 'Could not send request. Please try again.');
        }
    };

    const renderItem = ({ item }) => {
        return (
            <Card style={styles.card}>
                <Card.Title title={item.title} subtitle={item.category} />
                <Card.Content>
                    <Paragraph>Location: {item.location}</Paragraph>
                    <Paragraph>Time: {item.time}</Paragraph>
                </Card.Content>
                <Card.Actions>
                    <Button
                        icon={() => <Ionicons name="paper-plane" size={18} color="#fff" />}
                        mode="contained"
                        onPress={() => handleRequest(item.id, item.hostId)}
                        style={styles.requestButton}
                        labelStyle={styles.requestButtonText}
                    >
                        Request
                    </Button>
                </Card.Actions>
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            <Title style={styles.header}>Available Dates</Title>
            <FlatList
                data={dates}
                keyExtractor={(date) => date.id}
                renderItem={renderItem}
                style={styles.list}
            />
        </View>
    );
}

// Example styling with Paper + custom colors
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    header: {
        fontSize: 24,
        marginBottom: 10,
    },
    list: {
        width: '100%',
    },
    card: {
        marginBottom: 12,
        elevation: 2, // subtle shadow for Android
    },
    requestButton: {
        backgroundColor: '#6c63ff',
    },
    requestButtonText: {
        color: '#fff',
    },
});
