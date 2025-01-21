import React, { useEffect, useState, useContext } from 'react';
import { View, FlatList, Alert, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

import { db } from '../../../config/firebase';
import { AuthContext } from '../../contexts/AuthContext';
import { RequestsContext } from '../../contexts/RequestsContext'; // <-- new import

export default function WomenFeedScreen() {
    const { user } = useContext(AuthContext);
    const { sendRequest } = useContext(RequestsContext); // <--
    const [dates, setDates] = useState([]);

    useEffect(() => {
        // Listen to all "open" dates in Firestore
        // (Could also live in DatesContext)
        const datesRef = collection(db, 'dates');
        const q = query(datesRef, where('status', '==', 'open'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = [];
            snapshot.forEach((docSnap) => {
                fetched.push({ id: docSnap.id, ...docSnap.data() });
            });
            setDates(fetched);
        });

        return () => unsubscribe();
    }, []);

    const handleRequest = async (dateId, hostId) => {
        try {
            await sendRequest({ dateId, hostId });
            Alert.alert('Request Sent', 'Your request to join this date has been sent!');
        } catch (error) {
            console.error('Error requesting date:', error);
            Alert.alert('Error', 'Could not send request. Please try again.');
        }
    };

    const renderItem = ({ item }) => (
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
