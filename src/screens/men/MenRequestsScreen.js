import React, { useState, useContext, memo } from 'react';
import {
    StyleSheet,
    FlatList,
    View,
    Pressable
} from 'react-native';
import {
    SegmentedButtons,
    Card,
    Text as PaperText,
    Button as PaperButton,
    useTheme
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { AuthContext } from '../../contexts/AuthContext';
import { RequestsContext } from '../../contexts/RequestsContext';

const fallbackPhoto = 'https://via.placeholder.com/100?text=No+Photo';

export default function MenRequestsScreen({ navigation }) {
    const { requests, acceptRequest, rejectRequest } = useContext(RequestsContext);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [expandedRequestId, setExpandedRequestId] = useState(null);
    const paperTheme = useTheme();

    // Toggle the expanded view of a request card
    const toggleExpand = (requestId) => {
        setExpandedRequestId((prev) => (prev === requestId ? null : requestId));
    };

    // Accept a request and then navigate to the Chat screen
    const handleAccept = async (reqItem) => {
        try {
            const chatId = await acceptRequest(reqItem);
            // Navigate to the Chat screen after acceptance
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

    // Reject a request (remains on the same screen)
    const handleReject = async (reqItem) => {
        try {
            await rejectRequest(reqItem);
        } catch (error) {
            console.log('Error rejecting request:', error);
        }
    };

    // Open chat if a chatId exists
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
        // If the item doesn't match the filter, hide it without unmounting
        const visible = item.status === statusFilter;

        return (
            <View style={visible ? null : styles.hiddenContainer}>
                <RequestItem
                    item={item}
                    isExpanded={expandedRequestId === item.id}
                    onToggleExpand={() => toggleExpand(item.id)}
                    statusFilter={statusFilter}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onOpenChat={handleOpenChat}
                />
            </View>
        );
    };

    // Count how many requests match the filter for the empty list message
    const matchingCount = requests.filter((r) => r.status === statusFilter).length;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
            <PaperText variant="headlineMedium" style={styles.header}>
                Men Requests
            </PaperText>

            <SegmentedButtons
                value={statusFilter}
                onValueChange={setStatusFilter}
                buttons={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'accepted', label: 'Accepted' },
                ]}
            />

            <FlatList
                data={requests} // all requests are passed in
                keyExtractor={(item) => item.id}
                renderItem={renderRequest}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    matchingCount === 0 && (
                        <PaperText style={{ alignSelf: 'center', marginTop: 20 }}>
                            No {statusFilter} requests available.
                        </PaperText>
                    )
                }
            />
        </SafeAreaView>
    );
}

const RequestItem = memo(function RequestItem({
    item,
    isExpanded,
    onToggleExpand,
    statusFilter,
    onAccept,
    onReject,
    onOpenChat,
}) {
    const { requesterDoc = {}, dateDoc = {} } = item;
    const photoUrl = requesterDoc.photos?.[0] || fallbackPhoto;
    const cacheKey = `avatar-${item.requesterId}`;

    return (
        <Card style={styles.card} mode="outlined">
            <Pressable onPress={onToggleExpand} style={styles.row}>
                <Image
                    source={{ uri: photoUrl }}
                    style={styles.profilePic}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    cacheKey={cacheKey}
                    transition={false}
                />
                <PaperText style={{ marginLeft: 10 }}>
                    {requesterDoc.displayName || 'Unknown'}
                </PaperText>
            </Pressable>

            {isExpanded && (
                <View style={styles.expandedContainer}>
                    <PaperText>Title: {dateDoc.title ?? 'N/A'}</PaperText>
                    <PaperText>Location: {dateDoc.location ?? 'N/A'}</PaperText>
                    <PaperText>Category: {dateDoc.category ?? 'N/A'}</PaperText>

                    <View style={styles.buttonRow}>
                        {statusFilter === 'pending' ? (
                            <>
                                <PaperButton
                                    mode="outlined"
                                    onPress={() => onReject(item)}
                                    textColor="#f44336"
                                >
                                    Reject
                                </PaperButton>
                                <PaperButton
                                    mode="outlined"
                                    onPress={() => {
                                        if (item.chatId) {
                                            onOpenChat(item);
                                        } else {
                                            console.log('Chat is not available until the request is accepted.');
                                        }
                                    }}
                                >
                                    Chat
                                </PaperButton>
                                <PaperButton mode="contained" onPress={() => onAccept(item)}>
                                    Accept
                                </PaperButton>
                            </>
                        ) : (
                            <PaperButton mode="contained" onPress={() => onOpenChat(item)}>
                                Open Chat
                            </PaperButton>
                        )}
                    </View>
                </View>
            )}
        </Card>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        marginBottom: 16,
    },
    hiddenContainer: {
        height: 0,
        overflow: 'hidden',
    },
    card: {
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    profilePic: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    expandedContainer: {
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
});