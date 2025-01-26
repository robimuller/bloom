// src/screens/women/WomenHomeScreen.js
import React, { useEffect, useState, useContext } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, Title, Paragraph, Button, Card } from 'react-native-paper';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

import { db } from '../../../config/firebase';
import { AuthContext } from '../../contexts/AuthContext';
import { RequestsContext } from '../../contexts/RequestsContext';

export default function WomenHomeScreen() {
    const navigation = useNavigation();
    const paperTheme = useTheme();

    const { user } = useContext(AuthContext);
    const { sendRequest } = useContext(RequestsContext);

    const [dates, setDates] = useState([]);

    useEffect(() => {
        // Listen to all "open" dates in Firestore
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
        <SafeAreaView
            style={[styles.safeArea, { backgroundColor: paperTheme.colors.background }]}
            edges={['top']}
        >
            {/* Top Bar */}
            <View style={styles.topBar}>
                {/* Left: Settings */}
                <TouchableOpacity onPress={() => navigation.navigate('WomenSettings')}>
                    <Ionicons name="settings-outline" size={24} color={paperTheme.colors.text} />
                </TouchableOpacity>

                {/* Right: Requests */}
                <TouchableOpacity onPress={() => navigation.navigate('WomenRequests')}>
                    <Ionicons name="notifications-outline" size={24} color={paperTheme.colors.text} />
                </TouchableOpacity>
            </View>

            {/* Main content: show the feed */}
            <View style={styles.mainContent}>
                <Title style={[styles.header, { color: paperTheme.colors.text }]}>
                    Available Dates
                </Title>
                <FlatList
                    data={dates}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    mainContent: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    header: {
        fontSize: 24,
        marginBottom: 10,
    },
    list: {
        paddingBottom: 16,
    },
    card: {
        marginBottom: 12,
        elevation: 2, // subtle shadow on Android
    },
    requestButton: {
        backgroundColor: '#6c63ff',
    },
    requestButtonText: {
        color: '#fff',
    },
});
