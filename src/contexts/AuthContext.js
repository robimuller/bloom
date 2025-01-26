// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPhoneNumber,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // <-- getDoc instead of onSnapshot
import { auth, db } from '../../config/firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);       // The raw Firebase Auth user
    const [userDoc, setUserDoc] = useState(null); // The Firestore doc data for that user
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        // Watch for Auth state changes
        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoadingAuth(true);
            setAuthError(null);

            if (firebaseUser) {
                // We have a logged-in user
                setUser(firebaseUser);

                try {
                    // One-time fetch of user doc, no real-time listening
                    const userRef = doc(db, 'users', firebaseUser.uid);
                    const snap = await getDoc(userRef);

                    if (snap.exists()) {
                        setUserDoc(snap.data());
                    } else {
                        setUserDoc(null);
                    }
                } catch (error) {
                    console.error('Error fetching user doc:', error);
                    setAuthError(error.message);
                }

                setLoadingAuth(false);
            } else {
                // No user
                setUser(null);
                setUserDoc(null);
                setLoadingAuth(false);
            }
        });

        // Cleanup
        return () => unsubscribeAuth();
    }, []);

    // -- Email-based sign up
    const emailSignup = async (email, password, displayName) => {
        try {
            setAuthError(null);
            // 1) Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const { uid } = userCredential.user;

            // 2) Initialize the Firestore doc
            await setDoc(doc(db, 'users', uid), {
                displayName,
                email,
                gender: null,
                signUpMethod: 'email',
                onboardingComplete: false,
                createdAt: new Date().toISOString(),
            });

            // Return the user object directly
            return userCredential.user;
        } catch (error) {
            setAuthError(error.message);
            throw error;
        }
    };

    // -- Phone-based sign up
    const phoneSignup = async (phoneNumber, appVerifier, gender, code) => {
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
                gender,
                signUpMethod: 'phone',
                onboardingComplete: false,
                createdAt: new Date().toISOString(),
            });

        } catch (error) {
            setAuthError(error.message);
        }
    };

    // -- Login
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
                gender: userDoc?.gender,
                displayName: userDoc?.displayName,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
