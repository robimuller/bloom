// src/contexts/RequestsContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import {
    collection,
    addDoc,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    where
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthContext } from './AuthContext';

export const RequestsContext = createContext();

export const RequestsProvider = ({ children }) => {
    const { user, gender } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);

    useEffect(() => {
        if (!user || !gender) {
            setRequests([]);
            return;
        }
        setLoadingRequests(true);

        const requestsRef = collection(db, 'requests');
        let q;

        // If the user is male, we show requests that come in from others for the user’s dates
        if (gender === 'male') {
            q = query(requestsRef, where('hostId', '==', user.uid));
        }
        // If the user is female, we show requests she sent to hosts
        else if (gender === 'female') {
            q = query(requestsRef, where('requesterId', '==', user.uid));
        } else {
            // If there's a possibility user has a different gender,
            // we can skip or handle differently:
            setRequests([]);
            setLoadingRequests(false);
            return;
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
    }, [user, gender]);

    // Create a new request
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

    // Cancel (delete) the request doc from Firestore
    const cancelRequest = async (requestId) => {
        try {
            await deleteDoc(doc(db, 'requests', requestId));
        } catch (error) {
            console.error('Error canceling request:', error);
            throw error;
        }
    };

    // Example accept & reject
    const acceptRequest = async (request) => {
        try {
            // Example logic: create a chat doc, then update the request
            const chatRef = await addDoc(collection(db, 'chats'), {
                hostId: request.hostId,
                requesterId: request.requesterId,
                dateId: request.dateId,
                createdAt: serverTimestamp(),
            });

            await updateDoc(doc(db, 'requests', request.id), {
                status: 'accepted',
                chatId: chatRef.id,
            });
            return chatRef.id;
        } catch (error) {
            console.error('Error accepting request:', error);
            throw error;
        }
    };

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

    // For general status updates
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
                cancelRequest,
                acceptRequest,
                rejectRequest,
                updateRequestStatus,
            }}
        >
            {children}
        </RequestsContext.Provider>
    );
};