// MenRequestsScreen.js
import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';
import {
    SegmentedButtons,
    Card,
    Text as PaperText,
    Button as PaperButton,
    useTheme
} from 'react-native-paper';

import { db } from '../../../config/firebase';
import { AppContext } from '../../context/AppContext';

export default function MenRequestsScreen({ navigation }) {
    const { user } = useContext(AppContext);

    // 'pending' or 'accepted'
    const [statusFilter, setStatusFilter] = useState('pending');
    const [requests, setRequests] = useState([]);
    const theme = useTheme();

    useEffect(() => {
        if (!user) return;

        // Build query for 'pending' or 'accepted'
        const requestsRef = collection(db, 'requests');
        const q = query(
            requestsRef,
            where('hostId', '==', user.uid),
            where('status', '==', statusFilter)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = [];
            snapshot.forEach((docSnap) => {
                fetched.push({ id: docSnap.id, ...docSnap.data() });
            });
            setRequests(fetched);
        });

        return () => unsubscribe();
    }, [user, statusFilter]);

    // Accept request => create chat & update doc
    const handleAccept = async (reqItem) => {
        const { id, dateId, hostId, requesterId } = reqItem;
        try {
            // Create chat doc
            const chatRef = await addDoc(collection(db, 'chats'), {
                hostId,
                requesterId,
                dateId,
                createdAt: serverTimestamp(),
            });

            // Update request => accepted
            await updateDoc(doc(db, 'requests', id), {
                status: 'accepted',
                chatId: chatRef.id,
            });

            // Optionally navigate to chat right away
            navigation.navigate('Chat', {
                chatId: chatRef.id,
                dateId,
                hostId,
                requesterId
            });
        } catch (err) {
            console.log('Error accepting request:', err);
        }
    };

    // Reject request => status = 'rejected'
    const handleReject = async (reqItem) => {
        try {
            await updateDoc(doc(db, 'requests', reqItem.id), {
                status: 'rejected'
            });
        } catch (err) {
            console.log('Error rejecting request:', err);
        }
    };

    // Open existing chat
    const handleOpenChat = (reqItem) => {
        if (!reqItem.chatId) return;
        navigation.navigate('Chat', {
            chatId: reqItem.chatId,
            dateId: reqItem.dateId,
            hostId: reqItem.hostId,
            requesterId: reqItem.requesterId
        });
    };

    // Renders each request as a Paper Card
    const renderRequest = ({ item }) => {
        return (
            <Card style={styles.card} mode="outlined">
                <Card.Title
                    title={`Requester: ${item.requesterId}`}
                    subtitle={`DateID: ${item.dateId}`}
                />
                <Card.Content>
                    <PaperText variant="bodyMedium" style={{ marginVertical: 4 }}>
                        Status: {item.status}
                    </PaperText>
                </Card.Content>

                <Card.Actions>
                    {statusFilter === 'pending' ? (
                        <>
                            <PaperButton
                                mode="contained"
                                onPress={() => handleAccept(item)}
                                style={{ marginRight: 8 }}
                                buttonColor="#4caf50" // green
                                textColor="#fff"
                            >
                                Accept
                            </PaperButton>
                            <PaperButton
                                mode="contained"
                                onPress={() => handleReject(item)}
                                buttonColor="#f44336" // red
                                textColor="#fff"
                            >
                                Reject
                            </PaperButton>
                        </>
                    ) : (
                        // If 'accepted', show "Open Chat"
                        <PaperButton
                            mode="contained"
                            onPress={() => handleOpenChat(item)}
                            buttonColor={theme.colors.primary}
                            textColor="#fff"
                        >
                            Open Chat
                        </PaperButton>
                    )}
                </Card.Actions>
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            {/* Title */}
            <PaperText variant="headlineMedium" style={styles.header}>
                Men Requests
            </PaperText>

            {/* Segmented Buttons to toggle pending/accepted */}
            <SegmentedButtons
                value={statusFilter}
                onValueChange={setStatusFilter}
                buttons={[
                    {
                        value: 'pending',
                        label: 'Pending',
                    },
                    {
                        value: 'accepted',
                        label: 'Accepted',
                    },
                ]}
                style={styles.segments}
            />

            {/* List of requests */}
            <FlatList
                data={requests}
                keyExtractor={(item) => item.id}
                renderItem={renderRequest}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        marginBottom: 16,
    },
    segments: {
        marginBottom: 16,
    },
    card: {
        marginBottom: 12,
    },
});
