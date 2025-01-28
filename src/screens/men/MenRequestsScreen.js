// src/screens/men/MenRequestsScreen.js
import React, { useState, useContext } from 'react';
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

    // Only show requests matching the chosen filter
    const filteredRequests = requests.filter((req) => req.status === statusFilter);

    // Accept request => create chat => update doc
    const handleAccept = async (reqItem) => {
        try {
            const chatId = await acceptRequest(reqItem);
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

    // Reject request => update doc
    const handleReject = async (reqItem) => {
        try {
            await rejectRequest(reqItem);
        } catch (error) {
            console.log('Error rejecting request:', error);
        }
    };

    // Open chat for requests that were already accepted
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
        // We'll highlight any request that is still "pending"
        const isNew = item.status === 'pending';

        return (
            <Card
                mode="outlined"
                style={[
                    styles.card,
                    {
                        backgroundColor: isNew ? '#FFF8E1' : paperTheme.colors.surface,
                    },
                ]}
            >
                <Card.Title
                    title={`Requester: ${item.requesterId}`}
                    subtitle={`Date ID: ${item.dateId}`}
                    titleStyle={{ color: paperTheme.colors.text }}
                    subtitleStyle={{ color: paperTheme.colors.placeholder }}
                />
                <Card.Content>
                    {isNew && (
                        <PaperText style={{ color: 'red', fontWeight: 'bold' }}>
                            NEW REQUEST
                        </PaperText>
                    )}
                    <PaperText
                        variant="bodyMedium"
                        style={{ marginVertical: 4, color: paperTheme.colors.text }}
                    >
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
                                buttonColor="#4caf50"
                                textColor="#fff"
                            >
                                Accept
                            </PaperButton>
                            <PaperButton
                                mode="contained"
                                onPress={() => handleReject(item)}
                                style={styles.button}
                                buttonColor="#f44336"
                                textColor="#fff"
                            >
                                Reject
                            </PaperButton>
                        </>
                    ) : (
                        // If 'accepted', let user open the chat
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

            {/* Filter for "pending" or "accepted" */}
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
                    <PaperText
                        style={{ color: paperTheme.colors.placeholder, alignSelf: 'center' }}
                    >
                        No {statusFilter} requests available.
                    </PaperText>
                }
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
        width: '100%',
    },
    button: {
        // style as needed
    },
});