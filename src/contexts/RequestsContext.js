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
    where,
    getDoc,
    increment
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

        // If the user is male, show requests for his dates
        if (gender === 'male') {
            q = query(requestsRef, where('hostId', '==', user.uid));
        }
        // If the user is female, show requests she sent
        else if (gender === 'female') {
            q = query(requestsRef, where('requesterId', '==', user.uid));
        } else {
            setRequests([]);
            setLoadingRequests(false);
            return;
        }

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            // For each request doc, also fetch the user docs (both requester and host) and the date doc.
            const requestPromises = snapshot.docs.map(async (docSnap) => {
                const requestData = { id: docSnap.id, ...docSnap.data() };

                // Fetch the requester's user doc
                if (requestData.requesterId) {
                    const requesterRef = doc(db, 'users', requestData.requesterId);
                    const requesterSnap = await getDoc(requesterRef);
                    if (requesterSnap.exists()) {
                        requestData.requesterDoc = requesterSnap.data();
                    }
                }

                // Fetch the host's user doc (this is new)
                if (requestData.hostId) {
                    const hostRef = doc(db, 'users', requestData.hostId);
                    const hostSnap = await getDoc(hostRef);
                    if (hostSnap.exists()) {
                        requestData.hostDoc = hostSnap.data();
                    }
                }

                // Fetch the corresponding date doc
                if (requestData.dateId) {
                    const dateRef = doc(db, 'dates', requestData.dateId);
                    const dateSnap = await getDoc(dateRef);
                    if (dateSnap.exists()) {
                        requestData.dateDoc = dateSnap.data();
                    }
                }

                return requestData;
            });

            const filledRequests = await Promise.all(requestPromises);
            setRequests(filledRequests);
            setLoadingRequests(false);
        });

        return () => unsubscribe();
    }, [user, gender]);

    // (The rest of your context methods remain the same.)
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

            const dateDocRef = doc(db, 'dates', dateId);
            await updateDoc(dateDocRef, {
                requestCount: increment(1)
            });
        } catch (error) {
            console.error('Error sending request:', error);
            throw error;
        }
    };

    const cancelRequest = async (requestId, dateId) => {
        try {
            await deleteDoc(doc(db, 'requests', requestId));
            const dateDocRef = doc(db, 'dates', dateId);
            await updateDoc(dateDocRef, {
                requestCount: increment(-1)
            });
        } catch (error) {
            console.error('Error canceling request:', error);
            throw error;
        }
    };

    const acceptRequest = async (request) => {
        try {
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