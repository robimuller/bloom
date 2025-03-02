import React, { useState, useContext, memo, useEffect, useRef } from 'react';
import {
    StyleSheet,
    FlatList,
    SectionList,
    View,
    Pressable,
    TouchableOpacity,
    LayoutAnimation,
    UIManager,
    Platform,
    Dimensions,
    Animated,
} from 'react-native';
import {
    Text as PaperText,
    Button as PaperButton,
    Divider,
    useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

// Firestore imports for our hook:
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebase';

import { AuthContext } from '../../contexts/AuthContext';
import { RequestsContext } from '../../contexts/RequestsContext';

const fallbackPhoto = 'https://via.placeholder.com/100?text=No+Photo';

// Enable LayoutAnimation on Android.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Custom hook to subscribe to the latest message for a given chatId.
 */
function useLastMessage(chatId) {
    const [lastMessage, setLastMessage] = useState(null);

    useEffect(() => {
        if (!chatId) return;
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const docSnap = snapshot.docs[0];
                setLastMessage({ id: docSnap.id, ...docSnap.data() });
            } else {
                setLastMessage(null);
            }
        });
        return () => unsubscribe();
    }, [chatId]);

    return lastMessage;
}

/**
 * Helper to format Firestore timestamps (or Date objects) into a locale string.
 */
function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
}

/**
 * Groups accepted requests by their createdAt timestamp into sections.
 */
function groupRequests(requests) {
    const groups = {};
    requests.forEach((request) => {
        const timestamp = request.createdAt;
        let groupLabel = 'Older';
        if (timestamp) {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            const now = new Date();
            const diffTime = now - date;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            if (diffDays < 1) {
                groupLabel = 'Today';
            } else if (diffDays < 7) {
                groupLabel = 'This Week';
            } else if (diffDays < 30) {
                groupLabel = 'This Month';
            } else {
                groupLabel = 'Older';
            }
        } else {
            groupLabel = 'No Date';
        }
        if (!groups[groupLabel]) groups[groupLabel] = [];
        groups[groupLabel].push(request);
    });

    const sections = Object.keys(groups).map((label) => ({
        title: label,
        data: groups[label].sort((a, b) => {
            const aTime =
                a.createdAt && a.createdAt.toMillis
                    ? a.createdAt.toMillis()
                    : new Date(a.createdAt).getTime();
            const bTime =
                b.createdAt && b.createdAt.toMillis
                    ? b.createdAt.toMillis()
                    : new Date(b.createdAt).getTime();
            return bTime - aTime;
        }),
    }));

    const order = ['Today', 'This Week', 'This Month', 'Older', 'No Date'];
    sections.sort((a, b) => order.indexOf(a.title) - order.indexOf(b.title));
    return sections;
}

/**
 * CustomTabBar renders a fancier, animated tab bar.
 */
const CustomTabBar = ({ activeTab, onChange }) => {
    const theme = useTheme();
    const { width } = Dimensions.get('window');
    const containerPadding = 32; // 16 on each side
    const tabWidth = (width - containerPadding) / 2;

    const indicator = useRef(new Animated.Value(activeTab === 'pending' ? 0 : tabWidth)).current;

    // Animate indicator on activeTab change.
    useEffect(() => {
        const toValue = activeTab === 'pending' ? 0 : tabWidth;
        Animated.spring(indicator, {
            toValue,
            useNativeDriver: false,
            speed: 20,
            bounciness: 10,
        }).start();
    }, [activeTab, indicator, tabWidth]);

    return (
        <View style={[styles.tabBarContainer, { backgroundColor: theme.colors.cardBackground }]}>
            <Animated.View
                style={[
                    styles.indicator,
                    {
                        backgroundColor: theme.colors.primary,
                        width: tabWidth,
                        transform: [{ translateX: indicator }],
                    },
                ]}
            />
            <TouchableOpacity
                style={styles.tabButton}
                onPress={() => onChange('pending')}
                activeOpacity={0.8}
            >
                <Icon name="bell" size={20} color={activeTab === 'pending' ? '#fff' : theme.colors.text} />
                <PaperText style={[styles.tabLabel, { color: activeTab === 'pending' ? '#fff' : theme.colors.text }]}>
                    Pending
                </PaperText>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.tabButton}
                onPress={() => onChange('accepted')}
                activeOpacity={0.8}
            >
                <Icon name="chat" size={20} color={activeTab === 'accepted' ? '#fff' : theme.colors.text} />
                <PaperText style={[styles.tabLabel, { color: activeTab === 'accepted' ? '#fff' : theme.colors.text }]}>
                    Accepted
                </PaperText>
            </TouchableOpacity>
        </View>
    );
};

