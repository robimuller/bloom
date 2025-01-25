// ChatScreen.js
import React, { useEffect, useState, useCallback, useContext } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    collection,
    doc,
    addDoc,
    setDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';

import { db } from '../../../config/firebase';
import { AuthContext } from '../../contexts/AuthContext';
import { useTheme } from 'react-native-paper';

// A small custom component to animate "dot dot dot" using setInterval.
function TypingDots({ style }) {
    const [dotCount, setDotCount] = useState(1);

    useEffect(() => {
        // Cycle dotCount from 1 -> 2 -> 3 -> 1 ...
        const interval = setInterval(() => {
            setDotCount((prev) => (prev % 3) + 1);
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return <Text style={style}>{'.'.repeat(dotCount)}</Text>;
}

export default function ChatScreen({ route }) {
    const { user, userDoc } = useContext(AuthContext);
    const { chatId, dateId, hostId, requesterId } = route.params || {};
    const paperTheme = useTheme();

    // Our messages array for GiftedChat
    const [messages, setMessages] = useState([]);
    // Track who else is typing
    const [typingUsers, setTypingUsers] = useState([]);

    // 1) Subscribe to messages
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
                    user: data.user, // e.g. { _id: 'abc123', name: 'Alice' }
                };
            });
            setMessages(loaded);
        });

        // 2) Subscribe to "typing" subcollection to detect if the other user is typing
        const typingRef = collection(db, 'chats', chatId, 'typing');
        const unsubscribeTyping = onSnapshot(typingRef, (snapshot) => {
            const typingData = snapshot.docs
                .map((docSnap) => docSnap.data())
                // Filter: only show other users who are currently typing
                .filter((docData) => docData.isTyping && docData.userId !== user.uid);
            setTypingUsers(typingData); // array of { userId, displayName, isTyping }
        });

        return () => {
            unsubscribeMsgs();
            unsubscribeTyping();
        };
    }, [chatId, user?.uid]);

    // Called when user presses "Send"
    const onSend = useCallback(
        async (newMsgs = []) => {
            if (!chatId || !user) return;
            const msg = newMsgs[0];

            await addDoc(collection(db, 'chats', chatId, 'messages'), {
                text: msg.text,
                user: {
                    _id: user.uid,
                    // If you store the name in userDoc:
                    name: userDoc?.displayName || 'Unknown'
                },
                createdAt: serverTimestamp(),
            });
        },
        [chatId, user, userDoc]
    );

    // Called whenever the input text changes
    // => Update my "isTyping" status in Firestore
    const handleTyping = async (currentText) => {
        if (!chatId || !user) return;
        const isTyping = currentText?.length > 0;

        await setDoc(doc(db, 'chats', chatId, 'typing', user.uid), {
            userId: user.uid,
            displayName: userDoc?.displayName || 'Someone',
            isTyping: isTyping,
            updatedAt: serverTimestamp(),
        });
    };

    // Show the other user's typing status in the GiftedChat footer
    const renderFooter = () => {
        // If no one else is typing, return null
        if (!typingUsers.length) return null;

        // For one-on-one chat, typically there's only one other user.
        // We'll display the first person's name, plus the dot animation.
        const { displayName } = typingUsers[0];

        return (
            <View style={[styles.footerContainer, { backgroundColor: paperTheme.colors.background }]}>
                <Text style={[styles.footerText, { color: paperTheme.colors.text }]}>
                    {displayName} is typing
                </Text>
                <TypingDots style={[styles.dots, { color: paperTheme.colors.placeholder }]} />
            </View>
        );
    };

    // Custom avatar: show initial
    const renderAvatar = (props) => {
        // GiftedChat passes props.currentMessage.user
        const name = props.currentMessage.user.name || 'U';
        const initial = name.charAt(0).toUpperCase();

        return (
            <View style={[styles.avatarContainer, { backgroundColor: paperTheme.colors.primary }]}>
                <Text style={[styles.avatarInitial, { color: paperTheme.colors.background }]}>
                    {initial}
                </Text>
            </View>
        );
    };

    if (!chatId) {
        // If there's no chatId, either create a new one or show a loading spinner
        return (
            <View style={[styles.center, { backgroundColor: paperTheme.colors.background }]}>
                <ActivityIndicator size="large" color={paperTheme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: paperTheme.colors.background }]} edges={['top']}>
            <GiftedChat
                messages={messages}
                onSend={(msgs) => onSend(msgs)}
                user={{ _id: user.uid }}
                onInputTextChanged={handleTyping}
                renderFooter={renderFooter}
                renderAvatar={renderAvatar}
                placeholder="Type a message..."
                textInputStyle={{ color: paperTheme.colors.text }}
            // Optionally, you can customize other GiftedChat props to align with the theme
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    footerText: {
        marginRight: 8,
        fontStyle: 'italic',
    },
    dots: {
        fontSize: 18,
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
    safeArea: {
        flex: 1,
    },
});
