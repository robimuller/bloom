// src/contexts/RequestsContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import {
    collection,
    addDoc,
    onSnapshot,
    doc,
    updateDoc,
    serverTimestamp,
    query,
    where
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthContext } from './AuthContext';

export const RequestsContext = createContext();

export const RequestsProvider = ({ children }) => {
    const { user, role } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);

    useEffect(() => {
        if (!user || !role) {
            setRequests([]);
            return;
        }
        // Subscribe to "requests" that matter to this user, depending on role
        // If user is male => fetch requests where hostId = user.uid
        // If user is female => fetch requests where requesterId = user.uid
        setLoadingRequests(true);

        const requestsRef = collection(db, 'requests');
        let q;
        if (role === 'male') {
            q = query(requestsRef, where('hostId', '==', user.uid));
        } else if (role === 'female') {
            q = query(requestsRef, where('requesterId', '==', user.uid));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newRequests = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
            }));
            setRequests(newRequests);
            setLoadingRequests(false);
        });

        return () => unsubscribe();
    }, [user, role]);

    // Create a new request (used by women who see open dates or men who want to invite women, in the future)
    const sendRequest = async ({ dateId, hostId }) => {
        if (!user) return;
        try {
            await addDoc(collection(db, 'requests'), {
                dateId,
                hostId,
                requesterId: user.uid,
                status: 'pending',
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error sending request:', error);
            throw error;
        }
    };

    // Accept request => update doc; optionally create a chat
    const acceptRequest = async (request) => {
        try {
            // Create chat doc
            const chatRef = await addDoc(collection(db, 'chats'), {
                hostId: request.hostId,
                requesterId: request.requesterId,
                dateId: request.dateId,
                createdAt: serverTimestamp(),
            });

            // Update request => accepted, store the chatId
            await updateDoc(doc(db, 'requests', request.id), {
                status: 'accepted',
                chatId: chatRef.id,
            });

            return chatRef.id; // so the screen can navigate
        } catch (error) {
            console.error('Error accepting request:', error);
            throw error;
        }
    };

    // Reject request => status = 'rejected'
    const rejectRequest = async (request) => {
        try {
            await updateDoc(doc(db, 'requests', request.id), {
                status: 'rejected',
            });
        } catch (error) {
            console.error('Error rejecting request:', error);
            throw error;
        }
    };

    // For arbitrary status updates, if needed
    const updateRequestStatus = async (requestId, status) => {
        try {
            await updateDoc(doc(db, 'requests', requestId), { status });
        } catch (error) {
            console.error('Error updating request status:', error);
        }
    };

    return (
        <RequestsContext.Provider
            value={{
                requests,
                loadingRequests,
                sendRequest,
                acceptRequest,
                rejectRequest,
                updateRequestStatus,
            }}
        >
            {children}
        </RequestsContext.Provider>
    );
};
