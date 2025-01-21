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
import { AppContext } from '../../context/AppContext';

export default function ChatScreen({ route }) {
    const { user } = useContext(AppContext);
    const { chatId, dateId, hostId, requesterId } = route.params || {};

    const [messages, setMessages] = useState([]);
    const [unsubscribeFn, setUnsubscribeFn] = useState(null);

    useEffect(() => {
        if (!chatId) return; // or handle finding/creating chat
        const msgsRef = collection(db, 'chats', chatId, 'messages');
        const q = query(msgsRef, orderBy('createdAt', 'desc'));

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
        setUnsubscribeFn(() => unsubscribe);

        return () => {
            if (unsubscribeFn) unsubscribeFn();
        };
    }, [chatId]);

    const onSend = useCallback(async (newMsgs = []) => {
        if (!chatId || !user) return;
        const msg = newMsgs[0];
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
            text: msg.text,
            user: {
                _id: user.uid,
                name: user.displayName || 'User',
            },
            createdAt: serverTimestamp(),
        });
    }, [chatId, user]);

    if (!chatId) {
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
