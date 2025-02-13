// src/contexts/UserProfileContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { AuthContext } from './AuthContext';
import { db } from '../../config/firebase';

export const UserProfileContext = createContext();

export const UserProfileProvider = ({ children }) => {
    const { user } = useContext(AuthContext); // current logged-in user
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Optionally store separate arrays for female/male/all
    const [femaleUsers, setFemaleUsers] = useState([]);
    const [maleUsers, setMaleUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        if (user) {
            fetchUserProfile();
        } else {
            setProfile(null);
        }
        fetchAllUsers();
        fetchFemaleUsers();
        fetchMaleUsers();
    }, [user]);

    const fetchUserProfile = async () => {
        setLoadingProfile(true);
        try {
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setProfile(docSnap.data());
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
        setLoadingProfile(false);
    };

    const fetchAllUsers = async () => {
        try {
            const q = collection(db, 'users');
            const querySnap = await getDocs(q);
            const usersList = [];
            querySnap.forEach((doc) => {
                usersList.push({ id: doc.id, ...doc.data() });
            });
            setAllUsers(usersList);
        } catch (error) {
            console.error('Error fetching all users:', error);
        }
    };

    const fetchFemaleUsers = async () => {
        try {
            const q = query(collection(db, 'users'), where('gender', '==', 'female'));
            const querySnap = await getDocs(q);
            const usersList = [];
            querySnap.forEach((doc) => {
                usersList.push({ id: doc.id, ...doc.data() });
            });
            setFemaleUsers(usersList);
        } catch (error) {
            console.error('Error fetching female users:', error);
        }
    };

    const fetchMaleUsers = async () => {
        try {
            const q = query(collection(db, 'users'), where('gender', '==', 'male'));
            const querySnap = await getDocs(q);
            const usersList = [];
            querySnap.forEach((doc) => {
                usersList.push({ id: doc.id, ...doc.data() });
            });
            setMaleUsers(usersList);
        } catch (error) {
            console.error('Error fetching male users:', error);
        }
    };

    const updateProfile = async (updates) => {
        if (!user) return;
        try {
            const docRef = doc(db, 'users', user.uid);
            await updateDoc(docRef, updates);
            setProfile((prev) => ({ ...prev, ...updates }));
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <UserProfileContext.Provider
            value={{
                profile,
                loadingProfile,
                fetchUserProfile,
                updateProfile,
                allUsers,
                femaleUsers,
                maleUsers,
            }}
        >
            {children}
        </UserProfileContext.Provider>
    );
};