export default function MenNotificationsScreen({ navigation }) {
    const { requests, acceptRequest, rejectRequest } = useContext(RequestsContext);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [expandedRequestId, setExpandedRequestId] = useState(null);
    const paperTheme = useTheme();

    // Animate expand/collapse.
    const toggleExpand = (requestId) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedRequestId((prev) => (prev === requestId ? null : requestId));
    };

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

    const handleReject = async (reqItem) => {
        try {
            await rejectRequest(reqItem);
        } catch (error) {
            console.log('Error rejecting request:', error);
        }
    };

    const handleOpenChat = (reqItem) => {
        if (!reqItem.chatId) return;
        navigation.navigate('Chat', {
            chatId: reqItem.chatId,
            dateId: reqItem.dateId,
            hostId: reqItem.hostId,
            requesterId: reqItem.requesterId,
        });
    };

    const pendingRequests = requests.filter((r) => r.status === 'pending');
    const acceptedRequests = requests.filter((r) => r.status === 'accepted');

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
                    <Icon name="arrow-left" size={24} color={paperTheme.colors.text} />
                </TouchableOpacity>
                <PaperText variant="headlineMedium" style={[styles.headerTitle, { color: paperTheme.colors.text }]}>
                    Notifications
                </PaperText>
            </View>

            {/* Custom Tab Bar */}
            <CustomTabBar activeTab={statusFilter} onChange={(tab) => {
                setExpandedRequestId(null);
                setStatusFilter(tab);
            }} />

            {statusFilter === 'accepted' ? (
                <SectionList
                    sections={groupRequests(acceptedRequests)}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <RequestItem
                            item={item}
                            statusFilter={statusFilter}
                            onToggleExpand={() => { }}
                            onAccept={handleAccept}
                            onReject={handleReject}
                            onOpenChat={handleOpenChat}
                        />
                    )}
                    renderSectionHeader={({ section: { title } }) => (
                        <PaperText style={[styles.sectionHeader, { color: paperTheme.colors.text }]}>{title}</PaperText>
                    )}
                    ItemSeparatorComponent={() => <Divider style={styles.divider} />}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        acceptedRequests.length === 0 && (
                            <PaperText style={{ alignSelf: 'center', marginTop: 20 }}>
                                No accepted requests available.
                            </PaperText>
                        )
                    }
                />
            ) : (
                <FlatList
                    data={pendingRequests}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <RequestItem
                            item={item}
                            isExpanded={expandedRequestId === item.id}
                            statusFilter={statusFilter}
                            onToggleExpand={() => toggleExpand(item.id)}
                            onAccept={handleAccept}
                            onReject={handleReject}
                            onOpenChat={handleOpenChat}
                        />
                    )}
                    ItemSeparatorComponent={() => <Divider style={styles.divider} />}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        pendingRequests.length === 0 && (
                            <PaperText style={{ alignSelf: 'center', marginTop: 20 }}>
                                No pending requests available.
                            </PaperText>
                        )
                    }
                />
            )}
        </SafeAreaView>
    );
}

/**
 * Renders a single request item.
 * - For pending requests: tapping toggles expansion to show details and action buttons.
 * - For accepted requests: a two‑row layout is shown (image on the left; name above chat preview on the right).
 */
const RequestItem = memo(function RequestItem({
    item,
    isExpanded,
    statusFilter,
    onToggleExpand,
    onAccept,
    onReject,
    onOpenChat,
}) {
    const { requesterDoc = {}, dateDoc = {} } = item;
    const photoUrl = requesterDoc.photos?.[0] || fallbackPhoto;
    const cacheKey = `avatar-${item.requesterId}`;
    const theme = useTheme();
    const lastMessage = useLastMessage(item.chatId);

    if (statusFilter === 'accepted') {
        return (
            <Pressable onPress={() => onOpenChat(item)} style={styles.acceptedRow}>
                <Image
                    source={{ uri: photoUrl }}
                    style={styles.profilePic}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    cacheKey={cacheKey}
                    transition={false}
                />
                <View style={styles.acceptedTextContainer}>
                    <PaperText style={styles.nameText}>
                        {requesterDoc.displayName || 'Unknown'}
                    </PaperText>
                    {lastMessage ? (
                        <PaperText
                            style={[styles.chatHistory, { color: theme.colors.secondary }]}
                            numberOfLines={1}
                        >
                            {lastMessage.text} • {formatTimestamp(lastMessage.createdAt)}
                        </PaperText>
                    ) : (
                        <PaperText style={[styles.chatHistory, { color: theme.colors.secondary }]}>
                            No messages yet.
                        </PaperText>
                    )}
                </View>
            </Pressable>
        );
    }

    // Pending request layout.
    return (
        <View style={styles.requestContainer}>
            <Pressable onPress={() => onToggleExpand(item.id)} style={styles.row}>
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
                        <PaperButton mode="outlined" onPress={() => onReject(item)} textColor="#f44336">
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
                    </View>
                </View>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    headerContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    headerBackButton: {
        padding: 8,
        zIndex: 2,
    },
    headerTitle: {
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '700',
        zIndex: 1,
    },
    tabBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 25,
        overflow: 'hidden',
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    tabLabel: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '600',
    },
    indicator: {
        position: 'absolute',
        height: '100%',
        borderRadius: 25,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: '700',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    divider: {
        marginVertical: 8,
    },
    requestContainer: {
        paddingVertical: 12,
        backgroundColor: 'transparent',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profilePic: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    expandedContainer: {
        paddingHorizontal: 12,
        paddingTop: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    acceptedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    acceptedTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    nameText: {
        fontSize: 16,
        fontWeight: '600',
    },
    chatHistory: {
        fontSize: 14,
        marginTop: 4,
    },
});