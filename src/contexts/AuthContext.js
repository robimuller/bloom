// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPhoneNumber,
} from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Import Realtime Database functions for presence tracking.
import {
    getDatabase,
    ref,
    onDisconnect,
    set,
    serverTimestamp,
    onValue,
} from 'firebase/database';

export const AuthContext = createContext();

/**
 * Sets up presence tracking for the currently logged in user.
 * When the client is connected, the user's status is set to "online".
 * An onDisconnect event ensures that if the connection is lost, the status
 * is automatically set to "offline" along with a timestamp.
 *
 * @param {Object} user - The Firebase Auth user object.
 */
function setupPresence(user) {
    if (!user) return;
    const dbRealtime = getDatabase();
    const userStatusRef = ref(dbRealtime, `/status/${user.uid}`);
    const connectedRef = ref(dbRealtime, '.info/connected');

    onValue(connectedRef, (snapshot) => {
        const isConnected = snapshot.val();
        if (!isConnected) {
            // Not connected. Nothing to do.
            return;
        }

        // When connected, set up the onDisconnect event to mark the user as offline.
        onDisconnect(userStatusRef)
            .set({
                state: 'offline',
                last_changed: serverTimestamp(),
            })
            .then(() => {
                // Now mark the user as online.
                set(userStatusRef, {
                    state: 'online',
                    last_changed: serverTimestamp(),
                });
            })
            .catch((error) => {
                console.error('Error setting onDisconnect:', error);
            });
    });
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);       // The raw Firebase Auth user
    const [userDoc, setUserDoc] = useState(null);   // The Firestore doc data for that user
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        // Watch for Auth state changes.
        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoadingAuth(true);
            setAuthError(null);

            if (firebaseUser) {
                // Set the Firebase Auth user.
                setUser(firebaseUser);

                // Setup presence tracking for the logged in user.
                setupPresence(firebaseUser);

                // Subscribe to the user's Firestore document.
                const userRef = doc(db, 'users', firebaseUser.uid);
                const unsubscribeDoc = onSnapshot(
                    userRef,
                    (snapshot) => {
                        if (snapshot.exists()) {
                            setUserDoc(snapshot.data());
                        } else {
                            setUserDoc(null);
                        }
                        setLoadingAuth(false);
                    },
                    (error) => {
                        console.error('Error subscribing to user doc:', error);
                        setAuthError(error.message);
                        setLoadingAuth(false);
                    }
                );

                // Clean up the Firestore subscription when the effect re-runs.
                return () => {
                    unsubscribeDoc();
                };
            } else {
                // No user is logged in.
                setUser(null);
                setUserDoc(null);
                setLoadingAuth(false);
            }
        });

        // Clean up the auth subscription on unmount.
        return () => unsubscribeAuth();
    }, []);

    // -- Email-based sign up
    const emailSignup = async (email, password, displayName) => {
        try {
            console.log("Starting email signup for:", email);
            setAuthError(null);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("User credential obtained:", userCredential.user.uid);

            const { uid } = userCredential.user;

            await setDoc(doc(db, 'users', uid), {
                displayName,
                email,
                gender: null,
                signUpMethod: 'email',
                onboardingComplete: false,
                createdAt: new Date().toISOString(),
            });
            console.log("Initial user document created");

            return userCredential.user;
        } catch (error) {
            console.error("Error in emailSignup:", error);
            setAuthError(error.message);
            throw error;
        }
    };

    // -- Phone-based sign up
    const phoneSignup = async (phoneNumber, appVerifier, gender, code) => {
        try {
            setAuthError(null);
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            const userCredential = await confirmationResult.confirm(code);
            const { uid } = userCredential.user;

            await setDoc(doc(db, 'users', uid), {
                phone: phoneNumber,
                gender,
                signUpMethod: 'phone',
                onboardingComplete: false,
                createdAt: new Date().toISOString(),
            });

            return userCredential.user;
        } catch (error) {
            setAuthError(error.message);
            throw error;
        }
    };

    // -- Login
    const login = async (email, password) => {
        try {
            setAuthError(null);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setAuthError(error.message);
            throw error;
        }
    };

    // -- Logout
    const logout = async () => {
        try {
            setAuthError(null);
            await signOut(auth);
            // Clear any local cached user data
            await AsyncStorage.clear();
        } catch (error) {
            setAuthError(error.message);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                userDoc,
                loadingAuth,
                authError,
                emailSignup,
                phoneSignup,
                login,
                logout,
                setAuthError,
                gender: userDoc?.gender,
                displayName: userDoc?.displayName,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};