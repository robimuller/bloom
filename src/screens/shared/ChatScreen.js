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
    Text,
    StyleSheet,
    Keyboard,
    Platform,
    Modal,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import {
    GiftedChat,
    Bubble,
    InputToolbar,
    Composer,
    Send,
} from 'react-native-gifted-chat';
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
import { IconButton, useTheme } from 'react-native-paper';
import { useHeaderHeight } from '@react-navigation/elements';
import { Image } from 'expo-image';

import TypingDots from './TypingDots';

const ChatScreen = ({ route, navigation }) => {
    // Contexts and route params
    const { user, userDoc } = useContext(AuthContext);
    const { chatId, dateId, hostId, requesterId } = route.params || {};
    const paperTheme = useTheme();
    const headerHeight = useHeaderHeight();

    // Local state
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [otherUserDoc, setOtherUserDoc] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [dateDetails, setDateDetails] = useState(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    // Determine the "other" user ID
    const otherUserId = user?.uid === hostId ? requesterId : hostId;

    // Fetch other user info
    useEffect(() => {
        if (!otherUserId) return;
        const fetchOtherUser = async () => {
            try {
                const snap = await getDoc(doc(db, 'users', otherUserId));
                if (snap.exists()) {
                    setOtherUserDoc(snap.data());
                }
            } catch (error) {
                console.error('Error fetching other user:', error);
            }
        };
        fetchOtherUser();
    }, [otherUserId]);

    // Fetch date details for the modal
    useEffect(() => {
        if (!dateId) return;
        const fetchDateDetails = async () => {
            try {
                const dateSnap = await getDoc(doc(db, 'dates', dateId));
                if (dateSnap.exists()) {
                    setDateDetails(dateSnap.data());
                }
            } catch (error) {
                console.error('Error fetching date details:', error);
            }
        };
        fetchDateDetails();
    }, [dateId]);

    // Listen to keyboard events to adjust bottom offset
    useEffect(() => {
        const onKeyboardShow = (e) => setKeyboardHeight(e.endCoordinates.height);
        const onKeyboardHide = () => setKeyboardHeight(0);
        const showSub = Keyboard.addListener('keyboardDidShow', onKeyboardShow);
        const hideSub = Keyboard.addListener('keyboardDidHide', onKeyboardHide);
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    // Customize header: back button, avatar with name, and hamburger menu
    useLayoutEffect(() => {
        const renderBackButton = () => (
            <IconButton
                icon="arrow-left"
                onPress={() => navigation.goBack()}
                iconColor={paperTheme.colors.text}
            />
        );

        const userPhoto = otherUserDoc?.photos?.[0];
        const initial = otherUserDoc?.firstName
            ? otherUserDoc.firstName.charAt(0).toUpperCase()
            : 'U';

        const Avatar = () => (
            <View style={styles.avatarWrapper}>
                {userPhoto ? (
                    <Image
                        source={{ uri: userPhoto }}
                        style={styles.avatarImage}
                        contentFit="cover"
                        transition={500}
                    />
                ) : (
                    <View
                        style={[
                            styles.avatarPlaceholder,
                            { backgroundColor: paperTheme.colors.primary },
                        ]}
                    >
                        <Text style={styles.avatarText}>{initial}</Text>
                    </View>
                )}
            </View>
        );

        const renderTitle = () => (
            <View style={styles.headerTitle}>
                <Avatar />
                <Text style={[styles.headerName, { color: paperTheme.colors.text }]}>
                    {otherUserDoc?.firstName || 'Unknown'}
                </Text>
            </View>
        );

        const renderHamburger = () => (
            <IconButton
                icon="dots-vertical"
                onPress={() => setModalVisible(true)}
                iconColor={paperTheme.colors.text}
            />
        );

        navigation.setOptions({
            headerLeft: renderBackButton,
            headerTitle: renderTitle,
            headerRight: renderHamburger,
        });
    }, [navigation, otherUserDoc, paperTheme]);

    // Subscribe to chat messages and typing status updates
    useEffect(() => {
        if (!chatId) return;

        const msgsRef = collection(db, 'chats', chatId, 'messages');
        const msgsQuery = query(msgsRef, orderBy('createdAt', 'desc'));
        const unsubscribeMsgs = onSnapshot(msgsQuery, (snapshot) => {
            const loadedMsgs = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                    _id: docSnap.id,
                    text: data.text,
                    createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                    user: data.user,
                };
            });
            setMessages(loadedMsgs);
        });

        const typingRef = collection(db, 'chats', chatId, 'typing');
        const unsubscribeTyping = onSnapshot(typingRef, (snapshot) => {
            const activeTypers = snapshot.docs
                .map((docSnap) => docSnap.data())
                .filter((d) => d.isTyping && d.userId !== user.uid);
            setTypingUsers(activeTypers);
        });

        return () => {
            unsubscribeMsgs();
            unsubscribeTyping();
        };
    }, [chatId, user?.uid]);

    // Handler to send messages
    const onSend = useCallback(
        async (newMessages = []) => {
            if (!chatId || !user) return;
            const message = newMessages[0];
            try {
                await addDoc(collection(db, 'chats', chatId, 'messages'), {
                    text: message.text,
                    user: {
                        _id: user.uid,
                        name: userDoc?.displayName || 'Unknown',
                    },
                    createdAt: serverTimestamp(),
                });
            } catch (error) {
                console.error('Error sending message:', error);
            }
        },
        [chatId, user, userDoc]
    );

    // Update typing indicator in Firestore
    const handleTyping = async (text) => {
        if (!chatId || !user) return;
        const isTyping = text && text.length > 0;
        try {
            await setDoc(doc(db, 'chats', chatId, 'typing', user.uid), {
                userId: user.uid,
                displayName: userDoc?.displayName || 'Someone',
                isTyping,
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error updating typing status:', error);
        }
    };

    // Customize chat bubble appearance
    const renderBubble = (props) => (
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

    // Render typing footer with animation
    const renderFooter = () => {
        if (typingUsers.length === 0) return null;
        const { displayName } = typingUsers[0];
        return (
            <View style={styles.footerContainer}>
                <Text style={[styles.footerText, { color: paperTheme.colors.text }]}>
                    {displayName} is typing
                </Text>
                <TypingDots dotColor="gray" style={{ marginLeft: 4 }} />
            </View>
        );
    };

    // Custom avatar for messages
    const renderAvatar = (props) => {
        const name = props.currentMessage.user.name || 'U';
        const initial = name.charAt(0).toUpperCase();
        return (
            <View
                style={[
                    styles.messageAvatar,
                    { backgroundColor: paperTheme.colors.primary },
                ]}
            >
                <Text style={[styles.avatarLetter, { color: paperTheme.colors.background }]}>
                    {initial}
                </Text>
            </View>
        );
    };

    // --- NEW: Modern Input UI ---

    // 1) Custom Input Toolbar
    const renderInputToolbar = (props) => (
        <InputToolbar
            {...props}
            containerStyle={[
                styles.inputToolbar,
                {
                    backgroundColor: paperTheme.colors.background,
                    // optional shadow/elevation for Android
                    elevation: 4,
                    // optional shadow for iOS
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.15,
                    shadowRadius: 3,
                },
            ]}
            primaryStyle={{ alignItems: 'center' }}
        />
    );

    // 2) Custom Composer (the text field)
    const renderComposer = (props) => (
        <Composer
            {...props}
            textInputStyle={[
                styles.composer,
                {
                    color: paperTheme.colors.text,
                    backgroundColor: paperTheme.colors.surface || '#f3f3f3',
                },
            ]}
            placeholder="Type a message..."
            placeholderTextColor={paperTheme.colors.placeholder}
        />
    );

    // 3) Custom Send Button (icon instead of default text)
    const renderSend = (props) => (
        <Send {...props}>
            <View style={styles.sendButtonContainer}>
                <IconButton
                    icon="send"
                    size={24}
                    iconColor={paperTheme.colors.primary}
                />
            </View>
        </Send>
    );

    // If no chat ID, show loader
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
                animationType="slide"
                transparent
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

            {/* Main Chat Layout */}
            <SafeAreaView
                style={[styles.safeArea, { backgroundColor: paperTheme.colors.background }]}
                edges={Platform.OS === 'ios' ? ['bottom', 'left', 'right'] : ['left', 'right']}
            >
                <GiftedChat
                    messages={messages}
                    onSend={(msgs) => onSend(msgs)}
                    user={{ _id: user.uid }}
                    onInputTextChanged={handleTyping}
                    renderBubble={renderBubble}
                    renderFooter={renderFooter}
                    renderAvatar={renderAvatar}
                    // Modern input UI overrides:
                    renderInputToolbar={renderInputToolbar}
                    renderComposer={renderComposer}
                    renderSend={renderSend}
                    bottomOffset={keyboardHeight}
                    alwaysShowSend
                />
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    // Layout
    safeArea: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Header
    avatarWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    avatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerName: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
    },

    // Message items
    messageAvatar: {
        borderRadius: 18,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarLetter: {
        fontSize: 14,
        fontWeight: 'bold',
    },

    // Typing footer
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
        marginBottom: 6,
    },
    footerText: {
        fontStyle: 'italic',
        marginRight: 4,
    },

    // Input toolbar
    inputToolbar: {
        borderTopWidth: 0,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    composer: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 12,
        marginLeft: 0,
        marginRight: 0,
        fontSize: 16,
    },
    sendButtonContainer: {
        marginRight: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        padding: 20,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
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

export default ChatScreen;