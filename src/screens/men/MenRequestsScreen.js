// src/screens/MenRequestsScreen.js
import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import {
    SegmentedButtons,
    Card,
    Text as PaperText,
    Button as PaperButton,
    useTheme,
} from 'react-native-paper';

import { AuthContext } from '../../contexts/AuthContext';
import { RequestsContext } from '../../contexts/RequestsContext';

export default function MenRequestsScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const { requests, acceptRequest, rejectRequest } = useContext(RequestsContext);

    const [statusFilter, setStatusFilter] = useState('pending');
    const paperTheme = useTheme();

    // Filter all requests from context for those matching statusFilter
    // (Men only see requests where hostId = user.uid, as set up in RequestsContext)
    const filteredRequests = requests.filter((req) => req.status === statusFilter);

    // Handle "Accept": create a chat, update request -> accepted
    const handleAccept = async (reqItem) => {
        try {
            const chatId = await acceptRequest(reqItem);
            // Navigate to Chat screen
            navigation.navigate('Chat', {
                chatId,
                dateId: reqItem.dateId,
                hostId: reqItem.hostId,
                requesterId: reqItem.requesterId,
            });
        } catch (error) {
            console.log('Error accepting request:', error);
        }
    };

    // Handle "Reject": update request -> rejected
    const handleReject = async (reqItem) => {
        try {
            await rejectRequest(reqItem);
        } catch (error) {
            console.log('Error rejecting request:', error);
        }
    };

    // If the request is already accepted, user can "Open Chat"
    const handleOpenChat = (reqItem) => {
        if (!reqItem.chatId) return;
        navigation.navigate('Chat', {
            chatId: reqItem.chatId,
            dateId: reqItem.dateId,
            hostId: reqItem.hostId,
            requesterId: reqItem.requesterId,
        });
    };

    const renderRequest = ({ item }) => {
        return (
            <Card style={[styles.card, { backgroundColor: paperTheme.colors.surface }]} mode="outlined">
                <Card.Title
                    title={`Requester: ${item.requesterId}`}
                    subtitle={`Date ID: ${item.dateId}`}
                    titleStyle={{ color: paperTheme.colors.text }}
                    subtitleStyle={{ color: paperTheme.colors.placeholder }}
                />
                <Card.Content>
                    <PaperText variant="bodyMedium" style={{ marginVertical: 4, color: paperTheme.colors.text }}>
                        Status: {item.status}
                    </PaperText>
                </Card.Content>

                <Card.Actions>
                    {statusFilter === 'pending' ? (
                        <>
                            <PaperButton
                                mode="contained"
                                onPress={() => handleAccept(item)}
                                style={[styles.button, { marginRight: 8 }]}
                                buttonColor="#4caf50" // Consider replacing with theme color
                                textColor="#fff"
                            >
                                Accept
                            </PaperButton>
                            <PaperButton
                                mode="contained"
                                onPress={() => handleReject(item)}
                                style={styles.button}
                                buttonColor="#f44336" // Consider replacing with theme color
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
                            style={styles.button}
                            buttonColor={paperTheme.colors.primary}
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
        <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
            <PaperText
                variant="headlineMedium"
                style={[styles.header, { color: paperTheme.colors.text }]}
            >
                Men Requests
            </PaperText>

            {/* Toggle between 'pending' and 'accepted' */}
            <SegmentedButtons
                value={statusFilter}
                onValueChange={setStatusFilter}
                buttons={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'accepted', label: 'Accepted' },
                ]}
                style={styles.segments}
                theme={{
                    colors: {
                        primary: paperTheme.colors.primary,
                        secondary: paperTheme.colors.secondary,
                        surface: paperTheme.colors.surface,
                        background: paperTheme.colors.background,
                        onSurface: paperTheme.colors.onSurface,
                    },
                }}
            />

            <FlatList
                data={filteredRequests}
                keyExtractor={(item) => item.id}
                renderItem={renderRequest}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    <PaperText style={{ color: paperTheme.colors.placeholder, alignSelf: 'center' }}>
                        No {statusFilter} requests available.
                    </PaperText>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    header: { marginBottom: 16 },
    segments: { marginBottom: 16 },
    card: { marginBottom: 12, width: '100%' },
    button: {
        // Optional: Define button styles if needed
    },
});
