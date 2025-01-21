// src/contexts/ChatContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import {
    collection,
    addDoc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthContext } from './AuthContext';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);

    // For demonstration, let's keep one chat at a time.
    // Or store multiple chats in state if needed.

    const subscribeToChat = (chatId) => {
        // Example: using Firestore subcollection "chats/{chatId}/messages"
        const ref = collection(db, 'chats', chatId, 'messages');
        const q = query(ref, orderBy('createdAt', 'desc'));

        return onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setMessages(msgs);
        });
    };

    const sendMessage = async (chatId, text) => {
        if (!user) return;

        const ref = collection(db, 'chats', chatId, 'messages');
        await addDoc(ref, {
            text,
            userId: user.uid,
            createdAt: serverTimestamp(),
        });
    };

    return (
        <ChatContext.Provider value={{ messages, subscribeToChat, sendMessage }}>
            {children}
        </ChatContext.Provider>
    );
};
