// ChatScreen.js
import React, {
    useEffect,
    useState,
    useCallback,
    useContext,
    useLayoutEffect,
} from 'react';
import {
    View,
    ActivityIndicator,
    StyleSheet,
    Text,
    Keyboard,
    Modal,
    Pressable,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    collection,
    doc,
    addDoc,
    setDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    getDoc,
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { AuthContext } from '../../contexts/AuthContext';
import { useTheme, IconButton } from 'react-native-paper';
import { useHeaderHeight } from '@react-navigation/elements';
import { Image } from 'expo-image';

import TypingDots from './TypingDots'; // new bouncy animation

export default function ChatScreen({ route, navigation }) {
    const { user, userDoc } = useContext(AuthContext);
    const { chatId, dateId, hostId, requesterId } = route.params || {};
    const paperTheme = useTheme();
    const headerHeight = useHeaderHeight(); // precisely measure the header

    // Local state
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [otherUserDoc, setOtherUserDoc] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [dateDetails, setDateDetails] = useState(null);
    // (keyboardHeight state removed for Android)

    // Determine who the "other" person is
    const otherUserId = user?.uid === hostId ? requesterId : hostId;

    // Fetch other user info to display in header
    useEffect(() => {
        if (!otherUserId) return;
        const fetchOtherUser = async () => {
            try {
                const snap = await getDoc(doc(db, 'users', otherUserId));
                if (snap.exists()) {
                    setOtherUserDoc(snap.data());
                }
            } catch (error) {
                console.log('Error fetching other user doc:', error);
            }
        };
        fetchOtherUser();
    }, [otherUserId]);

    // Fetch date details for modal/hamburger menu
    useEffect(() => {
        if (!dateId) return;
        const fetchDateDetails = async () => {
            try {
                const dateSnap = await getDoc(doc(db, 'dates', dateId));
                if (dateSnap.exists()) {
                    setDateDetails(dateSnap.data());
                }
            } catch (error) {
                console.log('Error fetching date details:', error);
            }
        };
        fetchDateDetails();
    }, [dateId]);

    // Customize the header once we have otherUserDoc
    useLayoutEffect(() => {
        const backButton = () => (
            <IconButton
                icon="arrow-left"
                onPress={() => navigation.goBack()}
                iconColor={paperTheme.colors.text}
            />
        );

        const userPhoto = otherUserDoc?.photos?.[0];
        const userInitial = otherUserDoc?.firstName
            ? otherUserDoc.firstName.charAt(0).toUpperCase()
            : 'U';

        const PhotoOrInitial = () => (
            <View style={styles.headerAvatarContainer}>
                {userPhoto ? (
                    <Image
                        source={{ uri: userPhoto }}
                        style={styles.headerAvatarImage}
                        contentFit="cover"
                        transition={500} // optional fade/placeholder
                    />
                ) : (
                    <View
                        style={[
                            styles.headerAvatarPlaceholder,
                            { backgroundColor: paperTheme.colors.primary },
                        ]}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                            {userInitial}
                        </Text>
                    </View>
                )}
            </View>
        );

        const displayName = otherUserDoc?.firstName || 'Unknown';

        const hamburgerButton = () => (
            <IconButton
                icon="dots-vertical"
                onPress={() => setModalVisible(true)}
                iconColor={paperTheme.colors.text}
            />
        );

        navigation.setOptions({
            headerShown: true,
            headerLeft: backButton,
            headerTitle: () => (
                <View style={styles.headerTitleContainer}>
                    <PhotoOrInitial />
                    <Text style={[styles.headerName, { color: paperTheme.colors.text }]}>
                        {displayName}
                    </Text>
                </View>
            ),
            headerRight: hamburgerButton,
        });
    }, [navigation, otherUserDoc, paperTheme.colors.text]);

    // Subscribe to messages
    useEffect(() => {
        if (!chatId) return;
        const msgsRef = collection(db, 'chats', chatId, 'messages');
        const q = query(msgsRef, orderBy('createdAt', 'desc'));

        const unsubscribeMsgs = onSnapshot(q, (snapshot) => {
            const loaded = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                    _id: docSnap.id,
                    text: data.text,
                    createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                    user: data.user,
                };
            });
            setMessages(loaded);
        });

        // Subscribe to typing status
        const typingRef = collection(db, 'chats', chatId, 'typing');
        const unsubscribeTyping = onSnapshot(typingRef, (snapshot) => {
            const typingData = snapshot.docs
                .map((docSnap) => docSnap.data())
                .filter((docData) => docData.isTyping && docData.userId !== user.uid);
            setTypingUsers(typingData);
        });

        return () => {
            unsubscribeMsgs();
            unsubscribeTyping();
        };
    }, [chatId, user?.uid]);

    // Handle sending a message
    const onSend = useCallback(
        async (newMsgs = []) => {
            if (!chatId || !user) return;
            const msg = newMsgs[0];
            await addDoc(collection(db, 'chats', chatId, 'messages'), {
                text: msg.text,
                user: {
                    _id: user.uid,
                    name: userDoc?.displayName || 'Unknown',
                },
                createdAt: serverTimestamp(),
            });
        },
        [chatId, user, userDoc]
    );

    // Handle typing
    const handleTyping = async (currentText) => {
        if (!chatId || !user) return;
        const isTyping = currentText?.length > 0;
        await setDoc(doc(db, 'chats', chatId, 'typing', user.uid), {
            userId: user.uid,
            displayName: userDoc?.displayName || 'Someone',
            isTyping,
            updatedAt: serverTimestamp(),
        });
    };

    // Render the footer (typing indicator)
    const renderFooter = () => {
        if (!typingUsers.length) return null;
        const { displayName } = typingUsers[0];
        return (
            <View style={styles.footerContainer}>
                <Text style={styles.footerText}>{displayName} is typing</Text>
                <TypingDots dotColor="gray" style={{ marginLeft: 4 }} />
            </View>
        );
    };

    // Customize chat bubbles
    const renderBubble = (props) => {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: { backgroundColor: paperTheme.colors.primary },
                    left: { backgroundColor: paperTheme.dark ? '#444' : '#e6e6e6' },
                }}
                textStyle={{
                    right: { color: '#fff' },
                    left: { color: paperTheme.colors.text },
                }}
            />
        );
    };

    // Render custom avatar if desired
    const renderAvatar = (props) => {
        const name = props.currentMessage.user.name || 'U';
        const initial = name.charAt(0).toUpperCase();
        return (
            <View
                style={[
                    styles.avatarContainer,
                    { backgroundColor: paperTheme.colors.primary },
                ]}
            >
                <Text style={[styles.avatarInitial, { color: paperTheme.colors.background }]}>
                    {initial}
                </Text>
            </View>
        );
    };

    if (!chatId) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={paperTheme.colors.primary} />
            </View>
        );
    }

    return (
        <>
            {/* Date Details Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.modalContent,
                            { backgroundColor: paperTheme.colors.background },
                        ]}
                    >
                        <Text style={[styles.modalTitle, { color: paperTheme.colors.text }]}>
                            Date Details
                        </Text>
                        {dateDetails ? (
                            <>
                                <Text style={[styles.modalText, { color: paperTheme.colors.text }]}>
                                    Title: {dateDetails.title}
                                </Text>
                                <Text style={[styles.modalText, { color: paperTheme.colors.text }]}>
                                    Location: {dateDetails.location}
                                </Text>
                                <Text style={[styles.modalText, { color: paperTheme.colors.text }]}>
                                    Time: {dateDetails.time}
                                </Text>
                            </>
                        ) : (
                            <Text style={{ color: paperTheme.colors.placeholder }}>
                                No details available
                            </Text>
                        )}
                        <Pressable
                            style={[
                                styles.closeButton,
                                { backgroundColor: paperTheme.colors.primary },
                            ]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={{ color: '#fff' }}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/*
          On iOS we wrap the chat UI in a KeyboardAvoidingView to push the content up,
          whereas on Android we rely on "pan" mode and simply use a SafeAreaView.
        */}
            {Platform.OS === 'ios' ? (
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior="padding"
                    keyboardVerticalOffset={headerHeight}
                >
                    <SafeAreaView
                        style={[styles.safeArea, { backgroundColor: paperTheme.colors.background }]}
                        edges={['bottom', 'left', 'right']}
                    >
                        <GiftedChat
                            messages={messages}
                            onSend={(msgs) => onSend(msgs)}
                            user={{ _id: user.uid }}
                            onInputTextChanged={handleTyping}
                            renderFooter={renderFooter}
                            renderBubble={renderBubble}
                            renderAvatar={renderAvatar}
                            placeholder="Type a message..."
                            textInputStyle={{ color: paperTheme.colors.text }}
                            alwaysShowSend
                        />
                    </SafeAreaView>
                </KeyboardAvoidingView>
            ) : (
                <SafeAreaView
                    style={[styles.safeArea, { backgroundColor: paperTheme.colors.background }]}
                    edges={['left', 'right']} // Exclude bottom to avoid extra inset
                >
                    <View style={{ flex: 1 }}>
                        <GiftedChat
                            messages={messages}
                            onSend={(msgs) => onSend(msgs)}
                            user={{ _id: user.uid }}
                            onInputTextChanged={handleTyping}
                            renderFooter={renderFooter}
                            renderBubble={renderBubble}
                            renderAvatar={renderAvatar}
                            placeholder="Type a message..."
                            textInputStyle={{ color: paperTheme.colors.text }}
                            alwaysShowSend
                            bottomOffset={0}  // Ensure no extra bottom offset
                        />
                    </View>
                </SafeAreaView>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    safeArea: {
        flex: 1,
    },
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
        marginBottom: 6,
    },
    footerText: {
        marginRight: 4,
        fontStyle: 'italic',
    },
    avatarContainer: {
        borderRadius: 20,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    // Header styles
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatarContainer: {
        marginRight: 8,
    },
    headerAvatarImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    headerAvatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerName: {
        fontSize: 16,
        fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        padding: 20,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    modalText: {
        fontSize: 16,
        marginBottom: 8,
    },
    closeButton: {
        marginTop: 16,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        alignSelf: 'flex-end',
    },
});