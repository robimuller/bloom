// ChatScreen.js (shared by men or women)
import React, { useEffect, useState, useCallback, useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    collection,
    doc,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';

import { db } from '../../../config/firebase';
// Import AuthContext instead of AppContext
import { AuthContext } from '../../contexts/AuthContext';

export default function ChatScreen({ route }) {
    // Pull the current user from AuthContext
    const { user } = useContext(AuthContext);

    // Destructure any params passed from navigation
    const { chatId, dateId, hostId, requesterId } = route.params || {};

    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!chatId) return; // if there's no chatId, either create one or show loader

        // Reference to the 'messages' subcollection inside 'chats/{chatId}'
        const msgsRef = collection(db, 'chats', chatId, 'messages');
        const q = query(msgsRef, orderBy('createdAt', 'desc'));

        // Subscribe to real-time updates
        const unsubscribe = onSnapshot(q, (snapshot) => {
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

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, [chatId]);

    const onSend = useCallback(
        async (newMsgs = []) => {
            if (!chatId || !user) return;
            const msg = newMsgs[0];

            await addDoc(collection(db, 'chats', chatId, 'messages'), {
                text: msg.text,
                user: {
                    _id: user.uid,
                    // If using displayName from Firestore, you could fetch or store it in AuthContext
                    name: user.displayName || 'User',
                },
                createdAt: serverTimestamp(),
            });
        },
        [chatId, user]
    );

    if (!chatId) {
        // If there's no chatId yet, show a loading indicator or create a new chat
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
            <GiftedChat
                messages={messages}
                onSend={(msgs) => onSend(msgs)}
                user={{ _id: user.uid }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
