// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../config/firebase'; // adjust path to your firebase config

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoadingAuth(false);
        });
        return unsubscribe;
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out: ', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loadingAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
