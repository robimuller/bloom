// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPhoneNumber,
} from 'firebase/auth';
import {
    doc,
    setDoc,
    onSnapshot,
    getDoc, // (not strictly needed if everything is real-time)
    updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);       // The raw Firebase User object
    const [userDoc, setUserDoc] = useState(null); // The Firestore doc data for that user
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        // We'll keep two unsubscribers:
        // 1) For Firebase Auth
        // 2) For the Firestore doc snapshot (which we attach once we have a user)
        let unsubscribeDoc = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoadingAuth(true);
            setAuthError(null);

            if (firebaseUser) {
                // Set the current user in state
                setUser(firebaseUser);

                // Subscribe to changes in this user's Firestore doc in real time:
                const userRef = doc(db, 'users', firebaseUser.uid);
                unsubscribeDoc = onSnapshot(
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
                        console.error('Error in onSnapshot:', error);
                        setAuthError(error.message);
                        setLoadingAuth(false);
                    }
                );
            } else {
                // No user -> reset state
                setUser(null);
                setUserDoc(null);
                setLoadingAuth(false);
            }
        });

        // Clean up both listeners on unmount or if user changes
        return () => {
            // Unsubscribe from Auth
            unsubscribeAuth();

            // Unsubscribe from the doc snapshot if it's active
            if (unsubscribeDoc) {
                unsubscribeDoc();
            }
        };
    }, []);

    // -- Email-based sign up
    const emailSignup = async (email, password, displayName) => {
        try {
            setAuthError(null);
            // 1) Create the user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const { uid } = userCredential.user;

            // 2) Initialize the Firestore doc
            await setDoc(doc(db, 'users', uid), {
                displayName,
                email,
                role: null,            // We'll fill this in later steps
                signUpMethod: 'email',
                onboardingComplete: false,
                createdAt: new Date().toISOString(),
            });

        } catch (error) {
            setAuthError(error.message);
        }
    };

    // -- Phone-based sign up
    const phoneSignup = async (phoneNumber, appVerifier, role, code) => {
        try {
            setAuthError(null);

            // 1) Start phone sign-in
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            // 2) Confirm the code
            const userCredential = await confirmationResult.confirm(code);

            const { uid } = userCredential.user;

            // 3) Initialize the Firestore doc
            await setDoc(doc(db, 'users', uid), {
                phone: phoneNumber,
                role,
                signUpMethod: 'phone',
                onboardingComplete: false,
                createdAt: new Date().toISOString(),
            });

        } catch (error) {
            setAuthError(error.message);
        }
    };

    // -- Login (existing user)
    const login = async (email, password) => {
        try {
            setAuthError(null);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setAuthError(error.message);
        }
    };

    // -- Logout
    const logout = async () => {
        try {
            setAuthError(null);
            await signOut(auth);
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
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
